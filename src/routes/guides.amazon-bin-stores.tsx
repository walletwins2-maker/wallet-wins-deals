import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, MapPin, Tag } from "lucide-react";

const TITLE = "Amazon Bin Stores: How They Work & How to Find One — Wallet Wins";
const DESCRIPTION =
  "Amazon Bin Stores resell returns and overstock in weekly cycles that drop to $1. Here's how the pricing works, what to expect, and how to find a bin store near you.";
const URL_PATH = "/guides/amazon-bin-stores";

const PRICING_CYCLE: Array<{ day: string; price: string; note: string }> = [
  { day: "Restock day", price: "$7 – $10", note: "Fresh pallets, biggest selection, highest price." },
  { day: "Day 2", price: "$5", note: "Crowds thin out, plenty of inventory left." },
  { day: "Day 3", price: "$3", note: "Selection narrows but bargains get sharper." },
  { day: "Day 4", price: "$2", note: "Mostly picked over — go early." },
  { day: "Clearance day", price: "$1", note: "Everything left in the bins is a buck. Bring a cart." },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What is an Amazon Bin Store?",
    a: "An independent liquidation store that buys pallets of Amazon customer returns, overstock, and shelf-pulls, dumps them into large bins, and prices everything by the day rather than per item.",
  },
  {
    q: "Is it actually Amazon merchandise?",
    a: "Yes — most inventory originates from Amazon warehouses, though bin stores are not owned or operated by Amazon. They are usually local small businesses.",
  },
  {
    q: "How do I find a bin store near me?",
    a: "Search Google Maps or Facebook for 'bin store', '$7 store', or 'liquidation bin store' plus your city. New locations open constantly because pallet supply is plentiful.",
  },
  {
    q: "Can I return what I buy?",
    a: "No. Bin stores sell as-is, no returns, no testing. Inspect electronics for damage and check that all parts are in the box before you pay.",
  },
];

export const Route = createFileRoute("/guides/amazon-bin-stores")({
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
          headline: "Amazon Bin Stores: How They Work & How to Find One",
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
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: AmazonBinStoresGuide,
});

function AmazonBinStoresGuide() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
          Amazon Bin Stores: How They Work & How to Find One
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{DESCRIPTION}</p>
      </header>

      <section className="prose prose-neutral mb-10 max-w-none dark:prose-invert">
        <p>
          Amazon Bin Stores have exploded across the U.S. as a way to flip the constant stream of Amazon
          customer returns, overstock, and damaged-box inventory. Instead of pricing each item, the store
          dumps everything into giant bins and posts a single flat price that drops every day until the
          next restock.
        </p>
        <p>
          That cycle is the whole game. Show up on restock day for selection, show up on $1 day for the
          deepest savings — and know what you're walking into either way.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
          <Calendar className="h-5 w-5 text-primary" /> The typical weekly pricing cycle
        </h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Day</th>
                <th className="px-4 py-3 font-medium">Price per item</th>
                <th className="px-4 py-3 font-medium">What to expect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PRICING_CYCLE.map((row) => (
                <tr key={row.day}>
                  <td className="px-4 py-3 font-medium text-foreground">{row.day}</td>
                  <td className="px-4 py-3 text-primary">{row.price}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Exact prices vary by store. Check the storefront, Facebook page, or Google listing for the
          current schedule before driving out.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
          <MapPin className="h-5 w-5 text-primary" /> How to find a bin store near you
        </h2>
        <ul className="space-y-3 text-muted-foreground">
          <li>Search Google Maps for "bin store", "$7 store", or "Amazon liquidation" plus your city.</li>
          <li>Check Facebook — most bin stores post restock day, theme nights, and live previews there.</li>
          <li>Ask in local Buy Nothing and yard-sale groups; new bin stores open every month.</li>
          <li>Look near outlet malls and former big-box retail spaces — they fit the warehouse footprint.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
          <Tag className="h-5 w-5 text-primary" /> Tips for your first visit
        </h2>
        <ul className="space-y-3 text-muted-foreground">
          <li>Bring cash — many bin stores either don't take cards or add a card surcharge.</li>
          <li>Inspect electronics for damage and confirm all accessories are in the box. Sales are final.</li>
          <li>Wear clothes you don't mind dirtying. Bins get rummaged hard.</li>
          <li>Look up suspected finds on Amazon while you're there to confirm they're worth the price.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">FAQ</h2>
        <div className="space-y-5">
          {FAQS.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-foreground">{f.q}</h3>
              <p className="mt-1 text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-lg border border-border bg-muted/40 p-6">
        <h2 className="text-lg font-semibold text-foreground">Prefer online deals?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If you'd rather skip the drive, browse today's biggest price drops from trusted retailers.
        </p>
        <Link
          to="/deals"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          See today's deals <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}