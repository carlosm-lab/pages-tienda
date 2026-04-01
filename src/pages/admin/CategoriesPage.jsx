import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { logger } from '@/utils/logger';
import { generateSlug } from '@/utils/slug';
import { useConfirm } from '@/context/ConfirmContext';
import { invalidateCategoryCache } from '@/hooks/useCategories';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentCat, setCurrentCat] = useState({ id: '', name: '', slug: '', description: '' });

  const confirm = useConfirm();

  const showToast = (message, isError = false) => {
    if (isError) toast.error(message);
    else toast.success(message);
  };

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      logger.error('Error:', error);
      showToast('Error cargando categorías', true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);



  const handleNameChange = (e) => {
    const name = e.target.value;
    setCurrentCat({
      ...currentCat,
      name,
      slug: isEditing ? currentCat.slug : generateSlug(name) // Auto-generate slug only when creating
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentCat.name || !currentCat.slug) {
      showToast('Por favor completa todos los campos', true);
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('categories')
          .update({ name: currentCat.name, slug: currentCat.slug, description: currentCat.description || null })
          .eq('id', currentCat.id);
          
        if (error) throw error;
        showToast('Categoría actualizada');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ name: currentCat.name, slug: currentCat.slug, description: currentCat.description || null }]);
          
        if (error) throw error;
        showToast('Categoría creada');
      }
      
      setCurrentCat({ id: '', name: '', slug: '', description: '' });
      setIsEditing(false);
      invalidateCategoryCache();
      fetchCategories();
    } catch (error) {
      logger.error('Error saving:', error);
      showToast(error.message.includes('unique constraint') ? 'El slug ya existe.' : 'Error al guardar.', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setCurrentCat(cat);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setCurrentCat({ id: '', name: '', slug: '', description: '' });
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Eliminar categoría',
      message: '¿Estás seguro de eliminar esta categoría? Si hay productos asociados, no podrán ser mostrados correctamente en el catálogo.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    
    if (!isConfirmed) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      showToast('Categoría eliminada');
      invalidateCategoryCache();
      fetchCategories();
    } catch (error) {
      logger.error('Error delete:', error);
      showToast('Error al eliminar', true);
    }
  };

  const handleToggleFeatured = async (cat) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ featured: !cat.featured })
        .eq('id', cat.id);
        
      if (error) throw error;
      showToast(cat.featured ? `"${cat.name}" quitada de inicio` : `"${cat.name}" destacada en inicio`);
      invalidateCategoryCache();
      fetchCategories();
    } catch (error) {
      logger.error('Error toggling featured:', error);
      showToast('Error al actualizar', true);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Categorías</h1>
        <p className="text-slate-500 dark:text-slate-400">Administra las colecciones de tu tienda. Usa la ★ para elegir cuáles aparecen en inicio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Form Column */}
        <div className="md:col-span-1 bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-360 md:sticky md:top-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
              <input 
                type="text" required
                value={currentCat.name} onChange={handleNameChange}
                placeholder="Ej. Anillos de Boda"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/5 rounded-lg focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug (URL amigable)</label>
              <input 
                type="text" required
                value={currentCat.slug} onChange={(e) => setCurrentCat({...currentCat, slug: e.target.value})}
                placeholder="anillos-boda"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/5 rounded-lg focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 mt-1">Debe ser único. Minúsculas, números y guiones.</p>
            </div>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
                <span className="text-xs text-slate-500">{currentCat.description?.length || 0}/100</span>
              </div>
              <textarea 
                maxLength={100}
                value={currentCat.description || ''} onChange={(e) => setCurrentCat({...currentCat, description: e.target.value})}
                placeholder="Explora nuestros hermosos detalles..."
                rows="2"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/5 rounded-lg focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white resize-none"
              ></textarea>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full py-2 bg-primary text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> Guardando...</>
                ) : (
                  isEditing ? 'Guardar Cambios' : 'Crear Categoría'
                )}
              </button>
              {isEditing && (
                <button 
                  type="button" onClick={handleCancelEdit}
                  className="w-full py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Column */}
        <div className="md:col-span-2 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-360 overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hay categorías. Crea una primera.</div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/5">
              {categories.map(cat => (
                <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleFeatured(cat)}
                      title={cat.featured ? 'Quitar de inicio' : 'Mostrar en inicio'}
                      className={`p-1.5 rounded-lg transition-all ${cat.featured 
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30' 
                        : 'text-slate-300 dark:text-slate-600 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: cat.featured ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                    </button>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{cat.name}</p>
                      <p className="text-sm text-slate-500 font-mono">{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(cat)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
      </div>
    </div>
  );
}
