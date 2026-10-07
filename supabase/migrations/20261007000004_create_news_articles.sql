-- Migration: Create news_articles table and safe admin policies
-- Run this in Supabase Dashboard -> SQL Editor

-- 1. Ensure profiles.role column exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'user';

-- 2. Ensure super_admin role is assigned to Brian Okibo
INSERT INTO public.user_roles (user_id, role_id)
SELECT id, 'super_admin'
FROM auth.users
WHERE lower(email) = 'brianokibo@gmail.com'
ON CONFLICT (user_id, role_id) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    UPDATE public.profiles
    SET role = 'super_admin'
    WHERE id IN (
      SELECT id FROM auth.users WHERE lower(email) = 'brianokibo@gmail.com'
    );
  END IF;
END $$;

-- 3. Create news_articles table
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(350) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'efootball_news',
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(150) DEFAULT 'Brian Okibo, Chief Executive Officer (CEO)',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON public.news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON public.news_articles(is_published, created_at DESC);

-- 5. Row Level Security Policies
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published news" ON public.news_articles;
CREATE POLICY "Public can view published news" ON public.news_articles
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage news" ON public.news_articles;
CREATE POLICY "Admins can manage news" ON public.news_articles
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role_id IN ('admin', 'super_admin')
      ) OR
      EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = auth.uid() AND lower(u.email) = 'brianokibo@gmail.com'
      )
    )
  );

-- 6. Grant Permissions
GRANT SELECT ON public.news_articles TO anon, authenticated;
GRANT ALL ON public.news_articles TO authenticated, service_role;

-- 7. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
