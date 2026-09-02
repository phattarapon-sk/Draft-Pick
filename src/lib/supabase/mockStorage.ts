import { Hero, Team, Theme, Template, Sponsor, GameLogo, Match, MatchAction, MatchEvent, MatchPhase } from '@/types';
import { DEFAULT_HEROES, DEFAULT_TEAMS, DEFAULT_THEMES, DEFAULT_TEMPLATES, DEFAULT_SPONSORS, DEFAULT_LOGOS, DEMO_MATCH, DRAFT_PHASE_ORDER, getPhaseInfo } from '@/config/defaultData';
import { supabase, isSupabaseConfigured } from './client';

const STORAGE_KEYS = {
  HEROES: 'rov_esports_heroes',
  TEAMS: 'rov_esports_teams',
  THEMES: 'rov_esports_themes',
  TEMPLATES: 'rov_esports_templates',
  SPONSORS: 'rov_esports_sponsors',
  LOGOS: 'rov_esports_logos',
  MATCHES: 'rov_esports_matches',
  ACTIONS: 'rov_esports_actions',
  EVENTS: 'rov_esports_events',
};

// Track if Supabase network is alive to prevent blocking UI on dead URLs
let isSupabaseFailed = false;

// Safe race timeout for Supabase calls (max 2 seconds before instant fallback)
export async function withSupabaseTimeout<T>(promise: Promise<T>, timeoutMs = 2000): Promise<T> {
  if (isSupabaseFailed) {
    throw new Error('Supabase marked unreachable, skipping network call.');
  }

  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timeout')), timeoutMs)
    ),
  ]).catch((err) => {
    // If it's a network/DNS failure, disable Supabase queries for this session
    if (err?.message?.includes('Failed to fetch') || err?.message?.includes('timeout') || err?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
      isSupabaseFailed = true;
    }
    throw err;
  });
}

// Safe browser localStorage helper
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Error reading localStorage', key, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Trigger window storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(value) }));
  } catch (e) {
    console.error('Error writing localStorage', key, e);
  }
}

// -------------------------------------------------------------
// HEROES REPOSITORY
// -------------------------------------------------------------
export async function getHeroes(): Promise<Hero[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('heroes').select('*').order('name');
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getHeroes error, falling back to local', e);
    }
  }
  return getStored<Hero[]>(STORAGE_KEYS.HEROES, DEFAULT_HEROES);
}

export async function saveHero(hero: Hero): Promise<Hero> {
  const heroes = await getHeroes();
  const index = heroes.findIndex((h) => h.id === hero.id);
  let updatedHeroes: Hero[];
  if (index >= 0) {
    updatedHeroes = [...heroes];
    updatedHeroes[index] = { ...hero, updated_at: new Date().toISOString() };
  } else {
    updatedHeroes = [...heroes, { ...hero, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
  }
  setStored(STORAGE_KEYS.HEROES, updatedHeroes);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('heroes').upsert(hero);
    } catch (e) {
      console.warn('Supabase saveHero error', e);
    }
  }
  return hero;
}

export async function deleteHero(id: string): Promise<void> {
  const heroes = await getHeroes();
  const filtered = heroes.filter((h) => h.id !== id);
  setStored(STORAGE_KEYS.HEROES, filtered);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('heroes').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteHero error', e);
    }
  }
}

// -------------------------------------------------------------
// TEAMS REPOSITORY
// -------------------------------------------------------------
export async function getTeams(): Promise<Team[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('teams').select('*').order('name');
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getTeams error, falling back to local', e);
    }
  }
  return getStored<Team[]>(STORAGE_KEYS.TEAMS, DEFAULT_TEAMS);
}

