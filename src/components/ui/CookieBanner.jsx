import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay so it slides in nicely
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none"
        >
          <div className="container mx-auto max-w-5xl pointer-events-auto">
            <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-100 dark:border-white/10 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                <div className="flex items-center gap-2 mb-2 sm:mb-1">
                  <span className="material-symbols-outlined text-primary text-[20px]">cookie</span>
                  <span className="font-bold text-slate-800 dark:text-white">Uso de Cookies</span>
                </div>
                Utilizamos cookies para mejorar tu experiencia en nuestro sitio y analizar el tráfico. 
                Revisa nuestra <Link to="/privacy" className="text-primary font-bold hover:underline">Política de Privacidad</Link> para más detalles.
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                <button
                  onClick={handleAccept}
                  className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
