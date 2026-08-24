-- Run once in Supabase SQL Editor if the feed shows "Failed to load listings".
-- Fixes public read on listings + listing_images (safe to re-run).

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS listings_select_public ON public.listings;
CREATE POLICY listings_select_public ON public.listings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS listings_insert_own ON public.listings;
CREATE POLICY listings_insert_own ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS listings_update_own ON public.listings;
CREATE POLICY listings_update_own ON public.listings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS listings_delete_own ON public.listings;
CREATE POLICY listings_delete_own ON public.listings
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS listing_images_select_public ON public.listing_images;
CREATE POLICY listing_images_select_public ON public.listing_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS listing_images_insert_own ON public.listing_images;
CREATE POLICY listing_images_insert_own ON public.listing_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_images.listing_id
        AND listings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS listing_images_update_own ON public.listing_images;
CREATE POLICY listing_images_update_own ON public.listing_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_images.listing_id
        AND listings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS listing_images_delete_own ON public.listing_images;
CREATE POLICY listing_images_delete_own ON public.listing_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_images.listing_id
        AND listings.user_id = auth.uid()
    )
  );