export async function saveTeam(team: Team): Promise<Team> {
  const teams = await getTeams();
  const index = teams.findIndex((t) => t.id === team.id);
  let updated: Team[];
  if (index >= 0) {
    updated = [...teams];
    updated[index] = { ...team, updated_at: new Date().toISOString() };
  } else {
    updated = [...teams, { ...team, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
  }
  setStored(STORAGE_KEYS.TEAMS, updated);

  // Sync updated team & player photos to existing matches in localStorage
  const matches = getStored<Match[]>(STORAGE_KEYS.MATCHES, []);
  if (matches.length > 0) {
    let matchesChanged = false;
    const updatedMatches = matches.map((m) => {
      let isAffected = false;
      const copy = { ...m };
      if (m.blue_team_id === team.id || m.blue_team?.id === team.id || m.blue_team?.name.toLowerCase() === team.name.toLowerCase()) {
        copy.blue_team = team;
        copy.blue_team_id = team.id;
        copy.blue_players = team.players;
        isAffected = true;
      }
      if (m.red_team_id === team.id || m.red_team?.id === team.id || m.red_team?.name.toLowerCase() === team.name.toLowerCase()) {
        copy.red_team = team;
        copy.red_team_id = team.id;
        copy.red_players = team.players;
        isAffected = true;
      }
      if (isAffected) {
        matchesChanged = true;
        // Dispatch real-time event for this match
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('match_updated', { detail: copy }));
          if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('rov_overlay_channel');
            bc.postMessage({ type: 'MATCH_UPDATED', match: copy });
            bc.close();
          }
        }
        return copy;
      }
      return m;
    });
    if (matchesChanged) {
      setStored(STORAGE_KEYS.MATCHES, updatedMatches);
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('teams').upsert(team);
    } catch (e) {
      console.warn('Supabase saveTeam error', e);
    }
  }
  return team;
}

export async function deleteTeam(id: string): Promise<void> {
  const teams = await getTeams();
  setStored(STORAGE_KEYS.TEAMS, teams.filter((t) => t.id !== id));

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('teams').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteTeam error', e);
    }
  }
}

// -------------------------------------------------------------
// THEMES & TEMPLATES REPOSITORY
// -------------------------------------------------------------
export async function getThemes(): Promise<Theme[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('themes').select('*');
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getThemes error', e);
    }
  }
  return getStored<Theme[]>(STORAGE_KEYS.THEMES, DEFAULT_THEMES);
}

export async function saveTheme(theme: Theme): Promise<Theme> {
  const themes = await getThemes();
  const index = themes.findIndex((t) => t.id === theme.id);
  let updated: Theme[];
  if (index >= 0) {
    updated = [...themes];
    updated[index] = { ...theme, updated_at: new Date().toISOString() };
  } else {
    updated = [...themes, { ...theme, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
  }
  setStored(STORAGE_KEYS.THEMES, updated);
  return theme;
}

export async function getTemplates(): Promise<Template[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('templates').select('*');
      if (!error && data && data.length > 0) {
        return data.map((t) => {
          const defaultT = DEFAULT_TEMPLATES.find((dt) => dt.id === t.id || dt.slug === t.slug) || DEFAULT_TEMPLATES[0];
          return {
            ...t,
            config: t.config && t.config.heroSlots && t.config.heroSlots.length > 0 ? t.config : defaultT.config,
          };
        });
      }
    } catch (e) {
      console.warn('Supabase getTemplates error', e);
    }
  }
  return DEFAULT_TEMPLATES;
}

export async function saveTemplate(template: Template): Promise<Template> {
  const templates = await getTemplates();
  const index = templates.findIndex((t) => t.id === template.id);
  let updated: Template[];
  if (index >= 0) {
    updated = [...templates];
    updated[index] = { ...template, updated_at: new Date().toISOString() };
  } else {
    updated = [...templates, { ...template, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
  }
  setStored(STORAGE_KEYS.TEMPLATES, updated);
  return template;
}

// -------------------------------------------------------------
// SPONSORS REPOSITORY
// -------------------------------------------------------------
export async function getSponsors(): Promise<Sponsor[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('sponsors').select('*');
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getSponsors error', e);
    }
  }
  return getStored<Sponsor[]>(STORAGE_KEYS.SPONSORS, DEFAULT_SPONSORS);
}

