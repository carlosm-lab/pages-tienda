import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import { sanitizeInput } from '@/utils/sanitize';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { WHATSAPP_NUMBER, CONTACT_EMAIL, BASE_URL } from '@/config/constants';
import { logger } from '@/utils/logger';


import { Turnstile } from '@marsidev/react-turnstile';

// MED-004: Warn loudly if Turnstile key is missing in production
if (import.meta.env.PROD && !import.meta.env.VITE_TURNSTILE_SITE_KEY) {
  logger.error('⚠️ CRITICAL: VITE_TURNSTILE_SITE_KEY no configurada en producción. El CAPTCHA usa el dummy key que siempre pasa.');
}

export default function ContactPage() {
  const { settings } = useSettings();
  const { user, showAuthModal } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    contact_phone_ext: '' // HIGH-005: Honeypot for bots, less obvious name
  });
  
  // SEC-008: Temporal validation
  const [formStartTime] = useState(Date.now());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Auth guard — form stays visible but submit requires login
    if (!user) {
      showAuthModal('contact');
      return;
    }

    // SEC-008: Honeypot check
    if (formData.contact_phone_ext) return; 

    // SEC-008: Temporal validation (reject if submitted in < 3 seconds)
    if (Date.now() - formStartTime < 3000) {
      toast.error('Por favor, completa el formulario con normalidad.');
      return;
    }

    // SEC-007: Integración con Turnstile
    if (!turnstileToken) {
      toast.error('Por favor, completa la verificación de seguridad (CAPTCHA).');
      return;
    }
    
    // Frontend rate limiting check
    const lastSent = localStorage.getItem('last_contact_sent');
    if (lastSent && Date.now() - parseInt(lastSent, 10) < 60000) { // 1 min buffer client-side
      toast.error('Por favor espera 1 minuto antes de enviar otro mensaje.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      try {
        // TAREA-005: Verificación de Turnstile server-side
        const invokeRes = await supabase.functions.invoke('verify-turnstile', {
          body: { token: turnstileToken }
        });
        
        const turnstileError = invokeRes.error;
        const turnstileData = invokeRes.data;

        if (turnstileError || !turnstileData?.success) {
          logger.error('Error de validación Turnstile desde Edge Function:', turnstileError, turnstileData);
          toast.error('Falló la verificación de seguridad (CAPTCHA). Intenta nuevamente.');
          setTurnstileToken(null);
          turnstileRef.current?.reset();
          setIsSubmitting(false);
          return;
        }
      } catch (networkErr) {
        logger.error('Error fatal o de red al invocar verify-turnstile:', networkErr);
        toast.error('Ocurrió un problema de conexión verificando tu identidad. Intenta en breves segundos.');
        setTurnstileToken(null);
        turnstileRef.current?.reset();
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: sanitizeInput(formData.name).substring(0, 100),
          email: sanitizeInput(formData.email).substring(0, 150),
          subject: sanitizeInput(formData.subject).substring(0, 150),
          message: sanitizeInput(formData.message).substring(0, 1000)
        }]);

      if (error) {
        // Detailed error check
        const errMsg = error.message?.toLowerCase() || '';
        if (errMsg.includes('límite') || errMsg.includes('rate limit')) {
          toast.error(error.message || 'Límite de mensajes excedido');
          return;
        }
        throw error;
      }
      
      localStorage.setItem('last_contact_sent', Date.now().toString());
      toast.success('¡Mensaje enviado con éxito! Te contactaremos pronto.');
      setFormData({ name: '', email: '', subject: '', message: '', contact_phone_ext: '' }); // Clear form
      setTurnstileToken(null); // Reset captcha on success
      
    } catch (error) {
      logger.error('Error al enviar mensaje:', error);
      toast.error('Hubo un error al enviar el mensaje. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen py-[var(--space-xl)] md:py-[var(--space-2xl)]">
      <Helmet>
        <title>Contacto | PaGe's Detalles & Más</title>
        <meta property="og:url" content={`${BASE_URL}/contact`} />
        <meta property="og:image" content={`${BASE_URL}/og-image.png`} />
        <meta name="description" content="Contáctanos para resolver tus dudas sobre compras, pedidos personalizados o envíos en El Salvador." />
      </Helmet>
      
      <div className="w-full mx-auto px-container">
        
        {/* Hero Banner */}
        <div className="relative rounded-[2rem] overflow-hidden bg-white dark:bg-white/5 mb-[var(--space-2xl)] text-slate-900 dark:text-white p-[var(--space-xl)] md:p-[var(--space-3xl)] flex items-center justify-center text-center shadow-sm border border-slate-100 dark:border-white/5">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-slate-100 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-slate-100 dark:bg-black/10 blur-3xl"></div>
          <span className="material-symbols-outlined absolute right-12 top-1/2 -translate-y-1/2 text-[14rem] text-slate-100 dark:text-white/5 -rotate-12 pointer-events-none hidden md:block">support_agent</span>
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <span className="bg-slate-100 text-slate-700 dark:text-white dark:bg-white/10 font-bold tracking-widest uppercase text-[var(--text-xs)] mb-[var(--space-md)] px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/5">Contacto</span>
            <h1 className="text-[var(--text-4xl)] md:text-[var(--text-hero)] font-black tracking-tight mb-[var(--space-md)]">Estamos aquí para ayudarte</h1>
            <p className="text-[var(--text-lg)] text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl font-medium">
              ¿Tienes dudas sobre un pedido personalizado, envíos o nuestros productos? 
              Nos encantaría escucharte. Escríbenos directamente o visítanos en nuestras redes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-xl)] lg:gap-[var(--space-2xl)]">
          
          {/* Info Side */}
          <div className="flex flex-col gap-[var(--space-lg)]">
            <div className="bg-white dark:bg-white/5 p-[var(--space-xl)] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col gap-[var(--space-lg)]">
              <h2 className="text-[var(--text-2xl)] font-bold text-slate-900 dark:text-white mb-[var(--space-xs)]">Información Directa</h2>
              
              <a 
                href={`https://wa.me/${(settings?.contact_phone || WHATSAPP_NUMBER).replace(/\D/g, '')}`} 
                target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-[var(--space-md)] p-[var(--space-md)] rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors group"
              >
                <div className="w-[clamp(2.5rem,6vw,3rem)] aspect-square bg-[#25D366]/10 text-[#25D366] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-lg)' }}>chat</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">WhatsApp / Llamadas</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-[0.25rem] mb-[var(--space-xs)]">{settings?.contact_phone || WHATSAPP_NUMBER}</p>
                  <span className="text-[var(--text-sm)] font-semibold text-[#25D366]">Escríbenos ahora &rarr;</span>
                </div>
              </a>

              <a 
                href={`mailto:${settings?.contact_email || CONTACT_EMAIL}`} 
                className="flex items-start gap-[var(--space-md)] p-[var(--space-md)] rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors group"
              >
                <div className="w-[clamp(2.5rem,6vw,3rem)] aspect-square bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-slate-800 dark:group-hover:bg-slate-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-lg)' }}>mail</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Email Directo</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-[0.25rem] mb-[var(--space-xs)] text-[var(--text-sm)] break-all">{settings?.contact_email || CONTACT_EMAIL}</p>
                  <span className="text-[var(--text-sm)] font-semibold text-slate-600 dark:text-slate-300">Enviar un correo &rarr;</span>
                </div>
              </a>

              <div className="flex items-start gap-[var(--space-md)] p-[var(--space-md)] rounded-2xl">
                <div className="w-[clamp(2.5rem,6vw,3rem)] aspect-square bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-lg)' }}>schedule</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Horario de Atención</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-[0.25rem]">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                  <p className="text-slate-500 dark:text-slate-400">Sábado: 10:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>

            {/* Freq Questions Hint */}
            <div className="bg-white dark:bg-white/5 rounded-3xl p-[var(--space-xl)] text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-[var(--space-md)] opacity-5 dark:opacity-10">
                 <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-hero)' }}>help_center</span>
               </div>
               <h3 className="text-[var(--text-xl)] font-bold mb-[var(--space-sm)] relative z-10">¿Buscas respuestas rápidas?</h3>
               <p className="text-slate-500 dark:text-slate-400 mb-[var(--space-lg)] relative z-10">
                 Si tienes preguntas sobre envíos, materiales y tiempos de entrega envianos un mensaje por whatsapp, llena el formulario o usa nuestras redes sociales.
               </p>
               <a 
                 href={`https://wa.me/${(settings?.contact_phone || WHATSAPP_NUMBER).replace(/\D/g, '')}?text=${encodeURIComponent('¡Hola! Necesito hacer una pregunta frecuente.')}`} 
                 target="_blank" rel="noopener noreferrer"
                 className="bg-primary text-white px-[var(--space-lg)] py-[var(--space-sm)] rounded-xl font-bold text-[var(--text-sm)] tracking-wide uppercase hover:bg-primary/90 transition-colors relative z-10 inline-block shadow-md shadow-black/10"
               >
                  Preguntar por WhatsApp
               </a>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white dark:bg-white/5 rounded-2xl shadow-360 border border-slate-100 dark:border-white/5 p-[var(--space-xl)] md:p-[var(--space-2xl)] h-full">
            <h2 className="text-[var(--text-2xl)] font-bold text-slate-900 dark:text-white mb-[var(--space-lg)]">Envíanos un mensaje</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-[var(--space-lg)] pb-[var(--space-3xl)]">
              {/* MED-S01: Honeypot field — off-viewport instead of className="hidden" to evade smart bots */}
              <input type="text" name="contact_phone_ext" value={formData.contact_phone_ext} onChange={handleChange} style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }} tabIndex="-1" autoComplete="off" aria-hidden="true" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-lg)]">
                <div>
                  <label htmlFor="name" className="block text-[var(--text-xs)] font-medium text-slate-700 dark:text-slate-300 mb-[var(--space-xs)]">Nombre completo</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-transparent dark:text-white focus:ring-2 focus:ring-primary/20 transition-colors px-4 py-2"
                    placeholder="Tu nombre aquí"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-[var(--text-xs)] font-medium text-slate-700 dark:text-slate-300 mb-[var(--space-xs)]">Correo electrónico</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-transparent dark:text-white focus:ring-2 focus:ring-primary/20 transition-colors px-4 py-2"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-[var(--text-xs)] font-medium text-slate-700 dark:text-slate-300 mb-[var(--space-xs)]">Motivo del mensaje</label>
                <select 
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-background-dark dark:text-white focus:ring-2 focus:ring-primary/20 transition-colors px-4 py-2"
                >
                  <option value="" disabled className="dark:bg-background-dark">Selecciona una opción</option>
                  <option value="Consulta sobre un producto" className="dark:bg-background-dark">Consulta sobre un producto</option>
                  <option value="Pedido Especial / Personalizado" className="dark:bg-background-dark">Pedido Especial / Personalizado</option>
                  <option value="Información de Envíos" className="dark:bg-background-dark">Información de Envíos</option>
                  <option value="Problema con mi pedido" className="dark:bg-background-dark">Problema con mi pedido</option>
                  <option value="Otro" className="dark:bg-background-dark">Otro</option>
                </select>
              </div>

              <div className="flex-1 flex flex-col">
                <label htmlFor="message" className="block text-[var(--text-xs)] font-medium text-slate-700 dark:text-slate-300 mb-[var(--space-xs)]">Mensaje</label>
                <textarea 
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  maxLength={1000}
                  className="w-full shrink-0 min-h-[8rem] flex-1 rounded-lg border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-transparent dark:text-white focus:ring-2 focus:ring-primary/20 transition-colors resize-none px-4 py-2"
                  placeholder="¿Cómo podemos ayudarte?"
                ></textarea>
              </div>

              <div className="pt-[var(--space-xs)] flex flex-col items-center gap-3">
                 <div className="w-full flex justify-center mb-2">
                   {/* En Producción, NUNCA usar la llave dummy. En Dev, sí. */}
                   {import.meta.env.PROD && !import.meta.env.VITE_TURNSTILE_SITE_KEY ? (
                     <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
                       Error de configuración: CAPTCHA no disponible.
                     </div>
                   ) : (
                     <Turnstile 
                       ref={turnstileRef}
                       siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY} 
                       onSuccess={(token) => setTurnstileToken(token)}
                       onError={() => setTurnstileToken(null)}
                       onExpire={() => setTurnstileToken(null)}
                     />
                   )}
                 </div>
                 <button 
                  type="submit"
                  disabled={isSubmitting || !turnstileToken}
                  className="w-full bg-primary text-white font-bold py-3 rounded-lg flex justify-center items-center gap-[var(--space-xs)] hover:bg-primary/90 transition-colors shadow-md hover:shadow-360 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isSubmitting ? (
                     <><span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> Enviando...</>
                   ) : (
                     <>
                       <span>Enviar Mensaje</span>
                       <span className="material-symbols-outlined text-[18px]">send</span>
                     </>
                   )}
                 </button>
                 <a 
                   href={`https://wa.me/${(settings?.contact_phone || WHATSAPP_NUMBER).replace(/\D/g, '')}?text=${encodeURIComponent('¡Hola! Quisiera más información.')}`}
                   target="_blank" rel="noopener noreferrer"
                   className="text-center text-[var(--text-sm)] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                 >
                   O si prefieres, <span className="underline font-medium">escríbenos por WhatsApp</span>
                 </a>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
