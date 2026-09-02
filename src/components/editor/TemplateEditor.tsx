'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Template, HeroSlotConfig, ElementPosition } from '@/types';
import { saveTemplate } from '@/lib/supabase/mockStorage';
import { DEFAULT_TEMPLATES } from '@/config/defaultData';
import {
  Save,
  RotateCcw,
  Move,
  LayoutGrid,
  Check,
  Sliders,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Trophy,
  Shield,
  Swords,
  DollarSign,
} from 'lucide-react';

interface TemplateEditorProps {
  template: Template;
  onSave?: (updated: Template) => void;
}

type ElementKey =
  | 'timer'
  | 'phaseIndicator'
  | 'blueTeamHeader'
  | 'redTeamHeader'
  | 'blueScore'
  | 'redScore'
  | 'sponsors'
  | string; // slot id e.g. slot-blue-pick-0

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template: initialTemplate,
  onSave,
}) => {
  const [template, setTemplate] = useState<Template>(initialTemplate);
  const [selectedElement, setSelectedElement] = useState<ElementKey | null>('slot-blue-pick-0');
  const [snapGrid, setSnapGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(10);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'inspector' | 'elements' | 'presets'>('elements');

  // Track hidden/disabled elements so user can add/remove elements dynamically
  const [hiddenElements, setHiddenElements] = useState<Set<string>>(new Set());

  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    mode: 'move' | 'resize';
    handle?: 'se' | 'sw' | 'ne' | 'nw';
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
  } | null>(null);

  const config = template.config;

  // Helper to get element bounds
  const getElementBounds = useCallback(
    (key: ElementKey): { x: number; y: number; width: number; height: number } => {
      if (key.startsWith('slot-')) {
        const slot = config.heroSlots.find((s) => s.id === key);
        if (slot) return { x: slot.x, y: slot.y, width: slot.width, height: slot.height };
      } else if (key in config) {
        const pos = config[key as keyof typeof config] as ElementPosition;
        if (pos) {
          return {
            x: pos.x,
            y: pos.y,
            width: pos.width || (key === 'timer' ? 240 : key === 'phaseIndicator' ? 400 : 200),
            height: pos.height || (key === 'timer' ? 100 : key === 'phaseIndicator' ? 45 : 80),
          };
        }
      }
      return { x: 0, y: 0, width: 100, height: 100 };
    },
    [config]
  );

  // Helper to update element bounds
  const updateElementBounds = useCallback(
    (key: ElementKey, updates: { x?: number; y?: number; width?: number; height?: number }) => {
      setTemplate((prev) => {
        if (key.startsWith('slot-')) {
          const updatedSlots = prev.config.heroSlots.map((slot) => {
            if (slot.id === key) {
              return { ...slot, ...updates };
            }
            return slot;
          });
          return {
            ...prev,
            config: {
              ...prev.config,
              heroSlots: updatedSlots,
            },
          };
        } else if (key in prev.config) {
          const existing = prev.config[key as keyof typeof prev.config] as ElementPosition;
          return {
            ...prev,
            config: {
              ...prev.config,
              [key]: {
                ...existing,
                ...updates,
              },
            },
          };
        }
        return prev;
      });
    },
    []
  );

  // Toggle Element Visibility
  const toggleElementVisibility = (key: string) => {
    setHiddenElements((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Clear all or Load preset
  const handleLoadPreset = (presetId: string) => {
    const found = DEFAULT_TEMPLATES.find((t) => t.id === presetId || t.slug === presetId);
    if (found) {
      setTemplate({
        ...found,
        id: template.id,
        name: template.name,
      });
      setHiddenElements(new Set());
    }
  };

  const handleClearCanvas = () => {
    // Hide all items
    const allKeys = [
      'timer', 'phaseIndicator', 'blueTeamHeader', 'redTeamHeader', 'blueScore', 'redScore', 'sponsors',
      ...config.heroSlots.map(s => s.id)
    ];
    setHiddenElements(new Set(allKeys));
  };

  const handleShowAll = () => {
    setHiddenElements(new Set());
  };

  // Mouse Drag / Resize Engine
  const startDrag = (
    e: React.MouseEvent,
    key: ElementKey,
    mode: 'move' | 'resize',
    handle: 'se' | 'sw' | 'ne' | 'nw' = 'se'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedElement(key);

    const bounds = getElementBounds(key);
    setDragState({
      mode,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialX: bounds.x,
      initialY: bounds.y,
      initialW: bounds.width,
      initialH: bounds.height,
    });
  };

  useEffect(() => {
    if (!dragState || !selectedElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = 1920 / rect.width;
      const scaleY = 1080 / rect.height;

      const deltaX = (e.clientX - dragState.startX) * scaleX;
      const deltaY = (e.clientY - dragState.startY) * scaleY;

      if (dragState.mode === 'move') {
        let newX = dragState.initialX + deltaX;
        let newY = dragState.initialY + deltaY;

        if (snapGrid) {
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }

        // Clamp inside 1920x1080
        newX = Math.max(0, Math.min(1920 - dragState.initialW, Math.round(newX)));
        newY = Math.max(0, Math.min(1080 - dragState.initialH, Math.round(newY)));

        updateElementBounds(selectedElement, { x: newX, y: newY });
      } else if (dragState.mode === 'resize') {
        let newW = dragState.initialW;
        let newH = dragState.initialH;
        let newX = dragState.initialX;
        let newY = dragState.initialY;

        if (dragState.handle === 'se') {
          newW = Math.max(30, dragState.initialW + deltaX);
          newH = Math.max(30, dragState.initialH + deltaY);
        } else if (dragState.handle === 'sw') {
          newW = Math.max(30, dragState.initialW - deltaX);
          newH = Math.max(30, dragState.initialH + deltaY);
          newX = dragState.initialX + (dragState.initialW - newW);
        } else if (dragState.handle === 'ne') {
          newW = Math.max(30, dragState.initialW + deltaX);
          newH = Math.max(30, dragState.initialH - deltaY);
          newY = dragState.initialY + (dragState.initialH - newH);
        } else if (dragState.handle === 'nw') {
          newW = Math.max(30, dragState.initialW - deltaX);
          newH = Math.max(30, dragState.initialH - deltaY);
          newX = dragState.initialX + (dragState.initialW - newW);
          newY = dragState.initialY + (dragState.initialH - newH);
        }

        if (snapGrid) {
          newW = Math.round(newW / gridSize) * gridSize;
          newH = Math.round(newH / gridSize) * gridSize;
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }

        updateElementBounds(selectedElement, {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        });
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, selectedElement, snapGrid, gridSize, updateElementBounds]);

  // Keyboard Nudge (Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const current = getElementBounds(selectedElement);

        let newX = current.x;
        let newY = current.y;

        if (e.key === 'ArrowLeft') newX -= step;
        if (e.key === 'ArrowRight') newX += step;
        if (e.key === 'ArrowUp') newY -= step;
        if (e.key === 'ArrowDown') newY += step;

        updateElementBounds(selectedElement, {
          x: Math.max(0, Math.min(1920 - current.width, newX)),
          y: Math.max(0, Math.min(1080 - current.height, newY)),
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, getElementBounds, updateElementBounds]);

  const handleSave = async () => {
    const saved = await saveTemplate(template);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    onSave?.(saved);
  };

  const selectedBounds = selectedElement ? getElementBounds(selectedElement) : null;

  // Render Draggable Element Box helper
  const renderDraggableBox = (
    key: ElementKey,
    shortTitle: string,
    colorScheme: 'cyan' | 'rose' | 'amber' | 'emerald' | 'slate' = 'slate'
  ) => {
    if (hiddenElements.has(key)) return null;

    const isSelected = selectedElement === key;
    const bounds = getElementBounds(key);

    const themeBorder =
      colorScheme === 'cyan'
        ? isSelected
          ? 'border-cyan-400 ring-2 ring-cyan-300 bg-cyan-950/80 text-cyan-200'
          : 'border-cyan-500/70 bg-cyan-950/40 text-cyan-300 hover:border-cyan-400'
        : colorScheme === 'rose'
        ? isSelected
          ? 'border-rose-400 ring-2 ring-rose-300 bg-rose-950/80 text-rose-200'
          : 'border-rose-500/70 bg-rose-950/40 text-rose-300 hover:border-rose-400'
        : colorScheme === 'amber'
        ? isSelected
          ? 'border-amber-400 ring-2 ring-amber-300 bg-amber-950/80 text-amber-200'
          : 'border-amber-500/70 bg-amber-950/40 text-amber-300 hover:border-amber-400'
        : colorScheme === 'emerald'
        ? isSelected
          ? 'border-emerald-400 ring-2 ring-emerald-300 bg-emerald-950/80 text-emerald-200'
          : 'border-emerald-500/70 bg-emerald-950/40 text-emerald-300 hover:border-emerald-400'
        : isSelected
        ? 'border-white ring-2 ring-cyan-400 bg-slate-800 text-white'
        : 'border-slate-600 bg-slate-900/60 text-slate-400 hover:border-slate-400';

    return (
      <div
        key={key}
        onMouseDown={(e) => startDrag(e, key, 'move')}
        className={`absolute rounded-xl border-2 flex flex-col items-center justify-center font-mono font-bold text-xs cursor-move select-none transition-shadow ${themeBorder}`}
        style={{
          left: `${(bounds.x / 1920) * 100}%`,
          top: `${(bounds.y / 1080) * 100}%`,
          width: `${(bounds.width / 1920) * 100}%`,
          height: `${(bounds.height / 1080) * 100}%`,
          zIndex: isSelected ? 50 : 10,
        }}
      >
        <span className="px-1.5 py-0.5 rounded bg-black/60 text-[10px] sm:text-xs truncate pointer-events-none drop-shadow font-bold">
          {shortTitle}
        </span>

        {/* Live coordinate readout when selected */}
        {isSelected && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/95 text-cyan-300 border border-cyan-400/60 text-[10px] px-2 py-0.5 rounded shadow-xl whitespace-nowrap pointer-events-none z-50 flex items-center gap-1.5 font-mono">
            <span>X:{bounds.x} Y:{bounds.y}</span>
            <span className="text-slate-500">|</span>
            <span>W:{bounds.width} H:{bounds.height}</span>
          </div>
        )}

        {/* 4 Corner Resize Handles (when selected) */}
        {isSelected && (
          <>
            <div
              onMouseDown={(e) => startDrag(e, key, 'resize', 'nw')}
              className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-cyan-300 border-2 border-black rounded-full cursor-nwse-resize shadow-md hover:scale-125 z-50"
            />
            <div
              onMouseDown={(e) => startDrag(e, key, 'resize', 'ne')}
              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-cyan-300 border-2 border-black rounded-full cursor-nesw-resize shadow-md hover:scale-125 z-50"
            />
            <div
              onMouseDown={(e) => startDrag(e, key, 'resize', 'sw')}
              className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-cyan-300 border-2 border-black rounded-full cursor-nesw-resize shadow-md hover:scale-125 z-50"
            />
            <div
              onMouseDown={(e) => startDrag(e, key, 'resize', 'se')}
              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-cyan-300 border-2 border-black rounded-full cursor-nwse-resize shadow-md hover:scale-125 z-50"
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-5 p-4 md:p-6 bg-[#050816] text-white">
      {/* 1. Canvas Visual Preview (16:9 aspect) */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B1020] p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs md:text-sm font-bold uppercase text-white tracking-wide">
              1920 × 1080 Interactive Canvas Editor
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 font-mono cursor-pointer bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <input
                type="checkbox"
                checked={snapGrid}
                onChange={(e) => setSnapGrid(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-500 cursor-pointer"
              />
              <span>Snap ({gridSize}px)</span>
            </label>

            <button
              onClick={handleClearCanvas}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-red-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="ซ่อน Element ทั้งหมดเพื่อเริ่มวางเองใหม่"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างจอ (Clear)</span>
            </button>

            <button
              onClick={handleShowAll}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>แสดงทั้งหมด</span>
            </button>
          </div>
        </div>

        {/* 1920x1080 Interactive Stage */}
        <div
          ref={canvasRef}
          className="relative w-full aspect-video bg-[#070B18] rounded-2xl border-2 border-slate-700 shadow-2xl overflow-hidden select-none"
        >
          {/* Subtle Grid Lines */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #00D9FF 1px, transparent 1px), linear-gradient(to bottom, #00D9FF 1px, transparent 1px)',
              backgroundSize: `${(gridSize / 1920) * 100}% ${(gridSize / 1080) * 100}%`,
            }}
          />

          {/* Header & Scores */}
          {renderDraggableBox('blueTeamHeader', 'Blue Team', 'cyan')}
          {renderDraggableBox('redTeamHeader', 'Red Team', 'rose')}
          {renderDraggableBox('blueScore', 'Score (B)', 'cyan')}
          {renderDraggableBox('redScore', 'Score (R)', 'rose')}

          {/* Timer & Phase */}
          {renderDraggableBox('timer', 'Timer', 'amber')}
          {renderDraggableBox('phaseIndicator', 'Phase Badge', 'emerald')}

          {/* Sponsor Box */}
          {renderDraggableBox('sponsors', 'Sponsors', 'amber')}

          {/* Hero Slots (Picks & Bans) */}
          {config.heroSlots.map((slot) => {
            const isBlue = slot.team === 'blue';
            const isBan = slot.type === 'ban';
            const label = isBan
              ? `${isBlue ? 'B' : 'R'}-Ban ${slot.slotIndex + 1}`
              : `${isBlue ? 'Blue' : 'Red'} Pick ${slot.slotIndex + 1}`;
            return renderDraggableBox(
              slot.id,
              label,
              isBan ? (isBlue ? 'cyan' : 'rose') : isBlue ? 'cyan' : 'rose'
            );
          })}
        </div>
      </div>

      {/* 2. Inspector / Element Palette Panel */}
      <div className="w-full xl:w-96 rounded-2xl bg-[#0B1020] border border-slate-800 p-4 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header + Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('elements')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'elements'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                รายการ Element
              </button>
              <button
                onClick={() => setActiveTab('inspector')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'inspector'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                พิกัด X/Y
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'presets'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                พรีเซ็ต
              </button>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all cursor-pointer"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedSuccess ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* TAB 1: ELEMENTS PALETTE (Choose which items are on canvas) */}
          {activeTab === 'elements' && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                💡 กดรูปตา <Eye className="w-3 h-3 inline text-cyan-400" /> เพื่อเปิด/ปิด Element ลงบนหน้าจอ หรือคลิกเพื่อแก้ไขตำแหน่ง
              </div>

              {/* Blue Team Elements */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  ฝั่งสีน้ำเงิน (Blue Team)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const key = `slot-blue-pick-${i}`;
                    const isVisible = !hiddenElements.has(key);
                    const isSel = selectedElement === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          if (!isVisible) toggleElementVisibility(key);
                          setSelectedElement(key);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-all ${
                          isSel
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                            : isVisible
                            ? 'bg-slate-900 border-slate-700 text-white hover:border-slate-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                        }`}
                      >
                        <span>Blue Pick {i + 1}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleElementVisibility(key);
                          }}
                          className="p-0.5 hover:text-white"
                        >
                          {isVisible ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3" />}
                        </span>
                      </button>
                    );
                  })}
                  {[0, 1, 2, 3].map((i) => {
                    const key = `slot-blue-ban-${i}`;
                    const isVisible = !hiddenElements.has(key);
                    const isSel = selectedElement === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          if (!isVisible) toggleElementVisibility(key);
                          setSelectedElement(key);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-all ${
                          isSel
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                            : isVisible
                            ? 'bg-slate-900 border-slate-700 text-white hover:border-slate-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                        }`}
                      >
                        <span>Blue Ban {i + 1}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleElementVisibility(key);
                          }}
                          className="p-0.5 hover:text-white"
                        >
                          {isVisible ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Red Team Elements */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                  ฝั่งสีแดง (Red Team)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const key = `slot-red-pick-${i}`;
                    const isVisible = !hiddenElements.has(key);
                    const isSel = selectedElement === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          if (!isVisible) toggleElementVisibility(key);
                          setSelectedElement(key);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-all ${
                          isSel
                            ? 'bg-rose-950 border-rose-400 text-rose-300 ring-1 ring-rose-400'
                            : isVisible
                            ? 'bg-slate-900 border-slate-700 text-white hover:border-slate-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                        }`}
                      >
                        <span>Red Pick {i + 1}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleElementVisibility(key);
                          }}
                          className="p-0.5 hover:text-white"
                        >
                          {isVisible ? <Eye className="w-3 h-3 text-rose-400" /> : <EyeOff className="w-3 h-3" />}
                        </span>
                      </button>
                    );
                  })}
                  {[0, 1, 2, 3].map((i) => {
                    const key = `slot-red-ban-${i}`;
                    const isVisible = !hiddenElements.has(key);
                    const isSel = selectedElement === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          if (!isVisible) toggleElementVisibility(key);
                          setSelectedElement(key);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-all ${
                          isSel
                            ? 'bg-rose-950 border-rose-400 text-rose-300 ring-1 ring-rose-400'
                            : isVisible
                            ? 'bg-slate-900 border-slate-700 text-white hover:border-slate-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                        }`}
                      >
                        <span>Red Ban {i + 1}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleElementVisibility(key);
                          }}
                          className="p-0.5 hover:text-white"
                        >
                          {isVisible ? <Eye className="w-3 h-3 text-rose-400" /> : <EyeOff className="w-3 h-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extras Elements */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  นาฬิกา & สกอร์ & สปอนเซอร์
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { key: 'timer', label: 'นาฬิกา Timer' },
                    { key: 'phaseIndicator', label: 'Phase Badge' },
                    { key: 'blueScore', label: 'คะแนน Blue' },
                    { key: 'redScore', label: 'คะแนน Red' },
                    { key: 'sponsors', label: 'Sponsors Box' },
                  ].map((item) => {
                    const isVisible = !hiddenElements.has(item.key);
                    const isSel = selectedElement === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          if (!isVisible) toggleElementVisibility(item.key);
                          setSelectedElement(item.key);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-all ${
                          isSel
                            ? 'bg-amber-950 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                            : isVisible
                            ? 'bg-slate-900 border-slate-700 text-white hover:border-slate-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleElementVisibility(item.key);
                          }}
                          className="p-0.5 hover:text-white"
                        >
                          {isVisible ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSPECTOR (Selected item coordinates) */}
          {activeTab === 'inspector' && (
            <div className="space-y-4">
              {selectedElement && selectedBounds ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-cyan-300 uppercase block truncate">
                      เลือกอยู่: {selectedElement}
                    </span>
                    <button
                      onClick={() => toggleElementVisibility(selectedElement)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 hover:text-white"
                    >
                      {hiddenElements.has(selectedElement) ? 'แสดงบนจอ' : 'ซ่อนจากจอ'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">X Position (px)</label>
                      <input
                        type="number"
                        value={selectedBounds.x}
                        onChange={(e) =>
                          updateElementBounds(selectedElement, { x: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Y Position (px)</label>
                      <input
                        type="number"
                        value={selectedBounds.y}
                        onChange={(e) =>
                          updateElementBounds(selectedElement, { y: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Width (px)</label>
                      <input
                        type="number"
                        value={selectedBounds.width}
                        onChange={(e) =>
                          updateElementBounds(selectedElement, { width: parseInt(e.target.value, 10) || 50 })
                        }
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Height (px)</label>
                      <input
                        type="number"
                        value={selectedBounds.height}
                        onChange={(e) =>
                          updateElementBounds(selectedElement, { height: parseInt(e.target.value, 10) || 50 })
                        }
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 p-4 text-center">
                  คลิกที่ Element บนจอเพื่อแก้ไขพิกัด X, Y, Width, Height
                </div>
              )}

              {/* Template Info */}
              <div className="space-y-2.5 pt-3 border-t border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Template Name</label>
                  <input
                    type="text"
                    value={template.name}
                    onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase block mb-1">
                โหลดพรีเซ็ตสำเร็จรูป:
              </span>
              <button
                type="button"
                onClick={() => handleLoadPreset('template-standard-16-9')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left text-xs font-bold text-white flex flex-col gap-0.5 cursor-pointer"
              >
                <span>⚡ Standard 16:9 (เต็มจอ)</span>
                <span className="text-[10px] text-slate-400 font-normal">จัดเรียงแบบเต็มจอ 5 ช่องซ้ายขวา</span>
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('template-rpl-official')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left text-xs font-bold text-white flex flex-col gap-0.5 cursor-pointer"
              >
                <span>⚡ RoV Pro League (ครึ่งจอล่าง Dock)</span>
                <span className="text-[10px] text-slate-400 font-normal">จัดเรียงแถบล่าง Dock แบบทัวร์นาเมนต์</span>
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('template-split-arena')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left text-xs font-bold text-white flex flex-col gap-0.5 cursor-pointer"
              >
                <span>⚡ Split Arena (แยกฝั่ง)</span>
                <span className="text-[10px] text-slate-400 font-normal">จัดเรียงฝั่งซ้าย-ขวาเว้นตรงกลาง</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Save Action Bar */}
        <div className="border-t border-slate-800 pt-3">
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'บันทึกเรียบร้อย!' : 'บันทึก Layout Template'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
