import { createServerFn } from "@tanstack/react-start";
import { activeDeals, mapRawDeals, type Deal } from "./deals-data";

function dbCreds() {
  const url = process.env.WALLETWINS_DB_URL;
  const key = process.env.WALLETWINS_DB_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Wallet Wins backend is not configured (missing WALLETWINS_DB_URL / WALLETWINS_DB_ANON_KEY).",
    );
  }
  return { url, key };
}

export const fetchDealsServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<Deal[]> => {
    const { url, key } = dbCreds();
    const { readDealSources } = await import("./deal-sources.server");
    const rows = await readDealSources(url, key);
    // Amazon is uncapped: show every active Amazon deal. Other retailers keep
    // a 30-deal cap so no single store dominates the feed.
    return diversifyByRetailer(activeDeals(mapRawDeals(rows)), (retailer) =>
      retailer === "amazon" ? Number.POSITIVE_INFINITY : 30,
    );
  },
);

// Reorders deals to maximize retailer AND category variety while preserving
// every deal. For each retailer, the top `capFor(retailer)` deals are chosen
// by round-robining across categories (so a retailer's slot isn't dominated
// by one category), then retailers are round-robined against each other.
// Overflow is appended at the end so no deals are lost.
function diversifyByRetailer(
  deals: Deal[],
  capFor: (retailer: string) => number,
): Deal[] {
  const scoreOf = (d: Deal) =>
    typeof (d as { deal_score?: number }).deal_score === "number"
      ? (d as { deal_score: number }).deal_score
      : 0;
  const groups = new Map<string, Deal[]>();
  for (const d of deals) {
    const key = (d.retailer ?? "unknown").toLowerCase();
    const arr = groups.get(key) ?? [];
    arr.push(d);
    groups.set(key, arr);
  }
  const capped: Deal[][] = [];
  const overflow: Deal[] = [];
  for (const [key, list] of groups.entries()) {
    const cap = capFor(key);
    // Within a retailer, group by category and round-robin across categories
    // so the top-N for that retailer spans as many categories as possible.
    const byCat = new Map<string, Deal[]>();
    for (const d of list) {
      const ck = (d.category ?? "unknown").toLowerCase();
      const arr = byCat.get(ck) ?? [];
      arr.push(d);
      byCat.set(ck, arr);
    }
    const catQueues = Array.from(byCat.values());
    for (const q of catQueues) q.sort((a, b) => scoreOf(b) - scoreOf(a));
    catQueues.sort((a, b) => scoreOf(b[0]) - scoreOf(a[0]));
    const picked: Deal[] = [];
    let i = 0;
    let added = true;
    while (added && picked.length < cap) {
      added = false;
      for (const q of catQueues) {
        if (picked.length >= cap) break;
        if (q[i]) {
          picked.push(q[i]);
          added = true;
        }
      }
      i++;
    }
    capped.push(picked);
    const pickedSet = new Set(picked);
    for (const d of list) if (!pickedSet.has(d)) overflow.push(d);
  }
  // Order retailer queues by their top deal so strongest deals still surface early.
  capped.sort((a, b) => scoreOf(b[0]) - scoreOf(a[0]));
  const out: Deal[] = [];
  let added = true;
  let i = 0;
  while (added) {
    added = false;
    for (const queue of capped) {
      if (queue[i]) {
        out.push(queue[i]);
        added = true;
      }
    }
    i++;
  }
  overflow.sort((a, b) => scoreOf(b) - scoreOf(a));
  out.push(...overflow);
  return out;
}

export const trackClickServer = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      deal_id: string;
      product_fingerprint?: string;
      retailer?: string;
      source_page?: string;
      referrer?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const { url, key } = dbCreds();
    const idNum = Number(data.deal_id);
    const body = {
      deal_id: Number.isFinite(idNum) ? idNum : null,
      product_fingerprint: data.product_fingerprint ?? null,
      retailer: data.retailer ?? null,
      source_page: data.source_page ?? null,
      referrer: data.referrer ?? null,
    };
    const res = await fetch(`${url}/rest/v1/affiliate_clicks`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      // Non-fatal: swallow so the redirect to retailer still happens client-side.
      const body = await res.text();
      console.error("[trackClickServer] upstream error", res.status, body.slice(0, 500));
      return { ok: false as const, error: "Click tracking failed." };
    }
    return { ok: true as const };
  });

