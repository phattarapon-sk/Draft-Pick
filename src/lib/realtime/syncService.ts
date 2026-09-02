import { useEffect, useState, useCallback, useRef } from 'react';
import { Match } from '@/types';
import { getMatchById } from '@/lib/supabase/mockStorage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export type SyncStatus = 'connected' | 'reconnecting' | 'local_sync';

export function useMatchSync(matchId: string, initialMatch?: Match | null) {
  const [match, setMatch] = useState<Match | null>(initialMatch || null);
  const [status, setStatus] = useState<SyncStatus>('local_sync');
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLatest = useCallback(async () => {
    if (!matchId) return;
    try {
      const data = await getMatchById(matchId);
      if (data) {
        if (data.timer_running && data.timer_ends_at) {
          data.timer_seconds = Math.max(0, Math.ceil((data.timer_ends_at - Date.now()) / 1000));
        }
        setMatch(data);
        setLastUpdated(Date.now());
      }
    } catch (e) {
      console.error('Failed to sync match', e);
    }
  }, [matchId]);

  // Initial load
  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  // Real-time synchronization
  useEffect(() => {
    if (!matchId) return;

    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('rov_overlay_channel');
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'MATCH_UPDATED' && event.data?.match?.id === matchId) {
          const m = event.data.match;
          if (m.timer_running && m.timer_ends_at) {
            m.timer_seconds = Math.max(0, Math.ceil((m.timer_ends_at - Date.now()) / 1000));
          }
          setMatch(m);
          setLastUpdated(Date.now());
        }
      };
    }

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Match>;
      if (customEvent.detail && customEvent.detail.id === matchId) {
        const m = customEvent.detail;
        if (m.timer_running && m.timer_ends_at) {
          m.timer_seconds = Math.max(0, Math.ceil((m.timer_ends_at - Date.now()) / 1000));
        }
        setMatch(m);
        setLastUpdated(Date.now());
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (
        e.key === 'rov_esports_matches' ||
        e.key === 'rov_esports_teams' ||
        e.key === 'rov_esports_logos' ||
        e.key === 'rov_esports_sponsors' ||
        e.key === 'rov_esports_themes' ||
        e.key === 'rov_esports_templates'
      ) {
        fetchLatest();
      }
    };

    window.addEventListener('match_updated', handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    // Periodic poll for external clients like OBS Browser Source (every 1.5s)
    const pollInterval = setInterval(() => {
      fetchLatest();
    }, 1500);

    // Supabase Realtime Channel
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      setStatus('reconnecting');
      channel = supabase
        .channel(`match_${matchId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
          () => {
            fetchLatest();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'match_actions', filter: `match_id=eq.${matchId}` },
          () => {
            fetchLatest();
          }
        )
        .subscribe((subStatus) => {
          if (subStatus === 'SUBSCRIBED') {
            setStatus('connected');
          } else if (subStatus === 'CLOSED' || subStatus === 'CHANNEL_ERROR') {
            setStatus('local_sync');
          }
        });
    } else {
      setStatus('local_sync');
    }

    return () => {
      if (broadcastChannel) broadcastChannel.close();
      window.removeEventListener('match_updated', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(pollInterval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [matchId, fetchLatest]);

  // Client-side smooth timer countdown tick
  useEffect(() => {
    if (!match?.timer_running) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const tick = () => {
      setMatch((prev) => {
        if (!prev || !prev.timer_running) return prev;
        let newSeconds = prev.timer_seconds;
        if (prev.timer_ends_at) {
          newSeconds = Math.max(0, Math.ceil((prev.timer_ends_at - Date.now()) / 1000));
        } else {
          newSeconds = Math.max(0, prev.timer_seconds - 1);
        }
        if (newSeconds === prev.timer_seconds) return prev;
        return {
          ...prev,
          timer_seconds: newSeconds,
        };
      });
    };

    timerRef.current = setInterval(tick, 250);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [match?.timer_running, match?.timer_ends_at]);

  return { match, setMatch, status, refresh: fetchLatest, lastUpdated };
}
