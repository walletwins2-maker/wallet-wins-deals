import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust & Privacy — Wallet Wins" },
      {
        name: "description",
        content:
          "How Wallet Wins handles your data: what we collect when you browse deals or subscribe, the third-party services we rely on, and how to contact us about privacy.",
      },
      { property: "og:title", content: "Trust & Privacy — Wallet Wins" },
      {
        property: "og:description",
        content:
          "Plain-English summary of what Wallet Wins collects, who we share it with, and how to reach us.",
      },
    ],
  }),
  component: TrustPage,
});

function TrustPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">Trust & Privacy</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold">How Wallet Wins handles your data</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This page is maintained by the Wallet Wins team to answer common security and privacy questions
          about the site. It is editable project content, not an independent certification or audit.
        </p>
      </header>

      <Section title="What Wallet Wins is">
        <p>
          Wallet Wins is a public deals website. You can browse retailer deals without creating an account.
          We do not sell products directly — clicking "Get Deal" sends you to the retailer's own site.
        </p>
      </Section>

      <Section title="What we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Browsing:</strong> standard request metadata (page URL, referrer, user agent) when you
            click through to a retailer, so we can measure which deals are useful.
          </li>
          <li>
            <strong>Newsletter:</strong> your email address and the page you signed up from, only if you
            submit the subscribe form.
          </li>
          <li>
            <strong>No accounts:</strong> the public site does not have user logins, so we do not store
            passwords, profiles, or order history.
          </li>
        </ul>
      </Section>

      <Section title="How we use it">
        <ul className="list-disc space-y-2 pl-5">
          <li>To show deals, rank them, and improve which deals we surface.</li>
          <li>To send the newsletter you signed up for. You can unsubscribe at any time.</li>
          <li>To investigate abuse or technical errors.</li>
        </ul>
        <p className="mt-3">
          We do not sell your email address. We do not run third-party advertising trackers on the site.
        </p>
      </Section>

      <Section title="Who we share it with">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Retailers:</strong> when you click "Get Deal", the destination retailer receives the
            normal information your browser sends to any site (IP, user agent, referrer). Their privacy
            policy governs what happens next.
          </li>
          <li>
            <strong>Infrastructure providers</strong> that host the site, database, and email delivery.
            They process data on our behalf under their own security commitments.
          </li>
        </ul>
      </Section>

      <Section title="Security controls we have in place">
        <ul className="list-disc space-y-2 pl-5">
          <li>All traffic to the site is served over HTTPS.</li>
          <li>
            Sensitive data (newsletter emails, click tracking) is stored with row-level security so it is
            not readable by the public-facing site.
          </li>
          <li>
            The internal operations dashboard is gated by a server-side secret and is not reachable from
            normal navigation.
          </li>
          <li>
            Backend errors are logged server-side; the browser only receives generic messages so internal
            details are not exposed.
          </li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          Security is a shared responsibility: we maintain the application, our infrastructure providers
          maintain the underlying platforms, and retailers you click through to are responsible for their
          own sites.
        </p>
      </Section>

      <Section title="Retention and deletion">
        <p>
          Newsletter subscriptions are kept until you unsubscribe or ask us to delete them. Click-tracking
          records are retained only as long as needed to measure deal performance.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Wallet Wins uses only the local browser storage needed to make the site work (for example,
          remembering recent clicks for the dashboard preview). We do not set advertising cookies.
        </p>
      </Section>

      <Section title="Full privacy policy">
        <p>
          The complete Wallet Wins privacy policy is published on Notion and is the authoritative
          source for how we collect, use, and share data:
        </p>
        <p>
          <a
            href="https://glacier-bassoon-77f.notion.site/WalletWins-301abadcb7308051b399c5cffe59f0b7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Read the full Wallet Wins privacy policy →
          </a>
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions, deletion requests, or security reports: reach out through the contact details
          listed in the{" "}
          <a
            href="https://glacier-bassoon-77f.notion.site/WalletWins-301abadcb7308051b399c5cffe59f0b7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            full privacy policy
          </a>
          .
        </p>
      </Section>

      <p className="mt-12 text-xs text-muted-foreground">
        Looking for deals instead?{" "}
        <Link to="/deals" className="text-primary underline">
          Browse all deals
        </Link>
        .
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-2xl font-extrabold">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}