export const subscribeNewsletterServer = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; source_page?: string }) => d)
  .handler(async ({ data }) => {
    const email = (data.email ?? "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return { ok: false as const, error: "Please enter a valid email." };
    }
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error("[subscribeNewsletterServer] missing local backend env");
      return { ok: false as const, error: "Subscription failed. Please try again." };
    }
    const sourcePage = data.source_page ? data.source_page.trim().slice(0, 300) : null;
    const res = await fetch(`${url}/rest/v1/newsletter_subscribers?on_conflict=email`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal,resolution=ignore-duplicates",
      },
      body: JSON.stringify({ email, source_page: sourcePage }),
    });
    if (!res.ok) {
      const body = await res.text();
      // 409 conflict = already subscribed; treat as success.
      if (res.status === 409) return { ok: true as const };
      console.error("[subscribeNewsletterServer] upstream error", res.status, body.slice(0, 500));
      return { ok: false as const, error: "Subscription failed. Please try again." };
    }
    // Fire-and-forget welcome email. Never block / fail the subscribe response on this.
    void sendWelcomeEmail(email).catch((err) => {
      console.error("[subscribeNewsletterServer] welcome email failed", err);
    });
    return { ok: true as const };
  });

async function sendWelcomeEmail(email: string) {
  const apiKey = process.env.LOVABLE_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey || !supabaseUrl || !serviceKey) {
    console.warn("[sendWelcomeEmail] missing env; skipping");
    return;
  }
  const normalized = email.toLowerCase();
  const [{ render }, React, { sendLovableEmail }, { template }, { createClient }] =
    await Promise.all([
      import("@react-email/components"),
      import("react"),
      import("@lovable.dev/email-js"),
      import("./email-templates/welcome"),
      import("@supabase/supabase-js"),
    ]);
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // 1. Suppression check — never send to bounced/complained/unsubscribed addresses.
  const { data: suppressed } = await supabase
    .from("suppressed_emails")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();
  const messageId = crypto.randomUUID();
  if (suppressed) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: "welcome",
      recipient_email: normalized,
      status: "suppressed",
    });
    return;
  }
  // 2. Get-or-create unsubscribe token (one per email).
  let unsubscribeToken: string;
  const { data: existing } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalized)
    .maybeSingle();
  if (existing?.used_at) {
    // Token used = previously unsubscribed; treat as suppressed.
    await supabase
      .from("suppressed_emails")
      .upsert({ email: normalized, reason: "unsubscribe" }, { onConflict: "email" });
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: "welcome",
      recipient_email: normalized,
      status: "suppressed",
    });
    return;
  }
  if (existing) {
    unsubscribeToken = existing.token;
  } else {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    unsubscribeToken = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    await supabase
      .from("email_unsubscribe_tokens")
      .upsert({ token: unsubscribeToken, email: normalized }, {
        onConflict: "email",
        ignoreDuplicates: true,
      });
    const { data: stored } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalized)
      .maybeSingle();
    if (stored?.token) unsubscribeToken = stored.token;
  }
  const element = React.createElement(template.component, template.previewData ?? {});
  const html = await render(element);
  const text = `Welcome to Wallet Wins!\n\nThanks for subscribing. Browse today's top deals at https://walletwins.shop/deals`;
  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: "welcome",
    recipient_email: normalized,
    status: "pending",
  });
  try {
    await sendLovableEmail(
      {
        to: normalized,
        from: `Wallet Wins <hello@notify.walletwins.shop>`,
        sender_domain: "notify.walletwins.shop",
        subject: template.subject as string,
        html,
        text,
        idempotency_key: `welcome:${normalized}`,
        unsubscribe_token: unsubscribeToken,
        message_id: messageId,
      },
      { apiKey },
    );
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: "welcome",
      recipient_email: normalized,
      status: "sent",
    });
  } catch (err) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: "welcome",
      recipient_email: normalized,
      status: "failed",
      error_message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}