import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, ShoppingBag, Sparkles, TrendingDown } from "lucide-react";

import { DealCard, DealGrid } from "@/components/DealCard";
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
  const { data: deals } = useSuspenseQuery(dealsQueryOptions);
  const featured = topDeals(deals, 9);
  const drops = recentDrops(deals, 9);
  const retailers = topRetailers(deals, 8);
  const allRetailers = topRetailers(deals, 1000)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
  const categories = liveCategories(deals);
  const amazonDeals = (() => {
    const amazon = deals.filter((d) => d.retailer === "amazon").sort((a, b) => b.deal_score - a.deal_score);
    // Pick up to 9 from distinct categories
    const seen = new Set<string>();
    const picked: typeof amazon = [];
    for (const d of amazon) {
      if (!seen.has(d.category)) {
        seen.add(d.category);
        picked.push(d);
      }
      if (picked.length >= 9) break;
    }
    // If we don't have 9 distinct categories, fill with highest-scored remaining
    if (picked.length < 9) {
      for (const d of amazon) {
        if (!picked.includes(d)) {
          picked.push(d);
        }
        if (picked.length >= 9) break;
      }
    }
    return picked;
  })();
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
            <a
              href="#saving-guides"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-card-hover transition hover:brightness-110"
            >
              Savings Guides <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#recent-price-drops"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-card-hover transition hover:brightness-110"
            >
              Recent Price Drops <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Amazon Deals */}
      <Link
        to="/retailer/$slug"
        params={{ slug: "amazon" }}
        className="group mt-10 flex items-center gap-5 rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-[#FF9900] hover:shadow-card-hover sm:p-6"
      >
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-lg font-extrabold text-white sm:h-16 sm:w-16 sm:text-xl"
          style={{ backgroundColor: "#FF9900" }}
        >
          <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8" />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold sm:text-xl">Amazon Deals</h2>
          <p className="text-sm text-muted-foreground">
            Browse the latest discounts, price drops, and markdowns from Amazon.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-[#FF9900]" />
      </Link>
      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#FF9900]/30 bg-[#FF9900]/10 px-4 py-2 text-sm font-semibold text-[#FF9900]">
        <Sparkles className="h-4 w-4" /> Amazon Prime Days — June 23–26, 2026
      </div>
      {amazonDeals.length > 0 && (
        <>
          <SectionHeader title="Amazon Deals" link="/retailer/amazon" linkLabel="See all" />
          <div className="grid grid-cols-3 gap-4">
            {amazonDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </>
      )}

      {/* Featured */}
      <SectionHeader title="🔥 Featured Deals" link="/deals" linkLabel="See all" />
      <DealGrid deals={featured} />


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
      <div id="recent-price-drops" className="scroll-mt-24">
        <SectionHeader title="📉 Recent Price Drops" icon={<TrendingDown className="h-5 w-5 text-success" />} link="/deals" linkLabel="See all" />
      </div>
      <DealGrid deals={drops} />

      {/* Saving Guides */}
      <div id="saving-guides" className="scroll-mt-24">
        <SectionHeader title="Saving Guides" icon={<BookOpen className="h-5 w-5 text-primary" />} />
      </div>
      <p className="-mt-2 mb-4 text-sm text-muted-foreground">
        Tips and walkthroughs to save more.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {savingGuides.map((g) => (
          <a
            key={g.to}
            href={g.to}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover"
          >
            <h3 className="font-display text-lg font-bold">{g.title}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{g.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Read guide <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </a>
        ))}
      </div>

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
        <Link
          to={link}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-card-hover transition hover:brightness-110"
        >
          {linkLabel ?? "View all"}
        </Link>
      )}
    </div>
  );
}
