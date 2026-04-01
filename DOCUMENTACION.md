# Documentación Técnica — PaGe's Detalles & Más

> **Versión:** 2.0 — Marzo 2026  
> **Nombre interno del proyecto:** `pages` (alias: Antigravity)  
> **Stack:** React 19.0.0 · Vite 6.2.0 · Tailwind CSS v4 · Supabase JS 2.49.4  
> **Deploy:** Vercel (SPA estática)  
> **Modelo de negocio:** Catálogo visual sin stock · Cierre de venta vía WhatsApp  
> **Idioma de la interfaz:** Español (El Salvador)  
> **Moneda:** USD (`en-US`, `$`)

---

## Índice

1. [Guía de Inicio Rápido](#1-guía-de-inicio-rápido)
2. [Arquitectura General](#2-arquitectura-general)
3. [Modelo de Negocio](#3-modelo-de-negocio)
4. [Variables de Entorno](#4-variables-de-entorno)
5. [Estructura del Proyecto](#5-estructura-del-proyecto)
6. [Sistema de Diseño](#6-sistema-de-diseño)
7. [Flujo de Datos](#7-flujo-de-datos)
8. [Seguridad](#8-seguridad)
9. [Servicios y Hooks](#9-servicios-y-hooks)
10. [Contextos React](#10-contextos-react)
11. [Componentes — Catálogo Completo](#11-componentes--catálogo-completo)
12. [Páginas Públicas](#12-páginas-públicas)
13. [Panel de Administración](#13-panel-de-administración)
14. [SEO y Datos Estructurados](#14-seo-y-datos-estructurados)
15. [Deploy, CI/CD y Headers](#15-deploy-cicd-y-headers)
16. [Reglas de Negocio Críticas](#16-reglas-de-negocio-críticas)
17. [Troubleshooting](#17-troubleshooting)
18. [Glosario de Remediaciones](#18-glosario-de-remediaciones)
19. [Notas para el Desarrollador](#19-notas-para-el-desarrollador)

---

## 1. Guía de Inicio Rápido

### Requisitos

- Node.js 18+, npm 9+
- Cuenta de Supabase con proyecto configurado (Auth, Database, Storage, Realtime)
- Cuenta de Cloudflare Turnstile (captcha del formulario de contacto)
- Cuenta de Vercel (deploy)

### Setup local

```bash
git clone <repo-url> pages && cd pages
npm install
cp .env.example .env   # Editar con credenciales reales (ver sección 4)
npm run dev             # Servidor de desarrollo en localhost:5173
```

### Build y preview

```bash
npm run build    # Genera /dist (Vite, ~2s build)
npm run preview  # Preview local del bundle de producción
```

### Tests

```bash
npm run test         # Vitest — unit tests
npx cypress open     # E2E interactivo
npx playwright test  # E2E headless (alternativo)
```

### Dependencias clave (package.json)

| Paquete | Versión | Rol |
|---|---|---|
| `react` / `react-dom` | 19.0.0 | UI framework |
| `react-router-dom` | 7.1.5 | Routing SPA |
| `@supabase/supabase-js` | 2.49.4 | Backend-as-a-Service |
| `framer-motion` | 12.4.7 | Animaciones declarativas |
| `react-helmet-async` | 2.0.5 | SEO meta tags |
| `react-hot-toast` | 2.5.2 | Notificaciones toast |
| `dompurify` | 3.2.4 | Sanitización XSS |
| `@tailwindcss/vite` | 4.0.9 | Tailwind v4 (plugin Vite) |

---

## 2. Arquitectura General

```
┌──────────────────────────────────────────────────────────────────┐
│                        VERCEL (CDN + Edge)                        │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  index.html   │  │  vendor.js   │  │   app.[hash].js        │ │
│  │  (SPA entry)  │  │  (React,     │  │   (Lazy page chunks)   │ │
│  │              │  │  Supabase,   │  │   modules.[hash].js    │ │
│  │              │  │  Motion)     │  │   ui.[hash].js         │ │
│  └──────┬───────┘  └──────────────┘  └────────────────────────┘ │
│         │           Cache: immutable, 1 año                       │
└─────────┼─────────────────────────────────────────────────────────┘
          │ HTTPS (anon key)
          ▼
┌──────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                  │
│                                                                   │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐  │
│  │   Auth   │  │    RLS    │  │  Realtime  │  │   Storage    │  │
│  │  Google  │  │ PostgreSQL│  │  Settings  │  │  product-    │  │
│  │  OAuth   │  │ policies  │  │  changes   │  │  images      │  │
│  └──────────┘  └───────────┘  └───────────┘  └──────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Tablas: products · categories · profiles · user_favorites    ││
│  │         user_carts · contact_messages · store_settings       ││
│  │         system_logs                                          ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  RPC: get_dashboard_data · generate_whatsapp_message             │
└──────────────────────────────────────────────────────────────────┘
```

### Principios arquitectónicos

| Principio | Implementación |
|---|---|
| **SPA pura** | React + react-router-dom v7. Sin SSR, sin ISR. |
| **Lazy Loading** | Todas las páginas via `React.lazy()` + `Suspense` |
| **Chunk Splitting** | `manualChunks` en vite.config: `vendor` / `ui` / `modules` |
| **Error Isolation** | `ErrorBoundary` separado para admin y público |
| **Offline-first cart** | `localStorage` como fuente primaria, Supabase como backup |
| **Guest-first** | Toda la experiencia funciona sin login; login desbloquea persistencia |

---

## 3. Modelo de Negocio

**Este NO es un ecommerce convencional.** Diferencias fundamentales:

| Concepto | Ecommerce Tradicional | PaGe's |
|---|---|---|
| **Stock** | Gestión de inventario | Sin stock — catálogo puro por pedido |
| **Pagos** | Stripe/PayPal/etc | No hay pasarela de pagos |
| **Checkout** | Flujo multi-paso | WhatsApp (1 click → `wa.me`) |
| **Carrito** | Server-side / DB | `localStorage` (guest-first) |
| **Precios** | Contrato con payment gateway | Informativos — se confirman vía WhatsApp |
| **Disponibilidad** | Campo `stock` en DB | Siempre disponible (Schema.org: `InStock`) |

### Flujo de compra completo

```
Usuario navega catálogo (sin login)
    ↓
Agrega productos al carrito (localStorage inmediato)
    ↓
Abre CartDrawer → revisa items → "Enviar pedido por WhatsApp"
    ↓
Sistema revalida precios contra Supabase (60s cache)
    ↓
Se genera mensaje pre-formateado via RPC `generate_whatsapp_message`
    ↓
Se construye URL: wa.me/{WHATSAPP_NUMBER}?text={mensaje_codificado}
    ↓
WhatsApp se abre → usuario envía mensaje a la administradora
    ↓
Administradora confirma disponibilidad y precio final
    ↓
Cierre de venta por WhatsApp (fuera del sistema)
```

**Límite técnico:** La URL de WhatsApp tiene un tope práctico de ~2000 caracteres. El sistema aplica truncamiento inteligente: elimina productos del final del carrito hasta que el mensaje quepa, y añade `"...y X productos más"`.

---

## 4. Variables de Entorno

| Variable | Requerida | Descripción | Ejemplo |
|---|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Anon key pública | `eyJhbG...` |
| `VITE_WHATSAPP_NUMBER` | ✅ | Número con código de país | `50364414829` |
| `VITE_TURNSTILE_SITE_KEY` | ✅ | Site key de Cloudflare Turnstile | `0x4AAAA...` |
| `VITE_CONTACT_EMAIL` | ❌ | Email de contacto (fallback hardcoded) | — |
| `VITE_BASE_URL` | ❌ | URL base del sitio | `https://pages.vercel.app` |

> **Nota:** Todas las variables con prefijo `VITE_` se exponen al bundle del cliente. Nunca poner secrets aquí. En producción se configuran en Vercel Dashboard.

---

## 5. Estructura del Proyecto

```
pages/
├── public/
│   ├── logo.png                 # Logo para Schema.org y OG
│   └── og-image.png             # Imagen Open Graph por defecto
├── src/
│   ├── config/
│   │   └── constants.js         # Constantes de negocio globales
│   ├── lib/
│   │   └── supabaseClient.js    # Singleton del cliente Supabase
│   ├── utils/
│   │   ├── formatPrice.js       # Intl.NumberFormat singleton (USD/en-US)
│   │   ├── logger.js            # Logger → console (dev) + system_logs (prod)
│   │   ├── sanitize.js          # DOMPurify + URL validator + UUID validator
│   │   ├── whatsapp.js          # Constructor de URLs wa.me con truncamiento
│   │   ├── supabaseRetry.js     # Retry con backoff exponencial (1s, 2s, fail)
│   │   ├── productUtils.js      # Lógica de estados de ofertas (activa/programada/expirada)
│   │   ├── slug.js              # Generador de slugs (NFD, emojis, fallback timestamp)
│   │   └── storage.js           # Extracción segura de filenames de Supabase Storage
│   ├── services/
│   │   ├── productService.js    # Query builder de productos (filtros, paginación, seguridad)
│   │   └── categoryService.js   # Query de categorías (select explícito, order by name)
│   ├── hooks/
│   │   ├── useProducts.js       # Lista paginada + detalle individual + AbortController
│   │   ├── useCategories.js     # Caché module-level con TTL 10min + invalidación por evento
│   │   ├── useDebounce.js       # Debounce genérico de valores React
│   │   ├── useTheme.js          # Dark mode con localStorage + migración de keys legacy
│   │   ├── useBodyScrollLock.js # Bloqueo de scroll con contador global para modales anidados
│   │   └── useModal.js          # Escape + overlay click + focus básico
│   ├── context/
│   │   ├── AuthContext.jsx      # Sesión + perfil + roles + auth modal contextual
│   │   ├── CartContext.jsx      # Carrito localStorage + Supabase sync + revalidación
│   │   ├── FavoritesContext.jsx # Favoritos dual (local + DB) con merge al login
│   │   ├── SettingsContext.jsx  # Config de tienda con Realtime subscription
│   │   └── ConfirmContext.jsx   # Diálogos de confirmación Promise-based
│   ├── components/
│   │   ├── layout/
│   │   │   └── ShopLayout.jsx   # Wrapper: Navbar + CartDrawer + Footer + ErrorBoundary
│   │   ├── ui/
│   │   │   ├── ThemeToggle.jsx  # Botón dark/light con Material Symbols
│   │   │   ├── UserAvatar.jsx   # Avatar con fallback a ui-avatars.com
│   │   │   └── CookieBanner.jsx # Banner GDPR con Framer Motion spring animation
│   │   ├── admin/               # 14 componentes del panel administrativo
│   │   ├── Navbar.jsx           # Navegación principal (desktop sticky + mobile bottom bar)
│   │   ├── CartDrawer.jsx       # Drawer lateral derecho del carrito (363 líneas)
│   │   ├── ProductCard.jsx      # Card de producto con React.memo
│   │   ├── LoginModal.jsx       # Modal de login con contexto dinámico
│   │   ├── FavoritesModal.jsx   # Modal de favoritos con limpieza de IDs inválidos
│   │   ├── SearchModal.jsx      # Búsqueda real-time con sugerencias populares
│   │   ├── ShareModal.jsx       # Modal de compartir (clipboard + WhatsApp + native share)
│   │   ├── FilterSidebar.jsx    # Filtros desktop (categoría + promociones)
│   │   ├── MobileFilterDrawer.jsx # Filtros mobile (drawer inferior con sort)
│   │   ├── OfferCountdown.jsx   # Countdown de ofertas con tick subscription global
│   │   ├── StructuredData.jsx   # Generador JSON-LD (Organization + Product)
│   │   ├── SocialIcons.jsx      # Iconos sociales (solid + glass variants)
│   │   ├── ConfirmDialog.jsx    # Dialog de confirmación (danger/warning/info)
│   │   ├── ErrorBoundary.jsx    # Error boundary con UI de recuperación
│   │   ├── AdminRoute.jsx       # Guard de rutas admin
│   │   ├── Footer.jsx           # Footer con links legales y sociales
│   │   └── Logo.jsx             # Logo responsivo con icono + texto
│   ├── pages/
│   │   ├── HomePage.jsx         # Landing: hero + categorías + historia + destacados
│   │   ├── CatalogPage.jsx      # Catálogo: filtros URL-synced + paginación + grid
│   │   ├── ProductDetailPage.jsx # Detalle: galería + notas + relacionados + Schema
│   │   ├── ContactPage.jsx      # Contacto: Turnstile + honeypot + rate limiting
│   │   ├── NotFoundPage.jsx     # 404 con noindex
│   │   ├── PrivacyPage.jsx      # Política de privacidad
│   │   ├── TermsPage.jsx        # Términos y condiciones
│   │   └── admin/
│   │       ├── AdminLayout.jsx  # Layout admin: sidebar + header + footer bar
│   │       ├── DashboardPage.jsx # Dashboard con RPC get_dashboard_data
│   │       ├── ProductsPage.jsx # CRUD productos + eliminación masiva + storage cleanup
│   │       ├── CategoriesPage.jsx # CRUD categorías con iconos
│   │       ├── MessagesPage.jsx # Mensajes de contacto (leído/no leído)
│   │       ├── FavoritesPage.jsx # Rankings de favoritos
│   │       └── SettingsPage.jsx # Config tienda + gestión de roles
│   ├── types/
│   │   └── database.types.ts   # Tipos TypeScript generados de Supabase
│   ├── App.jsx                  # Routing principal (público + admin)
│   ├── main.jsx                 # Entry point + jerarquía de providers
│   └── index.css                # Tailwind v4 + custom tokens + keyframes
├── vercel.json                  # Headers de seguridad + cache rules
├── vite.config.js               # Aliases, optimización, chunk splitting
└── package.json                 # Dependencias y scripts
```

---

## 6. Sistema de Diseño

### 6.1 Tipografía

| Fuente | Uso | Carga |
|---|---|---|
| **Manrope** (400, 500, 700, 800) | Body text, UI elements | Google Fonts via `<link>` en `index.html` |
| **Playfair Display** (700, 800, 900) | Títulos hero, headings decorativos | Google Fonts via `<link>` en `index.html` |
| **Material Symbols Outlined** | Iconografía (400 weight, FILL 0) | Google Fonts, optical size 24px |

Configuración Tailwind v4 (`index.css`):
```css
--font-sans: 'Manrope', system-ui, sans-serif;
--font-serif: 'Playfair Display', Georgia, serif;
```

### 6.2 Paleta de Colores

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#d41111` | CTAs, badges de oferta, acentos principales |
| `--color-background-light` | `#fafafa` | Fondo general modo claro |
| `--color-background-dark` | `#0a0a0a` | Fondo general modo oscuro |
| Slate scale | Tailwind defaults | Textos, bordes, superficies neutras |

### 6.3 Escala Fluida de Espaciado

Definidas con `clamp()` para adaptación fluida entre breakpoints:

```css
--space-xs:  clamp(0.25rem, 0.5vw, 0.5rem);     /* 4-8px */
--space-sm:  clamp(0.5rem, 1vw, 0.75rem);        /* 8-12px */
--space-md:  clamp(0.75rem, 1.5vw, 1rem);        /* 12-16px */
--space-lg:  clamp(1rem, 2vw, 1.5rem);            /* 16-24px */
--space-xl:  clamp(1.25rem, 3vw, 2rem);           /* 20-32px */
--space-2xl: clamp(1.5rem, 4vw, 3rem);            /* 24-48px */
--space-3xl: clamp(2rem, 6vw, 4rem);              /* 32-64px */
```

### 6.4 Escala Fluida de Tipografía

```css
--text-xs:  clamp(0.6875rem, 0.8vw, 0.75rem);     /* 11-12px */
--text-sm:  clamp(0.8125rem, 1vw, 0.875rem);       /* 13-14px */
--text-base: clamp(0.9375rem, 1.2vw, 1rem);        /* 15-16px */
--text-lg:  clamp(1.0625rem, 1.5vw, 1.125rem);     /* 17-18px */
--text-xl:  clamp(1.125rem, 1.8vw, 1.25rem);       /* 18-20px */
--text-3xl: clamp(1.5rem, 3vw, 2rem);              /* 24-32px */
--text-4xl: clamp(1.875rem, 4vw, 2.5rem);          /* 30-40px */
--text-5xl: clamp(2.25rem, 5vw, 3rem);             /* 36-48px */
--text-6xl: clamp(2.75rem, 6vw, 3.75rem);          /* 44-60px */
```

### 6.5 Alturas y Sombras

```css
--navbar-height: clamp(3.5rem, 8vw, 4.25rem);     /* 56-68px */
--shadow-360: 0 1px 3px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.04);
```

### 6.6 Animaciones Personalizadas

| Keyframe | Duración | Uso |
|---|---|---|
| `fadeInUp` | 0.4s ease-out | Entrada de cards de producto |
| `slideUp` | 0.3s ease-out | Entrada de modales |
| `shimmer` | 1.5s infinite | Skeletons de carga |
| `pulseSubtle` | 2s infinite | Badges y puntos de notificación |
| `countdownPulse` | 1s infinite | Dígitos de countdown de ofertas |

### 6.7 Dark Mode

- **Toggle:** Componente `ThemeToggle` usa iconos `dark_mode` / `light_mode`
- **Persistencia:** `localStorage` key `pages_theme` (valores: `'dark'` | ausente)
- **Migración:** El hook `useTheme` detecta y migra la key legacy `theme-preference`
- **Aplicación:** Clase `dark` en `<html>` → Tailwind `dark:` variants

---

## 7. Flujo de Datos

### 7.1 Carrito (CartContext)

```
                   ┌──────────────────────┐
                   │    localStorage      │ ← FUENTE DE VERDAD
                   │    (pages_cart)       │
                   │    JSON: [{id, name, │
                   │     price, qty, ...}]│
                   └─────────┬────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
           addToCart    updateQty    removeFromCart
                │            │            │
                └────────────┬────────────┘
                             │
                      debounce(1500ms)
                             │
                             ▼
                   ┌──────────────────────┐
                   │   Supabase sync      │ ← Solo con usuario logueado
                   │   (user_carts)       │   Usa withSupabaseRetry()
                   └──────────────────────┘
                             │
                      cada 60 segundos
                      (si tab visible)
                             │
                             ▼
                   ┌──────────────────────┐
                   │  refreshCartPrices   │ ← Revalidación de precios
                   │  (query products)    │   Elimina items desactivados
                   └──────────────────────┘
```

**Expiración:** El carrito se auto-limpia tras 7 días de inactividad (`pages_cart_timestamp`). Se muestra notificación al usuario.

**Multi-tab:** Sincronización entre pestañas vía `StorageEvent` en `window`. Cada tab escucha cambios en `pages_cart` y actualiza su estado React.

**Guest-first:** Al hacer login: si el carrito local tiene items → se sube a DB (sobreescribe). Si está vacío → se carga desde DB.

**Límites duros:**
- `MAX_CART_QUANTITY`: 50 unidades por producto
- `MAX_CART_ITEMS`: 50 items distintos
- Razón: el mensaje de WhatsApp tiene límite de ~2000 chars en URL

**Precios stale (HIGH-004):** Si la revalidación falla 3+ veces, o pasan 5+ minutos sin refresh exitoso, `arePricesStale` se activa y el CartDrawer muestra un warning visual.

### 7.2 Autenticación (AuthContext)

```
┌────────────────────────────────────────────────────────────────┐
│  sessionStorage cache (pages_user, pages_profile)              │
│  TTL: 1 hora (pages_auth_cache_time)                           │
└──────────────────────────┬─────────────────────────────────────┘
                           │ (hidratación al refresh de página)
                           ▼
┌────────────────────────────────────────────────────────────────┐
│  Effect 1: supabase.auth.getSession()                          │
│            + onAuthStateChange (sync-only, NO operaciones async)│
└──────────────────────────┬─────────────────────────────────────┘
                           │ (user.id cambia)
                           ▼
┌────────────────────────────────────────────────────────────────┐
│  Effect 2: fetchProfile(userId) — DESACOPLADO del callback     │
│            → supabase.from('profiles').select('id, role')      │
│            → Guard con currentUserIdRef (race condition)       │
│            → Si no existe perfil: se crea con role='user'      │
└────────────────────────────────────────────────────────────────┘
```

> **⚠️ DECISIÓN CRÍTICA:** El fetch del perfil está desacoplado de `onAuthStateChange` porque Supabase SDK puede causar deadlocks si se ejecutan operaciones async dentro del callback. **NUNCA mover el fetch del perfil adentro del callback.**

### 7.3 Favoritos (FavoritesContext)

```
localStorage (pages_favorites: ["uuid1","uuid2",...])
         ↕ (sync bidireccional)
Supabase (user_favorites: {user_id, product_id})
         │
         │ Al login:
         │ 1. Cargar IDs locales
         │ 2. Cargar IDs de DB
         │ 3. Merge (Set unión, sin duplicados)
         │ 4. Insert faltantes en DB (los que estaban solo en local)
         ▼
   Set completo en estado React
```

- **Optimización:** `useMemo(new Set(favorites))` para lookups O(1) en `isFavorite()`
- **Restricción (HIGH-ST01):** `toggleFavorite()` rechaza silenciosamente si no hay usuario autenticado
- **Limpieza:** `FavoritesModal` detecta IDs que ya no corresponden a productos activos y los elimina

### 7.4 Settings (SettingsContext — Realtime)

```
Supabase store_settings (tabla singleton, 1 fila)
          │
          ├── Initial fetch al montar SettingsProvider
          │
          └── Realtime subscription (postgres_changes, UPDATE)
                 │
                 ├── Validación de payload (MED-005): verifica que new tenga id
                 └── Debounce 500ms (MED-006): evita cascada de re-renders
                          │
                          ▼
                    setSettings(payload.new)
```

---

## 8. Seguridad

### 8.1 Capas de defensa

| Capa | Mecanismo | Ubicación | Detalle |
|---|---|---|---|
| **RLS** | Políticas PostgreSQL | Supabase server | Toda tabla tiene RLS habilitado. `anon` solo lee datos públicos. |
| **Input Sanitization** | `DOMPurify` (`ALLOWED_TAGS: []`) | `utils/sanitize.js` | Elimina TODO el HTML, no permite ni `<b>`. |
| **URL Validation** | Regex de protocolos peligrosos | `utils/sanitize.js` | Bloquea `javascript:`, `data:`, `vbscript:` (case-insensitive). |
| **UUID Validation** | Regex UUID v4 estricto | `utils/sanitize.js` | Valida antes de enviar a Supabase queries con `.in()`. |
| **CSP** | Content-Security-Policy header | `vercel.json` | Whitelist estricta de dominios permitidos. |
| **CAPTCHA** | Cloudflare Turnstile | `ContactPage.jsx` | Widget invisible + verificación server-side del token. |
| **Honeypot** | Campo oculto `website` | `ContactPage.jsx` | Si tiene valor → bot detectado, submit rechazado silenciosamente. |
| **Rate Limiting** | `last_contact_sent` en localStorage | `ContactPage.jsx` | Mínimo 60 segundos entre envíos del formulario de contacto. |
| **SQL Wildcard Escape** | `.replace(/[%_\\]/g, ...)` | `productService.js` | Escapea `%`, `_`, `\` en búsquedas `.ilike()`. |
| **DoS Filter** | Límite 100 UUIDs en `.in()` | `productService.js` | Previene queries excesivamente grandes en filtros de favoritos. |
| **Storage URL** | Validación hostname `.supabase.co` | `utils/storage.js` | Solo extrae filenames de URLs que son de Supabase. |
| **EXIF Stripping** | Canvas re-render → WebP | `ImageUploader.jsx` | Elimina metadata GPS/EXIF al comprimir imágenes. |

### 8.2 Modelo de autenticación

- **Proveedor único:** Google OAuth (no email/password)
- **Roles:** `user` (default) y `admin` (asignado manualmente en `profiles.role`)
- **Verificación dual:** Client-side (`AdminRoute` verifica `isAdmin`) + Server-side (RLS: solo `role='admin'` puede escribir)
- **Auth modal contextual:** Intercepta acciones protegidas (carrito, favoritos, contacto) mostrando un modal con mensaje contextual

### 8.3 CSP (Content Security Policy)

```
default-src 'self';
script-src 'self' https://challenges.cloudflare.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com
        https://images.unsplash.com https://lh3.googleusercontent.com;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://*.supabase.co wss://*.supabase.co
            https://challenges.cloudflare.com;
frame-src https://challenges.cloudflare.com;
```

### 8.4 Headers adicionales (vercel.json)

| Header | Valor |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Cache-Control` (assets) | `public, max-age=31536000, immutable` |
| `Cache-Control` (HTML) | `public, max-age=0, must-revalidate` |

---

## 9. Servicios y Hooks

### 9.1 productService.js

| Método | Descripción |
|---|---|
| `getProductsQuery(options)` | Construye query Supabase filtrada (**no la ejecuta**). Soporta: categoría, búsqueda texto, rango de precios, solo ofertas activas, solo favoritos (con UUID validation + limit 100), paginación, ordenamiento múltiple. Siempre filtra `is_active=true`. Usa `PRODUCT_SELECT_COLUMNS` (nunca `*`). |
| `getProductBySlug(slug)` | Obtiene un producto individual por slug. Solo retorna productos activos. |

### 9.2 categoryService.js

| Método | Descripción |
|---|---|
| `getCategories()` | Lista todas las categorías con select explícito: `id, name, slug, created_at, icon, image_url, description`. Ordenadas por nombre. |

### 9.3 Hooks principales

| Hook | Archivo | Descripción |
|---|---|---|
| `useProducts(options)` | `useProducts.js` | Lista paginada con filtros. Usa `AbortController` (MED-002) para cancelar requests obsoletos. Estabiliza arrays con `useRef` para evitar re-renders infinitos. Retorna `{ products, loading, error, refetch, totalCount }`. |
| `useProduct(slug)` | `useProducts.js` | Producto individual por slug. Retorna `{ product, loading, error, refetch }`. |
| `useCategories()` | `useCategories.js` | Caché **per-tab a nivel de módulo** (no React state). TTL 10 minutos. Invalidación manual via `window.dispatchEvent('categories-updated')`. |
| `useDebounce(value, delay)` | `useDebounce.js` | Debounce genérico. Default 300ms. Usado para búsqueda en SearchModal y filtros en admin. |
| `useTheme()` | `useTheme.js` | Retorna `{ isDarkMode, toggleTheme }`. Persiste en `pages_theme`. Migra key legacy `theme-preference`. |
| `useBodyScrollLock(isLocked)` | `useBodyScrollLock.js` | Contador global (module-level `lockCount`) que permite modales anidados. Solo aplica `overflow:hidden` al `<body>` cuando `lockCount > 0`. |
| `useModal({ isOpen, onClose })` | `useModal.js` | Provee `modalRef` con manejo de Escape y click en overlay. Focus trap básico (MED-012: no maneja Tab cycling). |

---

## 10. Contextos React

### Orden de providers (main.jsx)

```
HelmetProvider
  └→ BrowserRouter
       └→ AuthProvider          ← DEBE estar primero (Cart y Favorites dependen de él)
            └→ ConfirmProvider
                 └→ SettingsProvider
                      └→ CartProvider
                           └→ FavoritesProvider
                                └→ App
```

> **Regla inquebrantable:** `AuthProvider` DEBE envolver a `CartProvider` y `FavoritesProvider` porque ambos usan `useAuth()`.

### AuthContext

| Propiedad | Tipo | Descripción |
|---|---|---|
| `user` | `object \| null` | Objeto de usuario de Supabase Auth |
| `session` | `object \| null` | Sesión activa |
| `profile` | `{ id, role }` | Perfil de la tabla `profiles` |
| `isAdmin` | `boolean` | `profile?.role === 'admin'` |
| `loading` | `boolean` | Combina auth loading + profile loading |
| `signInWithGoogle()` | `function` | Inicia OAuth con Google |
| `signOut()` | `function` | Cierra sesión, limpia caches (LOW-002) |
| `showAuthModal(context)` | `function` | Muestra modal de login contextual |
| `hideAuthModal()` | `function` | Cierra el modal de login |

**Cache:** `sessionStorage` con TTL de 1 hora. Keys: `pages_user`, `pages_profile`, `pages_auth_cache_time`.

### CartContext

| Propiedad | Tipo | Descripción |
|---|---|---|
| `cartItems` | `array` | Items del carrito (fuente: localStorage) |
| `isCartOpen` | `boolean` | Estado del drawer |
| `isRefreshingPrices` | `boolean` | Si hay revalidación en curso |
| `arePricesStale` | `boolean` | Si los precios están desactualizados (HIGH-004) |
| `addToCart(product, qty)` | `function` | Añade o incrementa item |
| `removeFromCart(productId)` | `function` | Elimina item del carrito |
| `updateQuantity(productId, delta)` | `function` | Ajusta cantidad (+/-) |
| `clearCart()` | `function` | Vacía el carrito |
| `refreshCartPrices()` | `function` | Fuerza revalidación de precios |

### FavoritesContext

| Propiedad | Tipo | Descripción |
|---|---|---|
| `favorites` | `string[]` | Array de UUIDs de productos favoritos |
| `toggleFavorite(productId)` | `function` | Toggle optimista + sync DB |
| `isFavorite(productId)` | `function` | Lookup O(1) via Set |

### SettingsContext

| Propiedad | Tipo | Descripción |
|---|---|---|
| `settings` | `object` | Fila de `store_settings` |
| `loading` | `boolean` | Estado de carga |
| `fetchSettings()` | `function` | Refresh manual |

### ConfirmContext

| Propiedad | Tipo | Descripción |
|---|---|---|
| `confirm(options)` | `function` | Retorna `Promise<boolean>`. Options: `{ title, message, confirmText, cancelText, type }`. Types: `danger`, `warning`, `info`. |

---

## 11. Componentes — Catálogo Completo

### 11.1 Layout

**ShopLayout** (`components/layout/ShopLayout.jsx`)  
Wrapper de todas las páginas públicas. Estructura: `Navbar` (sticky top) + `CartDrawer` (overlay) + contenido con `ErrorBoundary` + `Suspense` + `Footer`. Genera canonical URL dinámicamente e inyecta `StructuredData` de Organization. Aplica `pb-16 md:pb-0` para compensar la bottom bar mobile.

### 11.2 Navegación

**Navbar** (`components/Navbar.jsx` — 212 líneas)  
- **Desktop:** Barra sticky top con logo, links (Inicio, Catálogo, Contacto), buscador, toggle dark mode, avatar, carrito badge, favoritos badge
- **Mobile:** Header simplificado (logo + carrito) + **bottom bar fija** con 5 iconos (Inicio, Catálogo, Buscar, Favoritos, Cuenta)
- El carrito muestra un badge rojo con el count de items (pulso animado con `pulseSubtle`)
- El botón de búsqueda abre `SearchModal`; el de favoritos abre `FavoritesModal`
- Si el usuario no está logueado, los botones de favoritos y cuenta abren `LoginModal` con contexto apropiado

**Logo** (`components/Logo.jsx`)  
Icono Material + texto "PaGe's". Versiones `sm`/`md`/`lg` responsivas.

### 11.3 Producto

**ProductCard** (`components/ProductCard.jsx` — `React.memo`)  
Card de catálogo con:
- Imagen con `aspect-[4/5]`, `object-cover`, hover scale `1.05`
- **Badge de oferta:** Calculado como `Math.round((1 - price/old_price) * 100)%`, fondo rojo, posición absolute top-left
- **Badge programado:** "Próxima oferta" con icono `schedule`, fondo ámbar
- **OfferCountdown:** Si la oferta tiene `offer_ends_at`, muestra countdown en vivo
- Botón favorito (corazón filled/outlined) — protegido por `showAuthModal('favorites')`
- Botón de agregar al carrito — protegido por `showAuthModal('cart')`
- Precio actual en bold + precio anterior tachado (si hay oferta activa)
- Link al detalle via `slug`

**OfferCountdown** (`components/OfferCountdown.jsx` — 161 líneas)  
- **Arquitectura de tick:** Usa suscripción global a nivel de módulo (`tickCallbacks` Map). Un solo `setInterval(1000ms)` alimenta TODOS los countdowns activos en la página.
- Muestra días/horas/minutos/segundos en bloques con animación `countdownPulse`
- Calcula el descuento porcentual y lo muestra como badge
- Ocupa 3 estados: activo (countdown), inminente (<1h: pulsa en rojo), expirado (se oculta)

### 11.4 Carrito

**CartDrawer** (`components/CartDrawer.jsx` — 363 líneas, componente más complejo)  
- Drawer lateral derecho con overlay blur, ancho `max-w-md`
- Lista de items con imagen, nombre, controles de cantidad (+/-), precio unitario × cantidad
- **Revalidación visual:** Spinner durante `refreshCartPrices`, warning si `arePricesStale`
- **WhatsApp checkout:** Botón "Enviar pedido" → llama RPC `generate_whatsapp_message` → construye URL `wa.me` → `window.open`
- Al abrir, ejecuta `refreshCartPrices()` automáticamente
- Usa `useBodyScrollLock` para bloquear scroll del body
- Animación de entrada: `translateX(100%)` → `translateX(0)` con `transition-transform`

### 11.5 Modales

**LoginModal** (`components/LoginModal.jsx`)  
Modal contextual activado por `authModalContext`. Mensajes dinámicos según trigger:
- `'cart'` → "Inicia sesión para guardar tu carrito"
- `'favorites'` → "Inicia sesión para guardar tus favoritos"
- `'contact'` → "Inicia sesión para enviar un mensaje"
- Click en "Continuar con Google" → `signInWithGoogle()`

**FavoritesModal** (`components/FavoritesModal.jsx` — 151 líneas)  
- Lista de productos favoritos cargados desde Supabase por IDs del array local
- Limpieza automática: IDs que no corresponden a productos activos se eliminan del localStorage
- Cada item es clickeable → navega al detalle
- Botón de eliminar favorito individual

**SearchModal** (`components/SearchModal.jsx` — 148 líneas)  
- Input con debounce, búsqueda contra `productService` vía `useProducts`
- Muestra sugerencias populares (términos hardcoded) cuando el input está vacío
- Resultados: cards compactas con imagen, nombre, precio
- Click → navega al detalle y cierra modal

**ShareModal** (`components/ShareModal.jsx` — 167 líneas)  
- Muestra URL del producto con botón "Copiar" (Clipboard API con fallback manual)
- Botón "Compartir por WhatsApp" → `api.whatsapp.com/send?text=...`
- Si el browser soporta `navigator.share`, muestra botón "Más" (native share sheet)

**ConfirmDialog** (`components/ConfirmDialog.jsx`)  
Dialog genérico usado por `ConfirmContext`. 3 tipos con colores distintos:
- `danger`: icono warning, botón rojo
- `warning`: icono error, botón ámbar
- `info`: icono info, botón azul

### 11.6 Filtros

**FilterSidebar** (`components/FilterSidebar.jsx`)  
Panel lateral desktop con checkboxes de categorías y toggle "Solo ofertas". Se renderiza solo en `CatalogPage` a partir de `md:` breakpoint.

**MobileFilterDrawer** (`components/MobileFilterDrawer.jsx` — 133 líneas)  
Drawer inferior mobile con:
- Selector de orden (Relevancia, Precio ↑, Precio ↓, Más recientes)
- Lista de categorías como pills scrollables
- Toggle de ofertas
- Botones "Limpiar filtros" / "Aplicar"

### 11.7 Utilidades UI

**ThemeToggle** — Botón cuadrado con icono `dark_mode`/`light_mode`. Tooltip descriptivo.

**UserAvatar** — Imagen de avatar con cadena de fallback: `avatar_url` → `picture` (metadata) → `ui-avatars.com/api` (generado con iniciales). `referrerPolicy="no-referrer"` para evitar leaks.

**CookieBanner** — Banner GDPR que aparece tras 1s con spring animation de Framer Motion. Persistencia en `cookie_consent` localStorage. Link a `/privacy`.

**ErrorBoundary** — Class component que captura errores de render. Muestra UI de recuperación con 2 opciones:
- "Volver al inicio" → `window.location.href = '/'`
- "Limpiar datos y recargar" → limpia solo sessionStorage + keys volátiles (NO borra carrito ni favoritos, LOW-004)

**SocialIcons** — 2 variantes: `solid` (círculos pequeños, footer) y `glass` (pills glassmorphism con texto, página de contacto). Renderiza Instagram, Facebook, WhatsApp, y Email (solo en glass). URLs vienen de `SettingsContext`.

**StructuredData** — Inyecta `<script type="application/ld+json">` via Helmet. Sanitiza con `.replace(/</, '\\u003c')` para prevenir script injection dentro del JSON-LD.

---

## 12. Páginas Públicas

### HomePage

**Secciones:**
1. **Hero:** Imagen de fondo desde `store_settings.hero_image_url`, título/subtítulo dinámicos, CTA "Ver Catálogo"
2. **Especialidades:** Grid de categorías con iconos y cards clickeables
3. **Nuestra Historia:** Sección narrativa con imagen lateral
4. **Productos Destacados:** Carousel de `ProductCard` (productos recientes + ofertas activas)

### CatalogPage

- **URL sync:** Filtros sincronizados con `searchParams` de la URL (`?category=X&search=Y&sort=Z&page=N`)
- **Grid responsivo:** 2 columnas mobile, 3 tablet, 4 desktop
- **Filtros:** FilterSidebar (desktop) / MobileFilterDrawer (mobile)
- **Paginación:** Offset-based con botones Anterior/Siguiente
- **Empty state:** Ilustración cuando no hay resultados

### ProductDetailPage

- **Galería:** Imagen principal + thumbnails clickeables (array `images[]`)
- **Información:** Nombre, precio, descripción, categoría, tags como chips
- **Oferta activa:** Precio anterior tachado + badge de descuento + OfferCountdown
- **Oferta programada:** Badge "Próxima oferta" + countdown "Inicia en..."
- **Nota personalizada:** Input de texto libre que se incluye en el mensaje de WhatsApp
- **Acción:** Botón "Agregar al carrito" con selector de cantidad
- **Compartir:** Botón que abre ShareModal
- **Relacionados:** Grid de productos de la misma categoría (excluyendo el actual)
- **SEO:** `StructuredData` con schema Product (nombre, precio, imagen, SKU, availability)

### ContactPage (348 líneas — página más segura)

**Campos:** Nombre, email, asunto (select), mensaje, archivo adjunto (no implementado)  
**Triple protección anti-bot:**
1. **Turnstile:** Widget Cloudflare invisible → genera token → verificado server-side
2. **Honeypot:** Campo `website` oculto con `opacity:0, position:absolute`. Si contiene texto → bot, submit fallido silenciosamente
3. **Rate limiting:** localStorage `last_contact_sent` con TTL 60s

**Flujo de envío:**
1. Validar campos + sanitizar con `sanitizeInput()`
2. Verificar honeypot vacío
3. Verificar rate limit (60s cooldown)
4. Obtener token Turnstile
5. INSERT en `contact_messages` con token Turnstile en campo para verificación server-side
6. Reset formulario + reset widget Turnstile

### NotFoundPage — 404 minimalista con `<meta name="robots" content="noindex, nofollow" />`

### PrivacyPage / TermsPage — Contenido legal estático con `prose` de Tailwind.

---

## 13. Panel de Administración

### Acceso y Protección

- **Ruta base:** `/admin`
- **Guard client-side:** `AdminRoute` verifica `isAdmin` del `AuthContext`. Si no es admin → muestra `NotFoundPage` (no redirect, para no revelar existencia). Si no hay sesión → redirect a `/`.
- **Guard server-side:** Todas las tablas tienen RLS que restringe escritura a `profiles.role = 'admin'`.

### Layout (AdminLayout)

- **Desktop:** Sidebar colapsable izquierda + header con avatar/theme toggle + área de contenido scrollable
- **Mobile:** Header con logo + bottom bar administrativa (AdminFooterBar) con 5 iconos: Dashboard, Productos, Categorías, Mensajes, Ajustes

### Páginas Admin

| Ruta | Componente | Función |
|---|---|---|
| `/admin` | `DashboardPage` | Dashboard con stats via RPC `get_dashboard_data`. Muestra: total productos, categorías, ofertas activas, mensajes no leídos, favoritos, usuarios. Widgets: RecentProducts, CategoryChart, TopFavorites, RecentMessages. Modal `StatDetailModal` al click en stats. |
| `/admin/products` | `ProductsPage` | CRUD completo. Búsqueda con debounce 500ms. Filtro por categoría y ofertas activas. Paginación (25/página). Eliminación individual y masiva con cleanup de Storage (HIGH-002). |
| `/admin/categories` | `CategoriesPage` | CRUD categorías con selector de icono Material Symbols. |
| `/admin/messages` | `MessagesPage` | Mensajes de contacto. Marcado leído/no leído. Eliminación. |
| `/admin/favorites` | `FavoritesPage` | Ranking de productos más favoriteados. |
| `/admin/settings` | `SettingsPage` | `StoreSettingsForm` (hero, contacto, redes) + gestión de roles + `StoreCategoryImagesForm`. |

### ProductModal (524 líneas — componente admin más complejo)

**Campos:** nombre, slug (auto-generado, editable), descripción, precio, precio anterior (oferta), duración de oferta (días/horas/minutos), fecha inicio programado, categoría (select), imágenes (upload + URL manual), tags (chips con Enter), toggle activo/inactivo.

**Validaciones:**
- Precio anterior debe ser > precio actual
- Slug único (query a DB antes de guardar)
- Precio numérico ≥ 0

**Lógica de ofertas:**
- Si `old_price` tiene valor y se especifica duración → calcula `offer_ends_at`
- Si se especifica `offer_starts_at` → la oferta es programada (futura)
- Si duración es 0 → oferta sin expiración
- Si se vacía `old_price` → limpia `offer_ends_at` y `offer_starts_at`

### ImageUploader

**Flujo:** Selección (click o drag) → Validación tipo/tamaño (5MB max) → Compresión Canvas → Export WebP 80% → Upload a `product-images` bucket → Retorna publicUrl.

**Seguridad (LOW-009):** La compresión via Canvas tiene el efecto secundario de **eliminar TODA la metadata EXIF** (GPS, modelo, fechas), protegiendo la privacidad de la administradora.

**Formatos:** JPEG, PNG, WebP, GIF. Resolución máxima: 1200px (dimension mayor).

---

## 14. SEO y Datos Estructurados

### Meta Tags (react-helmet-async)

Cada página configura:
- `<title>` descriptivo con nombre del sitio
- `<meta name="description">` contextual
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`
- URL canónica via `ShopLayout`
- `noindex, nofollow` solo en 404

### JSON-LD (StructuredData.jsx)

**Organization** (inyectado en ShopLayout, todas las páginas):
```json
{
  "@type": "Organization",
  "name": "PaGe's Detalles & Más",
  "url": "<origin>",
  "logo": "<origin>/logo.png",
  "contactPoint": { "telephone": "<WhatsApp>", "areaServed": "SV", "availableLanguage": "es" },
  "sameAs": ["<instagram_url>", "<facebook_url>"]
}
```

**Product** (inyectado en ProductDetailPage):
```json
{
  "@type": "Product",
  "name": "<sanitized>",
  "image": "<image_url>",
  "description": "<sanitized>",
  "sku": "<product_id>",
  "offers": {
    "priceCurrency": "USD",
    "price": "<price>",
    "availability": "https://schema.org/InStock"
  }
}
```

> **Nota:** `InStock` es un valor estándar de Schema.org para SEO. NO representa inventario real. El negocio opera por pedido.

---

## 15. Deploy, CI/CD y Headers

### Vercel

| Config | Valor |
|---|---|
| Framework | Vite (auto-detectado) |
| Build command | `npm run build` |
| Output directory | `dist` |
| SPA Fallback | `/*` → `/index.html` |
| Node version | 18.x |

### Chunk Splitting (vite.config.js)

```javascript
manualChunks: {
  vendor: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js', 'framer-motion'],
  ui: ['react-hot-toast', 'react-helmet-async', 'dompurify'],
  modules: [] // Reservado para expansión futura
}
```

### Optimización de imágenes (vite-imagetools)

Configurado en `vite.config.js` para procesar imágenes durante build con formatos WebP y dimensiones optimizadas.

---

## 16. Reglas de Negocio Críticas

> ⚠️ Estas reglas no son obvias y son fáciles de romper al hacer cambios.

1. **Límite del carrito:** Máx 50 unidades por producto, 50 items distintos. Existe por la limitación de URLs de WhatsApp (~2000 chars). Si se sube, el mensaje se truncará.

2. **Revalidación de precios:** Cada 60 segundos (solo si la pestaña es visible) se consulta Supabase para verificar precios actuales. Si un producto fue desactivado (`is_active=false`), se elimina automáticamente del carrito.

3. **Precios stale (HIGH-004):** Si la revalidación falla 3 veces consecutivas, o pasan más de 5 minutos sin un refresh exitoso, se muestra un warning en el CartDrawer y se bloquea el checkout.

4. **Expiración del carrito:** 7 días de inactividad → se borra automáticamente con notificación toast.

5. **Perfil ≠ Auth callback:** El perfil NO se fetchea dentro de `onAuthStateChange`. Si alguien lo mueve ahí, causará deadlocks con el SDK de Supabase. Ver sección 7.2.

6. **Nunca `SELECT *`** en queries públicas. Siempre usar `PRODUCT_SELECT_COLUMNS` o un select explícito (MED-003).

7. **Favoritos restringidos (HIGH-ST01):** `toggleFavorite()` rechaza silenciosamente si no hay usuario. Es defense-in-depth contra bypasses del auth modal.

8. **Cache de categorías es per-tab:** Cambios del admin en otra pestaña no se ven hasta TTL (10 min) expire, o se dispare `categories-updated` event.

9. **Ofertas tienen 3 estados:** `activa` (old_price > price, ya empezó, no expiró), `programada` (offer_starts_at en futuro), `expirada` (offer_ends_at pasó). La lógica está centralizada en `productUtils.js`.

10. **WhatsApp message fallback:** Si la RPC `generate_whatsapp_message` falla, existe la función local `buildWhatsAppUrl()` como fallback con truncamiento inteligente.

11. **Storage cleanup:** Al eliminar un producto, el sistema extrae filenames SOLO de URLs que pertenecen a `.supabase.co` y los borra del bucket. URLs externas se ignoran (HIGH-002).

12. **Supabase client singleton:** El cliente se crea UNA sola vez en `supabaseClient.js` con `storageKey: 'pages-auth'` para evitar conflictos con otras apps Supabase en desarrollo local.

---

## 17. Troubleshooting

### "Los precios del carrito no se actualizan"

1. Verificar que la pestaña está en foreground (`document.hidden` previene polling en background)
2. Revisar consola para errores de `refreshCartPrices`
3. Verificar conectividad con Supabase (CORS, API key)
4. Si `arePricesStale` está activo, hay un problema de red persistente

### "El admin no puede acceder al panel"

1. Verificar `profiles.role` = `'admin'` en Supabase Dashboard
2. Limpiar `sessionStorage`: `pages_profile`, `pages_auth_cache_time`
3. Re-loguearse para forzar re-fetch del perfil
4. Verificar RLS policies en la tabla `profiles`

### "Las imágenes no se muestran"

1. Verificar bucket `product-images` existe en Supabase Storage
2. Verificar que Storage policies permiten lectura pública
3. Verificar CSP en `vercel.json` incluye `*.supabase.co` en `img-src`
4. Verificar que la imagen se subió como WebP (el uploader convierte automáticamente)

### "El formulario de contacto falla"

1. `VITE_TURNSTILE_SITE_KEY` configurada correctamente en env vars
2. Dominio registrado en Cloudflare Turnstile dashboard
3. Tabla `contact_messages` tiene RLS que permite inserts autenticados
4. Verificar rate limit: esperar 60s entre envíos

### "Error: useConfirm must be used within a ConfirmProvider"

El componente está fuera del árbol de providers. Verificar orden en `main.jsx`.

### "El carrito se borró solo"

Expiración automática tras 7 días de inactividad. Verificar `pages_cart_timestamp` en localStorage. Es comportamiento esperado.

### "Las categorías del admin no se reflejan en la tienda"

Cache per-tab con TTL 10 min. Esperar o recargar la página pública. El admin puede forzar invalidación via `window.dispatchEvent(new Event('categories-updated'))`.

---

## 18. Glosario de Remediaciones

Códigos de auditoría referenciados en los comentarios del código fuente:

| Código | Severidad | Descripción |
|---|---|---|
| HIGH-002 | 🔴 Alta | Validación de hostname en URLs de Storage antes de delete |
| HIGH-004 | 🔴 Alta | Tracking de fallos consecutivos en revalidación de precios del carrito |
| HIGH-ST01 | 🔴 Alta | Bloqueo de favoritos para usuarios no autenticados (defense-in-depth) |
| MED-002 | 🟡 Media | AbortController en hooks de productos para cancelar requests obsoletos |
| MED-003 | 🟡 Media | SELECT explícito en queries (nunca `*`) para controlar superficie de datos |
| MED-005 | 🟡 Media | Validación de payloads en Realtime subscription (SettingsContext) |
| MED-006 | 🟡 Media | Debounce de updates Realtime para evitar cascada de re-renders |
| MED-010 | 🟡 Media | Filtros de ofertas activas: excluye expiradas y programadas futuras |
| MED-012 | 🟡 Media | Documentación de limitación: focus trap no maneja Tab cycling en modales |
| LOW-002 | 🟢 Baja | Limpieza "nuclear" controlada de sessionStorage al signout |
| LOW-003 | 🟢 Baja | Manejo de emojis en generación de slugs (fallback con timestamp) |
| LOW-004 | 🟢 Baja | ErrorBoundary no destruye carrito/favoritos al limpiar datos |
| LOW-009 | 🟢 Baja | Stripping de EXIF/GPS en imágenes subidas via Canvas re-render |
| LOW-011 | 🟢 Baja | Estrategia de layout admin header con `shrink-0` para evitar layout shifts |
| SEC-009 | 🔵 Seguridad | Validación UUID + límite de 100 items en cláusulas IN() |
| PERF-002 | 🔵 Performance | Prevención de DoS en filtros de favoritos (max 100 UUIDs) |

---

## 19. Notas para el Desarrollador

1. **Antes de agregar una columna a `products`:** Actualizar `PRODUCT_SELECT_COLUMNS` en `constants.js` y el tipo en `database.types.ts`.

2. **Antes de modificar el carrito:** Entender la estrategia Guest-First, la expiración de 7 días, y los límites de WhatsApp. Leer sección 7.1.

3. **Antes de tocar la autenticación:** Leer sección 7.2 completa. El desacoplamiento auth/perfil no es accidental y tiene razón técnica documentada.

4. **Para testing:** Los datos se sanitizan antes de enviar a Supabase. Los mocks deben representar datos sanitizados.

5. **Para agregar un nuevo provider:** Respetar el orden de dependencias en `main.jsx`. Auth siempre primero.

6. **Para agregar una nueva página pública:** Crear el componente lazy en `App.jsx`, envolverlo en `ShopLayout`, y agregar meta tags via `Helmet`.

7. **Para agregar un nuevo campo en settings:** Actualizar `store_settings` en Supabase, `StoreSettingsForm`, y el tipo en `database.types.ts`.

8. **Logger en producción:** Los errores graves se envían a la tabla `system_logs` con batch de 5 segundos. Si el volumen crece, migrar a Sentry/LogRocket.

9. **Retry en escrituras:** Usar `withSupabaseRetry()` para operaciones de escritura críticas. No se usa en lecturas (se manejan con estados de loading/error en UI).

10. **Formateo de precios:** SIEMPRE usar `formatPrice()` de `utils/formatPrice.js`. Nunca formatearlo manualmente — el formatter es singleton y usa `Intl.NumberFormat`.

---

## Esquema de Base de Datos (resumen de database.types.ts)

| Tabla | Columnas principales | RLS |
|---|---|---|
| `products` | id, name, slug, description, price, old_price, offer_starts_at, offer_ends_at, category, category_id, tags[], image_path, images[], is_active | Read: público · Write: admin |
| `categories` | id, name, slug, icon, image_url, description | Read: público · Write: admin |
| `profiles` | id, role, full_name, avatar_url | Read: propio · Write: propio + admin |
| `user_favorites` | id, user_id, product_id | Read/Write: propio |
| `user_carts` | id, user_id, cart_data (JSONB) | Read/Write: propio |
| `contact_messages` | id, name, email, subject, message, is_read, turnstile_token | Insert: autenticado · Read: admin |
| `store_settings` | id, hero_title, hero_subtitle, hero_image_url, contact_phone, contact_email, social_* | Read: público · Write: admin |
| `system_logs` | id, level, message, context, source, created_at | Insert: frontend · Read: admin |

---

*Documento generado como parte de la auditoría técnica profunda del proyecto PaGe's.*  
*Última actualización: Marzo 2026 — Versión 2.0*