// ──────────────────────────────────────────────────────────────
// HOOK: useDebounce
// ──────────────────────────────────────────────────────────────
// Debounce genérico de valores. Espera `delay` ms después del
// último cambio antes de actualizar el valor devuelto.
//
// Se usa en:
//   - useProducts: para demorar búsquedas mientras el usuario escribe (350ms)
//   - ProductsPage (admin): para demorar filtros de búsqueda (500ms)
//
// Esto evita hacer una query a Supabase por cada keystroke,
// lo que sería caro en red y en rate limits.
// ──────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Si cambia el valor antes de que se cumpla el delay,
    // se cancela el timer anterior y se inicia otro.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
