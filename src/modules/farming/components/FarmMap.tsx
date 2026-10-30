import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../store/appStore';
import { useFarmingStore } from '../../../store/farmingStore';
import type { Farm } from '../../../types/farming';
import { MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export const FarmMap: React.FC = () => {
  const { selectedFarmId, setSelectedFarmId } = useAppStore();
  const { farms } = useFarmingStore();

  // Coordinate mapping function for India projection (simplified SVG viewBox 0 0 600 700)
  // Latitude approx 8N to 36N, Longitude approx 68E to 96E
  const mapCoords = (lat: number, lng: number) => {
    const minLat = 8;
    const maxLat = 36;
    const minLng = 68;
    const maxLng = 96;

    const x = ((lng - minLng) / (maxLng - minLng)) * 520 + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 580 + 50;
    return { x, y };
  };

  const selectedFarm = farms.find((f) => f.id === selectedFarmId);

  return (
    <div className="relative w-full rounded-xl border p-4 overflow-hidden flex flex-col md:flex-row gap-4" style={{ backgroundColor: '#171714', borderColor: '#34342B' }}>
      {/* 2D Vector Map Canvas */}
      <div className="flex-1 relative flex items-center justify-center min-h-[380px] bg-[#10100E] rounded-lg border border-[#282820] overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 tech-grid opacity-30" />

        <svg viewBox="0 0 600 700" className="w-full h-full max-h-[460px]">
          {/* Stylized Geo-boundary of India */}
          <path
            d="M 210,50 L 260,70 L 300,60 L 330,90 L 360,110 L 400,120 L 440,150 L 520,180 L 550,220 L 510,260 L 480,270 L 440,320 L 430,360 L 380,410 L 350,470 L 320,540 L 290,620 L 280,660 L 260,620 L 240,550 L 210,480 L 190,430 L 160,370 L 140,330 L 110,280 L 120,240 L 150,220 L 170,180 L 190,130 Z"
            fill="#171714"
            stroke="#34342B"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Region outlines */}
          <circle cx="250" cy="180" r="80" fill="none" stroke="#252520" strokeWidth="1" />
          <circle cx="300" cy="380" r="110" fill="none" stroke="#252520" strokeWidth="1" />

          {/* Farm Pins */}
          {farms.map((farm) => {
            const { x, y } = mapCoords(farm.location.lat, farm.location.lng);
            const isSelected = selectedFarmId === farm.id;
            const avgMoist = farm.fields.reduce((acc, f) => acc + f.currentMoisture, 0) / farm.fields.length;
            const pinColor = avgMoist < 35 ? '#FFB547' : '#B6F23A';

            return (
              <g
                key={farm.id}
                onClick={() => setSelectedFarmId(farm.id)}
                className="cursor-pointer group"
              >
                {/* Pulse Ring if selected */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill="none"
                    stroke="#FF8A24"
                    strokeWidth="2"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Outer Glow Pin */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 14 : 10}
                  fill={isSelected ? '#FF8A24' : '#20201B'}
                  stroke={isSelected ? '#F4F1E9' : pinColor}
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Center Core */}
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={isSelected ? '#0B0B0A' : pinColor}
                />

                {/* Farm Name Label */}
                <text
                  x={x + 16}
                  y={y + 4}
                  fill={isSelected ? '#FF8A24' : '#F4F1E9'}
                  fontSize={isSelected ? '12' : '11'}
                  fontFamily="DM Mono"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {farm.name}
                </text>

                <text
                  x={x + 16}
                  y={y + 17}
                  fill="#A6A69A"
                  fontSize="9"
                  fontFamily="DM Mono"
                >
                  {farm.fields.length} Fields • {avgMoist.toFixed(0)}% Moist
                </text>
              </g>
            );
          })}
        </svg>

        {/* Fictional Demonstration Notice */}
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 border border-[#34342B] text-[9px] font-mono text-[#A6A69A]">
          SIMULATED / DEMONSTRATION GEOSPATIAL COORDINATES
        </div>
      </div>

      {/* Selected Farm Information Card */}
      <div className="w-full md:w-80 flex flex-col justify-between space-y-4">
        {selectedFarm ? (
          <div className="space-y-3">
            <div className="pb-2 border-b" style={{ borderColor: '#34342B' }}>
              <span className="text-[10px] font-mono text-[#FF8A24] uppercase tracking-wider block">
                Selected Installation
              </span>
              <h3 className="font-heading font-bold text-lg" style={{ color: '#F4F1E9' }}>
                {selectedFarm.name}
              </h3>
              <p className="text-xs font-mono text-[#A6A69A]">
                Region: {selectedFarm.region} • Area: {selectedFarm.totalArea} Ha
              </p>
            </div>

            {/* Field Heatmap mini-grid */}
            <div>
              <p className="text-xs font-mono font-medium text-[#A6A69A] mb-1.5">
                Field Moisture Heatmap ({selectedFarm.fields.length} Zones)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {selectedFarm.fields.map((f) => {
                  const m = f.currentMoisture;
                  const color = m < 25 ? '#FF4545' : m < 35 ? '#FFB547' : m < 60 ? '#FF8A24' : '#B6F23A';
                  return (
                    <div
                      key={f.id}
                      className="p-2 rounded border flex flex-col justify-between"
                      style={{ backgroundColor: '#10100E', borderColor: '#34342B' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-[#F4F1E9]">{f.name}</span>
                        <span className="text-[10px] font-mono text-[#A6A69A] uppercase">{f.crop}</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="font-mono text-sm font-extrabold" style={{ color }}>
                          {m.toFixed(1)}%
                        </span>
                        <span className="text-[9px] font-mono text-[#6B6B60]">{f.soilType.replace('_', ' ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-2.5 rounded-lg border text-xs font-mono" style={{ backgroundColor: '#10100E', borderColor: '#34342B' }}>
              <div className="flex justify-between text-[#A6A69A]">
                <span>Coordinates:</span>
                <span className="text-[#F4F1E9]">{selectedFarm.location.lat.toFixed(4)}°N, {selectedFarm.location.lng.toFixed(4)}°E</span>
              </div>
              <div className="flex justify-between text-[#A6A69A] mt-1">
                <span>Telemetry Status:</span>
                <span className="text-[#54E38E] font-bold">100% Online</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs font-mono text-[#A6A69A]">
            Select a farm pin on the map to inspect telemetry
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => setSelectedFarmId(null)}
            className="w-full py-1.5 text-xs font-mono rounded border transition-colors cursor-pointer"
            style={{ backgroundColor: '#20201B', borderColor: '#34342B', color: '#A6A69A' }}
          >
            Show All Farms Overview
          </button>
        </div>
      </div>
    </div>
  );
};
