import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Calendar, Tag } from "lucide-react";
import { DealGrid } from "@/components/DealCard";
import { activeDeals } from "@/lib/deals-data";
import { dealsQueryOptions } from "@/lib/deals-query";

const TITLE = "Costco Coupon Book Guide — Wallet Wins";
const DESCRIPTION =
  "How the Costco Coupon Book works, when the next member-only savings event starts, and how to stack instant rebates with current Wallet Wins deals.";
const URL_PATH = "/guides/costco-coupon-book";

export const Route = createFileRoute("/guides/costco-coupon-book")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dealsQueryOptions),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL_PATH },
    ],
    links: [{ rel: "canonical", href: URL_PATH }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Costco Coupon Book Guide",
          description: DESCRIPTION,
          author: { "@type": "Organization", name: "Wallet Wins" },
          publisher: { "@type": "Organization", name: "Wallet Wins" },
          mainEntityOfPage: URL_PATH,
        }),
      },
    ],
  }),
  component: CostcoCouponBookGuide,
});

function CostcoCouponBookGuide() {
  const { data: deals } = useSuspenseQuery(dealsQueryOptions);
  const picks = activeDeals(deals)
    .filter((d) => d.discount >= 15)
    .sort((a, b) => b.deal_score - a.deal_score)
    .slice(0, 8);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <span>Guides</span>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">Costco Coupon Book</span>
      </nav>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
        <BookOpen className="h-3.5 w-3.5" /> Savings Guide
      </div>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
        The Costco Coupon Book: How It Works & How to Save More
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Updated regularly. The Costco Coupon Book — officially the “Member Savings” mailer — is the
        easiest way to stack instant rebates on top of Costco's already-low warehouse prices.
      </p>

      <section className="prose-content mt-8 space-y-4 text-base leading-relaxed text-foreground">
        <h2 className="font-display text-2xl font-extrabold">What is the Costco Coupon Book?</h2>
        <p>
          The Costco Coupon Book is a member-only savings mailer Costco releases roughly every
          month. Each book runs for about three to four weeks and lists instant manufacturer
          rebates that come off at the register — no clipping required, no app activation. Gold
          Star, Business, and Executive members all get the same prices, but Executive members
          earn an additional 2% reward on qualifying purchases.
        </p>

        <h2 className="font-display text-2xl font-extrabold">When does the next book start?</h2>
        <p>
          Costco typically publishes 12 to 13 books a year, with the largest ones landing around
          the spring "Member Savings Event," back-to-school in August, the October Hot Buys event,
          and the November Black Friday / holiday book. Check the dates printed on the front of
          the most recent mailer or sign in to Costco.com → "Savings" → "Current Offers" to see
          the next start and end dates for your region.
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Most books run Wednesday through the following month's first Sunday.</li>
          <li>Online-only codes usually start one day earlier than warehouse pricing.</li>
          <li>Multi-Save (MS) coupons require buying multiple items together for the discount.</li>
        </ul>

        <h2 className="font-display text-2xl font-extrabold">How to read a coupon page</h2>
        <p>
          Every entry lists the item, the savings amount, the dates the offer is valid, and a
          small icon noting whether it's in warehouse, online, or both. Look for the "$X OFF"
          band — that's the instant rebate. Items marked "While supplies last" are usually
          one-time buys and worth grabbing early in the cycle.
        </p>

        <h2 className="font-display text-2xl font-extrabold">Stack with these tips</h2>
        <ol className="ml-5 list-decimal space-y-1.5">
          <li>Pair the coupon with a Costco Anywhere Visa for 2% cash back on Costco purchases.</li>
          <li>If you're an Executive member, the 2% reward compounds on coupon-book pricing.</li>
          <li>Cross-check the post-coupon price against current deals on Wallet Wins below — sometimes a sale elsewhere beats even the warehouse price.</li>
        </ol>

        <h2 className="font-display text-2xl font-extrabold">Frequently asked questions</h2>
        <div className="space-y-3">
          <div>
            <p className="font-semibold">Do I need to clip or scan the coupons?</p>
            <p className="text-muted-foreground">No. Discounts come off automatically at checkout for any active member.</p>
          </div>
          <div>
            <p className="font-semibold">Can I price-adjust an item I bought before the book started?</p>
            <p className="text-muted-foreground">Yes — within 30 days of purchase, bring your receipt to the membership desk for a refund of the difference.</p>
          </div>
          <div>
            <p className="font-semibold">Do the coupons work on Costco.com?</p>
            <p className="text-muted-foreground">Most do, but pricing and availability can differ from your local warehouse. The book labels each offer as in-warehouse, online, or both.</p>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Calendar className="h-3.5 w-3.5" /> Live on Wallet Wins
        </div>
        <h2 className="mt-2 font-display text-2xl font-extrabold">
          Stack the coupon book with today's top deals
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hand-picked active deals with 15%+ off — great for comparing against the current Costco coupon prices.
        </p>
        <div className="mt-6">
          <DealGrid deals={picks} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/deals"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-card-hover transition hover:brightness-110"
          >
            Browse all deals <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/category/$slug"
            params={{ slug: "kitchen" }}
            className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold hover:border-primary"
          >
            <Tag className="h-4 w-4" /> Kitchen deals
          </Link>
          <Link
            to="/category/$slug"
            params={{ slug: "electronics" }}
            className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold hover:border-primary"
          >
            <Tag className="h-4 w-4" /> Electronics deals
          </Link>
        </div>
      </section>
    </article>
  );
}