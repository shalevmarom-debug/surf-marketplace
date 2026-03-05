"use client";

import Link from "next/link";
import { CitySelectHe } from "@/components/CitySelectHe";
import { BOARD_TYPES, REGIONS, CONDITIONS, FIN_SETUPS, CONSTRUCTIONS } from "@/lib/validations/listing";
import { useState } from "react";

type HomeFilterFormProps = {
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
  /** Cities with listing counts for filter dropdown (from DB). Display "city (X)", submit city only. */
  citiesWithCount?: { city: string; count: number }[];
};

export function HomeFilterForm({
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
}: HomeFilterFormProps) {
  const [city, setCity] = useState(defaultCity);

  return (
    <form
      className="mb-6 grid gap-3 rounded-lg bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-5"
      action="/"
      method="GET"
    >
      <div>
        <label className="block text-xs font-medium mb-1" htmlFor="region">Region</label>
        <select id="region" name="region" defaultValue={defaultRegion} className="w-full rounded border px-2 py-1 text-sm">
          <option value="">All</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" htmlFor="city">City</label>
        <CitySelectHe
          value={city}
          onChange={setCity}
          placeholder="Search city..."
          optionsWithCount={citiesWithCount}
        />
        <input type="hidden" name="city" value={city} />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" htmlFor="boardType">Board type</label>
        <select id="boardType" name="boardType" defaultValue={defaultBoardType} className="w-full rounded border px-2 py-1 text-sm">
          <option value="">All</option>
          {BOARD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" htmlFor="condition">Condition</label>
        <select id="condition" name="condition" defaultValue={defaultCondition} className="w-full rounded border px-2 py-1 text-sm">
          <option value="">All</option>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" htmlFor="finSetup">Fin setup</label>
        <select id="finSetup" name="finSetup" defaultValue={defaultFinSetup} className="w-full rounded border px-2 py-1 text-sm">
          <option value="">All</option>
          {FIN_SETUPS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" htmlFor="construction">Construction</label>
        <select id="construction" name="construction" defaultValue={defaultConstruction} className="w-full rounded border px-2 py-1 text-sm">
          <option value="">All</option>
          {CONSTRUCTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" htmlFor="brand">Brand</label>
        <input id="brand" name="brand" type="text" defaultValue={defaultBrand} className="w-full rounded border px-2 py-1 text-sm" placeholder="Search brand..." />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" htmlFor="q">Search</label>
        <input id="q" name="q" type="text" defaultValue={defaultQ} className="w-full rounded border px-2 py-1 text-sm" placeholder="Title, brand, city..." />
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
          <input type="checkbox" name="includeSold" value="1" defaultChecked={defaultIncludeSold} className="rounded" />
          Include sold
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1" htmlFor="minPrice">Min price</label>
          <input id="minPrice" name="minPrice" type="number" min={0} defaultValue={defaultMinPrice} className="w-full rounded border px-2 py-1 text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" htmlFor="maxPrice">Max price</label>
          <input id="maxPrice" name="maxPrice" type="number" min={0} defaultValue={defaultMaxPrice} className="w-full rounded border px-2 py-1 text-xs" />
        </div>
      </div>
      <div className="lg:col-span-5 flex items-end justify-end gap-2">
        <Link href="/" className="rounded border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100">Clear</Link>
        <button type="submit" className="rounded bg-blue-600 px-4 py-1 text-xs font-semibold text-white hover:bg-blue-700">Apply filters</button>
      </div>
    </form>
  );
}
