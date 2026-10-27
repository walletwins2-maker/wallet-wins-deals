import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, ClipboardList, Gavel, ShieldAlert, Truck } from "lucide-react";

const TITLE = "Amazon Return Pallets: How to Buy, Bid & Flip Them";
const DESCRIPTION =
  "Where to buy Amazon return pallets online, how B-Stock and Liquidation.com auctions work, how to read a manifest, calculate shipping, and avoid the pallets that lose money.";
const URL_PATH = "/guides/amazon-return-pallets";

const MARKETPLACES: Array<{ name: string; note: string }> = [
  {
    name: "B-Stock (Amazon Liquidation Auctions)",
    note: "The official Amazon-run auction site. Mixed-category pallets and LPNs straight from Amazon FCs. Buyer accounts require a resale certificate in most states.",
  },
  {
    name: "Liquidation.com",
    note: "Large secondary marketplace listing Amazon returns alongside other big-box retailers. Manifests are often partial; bid accordingly.",
  },
  {
    name: "Direct Liquidation",
    note: "Wholesale lots from Amazon, Walmart, Target and Lowe's. Strong for electronics and tools, with case-pack overstock options.",
  },
  {
    name: "BULQ",
    note: "Smaller case- and pallet-sized loads with fixed pricing. Good entry point if you don't want to learn auction dynamics on day one.",
  },
  {
    name: "888 Lots",
    note: "Curated, fully manifested lots of new Amazon overstock with estimated resale prices. Higher per-unit cost, lower risk.",
  },
];

const COST_LINES: Array<{ label: string; value: string; note: string }> = [
  { label: "Winning bid", value: "$650", note: "Auction hammer price." },
  { label: "Buyer's premium", value: "$32 (5%)", note: "Platform fee on top of the bid." },
  { label: "Freight (LTL, 1 pallet)", value: "$280", note: "Quote with a real ZIP — residential and liftgate add $75–$150." },
  { label: "Sales tax / resale cert", value: "$0", note: "With a valid resale certificate on file." },
  { label: "Landed cost", value: "$962", note: "Divide by retail value on the manifest to get cost-to-MSRP %." },
];

const RED_FLAGS: string[] = [
  "No manifest, or only a category breakdown — you're bidding blind.",
  "MSRP-to-bid ratio under 10% on a fully manifested lot — likely salvage-grade.",
  "Heavy / oversized items (treadmills, TVs, furniture) where freight will eat the margin.",
  "Sealed customer returns flagged 'as-is' — assume 30–50% will be missing parts.",
  "Residential delivery without a liftgate quote — you'll pay it on arrival.",
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Where can I buy Amazon return pallets online?",
    a: "The official source is B-Stock's Amazon Liquidation Auctions. Liquidation.com, Direct Liquidation, BULQ, and 888 Lots also resell Amazon returns and overstock through pallets, truckloads, or case packs.",
  },
  {
    q: "How much does an Amazon return pallet cost?",
    a: "Mixed-category pallets typically clear between $400 and $1,200 at auction, plus a 5% buyer's premium and $200–$400 LTL freight. Premium electronics lots can run $2,000+. Always add freight to the bid before judging the deal.",
  },
  {
    q: "What is a manifest and how do I read one?",
    a: "A manifest is the line-item list of what's on the pallet — ASIN, description, quantity, condition, and stated MSRP. Read it in a spreadsheet, drop the top 10% of MSRPs (they're often inflated), and assume 60–70% of the remaining retail will actually resell.",
  },
  {
    q: "Do I need a resale certificate?",
    a: "Yes for B-Stock's Amazon auctions in most U.S. states, and recommended everywhere else so you don't pay sales tax on inventory. Apply through your state's Department of Revenue before bidding.",
  },
  {
    q: "Are Amazon return pallets profitable for beginners?",
    a: "They can be, but freight, untested electronics, and missing accessories are the three margin killers. Start with one small, fully manifested general-merchandise lot from BULQ or 888 Lots before bidding on unmanifested truckloads.",
  },
];

