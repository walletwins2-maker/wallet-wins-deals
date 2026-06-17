import { ExternalLink } from "lucide-react";
import type { Deal } from "@/lib/deals-data";

export function GetDealButton({ deal, large = false }: { deal: Deal; large?: boolean }) {
  const onClick = () => {
    // Affiliate click tracking (stubbed — wire to Supabase affiliate_clicks once connected)
    try {
      const event = {
        product_fingerprint: deal.id,
        retailer: deal.retailer,
        clicked_at: new Date().toISOString(),
        referrer: typeof document !== "undefined" ? document.referrer : "",
      };
      const key = "ww_pending_clicks";
      const prev = JSON.parse(localStorage.getItem(key) ?? "[]");
      prev.push(event);
      localStorage.setItem(key, JSON.stringify(prev));
    } catch {
      /* ignore */
    }
    window.open(deal.product_url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={onClick}
      className={
        large
          ? "inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-card-hover transition hover:brightness-110 sm:w-auto"
          : "inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-card transition hover:brightness-110"
      }
    >
      {large ? "Get This Deal" : "Get Deal"}
      <ExternalLink className={large ? "h-4 w-4" : "h-3.5 w-3.5"} />
    </button>
  );
}