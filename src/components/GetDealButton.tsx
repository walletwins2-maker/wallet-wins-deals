import { ExternalLink } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import type { Deal } from "@/lib/deals-data";
import { trackClickServer } from "@/lib/deals.functions";
import { trackAffiliateClick } from "@/lib/google-ads";

export function GetDealButton({ deal, large = false }: { deal: Deal; large?: boolean }) {
  const trackClick = useServerFn(trackClickServer);
  const onClick = () => {
    // Fire-and-forget — never block the user from reaching the retailer.
    try {
      void trackClick({
        data: {
          deal_id: deal.id,
          product_fingerprint: deal.product_fingerprint,
          retailer: deal.retailer,
          source_page: typeof window !== "undefined" ? window.location.pathname : undefined,
          referrer: typeof document !== "undefined" ? document.referrer : undefined,
        },
      });
    } catch {
      /* ignore */
    }
    try {
      const discount =
        typeof deal.original_price === "number" && typeof deal.price === "number"
          ? Math.max(0, deal.original_price - deal.price)
          : undefined;
      trackAffiliateClick({
        dealId: deal.id,
        retailer: deal.retailer,
        productName: deal.product_name,
        productUrl: deal.product_url,
        value: discount,
        currency: "USD",
      });
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