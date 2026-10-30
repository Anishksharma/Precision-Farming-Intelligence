import React from 'react';
import { useFarmingStore } from '../../../store/farmingStore';
import { AlertTriangle, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AlertBanner: React.FC = () => {
  const { alerts, acknowledgeAlert } = useFarmingStore();
  const criticalAlert = alerts.find((a) => a.severity === 'critical' && !a.acknowledged);

  if (!criticalAlert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full rounded-xl border p-3 flex items-center justify-between gap-3 text-xs font-mono mb-4"
        style={{
          backgroundColor: 'rgba(255, 69, 69, 0.12)',
          borderColor: '#FF4545',
          color: '#F4F1E9',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-[#FF4545]/20 text-[#FF4545] flex-shrink-0 animate-pulse">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm text-[#FF4545] mr-2">CRITICAL THRESHOLD:</span>
            <span className="truncate">{criticalAlert.title} — {criticalAlert.message}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => acknowledgeAlert(criticalAlert.id)}
            className="flex items-center gap-1 px-3 py-1 rounded bg-[#FF4545] text-black font-bold text-xs hover:bg-[#FF1744] transition-colors cursor-pointer"
          >
            <Check size={13} />
            Acknowledge
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
