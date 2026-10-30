import React from 'react';
import { useFarmingStore } from '../../../store/farmingStore';
import { ChartWrapper } from '../../../components/charts/ChartWrapper';
import { LineChart } from '../../../components/charts/LineChart';
import { BarChart } from '../../../components/charts/BarChart';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { CloudSun, Droplets, Wind, Sun, Compass, Activity, Thermometer } from 'lucide-react';
import { calculateET } from '../engines/waterBalance';

const WeatherIntelligence: React.FC = () => {
  const { weatherData, weatherForecast } = useFarmingStore();
  const current = weatherData[weatherData.length - 1] || {
    temperature: 32.4,
    humidity: 55,
    rainfall: 0,
    windSpeed: 2.8,
    solarRadiation: 680,
    pressure: 1011,
    evapotranspiration: 0.26,
  };

  // 7-day multi-variable weather forecast data
  const forecastSeriesData = weatherForecast.slice(0, 168).filter((_, i) => i % 6 === 0).map((w, idx) => ({
    time: `+${(idx + 1) * 6}h`,
    temp: w.temperature,
    humidity: w.humidity,
    et: Number((w.evapotranspiration * 24).toFixed(1)), // Daily equivalent mm
    rain: w.rainfall,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[#F4F1E9]">
            WEATHER INTELLIGENCE & MICRO-CLIMATE
          </h1>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            Atmospheric evaporative demand, solar radiation, Penman-Monteith ET₀, and precipitation
          </p>
        </div>

        <Badge variant="orange" size="md">
          SIMULATED AGRI-METEOROLOGICAL DATA
        </Badge>
      </div>

      {/* Current Conditions 6-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <Card padding="sm" className="space-y-1">
          <div className="flex items-center justify-between text-[#A6A69A]">
            <span>Ambient Temp</span>
            <Thermometer size={14} className="text-[#FF8A24]" />
          </div>
          <span className="font-heading text-2xl font-bold text-[#F4F1E9] block">
            {current.temperature.toFixed(1)}°C
          </span>
          <span className="text-[10px] text-[#54E38E]">Diurnal peak: 36°C</span>
        </Card>

        <Card padding="sm" className="space-y-1">
          <div className="flex items-center justify-between text-[#A6A69A]">
            <span>Relative Humidity</span>
            <Droplets size={14} className="text-[#54E38E]" />
          </div>
          <span className="font-heading text-2xl font-bold text-[#F4F1E9] block">
            {current.humidity.toFixed(0)}%
          </span>
          <span className="text-[10px] text-[#A6A69A]">VPD: 1.84 kPa</span>
        </Card>

        <Card padding="sm" className="space-y-1">
          <div className="flex items-center justify-between text-[#A6A69A]">
            <span>Wind Velocity</span>
            <Wind size={14} className="text-[#B6F23A]" />
          </div>
          <span className="font-heading text-2xl font-bold text-[#F4F1E9] block">
            {current.windSpeed.toFixed(1)} m/s
          </span>
          <span className="text-[10px] text-[#A6A69A]">Azimuth: 240° SW</span>
        </Card>

        <Card padding="sm" className="space-y-1">
          <div className="flex items-center justify-between text-[#A6A69A]">
            <span>Solar Flux</span>
            <Sun size={14} className="text-[#FFB547]" />
          </div>
          <span className="font-heading text-2xl font-bold text-[#F4F1E9] block">
            {current.solarRadiation.toFixed(0)} W/m²
          </span>
          <span className="text-[10px] text-[#A6A69A]">PAR: 1,240 µmol</span>
        </Card>

        <Card padding="sm" className="space-y-1">
          <div className="flex items-center justify-between text-[#A6A69A]">
            <span>Hourly ET₀</span>
            <CloudSun size={14} className="text-[#FF8A24]" />
          </div>
          <span className="font-heading text-2xl font-bold text-[#FF8A24] block">
            {current.evapotranspiration.toFixed(2)} mm
          </span>
          <span className="text-[10px] text-[#A6A69A]">Daily: ~5.8 mm/d</span>
        </Card>

        <Card padding="sm" className="space-y-1">
          <div className="flex items-center justify-between text-[#A6A69A]">
            <span>Precipitation</span>
            <Droplets size={14} className="text-[#54E38E]" />
          </div>
          <span className="font-heading text-2xl font-bold text-[#54E38E] block">
            {current.rainfall.toFixed(1)} mm
          </span>
          <span className="text-[10px] text-[#A6A69A]">24h Sum: 0.0 mm</span>
        </Card>
      </div>

      {/* Forecast Trajectory: Temperature & Relative Humidity */}
      <ChartWrapper
        title="Synoptic Temperature & Relative Humidity Forecast"
        subtitle="7-day outlook modeled at 6-hour temporal resolution"
      >
        <LineChart
          data={forecastSeriesData}
          xAxisKey="time"
          series={[
            { key: 'temp', name: 'Temperature (°C)', color: '#FF8A24', strokeWidth: 2 },
            { key: 'humidity', name: 'Relative Humidity (%)', color: '#54E38E', strokeWidth: 2, strokeDasharray: '3 3' },
          ]}
          yAxisLabel="Value"
          height={270}
        />
      </ChartWrapper>

      {/* Evaporative Demand & Penman-Monteith Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily ET Comparison */}
        <ChartWrapper
          title="Daily Reference Evapotranspiration (ET₀)"
          subtitle="Projected atmospheric moisture suction rate (mm/day)"
        >
          <BarChart
            data={forecastSeriesData.slice(0, 10)}
            xAxisKey="time"
            series={[{ key: 'et', name: 'ET₀ (mm/day)', color: '#FFB547' }]}
            yAxisLabel="mm/day"
            height={240}
          />
        </ChartWrapper>

        {/* Physics Formulation Explainer */}
        <Card className="space-y-3 font-mono text-xs">
          <h3 className="font-heading font-semibold text-sm text-[#F4F1E9]">
            Penman-Monteith Physics Governing Equation
          </h3>
          <p className="text-[11px] text-[#A6A69A] leading-relaxed">
            The system models the biophysical moisture transfer from the canopy to the planetary boundary layer using the standardized FAO-56 Penman-Monteith formulation:
          </p>

          <div className="p-3 rounded-lg border border-[#34342B] bg-[#10100E] text-center font-bold text-sm text-[#B6F23A] overflow-x-auto">
            ET₀ = (0.408·Δ·(Rn - G) + γ·(900/(T + 273))·u₂·(es - ea)) / (Δ + γ·(1 + 0.34·u₂))
          </div>

          <div className="space-y-1 text-[10px] text-[#A6A69A]">
            <div>• <span className="text-[#F4F1E9]">Rn:</span> Net radiation flux at crop surface (MJ/m²/day)</div>
            <div>• <span className="text-[#F4F1E9]">G:</span> Soil heat flux density</div>
            <div>• <span className="text-[#F4F1E9]">(es - ea):</span> Saturation vapor pressure deficit (kPa)</div>
            <div>• <span className="text-[#F4F1E9]">u₂:</span> Wind speed measured at 2m height (m/s)</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WeatherIntelligence;
