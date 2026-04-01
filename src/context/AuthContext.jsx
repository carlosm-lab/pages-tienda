// ──────────────────────────────────────────────────────────────
// CONTEXTO DE AUTENTICACIÓN
// ──────────────────────────────────────────────────────────────
// Maneja TODO el estado de autenticación de la app:
//   - Sesión de Supabase (user + session + tokens)
//   - Perfil del usuario (role: 'user' | 'admin')
//   - Modal de login contextual (para interceptar acciones no autorizadas)
//
// ARQUITECTURA CLAVE:
// El fetch de perfil está DESACOPLADO de onAuthStateChange.
// Supabase documenta que NO se deben hacer operaciones async
// dentro del callback de onAuthStateChange porque puede causar
// deadlocks en el SDK. Por eso:
//   - Effect 1: escucha cambios de auth y actualiza user/session (sync)
//   - Effect 2: cuando user.id cambia, fetchea el perfil (async)
//
// CACHE EN SESSIONSTORAGE:
// Para evitar el "flash" de UI no-autenticada al refrescar la página,
// se cachean user, profile e isAdmin en sessionStorage (no localStorage,
// porque queremos que expire cuando se cierra la pestaña).
// El caché tiene un TTL de 1 hora — después se re-valida contra Supabase.
// Esto significa que si un admin revoca el rol de otro usuario,
// puede tardar hasta 1 hora en reflejarse. Es un trade-off aceptable.
//
// AUTH MODAL:
// Cuando un usuario no autenticado intenta agregar al carrito,
// agregar favoritos o enviar el formulario de contacto, en vez de
// redirigir a /login, se muestra un modal contextual que explica
// por qué necesita iniciar sesión. El `authModalContext` es un string
// que indica qué acción disparó el modal ('cart', 'favorites', 'contact').
// ──────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';

