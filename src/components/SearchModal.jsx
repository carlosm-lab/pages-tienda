import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { formatPrice } from '@/utils/formatPrice';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useModal } from '@/hooks/useModal';
import FocusLock from 'react-focus-lock';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { products: results, loading: searchLoading } = useProducts({ search: query.trim().length > 1 ? query : '', limit: 6 });
  const { categories } = useCategories();
  const { modalRef } = useModal({ isOpen, onClose });

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
    }
  }, [isOpen]);



  if (!isOpen) return null;

  const handleProductClick = (slug) => {
    navigate(`/product/${slug}`);
    onClose();
  };

  const handleDisplayAll = () => {
    navigate(`/catalog?search=${encodeURIComponent(query)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center pt-[var(--space-2xl)] px-[var(--space-md)]">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div 
        ref={modalRef}
        className="bg-white dark:bg-white/5 w-full max-w-[48rem] rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[80vh] animate-fade-in-up"
      >
        <FocusLock returnFocus className="flex flex-col h-full w-full">
        {/* Search Input Area */}
        <div className="relative border-b border-gray-100 dark:border-white/5 flex items-center p-[var(--space-md)] sm:p-[var(--space-lg)] pb-[var(--space-md)]">
          <span className="material-symbols-outlined absolute left-[var(--space-lg)] text-gray-400 dark:text-slate-500" style={{ fontSize: 'var(--icon-lg)' }}>search</span>
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca rosas, tazas, regalos..." 
            className="w-full pl-[clamp(2.5rem,5vw,3.5rem)] pr-[clamp(2rem,4vw,3rem)] py-[var(--space-md)] text-[var(--text-xl)] sm:text-[var(--text-2xl)] font-light text-slate-800 dark:text-slate-100 placeholder:text-gray-300 dark:placeholder:text-slate-600 bg-transparent border-none focus:ring-0"
          />
          <button 
            onClick={onClose}
            className="absolute right-[var(--space-lg)] p-[var(--space-xs)] text-gray-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 bg-gray-50 hover:bg-gray-100 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[var(--text-sm)]">close</span>
            <span className="sr-only">Cerrar buscador</span>
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto bg-gray-50/50 dark:bg-white/5 flex-1 relative">
          {query.trim().length > 1 ? (
            searchLoading ? (
              <div className="p-[var(--space-xl)] flex justify-center items-center opacity-50">
                <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: 'var(--icon-xl)' }}>refresh</span>
              </div>
            ) : results && results.length > 0 ? (
              <div className="p-[var(--space-md)] sm:p-[var(--space-lg)]">
                 <div className="flex justify-between items-center mb-[var(--space-md)]">
                   <h3 className="text-[var(--text-xs)] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Resultados ({results.length})</h3>
                   {results.length > 4 && (
                     <button onClick={handleDisplayAll} className="text-primary text-[var(--text-sm)] font-semibold hover:underline">
                       Ver todos los resultados
                     </button>
                   )}
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--space-md)]">
                   {results.slice(0, 6).map(item => (
                     <div 
                       key={item.id} 
                       onClick={() => handleProductClick(item.slug)}
                       className="flex items-center gap-[var(--space-md)] p-[var(--space-sm)] bg-white dark:bg-white/5 rounded-2xl cursor-pointer hover:shadow-md border border-transparent hover:border-slate-300 dark:hover:border-primary/40 transition-all group"
                     >
                       <div className="w-[clamp(3rem,8vw,4rem)] aspect-square shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/10">
                         <img src={item.images?.[0] || item.image_path || ''} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">{item.name}</h4>
                         <div className="flex items-center gap-[var(--space-xs)] mt-[0.25rem]">
                           <span className="text-[var(--text-sm)] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{item.category?.name || 'Varios'}</span>
                           <span className="text-[var(--text-sm)] font-bold text-primary">{formatPrice(item.price)}</span>
                         </div>
                       </div>
                       <div className="w-[clamp(1.25rem,3vw,2rem)] flex justify-center text-gray-300 group-hover:text-primary transition-colors">
                         <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-md)' }}>arrow_forward_ios</span>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            ) : (
              <div className="p-[var(--space-xl)] text-center text-gray-500 dark:text-slate-400 flex flex-col items-center">
                <span className="material-symbols-outlined text-gray-300 dark:text-slate-600 mb-[var(--space-sm)]" style={{ fontSize: 'var(--icon-xl)' }}>search_off</span>
                <p className="text-[var(--text-lg)] text-slate-600 dark:text-slate-300">No encontramos resultados para "<span className="font-medium text-slate-800 dark:text-slate-100">{query}</span>"</p>
                <p className="text-[var(--text-sm)] mt-[var(--space-xs)] text-slate-500 dark:text-slate-400">Intenta buscar con términos más generales.</p>
              </div>
            )
          ) : (
            categories?.length > 0 ? (
              <div className="p-[var(--space-lg)] sm:p-[var(--space-xl)] flex flex-col items-center text-center">
                 <h3 className="text-[var(--text-sm)] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-[var(--space-lg)]">Búsquedas Populares</h3>
                 <div className="flex flex-wrap justify-center gap-[var(--space-sm)]">
                   {categories.slice(0, 5).map(c => c.name).map((term, i) => (
                     <button 
                       key={i}
                       onClick={() => setQuery(term)}
                       className="px-[var(--space-md)] py-[var(--space-xs)] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-full text-[var(--text-sm)] text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:border-slate-300 dark:hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-md"
                     >
                       {term}
                     </button>
                   ))}
                 </div>
              </div>
            ) : null
          )}
        </div>
        </FocusLock>
      </div>
    </div>
  );
}
