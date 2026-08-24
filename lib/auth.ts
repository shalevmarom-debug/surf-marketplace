export const INTERNAL_EMAIL_DOMAIN = "@example.com";

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function toInternalEmail(username: string): string {
  return normalizeUsername(username) + INTERNAL_EMAIL_DOMAIN;
}

export function isValidUsername(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 3 || s.length > 50) return false;
  return /^[a-zA-Z0-9_\u0590-\u05FF]+$/.test(s);
}
