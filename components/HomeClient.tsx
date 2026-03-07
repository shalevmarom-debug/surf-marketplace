"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiltersPanel } from "@/components/FiltersPanel";
import { FiltersBottomSheet } from "@/components/FiltersBottomSheet";
import { ListingCard } from "@/components/ListingCard";
import { Filter, ChevronDown, ArrowUp } from "lucide-react";

type ListingWithImage = {
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
  length_ft?: number | null;
  volume_l?: number | null;
  primaryImageUrl: string | null;
  displayCity: string;
};

type HomeClientProps = {
  listingsWithImage: ListingWithImage[];
  error: boolean;
  citiesWithCount: { city: string; count: number }[];
  defaultRegion: string;
  defaultCity: string;
  defaultBoardType: string;
  defaultCondition: string;
  defaultFinSetup: string;
  defaultConstruction: string;
  defaultBrand: string;
  defaultMinPrice: string;
  defaultMaxPrice: string;
  defaultQ: string;
  defaultIncludeSold: boolean;
  defaultSort: string;
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price low–high" },
  { value: "price_desc", label: "Price high–low" },
] as const;

function buildQueryString(params: Record<string, string>, overrides?: Record<string, string>): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v != null && v !== "") search.set(k, v);
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export function HomeClient({
  listingsWithImage,
  error,
  citiesWithCount,
  defaultRegion: defaultRegionProp,
  defaultCity,
  defaultBoardType,
  defaultCondition,
  defaultFinSetup,
  defaultConstruction,
  defaultBrand,
  defaultMinPrice,
  defaultMaxPrice,
  defaultQ,
  defaultIncludeSold,
  defaultSort,
}: HomeClientProps) {
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const currentParams: Record<string, string> = {
    region: searchParams.get("region") ?? "",
    city: searchParams.get("city") ?? "",
    boardType: searchParams.get("boardType") ?? "",
    condition: searchParams.get("condition") ?? "",
    finSetup: searchParams.get("finSetup") ?? "",
    construction: searchParams.get("construction") ?? "",
    brand: searchParams.get("brand") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    q: searchParams.get("q") ?? "",
    sort: searchParams.get("sort") ?? defaultSort,
    ...(defaultIncludeSold ? { includeSold: "1" } : {}),
  };

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const quickChips = [
    { label: "Shortboard", href: buildQueryString(currentParams, { boardType: "Shortboard" }) },
    { label: "Fish", href: buildQueryString(currentParams, { boardType: "Fish" }) },
    { label: "Longboard", href: buildQueryString(currentParams, { boardType: "Longboard" }) },
    { label: "Under ₪1000", href: buildQueryString(currentParams, { maxPrice: "1000" }) },
    { label: "Nearby", href: buildQueryString(currentParams) },
  ];

  return (
    <>
      {/* Mobile: sticky bar with Filters, Sort, chips */}
      <div className="sticky top-[calc(var(--header-height, 0px)+0px)] z-30 -mx-4 border-b border-[var(--surf-border)] bg-[var(--surf-card)] px-4 pb-2 pt-2 md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-border)]"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setSortDropdownOpen((o) => !o)}
              className="flex min-h-[44px] min-w-[44px] items-center gap-1 rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-border)]"
              aria-expanded={sortDropdownOpen}
              aria-haspopup="listbox"
            >
              {SORT_OPTIONS.find((o) => o.value === currentParams.sort)?.label ?? "Sort"}
              <ChevronDown className={`h-4 w-4 transition ${sortDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {sortDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(false)} aria-hidden />
                <ul
                  role="listbox"
                  className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-[var(--surf-border)] bg-[var(--surf-card)] py-1 shadow-lg"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <li key={opt.value} role="option" aria-selected={currentParams.sort === opt.value}>
                      <Link
                        href={buildQueryString(currentParams, { sort: opt.value })}
                        className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surf-border)]"
                        onClick={() => setSortDropdownOpen(false)}
                      >
                        {opt.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickChips.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="flex min-h-[44px] shrink-0 items-center rounded-full bg-[var(--surf-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-primary)] hover:text-white"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>

      <FiltersBottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        defaultRegion={defaultRegionProp}
        defaultCity={defaultCity}
        defaultBoardType={defaultBoardType}
        defaultCondition={defaultCondition}
        defaultFinSetup={defaultFinSetup}
        defaultConstruction={defaultConstruction}
        defaultBrand={defaultBrand}
        defaultMinPrice={defaultMinPrice}
        defaultMaxPrice={defaultMaxPrice}
        defaultQ={defaultQ}
        defaultIncludeSold={defaultIncludeSold}
        defaultSort={defaultSort}
        citiesWithCount={citiesWithCount}
        resultCount={listingsWithImage.length}
      />

      {/* Desktop: Filters panel (tighter) */}
      <div className="mb-6 hidden md:block">
        <FiltersPanel
          defaultRegion={defaultRegionProp}
          defaultCity={defaultCity}
          defaultBoardType={defaultBoardType}
          defaultCondition={defaultCondition}
          defaultFinSetup={defaultFinSetup}
          defaultConstruction={defaultConstruction}
          defaultBrand={defaultBrand}
          defaultMinPrice={defaultMinPrice}
          defaultMaxPrice={defaultMaxPrice}
          defaultQ={defaultQ}
          defaultIncludeSold={defaultIncludeSold}
          defaultSort={defaultSort}
          citiesWithCount={citiesWithCount}
        />
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600">
          Failed to load listings.
        </p>
      )}

      <p className="mb-4 text-sm text-[var(--surf-muted-text)]">
        Showing {listingsWithImage.length} board{listingsWithImage.length !== 1 ? "s" : ""}
      </p>

      {listingsWithImage.length === 0 && !error ? (
        <div className="rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-8 text-center">
          <p className="text-[var(--surf-muted-text)]">No listings match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listingsWithImage.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              price_ils={listing.price_ils}
              region={listing.region}
              board_type={listing.board_type}
              condition={listing.condition}
              fin_setup={listing.fin_setup}
              brand_raw={listing.brand_raw}
              brand={listing.brand}
              sold_at={listing.sold_at}
              created_at={listing.created_at}
              primaryImageUrl={listing.primaryImageUrl}
              displayCity={listing.displayCity}
              length_ft={listing.length_ft}
              volume_l={listing.volume_l}
            />
          ))}
        </div>
      )}

      {showBackToTop && (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-6 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surf-primary)] text-white shadow-lg hover:bg-[var(--surf-primary-hover)] md:hidden"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </a>
      )}
    </>
  );
}
