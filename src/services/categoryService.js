// ──────────────────────────────────────────────────────────────
// SERVICIO DE CATEGORÍAS
// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para categorías. Separada del hook
// useCategories (que maneja cache y estado React) para mantener
// la lógica de queries aislada.
//
// El select es explícito (no '*') por MED-003 — misma razón
// que en PRODUCT_SELECT_COLUMNS. Si se agregan columnas a la
// tabla categories, hay que actualizarlas aquí.
//
// OJO: no tiene filtros de seguridad adicionales porque las
// categorías son públicas — cualquiera puede leerlas.
// La protección de escritura es vía RLS (solo admins crean/editan).
// ──────────────────────────────────────────────────────────────
import { supabase } from '@/lib/supabaseClient';

export const categoryService = {
  /**
   * Obtiene todas las categorías ordenadas por nombre.
   * Retorna array vacío en caso de error (el throw lo maneja el caller).
   */
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, created_at, icon, image_url, description, featured')
      .order('name');
      
    if (error) throw error;
    return data || [];
  }
};
