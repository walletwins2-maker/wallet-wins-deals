import { createServerFn } from "@tanstack/react-start";
import { mapRawDeals, type Deal, type RawDeal } from "./deals-data";

function dbCreds() {
  const url = process.env.WALLETWINS_DB_URL;
  const key = process.env.WALLETWINS_DB_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Wallet Wins backend is not configured (missing WALLETWINS_DB_URL / WALLETWINS_DB_ANON_KEY).",
    );
  }
  return { url, key };
}

export const fetchDealsServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<Deal[]> => {
    const { url, key } = dbCreds();
    const qs = new URLSearchParams({
      select:
        "id,slug,product_name,product_url,image_url,price,original_price,discount,retailer,deal_score,status,created_at,product_fingerprint",
      order: "created_at.desc,id.desc",
      limit: "2000",
    });
    const res = await fetch(`${url}/rest/v1/live_deals?${qs.toString()}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
        // PostgREST defaults to 1000 rows max; ask for a larger window.
        "Range-Unit": "items",
        Prefer: "count=none",
      },
    });
    if (!res.ok) {
      const body = await res.text();
      // Log raw provider response server-side only; never leak schema/error
      // details (column/constraint/relation names) to the browser.
      console.error("[fetchDealsServer] upstream error", res.status, body.slice(0, 500));
      throw new Error("Failed to load deals. Please try again.");
    }
    const rows = (await res.json()) as RawDeal[];
    return mapRawDeals(rows);
  },
);

export const trackClickServer = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      deal_id: string;
      product_fingerprint?: string;
      retailer?: string;
      source_page?: string;
      referrer?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const { url, key } = dbCreds();
    const idNum = Number(data.deal_id);
    const body = {
      deal_id: Number.isFinite(idNum) ? idNum : null,
      product_fingerprint: data.product_fingerprint ?? null,
      retailer: data.retailer ?? null,
      source_page: data.source_page ?? null,
      referrer: data.referrer ?? null,
    };
    const res = await fetch(`${url}/rest/v1/affiliate_clicks`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      // Non-fatal: swallow so the redirect to retailer still happens client-side.
      const body = await res.text();
      console.error("[trackClickServer] upstream error", res.status, body.slice(0, 500));
      return { ok: false as const, error: "Click tracking failed." };
    }
    return { ok: true as const };
  });

export const subscribeNewsletterServer = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; source_page?: string }) => d)
  .handler(async ({ data }) => {
    const email = (data.email ?? "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return { ok: false as const, error: "Please enter a valid email." };
    }
    const { url, key } = dbCreds();
    const res = await fetch(`${url}/rest/v1/newsletter_subscribers`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal,resolution=ignore-duplicates",
      },
      body: JSON.stringify({ email, source_page: data.source_page ?? null }),
    });
    if (!res.ok) {
      const body = await res.text();
      // 409 conflict = already subscribed; treat as success.
      if (res.status === 409) return { ok: true as const };
      console.error("[subscribeNewsletterServer] upstream error", res.status, body.slice(0, 500));
      return { ok: false as const, error: "Subscription failed. Please try again." };
    }
    return { ok: true as const };
  });