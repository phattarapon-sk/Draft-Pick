'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getTemplates } from '@/lib/supabase/mockStorage';
import { Template } from '@/types';
import { TemplateEditor } from '@/components/editor/TemplateEditor';
import { ArrowLeft, Layers, Loader2 } from 'lucide-react';

function TemplateEditorInner() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('id');
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTemplates().then((templates) => {
      const found = templates.find((t) => t.id === templateId) || templates[0];
      setTemplate(found || null);
      setLoading(false);
    });
  }, [templateId]);

  if (loading || !template) {
    return (
      <div className="w-full min-h-screen bg-[#050816] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050816]">
      {/* Editor Top Bar */}
      <div className="border-b border-white/10 bg-[#0B1020] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/templates"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Template Editor: {template.name}
            </h1>
            <span className="text-[10px] font-mono text-slate-400">
              Editing Canvas Layout Coordinates • 1920 × 1080
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <TemplateEditor template={template} />
      </div>
    </div>
  );
}

export default function TemplateEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#050816] flex items-center justify-center text-white">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      }
    >
      <TemplateEditorInner />
    </Suspense>
  );
}
