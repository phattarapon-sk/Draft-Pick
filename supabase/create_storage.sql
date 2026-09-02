-- =============================================================================
-- Supabase Storage Bucket Setup for Draft Pick Esports Platform
-- =============================================================================

-- 1. Create the 'assets' storage bucket (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assets', 'assets', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'])
ON CONFLICT (id) DO UPDATE 
SET public = true, file_size_limit = 52428800;

-- 2. Drop existing policies on assets bucket if any to avoid duplicate error
DROP POLICY IF EXISTS "Public View Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Assets" ON storage.objects;

-- 3. Create Storage Policies for 'assets' bucket
CREATE POLICY "Public View Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'assets' );

CREATE POLICY "Public Upload Assets"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'assets' );

CREATE POLICY "Public Update Assets"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'assets' );

CREATE POLICY "Public Delete Assets"
ON storage.objects FOR DELETE
USING ( bucket_id = 'assets' );
