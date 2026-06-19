import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, TrendingDown } from "lucide-react";
import { DealGrid } from "@/components/DealCard";
import { Newsletter } from "@/components/Newsletter";
import { liveCategories, recentDrops, topDeals, topRetailers } from "@/lib/deals-data";
import { dealsQueryOptions } from "@/lib/deals-query";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dealsQueryOptions),
  head: () => ({
    meta: [
      { title: "Wallet Wins — Daily Deals & Price Drops" },
      { name: "description", content: "Save more every day. Discover the best deals, discounts, and price drops from hundreds of trusted retailers." },
      { property: "og:title", content: "Wallet Wins — Daily Deals & Price Drops" },
      { property: "og:description", content: "Save more every day. Discover the best deals, discounts, and price drops from hundreds of trusted retailers." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Couldn't load deals</h1>
      <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Please try again.</p>
    </div>
  ),
});

function Index() {
  const { data: deals } = useSuspenseQuery(dealsQueryOptions);
  const featured = topDeals(deals, 8);
  const drops = recentDrops(deals, 8);
  const retailers = topRetailers(deals, 8);
  const allRetailers = topRetailers(deals, 1000);
  const categories = liveCategories(deals);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-hero px-6 py-16 text-white shadow-elegant sm:px-12 sm:py-20">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-glow/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Updated Daily
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Save More <span className="text-primary">Every Day</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/75 sm:text-lg">
            Discover the best deals, discounts, and price drops from hundreds of trusted retailers.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/deals"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-card-hover transition hover:brightness-110"
            >
              Browse Deals <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/category/$slug"
              params={{ slug: "electronics" }}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Shop Electronics
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <SectionHeader title="🔥 Featured Deals" link="/deals" linkLabel="See all" />
      <DealGrid deals={featured} />

      {/* Retailers */}
      <SectionHeader title="Trending Retailers" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {retailers.map((r) => (
          <Link
            key={r.slug}
            to="/retailer/$slug"
            params={{ slug: r.slug }}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover"
          >
            <span
              className="grid h-12 w-12 place-items-center rounded-xl text-lg font-extrabold text-white"
              style={{ backgroundColor: r.color }}
            >
              {r.name[0]}
            </span>
            <span className="text-sm font-semibold">{r.name}</span>
            <span className="text-xs text-muted-foreground">{r.count} deals</span>
          </Link>
        ))}
      </div>

      {/* Browse all retailers */}
      {allRetailers.length > retailers.length && (
        <>
          <SectionHeader title="Browse All Retailers" />
          <div className="flex flex-wrap gap-2">
            {allRetailers.map((r) => (
              <Link
                key={r.slug}
                to="/retailer/$slug"
                params={{ slug: r.slug }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover"
              >
                <span
                  className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-extrabold text-white"
                  style={{ backgroundColor: r.color }}
                >
                  {r.name[0]}
                </span>
                <span className="font-semibold">{r.name}</span>
                <span className="text-xs text-muted-foreground">{r.count}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <>
          <SectionHeader title="Popular Categories" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((c) => (
          <Link
            key={c.slug}
            to="/category/$slug"
            params={{ slug: c.slug }}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-2xl">
              {c.emoji}
            </span>
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary">
                {c.name}{" "}
                <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                  {c.count}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">Shop now</p>
            </div>
          </Link>
            ))}
          </div>
        </>
      )}

      {/* Recent drops */}
      <SectionHeader title="📉 Recent Price Drops" icon={<TrendingDown className="h-5 w-5 text-success" />} />
      <DealGrid deals={drops} />

      <Newsletter />
      <div className="h-10" />
    </div>
  );
}

function SectionHeader({
  title,
  link,
  linkLabel,
  icon,
}: {
  title: string;
  link?: string;
  linkLabel?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-4 mt-12 flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold sm:text-3xl">
        {icon}
        {title}
      </h2>
      {link && (
        <Link to={link} className="shrink-0 text-sm font-semibold text-primary hover:underline">
          {linkLabel ?? "View all"} →
        </Link>
      )}
    </div>
  );
}
