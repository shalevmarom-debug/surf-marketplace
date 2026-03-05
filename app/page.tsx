import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { APP_NAME } from "@/lib/constants";
import { BOARD_TYPES, REGIONS, CONDITIONS, FIN_SETUPS, CONSTRUCTIONS } from "@/lib/validations/listing";
import { searchQueryToTokens } from "@/lib/normalize";
import { HomeFilterForm } from "@/components/HomeFilterForm";

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
};

function displayCity(listing: Listing): string {
  return listing.city_he !== "אחר" ? (listing.city_he ?? listing.city ?? "") : (listing.city_other?.trim() || "אחר");
}
type ListingWithImage = Listing & { primaryImageUrl: string | null };
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
    const displayCity = ch !== "אחר" ? (ch ?? "") : (co?.trim() || "אחר");
    if (!displayCity) continue;
    displayCityCounts.set(displayCity, (displayCityCounts.get(displayCity) ?? 0) + 1);
  }
  const citiesWithCount: { city: string; count: number }[] = Array.from(displayCityCounts.entries())
    .filter(([, count]) => count > 0)
    .map(([cityName, count]) => ({ city: cityName, count }))
    .sort((a, b) => b.count - a.count);

  let query = supabase
    .from("listings")
    .select(
      "id, title, price_ils, city, city_he, city_other, region, board_type, condition, fin_setup, construction, brand, brand_raw, sold_at, created_at, listing_images(storage_path, sort_order, is_primary)"
    )
    .order("created_at", { ascending: false })
    .limit(48);

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
    return { ...listing, primaryImageUrl };
  });
  return (
    <main className="min-h-screen bg-gray-100">
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">{APP_NAME}</h1>
          <p className="text-gray-600">
          Browse surfboard listings from all over Israel.
          </p>
        </div>

        <HomeFilterForm
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
          citiesWithCount={citiesWithCount}
        />

        {error && (
          <p className="mb-4 text-sm text-red-600">
            Failed to load listings: {error.message}
          </p>
        )}

        {listingsWithImage.length === 0 && !error ? (
          <p className="text-center text-gray-600">
            No listings match your filters.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listingsWithImage.map((listing) => (
            <article
              key={listing.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              {listing.primaryImageUrl && (
                <div className="mb-2 overflow-hidden rounded">
                  <img
                    src={listing.primaryImageUrl}
                    alt={listing.title}
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}
              <Link href={`/listing/${listing.id}`} className="block">
                <h2 className="mb-1 text-lg font-semibold">
                  {listing.title}
                </h2>
                <p className="text-sm text-gray-600 mb-1">
                  {displayCity(listing)}, {listing.region}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  {listing.board_type} · {listing.condition}
                  {((listing as Listing).brand_raw ?? (listing as Listing).brand) && ` · ${(listing as Listing).brand_raw ?? (listing as Listing).brand}`}
                </p>
                {listing.price_ils !== null && (
                  <p className="text-base font-bold text-gray-900 mb-2">
                    {listing.price_ils} ILS
                  </p>
                )}
              </Link>
              <p className="text-xs text-gray-400">
                Posted {new Date(listing.created_at).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  </main>
);
}