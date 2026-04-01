-- SQL instructions to be executed in Supabase Dashboard

-- SEC-003: Fix mutable search_path on ALL 9 public functions
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.change_user_role(uuid, user_role) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.prevent_role_escalation() SET search_path = public;
ALTER FUNCTION public.get_category_stats() SET search_path = public;
ALTER FUNCTION public.get_top_favorites(integer) SET search_path = public;
ALTER FUNCTION public.set_contact_message_ip_and_check_rate_limit() SET search_path = public;
ALTER FUNCTION public.handle_product_slug() SET search_path = public;
ALTER FUNCTION public.update_modified_column() SET search_path = public;

-- SEC-004: Restrict INSERT on contact_messages
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

-- SEC-004: Improve rate limit trigger (include user_id)
CREATE OR REPLACE FUNCTION public.set_contact_message_ip_and_check_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
  client_ip text;
  client_user_id uuid;
BEGIN
  -- Get IP address
  client_ip := coalesce(
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'x-real-ip',
    'unknown'
  );
  
  -- Get user_id from auth object or current record
  client_user_id := auth.uid();
  
  -- Set fields
  NEW.ip_address := client_ip;
  IF NEW.user_id IS NULL THEN
    NEW.user_id := client_user_id;
  END IF;

  -- Check rate limit (5 per hour per IP OR per user)
  -- If IP is unknown, rely heavily on user_id
  SELECT count(*) INTO recent_count
  FROM contact_messages
  WHERE (
    (ip_address = client_ip AND client_ip != 'unknown') 
    OR (user_id IS NOT NULL AND user_id = client_user_id)
  )
    AND created_at > now() - interval '1 hour';

  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Please wait before sending more messages.';
  END IF;

  RETURN NEW;
END;
$$;

-- SEC-002: Server-side WhatsApp message generation
-- Validates prices directly from the database to prevent client-side cart manipulation
CREATE OR REPLACE FUNCTION public.generate_whatsapp_message(items jsonb, store_domain text DEFAULT '')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_text text;
  total_price numeric := 0;
  item record;
  db_product record;
  product_price numeric;
  item_count int := 0;
  max_qty_per_item int := 50;
  max_total_items int := 50;
BEGIN
  -- SEC-002: Validate authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Count items
  SELECT count(*) INTO item_count FROM jsonb_array_elements(items);
  
  IF item_count = 0 THEN
    RETURN '';
  END IF;

  IF item_count > max_total_items THEN
    RAISE EXCEPTION 'Too many items in cart. The maximum allowed is %.', max_total_items;
  END IF;

  IF item_count = 1 THEN
    order_text := 'Hola, me encantó este detalle de su tienda y me gustaría pedirlo:' || E'\n\n';
  ELSE
    order_text := 'Hola, estuve viendo su página y me gustaría hacer un pedido con los siguientes artículos:' || E'\n\n';
  END IF;
  
  FOR item IN SELECT * FROM jsonb_to_recordset(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'id', (i->'product'->>'id')::uuid,
        'quantity', (i->>'quantity')::int,
        'color', coalesce(i->'color'->>'name', i->>'color', ''),
        'note', coalesce(i->>'note', ''),
        'slug', coalesce(i->'product'->>'slug', '')
      )
    ) FROM jsonb_array_elements(items) i)
  ) AS x(id uuid, quantity int, color text, note text, slug text)
  LOOP
    IF item.quantity > max_qty_per_item THEN
      RAISE EXCEPTION 'Quantity for item exceeds maximum limit of %', max_qty_per_item;
    END IF;
    IF item.quantity < 1 THEN
      RAISE EXCEPTION 'Quantity for item cannot be less than 1';
    END IF;

    SELECT name, price, old_price, offer_ends_at INTO db_product FROM products WHERE id = item.id AND is_active = true;
    IF FOUND THEN
      -- Determine applicable price
      product_price := db_product.price;
      IF db_product.old_price IS NOT NULL AND db_product.old_price > db_product.price AND (db_product.offer_ends_at IS NULL OR db_product.offer_ends_at > now()) THEN
         product_price := db_product.price;
      END IF;
      
      IF item_count = 1 THEN
         IF item.quantity > 1 THEN
           order_text := order_text || '- ' || item.quantity || ' unidades de *' || db_product.name || '* (';
         ELSE
           order_text := order_text || '- *' || db_product.name || '* (';
         END IF;
      ELSE
         order_text := order_text || '- ' || item.quantity || 'x *' || db_product.name || '* (';
      END IF;
      
      IF product_price IS NULL OR product_price = 0 THEN
        order_text := order_text || 'Precio a consultar)' || E'\n';
      ELSE
        order_text := order_text || '$' || trim(to_char(product_price, '999999990.00')) || ')' || E'\n';
        total_price := total_price + (product_price * item.quantity);
      END IF;
      
      IF item.color IS NOT NULL AND item.color != '' THEN
        -- Strip whatsapp formatting chars (*, _, ~, `) and limit to 50 chars
        order_text := order_text || '  Color: ' || substring(regexp_replace(item.color, '[*_~`]', '', 'g') from 1 for 50) || E'\n';
      END IF;
      
      IF item.note IS NOT NULL AND item.note != '' THEN
        -- Strip whatsapp formatting chars and limit to 200 chars
        order_text := order_text || '  Nota: "' || substring(regexp_replace(item.note, '[*_~`]', '', 'g') from 1 for 200) || '"' || E'\n';
      END IF;
      
      IF item.slug IS NOT NULL AND item.slug != '' THEN
        IF store_domain != '' THEN
          order_text := order_text || '  Link: ' || store_domain || '/product/' || item.slug || E'\n\n';
        ELSE
          order_text := order_text || '  Link: https://pagesdetallesymas.com/product/' || item.slug || E'\n\n';
        END IF;
      ELSE
        order_text := order_text || E'\n\n';
      END IF;
    END IF;
  END LOOP;
  
  IF item_count = 1 THEN
     order_text := order_text || 'El total marca *$' || trim(to_char(total_price, '999999990.00')) || '*.' || E'\n' || '¿Me podrían ayudar a confirmar el pedido y el envío por favor?';
  ELSE
     order_text := order_text || 'El total de mi carrito es *$' || trim(to_char(total_price, '999999990.00')) || '*.' || E'\n' || '¿Me apoyan con el proceso de pago y envío por favor?';
  END IF;
  
  RETURN order_text;
