-- CRIT-004: Add email to profiles to identify users in admin panel

-- 1. Add email column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Backfill existing emails (run as superuser/postgres)
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- 3. Update the handle_new_user trigger function to capture email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email)
  VALUES (
    NEW.id, 
    'user',
    NEW.email
  );
  RETURN NEW;
END;
$$;
