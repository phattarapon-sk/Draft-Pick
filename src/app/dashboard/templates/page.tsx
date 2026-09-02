'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTemplates, saveTemplate } from '@/lib/supabase/mockStorage';
import { Template } from '@/types';
import { Layers, Edit3, Copy, Plus, Check } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    const list = await getTemplates();
    setTemplates(list);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDuplicate = async (template: Template) => {
    const duplicated: Template = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      slug: `${template.slug}-copy`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await saveTemplate(duplicated);
    await fetchTemplates();
    setCopiedId(duplicated.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wider flex items-center gap-3">
            <Layers className="w-7 h-7 text-cyan-400" /> Broadcast Layout Templates
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Configure 1920x1080 canvas element coordinates, hero slot positions, and broadcast dimensions
          </p>
        </div>

        <Link
          href={`/dashboard/templates/editor?id=${templates[0]?.id || ''}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all"
        >
          <Edit3 className="w-4 h-4" />
          <span>Launch Visual Editor</span>
        </Link>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-2xl bg-[#0B1020] border border-slate-800 hover:border-cyan-500/40 p-6 shadow-xl flex flex-col justify-between gap-6 transition-all"
          >
            <div className="space-y-3">
              {/* Template mini canvas preview diagram */}
              <div className="w-full aspect-video rounded-xl bg-slate-950 border border-slate-800 p-3 relative flex items-center justify-between overflow-hidden">
                {/* Blue slots mockup */}
                <div className="flex items-center gap-1 h-full">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-2.5 h-12 rounded bg-cyan-500/30 border border-cyan-400/40" />
                  ))}
                </div>

                {/* Center timer mockup */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-4 rounded bg-amber-500/30 border border-amber-400/40" />
                  <span className="text-[8px] font-mono text-slate-500">16 : 9</span>
                </div>

                {/* Red slots mockup */}
                <div className="flex items-center gap-1 h-full">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-2.5 h-12 rounded bg-rose-500/30 border border-rose-400/40" />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  MASTER {template.canvas_width} × {template.canvas_height}
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-wide">
                  {template.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {template.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <span className="text-xs font-mono text-slate-500">
                {template.config?.heroSlots?.length ?? 10} Slots
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDuplicate(template)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  title="Duplicate Template"
                >
                  {copiedId === template.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Duplicate</span>
                </button>

                <Link
                  href={`/dashboard/templates/editor?id=${template.id}`}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
