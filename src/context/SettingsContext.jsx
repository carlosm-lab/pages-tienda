// ──────────────────────────────────────────────────────────────
// CONTEXTO DE CONFIGURACIÓN DE TIENDA (Settings)
// ──────────────────────────────────────────────────────────────
// Provee la configuración de la tienda a toda la app:
//   - hero_title/subtitle/image_url: contenido del banner principal
//   - contact_phone/email: datos de contacto
//   - social_*: links de redes sociales
//
// REALTIME:
// Se suscribe al canal de Supabase Realtime para recibir
// cambios en store_settings en vivo. Si el admin edita el
// título del hero desde el panel, los usuarios conectados
// ven el cambio sin refrescar la página.
//
// PROTECCIONES:
//   - MED-005: Valida el payload de Realtime antes de aplicarlo
//     (payload.new debe existir y tener un id). Esto previene
//     estados corruptos por payloads malformados.
//   - MED-006: Debounce de 500ms en updates de Realtime para
//     no causar renders excesivos si el admin hace cambios rápidos.
//
// El fallback de useSettings() fuera del provider retorna
// valores vacíos en vez de crashear — útil en componentes
// que pueden renderizarse en rutas sin SettingsProvider.
// ──────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';

const SettingsContext = createContext(undefined);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const realtimeDebounceRef = useRef(null);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('id, hero_title, hero_subtitle, hero_image_url, story_image_url, contact_phone, contact_email, social_facebook, social_instagram, social_tiktok, created_at, updated_at')
        .single();
        
      if (error) {
        // PGRST116 = 0 filas = la tabla existe pero no tiene datos aún
        if (error.code !== 'PGRST116') {
          logger.error("Error fetching settings:", error);
        }
      } else {
        setSettings(data);
      }
    } catch (e) {
      logger.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    fetchSettings();

    // ── Suscripción Realtime ──────────────────────────────
    // Escucha INSERT, UPDATE y DELETE en store_settings.
    // Solo hay 1 fila en esta tabla (es un singleton de config).
    const channel = supabase
      .channel('public:store_settings');

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, (payload) => {
        logger.info('Settings updated in real-time', payload);
        // MED-005: Validar payload antes de aplicar
        if (mounted && payload.new && typeof payload.new === 'object' && payload.new.id) {
          // MED-006: Debounce para coalescer ediciones rápidas del admin
          clearTimeout(realtimeDebounceRef.current);
          realtimeDebounceRef.current = setTimeout(() => {
            if (mounted) setSettings(payload.new);
          }, 500);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info('Successfully subscribed to settings realtime channel');
        }
      });

    return () => {
      mounted = false;
      clearTimeout(realtimeDebounceRef.current);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

// Fallback graceful si se usa fuera del Provider (no crashea)
// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    logger.warn('useSettings called outside of SettingsProvider. Falling back to default empty settings.');
    return { settings: null, loading: false, fetchSettings: async () => {} };
  }
  return context;
};
