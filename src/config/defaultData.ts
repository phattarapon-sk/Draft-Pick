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
    id: '72222222-2222-2222-2222-222222222222',
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
    id: '71111111-1111-1111-1111-111111111111',
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
        { id: 'slot-blue-pick-0', team: 'blue', type: 'pick', slotIndex: 0, x: 50, y: 190, width: 172, height: 600 },
        { id: 'slot-blue-pick-1', team: 'blue', type: 'pick', slotIndex: 1, x: 232, y: 190, width: 172, height: 600 },
        { id: 'slot-blue-pick-2', team: 'blue', type: 'pick', slotIndex: 2, x: 414, y: 190, width: 172, height: 600 },
        { id: 'slot-blue-pick-3', team: 'blue', type: 'pick', slotIndex: 3, x: 596, y: 190, width: 172, height: 600 },
        { id: 'slot-blue-pick-4', team: 'blue', type: 'pick', slotIndex: 4, x: 778, y: 190, width: 172, height: 600 },

        { id: 'slot-red-pick-0', team: 'red', type: 'pick', slotIndex: 0, x: 970, y: 190, width: 172, height: 600 },
        { id: 'slot-red-pick-1', team: 'red', type: 'pick', slotIndex: 1, x: 1152, y: 190, width: 172, height: 600 },
        { id: 'slot-red-pick-2', team: 'red', type: 'pick', slotIndex: 2, x: 1334, y: 190, width: 172, height: 600 },
        { id: 'slot-red-pick-3', team: 'red', type: 'pick', slotIndex: 3, x: 1516, y: 190, width: 172, height: 600 },
        { id: 'slot-red-pick-4', team: 'red', type: 'pick', slotIndex: 4, x: 1698, y: 190, width: 172, height: 600 },

        { id: 'slot-blue-ban-0', team: 'blue', type: 'ban', slotIndex: 0, x: 414, y: 840, width: 110, height: 110 },
        { id: 'slot-blue-ban-1', team: 'blue', type: 'ban', slotIndex: 1, x: 535, y: 840, width: 110, height: 110 },
        { id: 'slot-blue-ban-2', team: 'blue', type: 'ban', slotIndex: 2, x: 656, y: 840, width: 110, height: 110 },
        { id: 'slot-blue-ban-3', team: 'blue', type: 'ban', slotIndex: 3, x: 778, y: 840, width: 110, height: 110 },

        { id: 'slot-red-ban-0', team: 'red', type: 'ban', slotIndex: 0, x: 970, y: 840, width: 110, height: 110 },
        { id: 'slot-red-ban-1', team: 'red', type: 'ban', slotIndex: 1, x: 1092, y: 840, width: 110, height: 110 },
        { id: 'slot-red-ban-2', team: 'red', type: 'ban', slotIndex: 2, x: 1213, y: 840, width: 110, height: 110 },
        { id: 'slot-red-ban-3', team: 'red', type: 'ban', slotIndex: 3, x: 1334, y: 840, width: 110, height: 110 },
      ],
      timer: { x: 860, y: 35, width: 200, height: 95 },
      phaseIndicator: { x: 710, y: 135, width: 500, height: 42 },
      blueTeamHeader: { x: 50, y: 40, width: 550, height: 95 },
      redTeamHeader: { x: 1320, y: 40, width: 550, height: 95 },
      blueScore: { x: 610, y: 40, width: 90, height: 95 },
      redScore: { x: 1220, y: 40, width: 90, height: 95 },
      sponsors: { x: 760, y: 990, width: 400, height: 60 },
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
        { id: 'slot-blue-pick-0', team: 'blue', type: 'pick', slotIndex: 0, x: 60, y: 220, width: 165, height: 550 },
        { id: 'slot-blue-pick-1', team: 'blue', type: 'pick', slotIndex: 1, x: 235, y: 220, width: 165, height: 550 },
        { id: 'slot-blue-pick-2', team: 'blue', type: 'pick', slotIndex: 2, x: 410, y: 220, width: 165, height: 550 },
        { id: 'slot-blue-pick-3', team: 'blue', type: 'pick', slotIndex: 3, x: 585, y: 220, width: 165, height: 550 },
        { id: 'slot-blue-pick-4', team: 'blue', type: 'pick', slotIndex: 4, x: 760, y: 220, width: 165, height: 550 },

        { id: 'slot-red-pick-0', team: 'red', type: 'pick', slotIndex: 0, x: 995, y: 220, width: 165, height: 550 },
        { id: 'slot-red-pick-1', team: 'red', type: 'pick', slotIndex: 1, x: 1170, y: 220, width: 165, height: 550 },
        { id: 'slot-red-pick-2', team: 'red', type: 'pick', slotIndex: 2, x: 1345, y: 220, width: 165, height: 550 },
        { id: 'slot-red-pick-3', team: 'red', type: 'pick', slotIndex: 3, x: 1520, y: 220, width: 165, height: 550 },
        { id: 'slot-red-pick-4', team: 'red', type: 'pick', slotIndex: 4, x: 1695, y: 220, width: 165, height: 550 },

        { id: 'slot-blue-ban-0', team: 'blue', type: 'ban', slotIndex: 0, x: 410, y: 810, width: 100, height: 100 },
        { id: 'slot-blue-ban-1', team: 'blue', type: 'ban', slotIndex: 1, x: 525, y: 810, width: 100, height: 100 },
        { id: 'slot-blue-ban-2', team: 'blue', type: 'ban', slotIndex: 2, x: 640, y: 810, width: 100, height: 100 },
        { id: 'slot-blue-ban-3', team: 'blue', type: 'ban', slotIndex: 3, x: 755, y: 810, width: 100, height: 100 },

        { id: 'slot-red-ban-0', team: 'red', type: 'ban', slotIndex: 0, x: 1065, y: 810, width: 100, height: 100 },
        { id: 'slot-red-ban-1', team: 'red', type: 'ban', slotIndex: 1, x: 1180, y: 810, width: 100, height: 100 },
        { id: 'slot-red-ban-2', team: 'red', type: 'ban', slotIndex: 2, x: 1295, y: 810, width: 100, height: 100 },
        { id: 'slot-red-ban-3', team: 'red', type: 'ban', slotIndex: 3, x: 1410, y: 810, width: 100, height: 100 },
      ],
      timer: { x: 840, y: 40, width: 240, height: 110 },
      phaseIndicator: { x: 710, y: 155, width: 500, height: 45 },
      blueTeamHeader: { x: 60, y: 50, width: 500, height: 90 },
      redTeamHeader: { x: 1360, y: 50, width: 500, height: 90 },
      blueScore: { x: 580, y: 50, width: 90, height: 90 },
      redScore: { x: 1250, y: 50, width: 90, height: 90 },
      sponsors: { x: 760, y: 960, width: 400, height: 70 },
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
