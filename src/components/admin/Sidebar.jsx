import { NavLink } from 'react-router-dom';
import Logo from '@/components/Logo';

export default function Sidebar() {
  
  const navItems = [
    { to: '/admin', icon: 'dashboard', label: 'Dashboard', exact: true },
    { to: '/admin/products', icon: 'inventory_2', label: 'Productos' },
    { to: '/admin/categories', icon: 'category', label: 'Categorías' },
    { to: '/admin/messages', icon: 'mail', label: 'Mensajes' },
    { to: '/admin/favorites', icon: 'favorite', label: 'Favoritos' },
    { to: '/admin/settings', icon: 'settings', label: 'Configuración' },
    { to: '/admin/documentacion', icon: 'menu_book', label: 'Documentación' },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen sticky top-0 shrink-0 z-40 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 w-64 shadow-360 border-r border-slate-200 dark:border-transparent transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between h-[var(--navbar-height)] px-4 border-b border-slate-200 dark:border-transparent shrink-0">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-rose-200 dark:scrollbar-thumb-white/10">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}
