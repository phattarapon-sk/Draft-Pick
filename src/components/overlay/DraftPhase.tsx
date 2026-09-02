'use client';

import React from 'react';
import { ElementPosition, MatchPhase } from '@/types';
import { getPhaseInfo } from '@/config/defaultData';
import { Swords, Ban, CheckCircle2 } from 'lucide-react';

interface DraftPhaseProps {
  position: ElementPosition;
  phase: MatchPhase;
}

export const DraftPhase: React.FC<DraftPhaseProps> = ({ position, phase }) => {
  const info = getPhaseInfo(phase);
  const isBlue = info.team === 'blue';
  const isRed = info.team === 'red';
  const isBan = info.type === 'ban';
  const isReady = info.type === 'ready';

  return (
    <div
      className="absolute flex items-center justify-center transition-all duration-300 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width || 400}px`,
        height: `${position.height || 45}px`,
        zIndex: 25,
      }}
    >
      <div
        className={`relative w-full h-full rounded-xl flex items-center justify-center gap-2 px-6 border-2 shadow-2xl ${
          isBan
            ? 'bg-[#180508] border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
            : isBlue
            ? 'bg-[#041628] border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,217,255,0.5)]'
            : isRed
            ? 'bg-[#1A0612] border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(255,56,100,0.5)]'
            : isReady
            ? 'bg-[#041E14] border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
            : 'bg-[#0B1020] border-slate-700 text-white shadow-xl'
        }`}
      >
        {isBan && <Ban className="w-4 h-4 text-red-400" />}
        {info.type === 'pick' && <Swords className={`w-4 h-4 ${isBlue ? 'text-cyan-400' : 'text-rose-400'}`} />}
        {isReady && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}

        <span className="text-sm md:text-base font-black tracking-widest uppercase truncate drop-shadow">
          {info.title}
        </span>
      </div>
    </div>
  );
};
