// ──────────────────────────────────────────────────────────────
// CONTEXTO DE CONFIRMACIÓN (Dialogo global)
// ──────────────────────────────────────────────────────────────
// Provee un diálogo de confirmación global basado en Promises.
//
// En vez de que cada componente tenga su propio modal de
// confirmación (con su propio state), se usa un único
// ConfirmDialog renderizado aquí y accesible desde cualquier
// componente vía useConfirm().
//
// API:
//   const confirm = useConfirm();
//   const accepted = await confirm({
//     title: 'Eliminar producto',
//     message: '¿Seguro?',
//     type: 'danger', // 'danger' | 'warning' | 'info'
//   });
//   if (accepted) { /* borrar */ }
//
// La magia está en la Promise: confirm() retorna una Promise
// que se resuelve con true (confirmar) o false (cancelar).
// El resolver se guarda en el state y se llama cuando el
// usuario interactúa con el diálogo.
// ──────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'danger',
    resolve: null  // La función resolve de la Promise
  });

  /**
   * Abre el diálogo y retorna una Promise que se resuelve
   * cuando el usuario confirma (true) o cancela (false).
   */
  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Confirmar acción',
        message: options.message || '¿Estás seguro?',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        type: options.type || 'danger',
        resolve
      });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
