// ──────────────────────────────────────────────────────────────
// PUNTO DE ENTRADA — main.jsx
// ──────────────────────────────────────────────────────────────
// Monta la app React en el DOM. El orden de los providers es
// importante porque define qué contextos pueden consumir otros:
//
//   HelmetProvider     → SEO (react-helmet-async)
//   BrowserRouter      → Routing (react-router-dom)
//   AuthProvider       → Autenticación (Supabase Auth)
//   ConfirmProvider    → Diálogos de confirmación globales
//   SettingsProvider   → Config de tienda (Realtime)
//   CartProvider       → Carrito (depende de Auth)
//   FavoritesProvider  → Favoritos (depende de Auth)
//   App                → Rutas y UI
//
// AuthProvider DEBE estar antes de CartProvider y FavoritesProvider
// porque ambos usan useAuth() internamente.
// ConfirmProvider va antes que Settings/Cart porque el admin
// puede necesitar confirmaciones al editar settings.
//
// StrictMode: habilitado. React renderiza componentes 2 veces
// en desarrollo para detectar side effects. No afecta producción.
// ──────────────────────────────────────────────────────────────
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { ConfirmProvider } from './context/ConfirmContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ConfirmProvider>
            <SettingsProvider>
              <CartProvider>
                <FavoritesProvider>
                  <App />
                </FavoritesProvider>
              </CartProvider>
            </SettingsProvider>
          </ConfirmProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
