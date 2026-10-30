import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import { useFarmingStore } from '../../../store/farmingStore';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Settings as SettingsIcon, Save, ToggleLeft, ToggleRight, Shield, Sliders } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { simulationMode, toggleSimulationMode } = useAppStore();
  const { cropProfiles, soilProfiles } = useFarmingStore();

  const [weatherSource, setWeatherSource] = useState<'simulated' | 'api'>('simulated');
  const [selectedCrop, setSelectedCrop] = useState<string>('wheat');
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  const activeCropProfile = cropProfiles.find((c) => c.type === selectedCrop) || cropProfiles[0];

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[#F4F1E9]">
            SYSTEM CONFIGURATION & THRESHOLDS
          </h1>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            Configure biophysical thresholds, simulation parameters, telemetry integration, and alert sensitivities
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Save size={14} />}
          onClick={handleSave}
        >
          Persist Configurations
        </Button>
      </div>

      {savedNotification && (
        <div className="p-3 rounded-xl border border-[#54E38E]/50 bg-[#54E38E]/10 text-xs font-mono text-[#54E38E]">
          Configuration state successfully updated and persisted across operational modules.
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Global Simulation & Connectivity */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#34342B] pb-2">
            <Sliders size={16} className="text-[#FF8A24]" />
            <h3 className="font-heading font-semibold text-sm text-[#F4F1E9]">
              Simulation & Data Ingestion
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#10100E] border border-[#282820]">
              <div>
                <p className="font-semibold text-[#F4F1E9]">Interactive Simulation Mode</p>
                <p className="text-[10px] text-[#A6A69A]">
                  Enables environmental variable manipulation toolbar across pages
                </p>
              </div>
              <button
                onClick={toggleSimulationMode}
                className="text-[#FF8A24] cursor-pointer"
              >
                {simulationMode ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-[#6B6B60]" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#10100E] border border-[#282820]">
              <div>
                <p className="font-semibold text-[#F4F1E9]">Agri-Meteorological Source</p>
                <p className="text-[10px] text-[#A6A69A]">
                  Toggle between high-fidelity deterministic simulator and live Open-Meteo REST API
                </p>
              </div>
              <div className="flex items-center gap-1 border border-[#34342B] p-0.5 rounded bg-[#20201B]">
                <button
                  onClick={() => setWeatherSource('simulated')}
                  className={`px-2 py-1 rounded text-[10px] ${
                    weatherSource === 'simulated' ? 'bg-[#FF8A24] text-black font-bold' : 'text-[#A6A69A]'
                  }`}
                >
                  Simulated
                </button>
                <button
                  onClick={() => setWeatherSource('api')}
                  className={`px-2 py-1 rounded text-[10px] ${
                    weatherSource === 'api' ? 'bg-[#FF8A24] text-black font-bold' : 'text-[#A6A69A]'
                  }`}
                >
                  Live API
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Crop Agronomic Threshold Configurator */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#B6F23A]" />
              <h3 className="font-heading font-semibold text-sm text-[#F4F1E9]">
                Crop Specific Moisture Boundaries
              </h3>
            </div>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="rounded border px-2 py-1 bg-[#10100E] border-[#34342B] text-xs font-mono text-[#F4F1E9] outline-none capitalize"
            >
              {cropProfiles.map((c) => (
                <option key={c.type} value={c.type}>{c.name.split(' ')[0]}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <p className="text-[11px] text-[#A6A69A]">
              Threshold boundaries for <span className="font-bold text-[#F4F1E9]">{activeCropProfile?.name}</span> across growth stages:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-[#34342B] text-[#A6A69A]">
                    <th className="py-1">Stage</th>
                    <th>Wilting %</th>
                    <th>Lower Limit %</th>
                    <th>Optimal %</th>
                    <th>Upper Limit %</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCropProfile && Object.entries(activeCropProfile.moistureThresholds).map(([stage, t]) => (
                    <tr key={stage} className="border-b border-[#282820]">
                      <td className="py-1.5 capitalize text-[#F4F1E9]">{stage}</td>
                      <td className="text-[#FF4545]">{t.wilting}%</td>
                      <td className="text-[#FFB547]">{t.min}%</td>
                      <td className="text-[#54E38E] font-bold">{t.optimal}%</td>
                      <td className="text-[#B6F23A]">{t.max}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
