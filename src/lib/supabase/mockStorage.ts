import { Hero, Team, Theme, Template, Sponsor, GameLogo, Match, MatchAction, MatchEvent, MatchPhase } from '@/types';
import { DEFAULT_HEROES, DEFAULT_TEAMS, DEFAULT_THEMES, DEFAULT_TEMPLATES, DEFAULT_SPONSORS, DEFAULT_LOGOS, DRAFT_PHASE_ORDER, getPhaseInfo } from '@/config/defaultData';
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

// One-time purge of stale mock data from browser localStorage (keeping templates & themes completely intact)
const PURGE_KEY = 'rov_mock_purged_v5';
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(PURGE_KEY)) {
      localStorage.removeItem(STORAGE_KEYS.HEROES);
      localStorage.removeItem(STORAGE_KEYS.TEAMS);
      localStorage.removeItem(STORAGE_KEYS.SPONSORS);
      localStorage.removeItem(STORAGE_KEYS.LOGOS);
      localStorage.removeItem(STORAGE_KEYS.MATCHES);
      localStorage.removeItem(STORAGE_KEYS.ACTIONS);
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.setItem(PURGE_KEY, 'true');
    }
  } catch (e) {
    console.warn('One-time purge localStorage warning', e);
  }
}

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

// Safe browser localStorage helper
export function cleanupLocalStorageQuota(): void {
  if (typeof window === 'undefined') return;
  try {
    // Measure total localStorage usage
    let totalChars = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) totalChars += (localStorage.getItem(k)?.length || 0);
    }

    // If total localStorage exceeds 2.5MB (half of browser 5MB limit), purge old bloated hero cache
    // (Heroes are safely stored in Supabase cloud, so this frees up 3-4MB instantly)
    if (totalChars > 2.5 * 1024 * 1024) {
      const heroVal = localStorage.getItem('rov_esports_heroes');
      if (heroVal && heroVal.length > 500 * 1024) {
        localStorage.removeItem('rov_esports_heroes');
      }

      // Also clean up any giant base64 strings in matches
      const matchVal = localStorage.getItem('rov_esports_matches');
      if (matchVal && matchVal.length > 1.5 * 1024 * 1024) {
        try {
          const parsed = JSON.parse(matchVal);
          if (Array.isArray(parsed)) {
            // Keep recent 5 matches
            localStorage.setItem('rov_esports_matches', JSON.stringify(parsed.slice(0, 5)));
          }
        } catch {}
      }
    }
  } catch (e) {
    console.warn('cleanupLocalStorageQuota error', e);
  }
}

// Auto-run quota sanitization in browser
if (typeof window !== 'undefined') {
  setTimeout(() => cleanupLocalStorageQuota(), 50);
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e: any) {
    if (e?.name === 'QuotaExceededError' || e?.message?.includes('quota')) {
      // Immediately free up bloated local hero cache to make room for teams / matches
      try {
        localStorage.removeItem('rov_esports_heroes');
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        console.warn(`[Storage] Browser quota reached for ${key}.`);
      }
    } else {
      console.warn('LocalStorage write notice', key, e?.message);
    }
  }
}

// -------------------------------------------------------------
// HEROES REPOSITORY
// -------------------------------------------------------------
export async function getHeroes(): Promise<Hero[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('heroes').select('*').order('name');
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase getHeroes error, falling back to local', e);
    }
  }
  return getStored<Hero[]>(STORAGE_KEYS.HEROES, []);
}

