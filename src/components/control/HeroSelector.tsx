'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Hero, HeroRole, Match } from '@/types';
import { Search, Shield, Swords, Zap, Wand2, Crosshair, HeartPulse, Check, Ban } from 'lucide-react';

interface HeroSelectorProps {
  heroes: Hero[];
  match: Match;
  onSelectHero: (heroId: string, actionType: 'pick' | 'ban', team?: 'blue' | 'red') => void;
  disabled?: boolean;
}

const ROLES: (HeroRole | 'ALL')[] = ['ALL', 'Tank', 'Warrior', 'Assassin', 'Mage', 'Marksman', 'Support'];

const RoleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Tank: Shield,
  Warrior: Swords,
  Assassin: Zap,
  Mage: Wand2,
  Marksman: Crosshair,
  Support: HeartPulse,
};

export const HeroSelector: React.FC<HeroSelectorProps> = ({
  heroes,
  match,
  onSelectHero,
  disabled = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<HeroRole | 'ALL'>('ALL');
  const [activeHeroModal, setActiveHeroModal] = useState<Hero | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track bans and picks per team
  const draftStatus = useMemo(() => {
    const banned = new Set<string>();
    const bluePicks = new Set<string>();
    const redPicks = new Set<string>();

    (match.actions || []).forEach((a) => {
      if (a.action_type === 'ban') banned.add(a.hero_id);
      else if (a.team === 'blue') bluePicks.add(a.hero_id);
      else if (a.team === 'red') redPicks.add(a.hero_id);
    });

    return { banned, bluePicks, redPicks };
  }, [match.actions]);

  // Filter heroes
  const filteredHeroes = useMemo(() => {
    return heroes.filter((h) => {
      if (!h.is_active) return false;
      const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = selectedRole === 'ALL' || h.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [heroes, search, selectedRole]);

  // Handle horizontal mouse wheel scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const isHeroDisabled = (heroId: string) => {
    if (disabled) return true;
    if (draftStatus.banned.has(heroId)) return true;
    const isPick = !match.current_phase.includes('BAN');
    const isBlue = match.current_turn === 'blue' || match.current_phase.startsWith('BLUE_');
    if (isPick) {
      return isBlue ? draftStatus.bluePicks.has(heroId) : draftStatus.redPicks.has(heroId);
    } else {
      return draftStatus.bluePicks.has(heroId) || draftStatus.redPicks.has(heroId);
    }
  };

  const handleHeroClick = (hero: Hero) => {
    if (isHeroDisabled(hero.id)) return;
    setActiveHeroModal(hero);
  };

  return (
    <div className="w-full bg-[#0B1020]/95 border-t border-white/10 p-3 flex flex-col gap-3">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Hero (e.g. Florentino, Tulen...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {ROLES.map((role) => {
            const Icon = role !== 'ALL' ? RoleIcons[role] : null;
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,217,255,0.5)]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{role}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Single Row Horizontal Scrollable Hero Picker */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex items-center gap-3 overflow-x-auto py-2 px-1 scroll-smooth select-none"
        style={{ scrollbarWidth: 'thin' }}
      >
        {filteredHeroes.map((hero) => {
          const isBanned = draftStatus.banned.has(hero.id);
          const isDisabled = isHeroDisabled(hero.id);
          const isBlueTurn = match.current_turn === 'blue' || match.current_phase.startsWith('BLUE_');
          const isOpponentPicked = isBlueTurn ? draftStatus.redPicks.has(hero.id) : draftStatus.bluePicks.has(hero.id);
          const RoleIcon = RoleIcons[hero.role];

          return (
            <button
              key={hero.id}
              onClick={() => handleHeroClick(hero)}
              disabled={isDisabled}
              className={`relative flex-shrink-0 w-24 h-32 md:w-28 md:h-36 rounded-xl overflow-hidden border transition-all duration-200 group flex flex-col justify-end text-left ${
                isDisabled
                  ? 'opacity-40 filter grayscale border-slate-800 cursor-not-allowed'
                  : isOpponentPicked
                  ? 'border-amber-500/80 hover:border-cyan-400 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,217,255,0.4)] cursor-pointer'
                  : 'border-slate-700/80 hover:border-cyan-400 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,217,255,0.4)] cursor-pointer'
              }`}
            >
              {/* Hero Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.portrait_url || hero.image_url}
                alt={hero.name}
                className="absolute inset-0 w-full h-full object-cover filter brightness-95 group-hover:brightness-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Role badge */}
              <div className="absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded bg-black/70 flex items-center justify-center text-slate-300">
                {RoleIcon && <RoleIcon className="w-3 h-3" />}
              </div>

              {/* Disabled Status Overlay */}
              {isDisabled && (
                <div
                  className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-1 text-center backdrop-blur-[2px] ${
                    isBanned ? 'bg-red-950/70 text-red-300' : 'bg-slate-950/70 text-cyan-300'
                  }`}
                >
                  {isBanned ? <Ban className="w-6 h-6 mb-1 text-red-400" /> : <Check className="w-6 h-6 mb-1 text-cyan-400" />}
                  <span className="text-[10px] font-black tracking-wider uppercase">
                    {isBanned ? 'BANNED' : 'PICKED'}
                  </span>
                </div>
              )}

              {/* Hero Name */}
              <div className="relative z-10 p-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block truncate group-hover:text-cyan-300">
                  {hero.name}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">{hero.role}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Action Modal when clicking a Hero (No Blur) */}
      {activeHeroModal && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/75 animate-in fade-in duration-100">
          <div className="bg-[#0B1020] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeHeroModal.portrait_url || activeHeroModal.image_url}
                alt={activeHeroModal.name}
                className="w-16 h-20 rounded-xl object-cover border border-cyan-500/40"
              />
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  {activeHeroModal.role}
                </span>
                <h3 className="text-2xl font-black text-white uppercase">{activeHeroModal.name}</h3>
                <p className="text-xs text-slate-400">Select action for current draft match:</p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  onSelectHero(activeHeroModal.id, 'pick', 'blue');
                  setActiveHeroModal(null);
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase text-sm shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all"
              >
                <Check className="w-4 h-4" /> Pick for Blue
              </button>

              <button
                onClick={() => {
                  onSelectHero(activeHeroModal.id, 'pick', 'red');
                  setActiveHeroModal(null);
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-sm shadow-[0_0_15px_rgba(255,56,100,0.4)] transition-all"
              >
                <Check className="w-4 h-4" /> Pick for Red
              </button>

              <button
                onClick={() => {
                  onSelectHero(activeHeroModal.id, 'ban', 'blue');
                  setActiveHeroModal(null);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 border border-red-500/50 hover:bg-red-950/60 text-red-300 font-bold uppercase text-xs transition-all"
              >
                <Ban className="w-4 h-4 text-red-400" /> Ban for Blue
              </button>

              <button
                onClick={() => {
                  onSelectHero(activeHeroModal.id, 'ban', 'red');
                  setActiveHeroModal(null);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 border border-red-500/50 hover:bg-red-950/60 text-red-300 font-bold uppercase text-xs transition-all"
              >
                <Ban className="w-4 h-4 text-red-400" /> Ban for Red
              </button>
            </div>

            <button
              onClick={() => setActiveHeroModal(null)}
              className="w-full py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-bold uppercase transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
