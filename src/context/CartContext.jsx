// ──────────────────────────────────────────────────────────────
// CONTEXTO DEL CARRITO
// ──────────────────────────────────────────────────────────────
// El corazón de la lógica de ventas en Antigravity. Maneja:
//   - Persistencia en localStorage (guest-first, sin tabla de carritos)
//   - Sincronización con Supabase (user_carts) cuando hay usuario logueado
//   - Revalidación de precios cada 60 segundos
//   - Sync multi-pestaña via StorageEvent
//   - Expiración automática del carrito (7 días de inactividad)
//
// ESTRATEGIA "GUEST-FIRST":
// El carrito vive en localStorage siempre. Si el usuario se loguea:
//   - Carrito local vacío → se hidrata desde DB
//   - Carrito local CON items → SOBREESCRIBE la DB
// Esto prioriza la experiencia del guest que agrega productos
// antes de loguearse (el caso más común en este tipo de tienda).
//
// REVALIDACIÓN DE PRECIOS:
// Cada 60 segundos (si el carrito tiene items y la pestaña es visible),
// se consulta Supabase para verificar que los precios sean correctos
// y que los productos sigan activos. Si un producto fue desactivado
// por el admin, se elimina del carrito con una notificación.
//
// LIMITACIONES:
// - MAX_CART_QUANTITY (50): unidades máximas por producto
// - MAX_TOTAL_ITEMS (50): ítems distintos máximos en el carrito
// Estos límites existen para evitar mensajes de WhatsApp gigantes.
// ──────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './AuthContext';
import { logger } from '@/utils/logger';
import { useDebounce } from '@/hooks/useDebounce';
import { PRODUCT_SELECT_COLUMNS, MAX_CART_QUANTITY, MAX_TOTAL_ITEMS } from '@/config/constants';

