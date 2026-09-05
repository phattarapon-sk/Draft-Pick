'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ElementPosition, MatchPhase } from '@/types';
import { Clock } from 'lucide-react';

interface DraftTimerProps {
  position: ElementPosition;
  seconds: number;
  isRunning: boolean;
  currentTurn: 'blue' | 'red';
  phaseType?: string;
  phaseTitle?: string;
  boFormat?: string;
  phase?: MatchPhase;
}

export const DraftTimer: React.FC<DraftTimerProps> = ({
  position,
  seconds,
  isRunning,
  currentTurn,
  phaseType,
  phaseTitle,
  boFormat = 'BO 3',
  phase,
}) => {
  const isBlue = currentTurn === 'blue';
  const isUrgent = seconds <= 10 && seconds > 0;
  const isFinished = seconds <= 0;
  const isWaiting = phase === 'WAITING' || phaseType === 'waiting' || phaseType === 'ready';

  const formattedTime = seconds.toString().padStart(2, '0');

  // 1. Waiting for Match Start State (Integrated Center Scoreboard Module)
  if (isWaiting) {
    return (
      <div
        className="absolute flex items-center justify-center transition-all duration-300 pointer-events-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${position.width || 160}px`,
          height: `${position.height || 95}px`,
          zIndex: 30,
        }}
      >
        <div className="relative w-full h-full rounded-2xl flex flex-col items-center justify-center px-2 py-1.5 overflow-hidden border-2 border-amber-400/50 bg-[#060B1C]/95 backdrop-blur-xl shadow-[0_0_25px_rgba(251,191,36,0.25)] select-none">
          {/* Ambient Top & Bottom Accent Lines */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* BO Format Oval Pill */}
          <div className="px-3 py-0.5 rounded-full bg-black/80 border border-amber-400/40 shadow-inner flex items-center justify-center">
            <span className="text-[11px] font-black tracking-wider text-amber-300 uppercase font-display">
              {boFormat}
            </span>
          </div>

          {/* Waiting for Start Status with Pulsing Live Beacon */}
          <div className="flex flex-col items-center justify-center mt-1 text-center">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-[11px] font-black tracking-widest text-white uppercase font-display drop-shadow whitespace-nowrap">
                WAITING FOR START
              </span>
            </div>
            <span className="text-[8px] font-mono tracking-widest uppercase text-amber-400/90 font-bold mt-0.5">
              MATCH STANDBY
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Draft State (Live Countdown Timer + Turn / Phase Indicator)
  return (
    <div
      className="absolute flex items-center justify-center transition-all duration-300 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width || 160}px`,
        height: `${position.height || 95}px`,
        zIndex: 30,
      }}
    >
      <motion.div
        animate={
          isUrgent && isRunning
            ? { scale: [1, 1.04, 1], boxShadow: ['0 0 10px #ff0033', '0 0 35px #ff0033', '0 0 10px #ff0033'] }
            : {}
        }
        transition={{ repeat: Infinity, duration: 0.8 }}
        className={`relative w-full h-full rounded-2xl flex flex-col items-center justify-center px-2 py-1.5 overflow-hidden border-2 backdrop-blur-xl transition-all duration-300 shadow-2xl select-none ${
          isUrgent
            ? 'bg-red-950/95 border-red-500 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
            : isBlue
            ? 'bg-[#041628]/95 border-cyan-400/80 text-cyan-50 shadow-[0_0_25px_rgba(0,217,255,0.35)]'
            : 'bg-[#1A0612]/95 border-rose-500/80 text-rose-50 shadow-[0_0_25px_rgba(255,56,100,0.35)]'
        }`}
      >
        {/* Top/Bottom Accent Bars */}
        <div
          className={`absolute top-0 inset-x-0 h-1 ${
            isUrgent ? 'bg-red-500' : isBlue ? 'bg-cyan-400' : 'bg-rose-500'
          }`}
        />
        <div
          className={`absolute bottom-0 inset-x-0 h-1 ${
            isUrgent ? 'bg-red-500' : isBlue ? 'bg-cyan-400' : 'bg-rose-500'
          }`}
        />

        {/* Top Row: BO Format + Phase Name */}
        <div className="flex items-center justify-center gap-1.5 w-full">
          <span className="px-2 py-0.5 rounded-full bg-black/80 border border-white/20 text-[9px] font-black tracking-wider text-white uppercase font-display">
            {boFormat}
          </span>
          <span
            className={`text-[10px] font-black tracking-wider uppercase font-display truncate max-w-[95px] ${
              isUrgent ? 'text-red-300' : isBlue ? 'text-cyan-300' : 'text-rose-300'
            }`}
          >
            {phaseTitle || (isBlue ? 'BLUE' : 'RED')}
          </span>
        </div>

        {/* Middle Row: Digital Seconds + Clock Icon */}
        <div className="flex items-center justify-center gap-1.5 my-0.5">
          <Clock
            className={`w-4 h-4 ${
              isUrgent ? 'text-red-400 animate-spin' : isBlue ? 'text-cyan-400' : 'text-rose-400'
            }`}
          />
          <span
            className={`text-3xl font-mono font-black tracking-wider ${
              isUrgent
                ? 'text-red-400 text-glow-red'
                : isBlue
                ? 'text-cyan-300 text-glow-blue'
                : 'text-rose-300 text-glow-red'
            }`}
          >
            {formattedTime}
          </span>
        </div>

        {/* Bottom Row: Status Text */}
        <span className="text-[8px] font-mono tracking-widest uppercase text-slate-400 -mt-0.5 font-bold">
          {isRunning ? 'COUNTDOWN' : isFinished ? 'TIME EXPIRED' : 'PAUSED'}
        </span>
      </motion.div>
    </div>
  );
};
