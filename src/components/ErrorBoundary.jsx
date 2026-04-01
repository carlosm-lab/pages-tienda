import { Component } from 'react';
import { logger } from '@/utils/logger';


export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey) {
      if (this.state.hasError) {
        this.setState({ hasError: false, error: null });
      }
    }
  }

  componentDidCatch(error, errorInfo) {
    logger.error("ErrorBoundary atrapó un error:", error, errorInfo);
    // TODO: Connect to Sentry, Datadog or similar tracking service
    if (typeof window !== 'undefined' && window.trackError) {
      window.trackError('React ErrorBoundary', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-[var(--space-lg)] bg-background-light dark:bg-background-dark text-center">
          <div className="w-[clamp(4rem,10vw,5rem)] aspect-square rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-500 mb-[var(--space-md)]">
            <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-xl)' }}>error</span>
          </div>
          <h1 className="font-serif text-[var(--text-3xl)] md:text-[var(--text-4xl)] text-slate-800 dark:text-slate-100 mb-[var(--space-md)]">
            Algo ha salido mal
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-[28rem] mb-[var(--space-lg)]">
            Ha ocurrido un error inesperado construyendo o cargando la interfaz. Por favor recarga la página o intenta más tarde.
          </p>
          <div className="flex flex-col sm:flex-row gap-[var(--space-sm)]">
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-primary text-white font-bold py-[var(--space-sm)] px-[var(--space-xl)] rounded-full hover:bg-primary/90 transition-colors"
            >
              Volver al inicio
            </button>
            <button 
              onClick={() => {
                // LOW-004: Solo limpiar estado volátil, no destruir el carrito ni los favoritos del usuario
                sessionStorage.clear();
                const appKeys = ['pages_theme', 'last_contact_sent'];
                appKeys.forEach(key => {
                  try { localStorage.removeItem(key); } catch { /* ignore */ }
                });
                window.location.href = '/';
              }}
              className="bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold py-[var(--space-sm)] px-[var(--space-xl)] rounded-full hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
            >
              Limpiar datos y recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
