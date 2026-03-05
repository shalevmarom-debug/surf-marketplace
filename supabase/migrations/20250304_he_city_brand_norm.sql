-- Revision: city in Hebrew (city_he, city_norm, city_compact), brand free text (brand_raw, brand_norm, brand_compact), title_norm, title_compact
-- Run after 20250303_city_brand_normalized_favorites_reports.sql

-- Listings: add new columns (Hebrew city + normalized search fields)
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS city_he text,
  ADD COLUMN IF NOT EXISTS city_norm text,
  ADD COLUMN IF NOT EXISTS city_compact text,
  ADD COLUMN IF NOT EXISTS brand_raw text,
  ADD COLUMN IF NOT EXISTS brand_norm text,
  ADD COLUMN IF NOT EXISTS brand_compact text,
  ADD COLUMN IF NOT EXISTS title_norm text,
  ADD COLUMN IF NOT EXISTS title_compact text;

CREATE INDEX IF NOT EXISTS listings_city_he_idx ON public.listings (city_he);
CREATE INDEX IF NOT EXISTS listings_city_norm_idx ON public.listings (city_norm);
CREATE INDEX IF NOT EXISTS listings_city_compact_idx ON public.listings (city_compact);
CREATE INDEX IF NOT EXISTS listings_brand_raw_idx ON public.listings (brand_raw);
CREATE INDEX IF NOT EXISTS listings_brand_norm_idx ON public.listings (brand_norm);
CREATE INDEX IF NOT EXISTS listings_brand_compact_idx ON public.listings (brand_compact);
CREATE INDEX IF NOT EXISTS listings_title_norm_idx ON public.listings (title_norm);
CREATE INDEX IF NOT EXISTS listings_title_compact_idx ON public.listings (title_compact);

COMMENT ON COLUMN public.listings.city_he IS 'City name in Hebrew (from predefined list)';
COMMENT ON COLUMN public.listings.city_norm IS 'Normalized city for search (trim, no punctuation)';
COMMENT ON COLUMN public.listings.city_compact IS 'Compact city for search (no spaces/hyphens)';
COMMENT ON COLUMN public.listings.brand_raw IS 'Brand as entered by user';
COMMENT ON COLUMN public.listings.brand_norm IS 'Normalized brand for search';
COMMENT ON COLUMN public.listings.brand_compact IS 'Compact brand for search';
COMMENT ON COLUMN public.listings.title_norm IS 'Normalized title for search';
COMMENT ON COLUMN public.listings.title_compact IS 'Compact title for search';
