import { NextResponse } from 'next/server';
import { DEFAULT_HEROES, DEFAULT_TEAMS, DEFAULT_THEMES, DEFAULT_TEMPLATES, DEFAULT_SPONSORS } from '@/config/defaultData';
import { Match } from '@/types';

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
  const match = store.get(matchId) || null;

  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  // Hydrate teams, templates, themes
  const blue_team = DEFAULT_TEAMS.find((t) => t.id === match.blue_team_id);
  const red_team = DEFAULT_TEAMS.find((t) => t.id === match.red_team_id);
  const template = DEFAULT_TEMPLATES.find((t) => t.id === match.template_id) || DEFAULT_TEMPLATES[0];
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
      template: match.template || template,
      theme: match.theme || theme,
      sponsor: match.sponsor || sponsor,
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
