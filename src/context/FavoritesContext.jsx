// ──────────────────────────────────────────────────────────────
// CONTEXTO DE FAVORITOS
// ──────────────────────────────────────────────────────────────
// Maneja la lista de productos favoritos del usuario.
//
// PERSISTENCIA DUAL:
//   - localStorage: siempre, para guests y para acceso rápido
//   - Supabase (user_favorites): cuando hay usuario logueado
//
// FLUJO DE SINCRONIZACIÓN al login:
//   1. Cargar favoritos locales (localStorage)
//   2. Cargar favoritos de DB (user_favorites)
//   3. Merge: unión de ambos sets (sin duplicados)
//   4. Si hay favoritos locales que no estaban en DB → insert
//   5. Resultado final = unión de ambos
//
// Esto permite que un usuario marque favoritos como guest,
// se loguée, y no pierda nada. La DB tiene la versión canónica
// para cuando abra otra pestaña o dispositivo.
//
// UPDATES OPTIMISTAS:
// toggleFavorite() actualiza la UI inmediatamente y luego
// sincroniza con la DB. Si falla, hace rollback.
//
// HIGH-ST01: toggleFavorite rechaza llamadas sin usuario autenticado.
// Este bloqueo es "defense in depth" — los botones de UI ya están
// protegidos por showAuthModal, pero esto es un segundo check.
// ──────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';

const FavoritesContext = createContext(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth() || {};
  const [favorites, setFavorites] = useState([]);
  const favoritesRef = useRef([]);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  // ── Carga inicial desde localStorage ────────────────────
  // Migra keys viejas del rebranding y valida UUIDs.
  useEffect(() => {
    try {
      // Migración de key antigua
      const oldFavs = localStorage.getItem('favorites');
      if (oldFavs) {
        localStorage.setItem('pages_favorites', oldFavs);
        localStorage.removeItem('favorites');
      }

      const saved = localStorage.getItem('pages_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filtrar IDs que no sean UUIDs válidos (corrupción o manipulación)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const valid = parsed.filter((id) => id && typeof id === 'string' && uuidRegex.test(id));
        setFavorites(valid);
        // Si se limpiaron IDs inválidos, actualizar localStorage
        if (valid.length !== parsed.length) {
          localStorage.setItem('pages_favorites', JSON.stringify(valid));
        }
      }
    } catch (e) {
      logger.error("Error parsing favorites from localStorage:", e);
      setFavorites([]);
    }
  }, []);

  // ── Sincronización con Supabase al login ────────────────
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    
    const syncFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('product_id')
          .eq('user_id', user.id);
          
        if (error) {
          if (error.code === 'PGRST116') {
             logger.warn('Tabla favorites no existe aún. Necesitas crearla en Supabase.');
          } else {
             throw error;
          }
          return;
        }
        
        const dbFavorites = data.map((f) => f.product_id);
        let localFavorites = [];
        try {
          localFavorites = JSON.parse(localStorage.getItem('pages_favorites') || '[]');
        } catch (e) {
          logger.error("Error parsing favorites from localStorage during sync:", e);
        }
        
        // Filtrar locales inválidos antes de insertar en DB
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const validLocalFavorites = localFavorites.filter((id) => id && typeof id === 'string' && uuidRegex.test(id));
        
        // Insertar favoritos locales que no existen en DB
        const toInsert = validLocalFavorites.filter((id) => !dbFavorites.includes(id));
        
        if (toInsert.length > 0) {
          const newRecords = toInsert.map((product_id) => ({ user_id: user.id, product_id }));
          const { error: insertError } = await supabase.from('user_favorites').insert(newRecords);
          if (insertError) logger.error("Error inserting missing local favorites:", insertError);
        }
        
        // Merge: unión sin duplicados
        if (mounted) {
          const updatedFavorites = [...new Set([...dbFavorites, ...validLocalFavorites])];
          setFavorites(updatedFavorites);
          localStorage.setItem('pages_favorites', JSON.stringify(updatedFavorites));
        }
      } catch (err) {
        logger.error('Error sincronizando favoritos:', err);
      }
    };
    
    syncFavorites();
    
    return () => {
      mounted = false;
    };
  }, [user]);

  // Mantener localStorage sincronizado con el estado React
  useEffect(() => {
    localStorage.setItem('pages_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // ── Toggle con update optimista ─────────────────────────
  const toggleFavorite = useCallback(async (productId) => {
    // Defense in depth: rechazar si no hay usuario
    if (!user) {
      logger.warn('toggleFavorite called without authenticated user. Ignoring.');
      return;
    }

    const isFav = favoritesRef.current.includes(productId);
    
    // Update optimista: la UI responde instantáneamente
    setFavorites(prev => 
      isFav 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

    try {
      if (isFav) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .match({ user_id: user.id, product_id: String(productId) });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert([{ user_id: user.id, product_id: String(productId) }]);
        if (error) throw error;
      }
    } catch (err) {
      logger.error('Error DB favoritos:', err);
      // Rollback: deshacer el update optimista
      setFavorites(prev =>
        isFav ? [...prev, productId] : prev.filter(id => id !== productId)
      );
    }
  }, [user]);

  // Set para O(1) lookups en isFavorite (en vez de .includes() que es O(n))
  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const isFavorite = useCallback((productId) => favoritesSet.has(productId), [favoritesSet]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
