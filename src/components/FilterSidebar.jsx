export default function FilterSidebar({ 
  sidebarCategories, 
  filters, 
  setFilters, 
  handleCategoryClick 
}) {
  return (
    <aside className="hidden lg:flex w-[clamp(14rem,20vw,16rem)] shrink-0 flex-col gap-[var(--space-lg)] sticky top-24 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
      <div>
        <h3 className="text-slate-900 dark:text-slate-100 text-[var(--text-lg)] font-bold mb-[var(--space-md)]">Categorías</h3>
        <div className="flex flex-col gap-[0.25rem]">
          {sidebarCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex items-center justify-between w-full px-[var(--space-sm)] py-[var(--space-sm)] rounded-lg transition-all ${filters.categories.includes(cat.id) ? 'bg-primary text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 dark:hover:text-white'}`}
            >
              <div className="flex items-center gap-[var(--space-sm)]">
                <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-md)' }}>{cat.icon}</span>
                <span className={`text-[var(--text-sm)] ${filters.categories.includes(cat.id) ? 'font-semibold' : 'font-medium'}`}>{cat.name}</span>
              </div>
            </button>
          ))}
        </div>
        
        {/* On Sale Filter */}
        <div className="mt-[var(--space-lg)]">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-[var(--space-md)]">Promociones</h3>
          <label className="flex items-center gap-[var(--space-sm)] cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-300 dark:border-white/5 bg-white dark:bg-white/5 group-hover:border-primary dark:group-hover:border-primary transition-colors">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={filters.onSaleOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, onSaleOnly: e.target.checked }))}
              />
              <div className="absolute inset-0 rounded bg-primary opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-[var(--text-sm)] text-slate-600 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-primary transition-colors cursor-pointer select-none">Solo Ofertas</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