export async function saveHero(hero: Hero): Promise<Hero> {
  const heroes = await getHeroes();
  const index = heroes.findIndex((h) => h.id === hero.id);

  // Generate safe unique slug
  const baseSlug = (hero.slug || hero.name.toLowerCase().replace(/[^a-z0-9\u0E00-\u0E7F]+/gi, '-')).replace(/^-+|-+$/g, '') || `hero-${Date.now()}`;
  const slugExists = heroes.some((h) => h.id !== hero.id && h.slug.toLowerCase() === baseSlug.toLowerCase());
  const safeSlug = slugExists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

  const heroWithSafeSlug: Hero = {
    ...hero,
    id: String(hero.id || `hero-${Date.now()}`),
    slug: safeSlug,
    image_url: hero.image_url || hero.portrait_url || 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    portrait_url: hero.portrait_url || hero.image_url || 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80',
    splash_url: hero.splash_url || hero.portrait_url || hero.image_url || 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80',
    role: hero.role || 'Warrior',
    is_active: hero.is_active ?? true,
  };

  let updatedHeroes: Hero[];
  if (index >= 0) {
    updatedHeroes = [...heroes];
    updatedHeroes[index] = { ...heroWithSafeSlug, updated_at: new Date().toISOString() };
  } else {
    updatedHeroes = [...heroes, { ...heroWithSafeSlug, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
  }
  setStored(STORAGE_KEYS.HEROES, updatedHeroes);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id: heroWithSafeSlug.id,
        name: heroWithSafeSlug.name,
        slug: heroWithSafeSlug.slug,
        image_url: heroWithSafeSlug.image_url,
        portrait_url: heroWithSafeSlug.portrait_url,
        splash_url: heroWithSafeSlug.splash_url,
        role: heroWithSafeSlug.role,
        is_active: heroWithSafeSlug.is_active,
      };
      const { data, error } = await supabase.from('heroes').upsert(payload, { onConflict: 'id' }).select();
      if (error) {
        console.error('Supabase saveHero error:', error);
        throw new Error(error.message);
      }
      if (data && data.length > 0) {
        return data[0];
      }
    } catch (e: any) {
      console.error('Supabase saveHero exception:', e);
      throw e;
    }
  }
  return heroWithSafeSlug;
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
  const localTeams = getStored<Team[]>(STORAGE_KEYS.TEAMS, []);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('teams').select('*').order('name');
      if (!error && data) {
        if (data.length > 0) {
          // Merge Supabase teams with localTeams so rosters, photos, and local custom teams are never lost
          const merged: Team[] = data.map((sbTeam) => {
            const local = localTeams.find(
              (lt) =>
                lt.id === sbTeam.id ||
                lt.short_name?.toUpperCase() === sbTeam.short_name?.toUpperCase() ||
                lt.name?.toLowerCase() === sbTeam.name?.toLowerCase()
            );

            // If local has newer timestamp than Supabase, preserve local branding
            const sbTime = sbTeam.updated_at ? new Date(sbTeam.updated_at).getTime() : 0;
            const localTime = local?.updated_at ? new Date(local.updated_at).getTime() : 0;
            const preferred = local && localTime > sbTime ? local : sbTeam;

            return {
              ...preferred,
              id: sbTeam.id,
              name: preferred.name || sbTeam.name,
              short_name: preferred.short_name || sbTeam.short_name,
              logo_url: preferred.logo_url || sbTeam.logo_url,
              primary_color: preferred.primary_color || sbTeam.primary_color,
              secondary_color: preferred.secondary_color || sbTeam.secondary_color,
              players: local?.players || preferred.players || [],
              player_roster: local?.player_roster || preferred.player_roster || [],
              bg_opacity: local?.bg_opacity ?? preferred.bg_opacity ?? 75,
              updated_at: preferred.updated_at || sbTeam.updated_at || new Date().toISOString(),
            };
          });

          // Add any local teams not present in Supabase
          for (const lt of localTeams) {
            if (!merged.some((m) => m.id === lt.id || m.short_name?.toUpperCase() === lt.short_name?.toUpperCase())) {
              merged.push(lt);
            }
          }

          setStored(STORAGE_KEYS.TEAMS, merged);
          return merged;
        } else {
          return localTeams;
        }
      }
    } catch (e) {
      console.warn('Supabase getTeams error, falling back to local', e);
    }
  }
  return localTeams;
}

