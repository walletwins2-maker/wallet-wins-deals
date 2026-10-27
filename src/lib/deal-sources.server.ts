import type { RawDeal } from "./deals-data";

const PUBLIC_FIELDS = "id,slug,product_name,product_url,image_url,price,original_price,discount,retailer,deal_score,created_at";
const PAGE_SIZE = 1000;
const MAX_PAGES = 20;

// Query only public product fields; never expose staging or pipeline metadata.
export async function readDealSources(
  url: string,
  key: string,
  request: typeof fetch = fetch,
): Promise<RawDeal[]> {
  async function readSource(table: string, amazon: boolean): Promise<RawDeal[]> {
    const qs = new URLSearchParams({
      select: amazon ? `${PUBLIC_FIELDS},product_fingerprint,status` : PUBLIC_FIELDS,
      retailer: amazon ? "ilike.amazon" : "not.ilike.amazon",
      price: "gt.0",
      discount: amazon ? "gte.20" : "gt.0",
      order: "created_at.desc,id.desc",
      ...(amazon ? { status: "neq.expired" } : {}),
    });
    const rows: RawDeal[] = [];
    for (let page = 0; page < MAX_PAGES; page++) {
      const headers: Record<string, string> = {
        apikey: key,
        Accept: "application/json",
        "Range-Unit": "items",
        Range: `${page * PAGE_SIZE}-${(page + 1) * PAGE_SIZE - 1}`,
        Prefer: "count=none",
      };
      if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;
      try {
        const fetchPage = () => request(`${url}/rest/v1/${table}?${qs}`, { headers });
        let response = await fetchPage();
        if (!response.ok && (response.status >= 500 || response.status === 408)) {
          response = await fetchPage();
        }
        if (!response.ok) {
          console.error(`[fetchDealsServer] ${table} read failed`, response.status);
          break;
        }
        const batch = (await response.json()) as RawDeal[];
        rows.push(...batch.filter((row) =>
          ((row.retailer ?? "").trim().toLowerCase() === "amazon") === amazon,
        ));
        if (batch.length < PAGE_SIZE) break;
      } catch (error) {
        console.error(`[fetchDealsServer] ${table} request failed`, error);
        break;
      }
    }
    return rows;
  }
  // Failure of either source must not discard the other retailer's deals.
  const [otherRows, amazonRows] = await Promise.all([
    readSource("live_deals", false),
    readSource("deals_to_post", true),
  ]);
  return [...otherRows, ...amazonRows].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
  );
}