import React from 'react';
import { useFarmingStore } from '../../../store/farmingStore';
import { CloudSun, Droplets, Wind, Sun, ArrowUpRight } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
  const { weatherData } = useFarmingStore();
  const current = weatherData[weatherData.length - 1] || {
    temperature: 31.5,
    humidity: 58,
    rainfall: 0,
    windSpeed: 3.2,
    solarRadiation: 650,
    evapotranspiration: 0.24,
  };

  return (
    <div className="rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono" style={{ backgroundColor: '#171714', borderColor: '#34342B' }}>
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg" style={{ backgroundColor: '#20201B', color: '#FF8A24' }}>
          <CloudSun size={20} />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-bold text-lg text-[#F4F1E9]">
              {current.temperature.toFixed(1)}°C
            </span>
            <span className="text-[10px] text-[#A6A69A]">Ambient</span>
          </div>
          <span className="text-[10px] text-[#6B6B60]">Simulated Climate</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[#A6A69A]">
        <div className="flex items-center gap-1.5">
          <Droplets size={14} style={{ color: '#FF8A24' }} />
          <span>{current.humidity.toFixed(0)}% RH</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind size={14} style={{ color: '#B6F23A' }} />
          <span>{current.windSpeed.toFixed(1)} m/s</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sun size={14} style={{ color: '#FFB547' }} />
          <span>{current.evapotranspiration.toFixed(2)} mm/h ET</span>
        </div>
      </div>
    </div>
  );
};
