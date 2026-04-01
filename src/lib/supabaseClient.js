// ──────────────────────────────────────────────────────────────
// CLIENTE SUPABASE — SINGLETON
// ──────────────────────────────────────────────────────────────
// Punto único de conexión con Supabase. NO crear instancias
// adicionales en otros archivos — siempre importar este.
//
// La seguridad de datos depende al 100% de las políticas RLS
// en Supabase. Este cliente usa la anon key (pública), así que
// cualquier operación pasa por RLS antes de devolver datos.
// Si RLS está mal configurado, se filtran datos. No hay
// segunda línea de defensa en el frontend.
// ──────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación en desarrollo. En producción fallaría silenciosamente
// (el SDK lanza errores en cada petición), pero esto atrapa el error antes.
if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('⚠️ Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // persistSession: true → la sesión se guarda en localStorage
    // bajo la key 'pages-auth'. Esto permite que el usuario no
    // tenga que re-loguearse al refrescar la página.
    // OJO: el nombre 'pages-auth' es custom para evitar conflictos
    // con otras apps de Supabase en el mismo dominio (dev local).
    persistSession: true,
    storageKey: 'pages-auth',
    storage: window.localStorage,
  },
});
