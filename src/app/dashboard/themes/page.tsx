'use client';

import React, { useEffect, useState } from 'react';
import { getThemes, saveTheme } from '@/lib/supabase/mockStorage';
import { Theme, BackgroundType } from '@/types';
import { Palette, Plus, Edit2, Check, X, Sparkles } from 'lucide-react';

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [isNew, setIsNew] = useState(false);

  const fetchThemes = async () => {
    const list = await getThemes();
    setThemes(list);
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleOpenNew = () => {
    setEditingTheme({
      id: `theme-${Date.now()}`,
      name: '',
      slug: '',
      description: '',
      background_type: 'gradient',
      primary_color: '#00D9FF',
      secondary_color: '#FF3864',
      accent_color: '#FFD166',
      glow_color: '#00D9FF',
      frame_style: 'esports',
      font_family: 'Outfit',
      animation_preset: 'smooth',
      is_public: true,
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTheme || !editingTheme.name) return;

    await saveTheme(editingTheme);
    await fetchThemes();
    setEditingTheme(null);
    setIsNew(false);
  };

  return (
    <>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wider flex items-center gap-3">
            <Palette className="w-7 h-7 text-cyan-400" /> Visual Themes & Style Engine
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Customize esports broadcast atmosphere, neon glow colors, card borders, and font presets
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Theme</span>
        </button>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="rounded-2xl bg-[#0B1020] border border-slate-800 hover:border-cyan-500/40 p-6 shadow-xl flex flex-col justify-between gap-6 transition-all relative overflow-hidden"
          >
            {/* Background Ambient Aura Glow */}
            <div
              className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: theme.primary_color }}
            />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border"
                  style={{
                    color: theme.primary_color,
                    borderColor: `${theme.primary_color}40`,
                    backgroundColor: `${theme.primary_color}10`,
                  }}
                >
                  {theme.frame_style.toUpperCase()} FRAME
                </span>

                <button
                  onClick={() => {
                    setEditingTheme(theme);
                    setIsNew(false);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wide">
                  {theme.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {theme.description}
                </p>
              </div>

              {/* Color Swatches */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                  Broadcast Color Palette
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg border border-white/20 shadow-md flex items-center justify-center text-[10px] font-mono font-bold text-black"
                    style={{ backgroundColor: theme.primary_color }}
                    title={`Primary: ${theme.primary_color}`}
                  >
                    P
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg border border-white/20 shadow-md flex items-center justify-center text-[10px] font-mono font-bold text-white"
                    style={{ backgroundColor: theme.secondary_color }}
                    title={`Secondary: ${theme.secondary_color}`}
                  >
                    S
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg border border-white/20 shadow-md flex items-center justify-center text-[10px] font-mono font-bold text-black"
                    style={{ backgroundColor: theme.accent_color }}
                    title={`Accent: ${theme.accent_color}`}
                  >
                    A
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Specs */}
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>BG: {theme.background_type.toUpperCase()}</span>
              <span>FX: {theme.animation_preset.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

      {/* Edit / Create Theme Modal (Full viewport coverage) */}
      {editingTheme && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-screen z-[9999] !m-0 !p-4 flex items-center justify-center bg-black/80">
          <div className="bg-[#0B1020] border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black uppercase text-white">
                {isNew ? 'Create New Theme' : `Edit Theme: ${editingTheme.name}`}
              </h3>
              <button
                onClick={() => setEditingTheme(null)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-300 uppercase block mb-1">Theme Name *</label>
                <input
                  type="text"
                  required
                  value={editingTheme.name}
                  onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingTheme.description}
                  onChange={(e) => setEditingTheme({ ...editingTheme, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={editingTheme.primary_color}
                    onChange={(e) => setEditingTheme({ ...editingTheme, primary_color: e.target.value })}
                    className="w-full h-9 rounded-lg bg-transparent cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Secondary</label>
                  <input
                    type="color"
                    value={editingTheme.secondary_color}
                    onChange={(e) => setEditingTheme({ ...editingTheme, secondary_color: e.target.value })}
                    className="w-full h-9 rounded-lg bg-transparent cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Accent</label>
                  <input
                    type="color"
                    value={editingTheme.accent_color}
                    onChange={(e) => setEditingTheme({ ...editingTheme, accent_color: e.target.value })}
                    className="w-full h-9 rounded-lg bg-transparent cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 uppercase block mb-1">Frame Style</label>
                  <select
                    value={editingTheme.frame_style}
                    onChange={(e) => setEditingTheme({ ...editingTheme, frame_style: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="esports">Esports Standard</option>
                    <option value="cyber">Cyberpunk Neon</option>
                    <option value="fantasy">Mythic Fantasy</option>
                    <option value="minimal">Minimalist Glass</option>
                    <option value="neon">Championship Gold</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 uppercase block mb-1">Default Background</label>
                  <select
                    value={editingTheme.background_type}
                    onChange={(e) => setEditingTheme({ ...editingTheme, background_type: e.target.value as BackgroundType })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="gradient">Esports Dynamic Gradient</option>
                    <option value="transparent">Transparent Mode</option>
                    <option value="image">Custom Image</option>
                    <option value="video">Custom Video</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTheme(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Theme</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
