import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, Store, Tag } from "lucide-react";
import { DealGrid } from "@/components/DealCard";
import { activeDeals } from "@/lib/deals-data";
import { dealsQueryOptions } from "@/lib/deals-query";

const TITLE = "Liquidation Stores Near Me: How to Find Them — Wallet Wins";
const DESCRIPTION =
  "A practical guide to finding local liquidation stores, pallet auctions, and outlet warehouses near you — plus today's biggest online price drops.";
const URL_PATH = "/guides/liquidation-stores";

const NATIONAL_CHAINS: Array<{ name: string; blurb: string; locator: string }> = [
  {
    name: "Ollie's Bargain Outlet",
    blurb: "Closeouts on books, housewares, food, and seasonal goods across the eastern U.S.",
    locator: "ollies.us/store-locator",
  },
  {
    name: "Big Lots",
    blurb: "Furniture, pantry staples, and overstock home goods, often 30–70% below MSRP.",
    locator: "biglots.com/store/locator",
  },
  {
    name: "Grocery Outlet",
    blurb: "Independent-operator grocery liquidator with rotating closeout pricing.",
    locator: "groceryoutlet.com/store-locator",
  },
  {
    name: "Dirt Cheap / Treasure Hunt",
    blurb: "Southeastern chain stocking shelf-pulls and returns from major retailers.",
    locator: "shopdirtcheap.com/locations",
  },
  {
    name: "American Freight",
    blurb: "Liquidated furniture, mattresses, and appliances — open-box and scratch-and-dent.",
    locator: "americanfreight.com/store-locator",
  },
  {
    name: "Bargain Hunt",
    blurb: "Truckload buyouts of overstock and discontinued items across the South.",
    locator: "bargainhunt.com/locations",
  },
];

export const Route = createFileRoute("/guides/liquidation-stores")({
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
          headline: "Liquidation Stores Near Me: How to Find Them",
          description: DESCRIPTION,
          author: { "@type": "Organization", name: "Wallet Wins" },
          publisher: { "@type": "Organization", name: "Wallet Wins" },
          mainEntityOfPage: URL_PATH,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is a liquidation store?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A liquidation store sells customer returns, overstock, shelf-pulls, and closeout inventory bought in bulk from major retailers — usually at 40–90% below original retail.",
              },
            },
            {
              "@type": "Question",
              name: "How do I find liquidation stores near me?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Search Google Maps for terms like \"liquidation outlet\", \"returns store\", or \"pallet store\" plus your city. Check national chains like Ollie's, Big Lots, and Grocery Outlet, and look for local Amazon-returns resellers on Facebook Marketplace.",
              },
            },
            {
              "@type": "Question",
              name: "Can I buy pallets directly online?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes — B-Stock, Liquidation.com, and Direct Liquidation auction off truckloads and pallets sourced directly from Amazon, Walmart, Target, and Home Depot returns.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: LiquidationStoresGuide,
});

function LiquidationStoresGuide() {
  const { data: deals } = useSuspenseQuery(dealsQueryOptions);
  const picks = activeDeals(deals)
    .filter((d) => d.discount >= 30)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 8);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <span>Guides</span>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">Liquidation Stores</span>
      </nav>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
        <MapPin className="h-3.5 w-3.5" /> Local Savings Guide
      </div>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
        Liquidation Stores Near Me: How to Find Them
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Liquidation outlets resell customer returns, overstock, and shelf-pulls from big-box
        retailers at 40–90% off original retail. Here's how to find them in your city — plus
        national chains, online pallet sources, and the rules that make the deepest discounts
        worth the drive.
      </p>

      <section className="mt-8 space-y-4 text-base leading-relaxed text-foreground">
        <h2 className="font-display text-2xl font-extrabold">How to find liquidation stores in your area</h2>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            <strong>Search Google Maps</strong> for phrases like <em>"liquidation outlet"</em>,
            <em> "returns store"</em>, <em>"pallet store"</em>, or <em>"closeout warehouse"</em>
            plus your city. The most active independent resellers usually show up here, not on
            their own websites.
          </li>
          <li>
            <strong>Check Facebook Marketplace and local groups.</strong> Many Amazon-returns
            resellers post weekly pallet drops and "bin store" reload days only on Facebook.
          </li>
          <li>
            <strong>Look at national chain locators.</strong> The chains below have hundreds of
            locations across the U.S. and stock new closeouts every week.
          </li>
          <li>
            <strong>Ask big-box managers.</strong> Some Home Depot, Lowe's, and Target stores
            sell scratched or open-box stock at a clearance section near the back. Ask a manager
            which day they mark down.
          </li>
        </ol>

        <h2 className="font-display text-2xl font-extrabold">National liquidation chains</h2>
        <ul className="space-y-3">
          {NATIONAL_CHAINS.map((chain) => (
            <li key={chain.name} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-start gap-2">
                <Store className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-semibold">{chain.name}</p>
                  <p className="text-sm text-muted-foreground">{chain.blurb}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Find a store: {chain.locator}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="font-display text-2xl font-extrabold">Buy pallets and truckloads online</h2>
        <p>
          If there's no liquidator in driving distance, you can buy directly from the same
          wholesale sources that supply them:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li><strong>B-Stock</strong> — auctioned pallets from Amazon, Walmart, Target, and The Home Depot.</li>
          <li><strong>Liquidation.com</strong> — single-lot and case-pack buying with manifest details.</li>
          <li><strong>Direct Liquidation</strong> — truckloads sorted by category and condition grade.</li>
          <li><strong>888 Lots</strong> — smaller case packs that are good for first-time resellers.</li>
        </ul>

        <h2 className="font-display text-2xl font-extrabold">Tips before you go</h2>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Bring cash — many independent stores charge a card-processing fee.</li>
          <li>Inspect electronics in-store; most liquidators sell "as-is" with no returns.</li>
          <li>Visit on restock day (often Wednesday or Friday) for the freshest inventory.</li>
          <li>Cross-check the in-store price against today's online price drops before you buy.</li>
        </ul>

        <h2 className="font-display text-2xl font-extrabold">Frequently asked questions</h2>
        <div className="space-y-3">
          <div>
            <p className="font-semibold">What is a liquidation store?</p>
            <p className="text-muted-foreground">
              A retailer that resells customer returns, overstock, shelf-pulls, and closeout
              inventory bought in bulk from major chains — typically 40–90% below original retail.
            </p>
          </div>
          <div>
            <p className="font-semibold">Are liquidation prices actually cheaper than online sales?</p>
            <p className="text-muted-foreground">
              Sometimes yes, sometimes no. For seasonal closeouts and furniture, in-store
              liquidation often beats online. For electronics and small appliances, today's
              online price drops usually win — always price-check.
            </p>
          </div>
          <div>
            <p className="font-semibold">Do liquidation items come with a warranty?</p>
            <p className="text-muted-foreground">
              Rarely. Most liquidation sales are final and "as-is", though the original
              manufacturer warranty may still apply if the item is unopened.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Tag className="h-3.5 w-3.5" /> Live on Wallet Wins
        </div>
        <h2 className="mt-2 font-display text-2xl font-extrabold">
          Today's deepest online price drops
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare these against the in-store liquidation prices before you drive — 30%+ off everything below.
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
            to="/guides/costco-coupon-book"
            className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold hover:border-primary"
          >
            Costco Coupon Book Guide
          </Link>
        </div>
      </section>
    </article>
  );
}