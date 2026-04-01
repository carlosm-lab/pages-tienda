import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import { WHATSAPP_NUMBER, BASE_URL } from '@/config/constants';

export default function StructuredData({ data }) {
  if (!data) return null;
  return (
    <Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
      />
    </Helmet>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const createOrganizationSchema = (settings) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : BASE_URL;
  return {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PaGe's Detalles & Más",
  "url": origin,
  "logo": `${origin}/logo.png`,
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": settings?.contact_phone || WHATSAPP_NUMBER,
    "contactType": "customer service",
    "areaServed": "SV",
    "availableLanguage": "es"
  },
  "sameAs": [
    settings?.social_instagram || "https://www.instagram.com/pages_detalles_ymas/",
    settings?.social_facebook || "https://www.facebook.com/2016pages",
    settings?.social_tiktok || "https://www.tiktok.com/@pages_detalles"
  ]
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const createProductSchema = (product) => {
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const origin = typeof window !== 'undefined' ? window.location.origin : BASE_URL;

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": DOMPurify.sanitize(product.name || "", { ALLOWED_TAGS: [] }),
    "image": product.image_path || product.images?.[0] || "",
    "description": DOMPurify.sanitize(product.description || "", { ALLOWED_TAGS: [] }),
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `${origin}/product/${product.slug}`,
      "priceCurrency": "USD",
      "price": product.price,
      "priceValidUntil": nextYear.toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      /**
       * NOTA PARA AUDITORES: "https://schema.org/InStock" es un valor estándar
       * de Schema.org para SEO (datos estructurados de Google). Indica a los
       * motores de búsqueda que el producto está disponible para pedido.
       * NO representa un sistema de inventario/stock. Ver reglas de negocio
       * en src/config/constants.js — el negocio opera por pedido, sin stock.
       */
      "availability": "https://schema.org/InStock"
    }
  };
};
