-- Fix infinite recursion in is_admin
-- We read from auth.users or avoid RLS on profiles using security definer
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Direct lookup without triggering policy evaluations
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- CRIT-S02: Restrict contact_messages INSERT to authenticated users only —
-- previous version used 'TO public' which allowed anonymous inserts, bypassing the frontend auth guard
DROP POLICY IF EXISTS "Anyone can insert contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users can insert contact_messages" ON public.contact_messages;
CREATE POLICY "Authenticated users can insert contact_messages"
ON public.contact_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND
  (user_id IS NULL OR user_id = auth.uid()) AND
  length(trim(coalesce(message, ''))) > 0 AND
  length(trim(coalesce(message, ''))) < 5000 AND
  length(trim(coalesce(name, ''))) < 200 AND
  length(trim(coalesce(subject, ''))) < 200 AND
  length(trim(coalesce(email, ''))) < 200
);

-- Ensure profiles only accept valid uid matching for their updates
DROP POLICY IF EXISTS "Users can update own profile (no role change)" ON public.profiles;
CREATE POLICY "Users can update own profile (no role change)"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Fix storage insertion/update checking auth.uid() explicitly
-- Make sure product-images buckets can only be modified by admins authenticated
DROP POLICY IF EXISTS "Admins can insert product-images" ON storage.objects;
CREATE POLICY "Admins can insert product-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND is_admin() AND auth.uid() = owner
);

DROP POLICY IF EXISTS "Admins can update product-images" ON storage.objects;
CREATE POLICY "Admins can update product-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND is_admin() AND auth.uid() = owner)
WITH CHECK (bucket_id = 'product-images' AND is_admin() AND auth.uid() = owner);

DROP POLICY IF EXISTS "Admins can delete product-images" ON storage.objects;
CREATE POLICY "Admins can delete product-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND is_admin());
