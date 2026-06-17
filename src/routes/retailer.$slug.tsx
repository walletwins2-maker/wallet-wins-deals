import { createFileRoute, notFound } from "@tanstack/react-router";
import { DealGrid } from "@/components/DealCard";
import { dealsByRetailer, retailerBySlug } from "@/lib/deals-data";

export const Route = createFileRoute("/retailer/$slug")({
  loader: ({ params }) => {
    const retailer = retailerBySlug(params.slug);
    if (!retailer) throw notFound();
    return { retailer, deals: dealsByRetailer(params.slug) };
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.retailer?.name ?? params.slug;
    return {
      meta: [
        { title: `${name} Deals — Wallet Wins` },
        { name: "description", content: `Browse the latest ${name} deals, discounts and price drops.` },
        { property: "og:title", content: `${name} Deals — Wallet Wins` },
        { property: "og:url", content: `/retailer/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/retailer/${params.slug}` }],
    };
  },
  component: RetailerPage,
});

function RetailerPage() {
  const { retailer, deals } = Route.useLoaderData();
  const top = [...deals].sort((a, b) => b.discount - a.discount).slice(0, 4);
  const recent = [...deals].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

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
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{retailer.name}</h1>
          <p className="mt-1 text-sm text-white/70">{deals.length} active deals</p>
        </div>
      </div>

      {top.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl font-extrabold">Top Discounts</h2>
          <DealGrid deals={top} />
        </section>
      )}

      <section className="mt-12">
        <h2 className="mb-4 font-display text-2xl font-extrabold">All {retailer.name} Deals</h2>
        <DealGrid deals={recent} />
      </section>
    </div>
  );
}