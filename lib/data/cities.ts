/**
 * Israel cities with region for dropdown + validation.
 * city value is stored in DB; region can be derived for display/filter.
 */

import { REGIONS } from "@/lib/validations/listing";

export type CityEntry = { city: string; region: (typeof REGIONS)[number] };

export const CITIES: CityEntry[] = [
  // Jerusalem
  { city: "Jerusalem", region: "Jerusalem" },
  { city: "Bet Shemesh", region: "Jerusalem" },
  { city: "Ma'ale Adumim", region: "Jerusalem" },
  // Center (Gush Dan)
  { city: "Tel Aviv", region: "Center" },
  { city: "Tel Aviv-Yafo", region: "Center" },
  { city: "Rishon LeZion", region: "Center" },
  { city: "Petah Tikva", region: "Center" },
  { city: "Holon", region: "Center" },
  { city: "Bnei Brak", region: "Center" },
  { city: "Ramat Gan", region: "Center" },
  { city: "Rehovot", region: "Center" },
  { city: "Bat Yam", region: "Center" },
  { city: "Ramat HaSharon", region: "Center" },
  { city: "Herzliya", region: "Center" },
  { city: "Modi'in", region: "Center" },
  { city: "Modi'in-Maccabim-Re'ut", region: "Center" },
  { city: "Lod", region: "Center" },
  { city: "Ramla", region: "Center" },
  { city: "Givatayim", region: "Center" },
  { city: "Kiryat Ono", region: "Center" },
  { city: "Rosh HaAyin", region: "Center" },
  { city: "Ness Ziona", region: "Center" },
  { city: "Yavne", region: "Center" },
  { city: "Or Yehuda", region: "Center" },
  { city: "Yehud-Monosson", region: "Center" },
  // Sharon
  { city: "Netanya", region: "Sharon" },
  { city: "Kfar Saba", region: "Sharon" },
  { city: "Hadera", region: "Sharon" },
  { city: "Ra'anana", region: "Sharon" },
  { city: "Hod HaSharon", region: "Sharon" },
  { city: "Kfar Yona", region: "Sharon" },
  { city: "Tzur Yigal", region: "Sharon" },
  { city: "Even Yehuda", region: "Sharon" },
  { city: "Zichron Yaakov", region: "Sharon" },
  // North
  { city: "Haifa", region: "North" },
  { city: "Nahariya", region: "North" },
  { city: "Acre", region: "North" },
  { city: "Afula", region: "North" },
  { city: "Karmiel", region: "North" },
  { city: "Tiberias", region: "North" },
  { city: "Safed", region: "North" },
  { city: "Kiryat Shmona", region: "North" },
  { city: "Beit She'an", region: "North" },
  { city: "Ma'alot-Tarshiha", region: "North" },
  { city: "Migdal HaEmek", region: "North" },
  { city: "Kiryat Motzkin", region: "North" },
  { city: "Kiryat Yam", region: "North" },
  { city: "Kiryat Bialik", region: "North" },
  // South
  { city: "Ashkelon", region: "South" },
  { city: "Ashdod", region: "South" },
  { city: "Be'er Sheva", region: "South" },
  { city: "Eilat", region: "South" },
  { city: "Kiryat Gat", region: "South" },
  { city: "Dimona", region: "South" },
  { city: "Sderot", region: "South" },
  { city: "Ofakim", region: "South" },
  { city: "Netivot", region: "South" },
  { city: "Arad", region: "South" },
  { city: "Mitzpe Ramon", region: "South" },
];

// Dedupe by city (keep first region)
const seen = new Set<string>();
export const CITIES_UNIQUE: CityEntry[] = CITIES.filter((c) => {
  const k = c.city.toLowerCase().trim();
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

export const CITY_OPTIONS = [...CITIES_UNIQUE.map((c) => c.city).sort((a, b) => a.localeCompare(b)), "Other"];

export function getRegionForCity(city: string): (typeof REGIONS)[number] | null {
  const entry = CITIES_UNIQUE.find(
    (c) => c.city.toLowerCase().trim() === city.toLowerCase().trim()
  );
  return entry?.region ?? null;
}
