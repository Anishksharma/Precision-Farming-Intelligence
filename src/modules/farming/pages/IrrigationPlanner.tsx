import React, { useState } from 'react';
import { useFarmingStore } from '../../../store/farmingStore';
import { ChartWrapper } from '../../../components/charts/ChartWrapper';
import { BarChart } from '../../../components/charts/BarChart';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Sprout, Droplet, Clock, CheckCircle, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { generateRecommendation } from '../engines/irrigationEngine';

const IrrigationPlanner: React.FC = () => {
  const { farms, cropProfiles, soilProfiles, weatherForecast, updateFieldMoisture } = useFarmingStore();
  const allFields = farms.flatMap((f) => f.fields);

  // Compute recommendations for all fields
  const recommendations = allFields.map((field) => {
    const crop = cropProfiles.find((c) => c.type === field.crop)!;
    const soil = soilProfiles.find((s) => s.type === field.soilType)!;
    return generateRecommendation(field, undefined, weatherForecast, crop, soil);
  });

  const [simulatedFieldId, setSimulatedFieldId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manual irrigation pulse simulation (Separated from actual hardware commands)
  const handleSimulateIrrigation = (fieldId: string, waterM3: number) => {
    setSimulatedFieldId(fieldId);
    const field = allFields.find((f) => f.id === fieldId);
    if (!field) return;

    // Simulate moisture recovery
    const crop = cropProfiles.find((c) => c.type === field.crop);
    const thresholds = crop?.moistureThresholds[field.growthStage] || { optimal: 50 };
    updateFieldMoisture(fieldId, thresholds.optimal);

    setSuccessMessage(`Simulated delivery of ${waterM3} m³ applied to ${field.name}. Soil moisture recovered to optimal ${thresholds.optimal}%.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Water savings chart data
  const savingsChartData = allFields.slice(0, 6).map((f) => {
    const rec = recommendations.find((r) => r.fieldId === f.id);
    const floodVol = f.area * 600;
    const smartVol = rec?.waterRequiredM3 || 0;
    return {
      name: f.name,
      conventional: floodVol,
      smart: smartVol,
      saved: Math.max(0, floodVol - smartVol),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[#F4F1E9]">
            PRECISION IRRIGATION INTELLIGENCE
          </h1>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            Deficit calculations, rainfall credits, water-saving schedules, and manual valve simulation
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg border border-[#34342B] bg-[#171714] text-xs font-mono text-[#54E38E] flex items-center gap-1.5">
          <ShieldAlert size={14} />
          <span>Recommendations Isolated from Hardware Relays</span>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3 rounded-xl border border-[#54E38E]/50 bg-[#54E38E]/10 text-xs font-mono text-[#54E38E] flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Water Savings Head-to-Head Comparison */}
      <ChartWrapper
        title="Water Conservation Analysis: Conventional Flooding vs AI-Scheduled Precision"
        subtitle="Volume comparison (Cubic Meters) demonstrating water preservation per agricultural zone"
      >
        <BarChart
          data={savingsChartData}
          xAxisKey="name"
          series={[
            { key: 'conventional', name: 'Conventional Calendar Flood (m³)', color: '#FFB547' },
            { key: 'smart', name: 'AI Precision Requirement (m³)', color: '#54E38E' },
          ]}
          yAxisLabel="m³"
          height={260}
        />
      </ChartWrapper>

      {/* Zonal Irrigation Recommendation Cards */}
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-base text-[#F4F1E9]">
          Zonal Irrigation Directives ({allFields.length} Monitored Fields)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {allFields.map((field) => {
            const rec = recommendations.find((r) => r.fieldId === field.id)!;
            const crop = cropProfiles.find((c) => c.type === field.crop);

            return (
              <Card
                key={field.id}
                padding="sm"
                className="flex flex-col justify-between space-y-3 hover:border-[#FF8A24]/60 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-mono font-bold text-sm text-[#F4F1E9]">{field.name}</h4>
                      <p className="text-[10px] font-mono text-[#A6A69A]">
                        {field.area} Ha • {field.crop.toUpperCase()} ({field.growthStage})
                      </p>
                    </div>

                    <Badge
                      variant={
                        rec.urgency === 'critical'
                          ? 'red'
                          : rec.urgency === 'high'
                          ? 'amber'
                          : rec.urgency === 'medium'
                          ? 'orange'
                          : 'green'
                      }
                      size="sm"
                    >
                      {rec.required ? rec.urgency.toUpperCase() : 'NO IRRIGATION'}
                    </Badge>
                  </div>

                  {/* Scientific Reasoning */}
                  <div className="p-2.5 rounded bg-[#10100E] border border-[#282820] text-xs font-mono space-y-1">
                    <p className="text-[11px] text-[#F4F1E9] leading-relaxed">
                      {rec.reasoning}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#A6A69A] pt-1 border-t border-[#252520]">
                      <Clock size={12} className="text-[#FF8A24]" />
                      <span>{rec.recommendedTime}</span>
                    </div>
                  </div>

                  {/* Quantitative Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-[#10100E] border border-[#282820]">
                      <span className="text-[9px] text-[#A6A69A] block">Water Volume:</span>
                      <span className="font-bold text-sm text-[#54E38E]">
                        {rec.waterRequiredM3.toLocaleString()} m³
                      </span>
                      <span className="text-[9px] text-[#6B6B60] block">
                        ({(rec.waterRequired / 1000).toFixed(0)}k L)
                      </span>
                    </div>

                    <div className="p-2 rounded bg-[#10100E] border border-[#282820]">
                      <span className="text-[9px] text-[#A6A69A] block">Water Savings:</span>
                      <span className="font-bold text-sm text-[#B6F23A]">
                        {rec.waterSavingOpportunity}%
                      </span>
                      <span className="text-[9px] text-[#6B6B60] block">vs traditional</span>
                    </div>
                  </div>
                </div>

                {/* Manual Simulation Button */}
                <div className="pt-2 border-t border-[#282820]">
                  <Button
                    variant={rec.required ? 'primary' : 'secondary'}
                    size="sm"
                    className="w-full text-xs"
                    icon={<Zap size={13} />}
                    onClick={() => handleSimulateIrrigation(field.id, rec.waterRequiredM3)}
                  >
                    Simulate Irrigation Pulse
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IrrigationPlanner;