export async function saveSponsor(sponsor: Sponsor): Promise<Sponsor> {
  const sponsors = await getSponsors();
  const index = sponsors.findIndex((s) => s.id === sponsor.id);
  let updated: Sponsor[];
  if (index >= 0) {
    updated = [...sponsors];
    updated[index] = { ...sponsor, updated_at: new Date().toISOString() };
  } else {
    updated = [...sponsors, { ...sponsor, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
  }
  setStored(STORAGE_KEYS.SPONSORS, updated);
  return sponsor;
}

// -------------------------------------------------------------
// LOGOS REPOSITORY
// -------------------------------------------------------------
export async function getLogos(): Promise<GameLogo[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('logos').select('*');
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getLogos error', e);
    }
  }
  return getStored<GameLogo[]>(STORAGE_KEYS.LOGOS, DEFAULT_LOGOS);
}

export async function saveLogo(logo: GameLogo): Promise<GameLogo> {
  const logos = await getLogos();
  const index = logos.findIndex((l) => l.id === logo.id);
  let updated: GameLogo[];
  if (index >= 0) {
    updated = [...logos];
    updated[index] = { ...logo, updated_at: new Date().toISOString() };
  } else {
    updated = [...logos, { ...logo, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
  }
  setStored(STORAGE_KEYS.LOGOS, updated);
  return logo;
}

export async function deleteLogo(id: string): Promise<void> {
  const logos = await getLogos();
  const filtered = logos.filter((l) => l.id !== id);
  setStored(STORAGE_KEYS.LOGOS, filtered);
}

// -------------------------------------------------------------
// MATCHES & ACTIONS REPOSITORY
// -------------------------------------------------------------
export async function getMatches(): Promise<Match[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('matches').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getMatches error', e);
    }
  }
  const matches = getStored<Match[]>(STORAGE_KEYS.MATCHES, [DEMO_MATCH]);
  return matches;
}

export async function getMatchById(id: string): Promise<Match | null> {
  let match: Match | null = null;

  // Try fetching from server API first (for OBS Browser Source real-time sync across processes)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/matches/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.match) match = json.match;
      }
    } catch (e) {
      // ignore fetch error
    }
  }

  // Fallback to local storage
  if (!match) {
    const matches = await getMatches();
    match = matches.find((m) => m.id === id) || (id === DEMO_MATCH.id ? DEMO_MATCH : null);
  }

  if (!match) return null;

  // Hydrate related items
  const [teams, templates, themes, sponsors, heroes] = await Promise.all([
    getTeams(),
    getTemplates(),
    getThemes(),
    getSponsors(),
    getHeroes(),
  ]);

  const blue_team = (match?.blue_team_id ? teams.find((t) => t.id === match.blue_team_id) : null) || match.blue_team;
  const red_team = (match?.red_team_id ? teams.find((t) => t.id === match.red_team_id) : null) || match.red_team;
  const template = templates.find((t) => t.id === match?.template_id) || DEFAULT_TEMPLATES[0];
  const theme = themes.find((t) => t.id === match?.theme_id) || DEFAULT_THEMES[0];
  const sponsor = sponsors.find((s) => s.id === match?.sponsor_id);
  const sponsors_list = match?.sponsor_ids && match.sponsor_ids.length > 0
    ? sponsors.filter((s) => match?.sponsor_ids?.includes(s.id))
    : sponsor ? [sponsor] : sponsors;

  // Hydrate actions with hero details
  const actions = (match.actions || []).map((action) => ({
    ...action,
    hero: heroes.find((h) => h.id === action.hero_id),
  }));

  return {
    ...match,
    blue_team: blue_team || match.blue_team,
    red_team: red_team || match.red_team,
    blue_players: blue_team?.players || match.blue_players,
    red_players: red_team?.players || match.red_players,
    template: template || match.template,
    theme: theme || match.theme,
    sponsor: sponsor || match.sponsor || sponsors_list[0],
    sponsors_list,
    actions,
  };
}

