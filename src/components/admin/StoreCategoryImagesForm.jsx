import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ImageUploader from './ImageUploader';
import { logger } from '@/utils/logger';


export default function StoreCategoryImagesForm({ showToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('*').eq('featured', true).order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      logger.error(err);
      showToast('Error cargando las categorías.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpdate = async (categoryId, newUrl) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ image_url: newUrl })
        .eq('id', categoryId);
        
      if (error) throw error;
      showToast('Imagen de categoría actualizada existosamente.');
      fetchCategories();
    } catch (err) {
      logger.error(err);
      showToast('Error al actualizar imagen de categoría.', true);
    }
  };

  const handleRemoveImage = async (categoryId) => {
    handleImageUpdate(categoryId, null);
  };

  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-360 overflow-hidden flex flex-col mb-8">
      <div className="p-6 border-b border-slate-100 dark:border-white/5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">category</span>
          Imágenes de Categorías Destacadas
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Cambia únicamente las imágenes de las categorías destacadas que se muestran en la página de inicio.
        </p>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-slate-500 py-8">No hay categorías creadas todavía.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className="bg-slate-50 dark:bg-transparent border border-slate-100 dark:border-white/5 rounded-xl p-4 flex flex-col">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-center line-clamp-1">{cat.name}</h3>
                <div className="flex-1">
                  <ImageUploader 
                    currentImage={cat.image_url}
                    onUploadSuccess={(url) => handleImageUpdate(cat.id, url)}
                    onRemoveImage={() => handleRemoveImage(cat.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
