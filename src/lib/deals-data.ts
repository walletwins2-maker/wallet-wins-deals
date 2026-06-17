export type DealStatus = "pending" | "queued" | "posted" | "expired";

export interface Deal {
  id: string;
  product_name: string;
  image_url: string;
  product_url: string;
  price: number;
  original_price: number;
  discount: number; // percent
  retailer: string;
  deal_score: number; // 0-100
  category: string;
  created_at: string; // ISO
  status: DealStatus;
}

export const RETAILERS = [
  { slug: "amazon", name: "Amazon", color: "#FF9900" },
  { slug: "walmart", name: "Walmart", color: "#0071CE" },
  { slug: "target", name: "Target", color: "#CC0000" },
  { slug: "best-buy", name: "Best Buy", color: "#0046BE" },
  { slug: "nike", name: "Nike", color: "#111111" },
  { slug: "dyson", name: "Dyson", color: "#222222" },
  { slug: "macys", name: "Macy's", color: "#E21A2C" },
  { slug: "home-depot", name: "Home Depot", color: "#F96302" },
];

export const CATEGORIES = [
  { slug: "electronics", name: "Electronics", emoji: "📱" },
  { slug: "home", name: "Home", emoji: "🏠" },
  { slug: "kitchen", name: "Kitchen", emoji: "🍳" },
  { slug: "beauty", name: "Beauty", emoji: "💄" },
  { slug: "fashion", name: "Fashion", emoji: "👗" },
  { slug: "outdoor", name: "Outdoor", emoji: "🏕️" },
  { slug: "toys", name: "Toys", emoji: "🧸" },
  { slug: "fitness", name: "Fitness", emoji: "💪" },
];

export const retailerBySlug = (slug: string) =>
  RETAILERS.find((r) => r.slug === slug);
export const categoryBySlug = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);
export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const img = (q: string, seed: number) =>
  `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=900&q=80&sig=${seed}`;

function makeDeal(
  id: string,
  product_name: string,
  image_url: string,
  retailer: string,
  category: string,
  original_price: number,
  price: number,
  deal_score: number,
  daysAgo = 0,
): Deal {
  const discount = Math.round(((original_price - price) / original_price) * 100);
  return {
    id,
    product_name,
    image_url,
    product_url: `https://example.com/aff/${id}`,
    price,
    original_price,
    discount,
    retailer,
    deal_score,
    category,
    created_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    status: "queued",
  };
}

