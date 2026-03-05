-- Migration: City/brand from list, normalized search, favorites, reports, sold, view_count, aliases
-- Run after 20250302_fin_setup_construction_is_primary.sql

-- 1) Listings: new columns (city_other, brand_other, normalized fields, sold, view_count)
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS city_other text,
  ADD COLUMN IF NOT EXISTS brand_other text,
  ADD COLUMN IF NOT EXISTS title_normalized text,
  ADD COLUMN IF NOT EXISTS brand_normalized text,
  ADD COLUMN IF NOT EXISTS city_normalized text,
  ADD COLUMN IF NOT EXISTS search_compact text,
  ADD COLUMN IF NOT EXISTS sold_at timestamptz,
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS listings_title_normalized_idx ON public.listings USING btree (title_normalized);
CREATE INDEX IF NOT EXISTS listings_brand_normalized_idx ON public.listings USING btree (brand_normalized);
CREATE INDEX IF NOT EXISTS listings_city_normalized_idx ON public.listings USING btree (city_normalized);
CREATE INDEX IF NOT EXISTS listings_search_compact_idx ON public.listings USING gin (to_tsvector('simple', coalesce(search_compact, '')));
CREATE INDEX IF NOT EXISTS listings_sold_at_idx ON public.listings (sold_at) WHERE sold_at IS NULL;

COMMENT ON COLUMN public.listings.city_other IS 'Free text when city = Other';
COMMENT ON COLUMN public.listings.brand_other IS 'Free text when brand = Other';
COMMENT ON COLUMN public.listings.sold_at IS 'When set, listing is sold; hide from default feed';

-- 2) Aliases (brand | city) -> canonical
CREATE TABLE IF NOT EXISTS public.aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('brand', 'city')),
  alias text NOT NULL,
  canonical text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (type, alias)
);

CREATE INDEX IF NOT EXISTS aliases_type_alias_idx ON public.aliases (type, alias);

-- 3) Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS favorites_listing_id_idx ON public.favorites (listing_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY favorites_select_own ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY favorites_insert_own ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY favorites_delete_own ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- 4) Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_listing_id_idx ON public.reports (listing_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY reports_insert_any ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY reports_select_any ON public.reports FOR SELECT USING (true);
