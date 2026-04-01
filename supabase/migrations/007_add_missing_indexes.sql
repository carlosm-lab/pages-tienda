-- TAREA-012: Agregar índices recomendados para optimizar el rendimiento de la BD (Phase 3)

-- Optimizar búsqueda por slug en categorías
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Optimizar el panel de administración al listar mensajes recientes
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- Optimizar queries en la tienda que filtran por categoría
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Optimizar el catálogo principal donde siempre se filtra is_active = true
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active) WHERE is_active = true;
