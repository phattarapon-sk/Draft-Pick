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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeSponsors.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSponsors.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSponsors.length]);

  if (activeSponsors.length === 0) return null;
  const currentSponsor = activeSponsors[currentIndex] || activeSponsors[0];

  return (
    <div
      className="absolute flex items-center justify-center transition-all duration-300 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width || 400}px`,
        height: `${position.height || 60}px`,
        zIndex: 20,
      }}
    >
      <div className="w-full h-full rounded-2xl bg-[#070B18]/95 border-2 border-amber-400/50 px-5 flex items-center justify-center shadow-2xl overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSponsor.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
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
