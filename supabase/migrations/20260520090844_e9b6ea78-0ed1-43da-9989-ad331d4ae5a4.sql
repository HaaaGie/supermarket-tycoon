
-- Revoke execute from anon/authenticated so only the trigger (internal) calls it
REVOKE EXECUTE ON FUNCTION public.sync_leaderboard_from_save() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_leaderboard_from_save() FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_leaderboard_from_save() FROM authenticated;

-- Ensure user_id is unique in leaderboard (one row per player)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'leaderboard_user_id_key' AND conrelid = 'public.leaderboard'::regclass
  ) THEN
    ALTER TABLE public.leaderboard ADD CONSTRAINT leaderboard_user_id_key UNIQUE (user_id);
  END IF;
END $$;
