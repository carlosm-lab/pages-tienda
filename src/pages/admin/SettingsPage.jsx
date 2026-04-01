import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import StoreSettingsForm from '@/components/admin/StoreSettingsForm';
import StoreCategoryImagesForm from '@/components/admin/StoreCategoryImagesForm';
import { useConfirm } from '@/context/ConfirmContext';
import { logger } from '@/utils/logger';


export default function SettingsPage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (message, isError = false) => {
    if (isError) toast.error(message);
    else toast.success(message);
  };

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      // Idealmente traeríamos data de auth.users usando un Edge Function como Admin,
      // pero con el cliente solo podemos ver public.profiles si las políticas RLS lo permiten.
      // Modificamos la migración RLS para que admins puedan leer todos los profiles.
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, email, created_at');
        
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      logger.error('Error fetching profiles:', error);
      showToast('Error cargando usuarios', true);
    } finally {
      setIsLoading(false);
    }
  }, []); // Not depending on user id here since it's just fetching all

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleRoleChange = async (id, newRole) => {
    if (id === user?.id) {
      showToast('No puedes cambiar tu propio rol por seguridad.', true);
      return;
    }

    const isConfirmed = await confirm({
      title: 'Cambiar rol de usuario',
      message: `¿Estás seguro de cambiar el rol a ${newRole === 'admin' ? 'Administrador' : 'Usuario'}?`,
      confirmText: 'Sí, cambiar',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .rpc('change_user_role', { target_id: id, new_role: newRole });

      if (error) throw error;
      showToast('Rol actualizado exitosamente.');
      fetchProfiles();
    } catch (error) {
      logger.error('Error updating role:', error);
      showToast('Error al actualizar rol', true);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Configuración</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Administra los accesos y configuraciones generales del sistema.
        </p>
      </div>

      {/* Store Settings Form */}
      <StoreSettingsForm showToast={showToast} />

      {/* Category Images Form */}
      <StoreCategoryImagesForm showToast={showToast} />

      {/* Users Settings */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-360 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">group</span>
            Gestión de Usuarios App
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Asigna privilegios de administrador a otras cuentas para que puedan gestionar la tienda.
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
             <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-transparent/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Usuario (Email / ID)</th>
                  <th className="px-6 py-4 font-semibold text-center">Rol en App</th>
                  <th className="px-6 py-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {profiles.map(profile => (
                  <tr key={profile.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${profile.id === user?.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      <div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{profile.email || 'Sin correo registrado'}</span>
                      </div>
                      <div className="text-xs mt-1">
                        {profile.id}
                        {profile.id === user?.id && <span className="ml-2 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-[10px] font-bold">Tú</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        profile.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                          : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'
                      }`}>
                        {profile.role === 'admin' ? 'Administrador' : 'Usuario P.'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {profile.id !== user?.id && (
                        <select
                          value={profile.role}
                          onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                          className="bg-white dark:bg-transparent border border-slate-200 dark:border-white/5 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-primary/20 cursor-pointer text-slate-700 dark:text-slate-300"
                        >
                          <option value="user">Hacer Usuario</option>
                          <option value="admin">Hacer Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
