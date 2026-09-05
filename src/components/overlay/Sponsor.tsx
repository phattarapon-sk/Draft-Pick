'use client';

import React, { useMemo } from 'react';
import { Sponsor as SponsorType, ElementPosition } from '@/types';

interface SponsorProps {
  sponsor?: SponsorType;
  sponsors?: SponsorType[];
  position: ElementPosition;
}

export const Sponsor: React.FC<SponsorProps> = ({ sponsor, sponsors = [], position }) => {
  const activeSponsors = sponsors.length > 0 ? sponsors : sponsor ? [sponsor] : [];

  const marqueeSponsors = useMemo(() => {
    if (activeSponsors.length === 0) return [];
    const repeatCount = activeSponsors.length === 1 ? 4 : activeSponsors.length === 2 ? 3 : 2;
    const base: typeof activeSponsors = [];
    for (let i = 0; i < repeatCount; i++) {
      base.push(...activeSponsors);
    }
    return [...base, ...base];
  }, [activeSponsors]);

  if (activeSponsors.length === 0) return null;

  return (
    <div
      className="absolute flex items-center justify-center transition-all duration-300 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width || 440}px`,
        height: `${position.height || 60}px`,
        zIndex: 20,
      }}
    >
      <div className="w-full h-full rounded-2xl bg-[#070B18]/95 border-2 border-amber-400/50 flex items-center shadow-2xl overflow-hidden relative">
        {/* Left Badge: Official Partner */}
        <div className="h-full px-3.5 bg-amber-400/10 border-r border-amber-400/30 flex flex-col justify-center items-center flex-shrink-0 z-10">
          <span className="text-[9px] font-mono tracking-widest text-amber-400 uppercase font-black whitespace-nowrap">
            OFFICIAL
          </span>
          <span className="text-[10px] font-display tracking-wider text-white uppercase font-black whitespace-nowrap">
            PARTNER
          </span>
        </div>

        {/* Continuous Scrolling Marquee */}
        <div className="flex-1 overflow-hidden h-full flex items-center relative select-none">
          <div className="animate-marquee-continuous flex items-center">
            {marqueeSponsors.map((sp, idx) => (
              <div key={`sp-banner-${idx}`} className="flex items-center gap-3 px-4 flex-shrink-0">
                {sp.logo_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={sp.logo_url}
                    alt={sp.name}
                    className="h-8 max-w-[110px] object-contain filter drop-shadow"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white uppercase tracking-wider whitespace-nowrap font-display">
                    {sp.text || sp.name}
                  </span>
                </div>
                <span className="text-amber-400/60 font-black text-xs select-none ml-2">✦</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

