import { Hero, Team, Theme, Template, Sponsor, Match, MatchPhase, GameLogo } from '@/types';

export const DEFAULT_LOGOS: GameLogo[] = [];

export const DEFAULT_HEROES: Hero[] = [];

export const DEFAULT_TEAMS: Team[] = [];


export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'theme-arena',
    name: 'Esports Arena',
    slug: 'esports-arena',
    description: 'Vibrant championship stadium atmosphere with deep space navy and high-contrast neon accents.',
    background_type: 'gradient',
    background_url: '',
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
    id: 'theme-cyberpunk',
    name: 'Cyberpunk Neon',
    slug: 'cyberpunk-neon',
    description: 'High-tech dark synthwave aesthetic with laser violet and electric cyan neon lines.',
    background_type: 'gradient',
    background_url: '',
    primary_color: '#00F0FF',
    secondary_color: '#FF007F',
    accent_color: '#FFE600',
    glow_color: '#00F0FF',
    frame_style: 'cyber',
    font_family: 'Outfit',
    animation_preset: 'cyber',
    is_public: true,
  },
  {
    id: 'theme-fantasy',
    name: 'Mythic Fantasy',
    slug: 'mythic-fantasy',
    description: 'Arcane magical arena with emerald runes and imperial gold borders.',
    background_type: 'gradient',
    background_url: '',
    primary_color: '#10B981',
    secondary_color: '#8B5CF6',
    accent_color: '#FBBF24',
    glow_color: '#10B981',
    frame_style: 'fantasy',
    font_family: 'Outfit',
    animation_preset: 'smooth',
    is_public: true,
  },
  {
    id: 'theme-minimal',
    name: 'Minimal Stealth',
    slug: 'minimal-stealth',
    description: 'Ultra-clean obsidian glassmorphism with crisp monochrome accents.',
    background_type: 'gradient',
    background_url: '',
    primary_color: '#38BDF8',
    secondary_color: '#F43F5E',
    accent_color: '#F8FAFC',
    glow_color: '#38BDF8',
    frame_style: 'minimal',
    font_family: 'Outfit',
    animation_preset: 'smooth',
    is_public: true,
  },
  {
    id: 'theme-sponsor-gold',
    name: 'Custom Sponsor Gold',
    slug: 'sponsor-gold',
    description: 'Royal tournament gold theme with prominent sponsor showcase frames.',
    background_type: 'gradient',
    background_url: '',
    primary_color: '#FFD166',
    secondary_color: '#FF3864',
    accent_color: '#EAB308',
    glow_color: '#FFD166',
    frame_style: 'neon',
    font_family: 'Outfit',
    animation_preset: 'explosive',
    is_public: true,
  }
];

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: '2',
    name: '1. RoV Pro League (Official Lower Dock)',
    slug: 'rpl-official-dock',
    description: 'Official Garena RoV Pro League Bottom Dock with open top 65% for 3D stage/camera and full lower-deck hero picks, bans, scores & player names.',
    canvas_width: 1920,
    canvas_height: 1080,
    is_public: true,
    preview_url: '',
    config: {
      canvas: {
        width: 1920,
        height: 1080,
      },
      heroSlots: [
        { id: 'slot-blue-pick-0', team: 'blue', type: 'pick', slotIndex: 0, x: 10, y: 790, width: 150, height: 260 },
        { id: 'slot-blue-pick-1', team: 'blue', type: 'pick', slotIndex: 1, x: 165, y: 790, width: 150, height: 260 },
        { id: 'slot-blue-pick-2', team: 'blue', type: 'pick', slotIndex: 2, x: 320, y: 790, width: 150, height: 260 },
        { id: 'slot-blue-pick-3', team: 'blue', type: 'pick', slotIndex: 3, x: 475, y: 790, width: 150, height: 260 },
        { id: 'slot-blue-pick-4', team: 'blue', type: 'pick', slotIndex: 4, x: 630, y: 790, width: 150, height: 260 },

        { id: 'slot-red-pick-0', team: 'red', type: 'pick', slotIndex: 0, x: 1140, y: 790, width: 150, height: 260 },
        { id: 'slot-red-pick-1', team: 'red', type: 'pick', slotIndex: 1, x: 1295, y: 790, width: 150, height: 260 },
        { id: 'slot-red-pick-2', team: 'red', type: 'pick', slotIndex: 2, x: 1450, y: 790, width: 150, height: 260 },
        { id: 'slot-red-pick-3', team: 'red', type: 'pick', slotIndex: 3, x: 1605, y: 790, width: 150, height: 260 },
        { id: 'slot-red-pick-4', team: 'red', type: 'pick', slotIndex: 4, x: 1760, y: 790, width: 150, height: 260 },

        { id: 'slot-blue-ban-0', team: 'blue', type: 'ban', slotIndex: 0, x: 105, y: 725, width: 66, height: 56 },
        { id: 'slot-blue-ban-1', team: 'blue', type: 'ban', slotIndex: 1, x: 175, y: 725, width: 66, height: 56 },
        { id: 'slot-blue-ban-2', team: 'blue', type: 'ban', slotIndex: 2, x: 245, y: 725, width: 66, height: 56 },
        { id: 'slot-blue-ban-3', team: 'blue', type: 'ban', slotIndex: 3, x: 315, y: 725, width: 66, height: 56 },

        { id: 'slot-red-ban-0', team: 'red', type: 'ban', slotIndex: 0, x: 1540, y: 725, width: 66, height: 56 },
        { id: 'slot-red-ban-1', team: 'red', type: 'ban', slotIndex: 1, x: 1610, y: 725, width: 66, height: 56 },
        { id: 'slot-red-ban-2', team: 'red', type: 'ban', slotIndex: 2, x: 1680, y: 725, width: 66, height: 56 },
        { id: 'slot-red-ban-3', team: 'red', type: 'ban', slotIndex: 3, x: 1750, y: 725, width: 66, height: 56 },
      ],
      timer: { x: 790, y: 790, width: 340, height: 260 },
      phaseIndicator: { x: 760, y: 650, width: 400, height: 45 },
      blueTeamHeader: { x: 790, y: 800, width: 100, height: 80 },
      redTeamHeader: { x: 1030, y: 800, width: 100, height: 80 },
      blueScore: { x: 890, y: 800, width: 70, height: 80 },
      redScore: { x: 960, y: 800, width: 70, height: 80 },
      sponsors: { x: 790, y: 715, width: 340, height: 65 },
      decorations: {
        centerVsText: false,
        showGridLines: false,
        showScanlines: false,
      },
    },
  },
  {
    id: '1',
    name: '2. Standard Full Screen (16:9 Standard)',
    slug: 'standard-16-9',
    description: 'Official 5v5 MOBA Esports Broadcast layout with 5 side-by-side hero slots per team and lower ban bays.',
    canvas_width: 1920,
    canvas_height: 1080,
    is_public: true,
    preview_url: '',
    config: {
      canvas: {
        width: 1920,
        height: 1080,
      },
      heroSlots: [
        { id: 'slot-blue-pick-0', team: 'blue', type: 'pick', slotIndex: 0, x: 28, y: 190, width: 168, height: 600 },
        { id: 'slot-blue-pick-1', team: 'blue', type: 'pick', slotIndex: 1, x: 204, y: 190, width: 168, height: 600 },
        { id: 'slot-blue-pick-2', team: 'blue', type: 'pick', slotIndex: 2, x: 380, y: 190, width: 168, height: 600 },
        { id: 'slot-blue-pick-3', team: 'blue', type: 'pick', slotIndex: 3, x: 556, y: 190, width: 168, height: 600 },
        { id: 'slot-blue-pick-4', team: 'blue', type: 'pick', slotIndex: 4, x: 732, y: 190, width: 168, height: 600 },

        { id: 'slot-red-pick-0', team: 'red', type: 'pick', slotIndex: 0, x: 1020, y: 190, width: 168, height: 600 },
        { id: 'slot-red-pick-1', team: 'red', type: 'pick', slotIndex: 1, x: 1196, y: 190, width: 168, height: 600 },
        { id: 'slot-red-pick-2', team: 'red', type: 'pick', slotIndex: 2, x: 1372, y: 190, width: 168, height: 600 },
        { id: 'slot-red-pick-3', team: 'red', type: 'pick', slotIndex: 3, x: 1548, y: 190, width: 168, height: 600 },
        { id: 'slot-red-pick-4', team: 'red', type: 'pick', slotIndex: 4, x: 1724, y: 190, width: 168, height: 600 },

        { id: 'slot-blue-ban-0', team: 'blue', type: 'ban', slotIndex: 0, x: 223, y: 825, width: 110, height: 110 },
        { id: 'slot-blue-ban-1', team: 'blue', type: 'ban', slotIndex: 1, x: 347, y: 825, width: 110, height: 110 },
        { id: 'slot-blue-ban-2', team: 'blue', type: 'ban', slotIndex: 2, x: 471, y: 825, width: 110, height: 110 },
        { id: 'slot-blue-ban-3', team: 'blue', type: 'ban', slotIndex: 3, x: 595, y: 825, width: 110, height: 110 },

        { id: 'slot-red-ban-0', team: 'red', type: 'ban', slotIndex: 0, x: 1215, y: 825, width: 110, height: 110 },
        { id: 'slot-red-ban-1', team: 'red', type: 'ban', slotIndex: 1, x: 1339, y: 825, width: 110, height: 110 },
        { id: 'slot-red-ban-2', team: 'red', type: 'ban', slotIndex: 2, x: 1463, y: 825, width: 110, height: 110 },
        { id: 'slot-red-ban-3', team: 'red', type: 'ban', slotIndex: 3, x: 1587, y: 825, width: 110, height: 110 },
      ],
      timer: { x: 880, y: 40, width: 160, height: 95 },
      phaseIndicator: { x: 880, y: 40, width: 160, height: 95 },
      blueTeamHeader: { x: 28, y: 40, width: 735, height: 95 },
      redTeamHeader: { x: 1157, y: 40, width: 735, height: 95 },
      blueScore: { x: 775, y: 40, width: 95, height: 95 },
      redScore: { x: 1050, y: 40, width: 95, height: 95 },
      sponsors: { x: 0, y: 1000, width: 1920, height: 80 },
      decorations: {
        centerVsText: true,
        showGridLines: true,
        showScanlines: true,
      },
    },
  },
  {
    id: 'template-split-arena',
    name: '3. Split Arena Cinematic (16:9 Cinematic)',
    slug: 'split-arena-cinematic',
    description: 'Wide cinematic broadcast layout with dynamic staggered player cards and elevated center timer.',
    canvas_width: 1920,
    canvas_height: 1080,
    is_public: true,
    preview_url: '',
    config: {
      canvas: {
        width: 1920,
        height: 1080,
      },
      heroSlots: [
        { id: 'slot-blue-pick-0', team: 'blue', type: 'pick', slotIndex: 0, x: 28, y: 220, width: 168, height: 550 },
        { id: 'slot-blue-pick-1', team: 'blue', type: 'pick', slotIndex: 1, x: 204, y: 220, width: 168, height: 550 },
        { id: 'slot-blue-pick-2', team: 'blue', type: 'pick', slotIndex: 2, x: 380, y: 220, width: 168, height: 550 },
        { id: 'slot-blue-pick-3', team: 'blue', type: 'pick', slotIndex: 3, x: 556, y: 220, width: 168, height: 550 },
        { id: 'slot-blue-pick-4', team: 'blue', type: 'pick', slotIndex: 4, x: 732, y: 220, width: 168, height: 550 },

        { id: 'slot-red-pick-0', team: 'red', type: 'pick', slotIndex: 0, x: 1020, y: 220, width: 168, height: 550 },
        { id: 'slot-red-pick-1', team: 'red', type: 'pick', slotIndex: 1, x: 1196, y: 220, width: 168, height: 550 },
        { id: 'slot-red-pick-2', team: 'red', type: 'pick', slotIndex: 2, x: 1372, y: 220, width: 168, height: 550 },
        { id: 'slot-red-pick-3', team: 'red', type: 'pick', slotIndex: 3, x: 1548, y: 220, width: 168, height: 550 },
        { id: 'slot-red-pick-4', team: 'red', type: 'pick', slotIndex: 4, x: 1724, y: 220, width: 168, height: 550 },

        { id: 'slot-blue-ban-0', team: 'blue', type: 'ban', slotIndex: 0, x: 223, y: 810, width: 110, height: 110 },
        { id: 'slot-blue-ban-1', team: 'blue', type: 'ban', slotIndex: 1, x: 347, y: 810, width: 110, height: 110 },
        { id: 'slot-blue-ban-2', team: 'blue', type: 'ban', slotIndex: 2, x: 471, y: 810, width: 110, height: 110 },
        { id: 'slot-blue-ban-3', team: 'blue', type: 'ban', slotIndex: 3, x: 595, y: 810, width: 110, height: 110 },

        { id: 'slot-red-ban-0', team: 'red', type: 'ban', slotIndex: 0, x: 1215, y: 810, width: 110, height: 110 },
        { id: 'slot-red-ban-1', team: 'red', type: 'ban', slotIndex: 1, x: 1339, y: 810, width: 110, height: 110 },
        { id: 'slot-red-ban-2', team: 'red', type: 'ban', slotIndex: 2, x: 1463, y: 810, width: 110, height: 110 },
        { id: 'slot-red-ban-3', team: 'red', type: 'ban', slotIndex: 3, x: 1587, y: 810, width: 110, height: 110 },
      ],
      timer: { x: 880, y: 45, width: 160, height: 90 },
      phaseIndicator: { x: 880, y: 45, width: 160, height: 90 },
      blueTeamHeader: { x: 28, y: 45, width: 735, height: 90 },
      redTeamHeader: { x: 1157, y: 45, width: 735, height: 90 },
      blueScore: { x: 775, y: 45, width: 95, height: 90 },
      redScore: { x: 1050, y: 45, width: 95, height: 90 },
      sponsors: { x: 0, y: 1000, width: 1920, height: 80 },
      decorations: {
        centerVsText: true,
        showGridLines: true,
        showScanlines: true,
      },
    },
  }
];

