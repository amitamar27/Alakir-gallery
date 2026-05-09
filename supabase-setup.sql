-- ============================================================
-- ALAKIR GALLERY — Supabase Setup
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Items (one row per painting)
CREATE TABLE IF NOT EXISTS public.items (
  id          TEXT PRIMARY KEY,
  num         INTEGER NOT NULL DEFAULT 1,
  title       TEXT    NOT NULL DEFAULT 'Untitled',
  price       INTEGER NOT NULL DEFAULT 0,
  img         TEXT             DEFAULT '',
  status      TEXT             DEFAULT 'available',
  featured    BOOLEAN          DEFAULT false,
  description TEXT             DEFAULT '',
  year        TEXT             DEFAULT '2026',
  medium      TEXT             DEFAULT 'Mixed Media',
  dimensions  TEXT             DEFAULT '',
  sort_order  INTEGER          DEFAULT 0,
  updated_at  TIMESTAMPTZ      DEFAULT NOW()
);

-- Settings (key/value pairs)
CREATE TABLE IF NOT EXISTS public.settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Orders (customer purchases)
CREATE TABLE IF NOT EXISTS public.orders (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  total       INTEGER     DEFAULT 0,
  customer    JSONB       DEFAULT '{}',
  items       JSONB       DEFAULT '[]',
  status      TEXT        DEFAULT 'pending',
  payment_ref TEXT        DEFAULT ''
);

-- items & settings: public read, open write (gallery data is non-sensitive)
ALTER TABLE public.items    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- orders: RLS enabled — customers can INSERT, nobody can SELECT without auth
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon insert orders" ON public.orders;
CREATE POLICY "Anon insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- To let the admin READ orders, run this after setting up Supabase Auth:
-- CREATE POLICY "Auth read orders" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL DEFAULT '',
  subtitle     TEXT DEFAULT '',
  event_date   DATE NOT NULL,
  img          TEXT DEFAULT '',
  event_type   TEXT DEFAULT '',
  register_url TEXT DEFAULT '',
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS public.subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status     TEXT DEFAULT 'active'
);

ALTER TABLE public.subscribers DISABLE ROW LEVEL SECURITY;

-- Storage bucket for painting images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read gallery-images"   ON storage.objects;
DROP POLICY IF EXISTS "Admin insert gallery-images"  ON storage.objects;
DROP POLICY IF EXISTS "Admin update gallery-images"  ON storage.objects;
DROP POLICY IF EXISTS "Admin delete gallery-images"  ON storage.objects;

CREATE POLICY "Public read gallery-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Admin insert gallery-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-images');

CREATE POLICY "Admin update gallery-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Admin delete gallery-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery-images');
