import { Link } from "@tanstack/react-router";
import type { Deal } from "@/lib/deals-data";
import { formatPrice, retailerBySlug } from "@/lib/deals-data";

export function DealCard({ deal }: { deal: Deal }) {
  const retailer = retailerBySlug(deal.retailer);
  return (
    <Link
      to="/deal/$slug"
      params={{ slug: deal.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={deal.image_url}
          alt={deal.product_name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-deal-badge px-2.5 py-1 text-xs font-bold text-white shadow-sm">
          -{deal.discount}%
        </span>
        {deal.deal_score >= 90 && (
          <span className="absolute right-3 top-3 rounded-full bg-gradient-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm">
            🔥 HOT
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {retailer?.name ?? deal.retailer}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
          {deal.product_name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-foreground">{formatPrice(deal.price)}</span>
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(deal.original_price)}
          </span>
        </div>
        <p className="text-xs font-semibold text-success">
          Save {formatPrice(deal.original_price - deal.price)}
        </p>
      </div>
    </Link>
  );
}

export function DealGrid({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center text-muted-foreground">
        No deals found.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {deals.map((d) => (
        <DealCard key={d.id} deal={d} />
      ))}
    </div>
  );
}