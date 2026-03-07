"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CitySelectHe } from "@/components/CitySelectHe";
import {
  BOARD_TYPES,
  REGIONS,
  CONDITIONS,
  FIN_SETUPS,
  CONSTRUCTIONS,
} from "@/lib/validations/listing";
import { X } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-[var(--surf-border)] bg-[var(--surf-card)] px-3 py-2.5 text-base focus:border-[var(--surf-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--surf-primary)]/20";

export type FiltersBottomSheetProps = {
  open: boolean;
  onClose: () => void;
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
  citiesWithCount: { city: string; count: number }[];
  resultCount?: number;
};

export function FiltersBottomSheet({
  open,
  onClose,
  defaultRegion,
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
  citiesWithCount,
  resultCount,
}: FiltersBottomSheetProps) {
  const [city, setCity] = useState(defaultCity);
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setCity(defaultCity);
  }, [defaultCity, open]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const focusable = sheetRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

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
          <form action="/" method="GET" id="filters-sheet-form" className="space-y-4 p-4">
            <input type="hidden" name="q" value={defaultQ} />
            <input type="hidden" name="sort" value={defaultSort} />

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="sheet-city">City</label>
                <CitySelectHe
                  value={city}
                  onChange={setCity}
                  placeholder="Search city..."
                  optionsWithCount={citiesWithCount}
                />
                <input type="hidden" name="city" value={city} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="sheet-boardType">Board type</label>
                <select id="sheet-boardType" name="boardType" defaultValue={defaultBoardType} className={inputClass}>
                  <option value="">All</option>
                  {BOARD_TYPES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="sheet-minPrice">Min price (ILS)</label>
                  <input id="sheet-minPrice" name="minPrice" type="number" min={0} defaultValue={defaultMinPrice} className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="sheet-maxPrice">Max price (ILS)</label>
                  <input id="sheet-maxPrice" name="maxPrice" type="number" min={0} defaultValue={defaultMaxPrice} className={inputClass} placeholder="Any" />
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--surf-border)] pt-4">
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className="flex w-full items-center justify-between text-sm font-medium text-[var(--foreground)] hover:text-[var(--surf-primary)]"
              >
                More filters
                <span className="text-lg">{moreOpen ? "−" : "+"}</span>
              </button>
              {moreOpen && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="sheet-region">Region</label>
                    <select id="sheet-region" name="region" defaultValue={defaultRegion} className={inputClass}>
                      <option value="">All</option>
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="sheet-condition">Condition</label>
                    <select id="sheet-condition" name="condition" defaultValue={defaultCondition} className={inputClass}>
                      <option value="">All</option>
                      {CONDITIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="sheet-finSetup">Fin setup</label>
                    <select id="sheet-finSetup" name="finSetup" defaultValue={defaultFinSetup} className={inputClass}>
                      <option value="">All</option>
                      {FIN_SETUPS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="sheet-construction">Construction</label>
                    <select id="sheet-construction" name="construction" defaultValue={defaultConstruction} className={inputClass}>
                      <option value="">All</option>
                      {CONSTRUCTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="sheet-brand">Brand</label>
                    <input id="sheet-brand" name="brand" type="text" defaultValue={defaultBrand} className={inputClass} placeholder="Search brand..." />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]">
                    <input type="checkbox" name="includeSold" value="1" defaultChecked={defaultIncludeSold} className="rounded border-[var(--surf-border)]" />
                    Include sold
                  </label>
                </div>
              )}
            </div>
          </form>
        </div>
        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-[var(--surf-border)] bg-[var(--surf-card)] p-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <Link
            href="/"
            className="rounded-xl border border-[var(--surf-border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-border)]"
          >
            Clear
          </Link>
          <button
            type="submit"
            form="filters-sheet-form"
            onClick={onClose}
            className="rounded-xl bg-[var(--surf-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--surf-primary-hover)]"
          >
            {resultCount != null ? `Show results (${resultCount})` : "Show results"}
          </button>
        </div>
      </div>
    </>
  );
}
