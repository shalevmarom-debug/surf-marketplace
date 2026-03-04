/**
 * E.164 phone normalization.
 * Default country: Israel (+972). Leading 0 is stripped for Israel.
 * Store result in DB (e.g. +972501234567).
 */

export const DEFAULT_COUNTRY_CODE = "+972";
export const DEFAULT_COUNTRY_FLAG = "🇮🇱";

export type CountryOption = {
  code: string;   // E.164 prefix e.g. "+972"
  flag: string;
  label: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "+972", flag: "🇮🇱", label: "Israel" },
  { code: "+1", flag: "🇺🇸", label: "US/Canada" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+49", flag: "🇩🇪", label: "Germany" },
  { code: "+33", flag: "🇫🇷", label: "France" },
  { code: "+61", flag: "🇦🇺", label: "Australia" },
];

/**
 * Normalize input to E.164.
 * - For Israel (+972): strip leading 0 from local number; expect 9 digits after +972.
 * - Returns e.g. "+972501234567" or null if invalid.
 */
export function toE164(
  input: string,
  countryCode: string = DEFAULT_COUNTRY_CODE
): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 0) return null;

  let normalized: string;
  if (countryCode === "+972") {
    // Israel: allow 9 digits (0501234567 → 972501234567) or already with 972
    let local = digits;
    if (local.startsWith("972") && local.length >= 12) {
      normalized = "+" + local.slice(0, 12);
    } else if (local.startsWith("972") && local.length === 11) {
      // 972 + 8 digits - pad or reject; spec says 9 digits after +972
      return null;
    } else if (local.length === 9) {
      if (local.startsWith("0")) local = local.slice(1);
      if (local.length === 9) normalized = "+972" + local;
      else return null;
    } else if (local.length === 10 && local.startsWith("0")) {
      local = local.slice(1);
      if (local.length === 9) normalized = "+972" + local;
      else return null;
    } else {
      return null;
    }
  } else {
    // Other countries: prepend country digits (strip +) and build E.164
    const ccDigits = countryCode.replace(/\D/g, "");
    if (digits.startsWith(ccDigits)) {
      normalized = "+" + digits;
    } else {
      normalized = "+" + ccDigits + digits;
    }
  }

  const totalDigits = normalized.replace(/\D/g, "").length;
  if (totalDigits < 8 || totalDigits > 15) return null;
  return normalized;
}
