import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Activity, Download, Package, RefreshCw, Store, Tag } from "lucide-react";
import {
  CATEGORIES,
  activeDeals,
  categoryBySlug,
  formatPrice,
  topRetailers,
} from "@/lib/deals-data";
import { dealsQueryOptions } from "@/lib/deals-query";
import { fetchDealsServer } from "@/lib/deals.functions";

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

// Admin-gated server action that re-fetches deals from the upstream DB,
// bypassing the React Query cache, and records the check time for each deal
// in the local `deal_checks` table. Verifies the HttpOnly admin cookie.
const refreshDealsAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  const cookie = getCookie(ADMIN_COOKIE);
  if (!expected || !cookie || !constantTimeEqual(cookie, expected)) {
    return { ok: false as const, error: "Unauthorized." };
  }
  try {
    const deals = await fetchDealsServer();
    const checkedAt = new Date().toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Upsert last-checked timestamps in chunks to keep each request small.
    const chunkSize = 1000;
    const upsertRows = deals.map((d) => ({
      deal_id: d.id,
      product_url: d.product_url ?? null,
      last_checked_at: checkedAt,
    }));
    for (let i = 0; i < upsertRows.length; i += chunkSize) {
      const chunk = upsertRows.slice(i, i + chunkSize);
      const { error } = await supabaseAdmin
        .from("deal_checks")
        .upsert(chunk, { onConflict: "deal_id" });
      if (error) {
        console.error("[refreshDealsAdmin] deal_checks upsert chunk failed", error);
        // Don't fail the whole refresh; still return the deals count.
      }
    }
    return { ok: true as const, count: deals.length, refreshedAt: checkedAt };
  } catch (err) {
    console.error("[refreshDealsAdmin] fetch failed", err);
    return { ok: false as const, error: "Refresh failed. Please try again." };
  }
});

