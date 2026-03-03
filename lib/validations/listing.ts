import { z } from "zod";

const BOARD_TYPES = ["Shortboard", "Fish", "Longboard", "Softtop", "Other"] as const;
const REGIONS = ["Center", "Sharon", "North", "South", "Jerusalem"] as const;
const CONDITIONS = ["New", "Good", "Fair"] as const;

export const listingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  price_ils: z.number().min(0, "Price must be 0 or more").max(999999),
  city: z.string().min(1, "City is required").max(100),
  region: z.enum(REGIONS),
  board_type: z.enum(BOARD_TYPES),
  length_ft: z.number().min(0).max(12).optional().nullable(),
  volume_l: z.number().min(0).max(500).optional().nullable(),
  brand: z.string().max(100).optional(),
  condition: z.enum(CONDITIONS),
  repairs: z.boolean(),
  fins_included: z.boolean(),
  whatsapp_phone: z
    .string()
    .min(1, "WhatsApp number is required")
    .transform((s) => s.replace(/\D/g, ""))
    .refine((digits) => digits.length >= 9 && digits.length <= 15, "Invalid phone length"),
});

export type ListingFormData = z.infer<typeof listingSchema>;