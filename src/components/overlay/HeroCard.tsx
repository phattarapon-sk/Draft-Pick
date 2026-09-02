'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero, HeroRole } from '@/types';
import { Shield, Swords, Zap, Wand2, Crosshair, HeartPulse, Ban, Check } from 'lucide-react';

interface HeroCardProps {
  hero?: Hero | null;
  team: 'blue' | 'red';
  type: 'pick' | 'ban';
  slotIndex: number;
  isActiveTurn?: boolean;
  themeStyle?: string;
  primaryColor?: string;
  playerPhoto?: string;
  playerName?: string;
  bgOpacity?: number;
}

const RoleIcons: Record<HeroRole, React.ComponentType<{ className?: string }>> = {
  Tank: Shield,
  Warrior: Swords,
  Assassin: Zap,
  Mage: Wand2,
  Marksman: Crosshair,
  Support: HeartPulse,
};

export const HeroCard: React.FC<HeroCardProps> = ({
  hero,
  team,
  type,
  slotIndex,
  isActiveTurn = false,
  primaryColor,
  playerPhoto,
  playerName,
  bgOpacity = 75,
}) => {
  const isBlue = team === 'blue';
  const RoleIcon = hero?.role ? RoleIcons[hero.role] : null;

  // Render BAN slot
  if (type === 'ban') {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-slate-700 bg-[#070B18] shadow-2xl flex items-center justify-center group">
        {hero ? (
          <motion.div
            initial={{ opacity: 0, scale: 1.3, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black"
          >
            {/* Grayscale Hero Artwork */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.portrait_url || hero.image_url}
              alt={hero.name}
              className="w-full h-full object-cover filter grayscale contrast-150 brightness-90"
            />
            {/* Red Overlay Tint */}
            <div className="absolute inset-0 bg-red-950/50 mix-blend-multiply" />

            {/* Ban Diagonal Slash */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-[140%] h-2 bg-red-500 shadow-[0_0_15px_#ff0033] transform rotate-45" />
            </motion.div>

            {/* Ban Icon Badge */}
            <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border border-white/20">
              <Ban className="w-3.5 h-3.5 stroke-[3]" />
            </div>

            {/* Hero Name Bar at Bottom */}
            <div className="absolute bottom-0 inset-x-0 bg-black/95 py-1 px-1 text-center border-t border-red-500/40">
              <span className="text-[11px] font-black text-white truncate block tracking-wider uppercase font-mono">
                {hero.name}
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-slate-300 bg-[#070B18]">
            <Ban className={`w-6 h-6 ${isActiveTurn ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-[10px] font-mono font-bold mt-1 text-slate-400 uppercase">
              {isActiveTurn ? 'BANNING...' : `BAN ${slotIndex + 1}`}
            </span>
          </div>
        )}

        {/* Active Turn Halo */}
        {isActiveTurn && (
          <div className="absolute inset-0 border-2 border-red-500 animate-pulse rounded-xl pointer-events-none shadow-[0_0_20px_rgba(255,56,100,0.8)]" />
        )}
      </div>
    );
  }

  // Render PICK slot (Full Esports Character Card)
  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-300 ${
        isBlue
          ? 'border-2 border-cyan-500/60 bg-[#070C1E]'
          : 'border-2 border-rose-500/60 bg-[#14060E]'
      } shadow-[0_15px_35px_rgba(0,0,0,0.9)]`}
      style={{
        boxShadow: isActiveTurn
          ? `0 0 35px ${isBlue ? 'rgba(0,217,255,0.7)' : 'rgba(255,56,100,0.7)'}`
          : '0 10px 30px rgba(0,0,0,0.9)',
      }}
    >
      <AnimatePresence mode="wait">
        {hero ? (
          <motion.div
            key={hero.id}
            initial={{ opacity: 0, scale: 1.15, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full flex flex-col justify-end overflow-hidden bg-black"
          >
            {/* Hero Artwork Container */}
            <div className="absolute inset-0 overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.splash_url || hero.image_url}
                alt={hero.name}
                className="w-full h-full object-cover object-top filter brightness-110 contrast-115"
              />

              {/* Team Vignette Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${
                  isBlue
                    ? 'from-[#041628] via-[#041628]/30 to-transparent'
                    : 'from-[#1A0612] via-[#1A0612]/30 to-transparent'
                }`}
              />

              {/* Top Accent Rim */}
              <div
                className="absolute top-0 inset-x-0 h-1.5"
                style={{
                  background: isBlue
                    ? 'linear-gradient(90deg, transparent, #00D9FF, transparent)'
                    : 'linear-gradient(90deg, transparent, #FF3864, transparent)',
                }}
              />
            </div>

            {/* Top Role Icon Badge & Slot Index */}
            <div className="absolute top-2 inset-x-2 z-10 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                {RoleIcon && (
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shadow-lg ${
                      isBlue ? 'bg-cyan-950 text-cyan-300 border border-cyan-400' : 'bg-rose-950 text-rose-300 border border-rose-400'
                    }`}
                  >
                    <RoleIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <span className="text-[10px] font-mono font-black text-white px-1.5 py-0.5 rounded bg-black/90 border border-white/10">
                #{slotIndex + 1}
              </span>
            </div>

            {/* Bottom Hero Name Bar (Clean Dark Bar at Bottom matching Image 1) */}
            <div className="relative z-10 py-2.5 px-3 bg-[#070B18]/95 border-t border-white/10 text-center">
              <h3 className="text-lg font-black tracking-wider text-white uppercase truncate font-display drop-shadow">
                {hero.name}
              </h3>
              {playerName && (
                <span className="text-[10px] font-mono font-bold text-cyan-400 block -mt-0.5 uppercase tracking-widest truncate">
                  {playerName}
                </span>
              )}
            </div>
          </motion.div>
        ) : (
          /* Empty / Waiting Slot (Stylized Cyber Draft Card Background) */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#070B18] relative overflow-hidden">
            {/* Custom Player Background Photo */}
            {playerPhoto && (
              <div className="absolute inset-0 z-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={playerPhoto}
                  alt="Player Background"
                  className="w-full h-full object-cover filter brightness-95 contrast-105"
                  style={{ opacity: (bgOpacity ?? 75) / 100 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070B18] via-[#070B18]/40 to-transparent" />
              </div>
            )}

            {/* Ambient Background Grid Pattern & Team Radial Gradient */}
            <div
              className={`absolute inset-0 opacity-20 pointer-events-none ${
                isBlue
                  ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500 via-transparent to-transparent'
                  : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500 via-transparent to-transparent'
              }`}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

            {/* Top team accent */}
            <div className={`absolute top-0 inset-x-0 h-1.5 ${isBlue ? 'bg-cyan-400 shadow-[0_0_10px_#00d9ff]' : 'bg-rose-400 shadow-[0_0_10px_#ff3864]'}`} />

            {/* Slot Number Ring */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 relative z-10 ${
                isActiveTurn
                  ? isBlue
                    ? 'bg-cyan-500/30 text-cyan-300 border-2 border-cyan-400 animate-pulse scale-110 shadow-[0_0_25px_rgba(0,217,255,0.8)]'
                    : 'bg-rose-500/30 text-rose-300 border-2 border-rose-400 animate-pulse scale-110 shadow-[0_0_25px_rgba(255,56,100,0.8)]'
                  : 'bg-slate-900/90 text-slate-300 border border-slate-700 shadow-md'
              }`}
            >
              <span className="text-2xl font-display font-black">{slotIndex + 1}</span>
            </div>

            <div className="space-y-1 relative z-10">
              <span className={`text-xs font-black tracking-wider uppercase ${isActiveTurn ? (isBlue ? 'text-cyan-300 animate-pulse' : 'text-rose-300 animate-pulse') : 'text-slate-300'}`}>
                {isActiveTurn ? 'CHOOSING...' : (playerName ? playerName.toUpperCase() : `PICK ${slotIndex + 1}`)}
              </span>
              <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                {isBlue ? 'BLUE TEAM' : 'RED TEAM'}
              </p>
            </div>

            {/* Active Turn Highlight Border */}
            {isActiveTurn && (
              <div
                className="absolute inset-0 border-2 rounded-2xl pointer-events-none animate-pulse z-20"
                style={{
                  borderColor: isBlue ? '#00D9FF' : '#FF3864',
                  boxShadow: `inset 0 0 30px ${isBlue ? 'rgba(0,217,255,0.5)' : 'rgba(255,56,100,0.5)'}`,
                }}
              />
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
