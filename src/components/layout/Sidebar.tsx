import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import type { AppPage } from '../../types';
import {
  LayoutDashboard, FileText, MapPin, Droplets, TrendingUp,
  CloudRain, Wifi, AlertTriangle, BookOpen, BarChart3,
  Settings, ChevronLeft, ChevronRight, Sprout, Activity,
  Menu, ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: AppPage;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  section?: string;
}

const navItems: NavItem[] = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, section: 'OVERVIEW' },
  { id: 'documents', label: 'Universal Documents', icon: FileText, section: 'UNIVERSAL ENGINE' },
  { id: 'farm-locations', label: 'Farm Locations', icon: MapPin, section: 'PRECISION FARMING' },
  { id: 'soil-moisture', label: 'Soil Moisture', icon: Droplets },
  { id: 'forecast', label: 'Forecast Intelligence', icon: TrendingUp },
  { id: 'irrigation', label: 'Irrigation Planner', icon: Sprout },
  { id: 'sensors', label: 'Sensor Network', icon: Wifi },
  { id: 'weather', label: 'Weather Intelligence', icon: CloudRain },
  { id: 'alerts', label: 'Alerts & Events', icon: AlertTriangle },
  { id: 'case-studies', label: 'Case Studies', icon: BookOpen },
  { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, section: 'ANALYSIS' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'SYSTEM' },
  { id: 'test-results', label: 'Test Results (127)', icon: ShieldCheck, section: 'QUALITY ASSURANCE' },
];

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, sidebarCollapsed, toggleSidebar } = useAppStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full z-40 flex flex-col border-r"
      style={{
        backgroundColor: '#10100E',
        borderColor: '#34342B',
      }}
      animate={{ width: sidebarCollapsed ? 64 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: '#34342B' }}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FF8A24, #FFB547)' }}
        >
          <Activity size={20} className="text-black" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col min-w-0"
            >
              <span className="font-heading font-bold text-sm truncate" style={{ color: '#F4F1E9' }}>
                AGRI INTELLIGENCE
              </span>
              <span className="text-[10px] font-mono" style={{ color: '#A6A69A' }}>
                Universal Dashboard
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((item, idx) => {
          const isActive = currentPage === item.id;
          const isHovered = hoveredItem === item.id;
          const Icon = item.icon;
          const prevItem = navItems[idx - 1];
          const showSection = item.section && (!prevItem || prevItem.section !== item.section);

          return (
            <React.Fragment key={item.id}>
              {showSection && !sidebarCollapsed && (
                <motion.div
                  className="px-3 pt-4 pb-1.5 text-[10px] font-mono font-medium tracking-wider"
                  style={{ color: '#6B6B60' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {item.section}
                </motion.div>
              )}
              {showSection && sidebarCollapsed && (
                <div className="mx-2 my-2 border-t" style={{ borderColor: '#34342B' }} />
              )}
              <button
                onClick={() => setCurrentPage(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5
                  transition-all duration-200 relative group
                `}
                style={{
                  backgroundColor: isActive ? '#20201B' : isHovered ? '#171714' : 'transparent',
                  color: isActive ? '#FF8A24' : '#A6A69A',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                    style={{ backgroundColor: '#FF8A24' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium truncate"
                      style={{ color: isActive ? '#F4F1E9' : undefined }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {sidebarCollapsed && isHovered && (
                  <div
                    className="absolute left-full ml-2 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap z-50"
                    style={{ backgroundColor: '#20201B', color: '#F4F1E9', border: '1px solid #34342B' }}
                  >
                    {item.label}
                  </div>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center py-3 border-t transition-colors"
        style={{ borderColor: '#34342B', color: '#A6A69A' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#171714')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </motion.aside>
  );
};

