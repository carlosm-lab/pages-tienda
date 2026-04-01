import { Link } from 'react-router-dom';

export default function RecentMessages({ messages, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-360 border border-slate-100 dark:border-white/5 h-full">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Mensajes Recientes</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex flex-col gap-2 p-3 border border-slate-100 dark:border-white/5 rounded-xl">
              <div className="flex justify-between items-center bg-slate-200 dark:bg-white/10 h-4 rounded w-full mb-1"></div>
              <div className="bg-slate-200 dark:bg-white/10 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-360 border border-slate-100 dark:border-white/5 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mensajes Recientes</h3>
        <Link to="/admin/messages" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          Ver todos
        </Link>
      </div>

      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center">
           <div className="flex flex-col items-center text-slate-400 dark:text-slate-500">
             <span className="material-symbols-outlined text-4xl mb-2 opacity-50">mark_email_read</span>
             <p className="text-sm">No hay mensajes nuevos.</p>
           </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 px-1">
          {messages.map(msg => (
            <div key={msg.id} className="p-3 border border-slate-100 dark:border-white/5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <div className="flex justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {msg.name}
                </p>
                <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                  {new Date(msg.created_at).toLocaleDateString('es-SV', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
