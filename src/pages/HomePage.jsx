import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Helmet } from 'react-helmet-async';
import { WHATSAPP_NUMBER, BASE_URL } from '@/config/constants';
import SocialIcons from '@/components/SocialIcons';

const FALLBACK_HERO_IMG = 'https://images.unsplash.com/photo-1513290254054-0f62d1ecbaaa?q=80&w=800&auto=format&fit=crop';

export default function HomePage() {
  const navigate = useNavigate();
  const { products: homeProducts, loading } = useProducts({ limit: 4 });
  const { categories: allCategories, loading: loadingCategories } = useCategories();
  const { settings } = useSettings();
  
  // Show categories marked as "featured" by admin. Fallback: first 3 alphabetically.
  const categories = (() => {
    const featured = allCategories.filter(c => c.featured);
    return featured.length > 0 ? featured : allCategories.slice(0, 3);
  })();

  const getCategoryTheme = (cat) => {
    return {
      icon: cat.icon || 'category',
      desc: cat.description || 'Explora nuestros hermosos detalles de esta categoría.',
      img: cat.image_url || 'https://images.unsplash.com/photo-1513290254054-0f62d1ecbaaa?q=80&w=800&auto=format&fit=crop'
    };
  };

  return (
    <>
      <Helmet>
        <title>Inicio | PaGe's Detalles & Más</title>
        <meta name="description" content="Descubre la belleza de nuestras rosas eternas y detalles personalizados hechos a mano con amor en PaGe's." />
        <meta property="og:title" content="PaGe's Detalles & Más" />
        <meta property="og:description" content="Rosas eternas, sublimación y regalos hechos a mano." />
        <meta property="og:image" content={settings?.hero_image_url || FALLBACK_HERO_IMG} />
        <meta property="og:url" content={BASE_URL} />
        <link rel="preload" as="image" href={settings?.hero_image_url || FALLBACK_HERO_IMG} />
      </Helmet>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-container py-[var(--space-lg)]">
          {/* Banner */}
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-slate-900 lg:bg-white dark:bg-white/5 min-h-[clamp(18rem,50vw,31.25rem)] flex items-center p-[var(--space-lg)] lg:p-12 xl:p-16 border border-slate-800 lg:border-slate-100 dark:border-white/5 shadow-360">
            {/* Mobile Background Image (Hidden on Desktop) */}
            <img 
              src={settings?.hero_image_url || FALLBACK_HERO_IMG} 
              alt="Hero background" 
              className="absolute inset-0 w-full h-full object-cover object-center opacity-60 lg:hidden"
              fetchpriority="high" 
              decoding="async" 
            />
            {/* Forced dark gradient for mobile to match dark theme request */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 lg:hidden"></div>
            
            <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center h-full">
              
              {/* Left Section: Text & CTAs */}
              <div className="flex flex-col items-start text-left gap-[var(--space-md)] px-4 lg:px-0">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem] font-brand font-black leading-[1.1] tracking-tight text-white lg:text-slate-900 dark:lg:text-white drop-shadow-lg lg:drop-shadow-none dark:lg:drop-shadow-lg mb-6 md:mb-8">{settings?.hero_title || "Regalos que duran para siempre"}</h1>
                <p className="text-base md:text-lg text-white/90 lg:text-slate-500 dark:lg:text-white/90 font-medium max-w-xl drop-shadow-md lg:drop-shadow-none dark:lg:drop-shadow-md lg:pr-8 lg:line-clamp-4">{settings?.hero_subtitle || "Descubre la belleza de nuestras rosas eternas y detalles personalizados hechos a mano con amor."}</p>
                
                {/* Social Media Links (Glassmorphism) */}
                <SocialIcons 
                  variant="glass" 
                  className="mt-8 mx-0 w-full gap-2 sm:gap-3" 
                />
              </div>
               {/* Right Section: Representative Image Subcard (Desktop Only) */}
              <div className="hidden lg:flex justify-end w-full h-full min-h-[350px] xl:min-h-[450px]">
                <div className="relative w-full max-w-xl h-full rounded-[var(--radius-xl)] overflow-hidden shadow-2xl border border-white/10 group">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{backgroundImage: `url("${settings?.hero_image_url || FALLBACK_HERO_IMG}")`}}></div>
                  <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] pointer-events-none"></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* New Products */}
        <section className="px-container py-[var(--space-2xl)]">
          <div className="mb-[var(--space-md)]">
            <h2 className="text-[var(--text-3xl)] font-bold">Novedades</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-[var(--space-2xs)]">Los últimos diseños que han llegado a nuestra tienda.</p>
            <Link to="/catalog" className="inline-flex text-primary font-bold items-center gap-[var(--space-xs)] hover:underline mt-[var(--space-sm)]">
              Ver todo <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--space-lg)]">
            {loading ? (
              <div className="col-span-full py-12 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
            ) : homeProducts.length > 0 ? (
              homeProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500">Pronto llegarán nuevos productos.</div>
            )}
          </div>
        </section>

        {/* Specialties */}
        <section className="px-container py-[var(--space-xl)]">
          <h2 className="text-slate-900 dark:text-slate-100 text-[var(--text-3xl)] font-bold mb-[var(--space-lg)]">Nuestras Especialidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-lg)]">
            {loadingCategories ? (
               <div className="col-span-full py-12 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
            ) : categories.length === 0 ? (
               <div className="col-span-full py-12 text-center text-slate-500">Pronto llegarán nuevas categorías.</div>
            ) : categories.map(cat => {
              const theme = getCategoryTheme(cat);
              return (
                <div 
                  key={cat.id} 
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/catalog?category=${cat.slug}`); } }}
                  className="relative flex flex-col justify-end p-[var(--space-md)] rounded-xl border border-slate-100 dark:border-white/5 shadow-360 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden min-h-[160px] bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary" 
                  onClick={() => navigate(`/catalog?category=${cat.slug}`)}
                >
                  <img 
                    src={theme.img} 
                    alt={cat.name} 
                    onError={(e) => { e.target.style.display = 'none'; }}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-300 group-hover:from-black"></div>
                  
                  <div className="relative z-10 flex flex-col gap-[var(--space-2xs)] transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="w-[clamp(2.5rem,6vw,3rem)] aspect-square mb-[var(--space-xs)] rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-primary transition-colors duration-300">
                      <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-md)' }}>{theme.icon}</span>
                    </div>
                    <h3 className="text-[var(--text-lg)] text-white font-bold tracking-wide drop-shadow-md break-words">{cat.name}</h3>
                    <p className="text-white/80 text-[var(--text-sm)] line-clamp-3 drop-shadow-sm break-words">{theme.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Story Section */}
        <section className="bg-white border-y border-slate-100 dark:bg-white/5 dark:border-transparent px-container py-[var(--space-2xl)] shadow-360 relative z-10">
          <div className="flex flex-col md:flex-row gap-[var(--space-xl)] items-center">
            <div className="flex-1">
              <h2 className="text-[var(--text-3xl)] font-bold mb-[var(--space-lg)]">Tu regalo, tu historia</h2>
              <p className="text-[var(--text-lg)] text-slate-700 dark:text-slate-300 mb-[var(--space-xl)] leading-relaxed">
                Creemos que cada regalo debe ser tan único como la persona que lo recibe. Nuestro proceso de personalización asegura que cada detalle cuente una historia.
              </p>
              <div className="space-y-[var(--space-md)]">
                <div className="flex items-start gap-[var(--space-md)]">
                  <span className="bg-primary text-white w-[clamp(1.5rem,4vw,2rem)] aspect-square rounded-full flex items-center justify-center shrink-0 font-bold text-[var(--text-sm)]">1</span>
                  <p className="font-medium">Elige tu producto base de nuestro catálogo.</p>
                </div>
                <div className="flex items-start gap-[var(--space-md)]">
                  <span className="bg-primary text-white w-[clamp(1.5rem,4vw,2rem)] aspect-square rounded-full flex items-center justify-center shrink-0 font-bold text-[var(--text-sm)]">2</span>
                  <p className="font-medium">Envíanos tu diseño, foto o mensaje especial.</p>
                </div>
                <div className="flex items-start gap-[var(--space-md)]">
                  <span className="bg-primary text-white w-[clamp(1.5rem,4vw,2rem)] aspect-square rounded-full flex items-center justify-center shrink-0 font-bold text-[var(--text-sm)]">3</span>
                  <p className="font-medium">Lo elaboramos a mano y te lo entregamos como mejor te convenga.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-video rounded-xl bg-slate-300 overflow-hidden shadow-360">
                <img loading="eager" alt="Hands crafting" className="w-full h-full object-cover" src={settings?.story_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCaeArssF_3O-p7X4lsXtjx6IVwX8KDLaO44YbE9bVMBL0wII6YeLPu_XUYBYP-cZeiHFMdQIGQMqNt8dF0uwYbvgO5d-OHqW9lGDT90POXBfjt9F0RL6QxwgTZeH7MvZA9ArESxH0en2a-4zUvFOey9lLWYD6r3QeT0-a0g4EBJkyrSSa-uZr07zWN3-xKJr-RiY4kHhkqvbKENnC6hjivPXauIXG4_AyktByiJBkJf37a662tC04O_skpaOxuZAjbytZ5rvIwzTgw"}/>
              </div>
            </div>
          </div>
        </section>


      </main>
    </>
  );
}
