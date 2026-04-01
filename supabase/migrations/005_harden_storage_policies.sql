-- CRIT-006: Add server-side enforcement for file types and sizes in storage policies

DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;

CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
    -- Solo extensiones seguras
    AND LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
    -- Restringir MIME types y límite de 5MB
    AND (
      storage.foldername(name) IS NULL -- allow top-level folders?
      OR (
        (metadata->>'mimetype') IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
        AND COALESCE((metadata->>'size')::int, 0) <= 5242880
      )
    )
  );

DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;

CREATE POLICY "Admin update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
    AND LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
    AND (
      storage.foldername(name) IS NULL
      OR (
        (metadata->>'mimetype') IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
        AND COALESCE((metadata->>'size')::int, 0) <= 5242880
      )
    )
  );
