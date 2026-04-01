// ──────────────────────────────────────────────────────────────
// SERVICIO DE PRODUCTOS
// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para productos. Construye las queries
// a Supabase con los filtros, paginación y ordenamiento que
// pide la UI. Los hooks (useProducts, useProduct) consumen
// estas funciones y manejan el estado React.
//
// Decisiones de seguridad importantes:
//   - El select es explícito (PRODUCT_SELECT_COLUMNS) para no
//     exponer columnas innecesarias.
//   - is_active=true siempre se aplica en lecturas públicas.
//   - Los filtros de favoritos validan UUIDs y limitan a 100
//     para prevenir DoS con IN clauses gigantes.
//   - El search escapa comodines SQL para prevenir inyección.
// ──────────────────────────────────────────────────────────────
import { supabase } from '@/lib/supabaseClient';
import { applyActiveOfferFilter } from '@/utils/productUtils';
import { PRODUCT_SELECT_COLUMNS } from '@/config/constants';

export const productService = {
  /**
   * Construye una query filtrada de productos.
   * Retorna el query builder de Supabase SIN ejecutar —
   * el caller hace await y puede agregar .abortSignal() si quiere.
   *
   * Parámetros relevantes:
   *   - filterFavorites: array de UUIDs para mostrar solo favoritos.
   *     Se valida contra regex UUID y se limita a 100 para evitar
   *     queries IN() con miles de IDs (SEC-009 / PERF-002).
   *   - search: se escapan %, _ y \ para evitar comodines SQL.
   */
  getProductsQuery({ category, categories, search, minPrice, maxPrice, onSaleOnly, sortBy, page, limit, filterFavorites }) {
    let q = supabase
      .from('products')
      .select(PRODUCT_SELECT_COLUMNS, { count: 'exact' })
      .eq('is_active', true); // Solo productos visibles en la tienda

    // Filtro por categoría individual (ProductDetailPage relacionados)
    if (category) q = q.eq('category', category);
    
    // Filtro por múltiples categorías (CatalogPage sidebar)
    if (categories && categories.length > 0) {
      q = q.in('category', categories);
    }

    // Búsqueda textual. Se escapan comodines para prevenir
    // que el usuario inyecte % y obtenga resultados no deseados.
    if (search) {
      const escapedSearch = search.replace(/[%_\\]/g, '\\$&');
      q = q.ilike('name', `%${escapedSearch}%`);
    }
    
    if (minPrice) q = q.gte('price', Number(minPrice));
    if (maxPrice) q = q.lte('price', Number(maxPrice));
    if (onSaleOnly) q = applyActiveOfferFilter(q);

    // ── Filtro de favoritos (SEC-009 / PERF-002) ──────────
    // Cuando el usuario ve "Mis Favoritos" en el catálogo,
    // se pasa el array de IDs. Validamos:
    // 1. Que sean UUIDs válidos (no strings arbitrarios)
    // 2. Máximo 100 para no hacer un IN() gigante
    // 3. Si ninguno es válido, forzamos resultado vacío
    //    con un UUID imposible a propósito.
    if (Array.isArray(filterFavorites)) {
      if (filterFavorites.length > 0) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const safeFavorites = filterFavorites
          .filter(id => typeof id === 'string' && uuidRegex.test(id))
          .slice(0, 100);
          
        if (safeFavorites.length > 0) {
          q = q.in('id', safeFavorites);
        } else {
          // UUID de ceros: nunca existirá en la tabla.
          q = q.in('id', ['00000000-0000-0000-0000-000000000000']);
        }
      }
    }

    // Ordenamiento. "best-selling" no existe realmente —
    // se ordena por fecha (más recientes primero).
    // Si algún día se agrega un campo de ventas, cambiar aquí.
    if (sortBy === 'price-low') {
      q = q.order('price', { ascending: true });
    } else if (sortBy === 'price-high') {
      q = q.order('price', { ascending: false });
    } else {
      q = q.order('created_at', { ascending: false });
    }

    // Paginación server-side con .range()
    if (limit) {
      if (page) {
        const pageNum = page > 0 ? page : 1;
        const from = (pageNum - 1) * limit;
        const to = from + limit - 1;
        q = q.range(from, to);
      } else {
        q = q.limit(limit);
      }
    }
    
    return q;
  },

  /**
   * Obtiene un producto por su slug URL-friendly.
   * Solo retorna productos activos — los desactivados por el admin
   * devuelven un 406 (PostgREST .single() con 0 results).
   */
  async getProductBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT_COLUMNS)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
      
    if (error) throw error;
    return data;
  }
};
