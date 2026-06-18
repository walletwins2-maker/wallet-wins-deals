import { useState } from "react";
import { Mail } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletterServer } from "@/lib/deals.functions";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const subscribe = useServerFn(subscribeNewsletterServer);

  return (
    <section className="mx-auto mt-16 max-w-5xl rounded-3xl bg-gradient-hero px-6 py-12 text-center text-white shadow-elegant sm:px-12">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10 backdrop-blur">
        <Mail className="h-7 w-7 text-primary" />
      </div>
      <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">Never Miss a Deal</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
        Get the hottest discounts and price drops delivered to your inbox every morning.
      </p>
      <form
        className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setError(null);
          setBusy(true);
          try {
            const res = await subscribe({
              data: {
                email,
                source_page: typeof window !== "undefined" ? window.location.pathname : undefined,
              },
            });
            if (res.ok) setDone(true);
            else setError(res.error ?? "Something went wrong.");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="h-12 flex-1 rounded-full bg-white/10 px-5 text-sm text-white placeholder:text-white/50 outline-none ring-1 ring-white/20 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={busy || done}
          className="h-12 rounded-full bg-gradient-primary px-6 text-sm font-bold text-primary-foreground shadow-card-hover transition hover:brightness-110"
        >
          {done ? "Subscribed!" : busy ? "..." : "Subscribe"}
        </button>
      </form>
      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
    </section>
  );
}