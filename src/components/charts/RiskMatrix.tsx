import React from 'react';
import type { RiskItem } from '../../types';

export interface RiskMatrixProps {
  risks: RiskItem[];
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks }) => {
  const levels = ['high', 'medium', 'low'] as const;

  const getCellColor = (sev: string, lik: string) => {
    if (sev === 'critical' || (sev === 'high' && lik === 'high')) {
      return { bg: 'rgba(255, 69, 69, 0.25)', border: '#FF4545' };
    }
    if ((sev === 'high' && lik === 'medium') || (sev === 'medium' && lik === 'high')) {
      return { bg: 'rgba(255, 181, 71, 0.2)', border: '#FFB547' };
    }
    if (sev === 'medium' || lik === 'medium') {
      return { bg: 'rgba(255, 138, 36, 0.15)', border: '#FF8A24' };
    }
    return { bg: 'rgba(182, 242, 58, 0.12)', border: '#B6F23A' };
  };

  return (
    <div className="space-y-4">
      {/* 2D Matrix Grid */}
      <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
        {/* Corner */}
        <div className="p-2 text-center text-[10px]" style={{ color: '#6B6B60' }}>
          SEV \ LIK
        </div>
        <div className="p-2 text-center font-bold" style={{ color: '#A6A69A' }}>
          Low
        </div>
        <div className="p-2 text-center font-bold" style={{ color: '#A6A69A' }}>
          Medium
        </div>
        <div className="p-2 text-center font-bold" style={{ color: '#A6A69A' }}>
          High
        </div>

        {/* Rows: High, Med, Low */}
        {levels.map((sev) => (
          <React.Fragment key={sev}>
            <div className="p-2 flex items-center font-bold capitalize" style={{ color: '#A6A69A' }}>
              {sev}
            </div>
            {['low', 'medium', 'high'].map((lik) => {
              const matched = risks.filter(
                (r) => (r.severity === sev || (sev === 'high' && r.severity === 'critical')) && r.likelihood === lik
              );
              const cellStyle = getCellColor(sev, lik);
              return (
                <div
                  key={lik}
                  className="min-h-[50px] p-2 rounded border flex flex-col justify-center items-center gap-1 transition-all"
                  style={{
                    backgroundColor: cellStyle.bg,
                    borderColor: cellStyle.border,
                  }}
                >
                  <span className="font-bold text-sm" style={{ color: cellStyle.border }}>
                    {matched.length}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-center" style={{ color: '#A6A69A' }}>
                    {sev === 'high' && lik === 'high' ? 'CRITICAL' : sev === 'high' || lik === 'high' ? 'HIGH' : 'MODERATE'}
                  </span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Identified Risk Cards */}
      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
        {risks.map((risk, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg border text-xs font-mono flex items-start justify-between gap-2"
            style={{ backgroundColor: '#10100E', borderColor: '#34342B' }}
          >
            <div>
              <p className="font-semibold text-sm" style={{ color: '#F4F1E9' }}>
                {risk.title}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: '#A6A69A' }}>
                {risk.description}
              </p>
            </div>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap"
              style={{
                backgroundColor: risk.severity === 'critical' ? 'rgba(255, 69, 69, 0.2)' : 'rgba(255, 181, 71, 0.2)',
                color: risk.severity === 'critical' ? '#FF4545' : '#FFB547',
              }}
            >
              {risk.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
