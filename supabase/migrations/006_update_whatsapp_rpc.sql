-- HIGH-009 + CRIT-001: Parametrizar dominio en RPC + restaurar validaciones de auth y límites
-- SEGURIDAD: Esta función DEBE validar autenticación y límites de cantidad.
-- La versión anterior omitía estas validaciones, permitiendo invocación anónima.

CREATE OR REPLACE FUNCTION public.generate_whatsapp_message(items jsonb, store_domain text DEFAULT 'https://pagesdetallesymas.com')
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
  -- CRIT-001: Validate authentication — prevents anonymous RPC invocation
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Count items
  SELECT count(*) INTO item_count FROM jsonb_array_elements(items);
  
  IF item_count = 0 THEN
    RETURN '';
  END IF;

  -- CRIT-001: Validate total item count — prevents cart abuse
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
    -- CRIT-001: Per-item quantity validation — prevents abuse via extreme quantities
    IF item.quantity > max_qty_per_item THEN
      RAISE EXCEPTION 'Quantity for item exceeds maximum limit of %', max_qty_per_item;
    END IF;
    IF item.quantity < 1 THEN
      RAISE EXCEPTION 'Quantity for item cannot be less than 1';
    END IF;

    SELECT name, price, old_price, offer_starts_at, offer_ends_at INTO db_product FROM products WHERE id = item.id AND is_active = true;
    IF FOUND THEN
      -- Determine applicable price
      -- MED-WA02: Added offer_starts_at check — prevents users from getting offer prices before scheduled start
      product_price := db_product.price;
      IF db_product.old_price IS NOT NULL AND db_product.old_price > db_product.price
         AND (db_product.offer_starts_at IS NULL OR db_product.offer_starts_at <= now())
         AND (db_product.offer_ends_at IS NULL OR db_product.offer_ends_at > now()) THEN
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
        -- Remove trailing slash if exists in domain
        order_text := order_text || '  Link: ' || rtrim(store_domain, '/') || '/product/' || item.slug || E'\n\n';
      ELSE
        order_text := order_text || E'\n';
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
