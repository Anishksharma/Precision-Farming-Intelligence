import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { useFarmingStore } from '../../store/farmingStore';
import {
  Search, Bell, Radio, ToggleLeft, ToggleRight,
  Calendar, X, CheckCircle, AlertTriangle, Info
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    globalSearch, setGlobalSearch, simulationMode, toggleSimulationMode,
    notifications, clearNotification, selectedFarmId, setSelectedFarmId,
    sidebarCollapsed,
  } = useAppStore();
  const { farms, alerts } = useFarmingStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const activeAlerts = alerts.filter(a => !a.resolved && !a.acknowledged);
  const selectedFarm = farms.find(f => f.id === selectedFarmId);

  return (
    <header
      className="fixed top-0 right-0 h-14 z-30 flex items-center justify-between px-5 border-b"
      style={{
        left: sidebarCollapsed ? 64 : 260,
        backgroundColor: '#0B0B0A',
        borderColor: '#34342B',
        transition: 'left 0.3s ease-in-out',
      }}
    >
      {/* Left: Farm Selector */}
      <div className="flex items-center gap-4">
        <select
          value={selectedFarmId || ''}
          onChange={(e) => setSelectedFarmId(e.target.value || null)}
          className="text-sm font-medium rounded-lg px-3 py-1.5 border outline-none"
          style={{
            backgroundColor: '#171714',
            borderColor: '#34342B',
            color: '#F4F1E9',
          }}
        >
          <option value="">All Farms</option>
          {farms.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        {/* Connection Status */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#54E38E' }} />
          <span className="text-xs font-mono" style={{ color: '#A6A69A' }}>
            {simulationMode ? 'SIMULATION' : 'DEMO DATA'}
          </span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#A6A69A' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#171714')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Search size={18} />
          </button>
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 250 }}
                exit={{ opacity: 0, width: 0 }}
                className="absolute right-0 top-full mt-2"
              >
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                  className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                  style={{
                    backgroundColor: '#171714',
                    borderColor: '#34342B',
                    color: '#F4F1E9',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Simulation Toggle */}
        <button
          onClick={toggleSimulationMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors"
          style={{
            borderColor: simulationMode ? '#FF8A24' : '#34342B',
            backgroundColor: simulationMode ? 'rgba(255,138,36,0.1)' : 'transparent',
            color: simulationMode ? '#FF8A24' : '#A6A69A',
          }}
        >
          {simulationMode ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          SIM
        </button>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: '#A6A69A' }}>
          <Calendar size={14} />
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg transition-colors relative"
            style={{ color: '#A6A69A' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#171714')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Bell size={18} />
            {activeAlerts.length > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: '#FF4545', color: '#F4F1E9' }}
              >
                {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border shadow-xl"
                style={{ backgroundColor: '#171714', borderColor: '#34342B' }}
              >
                <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: '#34342B' }}>
                  <span className="text-sm font-semibold" style={{ color: '#F4F1E9' }}>Notifications</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: '#20201B', color: '#FF8A24' }}>
                    {activeAlerts.length} active
                  </span>
                </div>
                {activeAlerts.length === 0 && notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm" style={{ color: '#A6A69A' }}>
                    No new notifications
                  </div>
                ) : (
                  <div className="p-2">
                    {activeAlerts.slice(0, 5).map(alert => (
                      <div
                        key={alert.id}
                        className="p-2.5 rounded-lg mb-1 flex items-start gap-2"
                        style={{ backgroundColor: '#20201B' }}
                      >
                        <AlertTriangle
                          size={14}
                          className="mt-0.5 flex-shrink-0"
                          style={{
                            color: alert.severity === 'critical' ? '#FF4545' :
                              alert.severity === 'high' ? '#FFB547' : '#FF8A24'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: '#F4F1E9' }}>{alert.title}</p>
                          <p className="text-[10px] mt-0.5 truncate" style={{ color: '#A6A69A' }}>{alert.message}</p>
                        </div>
                      </div>
                    ))}
                    {notifications.slice(0, 3).map(n => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-lg mb-1 flex items-start gap-2"
                        style={{ backgroundColor: '#20201B' }}
                      >
                        {n.type === 'success' ? <CheckCircle size={14} className="mt-0.5" style={{ color: '#54E38E' }} /> :
                          <Info size={14} className="mt-0.5" style={{ color: '#FF8A24' }} />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs" style={{ color: '#F4F1E9' }}>{n.message}</p>
                        </div>
                        <button onClick={() => clearNotification(n.id)}>
                          <X size={12} style={{ color: '#A6A69A' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

