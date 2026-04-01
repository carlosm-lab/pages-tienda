// ──────────────────────────────────────────────────────────────
// GENERADOR DE URLS DE WHATSAPP
// ──────────────────────────────────────────────────────────────
// Lógica core del modelo de negocio: transforma el carrito en
// un mensaje legible que se envía a WhatsApp.
//
// Los mensajes de WhatsApp vía URL (wa.me) tienen un límite
// práctico de ~2000 caracteres en la query string. Si el carrito
// tiene muchos productos, el truncamiento inteligente elimina
// productos del final del mensaje (los de menor precio) hasta
// que quepa, y agrega una nota indicando que hay más productos.
//
// IMPORTANTE: los precios en el mensaje vienen del frontend
// pero se revalidan contra Supabase cada 60s (ver CartContext).
// Aun así, el precio final se confirma por WhatsApp — no hay
// riesgo real de precio incorrecto.
// ──────────────────────────────────────────────────────────────
import { WHATSAPP_NUMBER } from '@/config/constants';
import { formatPrice } from '@/utils/formatPrice';
import { sanitizeInput } from '@/utils/sanitize';

// Límite práctico del mensaje incluido en la URL.
// WhatsApp oficialmente no documenta un límite exacto,
// pero URLs > 2000 chars fallan en algunos dispositivos/browsers.
const MAX_MESSAGE_LENGTH = 1800;

/**
 * Construye la URL wa.me con el mensaje del pedido.
 * Aplica truncamiento inteligente si el mensaje excede el límite.
 *
 * @param {Array} items - Productos del carrito con { name, price, quantity }
 * @param {number} total - Total calculado
 * @param {string} [userName] - Nombre del usuario (opcional, para personalizar)
 * @returns {string} URL completa de WhatsApp
 */
export function buildWhatsAppUrl(items, total, userName = '') {
  const phone = WHATSAPP_NUMBER.replace(/\D/g, '');
  const greeting = userName
    ? `¡Hola! Soy ${sanitizeInput(userName)}. Me gustaría realizar el siguiente pedido:`
    : '¡Hola! Me gustaría realizar el siguiente pedido:';

  // Construir líneas de producto
  const productLines = items.map(item =>
    `• ${sanitizeInput(item.name)} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`
  );

  const totalLine = `\n💰 *Total: ${formatPrice(total)}*`;
  const footer = '\n\n¿Podrían confirmarme disponibilidad y forma de pago? ¡Gracias!';

  let message = `${greeting}\n\n${productLines.join('\n')}${totalLine}${footer}`;

  // ── Truncamiento inteligente ──────────────────────────
  // Si excedemos el límite, quitamos productos del final
  // (que son los menos prioritarios) hasta que quepa.
  // Esto es mejor que cortar el mensaje a la mitad.
  if (message.length > MAX_MESSAGE_LENGTH) {
    let truncatedLines = [...productLines];
    const omittedNote = '\n... y más productos (ver carrito completo en la tienda)';

    while (truncatedLines.length > 1) {
      truncatedLines.pop();
      message = `${greeting}\n\n${truncatedLines.join('\n')}${omittedNote}${totalLine}${footer}`;
      if (message.length <= MAX_MESSAGE_LENGTH) break;
    }
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
