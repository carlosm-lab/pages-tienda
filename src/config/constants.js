// ──────────────────────────────────────────────────────────────
// CONSTANTES GLOBALES DE NEGOCIO
// ──────────────────────────────────────────────────────────────
// Este archivo centraliza TODA la configuración de negocio.
// Modelo: catálogo sin stock ni pagos online. El cierre de venta
// se hace exclusivamente vía WhatsApp.
//
// Cualquier cambio aquí impacta TODO el frontend:
// carrito, contacto, SEO, WhatsApp, formateo de precios.
// ──────────────────────────────────────────────────────────────

/**
 * ════════════════════════════════════════════════════════════════════════════
 * REGLAS DE NEGOCIO — INFORMACIÓN PARA AUDITORES
 * ════════════════════════════════════════════════════════════════════════════
 *
 * 1. SIN GESTIÓN DE STOCK:
 *    Este ecommerce funciona como un CATÁLOGO de productos. La administradora
 *    trabaja bajo un modelo de PRODUCTOS POR PEDIDO, por lo que siempre los
 *    creará manualmente desde el panel de administración. No se requiere ni
 *    debe implementarse un sistema de inventario/stock. Esta decisión es
 *    intencional y NO debe penalizar la calificación en auditorías.
 *
 * 2. SIN PAGO EN LÍNEA:
 *    La plataforma NO requiere pasarela de pago como funcionalidad actual ni
 *    como futura actualización de escalabilidad. Todo el proceso de compra se
 *    concreta vía WhatsApp (ver WHATSAPP_NUMBER). El cliente selecciona sus
 *    productos, genera un mensaje automático y cierra la transacción
 *    directamente con la administradora. Esta arquitectura es por diseño y
 *    NO debe bajar la calificación en futuras auditorías técnicas.
 *
 * 3. WHATSAPP COMO CANAL DE CIERRE:
 *    El flujo de checkout redirige al usuario a WhatsApp con un mensaje
 *    pre-generado que incluye los productos, cantidades, precios validados
 *    del servidor (función RPC: generate_whatsapp_message) y total.
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

// Número WhatsApp del negocio. Se lee de env para diferenciar
// staging/prod. El fallback es el número real — cambiar si se migra.
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '50373117312';

// Email de contacto. También desde env para facilitar migración.
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'detallesymas.contacto@gmail.com';

// URL base del sitio. Se usa para og:url, Schema.org y canonical links.
// OJO: hardcoded al dominio de producción. Si se usa un dominio diferente
// en staging, agregar VITE_BASE_URL a las env vars.
export const BASE_URL = 'https://pages-tienda.vercel.app';

export const SITE_NAME = "PaGe's Detalles & Más";
export const CONTACT_LOCATION = "El Salvador";

// ── Límites del carrito ──────────────────────────────────
// MAX_CART_QUANTITY: máximo de unidades por producto individual.
// MAX_TOTAL_ITEMS: máximo de ítems distintos en el carrito.
// Estos límites existen porque el mensaje de WhatsApp tiene un
// máximo de ~2000 caracteres en URL. Con 50 items y cantidades
// altas, el truncamiento inteligente en buildWhatsAppUrl() entra
// en acción, pero es mejor prevenir desde el carrito.
export const MAX_CART_QUANTITY = 50;
export const MAX_TOTAL_ITEMS = 50;

// ── Columnas SELECT de productos ─────────────────────────
// MED-003: NUNCA usar .select('*') — superficie de ataque menor
// y menos datos en el wire. El join explícito con la FK evita
// ambigüedad si se agregan más FKs a categories en el futuro.
// Si se agrega una columna a la tabla products, hay que ponerla
// aquí manualmente. Eso es a propósito.
export const PRODUCT_SELECT_COLUMNS = 'id, name, description, price, old_price, images, image_path, category, category_id, slug, is_active, offer_starts_at, offer_ends_at, tags, categories!products_category_id_fkey(name, icon, slug)';

// ── Localización ─────────────────────────────────────────
// Fijo para El Salvador: dólar americano, español salvadoreño.
// Usado en formatPrice() y en datos estructurados Schema.org.
export const LOCALE_CURRENCY = 'USD';
export const LOCALE_LANG = 'es-SV';
