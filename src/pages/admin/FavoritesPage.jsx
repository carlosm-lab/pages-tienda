import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/formatPrice';
import { sanitizeUrl } from '@/utils/sanitize';
import { logger } from '@/utils/logger';


export default function FavoritesPage() {
  const [favoritesStats, setFavoritesStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        // Llama al RPC para agrupar en el servidor de forma eficiente
        const { data, error } = await supabase
          .rpc('get_top_favorites', { limit_num: 100 });

        if (error) throw error;

        // El RPC ya devuelve los objetos ordenados con id, name, image_path, price y count
        // Mapear image_path a image para que coincida con el renderizado actual
        const formattedStats = data?.map(item => ({
          ...item,
          image: item.image_path
        })) || [];
        
        setFavoritesStats(formattedStats);

      } catch (error) {
        logger.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <div className="flex flex-col h-full max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 pt-1.5 flex items-center gap-2">
          Productos Favoritos
          <span className="material-symbols-outlined text-red-500 fill-current ml-1" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Descubre qué productos son los más deseados por tus clientes.
        </p>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-360 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500">Analizando favoritos...</p>
          </div>
        ) : favoritesStats.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-transparent rounded-full flex items-center justify-center text-slate-400 mb-4">
              <span className="material-symbols-outlined text-[32px]">heart_broken</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Aún no hay favoritos</h3>
            <p className="text-slate-500">Los usuarios aún no han agregado productos a su lista de deseados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-transparent/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold w-16 text-center">Ranking</th>
                  <th className="px-6 py-4 font-semibold w-20">Imagen</th>
                  <th className="px-6 py-4 font-semibold">Producto</th>
                  <th className="px-6 py-4 font-semibold text-center text-red-500">Veces guardado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {favoritesStats.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-center font-bold text-slate-400">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-transparent border border-slate-200 dark:border-white/5 overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          <img src={sanitizeUrl(item.image) || ''} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-slate-400">image</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                        <p className="text-xs text-slate-500">{formatPrice(item.price)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-full font-bold">
                        <span className="material-symbols-outlined text-[16px]">favorite</span>
                        {item.count}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
