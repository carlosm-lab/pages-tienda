-- DB-003: Crear índice único en products.slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- DB-004: Limpiar datos antes de ADD CONSTRAINT en user_carts
UPDATE public.user_carts SET cart_items = '[]'::jsonb
WHERE cart_items IS NULL OR jsonb_typeof(cart_items) != 'array';

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_cart_items'
  ) THEN
    ALTER TABLE public.user_carts
    ADD CONSTRAINT valid_cart_items CHECK (jsonb_typeof(cart_items) = 'array');
  END IF;
END $$;