export async function saveTeam(team: Team): Promise<Team> {
  const teams = await getTeams();
  const index = teams.findIndex(
    (t) =>
      t.id === team.id ||
      t.short_name?.toUpperCase() === team.short_name?.toUpperCase() ||
      t.name?.toLowerCase() === team.name?.toLowerCase()
  );

  const teamWithTimestamp: Team = {
    ...team,
    updated_at: new Date().toISOString(),
  };

  let updated: Team[];
  if (index >= 0) {
    updated = [...teams];
    updated[index] = teamWithTimestamp;
  } else {
    updated = [...teams, { ...teamWithTimestamp, created_at: new Date().toISOString() }];
  }
  setStored(STORAGE_KEYS.TEAMS, updated);

  // Sync updated team & player photos to existing matches in localStorage & API
  const matches = getStored<Match[]>(STORAGE_KEYS.MATCHES, []);
  if (matches.length > 0) {
    for (const m of matches) {
      let isAffected = false;
      const copy = { ...m };

      const isBlueMatch =
        m.blue_team_id === team.id ||
        m.blue_team?.id === team.id ||
        m.blue_team?.short_name?.toUpperCase() === team.short_name?.toUpperCase() ||
        m.blue_team?.name?.toLowerCase() === team.name?.toLowerCase();

      const isRedMatch =
        m.red_team_id === team.id ||
        m.red_team?.id === team.id ||
        m.red_team?.short_name?.toUpperCase() === team.short_name?.toUpperCase() ||
        m.red_team?.name?.toLowerCase() === team.name?.toLowerCase();

      if (isBlueMatch) {
        copy.blue_team = teamWithTimestamp;
        copy.blue_team_id = teamWithTimestamp.id;
        copy.blue_players = teamWithTimestamp.players;
        isAffected = true;
      }
      if (isRedMatch) {
        copy.red_team = teamWithTimestamp;
        copy.red_team_id = teamWithTimestamp.id;
        copy.red_players = teamWithTimestamp.players;
        isAffected = true;
      }

      if (isAffected) {
        await saveMatch(copy);
      }
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id: String(teamWithTimestamp.id),
        name: teamWithTimestamp.name,
        short_name: teamWithTimestamp.short_name,
        logo_url: teamWithTimestamp.logo_url,
        primary_color: teamWithTimestamp.primary_color,
        secondary_color: teamWithTimestamp.secondary_color,
        updated_at: teamWithTimestamp.updated_at,
      };
      await supabase.from('teams').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase saveTeam error', e);
    }
  }
  return teamWithTimestamp;
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
          const defaultT = DEFAULT_TEMPLATES.find((dt) => dt.id === t.id || dt.slug === t.slug);
          if (defaultT) {
            return {
              ...t,
              config: defaultT.config,
            };
          }
          return {
            ...t,
            config: t.config && t.config.heroSlots && t.config.heroSlots.length > 0 ? t.config : DEFAULT_TEMPLATES[0].config,
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
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase getSponsors error', e);
    }
  }
  return getStored<Sponsor[]>(STORAGE_KEYS.SPONSORS, []);
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

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id: String(sponsor.id),
        name: sponsor.name,
        logo_url: sponsor.logo_url,
        text: sponsor.text || null,
        url: sponsor.url || null,
        is_active: sponsor.is_active ?? true,
      };
      await supabase.from('sponsors').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase saveSponsor error', e);
    }
  }
  return sponsor;
}

// -------------------------------------------------------------
// LOGOS REPOSITORY
// -------------------------------------------------------------
export async function getLogos(): Promise<GameLogo[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('logos').select('*');
      if (!error && data) {
        return data.map((l: any) => ({
          ...l,
          logo_url: l.logo_url || l.url || '',
        }));
      }
    } catch (e) {
      console.warn('Supabase getLogos error', e);
    }
  }
  return getStored<GameLogo[]>(STORAGE_KEYS.LOGOS, []);
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

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id: String(logo.id),
        name: logo.name,
        url: logo.logo_url,
        is_default: Boolean(logo.is_default),
      };
      await supabase.from('logos').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase saveLogo error', e);
    }
  }
  return logo;
}

