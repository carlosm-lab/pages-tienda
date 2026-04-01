import { useState, useEffect, useRef } from 'react';

let tickListeners = new Set();
let globalInterval = null;

function subscribeToTick(cb) {
  tickListeners.add(cb);
  if (!globalInterval) {
    globalInterval = setInterval(() => {
      tickListeners.forEach(l => l());
    }, 1000);
  }
  return () => {
    tickListeners.delete(cb);
    if (tickListeners.size === 0) {
      clearInterval(globalInterval);
      globalInterval = null;
    }
  };
}

/**
 * OfferCountdown - Muestra un timer regresivo para ofertas.
 * Si la oferta aún no inicia (programada), muestra "Oferta inicia en...".
 * Si la oferta está activa, muestra "Oferta termina en...".
 * 
 * Props:
 *   - offer_ends_at: string (ISO date) - Fecha de fin de la oferta
 *   - offer_starts_at: string (ISO date) | null - Fecha de inicio programada
 *   - variant: 'card' | 'detail' - Estilo visual
 *   - onExpire: () => void - Callback cuando la oferta expira o inicia (para refrescar datos)
 */
export default function OfferCountdown({ offer_ends_at, offer_starts_at, variant = 'card', onExpire }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const expiredRef = useRef(false);

  const calculateRef = useRef();

  useEffect(() => {
    expiredRef.current = false;
  }, [offer_ends_at, offer_starts_at]);

  // Maintain fresh reference to logic without re-subscribing
  useEffect(() => {
    calculateRef.current = () => {
      const now = new Date();

      if (offer_starts_at && new Date(offer_starts_at) > now) {
        setIsScheduled(true);
        const diff = new Date(offer_starts_at) - now;
        setTimeLeft(parseDiff(diff));
        return;
      }

      if (isScheduled) {
        setIsScheduled(false);
        if (!expiredRef.current && onExpire) {
          expiredRef.current = true;
          onExpire();
        }
      }

      setIsScheduled(false);

      if (!offer_ends_at) {
        setTimeLeft(null);
        return;
      }

      const diff = new Date(offer_ends_at) - now;
      if (diff <= 0) {
        setTimeLeft(null);
        if (!expiredRef.current && onExpire) {
          expiredRef.current = true;
          onExpire();
        }
        return;
      }

      setTimeLeft(parseDiff(diff));
    };
  }); // Runs after every render to keep ref updated

  useEffect(() => {
    // Single subscription for the lifetime of the component
    const tick = () => {
      if (calculateRef.current) calculateRef.current();
    };
    
    // Initial calculation to prevent 1-second delay
    tick();
    
    return subscribeToTick(tick);
  }, []);

  if (!timeLeft) return null;

  const { days, hours, minutes, seconds } = timeLeft;

  // Determinar urgencia visual
  const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
  const isUrgent = !isScheduled && totalSeconds < 3600; // Última hora

  if (variant === 'card') {
    return (
      <div className={`flex items-center gap-1 text-[clamp(0.55rem,1.2vw,0.65rem)] font-bold mt-1 ${
        isScheduled 
          ? 'text-blue-500 dark:text-blue-400'
          : isUrgent 
            ? 'text-red-500 dark:text-red-400 animate-pulse' 
            : 'text-amber-600 dark:text-amber-400'
      }`}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
          {isScheduled ? 'schedule' : 'timer'}
        </span>
        <span>
          {isScheduled ? 'Inicia en: ' : ''}
          {days > 0 && `${days}d `}{hours > 0 && `${hours}h `}{minutes}m {seconds}s
        </span>
      </div>
    );
  }

  // variant === 'detail'
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mt-2 text-sm font-bold ${
      isScheduled
        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
        : isUrgent
          ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 animate-pulse'
          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
    }`}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
        {isScheduled ? 'schedule' : 'timer'}
      </span>
      <div>
        <span className="block text-xs opacity-75">
          {isScheduled ? 'Oferta inicia en' : 'Oferta termina en'}
        </span>
        <span className="tabular-nums">
          {days > 0 && <>{days}<span className="text-xs opacity-60">d</span> </>}
          {hours > 0 && <>{hours}<span className="text-xs opacity-60">h</span> </>}
          {minutes}<span className="text-xs opacity-60">m</span>{' '}
          {seconds}<span className="text-xs opacity-60">s</span>
        </span>
      </div>
    </div>
  );
}

function parseDiff(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}
