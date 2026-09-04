-- =============================================================================
-- ROV Esports Draft Pick Overlay Platform - Full Setup & Fix Script
-- =============================================================================

-- 1. Drop ALL possible Foreign Key Constraints to prevent type mismatch errors
ALTER TABLE IF EXISTS public.match_events DROP CONSTRAINT IF EXISTS match_events_match_id_fkey;
ALTER TABLE IF EXISTS public.match_events DROP CONSTRAINT IF EXISTS match_events_user_id_fkey;
ALTER TABLE IF EXISTS public.match_actions DROP CONSTRAINT IF EXISTS match_actions_hero_id_fkey;
ALTER TABLE IF EXISTS public.match_actions DROP CONSTRAINT IF EXISTS match_actions_match_id_fkey;
ALTER TABLE IF EXISTS public.match_actions DROP CONSTRAINT IF EXISTS match_actions_created_by_fkey;
ALTER TABLE IF EXISTS public.matches DROP CONSTRAINT IF EXISTS matches_blue_team_id_fkey;
ALTER TABLE IF EXISTS public.matches DROP CONSTRAINT IF EXISTS matches_red_team_id_fkey;
ALTER TABLE IF EXISTS public.matches DROP CONSTRAINT IF EXISTS matches_template_id_fkey;
ALTER TABLE IF EXISTS public.matches DROP CONSTRAINT IF EXISTS matches_theme_id_fkey;
ALTER TABLE IF EXISTS public.matches DROP CONSTRAINT IF EXISTS matches_sponsor_id_fkey;
ALTER TABLE IF EXISTS public.matches DROP CONSTRAINT IF EXISTS matches_created_by_fkey;
ALTER TABLE IF EXISTS public.teams DROP CONSTRAINT IF EXISTS teams_created_by_fkey;
ALTER TABLE IF EXISTS public.themes DROP CONSTRAINT IF EXISTS themes_created_by_fkey;
ALTER TABLE IF EXISTS public.templates DROP CONSTRAINT IF EXISTS templates_created_by_fkey;
ALTER TABLE IF EXISTS public.sponsors DROP CONSTRAINT IF EXISTS sponsors_created_by_fkey;
ALTER TABLE IF EXISTS public.heroes DROP CONSTRAINT IF EXISTS heroes_role_check;

-- 2. Alter Existing Tables to allow Text IDs (Custom & UUID compatibility)
ALTER TABLE IF EXISTS public.heroes ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.teams ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.sponsors ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.templates ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.themes ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.matches ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.matches ALTER COLUMN blue_team_id TYPE TEXT;
ALTER TABLE IF EXISTS public.matches ALTER COLUMN red_team_id TYPE TEXT;
ALTER TABLE IF EXISTS public.matches ALTER COLUMN template_id TYPE TEXT;
ALTER TABLE IF EXISTS public.matches ALTER COLUMN theme_id TYPE TEXT;
ALTER TABLE IF EXISTS public.matches ALTER COLUMN sponsor_id TYPE TEXT;
ALTER TABLE IF EXISTS public.match_actions ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.match_actions ALTER COLUMN match_id TYPE TEXT;
ALTER TABLE IF EXISTS public.match_actions ALTER COLUMN hero_id TYPE TEXT;
ALTER TABLE IF EXISTS public.match_events ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.match_events ALTER COLUMN match_id TYPE TEXT;

-- 3. Create Logos Table
CREATE TABLE IF NOT EXISTS public.logos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'crest',
    url TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable RLS and Open Permissive Policies for Web App
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Auth User Manage Logos" ON public.logos;
DROP POLICY IF EXISTS "Public Read Logos" ON public.logos;
DROP POLICY IF EXISTS "Allow All Logos" ON public.logos;
DROP POLICY IF EXISTS "Allow All Heroes" ON public.heroes;
DROP POLICY IF EXISTS "Allow All Teams" ON public.teams;
DROP POLICY IF EXISTS "Allow All Themes" ON public.themes;
DROP POLICY IF EXISTS "Allow All Templates" ON public.templates;
DROP POLICY IF EXISTS "Allow All Sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Allow All Matches" ON public.matches;
DROP POLICY IF EXISTS "Allow All Actions" ON public.match_actions;
DROP POLICY IF EXISTS "Allow All Events" ON public.match_events;

-- Create Open Access Policies for the Esports App
CREATE POLICY "Allow All Logos" ON public.logos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Heroes" ON public.heroes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Themes" ON public.themes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Templates" ON public.templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Sponsors" ON public.sponsors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Actions" ON public.match_actions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Events" ON public.match_events FOR ALL USING (true) WITH CHECK (true);

-- 5. Create Storage Bucket 'assets' for Image Uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assets', 'assets', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'])
ON CONFLICT (id) DO UPDATE 
SET public = true, file_size_limit = 52428800;

-- Storage Policies
DROP POLICY IF EXISTS "Public View Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Assets" ON storage.objects;

CREATE POLICY "Public View Assets" ON storage.objects FOR SELECT USING ( bucket_id = 'assets' );
CREATE POLICY "Public Upload Assets" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'assets' );
CREATE POLICY "Public Update Assets" ON storage.objects FOR UPDATE USING ( bucket_id = 'assets' );
CREATE POLICY "Public Delete Assets" ON storage.objects FOR DELETE USING ( bucket_id = 'assets' );

-- 6. Seed Default Logos
INSERT INTO public.logos (id, name, type, url, is_default)
VALUES 
('logo-rov-official', 'RoV Official Logo', 'official', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80', true),
('logo-rov-png', 'Arena of Valor (Official PNG)', 'crest', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80', false),
('logo-crest-gold', 'Esports Crest Gold', 'crest', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80', false),
('logo-cyber-league', 'Cyber League', 'event', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80', false)
ON CONFLICT (id) DO NOTHING;
