-- Ensure listings feed is visible to everyone (including unauthenticated users).
-- Public SELECT; authenticated users can insert their own and update/delete own rows.
--
-- If listings already has RLS and other policies, run only the SELECT policy
-- in Supabase SQL editor: CREATE POLICY listings_select_public ON public.listings FOR SELECT USING (true);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authenticated) can read all listings (public feed)
CREATE POLICY listings_select_public ON public.listings
  FOR SELECT USING (true);

-- Authenticated users can insert a listing only with their own user_id
CREATE POLICY listings_insert_own ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update/delete only their own listings
CREATE POLICY listings_update_own ON public.listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY listings_delete_own ON public.listings
  FOR DELETE USING (auth.uid() = user_id);

-- Anyone (anon or authenticated) can read all listings (public feed)
CREATE POLICY listings_select_public ON public.listings
  FOR SELECT USING (true);

-- Authenticated users can insert a listing only with their own user_id
CREATE POLICY listings_insert_own ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update/delete only their own listings
CREATE POLICY listings_update_own ON public.listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY listings_delete_own ON public.listings
  FOR DELETE USING (auth.uid() = user_id);
