-- Pastikan trigger handle_new_user terpasang di auth.users
-- (sebelumnya fungsi sudah ada tapi trigger-nya hilang)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger updated_at untuk profiles & save_slots & leaderboard
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_save_slots_updated_at ON public.save_slots;
CREATE TRIGGER update_save_slots_updated_at
  BEFORE UPDATE ON public.save_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON public.leaderboard;
CREATE TRIGGER update_leaderboard_updated_at
  BEFORE UPDATE ON public.leaderboard
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();