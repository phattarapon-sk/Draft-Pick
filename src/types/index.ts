export type HeroRole = 'Tank' | 'Warrior' | 'Assassin' | 'Mage' | 'Marksman' | 'Support' | (string & {});

export interface Hero {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  portrait_url: string;
  splash_url: string;
  role: HeroRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TeamPlayer {
  name: string;
  photo_url?: string;
  bg_opacity?: number; // 0 - 100
}

export interface Team {
  id: string;
  name: string;
  short_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  players?: string[]; // 5 Player IGNs
  player_roster?: TeamPlayer[]; // 5 Players with IGN & Background Photo
  bg_opacity?: number; // default player background opacity (0 - 100, default: 75)
  created_at?: string;
  updated_at?: string;
}

export type BackgroundType = 'image' | 'video' | 'gradient' | 'transparent' | 'green_screen';

export interface BackgroundConfig {
  type: BackgroundType;
  url?: string;
  overlay?: string;
  opacity?: number;
  position?: string;
  size?: string;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  description: string;
  background_type: BackgroundType;
  background_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  glow_color: string;
  frame_style: 'cyber' | 'esports' | 'fantasy' | 'minimal' | 'neon';
  font_family: string;
  animation_preset: 'smooth' | 'explosive' | 'cyber' | 'glitch';
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HeroSlotConfig {
  id: string;
  team: 'blue' | 'red';
  type: 'pick' | 'ban';
  slotIndex: number; // 0..4 for picks, 0..3 for bans
  x: number; // in 1920x1080 canvas coordinates
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scale?: number;
  zIndex?: number;
}

export interface ElementPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
  scale?: number;
}

export interface TemplateConfig {
  canvas: {
    width: number; // 1920
    height: number; // 1080
  };
  heroSlots: HeroSlotConfig[];
  timer: ElementPosition;
  phaseIndicator: ElementPosition;
  blueTeamHeader: ElementPosition;
  redTeamHeader: ElementPosition;
  blueScore: ElementPosition;
  redScore: ElementPosition;
  sponsors: ElementPosition;
  decorations?: {
    centerVsText?: boolean;
    showGridLines?: boolean;
    showScanlines?: boolean;
  };
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  canvas_width: number;
  canvas_height: number;
  config: TemplateConfig;
  preview_url: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  text?: string;
  url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GameLogo {
  id: string;
  name: string;
  logo_url: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type MatchStatus = 'waiting' | 'ban_phase' | 'pick_phase' | 'completed';
export type MatchPhase = 
  | 'WAITING' 
  | 'BLUE_BAN_1' | 'RED_BAN_1' | 'BLUE_BAN_2' | 'RED_BAN_2'
  | 'BLUE_PICK_1' | 'RED_PICK_1' | 'RED_PICK_2' | 'BLUE_PICK_2' | 'BLUE_PICK_3' | 'RED_PICK_3'
  | 'RED_BAN_3' | 'BLUE_BAN_3' | 'RED_BAN_4' | 'BLUE_BAN_4'
  | 'RED_PICK_4' | 'BLUE_PICK_4' | 'BLUE_PICK_5' | 'RED_PICK_5'
  | 'READY' | 'COMPLETED';

export interface MatchAction {
  id: string;
  match_id: string;
  team: 'blue' | 'red';
  action_type: 'pick' | 'ban';
  hero_id: string;
  slot_index: number;
  phase: string;
  created_at: string;
  created_by?: string;
  hero?: Hero;
}

export interface Match {
  id: string;
  name: string;
  blue_team_id: string;
  red_team_id: string;
  blue_score: number;
  red_score: number;
  status: MatchStatus;
  current_phase: MatchPhase;
  current_turn: 'blue' | 'red';
  timer_seconds: number;
  timer_running: boolean;
  timer_ends_at?: number; // Epoch timestamp in ms when running
  bo_format?: string; // 'BO 1' | 'BO 2' | 'BO 3' | 'BO 5' | 'BO 7'
  subtitle?: string; // e.g. 'REGULAR SEASON : TEN VS FS : GAME 2 [BO5]'
  blue_players?: string[]; // 5 IGNs
  red_players?: string[]; // 5 IGNs
  game_logo_url?: string; // Custom Game Logo PNG URL
  player_bg_opacity?: number; // 0 - 100 opacity percentage (default: 75)
  template_id: string;
  theme_id: string;
  background_type: BackgroundType;
  background_url?: string;
  sponsor_id?: string;
  sponsor_ids?: string[]; // Array of selected sponsor IDs for rotating loop
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Computed / joined fields
  blue_team?: Team;
  red_team?: Team;
  template?: Template;
  theme?: Theme;
  sponsor?: Sponsor;
  sponsors_list?: Sponsor[];
  actions?: MatchAction[];
}

export interface MatchEvent {
  id: string;
  match_id: string;
  user_id?: string;
  event_type: 'PICK_HERO' | 'BAN_HERO' | 'UNDO_ACTION' | 'RESET_MATCH' | 'SWAP_TEAMS' | 'CHANGE_PHASE' | 'CHANGE_TIMER' | 'CHANGE_SCORE' | 'CHANGE_THEME' | 'CHANGE_TEMPLATE' | 'CHANGE_BACKGROUND';
  payload: Record<string, any>;
  created_at: string;
}

