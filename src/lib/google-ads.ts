// Google Ads conversion tracking for affiliate buy-button clicks.
// Fill these from Google Ads → Goals → Conversions → your action → "Use Google tag".
// Safe in client code — these IDs are public (they ship in the gtag snippet).
//
// To enable: set both values in .env, restart dev server.
//   VITE_GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXXXXX
//   VITE_GOOGLE_ADS_CONVERSION_LABEL=AbCdEfGhIjKlMnOp
export const GOOGLE_ADS_CONVERSION_ID =
  (import.meta.env.VITE_GOOGLE_ADS_CONVERSION_ID as string | undefined) ?? "";
export const GOOGLE_ADS_CONVERSION_LABEL =
  (import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL as string | undefined) ?? "";

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  // Fallback: push to dataLayer directly if gtag fn not yet defined.
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  } else {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push(args);
  }
}

export interface AffiliateClickEvent {
  dealId: string;
  retailer?: string;
  productName?: string;
  productUrl?: string;
  value?: number; // optional monetary value (e.g. discount amount)
  currency?: string; // ISO 4217, defaults to USD
}

/**
 * Fire a Google Ads conversion + GA4 event when a user clicks an affiliate
 * buy button. No-ops cleanly when the Google Ads IDs aren't configured.
 */
export function trackAffiliateClick(event: AffiliateClickEvent) {
  const currency = event.currency ?? "USD";

  // 1. GA4 custom event — always fires (GA4 tag is loaded in __root.tsx).
  gtag("event", "affiliate_click", {
    deal_id: event.dealId,
    retailer: event.retailer,
    item_name: event.productName,
    link_url: event.productUrl,
    value: event.value,
    currency,
  });

  // 2. Google Ads conversion — only when configured.
  if (GOOGLE_ADS_CONVERSION_ID && GOOGLE_ADS_CONVERSION_LABEL) {
    gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_CONVERSION_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
      value: event.value ?? 0,
      currency,
      transaction_id: event.dealId,
    });
  }
}