import { NextResponse } from 'next/server';
import { DEFAULT_HEROES, DEFAULT_TEAMS, DEFAULT_THEMES, DEFAULT_TEMPLATES, DEFAULT_SPONSORS, DEMO_MATCH } from '@/config/defaultData';
import { Match } from '@/types';

// Server-side in-memory matches store
const globalMatches = new Map<string, Match>();
globalMatches.set(DEMO_MATCH.id, DEMO_MATCH);

export async function GET() {
  const matches = Array.from(globalMatches.values());
  return NextResponse.json({ matches });
}

export async function POST(request: Request) {
  try {
    const match: Match = await request.json();
    if (!match.id) {
      return NextResponse.json({ error: 'Missing match ID' }, { status: 400 });
    }
    globalMatches.set(match.id, match);
    return NextResponse.json({ success: true, match });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