// CSV export of affiliate_clicks for a date range + optional retailer filter.
// Gated by the same HttpOnly admin cookie as the dashboard itself; returns an
// error envelope (never throws schema details) when unauthorized or upstream
// fails.
function isoBoundary(input: string, end: boolean): string | null {
  // Accept YYYY-MM-DD; normalize to a full-day UTC boundary.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  return end ? `${input}T23:59:59.999Z` : `${input}T00:00:00.000Z`;
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  // Prevent CSV formula injection: cells starting with =, +, -, @, tab, or CR
  // are interpreted as formulas by Excel/Sheets/Numbers. Prefix with a single
  // quote so the cell is treated as literal text.
  if (s.length > 0 && /^[=+\-@|\t\r]/.test(s)) {
    s = `'${s}`;
  }
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const exportAffiliateClicks = createServerFn({ method: "POST" })
  .inputValidator((d: { startDate: string; endDate: string; retailer?: string }) => d)
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_DASHBOARD_TOKEN;
    const cookie = getCookie(ADMIN_COOKIE);
    if (!expected || !cookie || !constantTimeEqual(cookie, expected)) {
      return { ok: false as const, error: "Unauthorized." };
    }
    const url = process.env.WALLETWINS_DB_URL;
    const key = process.env.WALLETWINS_DB_ANON_KEY;
    if (!url || !key) {
      return { ok: false as const, error: "Backend not configured." };
    }
    const start = isoBoundary(data.startDate, false);
    const end = isoBoundary(data.endDate, true);
    if (!start || !end) {
      return { ok: false as const, error: "Invalid date range." };
    }
    const qs = new URLSearchParams({
      select:
        "id,deal_id,product_fingerprint,retailer,source_page,referrer,created_at",
      order: "created_at.desc",
      limit: "50000",
    });
    qs.append("created_at", `gte.${start}`);
    qs.append("created_at", `lte.${end}`);
    if (data.retailer && data.retailer.trim()) {
      qs.append("retailer", `eq.${data.retailer.trim()}`);
    }
    const res = await fetch(`${url}/rest/v1/affiliate_clicks?${qs.toString()}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[exportAffiliateClicks] upstream error", res.status, body.slice(0, 500));
      return { ok: false as const, error: "Export failed. Please try again." };
    }
    const rows = (await res.json()) as Array<Record<string, unknown>>;
    const headers = [
      "id",
      "deal_id",
      "product_fingerprint",
      "retailer",
      "source_page",
      "referrer",
      "created_at",
    ];
    const lines = [headers.join(",")];
    for (const row of rows) {
      lines.push(headers.map((h) => csvEscape(row[h])).join(","));
    }
    return {
      ok: true as const,
      csv: lines.join("\n"),
      count: rows.length,
      filename: `affiliate_clicks_${data.startDate}_to_${data.endDate}${
        data.retailer ? `_${data.retailer}` : ""
      }.csv`,
    };
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
  const { authed } = Route.useLoaderData();
  if (!authed) return <AdminLogin />;
  return <AdminDashboard />;
}

function AdminLogin() {
  const router = useRouter();
  const login = useServerFn(loginAdmin);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-display text-2xl font-extrabold">Operator sign-in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the admin access token to view the dashboard.
      </p>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setError(null);
          setBusy(true);
          try {
            const res = await login({ data: { token } });
            if (res.ok) {
              setToken("");
              await router.invalidate();
            } else {
              setError("Invalid token.");
            }
          } catch {
            setError("Sign-in failed. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <input
          type="password"
          autoComplete="current-password"
          aria-label="Admin access token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Access token"
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={busy || !token}
          className="h-11 w-full rounded-lg bg-gradient-primary text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </form>
    </div>
  );
}

function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useServerFn(logoutAdmin);
  const exportClicks = useServerFn(exportAffiliateClicks);
  const refreshDeals = useServerFn(refreshDealsAdmin);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);
  const { data: allDeals } = useSuspenseQuery(dealsQueryOptions);
  const deals = activeDeals(allDeals);
  const today = deals.filter((d) => {
    const diff = Date.now() - +new Date(d.created_at);
    return diff < 24 * 60 * 60 * 1000;
  });

  const byRetailer = topRetailers(deals, 50);

  const todayIso = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

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
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase text-accent-foreground sm:inline">
            Admin Preview
          </span>
          <button
            type="button"
            disabled={refreshing}
            onClick={async () => {
              setRefreshing(true);
              setRefreshMsg(null);
              try {
                const res = await refreshDeals();
                if (!res.ok) {
                  setRefreshMsg(res.error);
                } else {
                  await queryClient.invalidateQueries({ queryKey: dealsQueryOptions.queryKey });
                  await queryClient.refetchQueries({ queryKey: dealsQueryOptions.queryKey });
                  const when = new Date(res.refreshedAt).toLocaleString();
                  setRefreshMsg(`Refreshed ${res.count} deals. Last checked: ${when}.`);
                }
              } catch {
                setRefreshMsg("Refresh failed.");
              } finally {
                setRefreshing(false);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-bold uppercase text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout();
              await router.invalidate();
            }}
            className="rounded-full border border-border px-3 py-1 text-xs font-bold uppercase text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
      {refreshMsg && (
        <p className="mt-2 text-xs text-muted-foreground" role="status">{refreshMsg}</p>
      )}

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

      <ExportClicksPanel
        defaultStart={sevenDaysAgo}
        defaultEnd={todayIso}
        retailers={byRetailer.filter((r) => r.count > 0)}
        onExport={exportClicks}
      />

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

function ExportClicksPanel({
  defaultStart,
  defaultEnd,
  retailers,
  onExport,
}: {
  defaultStart: string;
  defaultEnd: string;
  retailers: Array<{ slug: string; name: string }>;
  onExport: (args: {
    data: { startDate: string; endDate: string; retailer?: string };
  }) => Promise<
    | { ok: true; csv: string; filename: string; count: number }
    | { ok: false; error: string }
  >;
}) {
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [retailer, setRetailer] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <Panel title="Export Affiliate Clicks" className="mt-6">
      <p className="mb-4 text-sm text-muted-foreground">
        Download a CSV of click events for the selected date range and retailer.
      </p>
      <form
        className="grid gap-3 sm:grid-cols-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          setMsg(null);
          setErr(null);
          try {
            const res = await onExport({
              data: {
                startDate,
                endDate,
                retailer: retailer || undefined,
              },
            });
            if (!res.ok) {
              setErr(res.error);
              return;
            }
            const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = res.filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            setMsg(`Exported ${res.count} click${res.count === 1 ? "" : "s"}.`);
          } catch {
            setErr("Export failed. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase text-muted-foreground">
          Start date
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm normal-case text-foreground"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase text-muted-foreground">
          End date
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm normal-case text-foreground"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase text-muted-foreground">
          Retailer
          <select
            value={retailer}
            onChange={(e) => setRetailer(e.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm normal-case text-foreground"
          >
            <option value="">All retailers</option>
            {retailers.map((r) => (
              <option key={r.slug} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {busy ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </form>
      {msg && <p className="mt-3 text-xs text-success">{msg}</p>}
      {err && <p className="mt-3 text-xs text-red-500">{err}</p>}
    </Panel>
  );
}