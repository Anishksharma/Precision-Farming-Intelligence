import React, { useState } from 'react';
import { useFarmingStore } from '../../../store/farmingStore';
import { useAppStore } from '../../../store/appStore';
import { MoistureGauge } from '../components/MoistureGauge';
import { ChartWrapper } from '../../../components/charts/ChartWrapper';
import { LineChart } from '../../../components/charts/LineChart';
import { BarChart } from '../../../components/charts/BarChart';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Droplets, Clock, AlertTriangle, Layers, Gauge } from 'lucide-react';
import { calculateDepletionRate, calculateTimeToThreshold } from '../engines/waterBalance';

const SoilMoisture: React.FC = () => {
  const { farms, selectedFieldId, setSelectedFieldId, cropProfiles, soilProfiles } = useFarmingStore();
  const allFields = farms.flatMap((f) => f.fields);
  const activeField = allFields.find((f) => f.id === selectedFieldId) || allFields[0];

  const crop = cropProfiles.find((c) => c.type === activeField.crop);
  const soil = soilProfiles.find((s) => s.type === activeField.soilType);
  const thresholds = crop?.moistureThresholds[activeField.growthStage] || {
    min: 35,
    max: 70,
    optimal: 50,
    wilting: 20,
  };

  // Depletion calculations
  const depletionRate = calculateDepletionRate(crop?.waterRequirement || 4.5, crop?.rootDepth[activeField.growthStage] || 30);
  const timeToThreshold = calculateTimeToThreshold(activeField.currentMoisture, depletionRate, thresholds.min);

  // Hourly simulated 7-day history for the active field
  const historyData = Array.from({ length: 24 }, (_, i) => {
    const hr = 24 - i;
    const base = activeField.currentMoisture + Math.sin(i / 3) * 3 - (i * 0.1);
    return {
      hour: `-${hr}h`,
      moisture: Number(Math.max(10, Math.min(95, base)).toFixed(1)),
      optimal: thresholds.optimal,
      minLimit: thresholds.min,
    };
  });

  // Comparison bar chart for all fields in same farm
  const currentFarm = farms.find((f) => f.id === activeField.farmId) || farms[0];
  const fieldComparisonData = currentFarm.fields.map((f) => ({
    name: f.name,
    current: f.currentMoisture,
    forecast: f.forecastMoisture,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[#F4F1E9]">
            SOIL MOISTURE MONITORING & PROFILES
          </h1>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            Volumetric water content dynamics, depletion kinetics, and root-zone thresholds
          </p>
        </div>

        {/* Field Selector */}
        <select
          value={activeField.id}
          onChange={(e) => setSelectedFieldId(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-xs font-mono bg-[#10100E] border-[#34342B] text-[#F4F1E9] outline-none"
        >
          {allFields.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.crop.toUpperCase()} — {f.currentMoisture.toFixed(1)}%)
            </option>
          ))}
        </select>
      </div>

      {/* Primary Analytics Section: Gauge & Deep Horizon History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Large Moisture Gauge Card */}
        <Card className="flex flex-col items-center justify-between p-6">
          <div className="w-full flex items-center justify-between border-b border-[#34342B] pb-2">
            <div>
              <h3 className="font-heading font-bold text-base text-[#F4F1E9]">
                {activeField.name}
              </h3>
              <p className="text-[10px] font-mono text-[#A6A69A]">
                {activeField.soilType.replace('_', ' ')} soil • Root depth {crop?.rootDepth[activeField.growthStage] || 30} cm
              </p>
            </div>
            <Badge variant="orange" size="sm">
              {activeField.crop.toUpperCase()}
            </Badge>
          </div>

          <div className="my-4">
            <MoistureGauge
              value={activeField.currentMoisture}
              targetOptimal={thresholds.optimal}
              minThreshold={thresholds.min}
              maxThreshold={thresholds.max}
              size={220}
              label="Root Zone Moisture"
            />
          </div>

          <div className="w-full grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-[#34342B]">
            <div className="p-2 rounded bg-[#10100E] border border-[#282820]">
              <span className="text-[10px] text-[#A6A69A] block">Depletion Rate:</span>
              <span className="font-bold text-[#FF8A24]">{depletionRate}% / hr</span>
            </div>
            <div className="p-2 rounded bg-[#10100E] border border-[#282820]">
              <span className="text-[10px] text-[#A6A69A] block">Time To Threshold:</span>
              <span className="font-bold text-[#FFB547]">
                {timeToThreshold !== null ? `${timeToThreshold} hrs` : 'Depletion Safe'}
              </span>
            </div>
          </div>
        </Card>

        {/* 24-Hour Telemetry Trace Chart */}
        <div className="lg:col-span-2">
          <ChartWrapper
            title={`${activeField.name} — Continuous 24h Root-Zone Trace`}
            subtitle="Historical sensor readings against optimal band and lower stress boundary"
          >
            <LineChart
              data={historyData}
              xAxisKey="hour"
              series={[
                { key: 'moisture', name: 'Moisture (%)', color: '#FF8A24', isArea: true },
                { key: 'optimal', name: 'Optimal Target (%)', color: '#54E38E', strokeDasharray: '4 4' },
                { key: 'minLimit', name: 'Irrigation Threshold (%)', color: '#FF4545', strokeDasharray: '3 3' },
              ]}
              yAxisLabel="Vol %"
              height={270}
            />
          </ChartWrapper>
        </div>
      </div>

      {/* Secondary Row: Time to Irrigation Estimator & Zonal Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Time-to-Irrigation Estimator Table */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#34342B] pb-2">
            <Clock size={16} className="text-[#FF8A24]" />
            <h3 className="font-heading font-semibold text-sm text-[#F4F1E9]">
              Time-To-Irrigation Estimator (All Zonal Units)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#34342B] text-[#A6A69A]">
                  <th className="py-2">Field</th>
                  <th>Crop</th>
                  <th>Moisture</th>
                  <th>Depletion</th>
                  <th>Hours Left</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allFields.map((f) => {
                  const fCrop = cropProfiles.find((c) => c.type === f.crop);
                  const fThresh = fCrop?.moistureThresholds[f.growthStage] || { min: 35, wilting: 20 };
                  const fDep = calculateDepletionRate(fCrop?.waterRequirement || 4.5, fCrop?.rootDepth[f.growthStage] || 30);
                  const fHrs = calculateTimeToThreshold(f.currentMoisture, fDep, fThresh.min);

                  return (
                    <tr
                      key={f.id}
                      className="border-b border-[#282820] hover:bg-[#20201B] transition-colors cursor-pointer"
                      onClick={() => setSelectedFieldId(f.id)}
                    >
                      <td className="py-2 font-bold text-[#F4F1E9]">{f.name}</td>
                      <td className="capitalize text-[#A6A69A]">{f.crop}</td>
                      <td className="font-bold" style={{ color: f.currentMoisture < 35 ? '#FFB547' : '#B6F23A' }}>
                        {f.currentMoisture.toFixed(1)}%
                      </td>
                      <td className="text-[#A6A69A]">{fDep}%/h</td>
                      <td className="font-bold text-[#FF8A24]">
                        {fHrs !== null ? `${fHrs}h` : '>72h'}
                      </td>
                      <td>
                        <Badge
                          variant={fHrs !== null && fHrs <= 8 ? 'red' : fHrs !== null && fHrs <= 24 ? 'amber' : 'green'}
                          size="sm"
                        >
                          {fHrs !== null && fHrs <= 8 ? 'URGENT' : fHrs !== null && fHrs <= 24 ? 'PREVENTIVE' : 'STABLE'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Farm Field Comparison */}
        <ChartWrapper
          title={`${currentFarm.name} — Field Comparison`}
          subtitle="Observed Current vs 24-Hour Projected Moisture"
        >
          <BarChart
            data={fieldComparisonData}
            xAxisKey="name"
            series={[
              { key: 'current', name: 'Current Moisture %', color: '#FF8A24' },
              { key: 'forecast', name: '24h Forecast %', color: '#B6F23A' },
            ]}
            yAxisLabel="Vol %"
            height={260}
          />
        </ChartWrapper>
      </div>
    </div>
  );
};

export default SoilMoisture;