export async function deleteLogo(id: string): Promise<void> {
  const logos = await getLogos();
  const filtered = logos.filter((l) => l.id !== id);
  setStored(STORAGE_KEYS.LOGOS, filtered);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('logos').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteLogo error', e);
    }
  }
}

// -------------------------------------------------------------
// MATCHES & ACTIONS REPOSITORY
// -------------------------------------------------------------
export async function getMatches(): Promise<Match[]> {
  const localMatches = getStored<Match[]>(STORAGE_KEYS.MATCHES, []);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('matches').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        if (data.length > 0) {
          // Merge with local matches so actions and fresh local updates are never lost
          return data.map((sbMatch) => {
            const local = localMatches.find((lm) => lm.id === sbMatch.id);
            const sbTime = sbMatch.updated_at ? new Date(sbMatch.updated_at).getTime() : 0;
            const localTime = local?.updated_at ? new Date(local.updated_at).getTime() : 0;
            if (local && localTime > sbTime) {
              return local;
            }
            return {
              ...sbMatch,
              actions: sbMatch.actions && sbMatch.actions.length > 0 ? sbMatch.actions : local?.actions || [],
            };
          });
        } else {
          return localMatches;
        }
      }
    } catch (e) {
      console.warn('Supabase getMatches error', e);
    }
  }
  return localMatches;
}

