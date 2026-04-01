import { useEffect, useState } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';
import { formatPrice } from '@/utils/formatPrice';
import { Link, useNavigate } from 'react-router-dom';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useModal } from '@/hooks/useModal';
import { logger } from '@/utils/logger';
import { sanitizeUrl } from '@/utils/sanitize';
import FocusLock from 'react-focus-lock';

export default function FavoritesModal({ isOpen, onClose }) {
  const { favorites, toggleFavorite } = useFavorites();
  const { user, showAuthModal } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { modalRef } = useModal({ isOpen, onClose });

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    async function fetchFavorites() {
      if (favorites.length === 0) {
        if (mounted) setProducts([]);
        return;
      }
      
      // Avoid showing a loading spinner if we already have the products (e.g., when deleting a favorite)
      // Only show spinner on initial load of the modal
      if (products.length === 0) {
        setLoading(true);
      }
      
      try {
        const { data, error } = await productService.getProductsQuery({ 
          filterFavorites: favorites, 
          limit: 100 
        });
        
        if (error) throw error;
        
        // Remove favorites from localStorage that do not exist in DB anymore (products were deleted)
        if (data && data.length !== favorites.length) {
            const validIds = data.map(p => p.id);
            const invalidIds = favorites.filter(id => !validIds.includes(id));
            if (invalidIds.length > 0) {
              invalidIds.forEach(id => toggleFavorite(id));
            }
        }
        
        if (mounted) {
          // Check if data actually changed to prevent infinite re-renders if products is in dependency array
          // or just set it
          setProducts(data || []);
        }
      } catch (err) {
        logger.error("Error fetching favorite products", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchFavorites();
    
    return () => { mounted = false; };
  }, [isOpen, favorites, products.length, toggleFavorite]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="favorites-modal-title"
        className="bg-white dark:bg-white/5 w-full max-w-2xl rounded-3xl shadow-360 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <FocusLock returnFocus className="flex flex-col h-full w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
          <h2 id="favorites-modal-title" className="text-2xl font-brand font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            Mis Favoritos
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex justify-center p-12">
              <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-12">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4 block">favorite_border</span>
              <p className="text-gray-500 dark:text-gray-400">Aún no tienes productos favoritos guardados.</p>
              <button 
                onClick={() => { onClose(); navigate('/catalog'); }} 
                className="mt-6 px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-dark shadow-md transition-all hover:scale-105"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {products.filter(p => favorites.includes(p.id)).map(product => (
                <Link 
                  key={product.id}
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="group relative bg-gray-50 dark:bg-white/5 rounded-2xl p-4 transition-all hover:shadow-360 flex gap-4 items-center"
                >
                  <div className="w-[clamp(4.5rem,15vw,6rem)] aspect-square shrink-0 rounded-xl overflow-hidden bg-white dark:bg-white/5">
                    <img 
                      src={sanitizeUrl(product.image_path || product.images?.[0]) || 'https://placehold.co/200x200?text=Sin+Imagen'} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center pr-10">
                    <h3 className="font-bold text-lg line-clamp-1 text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-primary font-bold text-xl mt-1">{formatPrice(product.price)}</p>
                  </div>

                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!user) { showAuthModal('favorites'); return; } toggleFavorite(product.id); }}
                    className="absolute top-1/2 -translate-y-1/2 right-4 z-10 p-2 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm text-primary hover:scale-110 transition-transform shadow-sm"
                    aria-label="Quitar de favoritos"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
        </FocusLock>
      </div>
    </div>
  );
}
