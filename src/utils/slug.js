// ──────────────────────────────────────────────────────────────
// GENERADOR DE SLUGS
// ──────────────────────────────────────────────────────────────
// Se usa al crear categorías y productos en el admin.
// El slug se genera automáticamente a partir del nombre y se
// usa como identificador en URLs (/catalog?category=rosas-eternas).
//
// Normaliza: español (tildes/ñ), emojis y caracteres especiales.
// Si el input es puramente emojis o vacío, genera un fallback
// con timestamp para evitar slugs vacíos que romperían las rutas.
//
// LOW-003: Los emojis se reemplazan por espacios ANTES de limpiar,
// no después, para evitar slugs como "---" cuando el nombre
// era algo como "🌹 Rosas 🌹".
// ──────────────────────────────────────────────────────────────

export const generateSlug = (text) => {
  if (!text) return '';
  const slug = text
    .toString()
    .normalize('NFD')                    // Separa tildes: é → e + ´
    .replace(/[\u0300-\u036f]/g, '')     // Elimina las marcas diacríticas
    .toLowerCase()
    .replace(/[^\w\s-]/gi, ' ')          // Emojis y símbolos → espacios
    .trim()
    .replace(/[^a-z0-9 -]/g, '')         // A este punto solo quedan ASCII safe
    .replace(/\s+/g, '-')               // Espacios → guiones
    .replace(/-+/g, '-')                // Colapsa guiones múltiples
    .replace(/^-+|-+$/g, '');           // Quita guiones sueltos al inicio/final
    
  // Fallback: si el texto era puramente emojis/símbolos, el slug queda vacío.
  // Generar uno con timestamp para que no colisione.
  return slug || `item-${Date.now()}`;
};
