import React, { useState } from 'react';
import { useFarmingStore } from '../../../store/farmingStore';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { AlertTriangle, CheckCircle, ShieldAlert, Check, Trash2, Filter } from 'lucide-react';
import { formatDate } from '../../../utils/formatUtils';

const AlertsEvents: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert, clearResolvedAlerts } = useFarmingStore();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (statusFilter === 'unresolved' && a.resolved) return false;
    if (statusFilter === 'resolved' && !a.resolved) return false;
    return true;
  });

  const getSeverityBadgeVariant = (sev: string): 'red' | 'amber' | 'orange' | 'lime' | 'green' => {
    switch (sev) {
      case 'critical': return 'red';
      case 'high': return 'amber';
      case 'medium': return 'orange';
      case 'low': return 'lime';
      default: return 'green';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[#F4F1E9]">
            ALERTS, ANOMALIES & AUDIT TRAIL
          </h1>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            Real-time change detection, threshold breaches, and historical operational telemetry log
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Trash2 size={13} />}
            onClick={clearResolvedAlerts}
          >
            Purge Resolved
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border bg-[#171714] border-[#34342B] text-xs font-mono">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#FF8A24]" />
          <span className="text-[#A6A69A]">Severity:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className="px-2.5 py-1 rounded capitalize transition-colors"
              style={{
                backgroundColor: severityFilter === sev ? '#FF8A24' : '#20201B',
                color: severityFilter === sev ? '#0B0B0A' : '#A6A69A',
                fontWeight: severityFilter === sev ? 600 : 400,
              }}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#A6A69A]">Status:</span>
          {(['all', 'unresolved', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="px-2.5 py-1 rounded capitalize transition-colors"
              style={{
                backgroundColor: statusFilter === st ? '#FF8A24' : '#20201B',
                color: statusFilter === st ? '#0B0B0A' : '#A6A69A',
                fontWeight: statusFilter === st ? 600 : 400,
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Timeline List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[#6B6B60] rounded-xl border border-[#34342B] bg-[#171714]">
            No alerts matching current filter parameters.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              padding="sm"
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                alert.severity === 'critical' && !alert.resolved
                  ? 'border-[#FF4545]/60 bg-[#FF4545]/5'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="p-2 rounded-lg mt-0.5 flex-shrink-0"
                  style={{
                    backgroundColor: alert.resolved
                      ? 'rgba(84, 227, 142, 0.15)'
                      : alert.severity === 'critical'
                      ? 'rgba(255, 69, 69, 0.2)'
                      : 'rgba(255, 181, 71, 0.2)',
                    color: alert.resolved
                      ? '#54E38E'
                      : alert.severity === 'critical'
                      ? '#FF4545'
                      : '#FFB547',
                  }}
                >
                  <AlertTriangle size={18} />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-heading font-semibold text-sm text-[#F4F1E9]">
                      {alert.title}
                    </h4>
                    <Badge variant={getSeverityBadgeVariant(alert.severity)} size="sm">
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] font-mono text-[#A6A69A]">
                      {formatDate(alert.timestamp, 'datetime')}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-[#A6A69A] leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-[#6B6B60] pt-1">
                    {alert.fieldId && <span>Field: {alert.fieldId}</span>}
                    {alert.value !== undefined && <span>Reported: {alert.value}</span>}
                    {alert.threshold !== undefined && <span>Threshold: {alert.threshold}</span>}
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-2.5 py-1 rounded text-xs font-mono bg-[#20201B] border border-[#34342B] text-[#FF8A24] hover:bg-[#282820] cursor-pointer"
                  >
                    Acknowledge
                  </button>
                )}

                {!alert.resolved ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Check size={13} />}
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                ) : (
                  <span className="text-xs font-mono text-[#54E38E] flex items-center gap-1">
                    <CheckCircle size={14} />
                    Resolved
                  </span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsEvents;
