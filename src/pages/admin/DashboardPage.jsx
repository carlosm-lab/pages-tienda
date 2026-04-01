import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import StatsCards from '@/components/admin/StatsCards';
import RecentProducts from '@/components/admin/RecentProducts';
import RecentMessages from '@/components/admin/RecentMessages';
import CategoryChart from '@/components/admin/CategoryChart';
import TopFavorites from '@/components/admin/TopFavorites';
import StatDetailModal from '@/components/admin/StatDetailModal';
import { logger } from '@/utils/logger';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOffers: 0,
    unreadMessages: 0,
    totalFavorites: 0,
    totalCategories: 0,
    totalUsers: 0,
  });
  
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topFavorites, setTopFavorites] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedModalType, setSelectedModalType] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      try {
        setLoading(true);

        const { data, error } = await supabase.rpc('get_dashboard_data');

        if (error) {
          logger.error('RPC Error details:', error);
          throw error;
        }
        
        if (!isMounted) return;

        if (data) {
          const source = data.summary || data;
          
          setStats({
            totalProducts: Number(source.totalProducts || 0),
            activeOffers: Number(source.activeOffers || 0),
            unreadMessages: Number(source.unreadMessages || 0),
            totalFavorites: Number(source.totalFavorites || 0),
            totalCategories: Number(source.totalCategories || 0),
            totalUsers: Number(source.totalUsers || 0),
          });

          setRecentProducts(data.recentProducts || []);
          setRecentMessages(data.recentMessages || []);
          setCategoryData(data.categoryData || []);
          setTopFavorites(data.topFavorites || []);
        }

      } catch (error) {
        logger.error('Critical Dashboard Error:', error);
        logger.error('Error fetching dashboard stats:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboardData();

    return () => { isMounted = false; };
  }, []);

  const statCardsData = [
    {
      id: 'products',
      label: 'Productos',
      value: loading ? '...' : stats.totalProducts,
      icon: 'inventory_2',
      colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
    },
    {
      id: 'categories',
      label: 'Categorías',
      value: loading ? '...' : stats.totalCategories,
      icon: 'category',
      colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
    },
    {
      id: 'offers',
      label: 'Ofertas Activas',
      value: loading ? '...' : stats.activeOffers,
      icon: 'local_offer',
      colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
    },
    {
      id: 'messages',
      label: 'Mensajes Nuevos',
      value: loading ? '...' : stats.unreadMessages,
      icon: 'mark_email_unread',
      colorClass: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      value: loading ? '...' : stats.totalFavorites,
      icon: 'favorite',
      colorClass: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
    },
    {
      id: 'users',
      label: 'Usuarios',
      value: loading ? '...' : stats.totalUsers,
      icon: 'group',
      colorClass: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1 md:mb-2">Panel de Control</h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Resumen y estadísticas de tu tienda.</p>
      </div>

      <StatsCards stats={statCardsData} onCardClick={(id) => setSelectedModalType(id)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column - Takes up 2 cols on XL */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">
          <div className="h-[400px]">
             <RecentProducts products={recentProducts} loading={loading} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="h-[350px]">
              <CategoryChart data={categoryData} loading={loading} />
            </div>
            <div className="h-[350px]">
               <TopFavorites products={topFavorites} loading={loading} />
            </div>
          </div>
        </div>

        {/* Right Column - Takes up 1 col on XL */}
        <div className="h-[400px] xl:h-[782px]">
           <RecentMessages messages={recentMessages} loading={loading} />
        </div>
      </div>
      
      <StatDetailModal 
        isOpen={!!selectedModalType} 
        type={selectedModalType} 
        onClose={() => setSelectedModalType(null)} 
      />
    </div>
  );
}
