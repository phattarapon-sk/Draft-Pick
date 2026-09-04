'use client';

import React, { useState, useRef } from 'react';
import { uploadImageFile } from '@/lib/uploadService';
import { Upload, Image as ImageIcon, Link as LinkIcon, Check, Loader2, X } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  bucket?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label,
  placeholder = 'https://... or upload local file',
  bucket = 'assets',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-uploading the same file works
    e.target.value = '';

    setIsUploading(true);
    try {
      const url = await uploadImageFile(file, bucket);
      onChange(url);
    } catch (err: any) {
      console.error('File upload failed', err);
      alert(`อัปโหลดรูปภาพไม่สำเร็จ: ${err?.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 uppercase">
          <span>{label}</span>
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-2 py-0.5 rounded ${mode === 'upload' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'}`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-2 py-0.5 rounded ${mode === 'url' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'}`}
            >
              URL Link
            </button>
          </div>
        </div>
      )}

      {mode === 'upload' ? (
        <div className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,image/gif,image/webp,image/apng,image/png,image/jpeg,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload Button Box */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-slate-200 transition-all cursor-pointer hover:bg-slate-800 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>กำลังอัปโหลด...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>{value ? 'เปลี่ยนไฟล์รูปภาพ (Change File)' : 'อัปโหลดรูปภาพ (PNG / JPG / GIF ภาพเคลื่อนไหว / WebP)'}</span>
              </>
            )}
          </button>

          {/* Thumbnail Preview */}
          {value && (
            <div className="relative w-10 h-10 rounded-xl bg-black border border-cyan-500/50 overflow-hidden flex-shrink-0 flex items-center justify-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Preview" className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-0 bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* URL Input Mode */
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
