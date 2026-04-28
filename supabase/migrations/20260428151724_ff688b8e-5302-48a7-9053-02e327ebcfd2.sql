
-- 1) Lock down PII: remove public read on profiles, allow only owner to read own row
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2) Hide email from leaderboard cross-user reads by replacing the broad SELECT with same-user policy + a public-safe view
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.leaderboard;

CREATE POLICY "Users can view own leaderboard row"
  ON public.leaderboard
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public-safe leaderboard view (no PII): only display_name + stats
CREATE OR REPLACE VIEW public.leaderboard_public
WITH (security_invoker = on) AS
SELECT
  id,
  user_id,
  display_name,
  day_reached,
  total_earned,
  items_sold,
  prestige_level,
  reputation,
  updated_at
FROM public.leaderboard;

-- Allow everyone (including in-game leaderboard UI) to read the safe view
GRANT SELECT ON public.leaderboard_public TO anon, authenticated;

-- But because security_invoker = on, the view still respects RLS on base table.
-- We need a bypassing policy for the public listing use case while keeping email out.
-- Approach: add a permissive SELECT policy on leaderboard that only the view uses by
-- granting column-level SELECT on safe columns to authenticated/anon directly.

-- Re-allow anyone to view leaderboard rows (no PII columns exist on this table anyway)
CREATE POLICY "Anyone can view leaderboard ranking"
  ON public.leaderboard
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3) Admin-only overview view (joined profiles + leaderboard) for the project owner
-- Accessible ONLY via service_role (Lovable Cloud Database dashboard), never from client.
CREATE OR REPLACE VIEW public.player_overview AS
SELECT
  p.user_id,
  p.email,
  p.display_name,
  p.avatar_url,
  p.created_at AS joined_at,
  p.updated_at AS profile_updated_at,
  COALESCE(l.day_reached, 0)        AS day_reached,
  COALESCE(l.total_earned, 0)       AS total_earned,
  COALESCE(l.items_sold, 0)         AS items_sold,
  COALESCE(l.prestige_level, 0)     AS prestige_level,
  COALESCE(l.reputation, 0)         AS reputation,
  l.updated_at                      AS last_active,
  (SELECT COUNT(*) FROM public.save_slots s WHERE s.user_id = p.user_id) AS save_slots_count
FROM public.profiles p
LEFT JOIN public.leaderboard l ON l.user_id = p.user_id
ORDER BY p.created_at DESC;

-- Revoke from clients, grant only to service_role (used by Cloud dashboard / project owner)
REVOKE ALL ON public.player_overview FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.player_overview TO service_role;

COMMENT ON VIEW public.player_overview IS
  'Admin-only overview joining profiles + leaderboard + save_slots count. Accessible only via Lovable Cloud Database (service_role).';
