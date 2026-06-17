import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DealGrid } from "@/components/DealCard";
import {
  CATEGORIES,
  RETAILERS,
  activeDeals,
  categoryBySlug,
  retailerBySlug,
} from "@/lib/deals-data";

type Sort = "best" | "newest" | "discount" | "price";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "All Deals — Wallet Wins" },
      { name: "description", content: "Browse every active deal. Filter by retailer, category, price, and discount." },
      { property: "og:title", content: "All Deals — Wallet Wins" },
      { property: "og:url", content: "/deals" },
    ],
    links: [{ rel: "canonical", href: "/deals" }],
  }),
  component: DealsPage,
});

function DealsPage() {
  const [q, setQ] = useState("");
  const [retailer, setRetailer] = useState("all");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minDiscount, setMinDiscount] = useState(0);
  const [sort, setSort] = useState<Sort>("best");

  const filtered = useMemo(() => {
    let list = activeDeals();
    if (q) {
      const t = q.toLowerCase();
      list = list.filter((d) => d.product_name.toLowerCase().includes(t));
    }
    if (retailer !== "all") list = list.filter((d) => d.retailer === retailer);
    if (category !== "all") list = list.filter((d) => d.category === category);
    list = list.filter((d) => d.price <= maxPrice && d.discount >= minDiscount);
    switch (sort) {
      case "newest":
        list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        break;
      case "discount":
        list.sort((a, b) => b.discount - a.discount);
        break;
      case "price":
        list.sort((a, b) => a.price - b.price);
        break;
      default:
        list.sort((a, b) => b.deal_score - a.deal_score);
    }
    return list;
  }, [q, retailer, category, maxPrice, minDiscount, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">All Deals</h1>
      <p className="mt-1 text-muted-foreground">
        {filtered.length} deals — sorted by {sortLabel(sort)}
      </p>

      <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-card md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={retailer}
          onChange={(e) => setRetailer(e.target.value)}
          className="h-10 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          <option value="all">All retailers</option>
          {RETAILERS.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="h-10 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          <option value="best">Best Deals</option>
          <option value="newest">Newest</option>
          <option value="discount">Highest Discount</option>
          <option value="price">Lowest Price</option>
        </select>

        <div className="md:col-span-2">
          <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            Max price <span>${maxPrice}</span>
          </label>
          <input
            type="range"
            min={20}
            max={2000}
            step={10}
            value={maxPrice}
            onChange={(e) => setMaxPrice(+e.target.value)}
            className="mt-1 w-full accent-[var(--primary)]"
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            Min discount <span>{minDiscount}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={minDiscount}
            onChange={(e) => setMinDiscount(+e.target.value)}
            className="mt-1 w-full accent-[var(--primary)]"
          />
        </div>
      </div>

      <div className="mt-8">
        <DealGrid deals={filtered} />
      </div>
    </div>
  );
}

function sortLabel(s: Sort) {
  return s === "best" ? "best deals" : s === "newest" ? "newest" : s === "discount" ? "biggest discount" : "lowest price";
}

// Tiny helper to also satisfy unused vars
void retailerBySlug;
void categoryBySlug;