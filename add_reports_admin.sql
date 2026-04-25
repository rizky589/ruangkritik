-- =====================================================
-- Tambahan fitur: Reports & Admin
-- Jalankan di Supabase → SQL Editor
-- =====================================================

-- 1. Tambah kolom is_admin ke tabel users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Set admin pertama (ganti dengan email admin kamu)
-- UPDATE public.users SET is_admin = TRUE WHERE email = 'admin@email.com';

-- 3. Tabel REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id    UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  comment_id  UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  status      TEXT DEFAULT 'pending',  -- pending | reviewed | dismissed
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT report_target CHECK (
    (topic_id IS NOT NULL AND comment_id IS NULL) OR
    (comment_id IS NOT NULL AND topic_id IS NULL)
  )
);

-- 4. RLS untuk reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Reporters can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 5. Admins dapat hapus topics & comments
CREATE POLICY "Admins can delete any topic"
  ON public.topics FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can delete any comment"
  ON public.comments FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 6. Index untuk reports
CREATE INDEX IF NOT EXISTS idx_reports_topic_id   ON public.reports(topic_id);
CREATE INDEX IF NOT EXISTS idx_reports_comment_id ON public.reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_reports_status     ON public.reports(status);
