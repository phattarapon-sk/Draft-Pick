import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side uploads
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Normalize MIME types allowed by Supabase storage
function getNormalizedMimeType(filename: string, detectedType?: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      if (detectedType && detectedType.startsWith('image/')) {
        return detectedType;
      }
      return 'image/png';
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase storage is not configured' }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedBucket = (formData.get('bucket') as string) || 'assets';
    const folder = (formData.get('folder') as string) || requestedBucket || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cleanFolder = folder.replace(/^\/+|\/+$/g, '') || 'general';
    const cleanExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const randomHash = Math.random().toString(36).substring(2, 8);
    const fileName = `${cleanFolder}/${Date.now()}_${randomHash}.${cleanExt}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = getNormalizedMimeType(file.name, file.type);

    // Primary target bucket is 'assets' which is guaranteed to exist and have public access
    const targetBucket = 'assets';

    const { data, error } = await supabase.storage.from(targetBucket).upload(fileName, buffer, {
      contentType,
      upsert: true,
      cacheControl: '3600',
    });

    if (error) {
      console.error('Storage upload error in /api/upload:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from(targetBucket).getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: data.path,
      bucket: targetBucket,
    });
  } catch (err: any) {
    console.error('Server error in /api/upload:', err);
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 });
  }
}