export const DEALS: Deal[] = [
  makeDeal("d1", "Apple AirPods Pro (2nd Gen) USB-C", img("1606220588913-b3aacb4d2f46", 1), "amazon", "electronics", 249, 169, 96, 0),
  makeDeal("d2", "Dyson V11 Cordless Vacuum", img("1581578731548-c64695cc6952", 2), "dyson", "home", 599, 399, 92, 1),
  makeDeal("d3", "Nike Pegasus 41 Running Shoes", img("1542291026-7eec264c27ff", 3), "nike", "fashion", 140, 89, 88, 0),
  makeDeal("d4", "Sony WH-1000XM5 Headphones", img("1583394838336-acd977736f90", 4), "best-buy", "electronics", 399, 279, 94, 0),
  makeDeal("d5", "Instant Pot Duo 7-in-1 6Qt", img("1585515320310-259814833e62", 5), "walmart", "kitchen", 119, 59, 85, 2),
  makeDeal("d6", "Ninja Air Fryer Max XL", img("1626808642875-0aa545482dfb", 6), "target", "kitchen", 169, 99, 82, 1),
  makeDeal("d7", "Patagonia Nano Puff Jacket", img("1551028719-00167b16eac5", 7), "macys", "outdoor", 229, 149, 78, 3),
  makeDeal("d8", "DeWalt 20V Cordless Drill Kit", img("1581244277943-fe4a9c777189", 8), "home-depot", "home", 199, 119, 86, 0),
  makeDeal("d9", "iPad Air 11\" M2 128GB", img("1561154464-82e9adf32764", 9), "amazon", "electronics", 599, 499, 90, 0),
  makeDeal("d10", "LEGO Star Wars Millennium Falcon", img("1587654780291-39c9404d746b", 10), "walmart", "toys", 169, 109, 80, 2),
  makeDeal("d11", "Bombas Merino Wool Socks 4-Pack", img("1586350977771-2a1dad1c4eea", 11), "macys", "fashion", 80, 48, 70, 4),
  makeDeal("d12", "Theragun Mini Massage Device", img("1571019613454-1cb2f99b2d8b", 12), "best-buy", "fitness", 199, 129, 84, 1),
  makeDeal("d13", "Yeti Rambler 30oz Tumbler", img("1605000797499-95a51c5269ae", 13), "amazon", "outdoor", 38, 27, 65, 0),
  makeDeal("d14", "Vitamix 5200 Blender", img("1570222094114-d054a817e56b", 14), "target", "kitchen", 549, 379, 88, 5),
  makeDeal("d15", "Olaplex No.3 Hair Perfector", img("1556228720-195a672e8a03", 15), "amazon", "beauty", 30, 18, 72, 0),
  makeDeal("d16", "Adidas Ultraboost 22", img("1542291026-7eec264c27ff", 16), "nike", "fashion", 190, 119, 79, 2),
  makeDeal("d17", "Samsung 65\" QLED 4K TV", img("1593359677879-a4bb92f829d1", 17), "best-buy", "electronics", 1299, 799, 95, 1),
  makeDeal("d18", "KitchenAid Stand Mixer", img("1556909114-f6e7ad7d3136", 18), "target", "kitchen", 449, 279, 90, 0),
  makeDeal("d19", "Coleman 6-Person Tent", img("1504280390367-361c6d9f38f4", 19), "amazon", "outdoor", 199, 129, 76, 3),
  makeDeal("d20", "Bose QuietComfort Earbuds II", img("1606220838315-056192d5e927", 20), "best-buy", "electronics", 299, 199, 87, 0),
  makeDeal("d21", "Peloton Dumbbells 5lb Pair", img("1571019614242-c5c5dee9f50b", 21), "amazon", "fitness", 95, 59, 68, 4),
  makeDeal("d22", "Roomba j7+ Robot Vacuum", img("1581578731548-c64695cc6952", 22), "amazon", "home", 799, 499, 91, 1),
  makeDeal("d23", "Lululemon Align Leggings", img("1551803091-e20673f15770", 23), "macys", "fashion", 98, 69, 71, 2),
  makeDeal("d24", "Drunk Elephant Vitamin C Serum", img("1556228720-195a672e8a03", 24), "macys", "beauty", 80, 52, 74, 0),
  makeDeal("d25", "Hot Wheels 50-Car Pack", img("1558877385-8c1d9a4f4f6f", 25), "walmart", "toys", 55, 32, 66, 5),
  makeDeal("d26", "Weber Genesis Gas Grill", img("1555939594-58d7cb561ad1", 26), "home-depot", "outdoor", 999, 699, 89, 1),
  makeDeal("d27", "Apple Watch Series 10 GPS", img("1546868871-7041f2a55e12", 27), "amazon", "electronics", 399, 329, 83, 0),
  makeDeal("d28", "Stanley Quencher 40oz Tumbler", img("1605000797499-95a51c5269ae", 28), "target", "outdoor", 45, 29, 73, 2),
  makeDeal("d29", "Crocs Classic Clog", img("1542291026-7eec264c27ff", 29), "amazon", "fashion", 50, 32, 64, 3),
  makeDeal("d30", "GoPro HERO12 Black", img("1502920917128-1aa500764cbd", 30), "best-buy", "electronics", 399, 299, 86, 1),
];

export const activeDeals = () =>
  DEALS.filter((d) => d.status === "pending" || d.status === "queued");

export function dealById(id: string) {
  return DEALS.find((d) => d.id === id);
}

export function dealsByRetailer(slug: string) {
  return activeDeals().filter((d) => d.retailer === slug);
}

export function dealsByCategory(slug: string) {
  return activeDeals().filter((d) => d.category === slug);
}

export function topDeals(limit = 8) {
  return [...activeDeals()].sort((a, b) => b.deal_score - a.deal_score).slice(0, limit);
}

export function recentDrops(limit = 8) {
  return [...activeDeals()]
    .sort((a, b) => b.discount - a.discount || +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, limit);
}

export function relatedDeals(deal: Deal, limit = 4) {
  return activeDeals()
    .filter((d) => d.id !== deal.id && d.category === deal.category)
    .slice(0, limit);
}

export function moreFromRetailer(deal: Deal, limit = 4) {
  return activeDeals()
    .filter((d) => d.id !== deal.id && d.retailer === deal.retailer)
    .slice(0, limit);
}

export function searchDeals(q: string) {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  return activeDeals().filter((d) => {
    const ret = retailerBySlug(d.retailer)?.name.toLowerCase() ?? "";
    const cat = categoryBySlug(d.category)?.name.toLowerCase() ?? "";
    return (
      d.product_name.toLowerCase().includes(term) ||
      ret.includes(term) ||
      cat.includes(term)
    );
  });
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}