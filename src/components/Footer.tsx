import { Link } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { CATEGORIES, RETAILERS } from "@/lib/deals-data";

export function Footer() {
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
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide">Retailers</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {RETAILERS.slice(0, 6).map((r) => (
              <li key={r.slug}>
                <Link to="/retailer/$slug" params={{ slug: r.slug }} className="hover:text-foreground">
                  {r.name}
                </Link>
              </li>
            ))}
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