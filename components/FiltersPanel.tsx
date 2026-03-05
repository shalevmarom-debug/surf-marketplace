"use client";

import Link from "next/link";
import { CitySelectHe } from "@/components/CitySelectHe";
import { BOARD_TYPES, REGIONS, CONDITIONS, FIN_SETUPS, CONSTRUCTIONS } from "@/lib/validations/listing";
import { useState } from "react";

type FiltersPanelProps = {
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
  citiesWithCount?: { city: string; count: number }[];
};

const inputClass =
  "w-full rounded-xl border border-[var(--surf-border)] bg-[var(--surf-card)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--surf-primary)]/20";

export function FiltersPanel(props: FiltersPanelProps) {
  const {
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
    citiesWithCount = [],
  } = props;
  const [city, setCity] = useState(defaultCity);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="mb-8 rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-4 shadow-sm">
      <form action="/" method="GET" className="space-y-4">
        <input type="hidden" name="q" value={defaultQ} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="city">City</label>
            <CitySelectHe value={city} onChange={setCity} placeholder="Search city..." optionsWithCount={citiesWithCount} />
            <input type="hidden" name="city" value={city} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="boardType">Board type</label>
            <select id="boardType" name="boardType" defaultValue={defaultBoardType} className={inputClass}>
              <option value="">All</option>
              {BOARD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="minPrice">Min price (ILS)</label>
            <input id="minPrice" name="minPrice" type="number" min={0} defaultValue={defaultMinPrice} className={inputClass} placeholder="0" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="maxPrice">Max price (ILS)</label>
            <input id="maxPrice" name="maxPrice" type="number" min={0} defaultValue={defaultMaxPrice} className={inputClass} placeholder="Any" />
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
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="region">Region</label>
                <select id="region" name="region" defaultValue={defaultRegion} className={inputClass}>
                  <option value="">All</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="condition">Condition</label>
                <select id="condition" name="condition" defaultValue={defaultCondition} className={inputClass}>
                  <option value="">All</option>
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="finSetup">Fin setup</label>
                <select id="finSetup" name="finSetup" defaultValue={defaultFinSetup} className={inputClass}>
                  <option value="">All</option>
                  {FIN_SETUPS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="construction">Construction</label>
                <select id="construction" name="construction" defaultValue={defaultConstruction} className={inputClass}>
                  <option value="">All</option>
                  {CONSTRUCTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor="brand">Brand</label>
                <input id="brand" name="brand" type="text" defaultValue={defaultBrand} className={inputClass} placeholder="Search brand..." />
              </div>
              <div className="flex items-center">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]">
                  <input type="checkbox" name="includeSold" value="1" defaultChecked={defaultIncludeSold} className="rounded border-[var(--surf-border)]" />
                  Include sold
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--surf-border)] pt-4">
          <Link href="/" className="rounded-xl border border-[var(--surf-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-border)]">
            Clear
          </Link>
          <button type="submit" className="rounded-xl bg-[var(--surf-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--surf-primary-hover)]">
            Apply filters
          </button>
        </div>
      </form>
    </div>
  );
}
