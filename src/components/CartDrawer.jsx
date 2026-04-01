import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/formatPrice';
import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { WHATSAPP_NUMBER } from '@/config/constants';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import FocusLock from 'react-focus-lock';

import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { logger } from '@/utils/logger';
import { buildWhatsAppUrl } from '@/utils/whatsapp';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, clearCart, isRefreshingPrices, arePricesStale, refreshCartPrices } = useCart();
  const { settings } = useSettings();
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  // MED-008: Auto-refresh cart prices when the drawer is opened to ensure up-to-date data
  useEffect(() => {
    if (isCartOpen) {
      refreshCartPrices();
    }
  }, [isCartOpen, refreshCartPrices]);

  // MED-UX01: Close drawer on Escape key press — accessibility requirement
  useEffect(() => {
    if (!isCartOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isCartOpen, setIsCartOpen]);

  useBodyScrollLock(isCartOpen);

  // Calcula el total iterando los items sin depender del estado cacheado
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };
  
  // SEC-002: Server-side WhatsApp message verification
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);

  const handleWhatsAppOrder = async () => {
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Solo en desktop abrimos la ventana auxiliar sincrónicamente para evitar popup blockers de nuevas pestañas.
    // En móviles, asignaremos el 'whatsapp://' a window.location.href nativamente.
    let whatsappWindow = null;
    if (!isMobileDevice) {
      whatsappWindow = window.open('about:blank', '_blank');
    }
    
    setIsGeneratingMessage(true);
    let rawMessage = '';
    
    try {
      // Intentar validación server-side de precios (SEC-002)
      const { data: serverMessage, error } = await supabase.rpc('generate_whatsapp_message', { 
        items: cartItems,
        store_domain: window.location.origin 
      });
      
      if (error) throw error;
      rawMessage = serverMessage;
      
    } catch (err) {
      logger.error('Error generando mensaje seguro:', err);
      toast.error('Error al generar el pedido. Intenta nuevamente por favor.', { duration: 5000 });
      if (whatsappWindow) whatsappWindow.close();
      return;
    } finally {
      setIsGeneratingMessage(false);
    }
    
    if (!rawMessage) {
       toast.error('Error al generar el mensaje. Tu carrito podría estar vacío o tener productos inválidos.');
       if (whatsappWindow) whatsappWindow.close();
       return;
    }
    
    let url = '';
    const rawPhoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || settings?.contact_phone || WHATSAPP_NUMBER || '';
    
    // TAREA-013: Utilizar buildWhatsAppUrl para centralizar lógica, limits y encoding estricto
    try {
      const { url: safeUrl, usedFallback } = buildWhatsAppUrl(
        rawPhoneNumber,
        rawMessage,
        cartItems,
        calculateTotal
      );
      
      url = safeUrl;
      
      if (usedFallback) {
        toast.error('El pedido es muy extenso para WhatsApp, enviando resumen...', { duration: 5000 });
      }
    } catch (err) {
      if (import.meta.env.DEV) {
         console.error('Error de configuración de WhatsApp:', err);
      }
      toast.error('Error de configuración: Número de vendedor inválido.');
      if (whatsappWindow) whatsappWindow.close();
      return;
    }
    
    try {
      if (isMobileDevice) {
        window.location.href = url;
      } else {
        if (whatsappWindow) {
          whatsappWindow.location.href = url;
        } else {
          // Fallback: window.open with noopener,noreferrer per security protocol
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (e) {
      logger.error('Error al redirigir a WhatsApp:', e);
      toast('Abre WhatsApp manualmente al ' + rawPhoneNumber, { icon: '📱' });
    }
    
    // Cambiar estado a orderSent, pero NO limpiar el carrito aún
    setOrderSent(true);
    setShowConfirm(false);
  };

  const handleFinishAndClear = () => {
    clearCart();
    setOrderSent(false);
    setIsCartOpen(false);
  };

  const closeDrawer = () => {
    setShowConfirm(false);
    setOrderSent(false);
    setIsCartOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDrawer}
      ></div>

      {/* Drawer */}
      <div data-testid="cart-drawer" className={`fixed top-0 right-0 max-w-[28rem] w-full h-[100dvh] bg-white dark:bg-background-dark shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-transparent transition-transform duration-300 ease-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <FocusLock returnFocus disabled={!isCartOpen} className="flex flex-col h-[100dvh] w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-[var(--space-lg)] border-b border-gray-100 dark:border-transparent">
          <h2 className="text-[var(--text-xl)] font-bold text-slate-900 dark:text-slate-100 flex items-center gap-[var(--space-xs)]">
            <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-lg)' }}>shopping_cart</span>
            Tu Carrito
          </h2>
          <button 
            data-testid="close-cart"
            onClick={closeDrawer}
            className="p-[var(--space-xs)] text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-[var(--space-lg)] relative">
          
          {/* Order Sent View */}
          {orderSent ? (
            <div className="text-center flex flex-col items-center justify-center h-full animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
                 <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">¡Pedido generado!</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-[250px]">
                Te hemos redirigido a WhatsApp. ¿Pudiste enviar el mensaje correctamente?
              </p>
              
              <button 
                onClick={handleFinishAndClear}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-gray-100 py-3 rounded-xl font-bold mb-3 transition-colors"
              >
                Sí, ya hice mi pedido (Limpiar carrito)
              </button>
              <button 
                onClick={() => setOrderSent(false)}
                className="w-full bg-white dark:bg-transparent text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 py-3 rounded-xl font-bold transition-colors"
              >
                No, volver al carrito
              </button>
            </div>
          ) : showConfirm ? (
            /* Custom Confirm View */
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-200">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 w-max transition-colors font-medium"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                Atrás
              </button>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Confirmar Pedido</h3>
              <div className="bg-white dark:bg-white/5 p-4 rounded-xl shadow-360 border border-slate-100 dark:border-white/5 mb-6">
                <p className="text-slate-600 dark:text-slate-400 mb-4 whitespace-pre-wrap text-sm leading-relaxed border-l-2 border-primary pl-3">
                  Serás redirigido a WhatsApp para enviar este mensaje preconfigurado.
                </p>
                
                <div className="space-y-2 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300 pr-2 line-clamp-1">{item.quantity}x {item.product.name}</span>
                      <span className="text-slate-900 dark:text-white font-medium shrink-0">{formatPrice(item.product.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-transparent flex justify-between font-bold">
                  <span className="text-slate-900 dark:text-white">Total Estimado</span>
                  <span className="text-primary">{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <button 
                  onClick={handleWhatsAppOrder}
                  disabled={isGeneratingMessage || cartItems.length === 0}
                  className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-[var(--space-md)] rounded-xl font-bold flex items-center justify-center gap-[var(--space-xs)] transition-colors shadow-md shadow-[#25D366]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-md)' }}>
                    {isGeneratingMessage ? 'hourglass_top' : 'chat'}
                  </span>
                  {isGeneratingMessage ? 'Verificando...' : 'Confirmar e Ir a WhatsApp'}
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="w-full bg-white dark:bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart View */
            <div className="text-center flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-gray-200 dark:text-gray-700 mb-[var(--space-md)]" style={{ fontSize: 'var(--icon-hero)' }}>remove_shopping_cart</span>
              <p className="mb-[var(--space-lg)]">Tu carrito está vacío.</p>
              <button 
                onClick={closeDrawer}
                className="bg-white dark:bg-white/10 text-slate-900 dark:text-white font-bold py-3 px-8 rounded-full shadow-sm border border-slate-100 dark:border-white/5 hover:bg-slate-50 transition-colors"
              >
                Volver a la tienda
              </button>
            </div>
          ) : (
            /* Standard Cart View */
            <div className="flex flex-col gap-[var(--space-lg)]">
              {cartItems.map((item) => {
                if (!item || !item.product) return null;
                return (
                <div data-testid="cart-item" key={item.id} className="flex gap-[var(--space-md)] p-[var(--space-md)] bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <Link 
                    to={item.product.slug ? `/product/${item.product.slug}` : '#'} 
                    onClick={closeDrawer}
                    className={`w-[clamp(3.5rem,12vw,5rem)] aspect-[5/6] shrink-0 rounded-xl overflow-hidden bg-white dark:bg-white/5 ${!item.product.slug && 'pointer-events-none opacity-80'}`}
                  >
                    <img loading="lazy" src={item.product.image_path || item.product.images?.[0] || 'https://placehold.co/200x240?text=Sin+Imagen'} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{item.product.name}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Eliminar producto"
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-sm)' }}>delete</span>
                        </button>
                      </div>
                      <div className="flex justify-between items-start mt-1">
                      <p className="text-primary font-bold text-[var(--text-sm)] mt-[0.25rem]">{formatPrice(item.product.price)}</p>
                    </div>  
                      {(item.color || item.note) && (
                        <div className="mt-[var(--space-xs)] text-[var(--text-xs)] text-gray-500 dark:text-gray-400 space-y-[0.25rem]">
                          {item.color && <p>Color: {item.color}</p>}
                          {item.note && <p className="line-clamp-1 italic">Nota: "{item.note}"</p>}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-[var(--space-sm)] mt-[var(--space-sm)]">
                      <div className="flex items-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg shadow-md w-max">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Disminuir cantidad"
                          className="w-[clamp(1.5rem,4vw,2rem)] aspect-square flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-sm)' }}>remove</span>
                        </button>
                        <span className="w-[clamp(1.5rem,4vw,2rem)] text-center text-[var(--text-sm)] font-bold text-slate-900 dark:text-slate-100">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                          className="w-[clamp(1.5rem,4vw,2rem)] aspect-square flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-sm)' }}>add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && !showConfirm && !orderSent && (
          <div className="border-t border-gray-100 dark:border-transparent p-[var(--space-lg)] bg-gray-50 dark:bg-background-dark mt-auto">
            <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 text-xs p-3 rounded-lg flex items-start gap-2 border border-orange-100 dark:border-orange-800/30 mb-[var(--space-md)]">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">schedule</span>
              <p>Tus productos están reservados en este dispositivo por <strong>24 horas</strong>.</p>
            </div>
            
            {arePricesStale && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-xs p-3 rounded-lg flex flex-col gap-2 border border-red-200 dark:border-red-800/30 mb-[var(--space-md)] animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                  <p><strong>Atención:</strong> No pudimos verificar los precios actualizados con el servidor.</p>
                </div>
                <button 
                  onClick={() => refreshCartPrices()}
                  className="bg-red-100 dark:bg-red-800/40 hover:bg-red-200 dark:hover:bg-red-700/50 transition-colors py-1.5 px-3 rounded text-red-900 dark:text-red-200 font-bold self-start mt-1 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  Reintentar conexión
                </button>
              </div>
            )}
            
            <div className="flex justify-between items-end mb-[var(--space-md)]">
              <span className="text-slate-500 font-medium">Total a pagar:</span>
              <span className="text-[var(--text-2xl)] font-black text-slate-900 dark:text-white">{formatPrice(calculateTotal())}</span>
            </div>
            <button 
              data-testid="checkout-button"
              onClick={() => setShowConfirm(true)}
              disabled={isRefreshingPrices || arePricesStale}
              className={`w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-[var(--space-md)] rounded-xl font-bold flex items-center justify-center gap-[var(--space-xs)] transition-colors shadow-md shadow-[#25D366]/20 ${(isRefreshingPrices || arePricesStale) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRefreshingPrices ? 'Actualizando precios...' : arePricesStale ? 'Conexión inestable' : 'Pedir por WhatsApp'}
              {!isRefreshingPrices && !arePricesStale && <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-md)' }}>chat</span>}
            </button>
          </div>
        )}
        </FocusLock>
      </div>
    </>
  );
}
