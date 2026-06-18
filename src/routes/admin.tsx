import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Activity, Package, Store, Tag } from "lucide-react";
import {
  CATEGORIES,
  activeDeals,
  categoryBySlug,
  formatPrice,
  topRetailers,
} from "@/lib/deals-data";
import { dealsQueryOptions } from "@/lib/deals-query";

// Operator-only dashboard. The secret is submitted via POST (never as a URL
// query parameter, which would leak into logs / browser history / Referer
// headers) and stored server-side in an HttpOnly cookie for subsequent visits.
const ADMIN_COOKIE = "ww_admin_session";

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// Reads the HttpOnly session cookie and reports whether the caller is
// authorized. Safe to call from a public loader: returns { ok: false } when
// the secret is unset or the cookie is missing/wrong — never throws on
// unauthenticated requests.
const checkAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!expected) return { ok: false as const };
  const cookie = getCookie(ADMIN_COOKIE);
  if (!cookie) return { ok: false as const };
  return { ok: constantTimeEqual(cookie, expected) };
});

const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_DASHBOARD_TOKEN;
    if (!expected) return { ok: false as const };
    const provided = (data.token ?? "").trim();
    if (!constantTimeEqual(provided, expected)) return { ok: false as const };
    setCookie(ADMIN_COOKIE, expected, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8h operator session
    });
    return { ok: true as const };
  });

const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(ADMIN_COOKIE, { path: "/" });
  return { ok: true as const };
});

export const Route = createFileRoute("/admin")({
  loader: async ({ context }) => {
    const session = await checkAdminSession();
    if (!session.ok) return { authed: false as const };
    await context.queryClient.ensureQueryData(dealsQueryOptions);
    return { authed: true as const };
  },
  head: () => ({
    meta: [
      { title: "Dashboard — Wallet Wins" },
      { name: "description", content: "Internal Wallet Wins dashboard for monitoring active deals, retailers, categories, and recent click activity." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Couldn't load dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function AdminPage() {
  const { data: allDeals } = useSuspenseQuery(dealsQueryOptions);
  const deals = activeDeals(allDeals);
  const today = deals.filter((d) => {
    const diff = Date.now() - +new Date(d.created_at);
    return diff < 24 * 60 * 60 * 1000;
  });

  const byRetailer = topRetailers(deals, 50);

  const byCategory = CATEGORIES.map((c) => ({
    ...c,
    count: deals.filter((d) => d.category === c.slug).length,
  })).sort((a, b) => b.count - a.count);

  const recentClicks = (() => {
    if (typeof localStorage === "undefined") return [];
    try {
      return (JSON.parse(localStorage.getItem("ww_pending_clicks") ?? "[]") as Array<{
        product_fingerprint: string;
        retailer: string;
        clicked_at: string;
      }>).slice(-10).reverse();
    } catch {
      return [];
    }
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Performance Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of active deals and recent activity.</p>
        </div>
        <span className="hidden rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase text-accent-foreground sm:inline">
          Admin Preview
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<Package />} label="Total Deals" value={deals.length} />
        <Stat icon={<Activity />} label="Posted Today" value={today.length} />
        <Stat icon={<Store />} label="Retailers" value={byRetailer.filter((r) => r.count > 0).length} />
        <Stat icon={<Tag />} label="Categories" value={byCategory.filter((c) => c.count > 0).length} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Top Retailers">
          <ul className="divide-y divide-border">
            {byRetailer.slice(0, 6).map((r) => (
              <li key={r.slug} className="flex items-center justify-between py-3">
                <Link to="/retailer/$slug" params={{ slug: r.slug }} className="flex items-center gap-3 hover:text-primary">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-lg text-xs font-extrabold text-white"
                    style={{ backgroundColor: r.color }}
                  >
                    {r.name[0]}
                  </span>
                  <span className="font-semibold">{r.name}</span>
                </Link>
                <span className="text-sm font-bold text-muted-foreground">{r.count} deals</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Top Categories">
          <ul className="divide-y divide-border">
            {byCategory.slice(0, 6).map((c) => (
              <li key={c.slug} className="flex items-center justify-between py-3">
                <Link to="/category/$slug" params={{ slug: c.slug }} className="flex items-center gap-3 hover:text-primary">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-lg">{c.emoji}</span>
                  <span className="font-semibold">{c.name}</span>
                </Link>
                <span className="text-sm font-bold text-muted-foreground">{c.count} deals</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Recent Clicks" className="mt-6">
        {recentClicks.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No clicks yet — click "Get Deal" on any product to start tracking.
          </p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {recentClicks.map((c, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="font-mono text-xs text-muted-foreground">{c.product_fingerprint}</span>
                <span className="font-semibold">{c.retailer}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.clicked_at).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Highest-Score Deals" className="mt-6">
        <ul className="divide-y divide-border text-sm">
          {[...deals].sort((a, b) => b.deal_score - a.deal_score).slice(0, 8).map((d) => (
            <li key={d.id} className="flex items-center gap-3 py-2">
              <img src={d.image_url} alt="" className="h-10 w-10 rounded-md object-cover" />
              <Link to="/deal/$id" params={{ id: d.id }} className="flex-1 truncate font-semibold hover:text-primary">
                {d.product_name}
              </Link>
              <span className="text-xs text-muted-foreground">{categoryBySlug(d.category)?.name}</span>
              <span className="font-bold text-success">{formatPrice(d.price)}</span>
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold">{d.deal_score}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function Panel({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-card ${className}`}>
      <h3 className="mb-2 font-display text-lg font-extrabold">{title}</h3>
      {children}
    </div>
  );
}