END;
$$;

-- SEC-005: Protect first admin from degradation and add audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type text NOT NULL,
  target_user_id uuid,
  performed_by uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read audit_log" ON public.audit_log FOR SELECT TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.change_user_role(target_id uuid, new_role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role user_role;
  first_admin_id uuid;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Solo los administradores pueden cambiar roles';
  END IF;

  SELECT id INTO first_admin_id FROM public.profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1;
  IF target_id = first_admin_id AND auth.uid() != first_admin_id AND new_role != 'admin' THEN
    RAISE EXCEPTION 'No se puede cambiar el rol del administrador principal';
  END IF;

  UPDATE public.profiles SET role = new_role WHERE id = target_id;
  
  INSERT INTO public.audit_log (action_type, target_user_id, performed_by, details)
  VALUES ('role_change', target_id, auth.uid(), json_build_object('new_role', new_role));
END;
$$;

-- DB-001: Index user_favorites.user_id
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);

-- DB-002: CHECK constraint for user_carts
ALTER TABLE public.user_carts ADD CONSTRAINT valid_cart_items CHECK (jsonb_typeof(cart_items) = 'array');

-- PERF-001: Dashboard summary RPC
CREATE OR REPLACE FUNCTION public.get_dashboard_summary()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_products int;
  active_offers int;
  unread_messages int;
  total_favorites int;
  total_categories int;
  total_users int;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT count(*) INTO total_products FROM products;
  SELECT count(*) INTO active_offers FROM products WHERE old_price IS NOT NULL AND old_price > price AND (offer_ends_at IS NULL OR offer_ends_at > now());
  SELECT count(*) INTO unread_messages FROM contact_messages WHERE is_read = false;
  SELECT count(*) INTO total_favorites FROM user_favorites;
  SELECT count(*) INTO total_categories FROM categories;
  SELECT count(*) INTO total_users FROM profiles;

  RETURN json_build_object(
    'totalProducts', total_products,
    'activeOffers', active_offers,
    'unreadMessages', unread_messages,
    'totalFavorites', total_favorites,
    'totalCategories', total_categories,
    'totalUsers', total_users
  );
END;
$$;

-- DB-003: Trigram index for product name ILIKE search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin (name gin_trgm_ops);

-- DB-005: Add updated_at triggers safely if columns exist
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='updated_at') THEN
  DROP TRIGGER IF EXISTS update_categories_modtime ON public.categories;
  CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_modified_column();
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='updated_at') THEN
  DROP TRIGGER IF EXISTS update_contact_messages_modtime ON public.contact_messages;
  CREATE TRIGGER update_contact_messages_modtime BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION update_modified_column();
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_carts' AND column_name='updated_at') THEN
  DROP TRIGGER IF EXISTS update_user_carts_modtime ON public.user_carts;
  CREATE TRIGGER update_user_carts_modtime BEFORE UPDATE ON public.user_carts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_favorites' AND column_name='updated_at') THEN
  DROP TRIGGER IF EXISTS update_user_favorites_modtime ON public.user_favorites;
  CREATE TRIGGER update_user_favorites_modtime BEFORE UPDATE ON public.user_favorites FOR EACH ROW EXECUTE FUNCTION update_modified_column();
END IF; END $$;

-- CODE-003 / DB-002: Cron job to clean up abandoned carts older than 7 days (conditional on pg_cron extension)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup_abandoned_carts',
      '0 3 * * *',
      $job$ DELETE FROM public.user_carts WHERE updated_at < now() - interval '7 days' $job$
    );
  ELSE
    RAISE WARNING 'pg_cron extension not available. Cart cleanup cron not created.';
  END IF;
END $$;
