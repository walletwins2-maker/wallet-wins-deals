import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { CATEGORIES, RETAILERS } from "@/lib/deals-data";
import { fetchDealsServer } from "@/lib/deals.functions";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let deals: Array<{ id: string }> = [];
        try {
          deals = await fetchDealsServer();
        } catch {
          deals = [];
        }
        const paths = [
          "/",
          "/deals",
          ...CATEGORIES.map((c) => `/category/${c.slug}`),
          ...RETAILERS.map((r) => `/retailer/${r.slug}`),
          ...deals.map((d) => `/deal/${(d as { slug?: string }).slug ?? (d as { id: string }).id}`),
        ];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...paths.map(
            (p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>daily</changefreq></url>`,
          ),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});