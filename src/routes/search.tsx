import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DealGrid } from "@/components/DealCard";
import { searchDeals } from "@/lib/deals-data";

const schema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/search")({
  validateSearch: (s) => schema.parse(s),
  head: () => ({
    meta: [
      { title: "Search Deals — Wallet Wins" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const results = q ? searchDeals(q) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
        {q ? <>Search: <span className="text-primary">"{q}"</span></> : "Search"}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {q ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Use the search bar to find deals."}
      </p>
      <div className="mt-8">
        <DealGrid deals={results} />
      </div>
    </div>
  );
}