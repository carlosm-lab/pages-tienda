// ──────────────────────────────────────────────────────────────
// APP — ROUTING Y LAYOUT PRINCIPAL
// ──────────────────────────────────────────────────────────────
// Define la estructura de rutas de toda la aplicación.
//
// ESTRUCTURA:
//   /admin/*  → Panel de administración (protegido por AdminRoute)
//   /*        → Tienda pública (envuelta en ShopLayout)
//
// LAZY LOADING:
// Todas las páginas se cargan con React.lazy + Suspense para
// que el bundle inicial sea pequeño (~100KB). Cada página se
// descarga solo cuando el usuario navega a ella.
//
// ERROR BOUNDARIES:
// Cada ruta tiene su propio ErrorBoundary. Si una página crashea,
// solo esa ruta muestra el error — el resto de la app sigue
// funcionando. Esto es crítico para que un error en el admin
// no tumbe la tienda pública y viceversa.
//
// COMPONENTES GLOBALES:
//   - CookieBanner: banner de cookies (siempre visible hasta aceptar)
//   - ScrollToTop: resetea scroll al navegar entre rutas
//   - Toaster: notificaciones toast (react-hot-toast)
// ──────────────────────────────────────────────────────────────
import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState, useCallback, useRef } from 'react';

import ErrorBoundary from './components/ErrorBoundary';
import { Helmet } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { BASE_URL } from '@/config/constants';

// ── Páginas públicas (lazy) ──────────────────────────────
const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ── Panel admin (lazy) ───────────────────────────────────
// Separados del bundle público. Un usuario normal nunca descarga
// este código a menos que tenga rol admin.
const AdminRoute = lazy(() => import('./components/AdminRoute'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const MessagesPage = lazy(() => import('./pages/admin/MessagesPage'));
const FavoritesPage = lazy(() => import('./pages/admin/FavoritesPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const DocumentationPage = lazy(() => import('./pages/admin/DocumentationPage'));

// Spinners de carga diferenciados: admin tiene fondo oscuro, público es neutral
const AdminLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

// Resetear scroll al cambiar de ruta — sin esto, al navegar de
// un producto largo al catálogo, la página aparece a media página.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

import ShopLayout from './components/layout/ShopLayout';
import CookieBanner from './components/ui/CookieBanner';

// ── Easter Egg: Carlos/Carlitos ───────────────────────────
// Si alguien escribe "carlos" o "carlitos" (case-insensitive)
// en cualquier parte de la app, aparece un modal divertido.
function CarlosEasterEgg() {
  const [show, setShow] = useState(false);
  const bufferRef = useRef('');
  const timerRef = useRef(null);

  useEffect(() => {
    const handleGlobalInput = (e) => {
      if (e.target && e.target.value) {
        const val = e.target.value.toLowerCase();
        if (/(c|k)arl(os|itos)/.test(val)) {
          setShow(true);
        }
      }
    };
    
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey || !e.key || e.key.length > 1) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { bufferRef.current = ''; }, 2000);

      bufferRef.current += e.key.toLowerCase();

      if (/(c|k)arl(os|itos)/.test(bufferRef.current)) {
        bufferRef.current = '';
        setShow(true);
      }

      if (bufferRef.current.length > 30) {
        bufferRef.current = bufferRef.current.slice(-15);
      }
    };

    window.addEventListener('input', handleGlobalInput);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('input', handleGlobalInput);
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={() => setShow(false)}
    >
      <div
        className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 max-w-sm w-full text-center"
        style={{ animation: 'carlos-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-lg leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* Emoji */}
        <div className="text-5xl mb-4" style={{ animation: 'carlos-wave 1.5s ease-in-out infinite' }}>👋</div>

        {/* Message */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
          ¿Hola, me invocabas?
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-5">
          Escribemeee :3
        </p>

        {/* Phone number as WhatsApp link */}
        <a
          href="https://wa.me/50373294499"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-green-500/25"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.616l4.536-1.468A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.322-.724-6.016-1.955l-.42-.312-2.694.872.89-2.65-.342-.544A9.936 9.936 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
          </svg>
          +503 7329 4499
        </a>
      </div>

      {/* Inline keyframes for the easter egg animations */}
      <style>{`
        @keyframes carlos-bounce {
          0% { opacity: 0; transform: scale(0.3) translateY(40px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes carlos-wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          50% { transform: rotate(-10deg); }
          75% { transform: rotate(15deg); }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <CookieBanner />
      <CarlosEasterEgg />
      <ScrollToTop />
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 20px',
          },
          success: {
            iconTheme: {
              primary: '#fff',
              secondary: '#1DA851', // Verde WhatsApp / marca
            },
          },
        }}
      />
      <Routes>
        {/* ── Rutas Admin ────────────────────────────────── */}
        {/* AdminRoute verifica isAdmin + loading antes de renderizar */}
        <Route path="/admin" element={
          <ErrorBoundary>
            <Suspense fallback={<AdminLoading />}>
              <AdminRoute><AdminLayout /></AdminRoute>
            </Suspense>
          </ErrorBoundary>
        }>
          <Route index element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
          <Route path="products" element={<ErrorBoundary><ProductsPage /></ErrorBoundary>} />
          <Route path="categories" element={<ErrorBoundary><CategoriesPage /></ErrorBoundary>} />
          <Route path="messages" element={<ErrorBoundary><MessagesPage /></ErrorBoundary>} />
          <Route path="favorites" element={<ErrorBoundary><FavoritesPage /></ErrorBoundary>} />
          <Route path="settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
          <Route path="documentacion" element={<ErrorBoundary><DocumentationPage /></ErrorBoundary>} />
        </Route>

        {/* ── Rutas Públicas (tienda) ────────────────────── */}
        {/* Cada ruta está envuelta en ShopLayout (Navbar + Footer + CartDrawer) */}
        <Route path="/" element={<ErrorBoundary><Suspense fallback={<PageLoading />}><ShopLayout><HomePage /></ShopLayout></Suspense></ErrorBoundary>} />
        <Route path="/catalog" element={<ErrorBoundary><Suspense fallback={<PageLoading />}><ShopLayout><CatalogPage /></ShopLayout></Suspense></ErrorBoundary>} />
        <Route path="/product/:slug" element={<ErrorBoundary><Suspense fallback={<PageLoading />}><ShopLayout><ProductDetailPage /></ShopLayout></Suspense></ErrorBoundary>} />
        <Route path="/contact" element={<ErrorBoundary><Suspense fallback={<PageLoading />}><ShopLayout><ContactPage /></ShopLayout></Suspense></ErrorBoundary>} />
        <Route path="/terms" element={<ErrorBoundary><Suspense fallback={<PageLoading />}><ShopLayout><TermsPage /></ShopLayout></Suspense></ErrorBoundary>} />
        <Route path="/privacy" element={<ErrorBoundary><Suspense fallback={<PageLoading />}><ShopLayout><PrivacyPage /></ShopLayout></Suspense></ErrorBoundary>} />
        <Route path="*" element={<ErrorBoundary><Suspense fallback={<PageLoading />}><ShopLayout><NotFoundPage /></ShopLayout></Suspense></ErrorBoundary>} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
