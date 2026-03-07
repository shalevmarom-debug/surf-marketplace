/**
 * Fixed demo dataset for surfboard listings.
 * ~120 listings – DO NOT generate random data; use this file only so UI/filters behave the same each time.
 * Matches New Listing form fields exactly.
 */

export const DEMO_PLACEHOLDER_IMAGE_URLS: string[] = [
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
  "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800",
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
  "https://images.unsplash.com/photo-1580748142664-b93e8d3d2f5f?w=800",
  "https://images.unsplash.com/photo-1569929233549-8d6d2c962b4f?w=800",
  "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
  "https://images.unsplash.com/photo-1590559899731-a45b0c4d01c7?w=800",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
  "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800",
  "https://images.unsplash.com/photo-1520454974749-2b9f2b1a1b6d?w=800",
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
];

export type DemoListing = {
  title: string;
  description: string;
  price_ils: number;
  city_he: string;
  city_other: string | null;
  region: "North" | "Center" | "South";
  board_type: "Shortboard" | "Fish" | "Funboard" | "Longboard" | "Softboard" | "Midlength" | "Other";
  brand: string;
  length_ft: number;
  volume_l: number;
  condition: string;
  fin_setup: string | null;
  construction: string | null;
  whatsapp_phone: string;
  repairs: boolean;
  fins_included: boolean;
  /** Fixed indices into DEMO_PLACEHOLDER_IMAGE_URLS (0–14). Length 0, 1, or 3–5. */
  imageIndices: number[];
};

/** Cities by region (Hebrew, must exist in CITY_OPTIONS_FOR_FORM / israel_cities_he) */
const CITIES = {
  North: ["חיפה", "נהרייה", "עכו", "נתניה", "חדרה", "קריית ים", "קריית מוצקין", "כרמיאל"],
  Center: ["תל אביב - יפו", "הרצליה", "בת ים", "ראשון לציון", "חולון", "פתח תקווה", "רעננה", "כפר סבא"],
  South: ["אשדוד", "אשקלון", "יבנה", "גן יבנה", "שדרות", "באר שבע"],
} as const;

const BRANDS = [
  "Channel Islands", "Lost", "JS", "Firewire", "Pyzel", "DHD", "Sharpeye", "HaydenShapes",
  "Torq", "Softech", "NSP", "Modern", "Catch Surf", "Rusty", "Album", "Local Shaper", "Custom",
];

const CONDITIONS = [
  "New / Unridden", "Like New", "Great Shape", "Used (Normal)", "Needs Love", "Project Board",
] as const;

const FIN_SETUPS = ["Thruster", "Quad", "Twin", "Single", "Five-fin"] as const;
const CONSTRUCTIONS = ["PU", "EPS", "Epoxy", "Soft"] as const;

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

/** Deterministic phone: +972 50 + 6 digits from seed */
function phone(seed: number): string {
  const n = 500000000 + (seed % 5000000);
  return `+972${n}`;
}

let listingIndex = 0;
function nextListing(
  overrides: Partial<DemoListing> & { board_type: DemoListing["board_type"]; region: "North" | "Center" | "South" }
): DemoListing {
  const i = listingIndex++;
  const region = overrides.region;
  const cityList = CITIES[region];
  const city_he = overrides.city_he ?? cityList[i % cityList.length];
  const board_type = overrides.board_type;
  const brand = overrides.brand ?? pick(BRANDS, i);
  const condition = overrides.condition ?? pick(CONDITIONS, i);
  const repairs = overrides.repairs ?? (i % 5 === 2);
  const fins_included = overrides.fins_included ?? (i % 3 !== 1);
  const imageCount = overrides.imageIndices !== undefined
    ? overrides.imageIndices.length
    : [0, 0, 0, 1, 1, 3, 3, 4, 5][i % 9];
  const imageIndices = overrides.imageIndices !== undefined
    ? overrides.imageIndices
    : (imageCount === 0 ? [] : Array.from({ length: imageCount }, (_, j) => (i + j) % 15));

  return {
    ...overrides,
    title: overrides.title ?? "Surfboard",
    description: overrides.description ?? "",
    price_ils: overrides.price_ils ?? 2000,
    city_he,
    city_other: overrides.city_other ?? null,
    region,
    board_type,
    brand,
    length_ft: overrides.length_ft ?? 6,
    volume_l: overrides.volume_l ?? 35,
    condition,
    fin_setup: overrides.fin_setup ?? pick(FIN_SETUPS, i),
    construction: overrides.construction ?? pick(CONSTRUCTIONS, i),
    whatsapp_phone: overrides.whatsapp_phone ?? phone(i * 31),
    repairs,
    fins_included,
    imageIndices,
  };
}

