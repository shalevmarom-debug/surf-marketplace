/**
 * Curated surfboard brands / shapers for dropdown.
 * Store canonical value; use aliases table to resolve variants (e.g. "CI" -> "Channel Islands").
 */

const BRANDS_RAW = [
  "Al Merrick",
  "Bing",
  "Channel Islands",
  "Christenson",
  "Donald Takayama",
  "DP",
  "DHD",
  "Eggy",
  "Firewire",
  "Hayden Shapes",
  "JS Industries",
  "Lib Tech",
  "Lost",
  "Lost Surfboards",
  "Mayhem",
  "McTavish",
  "NSP",
  "Odysea",
  "Panda",
  "Pyzel",
  "Rusty",
  "Sharp Eye",
  "Slater Designs",
  "Superbrand",
  "T. Patterson",
  "Takayama",
  "Torq",
  "Twin Pin",
  "Other",
];

const unique = [...new Set(BRANDS_RAW)].filter((b) => b !== "Other").sort((a, b) => a.localeCompare(b));
export const BRAND_OPTIONS: string[] = [...unique, "Other"];

export const BRAND_OTHER_MAX_LENGTH = 100;
