// ──────────────────────────────────────────────────────────────
// HOOK: useBodyScrollLock
// ──────────────────────────────────────────────────────────────
// Bloquea el scroll del body cuando hay un modal/drawer abierto.
// Usa un CONTADOR GLOBAL para manejar modales anidados correctamente:
//   - CartDrawer abierto (lockCount=1) → LoginModal encima (lockCount=2)
//   - Cerrar LoginModal (lockCount=1) → scroll sigue bloqueado
//   - Cerrar CartDrawer (lockCount=0) → scroll restaurado
//
// El truco de position:fixed + top:-scrollY preserva la posición
// de scroll visual del usuario. Sin esto, al bloquear el scroll
// la página salta al tope (un bug clásico en implementaciones naive).
//
// OJO: en iOS Safari, overflow:hidden en el body no funciona
// del todo — por eso usamos position:fixed como backup.
// ──────────────────────────────────────────────────────────────
import { useEffect } from 'react';

// Contador global de módulo — compartido entre todas las instancias
let lockCount = 0;
let initialScrollY = 0;

export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (isLocked) {
      if (lockCount === 0) {
        // Primer bloqueo: guardar posición y fijar el body
        initialScrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${initialScrollY}px`;
        document.body.style.width = '100%';
      }
      lockCount++;

      return () => {
        lockCount = Math.max(0, lockCount - 1);
        if (lockCount === 0 && document.body.style.position === 'fixed') {
          // Último bloqueo liberado: restaurar scroll
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          window.scrollTo(0, initialScrollY);
        }
      };
    }
  }, [isLocked]);
}
