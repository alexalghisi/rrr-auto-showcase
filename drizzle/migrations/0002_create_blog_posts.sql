CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  meta_title text NOT NULL,
  description text NOT NULL,
  keywords text NOT NULL DEFAULT '',
  category text NOT NULL,
  excerpt text NOT NULL,
  content jsonb NOT NULL,
  reading_minutes integer NOT NULL DEFAULT 6,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true);
CREATE INDEX blog_posts_created_idx ON public.blog_posts (created_at DESC);