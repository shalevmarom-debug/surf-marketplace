"use client";

import { useEffect, useRef, useState } from "react";
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
import { Filter, X } from "lucide-react";

const idPrefix = "sheet";

type MobileFiltersSheetProps = {
  open: boolean;
  onClose: () => void;
  citiesWithCount: { city: string; count: number }[];
};

export function MobileFiltersSheet({
  open,
  onClose,
  citiesWithCount,
}: MobileFiltersSheetProps) {
  const { params, applyFilters, clearFilters } = useListingFilters();
  const [local, setLocal] = useState<ListingFilterParams>(params);
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setLocal(params);
      setMoreOpen(false);
    }
  }, [open, params]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleApply = () => {
    applyFilters(local);
    onClose();
  };

  const handleClear = () => {
    clearFilters();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-label="Filters"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden rounded-t-2xl border-t border-[var(--surf-border)] bg-[var(--surf-card)] shadow-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--surf-border)] px-4 py-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--surf-muted-text)] hover:bg-[var(--surf-border)] hover:text-[var(--foreground)]"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: "calc(90vh - 140px)" }}>
          <div className="space-y-4 p-4">
            <CityField
              value={local.city}
              onChange={(city) => setLocal((p) => ({ ...p, city }))}
              idPrefix={idPrefix}
              citiesWithCount={citiesWithCount}
            />
            <BoardTypeField
              value={local.boardType}
              onChange={(boardType) => setLocal((p) => ({ ...p, boardType }))}
              idPrefix={idPrefix}
            />
            <div className="grid grid-cols-2 gap-4">
              <MinPriceField
                value={local.minPrice}
                onChange={(minPrice) => setLocal((p) => ({ ...p, minPrice }))}
                idPrefix={idPrefix}
              />
              <MaxPriceField
                value={local.maxPrice}
                onChange={(maxPrice) => setLocal((p) => ({ ...p, maxPrice }))}
                idPrefix={idPrefix}
              />
            </div>

            <div className="border-t border-[var(--surf-border)] pt-4">
              <button
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                className="flex w-full items-center justify-between text-sm font-medium text-[var(--foreground)] hover:text-[var(--surf-primary)]"
              >
                More filters
                <span className="text-lg">{moreOpen ? "−" : "+"}</span>
              </button>
              {moreOpen && (
                <div className="mt-4 space-y-4">
                  <RegionField
                    value={local.region}
                    onChange={(region) => setLocal((p) => ({ ...p, region }))}
                    idPrefix={idPrefix}
                  />
                  <ConditionField
                    value={local.condition}
                    onChange={(condition) => setLocal((p) => ({ ...p, condition }))}
                    idPrefix={idPrefix}
                  />
                  <FinSetupField
                    value={local.finSetup}
                    onChange={(finSetup) => setLocal((p) => ({ ...p, finSetup }))}
                    idPrefix={idPrefix}
                  />
                  <ConstructionField
                    value={local.construction}
                    onChange={(construction) => setLocal((p) => ({ ...p, construction }))}
                    idPrefix={idPrefix}
                  />
                  <BrandField
                    value={local.brand}
                    onChange={(brand) => setLocal((p) => ({ ...p, brand }))}
                    idPrefix={idPrefix}
                  />
                  <IncludeSoldField
                    checked={local.includeSold}
                    onChange={(includeSold) => setLocal((p) => ({ ...p, includeSold }))}
                    idPrefix={idPrefix}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-[var(--surf-border)] bg-[var(--surf-card)] p-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={handleClear}
            className="rounded-xl border border-[var(--surf-border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-border)]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-xl bg-[var(--surf-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--surf-primary-hover)]"
          >
            Apply filters
          </button>
        </div>
      </div>
    </>
  );
}

type MobileFiltersButtonRowProps = {
  citiesWithCount: { city: string; count: number }[];
};

export function MobileFiltersButtonRow({ citiesWithCount }: MobileFiltersButtonRowProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { params, applyFilters } = useListingFilters();

  return (
    <>
      <div className="sticky top-[calc(var(--header-height,0px)+0px)] z-30 -mx-4 border-b border-[var(--surf-border)] bg-[var(--surf-card)] px-4 pb-2 pt-2 md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-border)]"
            aria-label="Open filters"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <div className="min-w-[140px]">
            <SortControl
              value={params.sort}
              onSelect={(sort) => applyFilters({ sort })}
              variant="dropdown"
            />
          </div>
        </div>
      </div>
      <MobileFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        citiesWithCount={citiesWithCount}
      />
    </>
  );
}
