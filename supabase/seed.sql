-- =============================================================================
-- ROV Esports Draft Pick Overlay Platform - Seed SQL
-- =============================================================================

-- 1. Seed Teams
INSERT INTO teams (id, name, short_name, logo_url, primary_color, secondary_color)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Talon Esports', 'TLN', 'https://api.dicebear.com/7.x/identicon/svg?seed=TalonEsports&backgroundColor=0284c7', '#00D9FF', '#041628'),
('22222222-2222-2222-2222-222222222222', 'Bacon Time', 'BAC', 'https://api.dicebear.com/7.x/identicon/svg?seed=BaconTime&backgroundColor=f43f5e', '#FF3864', '#1A0612'),
('33333333-3333-3333-3333-333333333333', 'Buriram United', 'BRU', 'https://api.dicebear.com/7.x/identicon/svg?seed=BuriramUnited&backgroundColor=1e1b4b', '#3B82F6', '#0B1026'),
('44444444-4444-4444-4444-444444444444', 'eArena', 'EA', 'https://api.dicebear.com/7.x/identicon/svg?seed=eArena&backgroundColor=7c3aed', '#A855F7', '#1B072B')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Heroes
INSERT INTO heroes (id, name, slug, image_url, portrait_url, splash_url, role, is_active)
VALUES
('a1111111-1111-1111-1111-111111111111', 'Florentino', 'florentino', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80', 'Warrior', true),
('a2222222-2222-2222-2222-222222222222', 'Tulen', 'tulen', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80', 'Mage', true),
('a3333333-3333-3333-3333-333333333333', 'Violet', 'violet', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80', 'Marksman', true),
('a4444444-4444-4444-4444-444444444444', 'Nakroth', 'nakroth', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80', 'Assassin', true),
('a5555555-5555-5555-5555-555555555555', 'Thane', 'thane', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80', 'Tank', true),
('a6666666-6666-6666-6666-666666666666', 'Aya', 'aya', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80', 'Support', true),
('a7777777-7777-7777-7777-777777777777', 'Hayate', 'hayate', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80', 'Marksman', true),
('a8888888-8888-8888-8888-888888888888', 'Raz', 'raz', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80', 'Mage', true),
('a9999999-9999-9999-9999-999999999999', 'Grakk', 'grakk', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80', 'Tank', true),
('b1111111-1111-1111-1111-111111111111', 'Lu Bu', 'lubu', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80', 'Warrior', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Themes
INSERT INTO themes (id, name, slug, description, background_type, primary_color, secondary_color, accent_color, glow_color, frame_style, font_family, animation_preset, is_public)
VALUES
('t1111111-1111-1111-1111-111111111111', 'Esports Arena', 'esports-arena', 'Championship stadium vibe with neon cyan and crimson accents.', 'gradient', '#00D9FF', '#FF3864', '#FFD166', '#00D9FF', 'esports', 'Outfit', 'smooth', true),
('t2222222-2222-2222-2222-222222222222', 'Cyberpunk Neon', 'cyberpunk-neon', 'Futuristic synthwave with magenta laser and cyber cyan.', 'gradient', '#00F0FF', '#FF007F', '#FFE600', '#00F0FF', 'cyber', 'Outfit', 'cyber', true),
('t3333333-3333-3333-3333-333333333333', 'Mythic Fantasy', 'mythic-fantasy', 'Arcane arena with emerald rune glow and imperial gold.', 'gradient', '#10B981', '#8B5CF6', '#FBBF24', '#10B981', 'fantasy', 'Outfit', 'smooth', true),
('t4444444-4444-4444-4444-444444444444', 'Minimal Stealth', 'minimal-stealth', 'Clean obsidian glassmorphism with crisp monochrome accents.', 'gradient', '#38BDF8', '#F43F5E', '#F8FAFC', '#38BDF8', 'minimal', 'Outfit', 'smooth', true),
('t5555555-5555-5555-5555-555555555555', 'Custom Sponsor Gold', 'sponsor-gold', 'Royal tournament gold theme with prominent sponsor showcase frames.', 'gradient', '#FFD166', '#FF3864', '#EAB308', '#FFD166', 'neon', 'Outfit', 'explosive', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Sponsors
INSERT INTO sponsors (id, name, logo_url, text, url, is_active)
VALUES
('s1111111-1111-1111-1111-111111111111', 'ROG Esports Gaming', 'https://api.dicebear.com/7.x/shapes/svg?seed=ROGGaming&backgroundColor=ef4444', 'POWERED BY ROG GAMING GEAR', 'https://rog.asus.com', true),
('s2222222-2222-2222-2222-222222222222', 'Monster Energy Drink', 'https://api.dicebear.com/7.x/shapes/svg?seed=MonsterEnergy&backgroundColor=10b981', 'UNLEASH THE BEAST', 'https://monsterenergy.com', true)
ON CONFLICT (id) DO NOTHING;
