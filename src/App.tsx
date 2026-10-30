import React, { useEffect, lazy, Suspense } from 'react';
import { Layout } from './components/layout';
import { useAppStore } from './store/appStore';
import { useFarmingStore } from './store/farmingStore';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Lazy load pages
const CommandCenter = lazy(() => import('./modules/farming/pages/CommandCenter'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const DocumentDashboard = lazy(() => import('./pages/DocumentDashboard'));
const FarmLocations = lazy(() => import('./modules/farming/pages/FarmLocations'));
const SoilMoisture = lazy(() => import('./modules/farming/pages/SoilMoisture'));
const ForecastIntelligence = lazy(() => import('./modules/farming/pages/ForecastIntelligence'));
const IrrigationPlanner = lazy(() => import('./modules/farming/pages/IrrigationPlanner'));
const SensorNetwork = lazy(() => import('./modules/farming/pages/SensorNetwork'));
const WeatherIntelligence = lazy(() => import('./modules/farming/pages/WeatherIntelligence'));
const AlertsEvents = lazy(() => import('./modules/farming/pages/AlertsEvents'));
const CaseStudies = lazy(() => import('./modules/farming/pages/CaseStudies'));
const Analytics = lazy(() => import('./modules/farming/pages/Analytics'));
const SettingsPage = lazy(() => import('./modules/farming/pages/Settings'));
const TestResults = lazy(() => import('./pages/TestResults'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
    >
      <Loader2 size={32} style={{ color: '#FF8A24' }} />
    </motion.div>
  </div>
);

function App() {
  const { currentPage } = useAppStore();
  const { initialize, initialized } = useFarmingStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  const renderPage = () => {
    switch (currentPage) {
      case 'command-center':
        return <CommandCenter />;
      case 'documents':
        return <DocumentsPage />;
      case 'document-dashboard':
        return <DocumentDashboard />;
      case 'farm-locations':
        return <FarmLocations />;
      case 'soil-moisture':
        return <SoilMoisture />;
      case 'forecast':
        return <ForecastIntelligence />;
      case 'irrigation':
        return <IrrigationPlanner />;
      case 'sensors':
        return <SensorNetwork />;
      case 'weather':
        return <WeatherIntelligence />;
      case 'alerts':
        return <AlertsEvents />;
      case 'case-studies':
        return <CaseStudies />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPage />;
      case 'test-results':
        return <TestResults />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderPage()}
        </motion.div>
      </Suspense>
    </Layout>
  );
}

export default App;
