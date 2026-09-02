'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ElementPosition } from '@/types';
import { Clock } from 'lucide-react';

interface DraftTimerProps {
  position: ElementPosition;
  seconds: number;
  isRunning: boolean;
  currentTurn: 'blue' | 'red';
  phaseType: string;
  boFormat?: string;
}

export const DraftTimer: React.FC<DraftTimerProps> = ({
  position,
  seconds,
  isRunning,
  currentTurn,
  boFormat = 'BO 3',
}) => {
  const isBlue = currentTurn === 'blue';
  const isUrgent = seconds <= 10 && seconds > 0;
  const isFinished = seconds <= 0;

  const formattedTime = seconds.toString().padStart(2, '0');

  return (
    <div
      className="absolute flex items-center justify-center transition-all duration-300 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width || 200}px`,
        height: `${position.height || 90}px`,
        zIndex: 30,
      }}
    >
      <motion.div
        animate={
          isUrgent && isRunning
            ? { scale: [1, 1.05, 1], boxShadow: ['0 0 10px #ff0033', '0 0 35px #ff0033', '0 0 10px #ff0033'] }
            : {}
        }
        transition={{ repeat: Infinity, duration: 0.8 }}
        className={`relative w-full h-full rounded-2xl flex items-center justify-center gap-3 px-4 overflow-hidden border backdrop-blur-xl transition-all duration-300 ${
          isUrgent
            ? 'bg-red-950/90 border-red-500/80 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
            : isBlue
            ? 'bg-[#041628]/95 border-cyan-500/50 text-cyan-50 shadow-[0_0_25px_rgba(0,217,255,0.3)]'
            : 'bg-[#1A0612]/95 border-rose-500/50 text-rose-50 shadow-[0_0_25px_rgba(255,56,100,0.3)]'
        }`}
      >
        {/* Background sweep */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        {/* Turn indicator accent bars */}
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

        {/* BO Format Oval Pill (Like ROV broadcast reference) */}
        <div className="px-3.5 py-1 rounded-full bg-black/80 border border-white/20 shadow-inner flex items-center justify-center">
          <span className="text-base md:text-lg font-black tracking-wider text-white uppercase font-display">
            {boFormat}
          </span>
        </div>

        {/* Digital Time */}
        <div className="flex items-center gap-2">
          <Clock
            className={`w-5 h-5 ${
              isUrgent ? 'text-red-400 animate-spin' : isBlue ? 'text-cyan-400' : 'text-rose-400'
            }`}
          />
          <div className="flex flex-col items-center">
            <span
              className={`text-3xl md:text-4xl font-mono font-black tracking-wider ${
                isUrgent
                  ? 'text-red-400 text-glow-red'
                  : isBlue
                  ? 'text-cyan-300 text-glow-blue'
                  : 'text-rose-300 text-glow-red'
              }`}
            >
              {formattedTime}
            </span>
            <span className="text-[8px] font-mono tracking-widest uppercase text-slate-400 -mt-1 font-bold">
              {isRunning ? 'COUNTDOWN' : isFinished ? 'TIME EXPIRED' : 'PAUSED'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
