import { supabase, isSupabaseConfigured } from './supabase/client';

/**
 * Normalizes image MIME type to ensure compatibility with Supabase Storage policies.
 */
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

/**
 * Resizes and compresses an image to an ultra-compact Base64 Data URL.
 * Prevents browser localStorage quota crashes (QuotaExceededError) when working offline.
 */
async function compressImageToBase64(file: File, maxDim = 900, quality = 0.82): Promise<string> {
  // If SVG or small animated GIF, keep original Base64
  if (file.type === 'image/svg+xml' || (file.type === 'image/gif' && file.size < 800 * 1024)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Prefer WebP for optimal compression, fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      // Fallback to raw FileReader if image fails to load
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.readAsDataURL(file);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image file:
 * 1. Attempt upload via Next.js Server API (/api/upload) using Supabase credentials
 * 2. Fallback to client Supabase Storage in 'assets' bucket using subfolders
 * 3. Fallback to lightweight compressed Base64 Data URL for 100% offline compatibility
 */
export async function uploadImageFile(file: File, bucketOrFolder = 'assets'): Promise<string> {
  const folder = bucketOrFolder.replace(/^\/+|\/+$/g, '') || 'general';

  // Strategy 1: Upload via Next.js Server API route (/api/upload)
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('bucket', 'assets');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      if (json.url) {
        return json.url;
      }
    }
  } catch (apiErr) {
    console.warn('API route /api/upload unavailable or timed out, falling back to alternative strategy:', apiErr);
  }

  // Strategy 2: Direct Client-Side Supabase Upload to 'assets' bucket
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const contentType = getNormalizedMimeType(file.name, file.type);

      // Target 'assets' bucket which has public read/write policies configured
      const { data, error } = await supabase.storage.from('assets').upload(fileName, file, {
        upsert: true,
        cacheControl: '3600',
        contentType,
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('assets').getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        console.warn('Client Supabase storage upload notice:', error.message);
      }
    } catch (clientErr) {
      console.warn('Client Supabase storage exception, falling back to compressed local Data URL:', clientErr);
    }
  }

  // Strategy 3: High-Efficiency Local Base64 Fallback (Offline & Zero Config Safe)
  try {
    return await compressImageToBase64(file);
  } catch (fallbackErr) {
    console.error('All upload strategies failed:', fallbackErr);
    throw new Error('Unable to process or upload image file.');
  }
}
