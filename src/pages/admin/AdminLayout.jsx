import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/admin/Sidebar';
import AdminFooterBar from '@/components/admin/AdminFooterBar';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import UserAvatar from '@/components/ui/UserAvatar';

export default function AdminLayout() {
  const { user } = useAuth();


  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-transparent font-sans pb-16 md:pb-0">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* 
         * LOW-011: Estrategia de Layout del Header
         * Se utiliza flex-col en el main contenedor con h-screen y overflow-hidden.
         * El header usa shrink-0 para mantener su altura fija definida por var(--navbar-height),
         * previniendo layout shifts y delegando el scroll y overflow al contenedor inferior
         * (Page Content) que usa flex-1. Esto mejora el performance al evitar repaints del header.
         */}
        {/* Desktop Header Top Bar */}
        <header className="hidden md:flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-background-light/90 dark:bg-background-dark/80 backdrop-blur-md px-[clamp(1rem,3vw,2rem)] h-[var(--navbar-height)] shrink-0">
          <div className="flex-1">
            {/* Breadcrumbs or page title placeholder */}
          </div>
          <div className="flex items-center gap-[clamp(0.25rem,1vw,1rem)]">
            <Link 
              to="/"
              className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-white dark:bg-white/10 shadow-sm border border-slate-100 dark:border-white/5 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/20 transition-colors shrink-0"
              title="Volver a la tienda"
            >
              <span className="material-symbols-outlined">storefront</span>
            </Link>
            <ThemeToggle />
            <div className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] overflow-hidden shrink-0">
              <UserAvatar user={user} className="w-full h-full" />
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-background-light/90 dark:bg-background-dark/80 backdrop-blur-md px-container h-[var(--navbar-height)] shrink-0 relative z-40">
          <div className="flex items-center gap-[clamp(1rem,3vw,2rem)]">
            <Logo />
          </div>
          <div className="flex items-center gap-[clamp(0.25rem,1vw,1rem)]">
            <Link 
              to="/"
              className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-white dark:bg-white/10 shadow-sm border border-slate-100 dark:border-white/5 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/20 transition-colors shrink-0"
              title="Volver a la tienda"
            >
              <span className="material-symbols-outlined">storefront</span>
            </Link>
            <ThemeToggle />
            <div className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] overflow-hidden shrink-0">
              <UserAvatar user={user} className="w-full h-full" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="mx-auto max-w-6xl pb-32 md:pb-8">
            <Outlet />
          </div>
        </div>
      </main>
      
      <AdminFooterBar />
    </div>
  );
}
