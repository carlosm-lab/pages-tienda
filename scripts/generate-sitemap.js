/* global process */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://pages-tienda.vercel.app';

// Local routes (static)
const routes = [
  '/',
  '/catalog',
  '/contact',
  '/terms',
  '/privacy'
];

async function generateSitemap() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      console.log('Fetching dynamic product slugs...');
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=slug&is_active=eq.true`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (response.ok) {
        const products = await response.json();
        products.forEach(p => {
          if (p.slug) routes.push(`/product/${p.slug}`);
        });
        console.log(`Added ${products.length} products to sitemap.`);
      }
    } catch (err) {
      console.error('Error fetching products for sitemap:', err.message);
    }
  }

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : route.startsWith('/product/') ? '0.7' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
  console.log('Sitemap generated successfully at public/sitemap.xml');
}

generateSitemap();
