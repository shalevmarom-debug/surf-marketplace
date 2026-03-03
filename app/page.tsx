import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { APP_NAME } from "@/lib/constants";

type Listing = {
  id: string;
  title: string;
  price_ils: number | null;
  city: string;
  region: string;
  board_type: string;
  condition: string;
  created_at: string;
  listing_images?: { storage_path: string; sort_order: number }[] | null;
};
type ListingWithImage = Listing & { primaryImageUrl: string | null };
type HomeProps = {
  searchParams?: Promise<{
    region?: string;
    city?: string;
    boardType?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = (await searchParams) ?? {};
  const region = params.region ?? "";
  const city = params.city ?? "";
  const boardType = params.boardType ?? "";
  const minPrice = params.minPrice ?? "";
  const maxPrice = params.maxPrice ?? "";

  let query = supabase
    .from("listings")
    .select(
      "id, title, price_ils, city, region, board_type, condition, created_at, listing_images(storage_path, sort_order)"
    )
    .order("created_at", { ascending: false })
    .limit(48);

  if (region) {
    query = query.eq("region", region);
  }

  if (boardType) {
    query = query.eq("board_type", boardType);
  }

  if (city) {
    // simple case-insensitive "contains"
    query = query.ilike("city", `%${city}%`);
  }

  if (minPrice) {
    query = query.gte("price_ils", Number(minPrice));
  }

  if (maxPrice) {
    query = query.lte("price_ils", Number(maxPrice));
  }

  const { data, error } = await query;
  const listings: Listing[] = data ?? [];

  const listingsWithImage: ListingWithImage[] = listings.map((row) => {
    const listing = row as Listing;
    const images = listing.listing_images ?? [];
    const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
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

        {/* Filters */}
        <form
          className="mb-6 grid gap-3 rounded-lg bg-white p-4 shadow-sm md:grid-cols-4"
          action="/"
          method="GET"
        >
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="region">
              Region
            </label>
            <select
              id="region"
              name="region"
              defaultValue={region}
              className="w-full rounded border px-2 py-1 text-sm"
            >
              <option value="">All</option>
              <option value="Center">Center</option>
              <option value="Sharon">Sharon</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="Jerusalem">Jerusalem</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="city">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={city}
              className="w-full rounded border px-2 py-1 text-sm"
              placeholder="Any city"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="boardType">
              Board type
            </label>
            <select
              id="boardType"
              name="boardType"
              defaultValue={boardType}
              className="w-full rounded border px-2 py-1 text-sm"
            >
              <option value="">All</option>
              <option value="Shortboard">Shortboard</option>
              <option value="Fish">Fish</option>
              <option value="Longboard">Longboard</option>
              <option value="Softtop">Softtop</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                className="block text-xs font-medium mb-1"
                htmlFor="minPrice"
              >
                Min price
              </label>
              <input
                id="minPrice"
                name="minPrice"
                type="number"
                min={0}
                defaultValue={minPrice}
                className="w-full rounded border px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                htmlFor="maxPrice"
              >
                Max price
              </label>
              <input
                id="maxPrice"
                name="maxPrice"
                type="number"
                min={0}
                defaultValue={maxPrice}
                className="w-full rounded border px-2 py-1 text-xs"
              />
            </div>
          </div>

          <div className="md:col-span-4 flex items-end justify-end gap-2">
            <Link
              href="/"
              className="rounded border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Clear
            </Link>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-1 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Apply filters
            </button>
          </div>
        </form>

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
                  {listing.city}, {listing.region}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  {listing.board_type} · {listing.condition}
                </p>
                {listing.price_ils !== null && (
                  <p className="text-base font-bold text-gray-900 mb-2">
                    {listing.price_ils} ILS
                  </p>
                )}
              </Link>
              <p className="text-xs text-gray-400">
                Posted at {new Date(listing.created_at).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  </main>
);
}