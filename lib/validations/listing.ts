import { z } from "zod";

// Board types: include Funboard, Midlength, Hybrid; Softtop → Softboard
export const BOARD_TYPES = [
  "Shortboard",
  "Fish",
  "Funboard",
  "Longboard",
  "Softboard",
  "Midlength",
  "Hybrid",
  "Other",
] as const;

export const REGIONS = ["Center", "Sharon", "North", "South", "Jerusalem"] as const;

// Condition options (English, clear labels)
export const CONDITIONS = [
  "New / Unridden",
  "Like New",
  "Great Shape",
  "Used (Normal)",
  "Needs Love",
  "Project Board",
] as const;

export const FIN_SETUPS = ["Single", "Twin", "Thruster", "Quad", "Five-fin"] as const;
export const CONSTRUCTIONS = ["PU", "EPS", "Epoxy", "Soft"] as const;

// Length (ft) ranges per board type [min, max]
export const LENGTH_FT_RANGES: Record<(typeof BOARD_TYPES)[number], [number, number]> = {
  Shortboard: [4.6, 6.6],
  Fish: [4.6, 8.0],
  Funboard: [6.0, 8.5],
  Longboard: [8.0, 15.0],
  Softboard: [4.0, 10.0],
  Midlength: [6.0, 8.5],
  Hybrid: [5.0, 7.0],
  Other: [4.0, 15.0],
};

export const TITLE_MIN = 6;
export const TITLE_MAX = 80;
export const DESCRIPTION_MAX = 2000;
export const BRAND_MAX = 100;
export const CITY_MAX = 100;
export const PRICE_MIN = 0;
export const PRICE_MAX = 15000;
export const VOLUME_L_MIN = 0;
export const VOLUME_L_MAX = 250;
export const IMAGE_FILE_SIZE_MAX = 5 * 1024 * 1024; // 5MB
export const IMAGE_FILES_MIN_COUNT = 3;
export const IMAGE_FILES_MAX_COUNT = 10;
export const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// E.164: starts with +, 8–15 digits total
const e164Phone = z
  .string()
  .min(1, "WhatsApp number is required")
  .refine(
    (s) => {
      const t = s.trim();
      if (!t.startsWith("+")) return false;
      const digits = t.replace(/\D/g, "");
      return digits.length >= 8 && digits.length <= 15;
    },
    "Phone must be in E.164 format (8–15 digits, e.g. +972501234567)"
  );

export const listingSchema = z
  .object({
    title: z
      .string()
      .min(TITLE_MIN, `Title must be ${TITLE_MIN}–${TITLE_MAX} characters`)
      .max(TITLE_MAX, `Title must be ${TITLE_MIN}–${TITLE_MAX} characters`),
    description: z.string().max(DESCRIPTION_MAX).optional(),
    price_ils: z
      .number()
      .min(PRICE_MIN, `Price must be ${PRICE_MIN}–${PRICE_MAX} ILS`)
      .max(PRICE_MAX, `Price must be ${PRICE_MIN}–${PRICE_MAX} ILS`),
    city: z.string().min(1, "City is required").max(CITY_MAX),
    region: z.enum(REGIONS),
    board_type: z.enum(BOARD_TYPES),
    length_ft: z.number().optional().nullable(),
    volume_l: z.number().min(VOLUME_L_MIN).max(VOLUME_L_MAX).optional().nullable(),
    brand: z.string().max(BRAND_MAX).optional(),
    condition: z.enum(CONDITIONS),
    repairs: z.boolean(),
    fins_included: z.boolean(),
    fin_setup: z.enum(FIN_SETUPS).optional().nullable(),
    construction: z.enum(CONSTRUCTIONS).optional().nullable(),
    whatsapp_phone: e164Phone,
  })
  .refine(
    (data) => {
      if (data.length_ft == null) return true;
      const [minF, maxF] = LENGTH_FT_RANGES[data.board_type];
      return data.length_ft >= minF && data.length_ft <= maxF;
    },
    { message: "Length is out of range for this board type", path: ["length_ft"] }
  );

export type ListingFormData = z.infer<typeof listingSchema>;
