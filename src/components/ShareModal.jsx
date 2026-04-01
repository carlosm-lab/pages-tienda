import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { logger } from '@/utils/logger';

export default function ShareModal({ isOpen, onClose, product, url }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setTimeout(() => {
        setIsVisible(true);
        setIsCopied(false);
      }, 10);
    } else {
      timer = setTimeout(() => setIsVisible(false), 200); // Wait for transition
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        toast.success('¡Enlace copiado al portapapeles!');
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => {
          setIsCopied(false);
          copyTimeoutRef.current = null;
        }, 2000);
      } else {
        // Fallback: select text in the input field so user can manually copy
        const inputElement = document.getElementById('share-url-input');
        if (inputElement) {
          inputElement.focus();
          inputElement.select();
          toast('Seleccionado. Copia el enlace manualmente (Ctrl+C / Cmd+C)');
        }
      }
    } catch (err) {
      logger.error('Error copiando enlace:', err);
      toast.error('No se pudo copiar el enlace automáticamente');
    }
  };

  const shareText = product 
    ? `Mira este producto en PaGe's Detalles & Más: ${product.name}` 
    : `Mira esto en PaGe's Detalles & Más`;

  const handleWhatsAppShare = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${url}`)}`, '_blank');
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: product?.name || 'Compartir',
        text: shareText,
        url: url
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        logger.error("Error nativo al compartir", err);
        toast.error('Tu navegador no soporta esta opción, intenta copiar el enlace.');
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className={`relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-360 p-6 sm:p-8 transition-all duration-200 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="share-modal-title" className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-primary">share</span>
            Compartir Producto
          </h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Link Copy Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Enlace directo
            </label>
            <div className="flex gap-2">
              <input 
                id="share-url-input"
                type="text" 
                readOnly 
                value={url}
                className="flex-1 w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-slate-400 focus:outline-none"
                onClick={(e) => e.target.select()}
              />
              <button 
                onClick={handleCopy}
                className={`flex items-center justify-center aspect-square w-12 rounded-xl transition-colors ${
                  isCopied 
                    ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:border-green-500/30 dark:text-green-400' 
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
                title="Copiar enlace"
              >
                <span className="material-symbols-outlined">
                  {isCopied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-white/5 my-1" />

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-xl font-semibold transition-colors dark:bg-[#25D366]/20 dark:hover:bg-[#25D366]/30 dark:border-[#25D366]/10"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </button>
            {!!navigator.share && (
              <button 
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl font-semibold transition-colors dark:bg-white/10 dark:text-slate-200 dark:border-white/10 dark:hover:bg-white/20"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>ios_share</span>
                Más
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
