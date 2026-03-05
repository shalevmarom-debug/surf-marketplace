/**
 * Normalization for search: trim, remove punctuation, normalize quotes.
 * Compact: remove spaces and hyphens for token matching (e.g. "inter surf" -> "intersurf").
 * Supports Hebrew and English.
 */

/** Normalize quotes (curly/smart to straight, Hebrew geresh) */
function normalizeQuotes(s: string): string {
  return s
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036"]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .replace(/\u05F3/g, "'"); // geresh
}

/** Remove punctuation (keep letters, digits, spaces, Hebrew) */
function removePunctuation(s: string): string {
  return s.replace(/[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E\u00A0-\u00BF\u2000-\u206F]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Normalized form: trim, collapse whitespace, remove punctuation, normalize quotes.
 * Keeps Hebrew and English letters.
 */
export function normalizeText(s: string | null | undefined): string {
  if (s == null || typeof s !== "string") return "";
  const t = s.trim().replace(/\s+/g, " ");
  const q = normalizeQuotes(t);
  return removePunctuation(q).trim();
}

/**
 * Compact form: from normalized string, remove spaces and hyphens (for "inter surf" = "intersurf").
 */
export function compactText(s: string | null | undefined): string {
  const n = normalizeText(s);
  return n.replace(/[\s\-־]+/g, ""); // include Hebrew maqaf
}

/** For ASCII-only search (e.g. brand/title in English): lowercase + normalize + compact */
export function normalizeSearchText(s: string | null | undefined): string {
  if (s == null || typeof s !== "string") return "";
  return normalizeText(s)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function compactSearchText(s: string | null | undefined): string {
  const n = normalizeSearchText(s);
  return n.replace(/[\s\-_]+/g, "");
}

/**
 * Build combined search string from title, brand, city (normal + compact tokens).
 */
export function buildSearchCompact(
  title: string | null | undefined,
  brand: string | null | undefined,
  city: string | null | undefined
): string {
  const parts: string[] = [];
  [title, brand, city].forEach((v) => {
    const norm = normalizeText(v);
    const comp = compactText(v);
    if (norm) parts.push(norm.toLowerCase());
    if (comp && comp !== norm) parts.push(comp.toLowerCase());
  });
  return [...new Set(parts)].filter(Boolean).join(" ");
}

export function searchQueryToTokens(q: string): { normal: string; compact: string } {
  const normal = normalizeSearchText(q);
  const compact = compactSearchText(q);
  return { normal, compact };
}
