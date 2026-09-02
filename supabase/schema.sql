-- =============================================================================
-- ROV Esports Draft Pick Overlay Platform - Supabase PostgreSQL Schema
-- =============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'organizer' CHECK (role IN ('admin', 'organizer', 'streamer', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    logo_url TEXT NOT NULL,
    primary_color VARCHAR(20) NOT NULL DEFAULT '#00D9FF',
    secondary_color VARCHAR(20) NOT NULL DEFAULT '#0B1020',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Heroes Table
CREATE TABLE IF NOT EXISTS heroes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    portrait_url TEXT NOT NULL,
    splash_url TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Tank', 'Warrior', 'Assassin', 'Mage', 'Marksman', 'Support')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Themes Table
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    background_type VARCHAR(20) NOT NULL DEFAULT 'image' CHECK (background_type IN ('image', 'video', 'gradient', 'transparent')),
    background_url TEXT,
    primary_color VARCHAR(20) NOT NULL DEFAULT '#00D9FF',
    secondary_color VARCHAR(20) NOT NULL DEFAULT '#FF3864',
    accent_color VARCHAR(20) NOT NULL DEFAULT '#FFD166',
    glow_color VARCHAR(20) NOT NULL DEFAULT '#00D9FF',
    frame_style VARCHAR(20) NOT NULL DEFAULT 'esports' CHECK (frame_style IN ('cyber', 'esports', 'fantasy', 'minimal', 'neon')),
    font_family VARCHAR(50) NOT NULL DEFAULT 'Outfit',
    animation_preset VARCHAR(20) NOT NULL DEFAULT 'smooth' CHECK (animation_preset IN ('smooth', 'explosive', 'cyber', 'glitch')),
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Templates Table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 6. Sponsors Table
CREATE TABLE IF NOT EXISTS sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    text TEXT,
    url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Matches Table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    blue_team_id UUID REFERENCES teams(id) ON DELETE RESTRICT,
    red_team_id UUID REFERENCES teams(id) ON DELETE RESTRICT,
    blue_score INTEGER NOT NULL DEFAULT 0,
    red_score INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'ban_phase', 'pick_phase', 'completed')),
    current_phase VARCHAR(30) NOT NULL DEFAULT 'WAITING',
    current_turn VARCHAR(10) NOT NULL DEFAULT 'blue' CHECK (current_turn IN ('blue', 'red')),
    timer_seconds INTEGER NOT NULL DEFAULT 30,
    timer_running BOOLEAN NOT NULL DEFAULT FALSE,
    template_id UUID REFERENCES templates(id) ON DELETE RESTRICT,
    theme_id UUID REFERENCES themes(id) ON DELETE RESTRICT,
    background_type VARCHAR(20) NOT NULL DEFAULT 'gradient',
    background_url TEXT,
    sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Match Actions Table (Picks & Bans)
CREATE TABLE IF NOT EXISTS match_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team VARCHAR(10) NOT NULL CHECK (team IN ('blue', 'red')),
    action_type VARCHAR(10) NOT NULL CHECK (action_type IN ('pick', 'ban')),
    hero_id UUID NOT NULL REFERENCES heroes(id) ON DELETE RESTRICT,
    slot_index INTEGER NOT NULL,
    phase VARCHAR(30) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_hero_per_match UNIQUE (match_id, hero_id),
    CONSTRAINT unique_slot_action UNIQUE (match_id, team, action_type, slot_index)
);

-- 9. Match Events Table (Audit Log & State Changes)
CREATE TABLE IF NOT EXISTS match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for maximum query performance
CREATE INDEX IF NOT EXISTS idx_matches_created_by ON matches(created_by);
CREATE INDEX IF NOT EXISTS idx_match_actions_match_id ON match_actions(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_heroes_role ON heroes(role);
CREATE INDEX IF NOT EXISTS idx_heroes_is_active ON heroes(is_active);

-- Auto Update Timestamp Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_heroes_updated_at BEFORE UPDATE ON heroes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON sponsors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (for OBS Overlay & Viewers)
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public Read Heroes" ON heroes FOR SELECT USING (true);
CREATE POLICY "Public Read Themes" ON themes FOR SELECT USING (is_public = true OR auth.uid() = created_by);
CREATE POLICY "Public Read Templates" ON templates FOR SELECT USING (is_public = true OR auth.uid() = created_by);
CREATE POLICY "Public Read Sponsors" ON sponsors FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public Read Match Actions" ON match_actions FOR SELECT USING (true);
CREATE POLICY "Public Read Match Events" ON match_events FOR SELECT USING (true);

-- Authenticated User Write Policies
CREATE POLICY "Auth User Manage Teams" ON teams FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth User Manage Heroes" ON heroes FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth User Manage Themes" ON themes FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth User Manage Templates" ON templates FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth User Manage Sponsors" ON sponsors FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth User Manage Matches" ON matches FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth User Manage Match Actions" ON match_actions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth User Manage Match Events" ON match_events FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- Enable Supabase Realtime Publication
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE match_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE match_events;
