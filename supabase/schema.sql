-- =============================================================================
-- ROV Esports Draft Pick Overlay Platform - All-in-One Supabase Setup
-- คำสั่งเดียวครบ: สร้างตารางทั้งหมด, กำหนด RLS, เปิด Realtime, สร้าง Storage Bucket และใส่ Seed Data เริ่มต้น
-- นำโค้ดนี้ไปวางในเมนู SQL Editor ของ Supabase โปรเจกต์ใหม่ แล้วกด RUN ได้ทันที
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- 1. TEAMS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name VARCHAR(20) NOT NULL,
    logo_url TEXT NOT NULL,
    primary_color VARCHAR(20) NOT NULL DEFAULT '#00D9FF',
    secondary_color VARCHAR(20) NOT NULL DEFAULT '#0B1020',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 2. HEROES TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS heroes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    portrait_url TEXT NOT NULL,
    splash_url TEXT NOT NULL,
    role VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 3. THEMES TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    background_type VARCHAR(20) NOT NULL DEFAULT 'gradient',
    background_url TEXT,
    primary_color VARCHAR(20) NOT NULL DEFAULT '#00D9FF',
    secondary_color VARCHAR(20) NOT NULL DEFAULT '#FF3864',
    accent_color VARCHAR(20) NOT NULL DEFAULT '#FFD166',
    glow_color VARCHAR(20) NOT NULL DEFAULT '#00D9FF',
    frame_style VARCHAR(20) NOT NULL DEFAULT 'esports',
    font_family VARCHAR(50) NOT NULL DEFAULT 'Outfit',
    animation_preset VARCHAR(20) NOT NULL DEFAULT 'smooth',
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 4. TEMPLATES TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    canvas_width INTEGER NOT NULL DEFAULT 1920,
    canvas_height INTEGER NOT NULL DEFAULT 1080,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 5. SPONSORS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sponsors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    text TEXT,
    url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 6. LOGOS TABLE (Game Tournament Crests / Logos)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'crest',
    url TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 7. MATCHES TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    blue_team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
    red_team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
    blue_score INTEGER NOT NULL DEFAULT 0,
    red_score INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    current_phase VARCHAR(30) NOT NULL DEFAULT 'WAITING',
    current_turn VARCHAR(10) NOT NULL DEFAULT 'blue',
    timer_seconds INTEGER NOT NULL DEFAULT 30,
    timer_running BOOLEAN NOT NULL DEFAULT FALSE,
    template_id TEXT REFERENCES templates(id) ON DELETE SET NULL,
    theme_id TEXT REFERENCES themes(id) ON DELETE SET NULL,
    background_type VARCHAR(20) NOT NULL DEFAULT 'gradient',
    background_url TEXT,
    sponsor_id TEXT REFERENCES sponsors(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 8. MATCH ACTIONS TABLE (Picks & Bans)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS match_actions (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team VARCHAR(10) NOT NULL,
    action_type VARCHAR(10) NOT NULL,
    hero_id TEXT NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
    slot_index INTEGER NOT NULL,
    phase VARCHAR(30) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 9. MATCH EVENTS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS match_events (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- INDEXES FOR MAXIMUM QUERY SPEED
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_heroes_role ON heroes(role);
CREATE INDEX IF NOT EXISTS idx_heroes_is_active ON heroes(is_active);
CREATE INDEX IF NOT EXISTS idx_match_actions_match ON match_actions(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id);

-- -------------------------------------------------------------
-- AUTO-UPDATE UPDATED_AT TRIGGER
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_teams_updated_at ON teams;
CREATE TRIGGER trg_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_heroes_updated_at ON heroes;
CREATE TRIGGER trg_heroes_updated_at BEFORE UPDATE ON heroes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_themes_updated_at ON themes;
CREATE TRIGGER trg_themes_updated_at BEFORE UPDATE ON themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_templates_updated_at ON templates;
CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sponsors_updated_at ON sponsors;
CREATE TRIGGER trg_sponsors_updated_at BEFORE UPDATE ON sponsors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_matches_updated_at ON matches;
CREATE TRIGGER trg_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- เปิดให้ทั้ง Anon และ Authenticated อ่าน/เขียนได้สะดวกสำหรับ Dashboard & Overlay
-- -------------------------------------------------------------
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

-- Teams
DROP POLICY IF EXISTS "Public access teams" ON teams;
CREATE POLICY "Public access teams" ON teams FOR ALL USING (true) WITH CHECK (true);

-- Heroes
DROP POLICY IF EXISTS "Public access heroes" ON heroes;
CREATE POLICY "Public access heroes" ON heroes FOR ALL USING (true) WITH CHECK (true);

-- Themes
DROP POLICY IF EXISTS "Public access themes" ON themes;
CREATE POLICY "Public access themes" ON themes FOR ALL USING (true) WITH CHECK (true);

-- Templates
DROP POLICY IF EXISTS "Public access templates" ON templates;
CREATE POLICY "Public access templates" ON templates FOR ALL USING (true) WITH CHECK (true);

-- Sponsors
DROP POLICY IF EXISTS "Public access sponsors" ON sponsors;
CREATE POLICY "Public access sponsors" ON sponsors FOR ALL USING (true) WITH CHECK (true);

-- Logos
DROP POLICY IF EXISTS "Public access logos" ON logos;
CREATE POLICY "Public access logos" ON logos FOR ALL USING (true) WITH CHECK (true);

-- Matches
DROP POLICY IF EXISTS "Public access matches" ON matches;
CREATE POLICY "Public access matches" ON matches FOR ALL USING (true) WITH CHECK (true);

-- Match Actions
DROP POLICY IF EXISTS "Public access match_actions" ON match_actions;
CREATE POLICY "Public access match_actions" ON match_actions FOR ALL USING (true) WITH CHECK (true);

-- Match Events
DROP POLICY IF EXISTS "Public access match_events" ON match_events;
CREATE POLICY "Public access match_events" ON match_events FOR ALL USING (true) WITH CHECK (true);

-- -------------------------------------------------------------
-- REALTIME PUBLICATION (WebSocket Live Sync)
-- -------------------------------------------------------------
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE matches;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE match_actions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE match_events;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- -------------------------------------------------------------
-- STORAGE BUCKET CONFIGURATION (Bucket: assets)
-- -------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'assets',
    'assets',
    true,
    52428800, -- 50MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/apng']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies for 'assets' bucket
DROP POLICY IF EXISTS "Public Read Assets" ON storage.objects;
CREATE POLICY "Public Read Assets" ON storage.objects FOR SELECT USING (bucket_id = 'assets');

DROP POLICY IF EXISTS "Public Upload Assets" ON storage.objects;
CREATE POLICY "Public Upload Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assets');

DROP POLICY IF EXISTS "Public Update Assets" ON storage.objects;
CREATE POLICY "Public Update Assets" ON storage.objects FOR UPDATE USING (bucket_id = 'assets');

DROP POLICY IF EXISTS "Public Delete Assets" ON storage.objects;
CREATE POLICY "Public Delete Assets" ON storage.objects FOR DELETE USING (bucket_id = 'assets');

-- -------------------------------------------------------------
-- INITIAL SEED DATA (Themes & Templates เริ่มต้น)
-- -------------------------------------------------------------
INSERT INTO themes (id, name, slug, description, background_type, primary_color, secondary_color, accent_color, glow_color, frame_style, font_family, animation_preset, is_public)
VALUES
(
    '81111111-1111-1111-1111-111111111111',
    'Esports Arena',
    'esports-arena',
    'Championship stadium vibe with neon cyan and crimson accents.',
    'gradient',
    '#00D9FF',
    '#FF3864',
    '#FFD166',
    '#00D9FF',
    'esports',
    'Outfit',
    'smooth',
    true
),
(
    '82222222-2222-2222-2222-222222222222',
    'Cyberpunk Neon',
    'cyberpunk-neon',
    'Futuristic synthwave with magenta laser and cyber cyan.',
    'gradient',
    '#00F0FF',
    '#FF007F',
    '#FFE600',
    '#00F0FF',
    'cyber',
    'Outfit',
    'cyber',
    true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO templates (id, name, slug, description, canvas_width, canvas_height, config, is_public)
VALUES
(
    '71111111-1111-1111-1111-111111111111',
    'Standard 16:9 Esports Broadcast',
    'standard-16-9',
    'Full 1920x1080 canvas for main streaming feed with top banners.',
    1920,
    1080,
    '{}'::jsonb,
    true
),
(
    '72222222-2222-2222-2222-222222222222',
    'RoV Pro League Official Dock',
    'rpl-official-dock',
    'Bottom dock layout for RoV Pro League broadcast overlay.',
    1920,
    1080,
    '{}'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;
