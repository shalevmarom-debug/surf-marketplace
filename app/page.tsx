import { supabase } from "@/lib/supabaseClient";
import { searchQueryToTokens } from "@/lib/normalize";
import { HomeClient } from "@/components/HomeClient";
import { Suspense } from "react";

type Listing = {
  id: string;
  title: string;
  price_ils: number | null;
  city?: string | null;
  city_he?: string | null;
  city_other?: string | null;
  region: string;
  board_type: string;
  condition: string;
  fin_setup: string | null;
  construction: string | null;
  brand?: string | null;
  brand_raw?: string | null;
  sold_at?: string | null;
  created_at: string;
  listing_images?: { storage_path: string; sort_order: number; is_primary?: boolean }[] | null;
  length_ft?: number | null;
  volume_l?: number | null;
};

function getDisplayCity(listing: Listing): string {
  return listing.city_he !== "אחר" ? (listing.city_he ?? listing.city ?? "") : (listing.city_other?.trim() || "אחר");
}
type ListingWithImage = Listing & { primaryImageUrl: string | null; displayCity: string };
type HomeProps = {
  searchParams?: Promise<{
    region?: string;
    city?: string;
    boardType?: string;
    condition?: string;
    finSetup?: string;
    construction?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    q?: string;
    includeSold?: string;
    sort?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = (await searchParams) ?? {};
  const region = params.region ?? "";
  const city = params.city ?? "";
  const boardType = params.boardType ?? "";
  const condition = params.condition ?? "";
  const finSetup = params.finSetup ?? "";
  const construction = params.construction ?? "";
  const brand = params.brand ?? "";
  const minPrice = params.minPrice ?? "";
  const maxPrice = params.maxPrice ?? "";
  const q = (params.q ?? "").trim();
  const includeSold = params.includeSold === "1" || params.includeSold === "true";
  const sort = params.sort ?? "newest";

  const baseListingsQuery = supabase
    .from("listings")
    .select("city_he, city_other")
    .limit(10000);
  const visibilityQuery = includeSold ? baseListingsQuery : baseListingsQuery.is("sold_at", null);
  const { data: cityRows } = await visibilityQuery;
  const displayCityCounts = new Map<string, number>();
  for (const row of cityRows ?? []) {
    const ch = (row as { city_he?: string | null; city_other?: string | null }).city_he;
    const co = (row as { city_he?: string | null; city_other?: string | null }).city_other;
    const cityLabel = ch !== "אחר" ? (ch ?? "") : (co?.trim() || "אחר");
    if (!cityLabel) continue;
    displayCityCounts.set(cityLabel, (displayCityCounts.get(cityLabel) ?? 0) + 1);
  }
  const citiesWithCount: { city: string; count: number }[] = Array.from(displayCityCounts.entries())
    .filter(([, count]) => count > 0)
    .map(([cityName, count]) => ({ city: cityName, count }))
    .sort((a, b) => b.count - a.count);

  let query = supabase
    .from("listings")
    .select(
      "id, title, price_ils, city, city_he, city_other, region, board_type, condition, fin_setup, construction, brand, brand_raw, sold_at, created_at, length_ft, volume_l, listing_images(storage_path, sort_order, is_primary)"
    )
    .limit(48);

  if (sort === "price_asc") query = query.order("price_ils", { ascending: true, nullsFirst: false });
  else if (sort === "price_desc") query = query.order("price_ils", { ascending: false, nullsFirst: true });
  else query = query.order("created_at", { ascending: false });

  if (!includeSold) query = query.is("sold_at", null);
  if (region) query = query.eq("region", region);
  if (boardType) query = query.eq("board_type", boardType);
  if (condition) query = query.eq("condition", condition);
  if (finSetup) query = query.eq("fin_setup", finSetup);
  if (construction) query = query.eq("construction", construction);
  if (city) {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    query = query.or(`city_he.eq.${esc(city)},and(city_he.eq.${esc("אחר")},city_other.eq.${esc(city)})`);
  }
  if (brand) query = query.or(`brand.ilike.%${brand}%,brand_raw.ilike.%${brand}%`);
  if (minPrice) query = query.gte("price_ils", Number(minPrice));
  if (maxPrice) query = query.lte("price_ils", Number(maxPrice));
  if (q) {
    const tokens = searchQueryToTokens(q);
    const parts: string[] = [];
    if (tokens.normal) parts.push(`search_compact.ilike.%${tokens.normal.replace(/%/g, "\\%")}%`);
    if (tokens.compact && tokens.compact !== tokens.normal) parts.push(`search_compact.ilike.%${tokens.compact.replace(/%/g, "\\%")}%`);
    if (parts.length) query = query.or(parts.join(","));
  }

  const { data, error } = await query;
  const listings: Listing[] = data ?? [];

  const listingsWithImage: ListingWithImage[] = listings.map((row) => {
    const listing = row as Listing;
    const images = listing.listing_images ?? [];
    const sorted = [...images].sort(
      (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order
    );
    const first = sorted[0];
    const primaryImageUrl = first
      ? supabase.storage.from("listing-images").getPublicUrl(first.storage_path).data.publicUrl
      : null;
    return { ...listing, primaryImageUrl, displayCity: getDisplayCity(listing) };
  });
  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Subtle gradient wave at top */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-48 bg-gradient-to-b from-[var(--surf-muted)]/30 to-transparent" aria-hidden />

      <section className="relative mx-auto max-w-7xl px-4 py-4 md:py-8">
        {/* Hero - desktop only, reduced height */}
        <div className="mb-6 hidden text-center md:block">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-[var(--foreground)] lg:text-4xl">
            Find your next surfboard in Israel
          </h1>
          <p className="mx-auto max-w-2xl text-base text-[var(--surf-muted-text)]">
            Browse boards from all over Israel. Filter by city, type, price and more.
          </p>
        </div>

        <Suspense fallback={<p className="text-[var(--surf-muted-text)]">Loading…</p>}>
          <HomeClient
            listingsWithImage={listingsWithImage}
            error={!!error}
            citiesWithCount={citiesWithCount}
            defaultRegion={region}
            defaultCity={city}
            defaultBoardType={boardType}
            defaultCondition={condition}
            defaultFinSetup={finSetup}
            defaultConstruction={construction}
            defaultBrand={brand}
            defaultMinPrice={minPrice}
            defaultMaxPrice={maxPrice}
            defaultQ={q}
            defaultIncludeSold={includeSold}
            defaultSort={sort}
          />
        </Suspense>
      </section>
    </main>
  );
}