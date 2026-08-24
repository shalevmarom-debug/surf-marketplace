-- Public read for listing images (required for feed embed: listing_images(...))
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS listing_images_select_public ON public.listing_images;
CREATE POLICY listing_images_select_public ON public.listing_images
  FOR SELECT USING (true);

-- Authenticated owners can manage their listing images (via listings.user_id)
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
