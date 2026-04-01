-- RLS Audit and Fix Script for Antigravity Ecommerce
-- Run this in the Supabase SQL Editor

-- 1. Table: products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
FOR SELECT TO public
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
FOR DELETE TO authenticated
USING (public.is_admin());

-- 2. Table: categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view all categories" ON public.categories;
CREATE POLICY "Public can view all categories" ON public.categories
FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories" ON public.categories
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories" ON public.categories
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories" ON public.categories
FOR DELETE TO authenticated
USING (public.is_admin());

-- 3. Table: store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings" ON public.store_settings
FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Admins can insert store settings" ON public.store_settings;
CREATE POLICY "Admins can insert store settings" ON public.store_settings
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update store settings" ON public.store_settings;
CREATE POLICY "Admins can update store settings" ON public.store_settings
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete store settings" ON public.store_settings;
CREATE POLICY "Admins can delete store settings" ON public.store_settings
FOR DELETE TO authenticated
USING (public.is_admin());

-- 4. Table: contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
FOR SELECT TO authenticated
USING (public.is_admin());

-- Note: The INSERT policy for contact_messages was already defined in supabase_sql_executed.sql
-- but we ensure it's the only way to insert.
DROP POLICY IF EXISTS "Authenticated users can insert contact_messages" ON public.contact_messages;
CREATE POLICY "Authenticated users can insert contact_messages" ON public.contact_messages
FOR INSERT TO authenticated
WITH CHECK (
  length(trim(coalesce(message, ''))) > 0 AND
  length(trim(coalesce(message, ''))) < 5000 AND
  length(trim(coalesce(name, ''))) < 200 AND
  length(trim(coalesce(subject, ''))) < 200 AND
  length(trim(coalesce(email, ''))) < 200
);

DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages" ON public.contact_messages
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages
FOR DELETE TO authenticated
USING (public.is_admin());

-- 5. Table: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admin" ON public.profiles;
CREATE POLICY "Users can view own profile or admin" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Prevent role update via RLS" ON public.profiles;
CREATE POLICY "Users can update own profile (no role change)" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));


-- Note: user_favorites and user_carts should also be checked. 
-- Assuming standard policies: Users can only CRUD their own records.
-- 6. Table: user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own favorites" ON public.user_favorites;
CREATE POLICY "Users can CRUD own favorites" ON public.user_favorites
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Table: user_carts
ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own carts" ON public.user_carts;
CREATE POLICY "Users can CRUD own carts" ON public.user_carts
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
