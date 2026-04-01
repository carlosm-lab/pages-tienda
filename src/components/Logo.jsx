import { Link } from 'react-router-dom';

export default function Logo({ textOnly, iconOnlyMobile, className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-[clamp(0.375rem,1.125vw,0.5625rem)] text-primary shrink-0 ${className}`}>
      {!textOnly && (
        <img 
          src="/logo-red.svg" 
          alt="PaGe´s logo" 
          className="h-[clamp(1.5rem,2.5vw,2rem)] w-auto object-contain"
        />
      )}
      <div className={`flex flex-col justify-center ${iconOnlyMobile ? 'hidden sm:flex' : 'flex'}`}>
        <div className="flex justify-between w-full text-slate-900 dark:text-slate-100 text-[clamp(0.875rem,1.4vw,1.125rem)] font-brand font-bold leading-none whitespace-nowrap tracking-tight">
          <span>P</span><span>a</span><span>G</span><span>e</span><span>´s</span>
        </div>
        <span className="text-primary text-[clamp(0.375rem,0.65vw,0.5rem)] font-bold tracking-[0.15em] uppercase whitespace-nowrap mt-[0.125rem] text-center">Detalles &amp; Más</span>
      </div>
    </Link>
  );
}
