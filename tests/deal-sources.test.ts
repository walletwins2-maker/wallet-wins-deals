import { describe, expect, test } from "bun:test";
import { readDealSources } from "../src/lib/deal-sources.server";
import { activeDeals, mapRawDeals, type RawDeal } from "../src/lib/deals-data";

const row = (id: number, retailer: string): RawDeal => ({
  id, retailer, product_name: `Product ${id}`, product_url: `https://example.com/product/${id}`,
  image_url: "https://example.com/photo.jpg", price: 10, original_price: 20,
  discount: 50, deal_score: 80, created_at: "2026-10-27T00:00:00Z", status: "website_import",
});

describe("Amazon source", () => {
  test("reads Amazon exclusively from deals_to_post and other retailers from live_deals", async () => {
    const calls: URL[] = [];
    const request: typeof fetch = async (input) => {
      const url = new URL(String(input)); calls.push(url);
      return Response.json(url.pathname.endsWith("/deals_to_post")
        ? [row(2, "amazon")] : [row(1, "walmart"), row(3, "amazon")]);
    };
    const deals = await readDealSources("https://example.com", "test-key", request);
    expect(deals.map(d => d.id)).toEqual([1, 2]);
    expect(calls.find(u => u.pathname.endsWith("/deals_to_post"))?.searchParams.get("retailer")).toBe("ilike.amazon");
    expect(calls.find(u => u.pathname.endsWith("/live_deals"))?.searchParams.get("retailer")).toBe("not.ilike.amazon");
  });
  test("paginates Amazon beyond both 30 and 1000 deals", async () => {
    const ranges: string[] = [];
    const request: typeof fetch = async (input, init) => {
      if (!String(input).includes("/deals_to_post?")) return Response.json([]);
      const range = new Headers(init?.headers).get("Range") ?? ""; ranges.push(range);
      return Response.json(range === "0-999"
        ? Array.from({ length: 1000 }, (_, i) => row(i, "amazon")) : [row(1000, "amazon")]);
    };
    const deals = await readDealSources("https://example.com", "test-key", request);
    expect(deals.length).toBe(1001);
    expect(ranges).toEqual(["0-999", "1000-1999"]);
  });
  test("retains positive price and discount requirements and excludes expired deals", async () => {
    const request: typeof fetch = async (input) => {
      const url = new URL(String(input));
      expect(url.searchParams.get("price")).toBe("gt.0");
      expect(url.searchParams.get("discount")).toBe(url.pathname.endsWith("/deals_to_post") ? "gte.20" : "gt.0");
      if (!url.pathname.endsWith("/deals_to_post")) return Response.json([]);
      expect(url.searchParams.get("status")).toBe("neq.expired");
      return Response.json([row(1, "amazon"), { ...row(2, "amazon"), price: 0 },
        { ...row(3, "amazon"), discount: 0, original_price: 10 }, { ...row(4, "amazon"), status: "expired" }]);
    };
    const deals = activeDeals(mapRawDeals(await readDealSources("https://example.com", "test-key", request)));
    expect(deals.map(d => d.id)).toEqual(["1"]);
  });
  test("Amazon includes exactly 20% off but excludes 19%, while other retailers allow lower discounts", async () => {
    const request: typeof fetch = async (input) => Response.json(String(input).includes("/deals_to_post?")
      ? [{ ...row(1, "amazon"), discount: 19, original_price: 10 },
         { ...row(2, "amazon"), discount: 20, original_price: 10 }]
      : [{ ...row(3, "walmart"), discount: 1, original_price: 10 }]);
    const deals = activeDeals(mapRawDeals(await readDealSources("https://example.com", "test-key", request)));
    expect(deals.map(d => d.id)).toEqual(["3", "2"]);
  });
  test("retains only the three best Amazon slipcovers without capping other Amazon products", () => {
    const rows = [
      ...Array.from({ length: 5 }, (_, i) => ({ ...row(i, "amazon"), product_name: `Stretch Sofa Slipcover ${i}`, discount: 20 + i, original_price: 10 })),
      { ...row(10, "amazon"), product_name: "Recliner Cover", discount: 40 },
      ...Array.from({ length: 40 }, (_, i) => ({ ...row(100 + i, "amazon"), product_name: `Headphones ${i}` })),
      { ...row(200, "walmart"), product_name: "Sofa Slipcover" },
    ];
    const deals = activeDeals(mapRawDeals(rows));
    expect(deals.filter(d => d.retailer === "amazon" && /cover/i.test(d.product_name)).map(d => d.id)).toEqual(["3", "4", "10"]);
    expect(deals.filter(d => /Headphones/.test(d.product_name)).length).toBe(40);
    expect(deals.some(d => d.id === "200")).toBe(true);
  });
  test("keeps one Amazon listing per same product or color variant and recognizes duplicate Amazon product links", () => {
    const rows = [
      { ...row(1, "amazon"), product_name: "Acme Travel Pillow Blue", discount: 20, original_price: 10 },
      { ...row(2, "amazon"), product_name: "Acme Travel Pillow Red", discount: 30, original_price: 10 },
      { ...row(3, "amazon"), product_name: "Acme Travel Pillow Red", discount: 25, original_price: 10 },
      { ...row(4, "amazon"), product_name: "Different Headphones", product_url: "https://amazon.com/dp/B012345678?tag=one" },
      { ...row(5, "amazon"), product_name: "Alternate Headphone Title", product_url: "https://amazon.com/gp/product/B012345678?tag=two" },
      { ...row(6, "amazon"), product_name: "Acme Travel Pillow Pro" },
    ];
    expect(activeDeals(mapRawDeals(rows)).map(d => d.id)).toEqual(["2", "4", "6"]);
  });
});