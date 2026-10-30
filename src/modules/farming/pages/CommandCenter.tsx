import React from 'react';
import { useFarmingStore } from '../../../store/farmingStore';
import { useAppStore } from '../../../store/appStore';
import { MetricCard } from '../../../components/charts/MetricCard';
import { LineChart } from '../../../components/charts/LineChart';
import { BarChart } from '../../../components/charts/BarChart';
import { DonutChart } from '../../../components/charts/DonutChart';
import { ChartWrapper } from '../../../components/charts/ChartWrapper';
import { AlertBanner } from '../components/AlertBanner';
import { WeatherWidget } from '../components/WeatherWidget';
import { SimulationPanel } from '../components/SimulationPanel';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import {
  MapPin,
  Wifi,
  Droplets,
  TrendingUp,
  AlertTriangle,
  CloudRain,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';

const CommandCenter: React.FC = () => {
  const { farms, alerts, forecasts, irrigationRecommendations, weatherForecast } = useFarmingStore();
  const { setCurrentPage, setSelectedFarmId } = useAppStore();

  const allFields = farms.flatMap((f) => f.fields);
  const totalArea = farms.reduce((acc, f) => acc + f.totalArea, 0);
  const avgMoisture = allFields.length
    ? allFields.reduce((acc, f) => acc + f.currentMoisture, 0) / allFields.length
    : 0;

  const urgentIrrigationCount = Object.values(irrigationRecommendations).filter(
    (r) => r.required && (r.urgency === 'critical' || r.urgency === 'high')
  ).length;

  const criticalAlertsCount = alerts.filter((a) => a.severity === 'critical' && !a.resolved).length;

  // Active sensors count
  const totalSensors = allFields.reduce((acc, f) => acc + (f.sensors?.sensors.length || 0), 0);
  const activeSensors = allFields.reduce(
    (acc, f) => acc + (f.sensors?.sensors.filter((s) => s.status === 'active').length || 0),
    0
  );

  // 7-day moisture history trend sample
  const trendData = [
    { day: 'Mon', actual: 46.2, forecast: 45.8 },
    { day: 'Tue', actual: 44.5, forecast: 44.2 },
    { day: 'Wed', actual: 42.1, forecast: 42.0 },
    { day: 'Thu', actual: 40.8, forecast: 40.5 },
    { day: 'Fri', actual: 48.0, forecast: 47.5 }, // post rain
    { day: 'Sat', actual: 45.4, forecast: 45.0 },
    { day: 'Sun', actual: 43.1, forecast: 42.8 },
  ];

  // Farm-wise comparison data
  const farmMoistureData = farms.map((f) => {
    const fAvg = f.fields.reduce((acc, field) => acc + field.currentMoisture, 0) / f.fields.length;
    return {
      name: f.name.replace(' Farm', '').replace(' Cooperative', ''),
      moisture: Number(fAvg.toFixed(1)),
    };
  });

  // Crop stress distribution
  const stressDist = [
    { name: 'Optimal (CWSI < 0.3)', value: 9, color: '#54E38E' },
    { name: 'Mild Stress (0.3 - 0.5)', value: 4, color: '#B6F23A' },
    { name: 'Elevated (0.5 - 0.7)', value: 2, color: '#FFB547' },
    { name: 'Critical (CWSI > 0.7)', value: 1, color: '#FF4545' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Alert Banner */}
      <AlertBanner />

      {/* Simulation Controls Banner if Simulation Mode active */}
      <SimulationPanel />

      {/* Command Center Title & Quick Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[#F4F1E9]">
            AGRICULTURE COMMAND CENTER
          </h1>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            Real-time multi-location telemetry, water balance forecasting, and decision support
          </p>
        </div>

        <WeatherWidget />
      </div>

      {/* Primary KPI Grid (11 Critical Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Monitored Farms"
          value={farms.length}
          unit="locations"
          source="extracted"
          glow="none"
        />
        <MetricCard
          title="Active Telemetry"
          value={`${activeSensors}/${totalSensors}`}
          unit="nodes"
          source="extracted"
          glow="lime"
        />
        <MetricCard
          title="Mean Soil Moisture"
          value={avgMoisture.toFixed(1)}
          unit="vol %"
          change={-2.4}
          changeDirection="down"
          source="calculated"
          glow="orange"
        />
        <MetricCard
          title="Irrigation Urgency"
          value={urgentIrrigationCount}
          unit="fields queued"
          source="calculated"
          glow={urgentIrrigationCount > 0 ? 'red' : 'none'}
        />
        <MetricCard
          title="Critical Alerts"
          value={criticalAlertsCount}
          unit="unresolved"
          source="calculated"
          glow={criticalAlertsCount > 0 ? 'red' : 'none'}
        />
        <MetricCard
          title="Forecast Model R²"
          value="0.94"
          unit="Water-Balance"
          source="calculated"
          glow="lime"
        />
      </div>

      {/* Secondary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Moisture Trend Chart */}
        <div className="lg:col-span-2">
          <ChartWrapper
            title="Multi-Day Moisture Trajectory: Observed vs Water-Balance Model"
            subtitle="Physics-informed model validation with 92% confidence band"
            action={
              <button
                onClick={() => setCurrentPage('forecast')}
                className="flex items-center gap-1 text-xs font-mono text-[#FF8A24] hover:underline"
              >
                Deep Forecast <ArrowRight size={12} />
              </button>
            }
          >
            <LineChart
              data={trendData}
              xAxisKey="day"
              series={[
                { key: 'actual', name: 'Measured Telemetry (%)', color: '#FF8A24', strokeWidth: 2 },
                { key: 'forecast', name: 'Forecast Model (%)', color: '#B6F23A', strokeWidth: 2, strokeDasharray: '4 4' },
              ]}
              yAxisLabel="Moisture %"
            />
          </ChartWrapper>
        </div>

        {/* Crop Stress Distribution */}
        <ChartWrapper
          title="Crop Water Stress Index (CWSI)"
          subtitle="Zonal thermal & root depletion distribution"
        >
          <DonutChart data={stressDist} innerRadius={50} outerRadius={75} />
        </ChartWrapper>
      </div>

      {/* Tertiary Overview Row: Farm Cards & Moisture Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Farm Comparison Bar Chart */}
        <ChartWrapper
          title="Mean Moisture by Installation"
          subtitle="Regional soil water content comparison"
        >
          <BarChart
            data={farmMoistureData}
            xAxisKey="name"
            series={[{ key: 'moisture', name: 'Avg Moisture %', color: '#FF8A24' }]}
            yAxisLabel="Vol %"
          />
        </ChartWrapper>

        {/* Farm Cards Mini-Grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-sm text-[#F4F1E9]">
              Active Farm Installations
            </h3>
            <button
              onClick={() => setCurrentPage('farm-locations')}
              className="text-xs font-mono text-[#FF8A24] flex items-center gap-1 hover:underline"
            >
              Interactive Map <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {farms.map((f) => {
              const fAvg = f.fields.reduce((acc, field) => acc + field.currentMoisture, 0) / f.fields.length;
              return (
                <Card
                  key={f.id}
                  padding="sm"
                  className="cursor-pointer hover:border-[#FF8A24]/60 transition-colors"
                  onClick={() => {
                    setSelectedFarmId(f.id);
                    setCurrentPage('farm-locations');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#F4F1E9]">{f.name}</h4>
                      <p className="text-[10px] font-mono text-[#A6A69A]">
                        {f.region} • {f.totalArea} Ha • {f.fields.length} Fields
                      </p>
                    </div>
                    <Badge variant="lime" size="sm">
                      ACTIVE
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#282820] text-xs font-mono">
                    <span className="text-[#A6A69A]">Average Moisture:</span>
                    <span
                      className="font-extrabold text-sm"
                      style={{ color: fAvg < 35 ? '#FFB547' : '#B6F23A' }}
                    >
                      {fAvg.toFixed(1)}%
                    </span>
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

export default CommandCenter;
