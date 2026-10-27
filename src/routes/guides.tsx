import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";

const savingGuides = [
  {
    to: "/guides/amazon-bin-stores" as const,
    title: "Amazon Bin Stores",
    description: "How $7 bin stores work and how to score returns for cheap.",
  },
  {
    to: "/guides/costco-coupon-book" as const,
    title: "Costco Coupon Book",
    description: "Maximize savings with this month's Costco coupon book.",
  },
  {
    to: "/guides/liquidation-stores" as const,
    title: "Liquidation Stores",
    description: "Find pallets, overstock, and deep discounts near you.",
  },
  {
    to: "/guides/amazon-return-pallets" as const,
    title: "Amazon Return Pallets",
    description: "Buy, bid, and flip Amazon returns from B-Stock and Liquidation.com.",
  },
];

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Saving Guides — Wallet Wins" },
      { name: "description", content: "Tips and walkthroughs to save more on everyday purchases, from Amazon bin stores to Costco coupon books." },
      { property: "og:title", content: "Saving Guides — Wallet Wins" },
      { property: "og:description", content: "Tips and walkthroughs to save more on everyday purchases, from Amazon bin stores to Costco coupon books." },
      { property: "og:url", content: "/guides" },
    ],
    links: [{ rel: "canonical", href: "/guides" }],
  }),
  component: GuidesPage,
});

function GuidesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Saving Guides</h1>
      </div>
      <p className="mb-8 max-w-2xl text-base text-muted-foreground">
        Practical tips and walkthroughs to help you save more on everyday purchases.
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {savingGuides.map((g) => (
          <Link
            key={g.to}
            to={g.to}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover"
          >
            <h2 className="font-display text-xl font-bold">{g.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{g.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Read guide <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
