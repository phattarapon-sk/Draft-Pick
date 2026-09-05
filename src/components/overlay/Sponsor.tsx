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
      <div className="w-full h-full rounded-2xl bg-[#070B18]/95 border-2 border-amber-400/50 px-5 flex items-center justify-center shadow-2xl overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`sponsor-fade-${activeCount > 1 ? currentSponsor.id || (sponsorTick % activeCount) : sponsorTick}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex items-center gap-3 w-full justify-center"
          >
            {currentSponsor.logo_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentSponsor.logo_url}
                alt={currentSponsor.name}
                className="h-8 max-w-[110px] object-contain filter drop-shadow"
              />
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-black">
                OFFICIAL PARTNER
              </span>
              <span className="text-xs font-black text-white uppercase tracking-wider truncate max-w-[220px] font-display">
                {currentSponsor.text || currentSponsor.name}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};


