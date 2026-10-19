import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  return handlePing(request);
}

export async function POST(request: Request) {
  return handlePing(request);
}

async function handlePing(request: Request) {
  const startTime = Date.now();
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                      process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      status: 'unconfigured',
      message: 'Supabase URL or API key is not configured in environment variables.',
      timestamp: new Date().toISOString(),
      durationMs: 0,
    }, { status: 200 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // Run active query against database to refresh Supabase 7-day inactivity pause
    let queryResult = await supabase.from('heroes').select('id').limit(1);

    if (queryResult.error) {
      queryResult = await supabase.from('teams').select('id').limit(1);
    }

    if (queryResult.error) {
      queryResult = await supabase.from('themes').select('id').limit(1);
    }

    const durationMs = Date.now() - startTime;

    if (queryResult.error) {
      // Fallback REST endpoint ping
      const restRes = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: 'no-store',
      });

      if (!restRes.ok && restRes.status !== 200) {
        return NextResponse.json({
          status: 'error',
          message: `REST fallback failed: ${restRes.status} ${restRes.statusText}`,
          tableError: queryResult.error.message,
          timestamp: new Date().toISOString(),
          durationMs,
        }, { status: 502 });
      }

      return NextResponse.json({
        status: 'active',
        method: 'rest_fallback',
        message: 'Supabase REST API successfully refreshed.',
        timestamp: new Date().toISOString(),
        durationMs,
      }, { status: 200 });
    }

    return NextResponse.json({
      status: 'active',
      method: 'database_query',
      message: 'Supabase Database actively queried. Inactivity sleep timer reset successfully.',
      hasRecords: Boolean(queryResult.data && queryResult.data.length > 0),
      timestamp: new Date().toISOString(),
      durationMs,
    }, { status: 200 });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    return NextResponse.json({
      status: 'error',
      message: err?.message || 'Unknown error occurred while pinging Supabase',
      timestamp: new Date().toISOString(),
      durationMs,
    }, { status: 500 });
  }
}
