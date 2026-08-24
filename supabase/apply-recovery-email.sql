-- Recovery email for password reset. Run in Supabase SQL Editor.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS recovery_email text;

COMMENT ON COLUMN public.profiles.recovery_email IS
  'Real email for password reset only; not used for login.';

DROP POLICY IF EXISTS profiles_select_authenticated ON public.profiles;
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);
