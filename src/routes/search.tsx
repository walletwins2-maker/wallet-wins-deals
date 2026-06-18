import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DealGrid } from "@/components/DealCard";
import { searchDeals } from "@/lib/deals-data";
import { dealsQueryOptions } from "@/lib/deals-query";

const schema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/search")({
  validateSearch: (s) => schema.parse(s),
  loader: ({ context }) => context.queryClient.ensureQueryData(dealsQueryOptions),
  head: () => ({
    meta: [
      { title: "Search Deals — Wallet Wins" },
      { name: "description", content: "Search active deals, discounts, and price drops across hundreds of retailers on Wallet Wins." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data: deals } = useSuspenseQuery(dealsQueryOptions);
  const results = q ? searchDeals(deals, q) : [];

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