/** Build the fixed dataset: 30 Shortboard, 20 Fish, 20 Longboard, 20 Funboard, 15 Midlength, 10 Softboard, 5 Other (SUP). */
export function buildDemoListings(): DemoListing[] {
  listingIndex = 0;
  const list: DemoListing[] = [];

  // --- Shortboards (30) ---
  for (let k = 0; k < 30; k++) {
    const i = list.length;
    const length_ft = 5.4 + (k * 0.04) % 1.4;
    const volume_l = 22 + (k * 2) % 16;
    const price_ils = 700 + (k * 100) % 3500;
    list.push(nextListing({
      board_type: "Shortboard",
      region: pick(["North", "Center", "South"], i),
      title: k % 3 === 0
        ? `Lost Shortboard ${length_ft.toFixed(1)}' good condition`
        : k % 3 === 1
          ? "Channel Islands shortboard barely used"
          : "גלשן שורטבורד במצב טוב",
      description: "Great board for small summer waves. Selling because I upgraded.",
      price_ils: Math.min(4200, Math.max(700, price_ils)),
      length_ft: Math.round(length_ft * 10) / 10,
      volume_l,
      imageIndices: k % 4 === 0 ? [] : k % 4 === 1 ? [0] : [1, 2, 3].slice(0, 2 + (k % 3)),
    }));
  }

  // --- Fish (20) ---
  for (let k = 0; k < 20; k++) {
    const i = list.length;
    const length_ft = 5.2 + (k * 0.06) % 1.2;
    const volume_l = 28 + (k * 2) % 17;
    const price_ils = 900 + (k * 120) % 2600;
    list.push(nextListing({
      board_type: "Fish",
      region: pick(["North", "Center", "South"], i),
      title: k % 2 === 0 ? `Fish surfboard ${length_ft.toFixed(1)}' fast and fun` : "גלשן פיש 5.6 במצב טוב",
      description: "Fast and loose fish. Minor pressure dents but no repairs.",
      price_ils: Math.min(3500, Math.max(900, price_ils)),
      length_ft: Math.round(length_ft * 10) / 10,
      volume_l,
      imageIndices: k % 5 === 0 ? [] : [4, 5, 6].slice(0, 1 + (k % 3)),
    }));
  }

  // --- Longboards (20) ---
  for (let k = 0; k < 20; k++) {
    const i = list.length;
    const length_ft = 8 + (k * 0.08) % 1.6;
    const volume_l = 55 + (k * 3) % 35;
    const price_ils = 1500 + (k * 200) % 4500;
    list.push(nextListing({
      board_type: "Longboard",
      region: pick(["North", "Center", "South"], i),
      title: k % 2 === 0 ? `Longboard ${length_ft.toFixed(1)}' classic log` : "גלשן לונגבורד 9 פיט",
      description: "Classic log longboard, great glide.",
      price_ils: Math.min(6000, Math.max(1500, price_ils)),
      length_ft: Math.round(length_ft * 10) / 10,
      volume_l,
      imageIndices: k % 3 === 0 ? [] : [7, 8, 9, 10].slice(0, 2 + (k % 3)),
    }));
  }

  // --- Funboards (20) ---
  for (let k = 0; k < 20; k++) {
    const i = list.length;
    const length_ft = 6.4 + (k * 0.08) % 1.6;
    const volume_l = 40 + (k * 2) % 25;
    const price_ils = 1000 + (k * 150) % 3000;
    list.push(nextListing({
      board_type: "Funboard",
      region: pick(["North", "Center", "South"], i),
      title: k % 2 === 0 ? `Funboard ${length_ft.toFixed(1)}' all-rounder` : "גלשן פנבורד למתחילים",
      description: "Perfect for small to medium waves. Very forgiving.",
      price_ils: Math.min(4000, Math.max(1000, price_ils)),
      length_ft: Math.round(length_ft * 10) / 10,
      volume_l,
      imageIndices: k % 4 === 0 ? [] : [2, 3, 4].slice(0, 1 + (k % 3)),
    }));
  }

  // --- Midlength (15) ---
  for (let k = 0; k < 15; k++) {
    const i = list.length;
    const length_ft = 6.6 + (k * 0.1) % 1.6;
    const volume_l = 40 + (k * 2) % 25;
    const price_ils = 1200 + (k * 180) % 2800;
    list.push(nextListing({
      board_type: "Midlength",
      region: pick(["North", "Center", "South"], i),
      title: `Midlength ${length_ft.toFixed(1)}' easy paddling`,
      description: "Barely used. Comes with fins.",
      price_ils: Math.min(4000, Math.max(1000, price_ils)),
      length_ft: Math.round(length_ft * 10) / 10,
      volume_l,
      imageIndices: k % 3 === 0 ? [] : [5, 6, 7],
    }));
  }

  // --- Softboard (10) ---
  for (let k = 0; k < 10; k++) {
    const i = list.length;
    const length_ft = 6 + (k * 0.3) % 3;
    const volume_l = 45 + (k * 4) % 40;
    const price_ils = 400 + (k * 120) % 1400;
    list.push(nextListing({
      board_type: "Softboard",
      region: pick(["North", "Center", "South"], i),
      title: k % 2 === 0 ? "Beginner soft top 7ft" : "גלשן למתחילים 7 פיט",
      description: "Perfect beginner board, very stable.",
      price_ils: Math.min(1800, Math.max(400, price_ils)),
      length_ft: Math.round(length_ft * 10) / 10,
      volume_l,
      construction: "Soft",
      imageIndices: k % 2 === 0 ? [8] : [8, 9, 10],
    }));
  }

  // --- Other / SUP (5) ---
  for (let k = 0; k < 5; k++) {
    const i = list.length;
    const length_ft = 8 + (k * 0.6) % 3;
    const volume_l = 95 + (k * 15) % 85;
    const price_ils = 2000 + (k * 800) % 6000;
    list.push(nextListing({
      board_type: "Other",
      region: pick(["North", "Center", "South"], i),
      title: `SUP board ${length_ft.toFixed(1)}' touring`,
      description: "Stand-up paddle board, great condition.",
      price_ils: Math.min(8000, Math.max(3000, price_ils)),
      length_ft: Math.round(length_ft * 10) / 10,
      volume_l,
      imageIndices: [11, 12, 13],
    }));
  }

  return list;
}

export const DEMO_LISTINGS: DemoListing[] = buildDemoListings();

if (DEMO_LISTINGS.length !== 120) {
  throw new Error(`Expected 120 demo listings, got ${DEMO_LISTINGS.length}`);
}
