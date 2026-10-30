import React, { useState } from 'react';
import { useFarmingStore } from '../../../store/farmingStore';
import { useAppStore } from '../../../store/appStore';
import { FarmMap } from '../components/FarmMap';
import { ChartWrapper } from '../../../components/charts/ChartWrapper';
import { RadarChart } from '../../../components/charts/RadarChart';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { MapPin, Droplets, Sprout, ShieldCheck, ArrowRight } from 'lucide-react';
import { calculateFieldHealthScore } from '../engines/fieldHealthScore';

const FarmLocations: React.FC = () => {
  const { farms, selectedFieldId, setSelectedFieldId, cropProfiles, soilProfiles } = useFarmingStore();
  const { selectedFarmId, setSelectedFarmId, setCurrentPage } = useAppStore();

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
  const fields = selectedFarm.fields;

  // Radar comparison of fields within the farm
  const radarData = [
    { subject: 'Moisture %' },
    { subject: 'Sensor Health' },
    { subject: 'Soil Retention' },
    { subject: 'Crop Match' },
    { subject: 'Aeration' },
  ].map((metric) => {
    const entry: Record<string, unknown> = { subject: metric.subject };
    fields.forEach((f) => {
      let val = 50;
      if (metric.subject === 'Moisture %') val = f.currentMoisture;
      else if (metric.subject === 'Sensor Health') val = f.sensors.connectivity === 'online' ? 95 : 60;
      else if (metric.subject === 'Soil Retention') val = f.soilType === 'clay' ? 85 : 45;
      else if (metric.subject === 'Crop Match') val = 80;
      else if (metric.subject === 'Aeration') val = f.currentMoisture > 75 ? 30 : 85;
      entry[f.name] = val;
    });
    return entry;
  });

  const radarSeries = fields.map((f, i) => {
    const colors = ['#FF8A24', '#B6F23A', '#54E38E', '#FFB547'];
    return {
      key: f.name,
      name: f.name,
      color: colors[i % colors.length],
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[#F4F1E9]">
            MULTI-LOCATION FARM MONITORING
          </h1>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            Geospatial sensor zoning, boundary telemetry, and soil hydrology comparison
          </p>
        </div>

        {/* Farm Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border bg-[#10100E] border-[#34342B] text-xs font-mono">
          {farms.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFarmId(f.id)}
              className="px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              style={{
                backgroundColor: selectedFarm.id === f.id ? '#FF8A24' : 'transparent',
                color: selectedFarm.id === f.id ? '#0B0B0A' : '#A6A69A',
                fontWeight: selectedFarm.id === f.id ? 600 : 400,
              }}
            >
              {f.name.replace(' Farm', '').replace(' Cooperative', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive 2D Farm Map */}
      <FarmMap />

      {/* Field Zonal Breakdown & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Radar Comparison */}
        <ChartWrapper
          title={`${selectedFarm.name} — Zonal Hydrology Radar`}
          subtitle="Multi-parameter comparison across agricultural zones"
        >
          <RadarChart
            data={radarData}
            series={radarSeries}
            subjectKey="subject"
            height={280}
          />
        </ChartWrapper>

        {/* Detailed Fields Card List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-sm text-[#F4F1E9]">
              Field Zones ({fields.length} Monitored Units)
            </h3>
            <span className="text-[10px] font-mono text-[#6B6B60]">
              Total Zonal Area: {selectedFarm.totalArea} Hectares
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map((f) => {
              const crop = cropProfiles.find((c) => c.type === f.crop);
              const soil = soilProfiles.find((s) => s.type === f.soilType);
              const health = calculateFieldHealthScore(f, crop, soil);

              return (
                <Card
                  key={f.id}
                  padding="sm"
                  className="space-y-2 hover:border-[#FF8A24]/60 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sm text-[#F4F1E9]">{f.name}</span>
                        <Badge variant="orange" size="sm">
                          {f.crop.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-mono text-[#A6A69A] mt-0.5">
                        {f.area} Ha • {f.soilType.replace('_', ' ')} soil • Stage: {f.growthStage}
                      </p>
                    </div>

                    <Badge variant={health.grade === 'A+' || health.grade === 'A' ? 'lime' : 'amber'} size="sm">
                      HEALTH: {health.totalScore}/100
                    </Badge>
                  </div>

                  {/* Telemetry Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#282820] text-xs font-mono">
                    <div className="p-2 rounded bg-[#10100E] border border-[#282820]">
                      <span className="text-[10px] text-[#A6A69A] block">Current Moisture:</span>
                      <span
                        className="font-extrabold text-base"
                        style={{ color: f.currentMoisture < 35 ? '#FFB547' : '#B6F23A' }}
                      >
                        {f.currentMoisture.toFixed(1)}%
                      </span>
                    </div>

                    <div className="p-2 rounded bg-[#10100E] border border-[#282820]">
                      <span className="text-[10px] text-[#A6A69A] block">24h Forecast:</span>
                      <span className="font-bold text-base text-[#FF8A24]">
                        {f.forecastMoisture.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                    <span className="text-[#54E38E] flex items-center gap-1">
                      <ShieldCheck size={13} />
                      {f.sensors.connectivity.toUpperCase()}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedFieldId(f.id);
                        setCurrentPage('soil-moisture');
                      }}
                      className="text-[#FF8A24] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      Moisture Profile <ArrowRight size={11} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmLocations;
