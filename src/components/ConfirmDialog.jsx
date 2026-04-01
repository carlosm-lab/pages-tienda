import { useEffect, useRef } from 'react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'danger' // 'danger' | 'warning' | 'info'
}) {
  const dialogRef = useRef(null);

  // Auto-focus logic and escape key listener
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onCancel();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: 'warning',
      iconColor: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-400/10',
      confirmBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20'
    },
    warning: {
      icon: 'error',
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-400/10',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20'
    },
    info: {
      icon: 'info',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-400/10',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
    }
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div 
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        tabIndex="-1"
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 focus:outline-none border border-slate-100 dark:border-white/5"
      >
        <div className="p-[var(--space-xl)] sm:p-[var(--space-2xl)]">
          <div className="flex items-start gap-[var(--space-md)] sm:gap-[var(--space-lg)]">
            <div className={`mt-0.5 shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${config.iconBg}`}>
              <span className={`material-symbols-outlined ${config.iconColor}`} style={{ fontSize: 'var(--icon-md)' }}>
                {config.icon}
              </span>
            </div>
            
            <div className="flex-1 text-left">
              <h3 
                className="text-[var(--text-xl)] font-bold text-slate-900 dark:text-white mb-[var(--space-xs)]" 
                id="modal-headline"
              >
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-[var(--text-sm)] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 px-[var(--space-xl)] py-[var(--space-md)] sm:px-[var(--space-2xl)] sm:flex sm:flex-row-reverse sm:gap-[var(--space-sm)] border-t border-slate-100 dark:border-white/5">
          <button
            type="button"
            className={`w-full inline-flex justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-all sm:ml-3 sm:w-auto ${config.confirmBtn}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-xl bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors sm:mt-0 sm:w-auto"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
