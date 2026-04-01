import FocusLock from 'react-focus-lock';

export default function MobileFilterDrawer({
  isFilterDrawerOpen,
  setIsFilterDrawerOpen,
  sidebarCategories,
  filters,
  setFilters,
  handleCategoryClick,
  sortBy,
  setSortBy,
  hasActiveFilters,
  handleClearFilters,
  totalCount
}) {
  return (
    <>
      {/* Mobile Filter Drawer Backdrop */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 cursor-pointer lg:hidden" onClick={() => setIsFilterDrawerOpen(false)} />
      )}

      {/* Mobile Filter Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
        className={`fixed inset-y-0 right-0 w-full max-w-[22rem] bg-white dark:bg-white/5 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:hidden ${isFilterDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <FocusLock returnFocus className="flex flex-col h-full w-full">
        {/* Drawer Header */}
        <div className="flex justify-between items-center px-[var(--space-lg)] py-[var(--space-md)] border-b border-slate-200 dark:border-transparent">
          <h2 id="filter-drawer-title" className="text-[var(--text-lg)] font-bold text-slate-900 dark:text-white">Filtros y Orden</h2>
          <button onClick={() => setIsFilterDrawerOpen(false)} className="p-[var(--space-xs)] text-slate-500 dark:text-slate-400 hover:text-primary rounded-lg transition-colors" aria-label="Cerrar filtros">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-[var(--space-lg)] py-[var(--space-lg)] flex flex-col gap-[var(--space-lg)]">
          
          {/* Sort */}
          <div>
            <h3 id="sort-label" className="text-[var(--text-sm)] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-[var(--space-sm)]">Ordenar por</h3>
            <div role="group" aria-labelledby="sort-label" className="flex flex-col gap-[0.25rem]">
              {[
                { value: 'best-selling', label: 'Recomendados', icon: 'trending_up' },
                { value: 'newest', label: 'Más Nuevos', icon: 'schedule' },
                { value: 'price-low', label: 'Menor a Mayor Precio', icon: 'arrow_upward' },
                { value: 'price-high', label: 'Mayor a Menor Precio', icon: 'arrow_downward' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`flex items-center gap-[var(--space-sm)] w-full px-[var(--space-sm)] py-[var(--space-sm)] rounded-lg transition-all ${sortBy === opt.value ? 'bg-primary text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 dark:hover:text-white'}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 'var(--icon-md)' }}>{opt.icon}</span>
                  <span className={`text-[var(--text-sm)] ${sortBy === opt.value ? 'font-semibold' : 'font-medium'}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-transparent"></div>

          {/* Categories */}
          <div>
            <h3 className="text-[var(--text-sm)] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-[var(--space-sm)]">Categorías</h3>
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
          </div>

          <div className="border-t border-slate-200 dark:border-transparent"></div>

          {/* Promociones */}
          <div>
            <h3 className="text-[var(--text-sm)] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-[var(--space-sm)]">Promociones</h3>
            <label className="flex items-center gap-[var(--space-sm)] cursor-pointer group px-[var(--space-sm)] py-[var(--space-sm)]">
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

        {/* Drawer Footer */}
        <div className="px-[var(--space-lg)] py-[var(--space-md)] border-t border-slate-200 dark:border-transparent flex gap-[var(--space-sm)]">
          {hasActiveFilters && (
            <button
              onClick={() => {
                handleClearFilters();
                setSortBy('best-selling');
              }}
              className="flex-1 py-[var(--space-sm)] rounded-xl border border-slate-200 dark:border-transparent text-primary font-semibold text-[var(--text-sm)] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              Limpiar todo
            </button>
          )}
          <button
            onClick={() => setIsFilterDrawerOpen(false)}
            className="flex-1 py-[var(--space-sm)] rounded-xl bg-primary text-white font-semibold text-[var(--text-sm)] hover:bg-primary/90 transition-colors"
          >
            Ver {totalCount} producto{totalCount !== 1 ? 's' : ''}
          </button>
        </div>
        </FocusLock>
      </div>
    </>
  );
}
