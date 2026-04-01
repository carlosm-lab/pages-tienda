// ──────────────────────────────────────────────────────────────
// FORMATO DE PRECIOS
// ──────────────────────────────────────────────────────────────
// Centralizado aquí para que un cambio de moneda/locale
// afecte a toda la app. LOCALE_LANG y LOCALE_CURRENCY vienen
// de constants.js — ver ese archivo para la justificación.
//
// Intl.NumberFormat es nativo y más confiable que libs como
// numeral.js. El objeto formatter se crea una sola vez fuera
// de la función (singleton implícito del módulo).
// ──────────────────────────────────────────────────────────────
import { LOCALE_LANG, LOCALE_CURRENCY } from '@/config/constants';

const formatter = new Intl.NumberFormat(LOCALE_LANG, {
  style: 'currency',
  currency: LOCALE_CURRENCY,
  // minimumFractionDigits: 2 es el default para USD, no hace falta ponerlo.
});

/**
 * Formatea un número como precio en dólares (USD).
 * Retorna '$0.00' si el valor no es numérico — nunca lanza.
 */
export const formatPrice = (price) => {
  const num = Number(price);
  if (isNaN(num)) return formatter.format(0);
  return formatter.format(num);
};
