export default function MessageCard({ message, onClick, onDelete }) {
  const date = new Date(message.created_at).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div 
      className={`p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${!message.is_read ? 'bg-blue-50/80 dark:bg-white/10' : ''}`}
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        
        {/* Avatar/Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!message.is_read ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500'}`}>
          <span className="material-symbols-outlined text-[20px]">
            {message.is_read ? 'drafts' : 'mail'}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium truncate ${!message.is_read ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
              {message.name} <span className="text-sm font-normal text-slate-500 ml-2">&lt;{message.email}&gt;</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
              <span className="font-medium mr-2">{message.subject || 'Sin asunto'}</span>
              - {message.message}
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-xs text-slate-500 whitespace-nowrap">{date}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(message.id); }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Eliminar mensaje"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
