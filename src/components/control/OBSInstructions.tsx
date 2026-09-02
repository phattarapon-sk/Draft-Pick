'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Video, Monitor, X, Sparkles } from 'lucide-react';

interface OBSInstructionsProps {
  matchId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OBSInstructions: React.FC<OBSInstructionsProps> = ({
  matchId,
  isOpen,
  onClose,
}) => {
  const [copiedStandard, setCopiedStandard] = useState(false);
  const [copiedTransparent, setCopiedTransparent] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const standardUrl = `${origin}/overlay/${matchId}`;
  const transparentUrl = `${origin}/overlay/${matchId}?transparent=true`;

  const copyToClipboard = (text: string, isTransparent = false) => {
    navigator.clipboard.writeText(text);
    if (isTransparent) {
      setCopiedTransparent(true);
      setTimeout(() => setCopiedTransparent(false), 2000);
    } else {
      setCopiedStandard(true);
      setTimeout(() => setCopiedStandard(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/75 animate-in fade-in duration-100">
      <div className="bg-[#0B1020] border border-cyan-500/30 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,217,255,0.4)]">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-wide">
                OBS Studio Browser Source Setup
              </h3>
              <p className="text-xs text-slate-400">
                Integrate live draft pick graphics directly into OBS Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URLs */}
        <div className="space-y-4">
          {/* Standard Broadcast URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5" /> 1. Standard Overlay URL (Full Canvas + Theme Background)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={standardUrl}
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 select-all focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(standardUrl, false)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase shadow-[0_0_12px_rgba(0,217,255,0.4)] transition-all"
              >
                {copiedStandard ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedStandard ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Transparent Overlay URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> 2. Transparent Mode URL (Overlay Only - Transparent BG)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={transparentUrl}
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 select-all focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(transparentUrl, true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all"
              >
                {copiedTransparent ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedTransparent ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* OBS Configuration Guide Steps */}
        <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
            Recommended OBS Browser Source Settings:
          </h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">WIDTH</span>
              <span className="text-base font-bold text-white font-mono">1920</span>
            </div>
            <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">HEIGHT</span>
              <span className="text-base font-bold text-white font-mono">1080</span>
            </div>
            <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">FPS</span>
              <span className="text-base font-bold text-emerald-400 font-mono">60</span>
            </div>
          </div>

          <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4 pt-1">
            <li>Check <strong className="text-slate-200">&ldquo;Shutdown source when not visible&rdquo;</strong> for best performance.</li>
            <li>Enable <strong className="text-slate-200">&ldquo;Refresh browser when scene becomes active&rdquo;</strong> to auto-resync state.</li>
          </ul>
        </div>

        {/* Open in new tab button */}
        <div className="flex justify-end gap-3 pt-2">
          <a
            href={standardUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Overlay in New Tab</span>
          </a>
        </div>
      </div>
    </div>
  );
};
