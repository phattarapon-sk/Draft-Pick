import { supabase, isSupabaseConfigured } from './supabase/client';

/**
 * Upload an image file to Supabase Storage bucket if configured,
 * or fallback to Base64 Data URL for 100% offline/local compatibility.
 */
export async function uploadImageFile(file: File, bucket = 'assets'): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
        upsert: true,
        cacheControl: '3600',
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        console.warn('Supabase storage upload notice:', error.message);
      }
    } catch (e) {
      console.warn('Supabase storage upload exception, using local Data URL fallback', e);
    }
  }

  // Fallback: Convert to Base64 Data URL (Works offline & in local mode)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
