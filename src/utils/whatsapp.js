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
// Límite práctico del mensaje incluido en la URL.
// WhatsApp oficialmente no documenta un límite exacto,
// pero URLs > 2000 chars fallan en algunos dispositivos/browsers.
const MAX_MESSAGE_LENGTH = 1800;

/**
 * Construye la URL wa.me con el mensaje del pedido utilizando el mensaje ya generado por el servidor.
 * Aplica truncamiento inteligente si el mensaje excede el límite.
 *
 * @param {string} phone - El número de WhatsApp del vendedor
 * @param {string} rawMessage - Mensaje pre-generado por el servidor
 * @returns {Object} Objeto conteniendo la { url, usedFallback }
 */
export function buildWhatsAppUrl(phone, rawMessage) {
  const formattedPhone = phone ? phone.toString().replace(/\D/g, '') : WHATSAPP_NUMBER.replace(/\D/g, '');
  
  const fallbackMessage = "¡Hola! He realizado un pedido extenso en la tienda, me gustaría revisarlo contigo. Mi carrito está guardado en el sistema.";

  let messageToSend = rawMessage || fallbackMessage;
  let usedFallback = !rawMessage;

  // ── Truncamiento de seguridad ──────────────────────────
  if (messageToSend.length > MAX_MESSAGE_LENGTH) {
    usedFallback = true;
    messageToSend = messageToSend.substring(0, MAX_MESSAGE_LENGTH) + "\n\n... [El pedido es más extenso, el resto se omitió para poder enviarlo. Por favor revisa mi cuenta/carrito en la app].";
  }

  return {
    url: `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageToSend)}`,
    usedFallback
  };
}
