export default function StatsCards({ stats, onCardClick }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-4 md:gap-6 mb-8">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          onClick={() => onCardClick && onCardClick(stat.id)}
          className={`bg-white dark:bg-white/5 rounded-2xl p-4 md:p-5 shadow-360 border border-slate-100 dark:border-white/5 flex flex-col gap-3 md:gap-4 hover:shadow-2xl transition-all duration-300 group overflow-hidden ${onCardClick ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center justify-between w-full">
            <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${stat.colorClass || 'bg-slate-100 text-primary'}`}>
              <span className="material-symbols-outlined text-[18px] md:text-[22px]">
                {stat.icon}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {stat.value}
            </h3>
          </div>
          <div className="w-full text-center">
            <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider line-clamp-1">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
