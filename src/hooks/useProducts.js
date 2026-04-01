// ──────────────────────────────────────────────────────────────
// HOOKS: useProducts / useProduct
// ──────────────────────────────────────────────────────────────
// Dos hooks para datos de productos:
//
// useProducts: Lista paginada con filtros. Usado en:
//   - HomePage (últimos 4 productos)
//   - CatalogPage (catálogo completo con filtros)
//   - ProductDetailPage (productos relacionados)
//
// useProduct: Un solo producto por slug. Usado en ProductDetailPage.
//
// Decisiones técnicas:
//   - AbortController: se abortan peticiones cuando el componente
//     se desmonta o cuando cambian los filtros (evita race conditions
//     si el usuario navega rápido entre páginas).
//   - Estabilización de arrays: categories[] y filterFavorites[] se
//     comparan con shallow compare para evitar re-fetches infinitos
//     (React recrea arrays en cada render).
//   - Debounce de search: 350ms para no disparar una query por keystroke.
//
// ADVERTENCIA: el eslint-disable de exhaustive-deps es intencional.
// Los refs estabilizados (stableCategories, stableFavorites) no son
// dependencias de useEffect en el sentido de React, pero sí cambian
// los datos. Es un trade-off consciente.
// ──────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import { productService } from '@/services/productService';
import { logger } from '@/utils/logger';


import { useDebounce } from '@/hooks/useDebounce';

/**
 * Comparación superficial de arrays. Se usa para estabilizar
 * las props categories[] y filterFavorites[] que React recrea
 * en cada render. Sin esto, useEffect se dispara infinitamente.
 */
const shallowCompareArray = (arr1, arr2) => {
  if (arr1 === arr2) return true;
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
};

/**
 * Hook para listas de productos con filtros, paginación y ordenamiento.
 *
 * @param {Object} options
 * @param {string} options.category - Filtro por categoría individual
 * @param {string[]} options.categories - Filtro por múltiples categorías
 * @param {string} options.search - Texto de búsqueda (se debouncea 350ms)
 * @param {string} options.sortBy - Ordenamiento ('price-low', 'price-high', 'newest', 'best-selling')
 * @param {number} options.page - Página actual (1-indexed)
 * @param {number} options.limit - Productos por página
 * @param {string[]|null} options.filterFavorites - IDs de favoritos para filtrar
 * @param {boolean} options.skip - Si true, no hace fetch (para lazy loading)
 */
export function useProducts({ category, categories = [], search, minPrice, maxPrice, onSaleOnly, sortBy, page, limit, filterFavorites = null, skip = false } = {}) {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  // ── Estabilización de arrays ──────────────────────────
  // React recrea arrays literales en cada render: [a, b] !== [a, b].
  // Estos refs mantienen la referencia estable si el contenido no cambió.
  const prevCategoriesRef = useRef(categories);
  const prevFavoritesRef = useRef(filterFavorites);

  if (!shallowCompareArray(prevCategoriesRef.current, categories)) {
    prevCategoriesRef.current = categories;
  }
  
  if (!shallowCompareArray(prevFavoritesRef.current, filterFavorites)) {
    prevFavoritesRef.current = filterFavorites;
  }

  const stableCategories = prevCategoriesRef.current;
  const stableFavorites = prevFavoritesRef.current;

  useEffect(() => {
    const abortController = new AbortController();
    
    async function fetchProducts() {
      // Si el filtro de favoritos es un array vacío, no vale la pena
      // hacer la query — no hay nada que mostrar.
      if (Array.isArray(filterFavorites) && filterFavorites.length === 0) {
        setProducts([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      // skip: permite montar el hook sin ejecutar la query.
      // Usado en ProductDetailPage para productos relacionados
      // que dependen de que primero cargue el producto principal.
      if (skip) {
        setProducts([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        let q = productService.getProductsQuery({
          category, 
          categories: stableCategories, 
          search: debouncedSearch, 
          minPrice, 
          maxPrice, 
          onSaleOnly, 
          sortBy, 
          page, 
          limit, 
          filterFavorites: stableFavorites
        });

        // Intento de abort nativo si el SDK lo soporta
        if (typeof q.abortSignal === 'function') {
          q = q.abortSignal(abortController.signal);
        }

        const { data, count, error: sbError } = await q;

        // Si ya se abortó (el usuario navegó a otra página), no actualizar estado
        if (abortController.signal.aborted) return;

        if (sbError) {
          throw sbError;
        } else {
          setProducts(data || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          logger.error("Error fetching products:", err);
          setError(err.message);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    // Cleanup: aborta la petición si el componente se desmonta
    // o si cambian las dependencias (filtros, página, etc.)
    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, stableCategories, debouncedSearch, minPrice, maxPrice, onSaleOnly, sortBy, page, limit, stableFavorites, skip]);

  return { products, totalCount, loading, error };
}

/**
 * Hook para un solo producto por slug.
 * Incluye refetch() para re-obtener datos cuando expira una oferta
 * (lo llama OfferCountdown.onExpire).
 *
 * MED-002: AbortController previene setState en componente desmontado
 * durante navegación rápida entre productos.
 */
export function useProduct(slug) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async (signal) => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await productService.getProductBySlug(slug);
      if (!signal?.aborted) setProduct(data);
    } catch (err) {
      if (!signal?.aborted) {
        logger.error("Error fetching product:", err);
        setError(err.message);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProduct(controller.signal);
    return () => controller.abort();
  }, [fetchProduct]);

  // refetch sin signal: se usa manualmente (no se aborta automáticamente)
  return { product, loading, error, refetch: () => fetchProduct() };
}
