# PaGe's Detalles & Más 🎁

> **Plataforma E-commerce React + Supabase optimizada para ventas por WhatsApp.**

![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat-square&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat-square&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=flat-square&logo=vercel&logoColor=white)

![PaGe's Detalles & Más](./public/og-image.jpg)

**PaGe's Detalles & Más** es una plataforma de comercio electrónico diseñada a la medida para un modelo de negocio basado en catálogos visuales (sin manejo de stock transaccional en plataforma) donde cada cierre de venta, cotización o detalle personalizado se gestiona de manera directa y humana a través de WhatsApp.

Desarrollada bajo el nombre en código *Pages*, esta aplicación de una sola página (SPA) prioriza el rendimiento, el SEO dinámico y las interfaces modernas para maximizar la conversión móvil. 

## 🚀 Características Principales

* **Autenticación sin Contraseñas (Passwordless OTP):** Eliminación completa de la fricción del usuario mediante inicios de sesión mágicos vinculados al correo electrónico (Supabase Auth).
* **Catálogo Optimizado y Favoritos en Tiempo Real:** Productos con carga diferida y panel de favoritos sincronizado por base de datos, persistiendo selecciones de forma nativa a la cuenta del usuario.
* **Carrito de Compra Inteligente:** Consolidación de peticiones de productos integrados con un enlace Deep Link a WhatsApp pre-generado (*API de Mensajería*), trasladando el JSON de compra a texto de manera instantánea.
* **Búsqueda Algorítmica Global (Fuzzy Search):** Indexación reactiva con filtrado inmediato en barra transversal para componentes, categorías e índices invertidos de metadatos.
* **Seguridad de Vanguardia (RLS):** Cumplimiento estricto al estándar de políticas de nivel de fila (Row-Level Security) de PostgreSQL garantizando protección de datos desde la capa de red hasta la base de datos.
* **Zero-Spam Contacto:** Formulario de envío auditado bajo protección Cloudflare Turnstile con rate limiting embebido vía Edge Functions.
* **Panel de Administración RBAC:** Área protegida exclusiva para administradores (reconocidos por perfil RLS) que permite la gestión del catálogo, carga de imágenes a almacenamiento seguro y manejo de la documentación legal (*Términos*, *Sprints*, *Servicios*).

## 🛠️ Stack Tecnológico (v2.0)

* **Framework Core:** [React 19](https://react.dev) + [Vite 6](https://vitejs.dev/)
* **Backend y Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL + Storage + Auth + Edge Functions)
* **Estilos e Interfaces:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Animaciones Reactivas:** [Framer Motion](https://www.framer.com/motion/)
* **Anti-Bot / CAPTCHA:** [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
* **Despliegue Recomendado:** Vercel (Edge Network Cache)

## 📦 Despliegue Local Rápido

Para montar la aplicación localmente, asegúrate de tener `Node.js 18+` y una instancia lista de Supabase.

```bash
# 1. Clona el repositorio
git clone https://github.com/carlosm-lab/pages-tienda.git
cd pages-tienda

# 2. Instala dependencias
npm install

# 3. Configura el Entorno
cp .env.example .env
# -> Completa las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# 4. Inicia Servidor de Desarrollo
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`. Para compilar la versión empaquetada de producción ejecuta `npm run build`.

## 🔒 Arquitectura de Datos

Las políticas de seguridad (*RLS*) en Supabase son imprescindibles. Este proyecto delega la autenticación y las validaciones CRUD al back-end. 
Para la migración y arquitectura completa de las tablas SQL, triggers y vistas materializadas, solicita los volcados base disponibles a través de Supabase Studio.

## 📄 Notas Adicionales

* **Documentación Técnica Extendida**: Todos los recovecos arquitectónicos (desde el SEO de `react-helmet-async` hasta la parametrización de Edge Functions) residen dentro de `DOCUMENTACION.md` en el código fuente.
* **Protección Anti-Robots**: La variable de entorno `VITE_TURNSTILE_SITE_KEY` es obligatoria en entornos `PROD`. La omitisión de la misma anulará la transmisión del formulario de contacto previniendo inyección de SPAM.