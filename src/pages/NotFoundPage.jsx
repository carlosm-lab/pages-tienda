import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Página no encontrada - PaGe's</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-9xl font-black text-slate-200 dark:text-slate-800">404</h1>
        <h2 className="text-3xl font-bold mt-4 mb-2">Página no encontrada</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          Lo sentimos, no pudimos encontrar la página que buscas. Es posible que el enlace sea incorrecto o que la página haya sido eliminada.
        </p>
        <Link to="/" className="bg-white dark:bg-white/10 text-slate-900 dark:text-white font-bold py-3 px-8 rounded-full shadow-sm border border-slate-100 dark:border-white/5 hover:bg-slate-50 transition-colors">
          Volver a la Tienda
        </Link>
      </div>
    </>
  );
}
