'use client';

import React, { useEffect, useState } from 'react';
import { useMatchSync } from '@/lib/realtime/syncService';
import { getHeroes } from '@/lib/supabase/mockStorage';
import { MatchControl } from '@/components/control/MatchControl';
import { Hero } from '@/types';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface MatchControlPageProps {
  params: {
    matchId: string;
  };
}

export default function MatchControlPage({ params }: MatchControlPageProps) {
  const { match, setMatch } = useMatchSync(params.matchId);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHeroes().then((h) => {
      setHeroes(h);
      setLoading(false);
    });
  }, []);

  if (loading || !match) {
    return (
      <div className="w-full min-h-screen bg-[#050816] flex flex-col items-center justify-center text-white p-6">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold uppercase tracking-wider">Loading Control Room...</h2>
        <p className="text-xs text-slate-400 font-mono mt-1">Match ID: {params.matchId}</p>
      </div>
    );
  }

  return <MatchControl match={match} heroes={heroes} onMatchUpdated={setMatch} />;
}
