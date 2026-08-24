import { supabase } from "@/lib/supabaseClient";
import { HomeClient } from "@/components/HomeClient";
import { Suspense } from "react";
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";

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

const LISTING_COLUMNS =
  "id, title, price_ils, city, city_he, city_other, region, board_type, condition, fin_setup, construction, brand, brand_raw, sold_at, created_at, length_ft, volume_l";

type ListingFilters = {
  region: string;
  city: string;
  boardType: string;
  condition: string;
  finSetup: string;
  construction: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  includeSold: boolean;
  sort: string;
};

type ListingsQuery = PostgrestFilterBuilder<any, any, any, any, any>;

function getDisplayCity(listing: Listing): string {
  return listing.city_he !== "אחר" ? (listing.city_he ?? listing.city ?? "") : (listing.city_other?.trim() || "אחר");
}

function applyListingFilters(query: ListingsQuery, filters: ListingFilters): ListingsQuery {
  let q = query;
  if (filters.sort === "price_asc") q = q.order("price_ils", { ascending: true, nullsFirst: false });
  else if (filters.sort === "price_desc") q = q.order("price_ils", { ascending: false, nullsFirst: true });
  else q = q.order("created_at", { ascending: false });

  if (!filters.includeSold) q = q.is("sold_at", null);
  if (filters.region) q = q.eq("region", filters.region);
  if (filters.boardType) q = q.eq("board_type", filters.boardType);
  if (filters.condition) q = q.eq("condition", filters.condition);
  if (filters.finSetup) q = q.eq("fin_setup", filters.finSetup);
  if (filters.construction) q = q.eq("construction", filters.construction);
  if (filters.city) {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    q = q.or(`city_he.eq.${esc(filters.city)},and(city_he.eq.${esc("אחר")},city_other.eq.${esc(filters.city)})`);
  }
  if (filters.brand) q = q.or(`brand.ilike.%${filters.brand}%,brand_raw.ilike.%${filters.brand}%`);
  if (filters.minPrice) q = q.gte("price_ils", Number(filters.minPrice));
  if (filters.maxPrice) q = q.lte("price_ils", Number(filters.maxPrice));
  return q;
}

async function fetchListings(filters: ListingFilters): Promise<{ data: Listing[] | null; errorMessage: string | null }> {
  const withImages = applyListingFilters(
    supabase
      .from("listings")
      .select(`${LISTING_COLUMNS}, listing_images(storage_path, sort_order, is_primary)`)
      .limit(48),
    filters
  );

  const { data, error } = await withImages;
  if (!error) {
    return { data: (data ?? []) as Listing[], errorMessage: null };
  }

  console.error("[feed] listings query with images failed:", error.message);

  const withoutImages = applyListingFilters(
    supabase.from("listings").select(LISTING_COLUMNS).limit(48),
    filters
  );

  const fallback = await withoutImages;
  if (!fallback.error) {
    return { data: (fallback.data ?? []) as Listing[], errorMessage: null };
  }

  console.error("[feed] listings query without images failed:", fallback.error.message);
  return { data: null, errorMessage: fallback.error.message };
}

async function fetchCityCounts(includeSold: boolean): Promise<{ city: string; count: number }[]> {
  const base = supabase.from("listings").select("city_he, city_other, city").limit(10000);
  const query = includeSold ? base : base.is("sold_at", null);
  const { data: cityRows, error } = await query;

  const displayCityCounts = new Map<string, number>();
  for (const row of cityRows ?? []) {
    const r = row as { city_he?: string | null; city_other?: string | null; city?: string | null };
    const cityLabel =
      r.city_he != null
        ? r.city_he !== "אחר"
          ? r.city_he
          : r.city_other?.trim() || "אחר"
        : r.city?.trim() || "";
    if (!cityLabel) continue;
    displayCityCounts.set(cityLabel, (displayCityCounts.get(cityLabel) ?? 0) + 1);
  }

  if (error && displayCityCounts.size === 0) {
    console.error("[feed] city counts query failed:", error.message);
  }

  return Array.from(displayCityCounts.entries())
    .filter(([, count]) => count > 0)
    .map(([cityName, count]) => ({ city: cityName, count }))
    .sort((a, b) => b.count - a.count);
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
    includeSold?: string;
    sort?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = (await searchParams) ?? {};
  const filters: ListingFilters = {
    region: params.region ?? "",
    city: params.city ?? "",
    boardType: params.boardType ?? "",
    condition: params.condition ?? "",
    finSetup: params.finSetup ?? "",
    construction: params.construction ?? "",
    brand: params.brand ?? "",
    minPrice: params.minPrice ?? "",
    maxPrice: params.maxPrice ?? "",
    includeSold: params.includeSold === "1" || params.includeSold === "true",
    sort: params.sort ?? "newest",
  };

  const [citiesWithCount, listingsResult] = await Promise.all([
    fetchCityCounts(filters.includeSold),
    fetchListings(filters),
  ]);

  const listings: Listing[] = listingsResult.data ?? [];
  const errorMessage = listingsResult.errorMessage;

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
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-48 bg-gradient-to-b from-[var(--surf-muted)]/30 to-transparent" aria-hidden />

      <section className="relative mx-auto max-w-7xl px-4 py-4 md:py-8">
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
            error={!!errorMessage}
            errorMessage={errorMessage}
            citiesWithCount={citiesWithCount}
            defaultRegion={filters.region}
            defaultCity={filters.city}
            defaultBoardType={filters.boardType}
            defaultCondition={filters.condition}
            defaultFinSetup={filters.finSetup}
            defaultConstruction={filters.construction}
            defaultBrand={filters.brand}
            defaultMinPrice={filters.minPrice}
            defaultMaxPrice={filters.maxPrice}
            defaultIncludeSold={filters.includeSold}
            defaultSort={filters.sort}
          />
        </Suspense>
      </section>
    </main>
  );
}
