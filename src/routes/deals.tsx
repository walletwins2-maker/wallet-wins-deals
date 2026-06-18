import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { DealGrid } from "@/components/DealCard";
import { CATEGORIES, activeDeals, topRetailers } from "@/lib/deals-data";
import { dealsQueryOptions } from "@/lib/deals-query";

const SORTS = ["best", "newest", "discount", "price"] as const;
type Sort = (typeof SORTS)[number];

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  retailer: fallback(z.string(), "all").default("all"),
  category: fallback(z.string(), "all").default("all"),
  maxPrice: fallback(z.number().int().min(20).max(2000), 2000).default(2000),
  minDiscount: fallback(z.number().int().min(0).max(80), 0).default(0),
  sort: fallback(z.enum(SORTS), "best").default("best"),
});

export const Route = createFileRoute("/deals")({
  validateSearch: zodValidator(searchSchema),
  loader: ({ context }) => context.queryClient.ensureQueryData(dealsQueryOptions),
  head: () => ({
    meta: [
      { title: "All Deals — Wallet Wins" },
      { name: "description", content: "Browse every active deal. Filter by retailer, category, price, and discount." },
      { property: "og:title", content: "All Deals — Wallet Wins" },
      { property: "og:url", content: "/deals" },
    ],
    links: [{ rel: "canonical", href: "/deals" }],
  }),
  component: DealsPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Couldn't load deals</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function DealsPage() {
  const { data: deals } = useSuspenseQuery(dealsQueryOptions);
  const { q, retailer, category, maxPrice, minDiscount, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/deals" });
  const update = <K extends keyof z.infer<typeof searchSchema>>(
    key: K,
    value: z.infer<typeof searchSchema>[K],
  ) => navigate({ search: (prev) => ({ ...prev, [key]: value }) });

  const RETAILERS = useMemo(() => topRetailers(deals, 20), [deals]);

  const filtered = useMemo(() => {
    let list = activeDeals(deals);
    if (q) {
      const t = q.toLowerCase();
      list = list.filter((d) => d.product_name.toLowerCase().includes(t));
    }
    if (retailer !== "all") list = list.filter((d) => d.retailer === retailer);
    if (category !== "all") list = list.filter((d) => d.category === category);
    list = list.filter((d) => d.price <= maxPrice && d.discount >= minDiscount);
    switch (sort) {
      case "newest":
        list = [...list].sort(
          (a, b) =>
            +new Date(b.created_at) - +new Date(a.created_at) ||
            b.id.localeCompare(a.id),
        );
        break;
      case "discount":
        list = [...list].sort((a, b) => b.discount - a.discount || b.id.localeCompare(a.id));
        break;
      case "price":
        list = [...list].sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
        break;
      default:
        list = [...list].sort(
          (a, b) => b.deal_score - a.deal_score || b.discount - a.discount || b.id.localeCompare(a.id),
        );
    }
    return list;
  }, [deals, q, retailer, category, maxPrice, minDiscount, sort]);

  const hasFilters =
    q !== "" || retailer !== "all" || category !== "all" || maxPrice !== 2000 || minDiscount !== 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">All Deals</h1>
          <p className="mt-1 text-muted-foreground">
            {filtered.length} deals — sorted by {sortLabel(sort)}
          </p>
        </div>
        {hasFilters && (
          <button
            onClick={() =>
              navigate({
                search: { q: "", retailer: "all", category: "all", maxPrice: 2000, minDiscount: 0, sort: "best" },
              })
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-card md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search products…"
            className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={retailer}
          onChange={(e) => update("retailer", e.target.value)}
          className="h-10 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          <option value="all">All retailers</option>
          {RETAILERS.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name} ({r.count})
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => update("category", e.target.value)}
          className="h-10 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => update("sort", e.target.value as Sort)}
          className="h-10 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          <option value="best">Best Deals</option>
          <option value="newest">Newest</option>
          <option value="discount">Highest Discount</option>
          <option value="price">Lowest Price</option>
        </select>

        <div className="md:col-span-2">
          <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            Max price <span>${maxPrice}</span>
          </label>
          <input
            type="range"
            min={20}
            max={2000}
            step={10}
            value={maxPrice}
            onChange={(e) => update("maxPrice", +e.target.value)}
            className="mt-1 w-full accent-[var(--primary)]"
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            Min discount <span>{minDiscount}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={minDiscount}
            onChange={(e) => update("minDiscount", +e.target.value)}
            className="mt-1 w-full accent-[var(--primary)]"
          />
        </div>
      </div>

      <div className="mt-8">
        <DealGrid deals={filtered} />
      </div>
    </div>
  );
}

function sortLabel(s: Sort) {
  return s === "best" ? "best deals" : s === "newest" ? "newest" : s === "discount" ? "biggest discount" : "lowest price";
}