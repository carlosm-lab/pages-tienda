import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import MessageCard from '@/components/admin/MessageCard';
import { logger } from '@/utils/logger';
import { useConfirm } from '@/context/ConfirmContext';


export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('unread');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const showToast = (message, isError = false) => {
    if (isError) toast.error(message);
    else toast.success(message);
  };

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('contact_messages')
        .select('id, name, email, subject, message, created_at, is_read')
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'read') {
        query = query.eq('is_read', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      logger.error('Error fetching messages:', error);
      showToast('Error cargando mensajes', true);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      toggleReadStatus(message.id, true);
    }
  };

  const toggleReadStatus = async (id, newStatus) => {
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: newStatus } : m));
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: newStatus })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      logger.error('Error updating message:', error);
      showToast('Error al actualizar', true);
      fetchMessages(); // Revert on error
    }
  };

  const confirm = useConfirm();

  const deleteMessage = async (id) => {
    const isConfirmed = await confirm({
      title: 'Eliminar mensaje',
      message: '¿Eliminar este mensaje permanentemente? No podrá ser recuperado.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    
    if (!isConfirmed) return;
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== id));
      showToast('Mensaje eliminado');
    } catch (error) {
      logger.error('Error deleting message:', error);
      showToast('Error al eliminar', true);
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="flex flex-col h-full max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            Bandeja de Entrada
            {unreadCount > 0 && filter === 'unread' && (
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount} nuevos
              </span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Consultas desde el formulario de contacto. (Los mensajes se borran auto a los 30 días).
          </p>
        </div>

        {/* Filters */}
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-full sm:w-auto self-start sm:self-auto">
          <button 
            onClick={() => setFilter('unread')}
            className={`flex-1 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${filter === 'unread' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            No Leídos
          </button>
          <button 
            onClick={() => setFilter('read')}
            className={`flex-1 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${filter === 'read' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Leídos
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white dark:bg-white/5 rounded-2xl shadow-360 border border-slate-100 dark:border-white/5 overflow-hidden flex-1">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500">Cargando mensajes...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-transparent rounded-full flex items-center justify-center text-slate-400 mb-4">
              <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">¡Bandeja vacía!</h3>
            <p className="text-slate-500">No tienes {filter === 'unread' ? 'mensajes nuevos' : filter === 'read' ? 'mensajes leídos' : 'mensajes'} en este momento.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {messages.map(message => (
              <MessageCard 
                key={message.id} 
                message={message} 
                onClick={() => handleSelectMessage(message)} 
                onDelete={deleteMessage} 
              />
            ))}
          </div>
        )}
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedMessage(null)}>
          <div 
            className="bg-white dark:bg-white/5 w-full max-w-2xl rounded-3xl shadow-360 flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <span className="material-symbols-outlined text-primary">mail</span>
                Asunto: {selectedMessage.subject || 'Sin asunto'}
              </h2>
              <button onClick={() => setSelectedMessage(null)} className="p-2 rounded-full hover:bg-gray-100 dark:bg-gray-800 transition-colors text-slate-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 max-h-[60vh]">
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{selectedMessage.name}</h3>
                  <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">{selectedMessage.email}</a>
                </div>
                <span className="text-sm text-slate-500">
                  {new Date(selectedMessage.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 bg-slate-50 dark:bg-white/5">
               <button 
                onClick={() => {
                  deleteMessage(selectedMessage.id);
                  setSelectedMessage(null);
                }}
                className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
               >
                 <span className="material-symbols-outlined text-[18px]">delete</span>
                 Eliminar
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
