export default function CategoryChart({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-360 border border-slate-100 dark:border-white/5 h-full">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Distribución por Categorías</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between text-xs mb-1">
                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-8"></div>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate total to find percentages
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // Sort by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 6); // Max 6 categories for aesthetics

  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-360 border border-slate-100 dark:border-white/5 h-full flex flex-col">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Distribución por Categorías</h3>

      {sortedData.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">No hay datos suficientes.</p>
      ) : (
        <div className="space-y-5 flex-1 flex flex-col justify-center">
          {sortedData.map((item, index) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            // Use different colors for the top 3
            const barColors = [
              'bg-primary',
              'bg-blue-500',
              'bg-teal-500',
              'bg-purple-500',
              'bg-amber-500',
              'bg-slate-400'
            ];
            const colorClass = barColors[index % barColors.length];

            return (
              <div key={item.name} className="group">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-4">
                    {item.name || 'Sin categorizar'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                    {item.count} <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">({percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
