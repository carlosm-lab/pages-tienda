import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/utils/formatPrice';

import { isOfferActive as isOfferActiveUtil, isOfferScheduled as isOfferScheduledUtil } from '@/utils/productUtils';
import OfferCountdown from '@/components/OfferCountdown';
import toast from 'react-hot-toast';

const ProductCardComponent = function ProductCard({ product }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart, refreshCartPrices } = useCart();
  const { user, showAuthModal } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { showAuthModal('cart'); return; }
    addToCart(product);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { showAuthModal('favorites'); return; }
    toggleFavorite(product.id);
    toast.success(isFavorite(product.id) ? 'Eliminado de favoritos' : 'Añadido a favoritos');
  };

  const isOfferActive = isOfferActiveUtil(product);
  const isScheduled = isOfferScheduledUtil(product);

  return (
    <article
      data-testid="product-card"
      className="group relative block overflow-hidden bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-360 hover:shadow-2xl transition-all duration-300"
    >
      <Link to={`/product/${product.slug}`} className="absolute inset-0 z-[1]" aria-label={`Ver detalles de ${product.name}`} />

      {/* Badges */}
      <div className="absolute top-[var(--space-md)] left-[var(--space-md)] z-[2] flex flex-col gap-[var(--space-xs)] pointer-events-none">
        {isOfferActive && (
          <span className="select-none px-[var(--space-xs)] sm:px-[var(--space-sm)] py-[0.25rem] text-[var(--text-xs)] font-black uppercase tracking-widest rounded-full shadow-sm bg-primary text-white" style={{ fontSize: 'clamp(0.5rem, 0.8vw, 0.625rem)' }}>¡Oferta!</span>
        )}
        {isScheduled && (
          <span className="select-none px-[var(--space-xs)] sm:px-[var(--space-sm)] py-[0.25rem] text-[var(--text-xs)] font-black uppercase tracking-widest rounded-full shadow-sm bg-blue-500 text-white" style={{ fontSize: 'clamp(0.5rem, 0.8vw, 0.625rem)' }}>Próximamente</span>
        )}
        {product.tags && product.tags.length > 0 && !isOfferActive && (
          <span className={`select-none px-[var(--space-xs)] py-[0.25rem] text-[var(--text-xs)] font-black uppercase tracking-widest rounded shadow-sm ${product.tags[0] === 'Premium' ? 'bg-slate-900 text-white dark:bg-white/10' :
              'bg-primary text-white'
            }`} style={{ fontSize: 'clamp(0.5rem, 0.8vw, 0.625rem)' }}>{product.tags[0]}</span>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleToggleFavorite}
        className="absolute top-[var(--space-md)] right-[var(--space-md)] z-[2] p-[var(--space-xs)] transition-all duration-300"
        aria-label="Alternar Favorito"
      >
        <span
          className={`material-symbols-outlined drop-shadow-[0_0px_4px_rgba(0,0,0,0.8)] transition-colors ${isFavorite(product.id) ? 'text-primary' : 'text-white hover:text-slate-200'}`}
          style={{ fontSize: 'var(--icon-md)', fontVariationSettings: "'FILL' 1" }}
        >
          favorite
        </span>
      </button>

      <div className="aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-white/10 relative">
        <img
          src={product.image_path || product.images?.[0] || '/logo.png'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-[var(--space-md)] flex flex-col gap-[var(--space-xs)]">
        <h3 className="text-slate-900 dark:text-slate-100 font-bold group-hover:text-primary transition-colors truncate relative z-[2] pointer-events-none">{product.name}</h3>

        <p className="text-slate-500 dark:text-slate-400 text-[var(--text-xs)] line-clamp-1 relative z-[2] pointer-events-none">{product.description}</p>

        <div className="flex flex-wrap items-center gap-[var(--space-xs)] mt-auto pt-[var(--space-xs)] select-none">
          <span className="text-lg sm:text-xl font-bold text-primary relative z-[2] pointer-events-none">{formatPrice(product.price)}</span>
          {isOfferActive && (
            <span className="text-sm text-slate-400 line-through decoration-slate-400/50 relative z-[2] pointer-events-none">
              {formatPrice(product.old_price)}
            </span>
          )}
          <button
            onClick={handleAddToCart}
            className="p-[var(--space-xs)] bg-slate-100 hover:bg-primary text-primary hover:text-white rounded-lg transition-all relative z-[2] ml-auto"
            aria-label="Añadir al carrito"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-md)' }}>add_shopping_cart</span>
          </button>
        </div>
        {(isOfferActive || isScheduled) && product.offer_ends_at && (
          <div className="relative z-[2]">
            <OfferCountdown
              offer_ends_at={product.offer_ends_at}
              offer_starts_at={product.offer_starts_at}
              variant="card"
              onExpire={refreshCartPrices}
            />
          </div>
        )}
      </div>
    </article>
  );
};

const ProductCard = React.memo(ProductCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.old_price === nextProps.product.old_price &&
    prevProps.product.offer_starts_at === nextProps.product.offer_starts_at &&
    prevProps.product.offer_ends_at === nextProps.product.offer_ends_at &&
    prevProps.product.is_active === nextProps.product.is_active
  );
});

export default ProductCard;
