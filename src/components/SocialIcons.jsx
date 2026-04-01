import { useSettings } from '@/context/SettingsContext';
import { WHATSAPP_NUMBER } from '@/config/constants';

export default function SocialIcons({ variant = 'solid', className = '' }) {
  const { settings } = useSettings();
  
  // The glass variant is now a pill with text on desktop, and a perfect circle on mobile
  const glassClasses = "sm:flex-1 shrink-0 flex items-center justify-center sm:gap-2 h-[3.25rem] w-[3.25rem] sm:w-auto sm:h-12 sm:px-4 rounded-full bg-slate-100/90 dark:bg-white/10 backdrop-blur-md border border-slate-200/60 dark:border-white/20 shadow-sm hover:bg-slate-200/90 dark:hover:bg-white/20 hover:-translate-y-1 transition-all group overflow-hidden min-w-0";
  const solidClasses = "flex items-center justify-center w-[clamp(2rem,5vw,2.5rem)] aspect-square rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all group shrink-0";
  
  const iconClasses = variant === 'glass' ? glassClasses : solidClasses;
  const svgClasses = variant === 'glass' ? 'w-5 h-5 text-slate-700 dark:text-white shrink-0' : 'w-[clamp(1rem,3vw,1.25rem)] h-[clamp(1rem,3vw,1.25rem)] shrink-0';

  // Helper for the pill text
  const renderText = (text, hoverColorClass) => {
    if (variant !== 'glass') return null;
    return (
      <span className={`hidden sm:block text-[13px] font-bold text-slate-700 dark:text-white truncate transition-colors ${hoverColorClass}`}>
        {text}
      </span>
    );
  };

  return (
    <div className={`flex items-center justify-between sm:justify-start w-full ${className}`}>
      {/* Facebook */}
      <a href={settings?.social_facebook || "https://www.facebook.com/2016pages"} target="_blank" rel="noopener noreferrer" className={iconClasses} aria-label="Facebook">
        <svg className={`${svgClasses} ${variant === 'glass' ? 'group-hover:text-[#1877F2] transition-colors' : ''}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
        </svg>
        {renderText('Facebook', 'group-hover:text-[#1877F2]')}
      </a>

      {/* Instagram */}
      <a href={settings?.social_instagram || "https://www.instagram.com/pages_detalles_ymas/"} target="_blank" rel="noopener noreferrer" className={iconClasses} aria-label="Instagram">
        <svg className={`${svgClasses} ${variant === 'glass' ? 'group-hover:text-primary transition-colors' : ''}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        {renderText('Instagram', 'group-hover:text-primary')}
      </a>

      {/* TikTok (only glass) */}
      {variant === 'glass' && (
        <a href={settings?.social_tiktok || "https://www.tiktok.com/@pages_detalles"} target="_blank" rel="noopener noreferrer" className={iconClasses} aria-label="TikTok">
          <svg className={`${svgClasses} group-hover:text-[#000000] dark:group-hover:text-[#ff0050] transition-colors`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
          {renderText('TikTok', 'group-hover:text-[#ff0050]')}
        </a>
      )}

      {/* WhatsApp */}
      <a href={`https://wa.me/${(settings?.contact_phone || WHATSAPP_NUMBER).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={iconClasses} aria-label="WhatsApp">
        <svg className={`${svgClasses} ${variant === 'glass' ? 'group-hover:text-[#25D366] transition-colors' : ''}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.031 0c-6.627 0-12.002 5.375-12.002 12 0 2.126.549 4.197 1.621 5.922l-1.65 6.078 6.186-1.666c1.696.887 3.655 1.432 5.845 1.432 6.626 0 12.003-5.378 12.003-12 0-6.628-5.377-12-12.003-12zm7.425 17.584c-.314.887-1.815 1.701-2.522 1.758-.707.054-1.353-.193-4.545-1.432-3.818-1.503-6.26-5.462-6.446-5.714-.183-.243-1.543-2.072-1.543-3.957 0-1.884.97-2.863 1.309-3.235.337-.369.734-.461.977-.461.242 0 .484 0 .693.012.219.013.513-.082.802.628.29.712.992 2.453 1.076 2.627.085.176.14.382.02.615-.12.232-.181.369-.36.568-.18.199-.379.431-.54.582-.178.169-.369.356-.169.697.199.34 1.838 1.015 1.656 2.42 1.442.278.431.627.674 1.134.627 2.083.504 2.502.627.42.122.581.106.797-.04.218-.146.516-.605.656-.816.14-.21.28-.175.503-.089.223.085 1.411.668 1.652.788.243.12.404.18.463.284.06.104.06.602-.254 1.488z"/>
        </svg>
        {renderText('WhatsApp', 'group-hover:text-[#25D366]')}
      </a>
    </div>
  );
}
