import { useTheme } from '@/hooks/useTheme';


export default function ThemeToggle({ className = '' }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-white shadow-sm border border-slate-100 dark:border-white/5 dark:bg-white/10 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/20 transition-colors ${className}`}
      title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDarkMode ? 'Activar tema claro' : 'Activar tema oscuro'}
    >
      <span className="material-symbols-outlined">
        {isDarkMode ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
