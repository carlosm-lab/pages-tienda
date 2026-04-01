// ──────────────────────────────────────────────────────────────
// HOOK: useModal (Accesibilidad básica de modales)
// ──────────────────────────────────────────────────────────────
// Gestiona las interacciones comunes de modales:
//   - Escape para cerrar
//   - Click en overlay (backdrop) para cerrar
//   - Focus al primer elemento interactivo al abrir
//
// MED-012: LIMITACIÓN CONOCIDA
// La trampa de foco aquí es BÁSICA — solo enfoca el primer elemento.
// No impide que el usuario haga Tab y salga del modal (violación WCAG).
// Para modales críticos (CartDrawer, MobileFilterDrawer), se usa
// <FocusLock> de 'react-focus-lock' que SÍ atrapa el foco completo.
// Este hook es para modales simples donde FocusLock sería overkill.
// ──────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';

export function useModal({ isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Enfocar el primer elemento interactivo del modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Cerrar al clickear el overlay (no el contenido del modal)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return { modalRef, handleOverlayClick };
}
