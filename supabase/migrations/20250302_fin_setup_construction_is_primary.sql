-- Migration: Final settings (fin_setup, construction, is_primary, updated constraints)
-- Run this AFTER your existing schema (profiles, listings, listing_images).
-- Assumes tables already exist.

-- 1) Listings: allow nullable price_ils (app sends null when empty)
ALTER TABLE public.listings
  ALTER COLUMN price_ils DROP NOT NULL;

-- 2) Listings: new columns
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS fin_setup text,
  ADD COLUMN IF NOT EXISTS construction text;

-- 3) Drop OLD check constraints (old enum values)
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_board_type_check;

ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_condition_check;

-- 4) Add NEW check constraints (updated enums)
ALTER TABLE public.listings
  ADD CONSTRAINT listings_board_type_check
  CHECK (board_type IN (
    'Shortboard', 'Fish', 'Funboard', 'Longboard', 'Softboard',
    'Midlength', 'Hybrid', 'Other'
  ));

ALTER TABLE public.listings
  ADD CONSTRAINT listings_condition_check
  CHECK (condition IN (
    'New / Unridden', 'Like New', 'Great Shape',
    'Used (Normal)', 'Needs Love', 'Project Board'
  ));

-- 5) Listing images: primary image flag
ALTER TABLE public.listing_images
  ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false;

-- 6) Set first image (min sort_order) per listing as primary for existing rows
UPDATE public.listing_images li
SET is_primary = true
WHERE (li.listing_id, li.sort_order) IN (
  SELECT listing_id, MIN(sort_order)
  FROM public.listing_images
  GROUP BY listing_id
);

-- Optional: migrate Softtop -> Softboard so old listings match new enum
-- UPDATE public.listings SET board_type = 'Softboard' WHERE board_type = 'Softtop';

-- Optional: migrate old condition labels to new ones (run only if you have data with New/Good/Fair)
-- UPDATE public.listings SET condition = 'Used (Normal)' WHERE condition = 'Good';
-- UPDATE public.listings SET condition = 'New / Unridden' WHERE condition = 'New';
-- UPDATE public.listings SET condition = 'Needs Love' WHERE condition = 'Fair';

COMMENT ON COLUMN public.listings.fin_setup IS 'Single, Twin, Thruster, Quad, Five-fin';
COMMENT ON COLUMN public.listings.construction IS 'PU, EPS, Epoxy, Soft';
COMMENT ON COLUMN public.listing_images.is_primary IS 'Exactly one image per listing should be primary.';
