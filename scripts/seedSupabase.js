const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rlwgayvbkizacjufnbrg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsd2dheXZia2l6YWNqdWZuYnJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzQ4MjI4MywiZXhwIjoyMTAzMDU4MjgzfQ.F1F5sUHZ-hwj67EoEV_X2I7Fw4f204vVfyZkH21Ifxw'
);

const SPONSORS = [
  {
    id: '91111111-1111-1111-1111-111111111111',
    name: 'ShopeePay',
    logo_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=ShopeePay&backgroundColor=ea580c',
    text: 'OFFICIAL PAYMENT PARTNER',
    url: 'https://shopeepay.co.th',
    is_active: true,
  },
  {
    id: '92222222-2222-2222-2222-222222222222',
    name: 'True 5G',
    logo_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=True5G&backgroundColor=dc2626',
    text: 'OFFICIAL 5G NETWORK',
    url: 'https://true.th',
    is_active: true,
  },
  {
    id: '93333333-3333-3333-3333-333333333333',
    name: 'realme Smartphone',
    logo_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=Realme&backgroundColor=eab308',
    text: 'OFFICIAL TOURNAMENT PHONE',
    url: 'https://realme.com',
    is_active: true,
  },
];

const THEMES = [
  {
    id: '81111111-1111-1111-1111-111111111111',
    name: 'Esports Arena',
    slug: 'esports-arena',
    description: 'Championship stadium vibe with neon cyan and crimson accents.',
    background_type: 'gradient',
    primary_color: '#00D9FF',
    secondary_color: '#FF3864',
    accent_color: '#FFD166',
    glow_color: '#00D9FF',
    frame_style: 'esports',
    font_family: 'Outfit',
    animation_preset: 'smooth',
    is_public: true,
  },
  {
    id: '82222222-2222-2222-2222-222222222222',
    name: 'Cyberpunk Neon',
    slug: 'cyberpunk-neon',
    description: 'Futuristic synthwave with magenta laser and cyber cyan.',
    background_type: 'gradient',
    primary_color: '#00F0FF',
    secondary_color: '#FF007F',
    accent_color: '#FFE600',
    glow_color: '#00F0FF',
    frame_style: 'cyber',
    font_family: 'Outfit',
    animation_preset: 'cyber',
    is_public: true,
  },
];

const TEMPLATES = [
  {
    id: '71111111-1111-1111-1111-111111111111',
    name: 'Standard 16:9 Esports Broadcast',
    slug: 'standard-16-9',
    description: 'Full 1920x1080 canvas for main streaming feed with top banners.',
    canvas_width: 1920,
    canvas_height: 1080,
    config: {},
    is_public: true,
  },
  {
    id: '72222222-2222-2222-2222-222222222222',
    name: 'RoV Pro League Official Dock',
    slug: 'rpl-official-dock',
    description: 'Bottom dock layout for RoV Pro League broadcast overlay.',
    canvas_width: 1920,
    canvas_height: 1080,
    config: {},
    is_public: true,
  },
];

async function seed() {
  console.log('Seeding Supabase Database...');

  // 1. Sponsors
  const { error: spErr } = await supabase.from('sponsors').upsert(SPONSORS);
  if (spErr) console.error('Sponsor seed error:', spErr);
  else console.log('✓ Sponsors seeded successfully!');

  // 2. Themes
  const { error: thErr } = await supabase.from('themes').upsert(THEMES);
  if (thErr) console.error('Themes seed error:', thErr);
  else console.log('✓ Themes seeded successfully!');

  // 3. Templates
  const { error: tpErr } = await supabase.from('templates').upsert(TEMPLATES);
  if (tpErr) console.error('Templates seed error:', tpErr);
  else console.log('✓ Templates seeded successfully!');

  // 4. Matches
  const demoMatch = {
    id: 'd1111111-1111-1111-1111-111111111111',
    name: 'ROV PRO LEAGUE 2026 GRAND FINALS - GAME 1',
    blue_team_id: '11111111-1111-1111-1111-111111111111',
    red_team_id: '22222222-2222-2222-2222-222222222222',
    blue_score: 1,
    red_score: 1,
    status: 'pick_phase',
    current_phase: 'BLUE_PICK_1',
    current_turn: 'blue',
    timer_seconds: 30,
    timer_running: false,
    template_id: '72222222-2222-2222-2222-222222222222',
    theme_id: '81111111-1111-1111-1111-111111111111',
    sponsor_id: '91111111-1111-1111-1111-111111111111',
    background_type: 'transparent',
  };

  const { error: matchErr } = await supabase.from('matches').upsert(demoMatch);
  if (matchErr) console.error('Match seed error:', matchErr);
  else console.log('✓ Matches seeded successfully!');

  console.log('All tables seeded in Supabase database successfully!');
}

seed();
