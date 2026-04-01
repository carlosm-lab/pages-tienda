import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/utils/formatPrice';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import StructuredData, { createProductSchema } from '@/components/StructuredData';
import ShareModal from '@/components/ShareModal';
import { isOfferActive as isOfferActiveUtil, isOfferScheduled as isOfferScheduledUtil } from '@/utils/productUtils';
import OfferCountdown from '@/components/OfferCountdown';
import { BASE_URL } from '@/config/constants';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user, showAuthModal } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Bloquear el scroll del background cuando el modal de imagen esté abierto
  useBodyScrollLock(isImageModalOpen);

  const { product, loading, error, refetch } = useProduct(slug);
  const { products: relatedProducts } = useProducts({
    category: product?.category,
    limit: 5,
    skip: !product
  });

  const [mainImg, setMainImg] = useState('');
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    if (!loading) {
      if (error) {
        toast.error('Error al cargar el producto');
        navigate('/catalog');
      } else if (!product) {
        toast.error('Producto no encontrado');
        navigate('/catalog');
      }
    }
  }, [loading, product, navigate, error]);

  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMainImg(product.image_path || product.images?.[0] || '');
      setCustomNote('');
    }
  }, [product]);

  // Callback para refrescar datos cuando una oferta expira o inicia
  // (debe estar antes de los early returns para no violar las reglas de Hooks)
  const handleOfferExpire = useCallback(() => {
    refetch();
  }, [refetch]);

  if (loading) return <div className="flex-1 flex justify-center items-center py-24"><div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  if (!product) return null;

  // Related products
  const related = (relatedProducts || []).filter(p => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (!user) { showAuthModal('cart'); return; }
    addToCart(product, 1, null, customNote);
  };

  const handleToggleFavorite = (productId) => {
    if (!user) { showAuthModal('favorites'); return; }
    toggleFavorite(productId);
  };

  const getOgDescription = () => {
    if (!product.description) return '';
    return product.description.length > 150 ? product.description.substring(0, 147) + '...' : product.description;
  };

  const isOfferActive = isOfferActiveUtil(product);

  return (
    <>
      <Helmet>
        <title>{product.name} | PaGe's Detalles & Más</title>
        <meta name="description" content={getOgDescription()} />
        <meta property="og:title" content={`${product.name} | PaGe's Detalles & Más`} />
        <meta property="og:image" content={mainImg} />
        <meta property="og:description" content={getOgDescription()} />
        <meta property="og:url" content={`${BASE_URL}/product/${product.slug}`} />
      </Helmet>
      <StructuredData data={createProductSchema(product, `${BASE_URL}/product/${product.slug}`)} />

      <main className="flex-1 px-container py-[var(--space-lg)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-xl)]">
          {/* Gallery */}
          <div className="flex flex-col gap-[var(--space-md)]">
            <div
              onClick={() => setIsImageModalOpen(true)}
              className="cursor-zoom-in group relative w-full aspect-square max-h-[500px] lg:max-h-[600px] rounded-xl overflow-hidden shadow-360 transition-all bg-gray-50 dark:bg-white/10"
            >
              <img src={mainImg || '/logo.png'} alt={product.name} fetchpriority="high" loading="eager" className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="material-symbols-outlined text-white text-5xl drop-shadow-md">zoom_in</span>
              </div>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-[var(--space-md)]">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setMainImg(img)}
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-[0.125rem] transition-all bg-gray-50 dark:bg-white/10 ${mainImg === img ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img || '/logo.png'} alt={`${product.name} thumbnail ${i + 1}`} loading="lazy" className="w-full h-full object-cover object-center" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-[var(--space-lg)]">
            <nav className="flex text-[var(--text-sm)] text-slate-500 dark:text-slate-400 gap-[var(--space-xs)] items-center">
              <Link to="/">Tienda</Link>
              <span className="material-symbols-outlined text-[var(--text-xs)]">chevron_right</span>
              <Link to="/catalog">Colecciones</Link>
              <span className="material-symbols-outlined text-[var(--text-xs)]">chevron_right</span>
              <span className="text-primary font-medium">{product.categories?.name || product.category}</span>
            </nav>
            <div>
              <div className="flex justify-between items-start gap-4 mb-[var(--space-xs)]">
                <h1 className="text-[var(--text-4xl)] font-black tracking-tight">{product.name}</h1>
                <button
                  onClick={() => handleToggleFavorite(product.id)}
                  className={`w-[clamp(2.5rem,5vw,3rem)] aspect-square flex items-center justify-center rounded-full shrink-0 transition-all ${isFavorite(product.id)
                      ? 'bg-slate-100 dark:bg-white/5 text-primary'
                      : 'bg-slate-100 dark:bg-white/5 text-white hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  aria-label={isFavorite(product.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                >
                  <span className="material-symbols-outlined drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-[var(--space-lg)] border border-slate-200 dark:border-white/5">
              <div className="flex justify-between items-end mb-[var(--space-md)]">
                <div>
                  <p className="text-[var(--text-sm)] text-slate-500 dark:text-slate-400 mb-[0.25rem]">Precio</p>
                  <div className="flex items-center gap-[var(--space-sm)]">
                    <p className="text-[var(--text-3xl)] font-bold text-primary">{formatPrice(product.price)}</p>
                    {isOfferActive && (
                      <p className="text-[var(--text-lg)] text-slate-400 line-through decoration-slate-400/50 font-medium">
                        {formatPrice(product.old_price)}
                      </p>
                    )}
                  </div>
                  {(isOfferActive || isOfferScheduledUtil(product)) && product.offer_ends_at && (
                    <OfferCountdown
                      offer_ends_at={product.offer_ends_at}
                      offer_starts_at={product.offer_starts_at}
                      variant="detail"
                      onExpire={handleOfferExpire}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-[var(--space-md)] border-t border-slate-200 dark:border-white/5 pt-[var(--space-md)] mt-[var(--space-md)]">
                <h3 className="font-bold text-[var(--text-sm)] uppercase tracking-wider text-slate-900 dark:text-slate-100">Personaliza tu regalo</h3>

                <div>
                  <label className="block text-[var(--text-sm)] font-medium mb-[var(--space-xs)] text-slate-700 dark:text-slate-300" htmlFor="custom-note">Nota de regalo personalizada</label>
                  <textarea
                    className="w-full p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[var(--text-sm)] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    id="custom-note"
                    placeholder="Escribe tu mensaje aquí... (Máx. 500 caracteres)"
                    rows="3"
                    maxLength={500}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="flex gap-[var(--space-md)]">
              <button
                onClick={handleAddToCart}
                className={`flex-1 text-white py-[var(--space-md)] rounded-xl font-bold transition-all flex items-center justify-center gap-[var(--space-xs)] bg-primary hover:opacity-90`}
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                Añadir al carrito
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-[var(--space-lg)] border-[0.125rem] border-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-slate-300 shadow-sm"
                title="Compartir"
              >
                <span className="material-symbols-outlined text-primary">share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <section className="mt-[var(--space-3xl)]">
            <div className="flex justify-between items-center mb-[var(--space-lg)]">
              <h2 className="text-[var(--text-2xl)] font-bold tracking-tight">También Te Puede Gustar</h2>
              <Link to="/catalog" className="text-primary font-bold text-[var(--text-sm)] hover:underline">Ver Todo</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--space-lg)]">
              {related.map((p) => (
                <div key={p.id} onClick={() => navigate(`/product/${p.slug}`)} className="group flex flex-col gap-[var(--space-sm)] cursor-pointer">
                  <div className="aspect-square rounded-xl overflow-hidden relative bg-gray-50 dark:bg-white/10">
                    <img src={p.image_path || p.images?.[0] || '/logo.png'} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute top-[var(--space-sm)] right-[var(--space-sm)] z-10 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(p.id); }}
                        className="p-[var(--space-xs)] transition-all duration-300 hover:scale-110"
                      >
                        <span
                          className={`material-symbols-outlined text-[var(--text-lg)] drop-shadow-[0_0px_4px_rgba(0,0,0,0.8)] transition-colors ${isFavorite(p.id) ? 'text-primary' : 'text-white hover:text-slate-200'}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{p.name}</h4>
                    <p className="text-primary font-bold">{formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={product}
        url={`${BASE_URL}${location.pathname}`}
      />

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsImageModalOpen(false)}></div>

          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/60 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-12 h-12 flex items-center justify-center transition-all z-20"
            aria-label="Cerrar imagen"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          <img
            src={mainImg || '/logo.png'}
            alt={product.name}
            className="relative z-10 w-auto h-auto max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] sm:max-w-[calc(100vw-6rem)] sm:max-h-[calc(100vh-6rem)] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
