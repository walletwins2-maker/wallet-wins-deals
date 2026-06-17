import { createServerFn } from "@tanstack/react-start";
import { mapRawDeals, type Deal, type RawDeal } from "./deals-data";

export const fetchDealsServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<Deal[]> => {
    const url = process.env.WALLETWINS_DB_URL;
    const key = process.env.WALLETWINS_DB_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        "Wallet Wins backend is not configured (missing WALLETWINS_DB_URL / WALLETWINS_DB_ANON_KEY).",
      );
    }
    const qs = new URLSearchParams({
      select:
        "id,product_name,product_url,image_url,price,original_price,discount,retailer,deal_score,status,created_at,product_fingerprint",
      status: "in.(pending,queued,posted)",
      order: "created_at.desc",
      limit: "500",
    });
    const res = await fetch(`${url}/rest/v1/deals_to_post?${qs.toString()}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to load deals (${res.status}): ${body.slice(0, 200)}`);
    }
    const rows = (await res.json()) as RawDeal[];
    return mapRawDeals(rows);
  },
);