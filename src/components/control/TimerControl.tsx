'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';

interface TimerControlProps {
  seconds: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
  disabled?: boolean;
}

export const TimerControl: React.FC<TimerControlProps> = ({
  seconds,
  isRunning,
  onTogglePlay,
  onReset,
  onAdjustTime,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-lg backdrop-blur-md">
      {/* Play / Pause button */}
      <button
        onClick={onTogglePlay}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-xs uppercase transition-all ${
          isRunning
            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
            : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]'
        }`}
      >
        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        <span>{isRunning ? 'Pause' : 'Start'}</span>
      </button>

      {/* Reset Timer Button */}
      <button
        onClick={onReset}
        disabled={disabled}
        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>30s</span>
      </button>

      {/* +10s / -10s */}
      <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
        <button
          onClick={() => onAdjustTime(-10)}
          disabled={disabled || seconds <= 5}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          title="-10 Seconds"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onAdjustTime(10)}
          disabled={disabled}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          title="+10 Seconds"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