export const DEFAULT_SPONSORS: Sponsor[] = [];


export const DRAFT_PHASE_ORDER: MatchPhase[] = [
  'WAITING',
  'BLUE_BAN_1',
  'RED_BAN_1',
  'BLUE_BAN_2',
  'RED_BAN_2',
  'BLUE_PICK_1',
  'RED_PICK_1',
  'RED_PICK_2',
  'BLUE_PICK_2',
  'BLUE_PICK_3',
  'RED_PICK_3',
  'RED_BAN_3',
  'BLUE_BAN_3',
  'RED_BAN_4',
  'BLUE_BAN_4',
  'RED_PICK_4',
  'BLUE_PICK_4',
  'BLUE_PICK_5',
  'RED_PICK_5',
  'READY',
  'COMPLETED',
];

export function getPhaseInfo(phase: MatchPhase): {
  title: string;
  team: 'blue' | 'red' | 'neutral';
  type: 'pick' | 'ban' | 'waiting' | 'ready';
  slotIndex: number;
} {
  if (phase === 'WAITING') return { title: 'WAITING FOR START', team: 'neutral', type: 'waiting', slotIndex: -1 };
  if (phase === 'READY') return { title: 'DRAFT COMPLETE - FINAL PREP', team: 'neutral', type: 'ready', slotIndex: -1 };
  if (phase === 'COMPLETED') return { title: 'MATCH IN PROGRESS', team: 'neutral', type: 'ready', slotIndex: -1 };

  const isBlue = phase.startsWith('BLUE_');
  const isPick = phase.includes('_PICK_');
  const team = isBlue ? 'blue' : 'red';
  const type = isPick ? 'pick' : 'ban';
  
  // Extract number from phase string e.g. BLUE_PICK_1 -> 0
  const match = phase.match(/\d+$/);
  const num = match ? parseInt(match[0], 10) - 1 : 0;

  const title = `${isBlue ? 'BLUE TEAM' : 'RED TEAM'} ${isPick ? 'PICK' : 'BAN'} #${(match ? match[0] : '1')}`;

  return { title, team, type, slotIndex: num };
}
