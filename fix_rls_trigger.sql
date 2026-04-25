-- =====================================================
-- FIX: RLS Error "new row violates row-level security"
-- Jalankan di Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Hapus RLS insert policy yang bermasalah
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- 2. Buat fungsi trigger yang berjalan sebagai SECURITY DEFINER
--    (bypass RLS, jalan sebagai postgres superuser)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, full_name, avatar_url, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULL,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Pasang trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Beri permission execute ke authenticated & anon
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
