import { useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import CartDrawer from '../CartDrawer';
import StructuredData, { createOrganizationSchema } from '../StructuredData';
import ErrorBoundary from '../ErrorBoundary';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../../context/SettingsContext';
import { BASE_URL } from '@/config/constants';

// Layout wrapper for normal shop pages
export default function ShopLayout({ children }) {
  const location = useLocation();
  const canonicalUrl = `${BASE_URL}${location.pathname}`;
  const settingsContext = useSettings();
  const settings = settingsContext?.settings;
  
  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <StructuredData data={createOrganizationSchema(settings)} />
      <Navbar />
      <CartDrawer />
      <div className="flex-1 shrink-0">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex-1 flex justify-center items-center py-24">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          }>
            {children}
          </Suspense>
        </ErrorBoundary>
      </div>
      <Footer />
    </div>
  );
}
