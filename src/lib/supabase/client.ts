import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Strip trailing /rest/v1 or trailing slashes
rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const supabaseUrl = rawUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') && 
  !supabaseUrl.includes('your-project')
);

// Legacy client used by mockStorage, realtime, uploads (unchanged)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    })
  : null;

/**
 * Browser-side Supabase client with cookie-based auth session management.
 * Use this for all authentication operations (signIn, signOut, getUser, onAuthStateChange).
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
