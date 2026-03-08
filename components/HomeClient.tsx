"use client";

import { useState, useEffect } from "react";
import { FiltersPanel } from "@/components/FiltersPanel";
import { ListingCard } from "@/components/ListingCard";
import { ArrowUp } from "lucide-react";

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
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Filters panel – same on mobile and desktop */}
      <div className="mb-6 md:mb-8">
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-4 lg:gap-6">
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
