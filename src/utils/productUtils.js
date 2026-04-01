// ──────────────────────────────────────────────────────────────
// UTILIDADES DE OFERTAS / PROMOCIONES
// ──────────────────────────────────────────────────────────────
// Las ofertas en Antigravity tienen 3 estados posibles:
//   1. PROGRAMADA: tiene offer_starts_at en el futuro
//   2. ACTIVA: old_price > price, ya empezó y no ha expirado
//   3. EXPIRADA: offer_ends_at ya pasó
//
// Estas funciones determinan el estado de la oferta tanto en
// el frontend (ProductCard, ProductDetail) como en las queries
// a Supabase (filtro de ofertas activas en el catálogo).
//
// OJO: la validación de fechas usa el reloj del cliente.
// Si hay diferencia horaria significativa con el servidor,
// puede haber un desfase de segundos. No es un problema
// grave porque los precios se revalidan contra Supabase.
// ──────────────────────────────────────────────────────────────

/**
 * Determina si un producto tiene una oferta activa AHORA.
 * Retorna false si:
 *   - No tiene old_price o old_price <= price (no es oferta real)
 *   - Está programada para el futuro (offer_starts_at > now)
 *   - Ya expiró (offer_ends_at <= now)
 */
export const isOfferActive = (product) => {
  if (!product) return false;
  const now = new Date();
  const hasOffer = product.old_price && product.old_price > product.price;
  if (!hasOffer) return false;
  
  // Oferta programada: aún no empieza
  if (product.offer_starts_at && new Date(product.offer_starts_at) > now) return false;
  
  // Oferta expirada
  if (product.offer_ends_at && new Date(product.offer_ends_at) <= now) return false;
  
  return true;
};

/**
 * Detecta ofertas programadas (futuras). Se usa para mostrar
 * el countdown "Oferta inicia en..." en ProductCard y Detail.
 */
export const isOfferScheduled = (product) => {
  if (!product) return false;
  const now = new Date();
  return Boolean(
    product.old_price && 
    product.old_price > product.price && 
    product.offer_starts_at && 
    new Date(product.offer_starts_at) > now
  );
};

/**
 * MED-010: Aplica filtros de oferta activa a una query de Supabase.
 * Usado en CatalogPage y admin ProductsPage cuando el usuario
 * filtra "solo ofertas".
 *
 * Excluye ofertas programadas que aún no empiezan y ofertas expiradas.
 * Los filtros .or() se encadenan porque PostgREST no soporta
 * AND/OR compuestos fácilmente.
 */
export const applyActiveOfferFilter = (query) => {
  const now = new Date().toISOString();
  return query
    .not('old_price', 'is', null)
    .or(`offer_starts_at.is.null,offer_starts_at.lte.${now}`)
    .or(`offer_ends_at.is.null,offer_ends_at.gt.${now}`);
};
