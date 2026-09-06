import { NextResponse } from 'next/server';
import { DEFAULT_HEROES, DEFAULT_TEAMS, DEFAULT_THEMES, DEFAULT_TEMPLATES, DEFAULT_SPONSORS } from '@/config/defaultData';
import { Match } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

declare global {
  // eslint-disable-next-line no-var
  var __SERVER_MATCHES__: Map<string, Match> | undefined;
}

if (!globalThis.__SERVER_MATCHES__) {
  globalThis.__SERVER_MATCHES__ = new Map<string, Match>();
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const matchId = params.id;
  const store = globalThis.__SERVER_MATCHES__!;
  let match = store.get(matchId) || null;

  // If not cached in server memory, fetch from Supabase once and cache it
  if (!match && isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('matches').select('*').eq('id', matchId).maybeSingle();
      if (!error && data) {
        match = data as Match;
        store.set(matchId, match);
      }
    } catch (e) {
      console.warn('API route Supabase fetch match error:', e);
    }
  }

  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  // Hydrate teams, templates, themes
  const blue_team = DEFAULT_TEAMS.find((t) => t.id === match.blue_team_id);
  const red_team = DEFAULT_TEAMS.find((t) => t.id === match.red_team_id);
  const defaultTpl = DEFAULT_TEMPLATES.find((t) => t.id === match.template_id || t.slug === match.template?.slug);
  const template = defaultTpl || match.template || DEFAULT_TEMPLATES[0];
  const theme = DEFAULT_THEMES.find((t) => t.id === match.theme_id) || DEFAULT_THEMES[0];
  const sponsor = DEFAULT_SPONSORS.find((s) => s.id === match.sponsor_id);

  const actions = (match.actions || []).map((action) => ({
    ...action,
    hero: action.hero || DEFAULT_HEROES.find((h) => h.id === action.hero_id),
  }));

  return NextResponse.json({
    match: {
      ...match,
      blue_team: match.blue_team || blue_team,
      red_team: match.red_team || red_team,
      template: template,
      theme: match.theme || theme,
      sponsor: match.sponsor || sponsor,
      sponsors_list: match.sponsors_list,
      actions,
    },
  });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const payload: Match = await request.json();
    const store = globalThis.__SERVER_MATCHES__!;
    store.set(params.id, payload);
    return NextResponse.json({ success: true, match: payload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
