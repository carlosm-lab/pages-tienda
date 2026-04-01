// ──────────────────────────────────────────────────────────────
// LOGGER CENTRALIZADO
// ──────────────────────────────────────────────────────────────
// Todos los errores de la app pasan por aquí. En desarrollo
// se imprimen en consola normalmente. En producción, los errores
// graves se envían a la tabla `system_logs` en Supabase para
// monitoreo sin depender de servicios externos tipo Sentry.
//
// Decisión: no se usa un servicio de logging externo porque
// el volumen de errores esperado es bajo y Supabase ya está
// en la infraestructura. Si escala, migrar a un servicio dedicado.
//
// ADVERTENCIA: nunca loggear datos sensibles (tokens, passwords).
// El sanitizado aquí es básico — se confía en que los callers
// no pasen información confidencial en los mensajes.
// ──────────────────────────────────────────────────────────────
import { supabase } from '@/lib/supabaseClient';

const isDev = import.meta.env.DEV;

// Batch de errores para enviar a DB. Se acumula y flushea
// cada 5 segundos para no bombardear la DB con inserts.
let errorQueue = [];
let flushTimer = null;

/**
 * Envía la cola de errores acumulados a la tabla system_logs.
 * Silencia sus propios errores para no causar loops infinitos.
 */
async function flushErrors() {
  if (errorQueue.length === 0) return;
  const batch = [...errorQueue];
  errorQueue = [];

  try {
    await supabase.from('system_logs').insert(batch);
  } catch {
    // Silenciar — si falla el logging, no podemos hacer nada más.
    // Un console.error aquí causaría ruido en prod sin valor real.
  }
}

/**
 * Encola un error para envío a la tabla system_logs.
 * En desarrollo no envía nada — solo console.
 * El campo `context` se trunca a 500 chars para no saturar la DB.
 */
function trackErrorToDB(message, context) {
  if (isDev) return; // No contaminar la DB en desarrollo

  errorQueue.push({
    level: 'error',
    message: String(message).substring(0, 500),
    context: context ? String(context).substring(0, 500) : null,
    source: 'frontend',
    created_at: new Date().toISOString(),
  });

  // Debounce del flush: espera 5 segundos antes de enviar.
  // Si llegan más errores en ese lapso, se envían todos juntos.
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushErrors();
      flushTimer = null;
    }, 5000);
  }
}

/**
 * API pública del logger.
 * - log/warn: solo consola en dev. En prod se silencian.
 * - error: consola + envío a system_logs en prod.
 */
export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  error: (message, ...rest) => {
    if (isDev) {
      console.error(message, ...rest);
    }
    // En producción, persistir el error para monitoreo.
    // El segundo argumento suele ser el Error object — se serializa.
    const context = rest.length > 0 ? JSON.stringify(rest, null, 0) : null;
    trackErrorToDB(message, context);
  },
};
