import React, { useState } from 'react';
import { useFarmingStore } from '../../../store/farmingStore';
import { useAppStore } from '../../../store/appStore';
import { recalculateOnChange } from '../engines/alertEngine';
import { Sliders, RotateCcw, AlertTriangle, Zap, Check } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const SimulationPanel: React.FC = () => {
  const { simulationMode, toggleSimulationMode } = useAppStore();
  const {
    farms,
    simulation,
    setSimulationOverride,
    resetSimulation,
    addAlert,
    updateFieldMoisture,
    cropProfiles,
    soilProfiles,
  } = useFarmingStore();

  const [simTemp, setSimTemp] = useState<number>(32);
  const [simRain, setSimRain] = useState<number>(0);
  const [simIrrigation, setSimIrrigation] = useState<number>(0);
  const [simMoistureShift, setSimMoistureShift] = useState<number>(0);
  const [appliedCount, setAppliedCount] = useState<number>(0);

  if (!simulationMode) return null;

  const handleApplySimulation = () => {
    // 1. Update store simulation state
    setSimulationOverride('temperature', simTemp);
    setSimulationOverride('rainfall', simRain);
    setSimulationOverride('irrigation', simIrrigation);
    setSimulationOverride('moistureShift', simMoistureShift);

    // 2. Shift field moistures
    const allFields = farms.flatMap((f) => f.fields);
    for (const field of allFields) {
      let nextMoisture = field.currentMoisture + simMoistureShift;
      if (simRain > 0) nextMoisture += simRain * 0.4;
      if (simIrrigation > 0) nextMoisture += simIrrigation * 0.6;
      if (simTemp > 35) nextMoisture -= (simTemp - 35) * 0.5;

      const clamped = Math.min(100, Math.max(5, Number(nextMoisture.toFixed(1))));
      updateFieldMoisture(field.id, clamped);
    }

    // 3. Re-evaluate alert rules
    const newAlerts = recalculateOnChange(
      allFields,
      {
        rainfall: simRain,
        temperature: simTemp,
        irrigation: simIrrigation,
      },
      cropProfiles,
      soilProfiles
    );

    // 4. Inject newly triggered alerts
    for (const alert of newAlerts) {
      addAlert(alert);
    }

    setAppliedCount((c) => c + 1);
  };

  const handleReset = () => {
    setSimTemp(32);
    setSimRain(0);
    setSimIrrigation(0);
    setSimMoistureShift(0);
    resetSimulation();
  };

  return (
    <Card
      glow="orange"
      className="border-2 border-[#FF8A24]/60 p-4 space-y-4 mb-6"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#34342B]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-[#FF8A24]/20 text-[#FF8A24]">
            <Sliders size={18} />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-[#F4F1E9]">
              Interactive Precision Agriculture Simulator
            </h4>
            <p className="text-[10px] font-mono text-[#A6A69A]">
              Manipulate environmental parameters and observe instantaneous recalculations across forecasting & alert matrix
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF8A24] text-black">
            SIMULATION ENGAGED
          </span>
          <button
            onClick={handleReset}
            className="p-1.5 rounded border border-[#34342B] bg-[#20201B] text-[#A6A69A] hover:text-[#F4F1E9]"
            title="Reset to Baseline"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        {/* Ambient Temperature */}
        <div className="space-y-1.5 p-3 rounded-lg bg-[#10100E] border border-[#282820]">
          <div className="flex justify-between">
            <span className="text-[#A6A69A]">Ambient Temp:</span>
            <span className="font-bold text-[#FF8A24]">{simTemp}°C</span>
          </div>
          <input
            type="range"
            min="15"
            max="48"
            value={simTemp}
            onChange={(e) => setSimTemp(Number(e.target.value))}
            className="w-full accent-[#FF8A24] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-[#6B6B60]">
            <span>15°C (Cool)</span>
            <span>48°C (Extreme Heat)</span>
          </div>
        </div>

        {/* Rainfall Intensity */}
        <div className="space-y-1.5 p-3 rounded-lg bg-[#10100E] border border-[#282820]">
          <div className="flex justify-between">
            <span className="text-[#A6A69A]">Precipitation:</span>
            <span className="font-bold text-[#54E38E]">{simRain} mm</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            value={simRain}
            onChange={(e) => setSimRain(Number(e.target.value))}
            className="w-full accent-[#54E38E] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-[#6B6B60]">
            <span>0 mm (Dry)</span>
            <span>80 mm (Monsoon Cloudburst)</span>
          </div>
        </div>

        {/* Supplemental Irrigation */}
        <div className="space-y-1.5 p-3 rounded-lg bg-[#10100E] border border-[#282820]">
          <div className="flex justify-between">
            <span className="text-[#A6A69A]">Irrigation Pulse:</span>
            <span className="font-bold text-[#B6F23A]">{simIrrigation} mm</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={simIrrigation}
            onChange={(e) => setSimIrrigation(Number(e.target.value))}
            className="w-full accent-[#B6F23A] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-[#6B6B60]">
            <span>0 mm</span>
            <span>50 mm (Flood Drench)</span>
          </div>
        </div>

        {/* Direct Moisture Offset */}
        <div className="space-y-1.5 p-3 rounded-lg bg-[#10100E] border border-[#282820]">
          <div className="flex justify-between">
            <span className="text-[#A6A69A]">Moisture Delta:</span>
            <span className="font-bold text-[#FFB547]">{simMoistureShift > 0 ? `+${simMoistureShift}` : simMoistureShift}%</span>
          </div>
          <input
            type="range"
            min="-25"
            max="25"
            value={simMoistureShift}
            onChange={(e) => setSimMoistureShift(Number(e.target.value))}
            className="w-full accent-[#FFB547] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-[#6B6B60]">
            <span>-25% (Depletion)</span>
            <span>+25% (Surge)</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] font-mono text-[#A6A69A]">
          Simulations run: {appliedCount} • Physics recalculations executed deterministically
        </span>
        <Button
          variant="primary"
          size="sm"
          icon={<Zap size={14} />}
          onClick={handleApplySimulation}
        >
          Propagate Simulation to Telemetry & Forecasts
        </Button>
      </div>
    </Card>
  );
};
