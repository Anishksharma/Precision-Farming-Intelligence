import React, { useState } from 'react';
import { useFarmingStore } from '../../../store/farmingStore';
import { SensorCard } from '../components/SensorCard';
import { DonutChart } from '../../../components/charts/DonutChart';
import { ChartWrapper } from '../../../components/charts/ChartWrapper';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Wifi, Filter, Activity, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';
import type { SensorCategory } from '../../../types/farming';

const SensorNetwork: React.FC = () => {
  const { farms } = useFarmingStore();
  const allFields = farms.flatMap((f) => f.fields);

  // Flatten all sensors with farm/field context
  const allSensors = allFields.flatMap((field) => {
    const farm = farms.find((f) => f.id === field.farmId);
    return (field.sensors?.sensors || []).map((s) => ({
      ...s,
      farmName: farm?.name || 'Unknown Farm',
      fieldName: field.name,
      stationId: field.sensors?.id || 'Station-0',
    }));
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFarm, setSelectedFarm] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');

  const filteredSensors = allSensors.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (selectedFarm !== 'all' && s.farmName !== selectedFarm) return false;
    if (qualityFilter !== 'all' && s.quality !== qualityFilter) return false;
    return true;
  });

  // Health distribution
  const qualityCounts = {
    excellent: allSensors.filter((s) => s.quality === 'excellent').length,
    good: allSensors.filter((s) => s.quality === 'good').length,
    fair: allSensors.filter((s) => s.quality === 'fair').length,
    poor: allSensors.filter((s) => s.quality === 'poor').length,
  };

  const donutData = [
    { name: 'Excellent', value: qualityCounts.excellent, color: '#54E38E' },
    { name: 'Good', value: qualityCounts.good, color: '#B6F23A' },
    { name: 'Fair', value: qualityCounts.fair, color: '#FFB547' },
    { name: 'Degraded', value: qualityCounts.poor, color: '#FF4545' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[#F4F1E9]">
            SENSOR TELEMETRY & HARDWARE NETWORK
          </h1>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            Real-time diagnostics across capacitive, environmental, meteorological, and hydraulic instrumentation
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg border border-[#34342B] bg-[#171714] text-xs font-mono text-[#FF8A24] flex items-center gap-1.5">
          <Cpu size={14} />
          <span>{allSensors.length} Telemetry Nodes Operational (Simulated)</span>
        </div>
      </div>

      {/* Sensor Health Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <ChartWrapper
          title="Hardware Telemetry Quality"
          subtitle="SNR and transmission integrity"
          className="lg:col-span-1"
        >
          <DonutChart data={donutData} innerRadius={45} outerRadius={70} />
        </ChartWrapper>

        {/* Telemetry Architecture Overview */}
        <Card className="lg:col-span-3 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-heading font-semibold text-sm text-[#F4F1E9] mb-1">
              Field Telemetry Mesh Architecture
            </h3>
            <p className="text-xs font-mono text-[#A6A69A] leading-relaxed">
              Sensors operate on low-power LoRaWAN protocol transmitting at 15-minute intervals. Capacitive high-frequency probes measure soil dielectric permittivity at 70 MHz to minimize salinity interference. Environmental nodes incorporate aspirated radiation shields.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-xs pt-3 border-t border-[#34342B]">
            <div className="p-2.5 rounded bg-[#10100E] border border-[#282820]">
              <span className="text-[10px] text-[#A6A69A] block">Soil Sensors:</span>
              <span className="font-bold text-base text-[#FF8A24]">
                {allSensors.filter((s) => s.category === 'soil').length}
              </span>
              <span className="text-[10px] text-[#6B6B60] block">Capacitive, pH, EC</span>
            </div>

            <div className="p-2.5 rounded bg-[#10100E] border border-[#282820]">
              <span className="text-[10px] text-[#A6A69A] block">Environmental:</span>
              <span className="font-bold text-base text-[#B6F23A]">
                {allSensors.filter((s) => s.category === 'environmental').length}
              </span>
              <span className="text-[10px] text-[#6B6B60] block">Temp, RH, Rain, Wind</span>
            </div>

            <div className="p-2.5 rounded bg-[#10100E] border border-[#282820]">
              <span className="text-[10px] text-[#A6A69A] block">Hydraulic Nodes:</span>
              <span className="font-bold text-base text-[#54E38E]">
                {allSensors.filter((s) => s.category === 'water').length}
              </span>
              <span className="text-[10px] text-[#6B6B60] block">Flow, Level, Pressure</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border bg-[#171714] border-[#34342B] text-xs font-mono">
        {/* Category Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[#A6A69A] mr-1">Category:</span>
          {['all', 'soil', 'environmental', 'water'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-2.5 py-1 rounded capitalize transition-colors"
              style={{
                backgroundColor: selectedCategory === cat ? '#FF8A24' : '#20201B',
                color: selectedCategory === cat ? '#0B0B0A' : '#A6A69A',
                fontWeight: selectedCategory === cat ? 600 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Farm Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[#A6A69A]">Farm:</span>
          <select
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            className="rounded border px-2 py-1 bg-[#10100E] border-[#34342B] text-[#F4F1E9] outline-none"
          >
            <option value="all">All Farms</option>
            {farms.map((f) => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredSensors.map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>
    </div>
  );
};

export default SensorNetwork;
