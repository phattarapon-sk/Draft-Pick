import { NextResponse } from 'next/server';
import { Match } from '@/types';

declare global {
  // eslint-disable-next-line no-var
  var __SERVER_MATCHES__: Map<string, Match> | undefined;
}

if (!globalThis.__SERVER_MATCHES__) {
  globalThis.__SERVER_MATCHES__ = new Map<string, Match>();
}

export async function GET() {
  const matches = Array.from(globalThis.__SERVER_MATCHES__!.values());
  return NextResponse.json({ matches });
}

export async function POST(request: Request) {
  try {
    const match: Match = await request.json();
    if (!match.id) {
      return NextResponse.json({ error: 'Missing match ID' }, { status: 400 });
    }
    globalThis.__SERVER_MATCHES__!.set(match.id, match);
    return NextResponse.json({ success: true, match });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
