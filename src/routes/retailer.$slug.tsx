import { createFileRoute, notFound } from "@tanstack/react-router";
import { DealGrid } from "@/components/DealCard";
import { CATEGORIES, categoryBySlug, dealsByRetailer, retailerBySlug } from "@/lib/deals-data";
import { dealsQueryOptions } from "@/lib/deals-query";

const SITE_URL = "https://walletwins.shop";

export const Route = createFileRoute("/retailer/$slug")({
  loader: async ({ params, context }) => {
    const allDeals = await context.queryClient.ensureQueryData(dealsQueryOptions);
    const deals = dealsByRetailer(allDeals, params.slug);
    const retailer = retailerBySlug(params.slug, allDeals);
    if (!retailer) throw notFound();
    return { retailer, deals };
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.retailer?.name ?? params.slug;
    const deals = loaderData?.deals ?? [];
    const count = deals.length;
    const maxDiscount = deals.reduce((m, d) => (d.discount > m ? d.discount : m), 0);
    const url = `${SITE_URL}/retailer/${params.slug}`;
    const title = count
      ? `${name} Deals & Coupons — Up to ${maxDiscount}% Off | Wallet Wins`
      : `${name} Deals & Coupons | Wallet Wins`;
    const description = count
      ? `Shop ${count} live ${name} deals — save up to ${maxDiscount}% on top products. Verified price drops, coupons and discounts updated daily at Wallet Wins.`
      : `Find the latest ${name} deals, coupons and price drops curated daily by Wallet Wins.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: `${name} deals, ${name} coupons, ${name} discounts, ${name} promo codes, ${name} sale, ${name} price drops` },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${name} Deals`,
            url,
            description,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: count,
              itemListElement: deals.slice(0, 20).map((d, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE_URL}/deal/${d.slug}`,
                name: d.product_name,
              })),
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Retailers", item: `${SITE_URL}/deals` },
              { "@type": "ListItem", position: 3, name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: RetailerPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Couldn't load retailer</h1>
      <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Please try again.</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Retailer not found</h1>
    </div>
  ),
});

function RetailerPage() {
  const { retailer, deals } = Route.useLoaderData();
  const top = [...deals].sort((a, b) => b.discount - a.discount).slice(0, 4);
  const recent = [...deals].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const byCategory = CATEGORIES
    .map((c) => ({ cat: c, items: deals.filter((d) => d.category === c.slug) }))
    .filter((g) => g.items.length > 0)
    .sort((a, b) => b.items.length - a.items.length);
  const maxDiscount = deals.reduce((m, d) => (d.discount > m ? d.discount : m), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-4 rounded-3xl bg-gradient-hero p-6 text-white shadow-elegant sm:p-10">
        <span
          className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-2xl font-extrabold text-white shadow-card sm:h-20 sm:w-20 sm:text-3xl"
          style={{ backgroundColor: retailer.color }}
        >
          {retailer.name[0]}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Retailer</p>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
            {retailer.name} Deals & Coupons
          </h1>
          <p className="mt-1 text-sm text-white/80">
            {deals.length} active deals
            {maxDiscount > 0 ? ` — save up to ${maxDiscount}%` : ""}
          </p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="sr-only">About {retailer.name} deals</h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          Browse the latest {retailer.name} deals on Wallet Wins. We track{" "}
          {deals.length.toLocaleString()} live {retailer.name} discounts across{" "}
          {byCategory.length} {byCategory.length === 1 ? "category" : "categories"},
          updated daily with verified price drops and coupons.
        </p>
      </section>

      {top.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl font-extrabold">
            Top {retailer.name} Discounts
          </h2>
          <DealGrid deals={top} />
        </section>
      )}

      {byCategory.slice(0, 6).map(({ cat, items }) => (
        <section key={cat.slug} className="mt-12">
          <h2 className="mb-4 font-display text-2xl font-extrabold">
            {retailer.name} {cat.name} Deals
            <span className="ml-2 text-sm font-medium text-muted-foreground">
              ({items.length})
            </span>
          </h2>
          <DealGrid deals={items.slice(0, 8)} />
        </section>
      ))}

      <section className="mt-12">
        <h2 className="mb-4 font-display text-2xl font-extrabold">
          All {retailer.name} Deals
        </h2>
        <DealGrid deals={recent} />
      </section>
    </div>
  );
}