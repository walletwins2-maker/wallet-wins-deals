import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Menu, X, Wallet } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate({ to: "/search", search: { q: q.trim() } });
    setOpen(false);
  };

  const nav = [
    { to: "/deals", label: "All Deals" },
    { to: "/guides", label: "Savings Guides" },
    { to: "/category/electronics", label: "Electronics" },
    { to: "/category/home", label: "Home" },
    { to: "/category/fashion", label: "Fashion" },
    { to: "/category/kitchen", label: "Kitchen" },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-card">
            <Wallet className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
            Wallet<span className="text-primary">Wins</span>
          </span>
        </Link>

        <form onSubmit={submit} className="ml-2 hidden flex-1 md:flex">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-label="Search deals"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, retailers, categories…"
              className="h-10 w-full rounded-full border border-input bg-muted/60 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background"
            />
          </div>
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-border md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <form onSubmit={submit}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                aria-label="Search deals"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search deals…"
                className="h-11 w-full rounded-full border border-input bg-muted/60 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-background"
              />
            </div>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}