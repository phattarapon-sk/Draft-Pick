'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMatchSync } from '@/lib/realtime/syncService';
import { getHeroes } from '@/lib/supabase/mockStorage';
import { OverlayRenderer } from '@/components/overlay/OverlayRenderer';
import { Hero } from '@/types';
import { AlertCircle, Loader2 } from 'lucide-react';

interface OverlayPageProps {
  params: {
    matchId: string;
  };
}

function OverlayInner({ matchId }: { matchId: string }) {
  const searchParams = useSearchParams();
  const isTransparent = searchParams.get('transparent') === 'true';
  const { match, status } = useMatchSync(matchId);
  const [heroes, setHeroes] = useState<Hero[]>([]);

  const shouldBeTransparent = isTransparent || match?.background_type === 'transparent';

  useEffect(() => {
    getHeroes().then(setHeroes);
  }, []);

  useEffect(() => {
    if (shouldBeTransparent) {
      document.documentElement.style.backgroundColor = 'transparent';
      document.body.style.backgroundColor = 'transparent';
      document.documentElement.classList.remove('bg-[#050816]');
      document.body.classList.remove('bg-[#050816]');
    } else {
      document.documentElement.style.backgroundColor = '#050816';
      document.body.style.backgroundColor = '#050816';
    }
  }, [shouldBeTransparent]);

  if (!match) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#050816] text-white p-6 text-center">
        <AlertCircle className="w-12 h-12 text-cyan-400 animate-pulse mb-3" />
        <h2 className="text-xl font-bold uppercase tracking-wider">Connecting to Match Stream...</h2>
        <p className="text-xs text-slate-400 font-mono mt-1">Match ID: {matchId}</p>
        <span className="text-[11px] font-mono text-cyan-500 mt-4 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
          Sync Status: {status.toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`w-screen h-screen overflow-hidden ${shouldBeTransparent ? 'bg-transparent' : 'bg-[#050816]'}`}>
      <OverlayRenderer
        match={match}
        heroes={heroes}
        isTransparent={shouldBeTransparent}
      />
    </div>
  );
}

export default function OverlayPage({ params }: OverlayPageProps) {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex items-center justify-center bg-[#050816] text-white">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        </div>
      }
    >
      <OverlayInner matchId={params.matchId} />
    </Suspense>
  );
}
