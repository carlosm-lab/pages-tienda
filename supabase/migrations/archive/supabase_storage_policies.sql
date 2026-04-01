-- Secure Storage Bucket 'product-images' for public read and authenticated admin write/delete
-- IMPORTANT: Run this in the Supabase Dashboard SQL Editor as a superuser

-- 1. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS on the objects table (in case it wasn't)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to create clean ones
DROP POLICY IF EXISTS "Public access to product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;

-- 4. Create new strict policies
-- Anyone can view the images
CREATE POLICY "Public access to product images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'product-images' );

-- Admins can insert/upload
CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
  );

-- Admins can update
CREATE POLICY "Admin update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
  );

-- Admins can delete
CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
  );
