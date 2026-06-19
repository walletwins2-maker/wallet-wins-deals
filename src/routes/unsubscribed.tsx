import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/unsubscribed")({
  component: UnsubscribePage,
  head: () => ({
    meta: [
      { title: "Unsubscribe — Wallet Wins" },
      {
        name: "description",
        content:
          "Unsubscribe from Wallet Wins deal alerts and email updates. Confirm your one-click unsubscribe link to stop future emails.",
      },
      { property: "og:title", content: "Unsubscribe — Wallet Wins" },
      {
        property: "og:description",
        content:
          "Confirm your one-click unsubscribe link to stop future Wallet Wins emails.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type State =
  | { status: "loading" }
  | { status: "confirm" }
  | { status: "already" }
  | { status: "invalid" }
  | { status: "success" }
  | { status: "error"; message: string };

function UnsubscribePage() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") ?? "";
    setToken(t);
    if (!t) {
      setState({ status: "invalid" });
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) return setState({ status: "invalid" });
        if (json.valid) return setState({ status: "confirm" });
        if (json.reason === "already_unsubscribed")
          return setState({ status: "already" });
        setState({ status: "invalid" });
      })
      .catch(() => setState({ status: "error", message: "Network error" }));
  }, []);

  const confirm = async () => {
    setState({ status: "loading" });
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await r.json().catch(() => ({}));
      if (json.success) return setState({ status: "success" });
      if (json.reason === "already_unsubscribed")
        return setState({ status: "already" });
      setState({ status: "error", message: json.error ?? "Could not unsubscribe" });
    } catch {
      setState({ status: "error", message: "Network error" });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold mb-2">Wallet Wins</h1>
        {state.status === "loading" && (
          <p className="text-muted-foreground">Checking your link…</p>
        )}
        {state.status === "confirm" && (
          <>
            <p className="mb-6">Unsubscribe from Wallet Wins emails?</p>
            <button
              onClick={confirm}
              className="rounded-full bg-primary text-primary-foreground px-6 py-2 font-semibold hover:opacity-90"
            >
              Confirm unsubscribe
            </button>
          </>
        )}
        {state.status === "success" && (
          <p>You've been unsubscribed. You won't receive further emails from us.</p>
        )}
        {state.status === "already" && (
          <p>This email is already unsubscribed. No further action needed.</p>
        )}
        {state.status === "invalid" && (
          <p className="text-muted-foreground">
            This unsubscribe link is invalid or has expired.
          </p>
        )}
        {state.status === "error" && (
          <p className="text-destructive">{state.message}</p>
        )}
      </div>
    </main>
  );
}