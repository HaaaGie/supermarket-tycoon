
-- 1. Add last_active column for online indicator
ALTER TABLE public.leaderboard
ADD COLUMN IF NOT EXISTS last_active timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_leaderboard_last_active ON public.leaderboard(last_active DESC);

-- 2. Function to auto-sync leaderboard from save_slots writes
CREATE OR REPLACE FUNCTION public.sync_leaderboard_from_save()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name text;
  v_total_earned bigint;
  v_day_reached int;
  v_prestige int;
  v_items_sold bigint;
  v_reputation int;
  v_existing_total bigint;
BEGIN
  -- Extract stats from game_state JSON (safe coercion with COALESCE)
  v_total_earned := COALESCE((NEW.game_state->>'totalEarned')::bigint, 0);
  v_day_reached := COALESCE((NEW.game_state->>'day')::int, 1);
  v_prestige    := COALESCE((NEW.game_state->>'prestigeLevel')::int, 0);
  v_items_sold  := COALESCE((NEW.game_state->>'itemsSold')::bigint, 0);
  v_reputation  := COALESCE((NEW.game_state->>'reputation')::numeric, 0)::int;

  -- Skip if no meaningful progress at all
  IF v_total_earned = 0 AND v_items_sold = 0 AND v_day_reached <= 1 AND v_prestige = 0 THEN
    RETURN NEW;
  END IF;

  -- Get display name from profile
  SELECT display_name INTO v_display_name
  FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
  v_display_name := COALESCE(v_display_name, 'Player');

  -- Only keep the best score (highest totalEarned) across save slots
  SELECT total_earned INTO v_existing_total
  FROM public.leaderboard WHERE user_id = NEW.user_id;

  IF v_existing_total IS NULL THEN
    INSERT INTO public.leaderboard
      (user_id, display_name, total_earned, day_reached, prestige_level, items_sold, reputation, last_active, updated_at)
    VALUES
      (NEW.user_id, v_display_name, v_total_earned, v_day_reached, v_prestige, v_items_sold, v_reputation, now(), now());
  ELSE
    UPDATE public.leaderboard
    SET
      display_name   = v_display_name,
      total_earned   = GREATEST(total_earned, v_total_earned),
      day_reached    = GREATEST(day_reached, v_day_reached),
      prestige_level = GREATEST(prestige_level, v_prestige),
      items_sold     = GREATEST(items_sold, v_items_sold),
      reputation     = GREATEST(reputation, v_reputation),
      last_active    = now(),
      updated_at     = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Trigger on save_slots
DROP TRIGGER IF EXISTS trg_sync_leaderboard_from_save ON public.save_slots;
CREATE TRIGGER trg_sync_leaderboard_from_save
AFTER INSERT OR UPDATE OF game_state ON public.save_slots
FOR EACH ROW
EXECUTE FUNCTION public.sync_leaderboard_from_save();

-- 4. Ensure realtime stays on
ALTER TABLE public.leaderboard REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'leaderboard'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;
  END IF;
END $$;

-- 5. Backfill leaderboard from existing save_slots (best score per user)
INSERT INTO public.leaderboard (user_id, display_name, total_earned, day_reached, prestige_level, items_sold, reputation, last_active, updated_at)
SELECT DISTINCT ON (s.user_id)
  s.user_id,
  COALESCE(p.display_name, 'Player'),
  COALESCE((s.game_state->>'totalEarned')::bigint, 0),
  COALESCE((s.game_state->>'day')::int, 1),
  COALESCE((s.game_state->>'prestigeLevel')::int, 0),
  COALESCE((s.game_state->>'itemsSold')::bigint, 0),
  COALESCE((s.game_state->>'reputation')::numeric, 0)::int,
  s.updated_at,
  now()
FROM public.save_slots s
LEFT JOIN public.profiles p ON p.user_id = s.user_id
ORDER BY s.user_id, COALESCE((s.game_state->>'totalEarned')::bigint, 0) DESC
ON CONFLICT (user_id) DO UPDATE SET
  total_earned   = GREATEST(public.leaderboard.total_earned, EXCLUDED.total_earned),
  day_reached    = GREATEST(public.leaderboard.day_reached, EXCLUDED.day_reached),
  prestige_level = GREATEST(public.leaderboard.prestige_level, EXCLUDED.prestige_level),
  items_sold     = GREATEST(public.leaderboard.items_sold, EXCLUDED.items_sold),
  reputation     = GREATEST(public.leaderboard.reputation, EXCLUDED.reputation),
  last_active    = GREATEST(public.leaderboard.last_active, EXCLUDED.last_active);
