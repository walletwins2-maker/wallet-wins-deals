import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { dealsQueryOptions } from "@/lib/deals-query";
import { topRetailers } from "@/lib/deals-data";

const SITE_URL = "https://walletwins.shop";

export const Route = createFileRoute("/retailers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dealsQueryOptions),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Browse All Retailers — Wallet Wins" },
      { name: "description", content: "Discover deals from hundreds of trusted retailers. Browse by store and find the best discounts, price drops, and coupons updated daily." },
      { property: "og:title", content: "Browse All Retailers — Wallet Wins" },
      { property: "og:description", content: "Discover deals from hundreds of trusted retailers. Browse by store and find the best discounts, price drops, and coupons updated daily." },
      { property: "og:url", content: `${SITE_URL}/retailers` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/retailers` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Retailers",
          itemListElement: [], // filled dynamically below if needed; static is fine for SEO
        }),
      },
    ],
  }),
  component: RetailersPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Couldn't load retailers</h1>
      <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Please try again.</p>
    </div>
  ),
});

function RetailersPage() {
  const { data: deals } = useSuspenseQuery(dealsQueryOptions);
  const retailers = topRetailers(deals, 1000)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
        Browse All Retailers
      </h1>
      <p className="mt-2 text-muted-foreground">
        {retailers.length} stores with active deals — updated daily.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {retailers.map((r) => (
          <Link
            key={r.slug}
            to="/retailer/$slug"
            params={{ slug: r.slug }}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover"
          >
            <span
              className="grid h-14 w-14 place-items-center rounded-xl text-xl font-extrabold text-white shadow-card"
              style={{ backgroundColor: r.color }}
            >
              <ShoppingBag className="h-6 w-6" />
            </span>
            <div className="text-center">
              <p className="font-semibold text-foreground group-hover:text-primary">
                {r.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {r.count} deal{r.count === 1 ? "" : "s"}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
