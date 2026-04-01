// ──────────────────────────────────────────────────────────────
// HOOK: useCategories (con caché global)
// ──────────────────────────────────────────────────────────────
// Las categorías cambian muy poco (el admin las crea/edita rara vez),
// así que usamos un caché en memoria con TTL de 10 minutos.
//
// El caché es global (variables de módulo, no estado React):
//   - cachedCategories: los datos
//   - cachedTime: timestamp del último fetch
//
// Invalidación:
//   - Se invalida al crear/editar/eliminar categorías en admin
//     llamando a invalidateCategoryCache(), que limpia el caché
//     y dispara un CustomEvent para que todos los consumers
//     (otros componentes montados que usen useCategories) refresquen.
//
// OJO: el caché es per-tab. Si el admin edita categorías en otra
// pestaña, esta no se entera hasta que expire el TTL o el usuario
// navegue. Esto es aceptable porque las categorías no cambian
// cada minuto.
// ──────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { categoryService } from '@/services/categoryService';
import { logger } from '@/utils/logger';


// ── Caché global de módulo ───────────────────────────────
let cachedCategories = null;
let cachedTime = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

/**
 * Invalida el caché de categorías y notifica a todos los consumers.
 * Llamar esto desde el admin después de crear/editar/eliminar una categoría.
 */
export function invalidateCategoryCache() {
  cachedCategories = null;
  cachedTime = null;
  // CustomEvent para que componentes ya montados refresquen
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('categories-invalidated'));
  }
}

export function useCategories() {
  // Inicializa con el caché si existe — evita un flash de loading
  const [categories, setCategories] = useState(cachedCategories || []);
  const [loading, setLoading] = useState(!cachedCategories);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchCategories(forceRefetch = false) {
      // Si el caché es válido y no se forzó refetch, usarlo
      if (!forceRefetch && cachedCategories && cachedTime && Date.now() - cachedTime < CACHE_TTL) {
        setCategories(cachedCategories);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const data = await categoryService.getCategories();
        cachedCategories = data;
        cachedTime = Date.now();
        if (isMounted) setCategories(data);
      } catch (err) {
        logger.error("Error fetching categories:", err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCategories();

    // Listener para invalidación desde el admin
    const handleInvalidate = () => {
      fetchCategories(true);
    };

    window.addEventListener('categories-invalidated', handleInvalidate);

    return () => {
      isMounted = false;
      window.removeEventListener('categories-invalidated', handleInvalidate);
    };
  }, []);

  return { categories, loading, error };
}
