import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DealGrid } from "@/components/DealCard";
import { categoryBySlug, dealsByCategory } from "@/lib/deals-data";
import { dealsQueryOptions } from "@/lib/deals-query";

type Sort = "best" | "newest" | "discount" | "price";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params, context }) => {
    const category = categoryBySlug(params.slug);
    if (!category) throw notFound();
    const allDeals = await context.queryClient.ensureQueryData(dealsQueryOptions);
    return { category, deals: dealsByCategory(allDeals, params.slug) };
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.category?.name ?? params.slug;
    const deals = loaderData?.deals ?? [];
    return {
      meta: [
        { title: `${name} Deals — Wallet Wins` },
        { name: "description", content: `Save on ${name}. Browse the best ${name} deals and price drops.` },
        { property: "og:title", content: `${name} Deals — Wallet Wins` },
        { property: "og:description", content: `Save on ${name}. Browse the best ${name} deals and price drops.` },
        { property: "og:url", content: `/category/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/category/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${name} Deals`,
            url: `/category/${params.slug}`,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: deals.length,
              itemListElement: deals.slice(0, 20).map((d, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `/deal/${d.slug}`,
                name: d.product_name,
              })),
            },
          }),
        },
      ],
    };
  },
  component: CategoryPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Couldn't load category</h1>
      <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Please try again.</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Category not found</h1>
    </div>
  ),
});

function CategoryPage() {
  const { category, deals } = Route.useLoaderData();
  const [sort, setSort] = useState<Sort>("best");

  const sorted = useMemo(() => {
    const list = [...deals];
    switch (sort) {
      case "newest":
        list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        break;
      case "discount":
        list.sort((a, b) => b.discount - a.discount);
        break;
      case "price":
        list.sort((a, b) => a.price - b.price);
        break;
      default:
        list.sort((a, b) => b.deal_score - a.deal_score);
    }
    return list;
  }, [deals, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-3xl shadow-card">
            {category.emoji}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Category</p>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{category.name}</h1>
            <p className="text-sm text-muted-foreground">{deals.length} active deals</p>
          </div>
        </div>
        <select
          aria-label="Sort deals"
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="h-10 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          <option value="best">Best Deals</option>
          <option value="newest">Newest</option>
          <option value="discount">Highest Discount</option>
          <option value="price">Lowest Price</option>
        </select>
      </div>

      <div className="mt-8">
        <DealGrid deals={sorted} />
      </div>
    </div>
  );
}