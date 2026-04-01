import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';

export default function StatDetailModal({ isOpen, onClose, type }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !type) return;

    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        let fetchedData = [];

        switch (type) {
          case 'products': {
            const { data: pData } = await supabase.from('products').select('id, name, price, category').order('created_at', { ascending: false }).limit(100);
            fetchedData = pData || [];
            break;
          }
          case 'categories': {
            const { data: cData } = await supabase.from('categories').select('id, name, slug').order('name');
            fetchedData = cData || [];
            break;
          }
          case 'offers': {
            const { data: oData } = await supabase.from('products').select('id, name, price, old_price').not('old_price', 'is', null).order('created_at', { ascending: false }).limit(100);
            fetchedData = oData || [];
            break;
          }
          case 'messages': {
            const { data: mData } = await supabase.from('contact_messages').select('id, name, email, subject, created_at').eq('is_read', false).order('created_at', { ascending: false }).limit(100);
            fetchedData = mData || [];
            break;
          }
          case 'favorites': {
            // Custom fetch for favorites
            const { data: allFavs } = await supabase.from('user_favorites').select('product_id');
            if (allFavs && allFavs.length > 0) {
              const counts = allFavs.reduce((acc, curr) => {
                acc[curr.product_id] = (acc[curr.product_id] || 0) + 1;
                return acc;
              }, {});
              const pIds = Object.keys(counts);
              if (pIds.length > 0) {
                const { data: favProd } = await supabase.from('products').select('id, name').in('id', pIds);
                if (favProd) {
                  fetchedData = favProd.map(p => ({ ...p, count: counts[p.id] })).sort((a,b) => b.count - a.count);
                }
              }
            }
            break;
          }
          case 'users': {
            const { data: uData } = await supabase.rpc('get_users_list');
            fetchedData = uData || [];
            break;
          }
        }

        if (isMounted) {
          setData(fetchedData);
        }
      } catch (err) {
        logger.error(`Error fetching data for ${type}:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [isOpen, type]);

  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case 'products': return 'Detalle de Productos';
      case 'categories': return 'Detalle de Categorías';
      case 'offers': return 'Detalle de Ofertas Activas';
      case 'messages': return 'Mensajes No Leídos';
      case 'favorites': return 'Top Favoritos';
      case 'users': return 'Lista de Usuarios';
      default: return 'Detalle';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-10 text-slate-500">
          No hay datos disponibles para mostrar.
        </div>
      );
    }

    return (
      <ul className="divide-y divide-slate-100 dark:divide-white/5">
        {data.map((item, idx) => (
          <li key={item.id || idx} className="py-3 px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            {type === 'products' && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.category}</p>
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200">${item.price}</div>
              </div>
            )}
            {type === 'categories' && (
              <div className="flex justify-between items-center">
                <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-sm border border-slate-200 dark:border-white/5 px-2 rounded-full text-slate-500">{item.slug}</p>
              </div>
            )}
            {type === 'offers' && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-red-500 line-through">${item.old_price}</p>
                </div>
                <div className="font-bold text-emerald-600">${item.price}</div>
              </div>
            )}
            {type === 'messages' && (
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                  <span className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-600 truncate">{item.subject || 'Sin asunto'}</p>
                <a href={`mailto:${item.email}`} className="text-xs text-primary hover:underline">{item.email}</a>
              </div>
            )}
            {type === 'favorites' && (
              <div className="flex justify-between items-center">
                <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                <div className="flex items-center gap-1 text-pink-500">
                  <span className="material-symbols-outlined text-[16px] filled">favorite</span>
                  <span className="font-bold">{item.count}</span>
                </div>
              </div>
            )}
            {type === 'users' && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item.full_name || 'Sin Nombre'}</p>
                  <p className="text-xs text-slate-500">{item.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${item.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                  {item.role || 'user'}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-white/5 w-full max-w-lg rounded-3xl shadow-360 flex flex-col overflow-hidden max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {getTitle()}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:bg-gray-800 transition-colors text-slate-500">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
