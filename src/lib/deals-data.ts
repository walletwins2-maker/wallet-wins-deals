export type DealStatus = "pending" | "queued" | "posted" | "expired";

export interface Deal {
  id: string;
  slug: string;
  product_name: string;
  image_url: string;
  product_url: string;
  product_fingerprint: string;
  price: number;
  original_price: number;
  discount: number;
  retailer: string; // slug
  retailer_name: string; // display
  deal_score: number;
  category: string; // slug
  created_at: string;
  status: DealStatus;
}

export interface RawDeal {
  id: number | string;
  slug?: string | null;
  product_name: string | null;
  image_url: string | null;
  product_url: string | null;
  product_fingerprint: string | null;
  price: number | string | null;
  original_price: number | string | null;
  discount: number | string | null;
  retailer: string | null;
  deal_score: number | string | null;
  status: string | null;
  created_at: string | null;
}

export const CATEGORIES = [
  { slug: "electronics", name: "Electronics", emoji: "📱" },
  { slug: "home", name: "Home", emoji: "🏠" },
  { slug: "kitchen", name: "Kitchen", emoji: "🍳" },
  { slug: "fashion", name: "Fashion", emoji: "👗" },
  { slug: "beauty", name: "Beauty", emoji: "💄" },
  { slug: "health", name: "Health", emoji: "💊" },
  { slug: "fitness", name: "Fitness", emoji: "💪" },
  { slug: "toys", name: "Toys", emoji: "🧸" },
  { slug: "baby", name: "Baby", emoji: "🍼" },
  { slug: "pets", name: "Pets", emoji: "🐾" },
  { slug: "outdoor", name: "Outdoor", emoji: "🏕️" },
  { slug: "automotive", name: "Automotive", emoji: "🚗" },
  { slug: "tools", name: "Tools", emoji: "🛠️" },
  { slug: "travel", name: "Travel", emoji: "🧳" },
  { slug: "office", name: "Office", emoji: "🖇️" },
  { slug: "food-beverage", name: "Food & Beverage", emoji: "🛒" },
  { slug: "gaming", name: "Gaming", emoji: "🎮" },
  { slug: "seasonal", name: "Seasonal", emoji: "🎄" },
  { slug: "other", name: "Other", emoji: "🛍️" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
const ALLOWED_CATEGORY_SLUGS = new Set<string>(CATEGORIES.map((c) => c.slug));

// Normalize any incoming category-ish string (retailer feed, CJ/Impact taxonomy,
// legacy slug, etc.) to an approved Wallet Wins category slug.
const CATEGORY_ALIASES: Record<string, CategorySlug> = {
  // legacy / removed slugs
  grocery: "food-beverage",
  "food-and-beverage": "food-beverage",
  food: "food-beverage",
  beverage: "food-beverage",
  drinks: "food-beverage",
  jewelry: "fashion",
  jewellery: "fashion",
  watches: "fashion",
  shoes: "fashion",
  clothing: "fashion",
  apparel: "fashion",
  accessories: "fashion",
  garden: "home",
  "lawn-and-garden": "home",
  furniture: "home",
  bedding: "home",
  decor: "home",
  storage: "home",
  appliances: "home",
  "power-tools": "tools",
  hardware: "tools",
  books: "other",
  media: "other",
  music: "other",
  instruments: "other",
  art: "other",
  crafts: "other",
  "arts-and-crafts": "other",
  videogames: "gaming",
  "video-games": "gaming",
  console: "gaming",
  consoles: "gaming",
  holiday: "seasonal",
  christmas: "seasonal",
  halloween: "seasonal",
  computers: "electronics",
  laptops: "electronics",
  "cell-phones": "electronics",
  audio: "electronics",
  tv: "electronics",
  cookware: "kitchen",
  "small-appliances": "kitchen",
  "sports-and-outdoors": "outdoor",
  sports: "outdoor",
  camping: "outdoor",
  hiking: "outdoor",
  "pet-supplies": "pets",
  "baby-and-kids": "baby",
  kids: "baby",
  skincare: "beauty",
  makeup: "beauty",
  fragrance: "beauty",
  haircare: "beauty",
  supplements: "health",
  wellness: "health",
  vitamins: "health",
  exercise: "fitness",
  workout: "fitness",
  yoga: "fitness",
  "car-and-truck": "automotive",
  auto: "automotive",
  luggage: "travel",
  "school-supplies": "office",
  stationery: "office",
};

export function normalizeCategory(raw: string | null | undefined): CategorySlug {
  if (!raw) return "other";
  const slug = slugifyCat(raw);
  if (ALLOWED_CATEGORY_SLUGS.has(slug)) return slug as CategorySlug;
  if (CATEGORY_ALIASES[slug]) return CATEGORY_ALIASES[slug];
  return "other";
}

function slugifyCat(s: string) {
  return s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const CATEGORY_KEYWORDS: Array<[string, string[]]> = [
  ["electronics", [
    "phone", "smartphone", "laptop", "tablet", "tv", "television", "headphone", "headphones", "earbud", "earbuds",
    "camera", "gopro", "drone", "computer", "pc", "desktop", "monitor", "speaker", "soundbar", "subwoofer",
    "airpod", "airpods", "ipad", "iphone", "macbook",
    "kindle", "router", "modem", "ssd", "hdd", "gpu", "rtx", "keyboard", "mouse", "webcam", "charger", "smartwatch",
    "fitbit", "garmin", "alexa", "echo dot", "ring doorbell", "projector", "printer",
  ]],
  ["gaming", [
    "console", "playstation", "ps5", "ps4", "xbox", "nintendo switch", "nintendo", "gamecube",
    "controller", "gaming chair", "gaming headset", "gaming mouse", "gaming keyboard", "steam deck",
    "video game", "videogame", "vr headset", "oculus", "meta quest",
  ]],
  ["kitchen", [
    "kitchen", "blender", "mixer", "stand mixer", "air fryer", "fryer", "oven", "microwave", "cookware", "bakeware",
    "skillet", "saucepan", "knife", "knives", "cutting board", "coffee maker", "espresso", "french press",
    "toaster", "kettle", "instant pot", "vitamix", "kitchenaid", "dutch oven", "cast iron", "ninja foodi",
    "dishware", "flatware", "silverware", "mug", "drinkware",
  ]],
  ["beauty", [
    "serum", "shampoo", "conditioner", "lotion", "makeup", "skincare", "moisturizer", "cleanser", "toner",
    "cream", "perfume", "cologne", "cosmetic", "lipstick", "lip gloss", "mascara", "eyeliner", "foundation",
    "concealer", "blush", "eyeshadow", "fragrance", "wig", "lace front", "hair extension", "weave", "nail polish",
    "nail kit", "hair dryer", "curling iron", "flat iron", "razor", "shaver", "epilator",
  ]],
  ["fashion", [
    // tops
    "shirt", "t-shirt", "tee", "tshirt", "polo", "blouse", "tank", "tank top", "camisole", "cami", "sweater", "cardigan", "pullover", "sweatshirt", "hoodie", "vest",
    // bottoms
    "pant", "pants", "trouser", "trousers", "chino", "chinos", "jeans", "denim", "shorts", "skirt", "leggings", "joggers", "sweatpants",
    // dresses & sets
    "dress", "gown", "romper", "jumpsuit", "suit", "blazer", "tuxedo",
    // outerwear
    "jacket", "coat", "coats", "overcoat", "trench", "parka", "windbreaker", "raincoat", "puffer",
    // footwear
    "shoe", "shoes", "sneaker", "sneakers", "boot", "boots", "sandal", "sandals", "loafer", "heels", "slipper", "slippers", "flats",
    // accessories & underwear
    "sock", "socks", "tie", "scarf", "belt", "glove", "gloves", "beanie", "cap", "hat", "sunglasses", "watch band", "handbag", "purse", "wallet", "bra", "panties", "underwear", "boxer", "briefs", "swimsuit", "bikini", "lingerie",
    // generic apparel terms
    "apparel", "clothing", "outfit",
  ]],
  ["outdoor", [
    "tent", "camping", "hiking", "backpack", "tumbler", "cooler", "grill", "yeti", "stanley", "fishing",
    "kayak", "paddle", "hammock", "sleeping bag", "trekking", "headlamp", "lantern", "binocular",
  ]],
  ["toys", [
    "lego", "toy", "toys", "doll", "puzzle", "board game", "playset", "plush", "stuffed animal", "nerf",
    "hot wheel", "hot wheels", "barbie", "rc car", "action figure", "building block",
  ]],
  ["fitness", [
    "dumbbell", "kettlebell", "yoga", "treadmill", "elliptical", "rowing machine", "exercise bike",
    "fitness", "workout", "massage gun", "foam roller", "peloton", "resistance band", "pull up bar",
    "weight bench", "barbell",
  ]],
  ["tools", [
    "drill", "power tool", "power tools", "dewalt", "milwaukee", "ryobi", "makita", "tool set",
    "hammer", "wrench", "screwdriver", "circular saw", "miter saw", "table saw", "tool box",
    "lawn mower", "leaf blower", "string trimmer", "hedge trimmer", "chainsaw", "pressure washer",
  ]],
  ["home", [
    "vacuum", "robot vacuum", "mattress", "bedding", "comforter", "sheet set", "duvet", "pillow",
    "rug", "lamp", "ceiling fan", "air purifier", "humidifier", "dehumidifier", "furniture", "sofa",
    "couch", "sectional", "chair", "recliner", "decor", "curtain", "blind",
    "broom", "mop", "storage bin", "shelving", "planter", "patio", "gazebo", "garden hose",
    "bird feeder", "outdoor furniture", "raised bed",
  ]],
  ["pets", [
    "dog", "puppy", "cat", "kitten", "pet", "leash", "collar", "harness", "kibble", "dog food",
    "cat food", "litter box", "litter", "aquarium", "fish tank", "chew toy", "scratching post",
    "crate", "kennel",
  ]],
  ["baby", [
    "baby", "infant", "toddler", "diaper", "diapers", "stroller", "car seat", "crib", "bassinet",
    "pacifier", "onesie", "bib", "high chair", "playpen", "formula", "breast pump", "nursing",
  ]],
  ["health", [
    "vitamin", "vitamins", "supplement", "protein powder", "collagen", "multivitamin", "probiotic",
    "first aid", "thermometer", "blood pressure", "pulse oximeter", "cpap", "heating pad",
    "compression sock", "wellness",
  ]],
  ["food-beverage", [
    "snack", "snacks", "cereal", "granola", "chocolate", "candy", "chips", "popcorn", "beverage",
    "soda", "sparkling water", "tea", "ground coffee", "coffee pod", "k-cup", "olive oil",
    "pasta", "rice", "seasoning", "spice", "sauce", "jerky", "protein bar",
  ]],
  ["automotive", [
    "car", "auto", "automotive", "tire", "tires", "motor oil", "wiper", "wiper blade", "dash cam",
    "jump starter", "car charger", "car mount", "car cover", "car seat cover", "obd", "garage",
  ]],
  ["office", [
    "office", "desk", "office chair", "standing desk", "monitor stand", "filing", "stationery",
    "notebook", "binder", "planner", "stapler", "shredder", "school supply", "school supplies",
    "lunch box", "calculator",
  ]],
  ["travel", [
    "luggage", "suitcase", "carry-on", "carry on", "travel bag", "duffel", "garment bag",
    "packing cube", "travel pillow", "passport holder",
  ]],
  ["seasonal", [
    "christmas", "christmas tree", "ornament", "advent calendar", "halloween", "halloween costume",
    "easter", "thanksgiving", "valentine", "holiday decor", "string lights", "menorah",
  ]],
  ["fashion", [
    "necklace", "bracelet", "earring", "earrings", "pendant", "diamond ring", "gold chain",
    "silver chain", "engagement ring", "wedding band",
  ]],
];

// Retailer-slug → default category. Only used when the title keywords don't match.
const RETAILER_CATEGORY: Record<string, string> = {
  // fashion
  nike: "fashion", adidas: "fashion", puma: "fashion", "under-armour": "fashion",
  gap: "fashion", "old-navy": "fashion", "banana-republic": "fashion",
  nordstrom: "fashion", "nordstrom-rack": "fashion", macys: "fashion", kohls: "fashion",
  uniqlo: "fashion", zara: "fashion", "h-and-m": "fashion", asos: "fashion",
  shein: "fashion", lululemon: "fashion", "frank-eileen": "fashion", "frank-and-eileen": "fashion",
  zapaka: "fashion", "free-people": "fashion", anthropologie: "fashion", "j-crew": "fashion",
  missacc: "fashion", "miss-acc": "fashion",
  madewell: "fashion", everlane: "fashion", reformation: "fashion", "tommy-hilfiger": "fashion",
  "ralph-lauren": "fashion", "calvin-klein": "fashion", levis: "fashion",
  // beauty
  sephora: "beauty", ulta: "beauty", glossier: "beauty", "amanda-hair": "beauty",
  "the-ordinary": "beauty", elf: "beauty", "kiehls": "beauty",
  // home / hardware
  "home-depot": "home", lowes: "home", ikea: "home", wayfair: "home", "west-elm": "home",
  "pottery-barn": "home", "crate-and-barrel": "home", "cb2": "home", "ace-hardware": "home",
  // electronics
  "best-buy": "electronics", newegg: "electronics", bhphotovideo: "electronics", apple: "electronics",
  microcenter: "electronics", samsung: "electronics", lg: "electronics", sony: "electronics",
  bose: "electronics",
  // outdoor
  rei: "outdoor", "dicks-sporting-goods": "outdoor", "bass-pro-shops": "outdoor", patagonia: "outdoor",
  cabelas: "outdoor", "the-north-face": "outdoor", "columbia-sportswear": "outdoor",
  // toys
  "lego-shop": "toys", "toys-r-us": "toys", "build-a-bear": "toys",
  // pets
  chewy: "pets", petco: "pets", petsmart: "pets",
  // baby
  "buy-buy-baby": "baby", carters: "baby", "the-honest-company": "baby",
  // health
  gnc: "health", "vitamin-shoppe": "health", iherb: "health",
  // food & beverage
  "trader-joes": "food-beverage", "whole-foods": "food-beverage",
  instacart: "food-beverage", thrive: "food-beverage",
  // automotive
  autozone: "automotive", "advance-auto-parts": "automotive", "oreilly-auto-parts": "automotive",
  // jewelry → fashion
  "blue-nile": "fashion", "james-allen": "fashion", pandora: "fashion", tiffany: "fashion",
  // travel
  away: "travel", samsonite: "travel", tumi: "travel",
};

// Use word-boundary matching so "shirt" doesn't match "t-shirt"-less strings
// and "tie" doesn't match "tied"/"tier"/etc.
function titleHasWord(title: string, word: string): boolean {
  // Multi-word phrases: simple substring is fine (e.g. "tank top", "lace front").
  if (word.includes(" ") || word.includes("-")) return title.includes(word);
  return new RegExp(`\\b${word}\\b`, "i").test(title);
}

export function deriveCategory(name: string, retailerSlug?: string): string {
  const n = name.toLowerCase();
  // Trusted retailer → category mappings win over title keywords, because
  // titles often contain words that accidentally match other categories
  // (e.g. a Frank & Eileen "Eileen Pan-Collared Shirt" matching "pan" → kitchen).
  if (retailerSlug && RETAILER_CATEGORY[retailerSlug]) return RETAILER_CATEGORY[retailerSlug];
  for (const [slug, words] of CATEGORY_KEYWORDS) {
    if (words.some((w) => titleHasWord(n, w))) return slug;
  }
  return "other";
}

export const categoryBySlug = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const RETAILER_COLORS: Record<string, string> = {
  amazon: "#FF9900",
  walmart: "#0071CE",
  target: "#CC0000",
  "best-buy": "#0046BE",
  nike: "#111111",
  dyson: "#222222",
  macys: "#E21A2C",
  "home-depot": "#F96302",
};
const FALLBACK_PALETTE = ["#22c55e", "#0ea5e9", "#a855f7", "#f59e0b", "#ef4444", "#14b8a6", "#6366f1", "#ec4899"];

function hashColor(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return FALLBACK_PALETTE[h % FALLBACK_PALETTE.length];
}

function prettyName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export interface RetailerInfo {
  slug: string;
  name: string;
  color: string;
}

export function retailerInfo(raw: string): RetailerInfo {
  const slug = slugify(raw);
  return {
    slug,
    name: prettyName(slug),
    color: RETAILER_COLORS[slug] ?? hashColor(slug),
  };
}

export function retailerBySlug(slug: string, deals?: Deal[]): RetailerInfo | undefined {
  if (deals) {
    const hit = deals.find((d) => d.retailer === slug);
    if (hit) return { slug, name: hit.retailer_name, color: RETAILER_COLORS[slug] ?? hashColor(slug) };
  }
  if (RETAILER_COLORS[slug]) {
    return { slug, name: prettyName(slug), color: RETAILER_COLORS[slug] };
  }
  return undefined;
}

function asNumber(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : v == null ? NaN : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asStatus(s: string | null): DealStatus {
  if (s === "pending" || s === "queued" || s === "posted" || s === "expired") return s;
  return "queued";
}

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=80";

export function mapRawDeals(rows: RawDeal[]): Deal[] {
  return rows
    .filter((r) => r.product_name && r.product_url)
    .map((r): Deal => {
      const price = asNumber(r.price);
      const original = asNumber(r.original_price, price);
      const computedDiscount =
        original > 0 && original > price ? Math.round(((original - price) / original) * 100) : 0;
      const discount = Math.max(asNumber(r.discount), computedDiscount);
      const retailerRaw = r.retailer ?? "unknown";
      const info = retailerInfo(retailerRaw);
      const name = r.product_name ?? "Untitled deal";
      return {
        id: String(r.id),
        slug: r.slug ?? String(r.id),
        product_name: name,
        image_url: r.image_url ?? PLACEHOLDER_IMG,
        product_url: r.product_url ?? "#",
        product_fingerprint: r.product_fingerprint ?? String(r.id),
        price,
        original_price: original,
        discount,
        retailer: info.slug,
        retailer_name: info.name,
        deal_score: Math.round(asNumber(r.deal_score)),
        category: deriveCategory(name, info.slug),
        created_at: r.created_at ?? new Date().toISOString(),
        status: asStatus(r.status),
      };
    });
}

/* ---------- helpers operating on a deals array ---------- */

export const activeDeals = (deals: Deal[]) =>
  deals.filter((d) => d.status !== "expired");

export function dealById(deals: Deal[], id: string) {
  return deals.find((d) => d.id === id);
}

export function dealsByRetailer(deals: Deal[], slug: string) {
  return activeDeals(deals).filter((d) => d.retailer === slug);
}

export function dealsByCategory(deals: Deal[], slug: string) {
  return activeDeals(deals).filter((d) => d.category === slug);
}

export function topDeals(deals: Deal[], limit = 8) {
  return [...activeDeals(deals)]
    .sort((a, b) => b.deal_score - a.deal_score || b.discount - a.discount)
    .slice(0, limit);
}

export function recentDrops(deals: Deal[], limit = 8) {
  return [...activeDeals(deals)]
    .sort(
      (a, b) =>
        b.discount - a.discount ||
        +new Date(b.created_at) - +new Date(a.created_at),
    )
    .slice(0, limit);
}

export function relatedDeals(deals: Deal[], deal: Deal, limit = 4) {
  return activeDeals(deals)
    .filter((d) => d.id !== deal.id && d.category === deal.category)
    .slice(0, limit);
}

export function moreFromRetailer(deals: Deal[], deal: Deal, limit = 4) {
  return activeDeals(deals)
    .filter((d) => d.id !== deal.id && d.retailer === deal.retailer)
    .slice(0, limit);
}

export function searchDeals(deals: Deal[], q: string) {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  return activeDeals(deals).filter((d) => {
    const cat = categoryBySlug(d.category)?.name.toLowerCase() ?? "";
    return (
      d.product_name.toLowerCase().includes(term) ||
      d.retailer_name.toLowerCase().includes(term) ||
      cat.includes(term)
    );
  });
}

export function topRetailers(deals: Deal[], limit = 8): Array<RetailerInfo & { count: number }> {
  const map = new Map<string, { info: RetailerInfo; count: number }>();
  for (const d of activeDeals(deals)) {
    const cur = map.get(d.retailer);
    if (cur) cur.count++;
    else map.set(d.retailer, { info: { slug: d.retailer, name: d.retailer_name, color: RETAILER_COLORS[d.retailer] ?? hashColor(d.retailer) }, count: 1 });
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ info, count }) => ({ ...info, count }));
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

// Legacy export for code that wants a static list (kept for Footer fallback)
export const RETAILERS: RetailerInfo[] = Object.entries(RETAILER_COLORS).map(
  ([slug, color]) => ({ slug, name: prettyName(slug), color }),
);