export const Route = createFileRoute("/guides/amazon-return-pallets")({
  head: () => ({
    meta: [
      { name: "twitter:card", content: "summary_large_image" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `https://walletwins.shop${URL_PATH}` },
    ],
    links: [{ rel: "canonical", href: `https://walletwins.shop${URL_PATH}` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          author: { "@type": "Organization", name: "Wallet Wins" },
          publisher: { "@type": "Organization", name: "Wallet Wins" },
          mainEntityOfPage: `https://walletwins.shop${URL_PATH}`,
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
  component: AmazonReturnPalletsGuide,
});

function AmazonReturnPalletsGuide() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
          Amazon Return Pallets: How to Buy, Bid &amp; Flip Them
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{DESCRIPTION}</p>
      </header>

      <section className="prose prose-neutral mb-10 max-w-none dark:prose-invert">
        <p>
          Amazon generates billions in customer returns every year. Most of it doesn't go back on the
          shelf — it gets bundled into pallets and truckloads and sold off through online auction
          marketplaces. If you've ever searched "liquidation pallets" or "direct liquidation," this is
          the supply chain you were looking at.
        </p>
        <p>
          Buying well comes down to three things: knowing which marketplaces carry real Amazon inventory,
          reading the manifest before you bid, and pricing freight before the hammer drops. Get those
          right and you're competing with experienced resellers on equal footing.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
          <Gavel className="h-5 w-5 text-primary" /> Where to buy Amazon return pallets online
        </h2>
        <ul className="space-y-3 text-muted-foreground">
          {MARKETPLACES.map((m) => (
            <li key={m.name}>
              <span className="font-semibold text-foreground">{m.name}.</span> {m.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
          <ClipboardList className="h-5 w-5 text-primary" /> How to read a pallet manifest
        </h2>
        <ol className="list-decimal space-y-3 pl-6 text-muted-foreground">
          <li>Download the manifest as a CSV. Sort by stated MSRP, descending.</li>
          <li>Drop the top 10% of line items — high-MSRP outliers skew the lot's "retail value."</li>
          <li>Assume 60–70% of the remaining MSRP is actually recoverable on resale.</li>
          <li>Flag oversized items, generic-brand electronics, and anything that needs a power test.</li>
          <li>Compare the recoverable estimate to your landed cost (bid + premium + freight).</li>
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
          <Truck className="h-5 w-5 text-primary" /> Calculate landed cost before you bid
        </h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Line item</th>
                <th className="px-4 py-3 font-medium">Example</th>
                <th className="px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COST_LINES.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-3 font-medium text-foreground">{row.label}</td>
                  <td className="px-4 py-3 text-primary">{row.value}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Always quote freight against your real ZIP before the auction closes — LTL pricing swings
          hundreds of dollars between commercial and residential delivery.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
          <ShieldAlert className="h-5 w-5 text-primary" /> Red flags that kill margin
        </h2>
        <ul className="space-y-3 text-muted-foreground">
          {RED_FLAGS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
          <Boxes className="h-5 w-5 text-primary" /> Related guides
        </h2>
        <ul className="space-y-3 text-muted-foreground">
          <li>
            <Link to="/guides/amazon-bin-stores" className="text-primary hover:underline">
              Amazon Bin Stores: How They Work &amp; Where to Find Them
            </Link>{" "}
            — the retail end of the same returns supply chain.
          </li>
          <li>
            <Link to="/guides/liquidation-stores" className="text-primary hover:underline">
              Liquidation Stores Near You
            </Link>{" "}
            — physical storefronts that buy pallets and resell to the public.
          </li>
          <li>
            <Link to="/guides/costco-coupon-book" className="text-primary hover:underline">
              Costco Coupon Book
            </Link>{" "}
            — for everyday savings without the freight quote.
          </li>
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
        <h2 className="text-lg font-semibold text-foreground">Skip the auction — shop today's deals</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Not ready to bid on a pallet? Browse today's biggest price drops from trusted retailers.
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