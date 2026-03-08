"use client";

import { useEffect, useState } from "react";
import { useListingFilters } from "@/hooks/useListingFilters";
import type { ListingFilterParams } from "@/hooks/useListingFilters";
import {
  CityField,
  BoardTypeField,
  MinPriceField,
  MaxPriceField,
  RegionField,
  ConditionField,
  FinSetupField,
  ConstructionField,
  BrandField,
  IncludeSoldField,
} from "@/components/listing-filters/FilterFields";
import { SortControl } from "@/components/listing-filters/SortControl";

type DesktopFiltersBarProps = {
  citiesWithCount: { city: string; count: number }[];
};

export function DesktopFiltersBar({ citiesWithCount }: DesktopFiltersBarProps) {
  const { params, applyFilters, clearFilters } = useListingFilters();
  const [local, setLocal] = useState<ListingFilterParams>(params);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setLocal(params);
  }, [params]);

  const handleApply = () => {
    applyFilters(local);
  };

  return (
    <div className="mb-6 rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-3 shadow-sm md:mb-8 md:p-4">
      {/* Main row: City | Board type | Min | Max | Sort | More filters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <CityField
          value={local.city}
          onChange={(city) => setLocal((p) => ({ ...p, city }))}
          citiesWithCount={citiesWithCount}
        />
        <BoardTypeField
          value={local.boardType}
          onChange={(boardType) => setLocal((p) => ({ ...p, boardType }))}
        />
        <MinPriceField
          value={local.minPrice}
          onChange={(minPrice) => setLocal((p) => ({ ...p, minPrice }))}
        />
        <MaxPriceField
          value={local.maxPrice}
          onChange={(maxPrice) => setLocal((p) => ({ ...p, maxPrice }))}
        />
        <SortControl value={local.sort} onSelect={(sort) => setLocal((p) => ({ ...p, sort }))} variant="inline" />
        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-[var(--surf-border)] bg-[var(--surf-card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-border)] hover:text-[var(--surf-primary)]"
          >
            More filters
            <span className="text-lg">{moreOpen ? "−" : "+"}</span>
          </button>
        </div>
      </div>

      {moreOpen && (
        <div className="mt-4 grid gap-4 border-t border-[var(--surf-border)] pt-4 sm:grid-cols-2 lg:grid-cols-5">
          <RegionField
            value={local.region}
            onChange={(region) => setLocal((p) => ({ ...p, region }))}
          />
          <ConditionField
            value={local.condition}
            onChange={(condition) => setLocal((p) => ({ ...p, condition }))}
          />
          <FinSetupField
            value={local.finSetup}
            onChange={(finSetup) => setLocal((p) => ({ ...p, finSetup }))}
          />
          <ConstructionField
            value={local.construction}
            onChange={(construction) => setLocal((p) => ({ ...p, construction }))}
          />
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandField
              value={local.brand}
              onChange={(brand) => setLocal((p) => ({ ...p, brand }))}
            />
          </div>
          <div className="flex items-center sm:col-span-2">
            <IncludeSoldField
              checked={local.includeSold}
              onChange={(includeSold) => setLocal((p) => ({ ...p, includeSold }))}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--surf-border)] pt-4">
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-[var(--surf-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-border)]"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="rounded-xl bg-[var(--surf-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--surf-primary-hover)]"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}