const CartContext = createContext(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth() || {};

  // ── Inicialización desde localStorage ───────────────────
  // Migra las keys viejas ('cart') a las nuevas ('pages_cart')
  // por el rebranding del proyecto. Incluye expiración de 7 días.
  const [cartItems, setCartItems] = useState(() => {
    try {
      // Migración de keys antiguas (legacy) a 'pages_*'
      const oldCart = localStorage.getItem('cart');
      const oldTime = localStorage.getItem('cart_timestamp');
      const oldExp = localStorage.getItem('cart_was_expired');
      if (oldCart) { localStorage.setItem('pages_cart', oldCart); localStorage.removeItem('cart'); }
      if (oldTime) { localStorage.setItem('pages_cart_timestamp', oldTime); localStorage.removeItem('cart_timestamp'); }
      if (oldExp) { localStorage.setItem('pages_cart_was_expired', oldExp); localStorage.removeItem('cart_was_expired'); }

      const saved = localStorage.getItem('pages_cart');
      const timestamp = localStorage.getItem('pages_cart_timestamp');
      
      // Expiración de 7 días: si el carrito lleva más de una semana
      // sin actividad, se borra y se muestra un toast al usuario.
      if (saved && timestamp) {
        const now = Date.now();
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        
        if (now - parseInt(timestamp, 10) > SEVEN_DAYS) {
          localStorage.removeItem('pages_cart');
          localStorage.removeItem('pages_cart_timestamp');
          localStorage.setItem('pages_cart_was_expired', 'true');
          return [];
        }
        return JSON.parse(saved);
      }
      
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      // localStorage corrupto — limpiar y empezar de cero
      logger.error('Error parsing cart from localStorage, cleaning up corrupted data:', e);
      try {
        localStorage.removeItem('pages_cart');
        localStorage.removeItem('pages_cart_timestamp');
      } catch (cleanupErr) {
        logger.error('Error cleaning up localStorage:', cleanupErr);
      }
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  // HIGH-004: Tracking de fallos consecutivos para detectar precios potencialmente stale
  const [consecutiveRefreshFailures, setConsecutiveRefreshFailures] = useState(0);
  const [lastSuccessfulRefresh, setLastSuccessfulRefresh] = useState(Date.now());
  
  // Debounce de 1.5s para la sincronización con DB.
  // Evita mandar un upsert por cada click en +/- de cantidad.
  const debouncedCartItems = useDebounce(cartItems, 1500);
  const cartItemsRef = useRef(cartItems);
  
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);


  // ── Sync multi-pestaña ──────────────────────────────────
  // Si el usuario tiene la tienda abierta en 2 pestañas y agrega
  // un producto en una, la otra se actualiza automáticamente
  // vía StorageEvent (solo se dispara en las OTRAS pestañas).
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'pages_cart') {
        try {
          const newCart = e.newValue ? JSON.parse(e.newValue) : [];
          setCartItems(newCart);
        } catch (err) {
          logger.error('Error parsing cart from storage event:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Mostrar toast si el carrito expiró (flag del init)
    if (localStorage.getItem('pages_cart_was_expired') === 'true') {
      setTimeout(() => {
        toast('Tu carrito ha expirado por inactividad.', { icon: '🕒', duration: 4000 });
        localStorage.removeItem('pages_cart_was_expired');
      }, 1000);
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ── Persistencia en localStorage ────────────────────────
  useEffect(() => {
    localStorage.setItem('pages_cart', JSON.stringify(cartItems));
    if (cartItems.length === 0) {
      localStorage.removeItem('pages_cart_timestamp');
    }
  }, [cartItems]);

  const lastSyncedCartRef = useRef(cartItems);

  // ── Sync a Supabase (usuario logueado) ──────────────────
  // Upsert con debounce de 1.5s. Si falla, hace rollback
  // optimista para no perder los datos del usuario.
  useEffect(() => {
    if (user && debouncedCartItems.length >= 0) {
      // Si el carrito no cambió desde el último sync, no hacer nada
      if (JSON.stringify(debouncedCartItems) === JSON.stringify(lastSyncedCartRef.current)) return;
      supabase.from('user_carts').upsert({
        user_id: user.id,
        cart_items: debouncedCartItems,
        updated_at: new Date().toISOString()
      }).then(({ error }) => {
        if (error) {
          logger.error('Error syncing cart to DB:', error);
          toast.error('Error al guardar el carrito. Revise su conexión.');
          // Rollback optimista: volver al último estado sincronizado
          setCartItems(lastSyncedCartRef.current);
        } else {
          lastSyncedCartRef.current = debouncedCartItems;
        }
      });
    }
  }, [debouncedCartItems, user]);

  // ── Hidratación desde DB al login ───────────────────────
  // Guest-First: carrito local gana. Si está vacío, carga desde DB.
  useEffect(() => {
    let isMounted = true;

    const syncAndRevalidate = async () => {
      // Caso 1: Usuario logueado + carrito local vacío → hidratar desde DB
      if (user && cartItemsRef.current.length === 0) {
        const { data, error } = await supabase
          .from('user_carts')
          .select('cart_items')
          .eq('user_id', user.id)
          .single();
          
        if (!error && data?.cart_items && data.cart_items.length > 0) {
          // Race condition guard: verificar que el carrito sigue vacío
          if (cartItemsRef.current.length === 0 && isMounted) {
            const ids = [...new Set(data.cart_items.map(i => i.product.id))];
            // Revalidar precios contra la DB antes de hidratar
            const pRes = await supabase.from('products').select(PRODUCT_SELECT_COLUMNS).in('id', ids);
            
            if (pRes.data) {
              const pMap = Object.fromEntries(pRes.data.map(p => [p.id, p]));
              // Filtrar productos desactivados y actualizar precios
              const validated = data.cart_items
                .filter(i => pMap[i.product.id]?.is_active)
                .map(i => {
                  const fresh = pMap[i.product.id];
                  return { ...i, product: { ...i.product, name: fresh.name, price: fresh.price, old_price: fresh.old_price, offer_ends_at: fresh.offer_ends_at, offer_starts_at: fresh.offer_starts_at, image_path: fresh.image_path, images: fresh.images, slug: fresh.slug }};
                });
              if (isMounted && cartItemsRef.current.length === 0) {
                setCartItems(validated);
                lastSyncedCartRef.current = validated;
              }
            } else if (isMounted && cartItemsRef.current.length === 0) {
              // Si falla la revalidación, usar los datos de DB tal cual
              setCartItems(data.cart_items);
              lastSyncedCartRef.current = data.cart_items;
            }
            return;
          }
        }
      }

      // Caso 2: Hay items locales → revalidar precios
      if (cartItemsRef.current.length > 0 && isMounted) {
        refreshCartPrices();
      }
    };

    syncAndRevalidate();
    
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Revalidación de precios ─────────────────────────────
  // Consulta Supabase para verificar precios actuales y estado
  // de los productos. Si un producto fue desactivado, lo elimina.
  // Si el precio cambió, lo actualiza silenciosamente.
  // HIGH-004: Trackea fallos consecutivos para marcar precios como stale.
  const refreshCartPrices = useCallback(async () => {
    // No revalidar si la pestaña está en background (ahorro de rate limits)
    if (document.hidden) return;

    const currentCart = cartItemsRef.current;
    if (currentCart.length === 0) return;
    
    setIsRefreshingPrices(true);
    try {
      const idsChecked = [...new Set(currentCart.map(i => i.product.id))];
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT_COLUMNS)
        .in('id', idsChecked);
        
      if (error) throw error;
      if (!data) return;
      const productMap = Object.fromEntries(data.map(p => [p.id, p]));
      
      let itemsRemoved = false;
      const nextCart = currentCart
        .filter(item => {
          // Items agregados durante el refresh (no estaban en idsChecked) se preservan
          if (!idsChecked.includes(item.product.id)) return true;
          const fresh = productMap[item.product.id];
          if (!fresh || !fresh.is_active) {
            itemsRemoved = true;
            return false;
          }
          return true;
        })
        .map(item => {
          if (!idsChecked.includes(item.product.id)) return item;
          const fresh = productMap[item.product.id];
          if (fresh) {
            return { 
              ...item, 
              product: { 
                ...item.product, 
                name: fresh.name, 
                price: fresh.price, 
                old_price: fresh.old_price, 
                offer_ends_at: fresh.offer_ends_at, 
                offer_starts_at: fresh.offer_starts_at, 
                image_path: fresh.image_path, 
                images: fresh.images, 
                slug: fresh.slug 
              } 
            };
          }
          return item;
        });

      if (itemsRemoved) {
        toast('Un producto en tu carrito se ha agotado o desactivado.', { icon: '⚠️', duration: 5000 });
      }

      setCartItems(nextCart);
      setConsecutiveRefreshFailures(0);
      setLastSuccessfulRefresh(Date.now());
    } catch (err) {
      // No sobreescribir lastSuccessfulRefresh en fallo — permite
      // que expire naturalmente después de 5 min sin refresh exitoso.
      logger.error('Error refreshing cart prices:', err);
      setConsecutiveRefreshFailures(prev => prev + 1);
    } finally {
      setIsRefreshingPrices(false);
    }
  }, []);

  // ── Polling de revalidación cada 60s ────────────────────
  useEffect(() => {
    if (cartItems.length === 0) return;
    const interval = setInterval(refreshCartPrices, 60000);
    return () => clearInterval(interval);
  }, [cartItems.length, refreshCartPrices]);

  // ── API del carrito ─────────────────────────────────────
  // addToCart: agregar producto. Soporta variantes por color y nota.
  // Si ya existe un item con el MISMO producto + color + nota, suma cantidad.
  // Si es diferente (otra nota, otro color), crea una nueva línea.
  const addToCart = (product, quantity = 1, color = null, note = '') => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.color === color && item.note === note);
      
      if (existing) {
        if (existing.quantity + quantity > MAX_CART_QUANTITY) {
          toast.error(`Límite máximo por producto: ${MAX_CART_QUANTITY} unidades`);
          return prev;
        }
        return prev.map(item => 
          item.id === existing.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      if (quantity > MAX_CART_QUANTITY) {
        toast.error(`Límite máximo por producto: ${MAX_CART_QUANTITY} unidades`);
        return prev;
      }

      if (prev.length >= MAX_TOTAL_ITEMS) {
        toast.error(`Límite máximo en el carrito: ${MAX_TOTAL_ITEMS} productos diferentes`);
        return prev;
      }

      // crypto.randomUUID() para IDs de línea del carrito.
      // Son IDs locales, no van a la DB como primary keys.
      const generateId = () => crypto.randomUUID();
      
      return [...prev, { id: generateId(), product, quantity: quantity, color, note }];
    });
    
    // Registrar timestamp de última actividad (para la expiración de 7 días)
    localStorage.setItem('pages_cart_timestamp', Date.now().toString());

    toast.success(
      <div>
        <p className="font-bold">{quantity}x {product.name} agregado</p>
        <p className="text-xs opacity-90">Disponible en tu carrito por 24 horas</p>
      </div>, 
      { id: 'cart-add-toast', icon: '🛍️' }
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    if (quantity > MAX_CART_QUANTITY) {
      toast.error(`Límite máximo por producto es ${MAX_CART_QUANTITY} unidades`);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: quantity };
      }
      return item;
    }));
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Precios se consideran stale si: 3+ fallos consecutivos O
  // más de 5 minutos sin un refresh exitoso. En ese caso
  // CartDrawer muestra un warning al usuario.
  const arePricesStale = consecutiveRefreshFailures >= 3 || (Date.now() - lastSuccessfulRefresh > 5 * 60 * 1000);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, isCartOpen, setIsCartOpen, refreshCartPrices, isRefreshingPrices,
      arePricesStale, consecutiveRefreshFailures
    }}>
      {children}
    </CartContext.Provider>
  );
};
