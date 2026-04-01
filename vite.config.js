// ──────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE VITE
// ──────────────────────────────────────────────────────────────
// Build tool del proyecto. Puntos clave:
//
// ALIAS: '@' → './src' para imports limpios (@/utils/logger)
//
// CHUNK SPLITTING:
//   - vendor: React, React DOM, React Router, Supabase SDK
//     (cambia poco, se cachea agresivamente)
//   - ui: toast, helmet, DOMPurify
//     (librerías de UI secundarias)
//   - modules: todo lo demás de node_modules
//   Esto optimiza el caching del CDN (Vercel Edge).
//
// IMAGE OPTIMIZER:
//   Comprime PNG, JPEG y WebP al 80% de calidad durante el build.
//   Las imágenes de productos vienen de Supabase Storage y no
//   pasan por aquí — esto afecta solo assets estáticos (logos, etc.)
//
// ENV VALIDATION:
//   En producción, valida que las env vars críticas existen.
//   Solo warn (no error) porque a veces se hacen builds de test
//   sin todas las variables configuradas.
//
// TESTS:
//   jsdom + Vitest. Los tests usan el mismo alias '@' → './src'.
// ──────────────────────────────────────────────────────────────
/* global process */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Validar env vars en producción. Solo warning, no error.
  if (mode === 'production') {
    const requiredEnv = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_WHATSAPP_NUMBER', 'VITE_TURNSTILE_SITE_KEY'];
    for (const key of requiredEnv) {
      if (!env[key]) {
        console.warn(`\x1b[33m\x1b[1mWARNING: Missing required environment variable ${key} in production build!\x1b[0m`);
      }
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      ViteImageOptimizer({
        png: { quality: 80 },
        jpeg: { quality: 80 },
        webp: { quality: 80 },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    server: {
      host: true, // Para acceso desde otros dispositivos en la red local
    },
  build: {
    sourcemap: false, // Sin sourcemaps en prod (seguridad + tamaño)
    rollupOptions: {
      output: {
        // Chunk splitting manual para optimizar caching
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Core: cambia muy rara vez → cache largo
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('@supabase/supabase-js')) {
              return 'vendor';
            }
            // UI libs: cambian ocasionalmente
            if (id.includes('react-hot-toast') || id.includes('react-helmet-async') || id.includes('dompurify')) {
              return 'ui';
            }
            // Todo lo demás de node_modules
            return 'modules';
          }
        }
      }
    }
  },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/__tests__/setup.js',
      resolve: {
        alias: {
          '@': path.resolve('./src'),
        },
      },
    }
  };
});
