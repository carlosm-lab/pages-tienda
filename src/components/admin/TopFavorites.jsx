import { formatPrice } from '@/utils/formatPrice';

export default function TopFavorites({ products, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-360 border border-slate-100 dark:border-white/5 h-full">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top Favoritos</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 items-center animate-pulse">
               <div className="w-10 h-10 bg-slate-200 dark:bg-white/10 rounded w-10 shrink-0"></div>
               <div className="flex-1 space-y-2">
                 <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-3/4"></div>
               </div>
               <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-full shrink-0"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-360 border border-slate-100 dark:border-white/5 h-full flex flex-col">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top Favoritos</h3>

      {products.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">Nadie ha guardado favoritos aún.</p>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {products.map((product, idx) => (
              <li key={product.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-white/10 overflow-hidden">
                      {product.image_path ? (
                        <img 
                          src={product.image_path} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <span className="material-symbols-outlined text-[20px]">image</span>
                        </div>
                      )}
                    </div>
                    {/* Rank badge */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-white/5 shadow-md">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {product.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-pink-50 dark:bg-pink-900/10 rounded-lg px-3 py-1.5 shrink-0">
                  <span className="material-symbols-outlined text-pink-500 text-[16px] mb-0.5 filled">favorite</span>
                  <span className="text-xs font-bold text-pink-600 dark:text-pink-400">{product.fav_count}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
