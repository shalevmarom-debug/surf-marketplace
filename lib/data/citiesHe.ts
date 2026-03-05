/**
 * Israeli cities in Hebrew – loaded from static JSON, sorted א–ת.
 */

export type CityNameHe = { name: string };

import citiesData from "@/data/israel_cities_he.json";

const raw = citiesData as CityNameHe[];
const sorted = [...raw].sort((a, b) => a.name.localeCompare(b.name, "he"));

export const ISRAEL_CITIES_HE: string[] = sorted.map((c) => c.name);

/** Cities list for forms: 56 cities + "אחר" */
export const CITY_OPTIONS_FOR_FORM: string[] = [...ISRAEL_CITIES_HE, "אחר"];

/** Filter cities by prefix (Hebrew). Empty query returns all cities. */
export function filterCitiesHe(query: string): string[] {
  const q = query.trim().replace(/\s+/g, " ");
  if (!q) return ISRAEL_CITIES_HE;
  return ISRAEL_CITIES_HE.filter((city) => city.startsWith(q));
}

/** Filter form cities (56 + Other) by prefix. */
export function filterCitiesForForm(query: string): string[] {
  const q = query.trim().replace(/\s+/g, " ");
  if (!q) return CITY_OPTIONS_FOR_FORM;
  return CITY_OPTIONS_FOR_FORM.filter((city) => city.startsWith(q));
}
