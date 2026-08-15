CREATE TABLE public.seo_page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  intro TEXT NOT NULL,
  stock_count INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'ai',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seo_page_content TO anon;
GRANT SELECT ON public.seo_page_content TO authenticated;
GRANT ALL ON public.seo_page_content TO service_role;
ALTER TABLE public.seo_page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seo_page_content_public_read" ON public.seo_page_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "seo_page_content_admin_write" ON public.seo_page_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.content_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind TEXT NOT NULL DEFAULT 'blog',
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT content_drafts_status_check CHECK (status IN ('draft','approved','rejected'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_drafts TO authenticated;
GRANT ALL ON public.content_drafts TO service_role;
ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_drafts_admin_all" ON public.content_drafts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitors TO authenticated;
GRANT ALL ON public.competitors TO service_role;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "competitors_admin_all" ON public.competitors FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.competitor_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  summary TEXT NOT NULL DEFAULT '',
  gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  scanned_domains TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitor_reports TO authenticated;
GRANT ALL ON public.competitor_reports TO service_role;
ALTER TABLE public.competitor_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "competitor_reports_admin_all" ON public.competitor_reports FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.competitors (domain, label) VALUES
  ('autovit.ro', 'Autovit — marketplace național'),
  ('olx.ro', 'OLX Auto'),
  ('automobile.ro', 'Automobile.ro'),
  ('rarauto.ro', 'Dealer local Cluj');