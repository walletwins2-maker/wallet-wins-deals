import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Tag, Store } from "lucide-react";
import { DealGrid } from "@/components/DealCard";
import { GetDealButton } from "@/components/GetDealButton";
import {
  categoryBySlug,
  dealById,
  formatPrice,
  moreFromRetailer,
  relatedDeals,
  retailerBySlug,
} from "@/lib/deals-data";
import { dealsQueryOptions } from "@/lib/deals-query";

export const Route = createFileRoute("/deal/$id")({
  loader: async ({ params, context }) => {
    const deals = await context.queryClient.ensureQueryData(dealsQueryOptions);
    const deal = dealById(deals, params.id);
    if (!deal) throw notFound();
    return { deal };
  },
  head: ({ loaderData }) => {
    const deal = loaderData?.deal;
    if (!deal) return { meta: [{ title: "Deal — Wallet Wins" }] };
    const title = `${deal.product_name} — ${deal.discount}% off | Wallet Wins`;
    const desc = `Save ${formatPrice(deal.original_price - deal.price)} on ${deal.product_name} from ${deal.retailer_name}. Now ${formatPrice(deal.price)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: deal.image_url },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/deal/${deal.id}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: deal.image_url },
      ],
      links: [{ rel: "canonical", href: `/deal/${deal.id}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: deal.product_name,
            image: deal.image_url,
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price: deal.price,
              availability: "https://schema.org/InStock",
              seller: { "@type": "Organization", name: deal.retailer_name },
            },
          }),
        },
      ],
    };
  },
  component: DealDetail,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Couldn't load this deal</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Deal not found</h1>
      <Link to="/deals" className="mt-3 inline-block text-primary underline">Browse all deals</Link>
    </div>
  ),
});

function DealDetail() {
  const { deal } = Route.useLoaderData();
  const { data: deals } = useSuspenseQuery(dealsQueryOptions);
  const retailer = retailerBySlug(deal.retailer, deals) ?? {
    slug: deal.retailer,
    name: deal.retailer_name,
    color: "#22c55e",
  };
  const category = categoryBySlug(deal.category);
  const related = relatedDeals(deals, deal);
  const more = moreFromRetailer(deals, deal);
  const savings = deal.original_price - deal.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <Link to="/deals" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All deals
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="relative aspect-square bg-muted">
            <img src={deal.image_url} alt={deal.product_name} className="h-full w-full object-cover" />
            <span className="absolute left-4 top-4 rounded-full bg-deal-badge px-3 py-1.5 text-sm font-bold text-white shadow">
              -{deal.discount}% OFF
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            {retailer && (
              <Link
                to="/retailer/$slug"
                params={{ slug: retailer.slug }}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold"
              >
                <Store className="h-3.5 w-3.5" /> {retailer.name}
              </Link>
            )}
            {category && (
              <Link
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold"
              >
                <Tag className="h-3.5 w-3.5" /> {category.name}
              </Link>
            )}
          </div>

          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            {deal.product_name}
          </h1>

          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-extrabold text-foreground">
                {formatPrice(deal.price)}
              </span>
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(deal.original_price)}
              </span>
            </div>
            <p className="mt-2 text-sm font-bold text-success">
              You save {formatPrice(savings)} ({deal.discount}% off)
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-gradient-primary"
                  style={{ width: `${deal.deal_score}%` }}
                />
              </div>
              <span className="text-sm font-bold text-primary">{deal.deal_score}/100</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Deal Score</p>

            <div className="mt-6">
              <GetDealButton deal={deal} large />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Opens {retailer?.name ?? "retailer"} in a new tab. We may earn a commission.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 font-display text-2xl font-extrabold">Related Deals</h2>
          <DealGrid deals={related} />
        </section>
      )}

      {more.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 font-display text-2xl font-extrabold">
            More from {retailer?.name ?? deal.retailer}
          </h2>
          <DealGrid deals={more} />
        </section>
      )}
    </div>
  );
}