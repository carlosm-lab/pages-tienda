// ──────────────────────────────────────────────────────────────
// UTILIDADES DE SUPABASE STORAGE
// ──────────────────────────────────────────────────────────────
// Funciones auxiliares para trabajar con archivos en el bucket
// `product-images` de Supabase Storage.
//
// HIGH-002: La extracción de filenames valida que la URL sea de
// Supabase (.supabase.co) para no intentar borrar archivos de
// dominios externos (Unsplash, Google, etc.) que se usan como
// fallback en imágenes.
//
// Estas funciones son usadas por ProductsPage en las operaciones
// de eliminación (simple y masiva) de productos.
// ──────────────────────────────────────────────────────────────

/**
 * Extrae el nombre de archivo de una URL de Supabase Storage.
 * Retorna null si la URL no es de Supabase o es inválida.
 *
 * Ejemplo:
 *   'https://xxx.supabase.co/.../product-images/foto.webp'
 *   → 'foto.webp'
 *
 * @param {string} urlStr - URL completa o path relativo
 * @returns {string|null} Filename o null si no es válida
 */
export function extractStorageFilename(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return null;
  try {
    const parsed = new URL(urlStr);
    // Filtro de seguridad: solo URLs de Supabase
    if (!parsed.hostname.endsWith('.supabase.co')) return null;
    const pathSegments = parsed.pathname.split('/');
    return pathSegments[pathSegments.length - 1] || null;
  } catch {
    // Si no parsea como URL es un path relativo (solo filename).
    // Esto pasa rara vez pero lo manejamos por robustez.
    return urlStr.split('/').pop() || null;
  }
}

/**
 * Recoge todos los filenames de storage de un producto.
 * Un producto puede tener:
 *   - image_path: imagen principal (1 archivo)
 *   - images[]: galería de imágenes (N archivos)
 *
 * @param {object} product - Producto con image_path e images[]
 * @returns {string[]} Filenames válidos para pasar a storage.remove()
 */
export function collectProductImageFiles(product) {
  const files = [];
  if (product.image_path) {
    const fn = extractStorageFilename(product.image_path);
    if (fn) files.push(fn);
  }
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach(img => {
      const fn = extractStorageFilename(img);
      if (fn) files.push(fn);
    });
  }
  return files;
}