export async function saveMatch(match: Match): Promise<Match> {
  const matches = await getMatches();
  const index = matches.findIndex((m) => m.id === match.id);
  let updated: Match[];
  const payload = { ...match, updated_at: new Date().toISOString() };
  if (index >= 0) {
    updated = [...matches];
    updated[index] = payload;
  } else {
    updated = [payload, ...matches];
  }
  setStored(STORAGE_KEYS.MATCHES, updated);

  // Sync to Next.js server API
  if (typeof window !== 'undefined') {
    fetch(`/api/matches/${match.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((e) => console.warn('Failed to sync match to API', e));
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const VALID_MATCH_COLUMNS = new Set([
        'id', 'name', 'blue_team_id', 'red_team_id', 'blue_score', 'red_score',
        'status', 'current_phase', 'current_turn', 'timer_seconds', 'timer_running',
        'template_id', 'theme_id', 'background_type', 'background_url', 'sponsor_id',
        'created_by', 'created_at', 'updated_at'
      ]);
      const cleanMatch: Record<string, any> = {};
      for (const [k, v] of Object.entries(payload)) {
        if (VALID_MATCH_COLUMNS.has(k)) {
          cleanMatch[k] = v;
        }
      }
      const { error } = await supabase.from('matches').update(cleanMatch).eq('id', payload.id);
      if (error) {
        console.warn('Supabase update match error, falling back to upsert:', error);
        await supabase.from('matches').upsert(cleanMatch);
      }
    } catch (e) {
      console.warn('Supabase saveMatch error', e);
    }
  }

  // Broadcast update
  broadcastMatchUpdate(payload);
  return payload;
}

export async function deleteMatch(id: string): Promise<void> {
  const matches = await getMatches();
  const filtered = matches.filter((m) => m.id !== id);
  setStored(STORAGE_KEYS.MATCHES, filtered);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('matches').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteMatch error', e);
    }
  }
}

// -------------------------------------------------------------
// CLEAR SPECIFIC HERO SLOT (REMOVE MIS-PICKED HERO)
// -------------------------------------------------------------
export async function clearSlotHero(
  matchId: string,
  team: 'blue' | 'red',
  actionType: 'pick' | 'ban',
  slotIndex: number
): Promise<Match> {
  const match = await getMatchById(matchId);
  if (!match) throw new Error('Match not found');

  const filteredActions = (match.actions || []).filter(
    (a) => !(a.team === team && a.action_type === actionType && a.slot_index === slotIndex)
  );

  const updatedMatch: Match = {
    ...match,
    actions: filteredActions,
    updated_at: new Date().toISOString(),
  };

  return await saveMatch(updatedMatch);
}
export async function executeDraftAction(
  matchId: string,
  heroId: string,
  targetActionType?: 'pick' | 'ban',
  targetSlotIndex?: number,
  targetTeam?: 'blue' | 'red'
): Promise<{ success: boolean; match?: Match; message?: string }> {
  const match = await getMatchById(matchId);
  if (!match) return { success: false, message: 'Match not found' };

  const currentPhaseInfo = getPhaseInfo(match.current_phase);
  const actionType = targetActionType || (currentPhaseInfo.type === 'waiting' || currentPhaseInfo.type === 'ready' ? 'pick' : currentPhaseInfo.type);
  const team = targetTeam || (currentPhaseInfo.team === 'neutral' ? match.current_turn : currentPhaseInfo.team);
  
  // Slot index
  let slotIndex = typeof targetSlotIndex === 'number' ? targetSlotIndex : currentPhaseInfo.slotIndex;
  if (slotIndex < 0) {
    // Determine next free slot for this action type & team
    const existing = (match.actions || []).filter((a) => a.team === team && a.action_type === actionType);
    slotIndex = existing.length;
  }

  // 1. Check if hero is already picked or banned in this match
  const alreadyUsed = (match.actions || []).some((a) => a.hero_id === heroId);
  if (alreadyUsed) {
    return { success: false, message: 'Hero is already picked or banned in this match!' };
  }

  // 2. Create MatchAction
  const newAction: MatchAction = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    match_id: matchId,
    team: team as 'blue' | 'red',
    action_type: actionType,
    hero_id: heroId,
    slot_index: slotIndex,
    phase: match.current_phase,
    created_at: new Date().toISOString(),
  };

  const updatedActions = [...(match.actions || []), newAction];

  // 3. Do not auto-advance to next slot's frame; set to WAITING so operator manually chooses the slot
  const nextPhase: MatchPhase = 'WAITING';

  const updatedMatch: Match = {
    ...match,
    actions: updatedActions,
    current_phase: nextPhase,
    current_turn: team === 'blue' ? 'red' : 'blue',
    status: updatedActions.length >= 18 ? 'completed' : 'pick_phase',
    timer_seconds: 30, // Reset timer
    updated_at: new Date().toISOString(),
  };

  // Log Event
  logMatchEvent(matchId, actionType === 'pick' ? 'PICK_HERO' : 'BAN_HERO', {
    action: newAction,
    nextPhase,
  });

  const saved = await saveMatch(updatedMatch);
  return { success: true, match: saved };
}

export async function undoLastAction(matchId: string): Promise<{ success: boolean; match?: Match }> {
  const match = await getMatchById(matchId);
  if (!match || !match.actions || match.actions.length === 0) {
    return { success: false };
  }

  const actions = [...match.actions];
  const removed = actions.pop();

  // Revert phase to the phase of the removed action
  const revertedPhase = (removed?.phase as MatchPhase) || 'WAITING';
  const phaseInfo = getPhaseInfo(revertedPhase);

  const updatedMatch: Match = {
    ...match,
    actions,
    current_phase: revertedPhase,
    current_turn: phaseInfo.team === 'neutral' ? 'blue' : phaseInfo.team,
    status: revertedPhase === 'WAITING' ? 'waiting' : revertedPhase.includes('BAN') ? 'ban_phase' : 'pick_phase',
    timer_seconds: 30,
    updated_at: new Date().toISOString(),
  };

  logMatchEvent(matchId, 'UNDO_ACTION', { removedAction: removed });
  const saved = await saveMatch(updatedMatch);
  return { success: true, match: saved };
}

export async function resetMatchDraft(matchId: string): Promise<{ success: boolean; match?: Match }> {
  const match = await getMatchById(matchId);
  if (!match) return { success: false };

  const updatedMatch: Match = {
    ...match,
    actions: [],
    current_phase: 'WAITING',
    current_turn: 'blue',
    status: 'waiting',
    timer_seconds: 30,
    timer_running: false,
    updated_at: new Date().toISOString(),
  };

  logMatchEvent(matchId, 'RESET_MATCH', {});
  const saved = await saveMatch(updatedMatch);
  return { success: true, match: saved };
}

export async function swapTeamSides(
  matchId: string,
  resetPicksBans: boolean = true
): Promise<{ success: boolean; match?: Match }> {
  const match = await getMatchById(matchId);
  if (!match) return { success: false };

  let updatedActions = match.actions || [];
  let updatedPhase = match.current_phase;
  let updatedTurn = match.current_turn;

  if (resetPicksBans) {
    updatedActions = [];
    updatedPhase = 'WAITING';
    updatedTurn = 'blue';
  } else {
    // When swapping teams but keeping existing picks, swap action teams so picks follow the teams
    updatedActions = updatedActions.map((a) => ({
      ...a,
      team: (a.team === 'blue' ? 'red' : 'blue') as 'blue' | 'red',
    }));

    if (updatedPhase.startsWith('BLUE_')) {
      updatedPhase = updatedPhase.replace('BLUE_', 'RED_') as MatchPhase;
    } else if (updatedPhase.startsWith('RED_')) {
      updatedPhase = updatedPhase.replace('RED_', 'BLUE_') as MatchPhase;
    }

    if (updatedTurn === 'blue') updatedTurn = 'red';
    else if (updatedTurn === 'red') updatedTurn = 'blue';
  }

  const updatedMatch: Match = {
    ...match,
    blue_team_id: match.red_team_id,
    red_team_id: match.blue_team_id,
    blue_team: match.red_team,
    red_team: match.blue_team,
    blue_score: match.red_score,
    red_score: match.blue_score,
    blue_players: match.red_players,
    red_players: match.blue_players,
    actions: updatedActions,
    current_phase: updatedPhase,
    current_turn: updatedTurn,
    timer_seconds: 30,
    timer_running: false,
    updated_at: new Date().toISOString(),
  };

  logMatchEvent(matchId, 'SWAP_TEAMS', { resetPicksBans });
  const saved = await saveMatch(updatedMatch);
  return { success: true, match: saved };
}

export async function updateMatchTimer(
  matchId: string,
  seconds: number,
  running: boolean
): Promise<Match | null> {
  const match = await getMatchById(matchId);
  if (!match) return null;

  const updated: Match = {
    ...match,
    timer_seconds: seconds,
    timer_running: running,
    timer_ends_at: running ? Date.now() + seconds * 1000 : undefined,
    updated_at: new Date().toISOString(),
  };

  return await saveMatch(updated);
}

export async function updateMatchScores(
  matchId: string,
  blueScore: number,
  redScore: number
): Promise<Match | null> {
  const match = await getMatchById(matchId);
  if (!match) return null;

  const updated: Match = {
    ...match,
    blue_score: Math.max(0, blueScore),
    red_score: Math.max(0, redScore),
    updated_at: new Date().toISOString(),
  };

  logMatchEvent(matchId, 'CHANGE_SCORE', { blue_score: blueScore, red_score: redScore });
  return await saveMatch(updated);
}

export async function updateMatchPhase(
  matchId: string,
  phase: MatchPhase
): Promise<Match | null> {
  const match = await getMatchById(matchId);
  if (!match) return null;

  const phaseInfo = getPhaseInfo(phase);
  const updated: Match = {
    ...match,
    current_phase: phase,
    current_turn: phaseInfo.team === 'neutral' ? match.current_turn : phaseInfo.team,
    status: phase === 'COMPLETED' ? 'completed' : phase.includes('BAN') ? 'ban_phase' : 'pick_phase',
    timer_seconds: 30,
    updated_at: new Date().toISOString(),
  };

  logMatchEvent(matchId, 'CHANGE_PHASE', { phase });
  return await saveMatch(updated);
}

// -------------------------------------------------------------
// EVENT AUDIT LOG & BROADCAST
// -------------------------------------------------------------
export function logMatchEvent(matchId: string, event_type: MatchEvent['event_type'], payload: Record<string, any>): void {
  const event: MatchEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    match_id: matchId,
    event_type,
    payload,
    created_at: new Date().toISOString(),
  };

  const existing = getStored<MatchEvent[]>(STORAGE_KEYS.EVENTS, []);
  setStored(STORAGE_KEYS.EVENTS, [event, ...existing.slice(0, 99)]);

  if (isSupabaseConfigured && supabase) {
    try {
      supabase.from('match_events').insert(event);
    } catch (e) {
      console.warn('Supabase logMatchEvent error', e);
    }
  }
}

export function getMatchEvents(matchId: string): MatchEvent[] {
  const events = getStored<MatchEvent[]>(STORAGE_KEYS.EVENTS, []);
  return events.filter((e) => e.match_id === matchId);
}

// Web BroadcastChannel & custom event for instant cross-tab / OBS real-time sync
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('rov_overlay_channel') : null;

export function broadcastMatchUpdate(match: Match): void {
  if (typeof window === 'undefined') return;
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'MATCH_UPDATED', match });
  }
  window.dispatchEvent(new CustomEvent('match_updated', { detail: match }));
}
