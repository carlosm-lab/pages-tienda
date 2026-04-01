import { NavLink } from 'react-router-dom';

export default function AdminFooterBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-200 dark:border-white/5 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex items-center justify-around h-16">
        <NavLink to="/admin" end className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-400/70'}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>dashboard</span>
          <span className="text-[10px] font-semibold">Inicio</span>
        </NavLink>
        <NavLink to="/admin/products" className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-400/70'}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>inventory_2</span>
          <span className="text-[10px] font-semibold">Productos</span>
        </NavLink>
        <NavLink to="/admin/categories" className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-400/70'}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>category</span>
          <span className="text-[10px] font-semibold">Catálogos</span>
        </NavLink>
        <NavLink to="/admin/messages" className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-400/70'}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>mail</span>
          <span className="text-[10px] font-semibold">Mensajes</span>
        </NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-400/70'}`}>
           <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>settings</span>
           <span className="text-[10px] font-semibold">Ajustes</span>
        </NavLink>
        <NavLink to="/admin/documentacion" className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-400/70'}`}>
           <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>menu_book</span>
           <span className="text-[10px] font-semibold">Docs</span>
        </NavLink>
      </div>
    </nav>
  );
}
