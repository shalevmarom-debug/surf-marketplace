-- Recovery email for password reset (real inbox; login still uses username@example.com).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS recovery_email text;

COMMENT ON COLUMN public.profiles.recovery_email IS
  'Real email for password reset only; not used for login.';

-- Only the account owner may read their profile (includes recovery_email).
DROP POLICY IF EXISTS profiles_select_authenticated ON public.profiles;
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);