const AuthContext = createContext(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// ── Keys de sessionStorage ────────────────────────────────
const ADMIN_CACHE_KEY = 'pages_is_admin';
const PROFILE_CACHE_KEY = 'pages_profile';
const USER_CACHE_KEY = 'pages_user';
const CACHE_TIME_KEY = 'pages_auth_cache_time';
const CACHE_TTL = 3600000; // 1 hora en ms

/**
 * Verifica que el caché de sessionStorage no haya expirado.
 * Si expiró, lo limpia y retorna false.
 */
const checkCacheValidity = () => {
  try {
    const timestamp = sessionStorage.getItem(CACHE_TIME_KEY);
    if (!timestamp) return false;
    if (Date.now() - parseInt(timestamp, 10) > CACHE_TTL) {
      sessionStorage.removeItem(PROFILE_CACHE_KEY);
      sessionStorage.removeItem(CACHE_TIME_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  // ── Estado inicial desde caché ──────────────────────────
  // Se lee de sessionStorage para que al refrescar la página,
  // la UI no parpadee entre "no autenticado" → "autenticado".
  const [user, setUser] = useState(() => {
    try {
      const cached = sessionStorage.getItem(USER_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      if (!checkCacheValidity()) return null;
      const cached = sessionStorage.getItem(PROFILE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // isAdmin se inicializa desde el caché. Si el perfil real dice otra cosa,
  // se corrige cuando llega la respuesta del servidor.
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      if (!checkCacheValidity()) return false;
      const cached = sessionStorage.getItem(PROFILE_CACHE_KEY);
      const parsed = cached ? JSON.parse(cached) : null;
      return parsed?.role === 'admin';
    } catch {
      return false;
    }
  });
  
  // loading: true si aún no sabemos si hay sesión (primer mount sin caché)
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(USER_CACHE_KEY);
    } catch {
      return true;
    }
  });
  const [profileLoading, setProfileLoading] = useState(() => {
    try {
      return !(checkCacheValidity() && sessionStorage.getItem(PROFILE_CACHE_KEY) && sessionStorage.getItem(USER_CACHE_KEY));
    } catch {
      return true;
    }
  });

  // ── Auth Modal ──────────────────────────────────────────
  // null = cerrado, string = contexto ('cart', 'favorites', 'contact')
  const [authModalContext, setAuthModalContext] = useState(null);

  const showAuthModal = useCallback((context = 'generic') => {
    setAuthModalContext(context);
  }, []);

  const hideAuthModal = useCallback(() => {
    setAuthModalContext(null);
  }, []);

  // Ref para prevenir race conditions si el usuario cambia
  // mientras se está fetcheando el perfil del usuario anterior.
  const currentUserIdRef = useRef(null);

  // ── Fetch de perfil (desacoplado de onAuthStateChange) ──
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      setIsAdmin(false);
      sessionStorage.removeItem(ADMIN_CACHE_KEY);
      sessionStorage.removeItem(PROFILE_CACHE_KEY);
      sessionStorage.removeItem(CACHE_TIME_KEY);
      return;
    }

    // Guard de race condition: si el user cambió durante el fetch, descartar
    currentUserIdRef.current = userId;
    setProfileLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userId)
        .single();

      if (currentUserIdRef.current !== userId) return;

      if (error) {
        // PGRST116: "No rows" — perfil no existe aún (cuenta nueva sin trigger de profiles)
        if (error.code === 'PGRST116') {
          logger.warn('No profile found for user:', userId);
        } else {
          logger.error('Error fetching profile:', error);
        }
        setProfile(null);
        setIsAdmin(false);
  
        sessionStorage.removeItem(PROFILE_CACHE_KEY);
        sessionStorage.removeItem(CACHE_TIME_KEY);
        return;
      }

      const adminStatus = data?.role === 'admin';
      setProfile(data);
      setIsAdmin(adminStatus);

      // Cachear para evitar flash en el próximo refresh
      try {

        sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
        sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      } catch {
        // sessionStorage lleno o no disponible — no fatal
      }
    } catch (err) {
      if (currentUserIdRef.current !== userId) return;
      logger.error('Exception fetching profile:', err);
      setProfile(null);
      setIsAdmin(false);

      sessionStorage.removeItem(PROFILE_CACHE_KEY);
      sessionStorage.removeItem(CACHE_TIME_KEY);
    } finally {
      if (currentUserIdRef.current === userId) {
        setProfileLoading(false);
      }
    }
  }, []);

  // ── Effect 1: Inicializar sesión + escuchar cambios ─────
  // CRÍTICO: NO hacer await dentro de onAuthStateChange.
  // Solo operaciones síncronas (setState). El fetch asíncrono
  // del perfil se maneja en el Effect 2.
  useEffect(() => {
    let mounted = true;

    // Paso 1: Obtener la sesión existente (refresh / nueva pestaña)
    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          try { sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(currentSession.user)); } catch { /* ignore */ }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
    
          sessionStorage.removeItem(PROFILE_CACHE_KEY);
          sessionStorage.removeItem(CACHE_TIME_KEY);
          sessionStorage.removeItem(USER_CACHE_KEY);
        }
      } catch (err) {
        logger.error('Error getting initial session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // Paso 2: Escuchar cambios futuros (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
    
          sessionStorage.removeItem(PROFILE_CACHE_KEY);
          sessionStorage.removeItem(CACHE_TIME_KEY);
          sessionStorage.removeItem(USER_CACHE_KEY);
          return;
        }

        // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED — actualizar session/user
        // El fetch del perfil lo hace el Effect 2 cuando detecta el cambio en user.id
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user ?? null);
          if (currentSession.user) {
            try { sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(currentSession.user)); } catch { /* ignore */ }
          } else {
            sessionStorage.removeItem(USER_CACHE_KEY);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Effect 2: Fetch de perfil reactivo al cambio de user ──
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    } else if (user === null && !loading) {
      // Logout — limpiar perfil
      setProfile(null);
      setIsAdmin(false);
      setProfileLoading(false);

      sessionStorage.removeItem(PROFILE_CACHE_KEY);
      sessionStorage.removeItem(CACHE_TIME_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, fetchProfile, loading]);

  // ── Login con Google OAuth ──────────────────────────────
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      logger.error('Error logging in with Google:', error.message);
    }
  };

  // ── Sign Out ────────────────────────────────────────────
  // Limpieza local PRIMERO (feedback instant en UI),
  // luego se notifica al servidor de Supabase.
  const signOut = async () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    currentUserIdRef.current = null;
    
    // LOW-002: Limpieza nuclear de sessionStorage. Borra todo
    // para asegurar que no queden datos de la sesión anterior.
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      logger.warn('signOut failed:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        loading: loading || profileLoading,  // loading combinado: auth + perfil
        signInWithGoogle,
        signOut,
        authModalContext,
        showAuthModal,
        hideAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
