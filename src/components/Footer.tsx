import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { CATEGORIES, liveCategories, topRetailers } from "@/lib/deals-data";
import { dealsQueryOptions } from "@/lib/deals-query";

export function Footer() {
  // Render a stable placeholder on the server and first client paint so SSR
  // and hydration match exactly. After mount, swap in live data.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const { data: deals = [] } = useQuery({ ...dealsQueryOptions, retry: false });

  const liveCats = liveCategories(deals).slice(0, 6);
  const liveRetailers = topRetailers(deals, 6);

  const showLive = hydrated && (liveCats.length > 0 || liveRetailers.length > 0);
  const categories = showLive && liveCats.length
    ? liveCats
    : CATEGORIES.slice(0, 6).map((c) => ({ ...c, count: 0 }));

  return (
    <footer className="mt-20 border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold">
              Wallet<span className="text-primary">Wins</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            The best deals. Updated daily. Save more on the brands you love.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide">Categories</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-foreground">
                  {c.name}
                  {showLive && c.count > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground/70">({c.count})</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide">Retailers</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {!showLive ? (
              Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="opacity-40">—</li>
              ))
            ) : (
              liveRetailers.map((r) => (
                <li key={r.slug}>
                  <Link to="/retailer/$slug" params={{ slug: r.slug }} className="hover:text-foreground">
                    {r.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/deals" className="hover:text-foreground">All Deals</Link></li>
            <li><Link to="/admin" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Wallet Wins. Prices and discounts shown are for demonstration.
      </div>
    </footer>
  );
}