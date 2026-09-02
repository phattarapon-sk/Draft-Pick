'use client';

import React from 'react';
import { Team, ElementPosition } from '@/types';
import { Shield } from 'lucide-react';

interface TeamPanelProps {
  team?: Team;
  side: 'blue' | 'red';
  headerPosition: ElementPosition;
  scorePosition?: ElementPosition;
  score: number;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({
  team,
  side,
  headerPosition,
  scorePosition,
  score,
}) => {
  const isBlue = side === 'blue';
  const defaultColor = isBlue ? '#00D9FF' : '#FF3864';
  const teamColor = team?.primary_color || defaultColor;

  return (
    <>
      {/* Team Header Bar */}
      <div
        className="absolute flex items-center transition-all duration-300 pointer-events-none"
        style={{
          left: `${headerPosition.x}px`,
          top: `${headerPosition.y}px`,
          width: `${headerPosition.width || 500}px`,
          height: `${headerPosition.height || 90}px`,
          zIndex: 25,
        }}
      >
        <div
          className={`relative w-full h-full rounded-2xl flex items-center gap-4 px-6 border-2 shadow-2xl overflow-hidden ${
            isBlue
              ? 'bg-[#070C1E] border-cyan-500/60 shadow-[0_0_20px_rgba(0,217,255,0.3)]'
              : 'flex-row-reverse bg-[#14060E] border-rose-500/60 shadow-[0_0_20px_rgba(255,56,100,0.3)]'
          }`}
        >
          {/* Edge Glow Strip */}
          <div
            className={`absolute top-0 bottom-0 w-1.5 ${
              isBlue ? 'left-0 bg-cyan-400 shadow-[0_0_12px_#00D9FF]' : 'right-0 bg-rose-500 shadow-[0_0_12px_#FF3864]'
            }`}
          />

          {/* Team Logo */}
          <div
            className="relative w-14 h-14 rounded-xl flex items-center justify-center p-1 overflow-hidden border shadow-lg"
            style={{
              borderColor: `${teamColor}60`,
              backgroundColor: 'rgba(0,0,0,0.6)',
              boxShadow: `0 0 20px ${teamColor}40`,
            }}
          >
            {team?.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={team.logo_url}
                alt={team.name}
                className="w-full h-full object-contain filter drop-shadow"
              />
            ) : (
              <Shield className="w-8 h-8 opacity-60" style={{ color: teamColor }} />
            )}
          </div>

          {/* Team Names */}
          <div className={`flex flex-col ${isBlue ? 'items-start' : 'items-end'}`}>
            <span
              className="text-[11px] font-mono font-bold tracking-widest uppercase"
              style={{ color: teamColor }}
            >
              {isBlue ? 'BLUE SIDE' : 'RED SIDE'} • {team?.short_name || (isBlue ? 'BLUE' : 'RED')}
            </span>
            <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wide truncate max-w-[320px]">
              {team?.name || (isBlue ? 'Blue Team' : 'Red Team')}
            </h2>
          </div>
        </div>
      </div>

      {/* Team Score Box */}
      {scorePosition && (
        <div
          className="absolute flex items-center justify-center transition-all duration-300 pointer-events-none"
          style={{
            left: `${scorePosition.x}px`,
            top: `${scorePosition.y}px`,
            width: `${scorePosition.width || 80}px`,
            height: `${scorePosition.height || 90}px`,
            zIndex: 26,
          }}
        >
          <div
            className={`w-full h-full rounded-2xl flex flex-col items-center justify-center border backdrop-blur-xl shadow-2xl ${
              isBlue
                ? 'bg-[#041628]/95 border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(0,217,255,0.25)]'
                : 'bg-[#1A0612]/95 border-rose-500/40 text-rose-300 shadow-[0_0_20px_rgba(255,56,100,0.25)]'
            }`}
          >
            <span className="text-3xl md:text-4xl font-display font-black tracking-tight drop-shadow-md">
              {score}
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase opacity-60 font-bold -mt-1">
              SCORE
            </span>
          </div>
        </div>
      )}
    </>
  );
};