export async function getMatchById(id: string): Promise<Match | null> {
  let match: Match | null = null;

  // 1. Check local storage first
  const localMatches = getStored<Match[]>(STORAGE_KEYS.MATCHES, []);
  const local = localMatches.find((m) => m.id === id) || null;

  // 2. Try fetching from server API (for OBS Browser Source real-time sync across processes)
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

  // 3. Reconcile with local storage: local takes precedence if newer or if API was stale
  if (local) {
    if (!match) {
      match = local;
    } else {
      const localTime = local.updated_at ? new Date(local.updated_at).getTime() : 0;
      const serverTime = match.updated_at ? new Date(match.updated_at).getTime() : 0;
      if (localTime > serverTime) {
        match = local;
      }
    }
  }

  // 4. Fallback to getMatches() if still not found
  if (!match) {
    const matches = await getMatches();
    match = matches.find((m) => m.id === id) || null;
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

  const findTeamForMatch = (teamId?: string, fallbackTeam?: Team): Team | undefined => {
    if (!teamId && !fallbackTeam) return undefined;
    return (
      teams.find((t) => t.id === teamId) ||
      teams.find((t) => fallbackTeam?.id && t.id === fallbackTeam.id) ||
      teams.find((t) => fallbackTeam?.short_name && t.short_name?.toUpperCase() === fallbackTeam.short_name?.toUpperCase()) ||
      teams.find((t) => fallbackTeam?.name && t.name?.toLowerCase() === fallbackTeam.name?.toLowerCase()) ||
      fallbackTeam
    );
  };

  const blue_team = findTeamForMatch(match?.blue_team_id, match?.blue_team);
  const red_team = findTeamForMatch(match?.red_team_id, match?.red_team);
  const defaultTpl = DEFAULT_TEMPLATES.find((t) => t.id === match?.template_id || t.slug === match?.template?.slug || t.id === match?.template?.id);
  const template = defaultTpl || templates.find((t) => t.id === match?.template_id) || DEFAULT_TEMPLATES[0];
  const theme = themes.find((t) => t.id === match?.theme_id) || DEFAULT_THEMES[0];
  const sponsor = sponsors.find((s) => s.id === match?.sponsor_id);
  const sponsors_list =
    match?.sponsor_ids && match.sponsor_ids.length > 0
      ? sponsors.filter((s) => match.sponsor_ids?.includes(s.id))
      : sponsors.length > 0
      ? sponsors
      : sponsor
      ? [sponsor]
      : [];

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

  // Sync to Next.js server API FIRST so any subsequent fetches get fresh data
  if (typeof window !== 'undefined') {
    try {
      await fetch(`/api/matches/${match.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Failed to sync match to API', e);
    }
  }

  // Broadcast update immediately to avoid UI delay / flicker
  broadcastMatchUpdate(payload);

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
): Promise<{ success: boolean; match?: Match }> {
  const match = await getMatchById(matchId);
  if (!match) return { success: false };

  const filteredActions = (match.actions || []).filter(
    (a) => !(a.team === team && a.action_type === actionType && a.slot_index === slotIndex)
  );

  const updatedMatch: Match = {
    ...match,
    actions: filteredActions,
    updated_at: new Date().toISOString(),
  };

  logMatchEvent(matchId, 'UNDO_ACTION', { clearedSlot: { team, actionType, slotIndex } });
  const saved = await saveMatch(updatedMatch);
  return { success: true, match: saved };
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

  // VALIDATION RULES:
  // 1. Picks: Opponent CAN pick duplicate (Mirror Pick), but same team CANNOT pick duplicate.
  //    Banned hero cannot be picked by anyone.
  if (actionType === 'pick') {
    const isBanned = (match.actions || []).some((a) => a.action_type === 'ban' && a.hero_id === heroId);
    if (isBanned) {
      return { success: false, message: 'ฮีโร่ตัวนี้ถูกแบนแล้ว ไม่สามารถเลือกได้!' };
    }

    const isPickedBySameTeam = (match.actions || []).some(
      (a) => a.team === team && a.action_type === 'pick' && a.hero_id === heroId && a.slot_index !== slotIndex
    );
    if (isPickedBySameTeam) {
      return { success: false, message: 'ทีมของคุณเลือกฮีโร่ตัวนี้ไปแล้ว ไม่สามารถเลือกซ้ำในทีมเดียวกันได้!' };
    }
  } else if (actionType === 'ban') {
    // 2. Bans: Cannot ban a hero that is already banned or already picked
    const isAlreadyBanned = (match.actions || []).some(
      (a) => a.action_type === 'ban' && a.hero_id === heroId && !(a.team === team && a.slot_index === slotIndex)
    );
    if (isAlreadyBanned) {
      return { success: false, message: 'ฮีโร่ตัวนี้ถูกแบนไปแล้ว!' };
    }

    const isAlreadyPicked = (match.actions || []).some(
      (a) => a.action_type === 'pick' && a.hero_id === heroId
    );
    if (isAlreadyPicked) {
      return { success: false, message: 'ฮีโร่ตัวนี้ถูกเลือกไปแล้ว ไม่สามารถแบนได้!' };
    }
  }

  // Resolve hero details so newAction is fully self-contained immediately
  const allHeroes = await getHeroes();
  const heroObj = allHeroes.find((h) => h.id === heroId) || DEFAULT_HEROES.find((h) => h.id === heroId);

  // 2. Create MatchAction
  const newAction: MatchAction = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    match_id: matchId,
    team: team as 'blue' | 'red',
    action_type: actionType,
    hero_id: heroId,
    hero: heroObj,
    slot_index: slotIndex,
    phase: match.current_phase,
    created_at: new Date().toISOString(),
  };

  // Replace any existing action for this exact slot (in case of re-pick or slot overwrite)
  const remainingActions = (match.actions || []).filter(
    (a) => !(a.team === team && a.action_type === actionType && a.slot_index === slotIndex)
  );
  const updatedActions = [...remainingActions, newAction];

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
    // When swapping teams without resetting, hero picks and bans swap sides together with their respective teams!
    updatedActions = (match.actions || []).map((action) => ({
      ...action,
      team: action.team === 'blue' ? 'red' : 'blue',
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
