-- =====================================================
-- RUANG KRITIK — Supabase SQL Schema
-- Jalankan di: Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. USERS (profil publik, extend auth.users)
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TOPICS
CREATE TABLE public.topics (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  content        TEXT NOT NULL,
  category       TEXT DEFAULT 'Lainnya',
  likes_count    INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMMENTS
CREATE TABLE public.comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id   UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content    TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. IMAGES (gambar untuk topics & comments)
CREATE TABLE public.images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id   UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images   ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users are viewable by everyone"   ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"     ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"     ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- TOPICS policies
CREATE POLICY "Topics are viewable by everyone"  ON public.topics FOR SELECT USING (true);
CREATE POLICY "Auth users can create topics"     ON public.topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own topics"      ON public.topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own topics"      ON public.topics FOR DELETE USING (auth.uid() = user_id);
-- Allow updating likes/comments count by anyone (for reaction feature)
CREATE POLICY "Anyone can update topic counts"   ON public.topics FOR UPDATE USING (true) WITH CHECK (true);

-- COMMENTS policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Auth users can create comments"    ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments"     ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- IMAGES policies
CREATE POLICY "Images are viewable by everyone"   ON public.images FOR SELECT USING (true);
CREATE POLICY "Auth users can upload images"      ON public.images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own images"       ON public.images FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- STORAGE BUCKET
-- =====================================================

-- Buat bucket 'images' di Supabase Storage (Dashboard > Storage)
-- Atau jalankan SQL berikut:
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public images are viewable by everyone"
  ON storage.objects FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Auth users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images' AND auth.uid() = owner);

-- =====================================================
-- INDEXES (performa query)
-- =====================================================
CREATE INDEX idx_topics_user_id    ON public.topics(user_id);
CREATE INDEX idx_topics_category   ON public.topics(category);
CREATE INDEX idx_topics_created_at ON public.topics(created_at DESC);
CREATE INDEX idx_comments_topic_id ON public.comments(topic_id);
CREATE INDEX idx_images_topic_id   ON public.images(topic_id);
CREATE INDEX idx_images_comment_id ON public.images(comment_id);
