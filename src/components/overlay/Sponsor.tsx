'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sponsor as SponsorType, ElementPosition } from '@/types';

interface SponsorProps {
  sponsor?: SponsorType;
  sponsors?: SponsorType[];
  position: ElementPosition;
}

export const Sponsor: React.FC<SponsorProps> = ({ sponsor, sponsors = [], position }) => {
  const activeSponsors = sponsors.length > 0 ? sponsors : sponsor ? [sponsor] : [];
  const [sponsorTick, setSponsorTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSponsorTick((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (activeSponsors.length === 0) return null;

  const activeCount = activeSponsors.length;
  const currentSponsor = activeSponsors[sponsorTick % activeCount] || activeSponsors[0];

  const isFullWidth = (position.width || 0) >= 1200 || position.x === 0;

  return (
    <div
      className="absolute flex items-center justify-center transition-all duration-300 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width || 420}px`,
        height: `${position.height || 60}px`,
        zIndex: 20,
      }}
    >
      <div
        className={`w-full h-full flex items-center shadow-2xl overflow-hidden relative select-none ${
          isFullWidth
            ? 'bg-[#050914]/95 backdrop-blur-xl border-t border-amber-400/40 px-10 justify-center'
            : 'rounded-2xl bg-[#070B18]/95 border-2 border-amber-400/50 px-6 justify-center'
        }`}
      >
        {/* Full-width Top Accent Gradient Line */}
        {isFullWidth && (
          <>
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 via-amber-400 via-rose-500 to-transparent opacity-90" />
            <div className="hidden lg:flex items-center gap-2 text-slate-500 text-[10px] font-mono uppercase tracking-widest font-bold absolute left-12 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>ROV ESPORTS TOURNAMENT</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-slate-500 text-[10px] font-mono uppercase tracking-widest font-bold absolute right-12 pointer-events-none">
              <span>OFFICIAL BROADCAST</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            </div>
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={`sponsor-fade-${activeCount > 1 ? currentSponsor.id || (sponsorTick % activeCount) : sponsorTick}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className={`flex items-center justify-center gap-4 ${isFullWidth ? 'w-full max-w-[1200px]' : 'w-full'}`}
          >
            {currentSponsor.logo_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentSponsor.logo_url}
                alt={currentSponsor.name}
                className={`${isFullWidth ? 'h-11 max-w-[200px]' : 'h-8 max-w-[120px]'} object-contain filter drop-shadow`}
              />
            )}
            <div className="flex flex-col">
              <span className={`${isFullWidth ? 'text-[11px]' : 'text-[10px]'} font-mono tracking-widest text-amber-400 uppercase font-black`}>
                OFFICIAL PARTNER
              </span>
              <span className={`${isFullWidth ? 'text-base md:text-xl' : 'text-xs md:text-sm'} font-black text-white uppercase tracking-wider font-display drop-shadow whitespace-nowrap`}>
                {currentSponsor.text || currentSponsor.name}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};


