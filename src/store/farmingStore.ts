import { create } from 'zustand';
import type { 
  Farm, Field, Sensor, MoistureForecast, IrrigationRecommendation, 
  WeatherData, Alert, CaseStudy, SimulationState, CropProfile, SoilProfile 
} from '../types/farming';
import { generateDemoFarms } from '../modules/farming/data/demoFarms';
import { generateDemoForecasts } from '../modules/farming/data/demoForecasts';
import { generateDemoAlerts } from '../modules/farming/data/demoAlerts';
import { generateDemoWeather } from '../modules/farming/data/demoWeather';
import { generateCaseStudies } from '../modules/farming/data/casestudies';
import { CROP_PROFILES, SOIL_PROFILES } from '../modules/farming/data/profiles';

interface FarmingStore {
  // Farms
  farms: Farm[];
  selectedFieldId: string | null;
  setSelectedFieldId: (id: string | null) => void;
  getField: (fieldId: string) => Field | undefined;
  getAllFields: () => Field[];
  
  // Forecasts
  forecasts: Record<string, MoistureForecast>;
  updateForecast: (fieldId: string, forecast: MoistureForecast) => void;
  
  // Irrigation
  irrigationRecommendations: Record<string, IrrigationRecommendation>;
  updateIrrigationRec: (fieldId: string, rec: IrrigationRecommendation) => void;
  
  // Weather
  weatherData: WeatherData[];
  weatherForecast: WeatherData[];
  
  // Alerts
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  clearResolvedAlerts: () => void;
  
  // Case Studies
  caseStudies: CaseStudy[];
  startCaseStudy: (id: string) => void;
  pauseCaseStudy: (id: string) => void;
  resetCaseStudy: (id: string) => void;
  advanceCaseStudy: (id: string) => void;
  
  // Profiles
  cropProfiles: CropProfile[];
  soilProfiles: SoilProfile[];
  
  // Simulation
  simulation: SimulationState;
  setSimulationOverride: (key: string, value: unknown) => void;
  resetSimulation: () => void;
  
  // Sensor updates
  updateSensorValue: (farmId: string, fieldId: string, sensorId: string, value: number) => void;
  updateFieldMoisture: (fieldId: string, moisture: number) => void;

  // Init
  initialize: () => void;
  initialized: boolean;
}

export const useFarmingStore = create<FarmingStore>((set, get) => ({
  farms: [],
  selectedFieldId: null,
  setSelectedFieldId: (id) => set({ selectedFieldId: id }),
  
  getField: (fieldId) => {
    for (const farm of get().farms) {
      const field = farm.fields.find(f => f.id === fieldId);
      if (field) return field;
    }
    return undefined;
  },
  
  getAllFields: () => get().farms.flatMap(f => f.fields),
  
  forecasts: {},
  updateForecast: (fieldId, forecast) =>
    set(s => ({ forecasts: { ...s.forecasts, [fieldId]: forecast } })),
  
  irrigationRecommendations: {},
  updateIrrigationRec: (fieldId, rec) =>
    set(s => ({ irrigationRecommendations: { ...s.irrigationRecommendations, [fieldId]: rec } })),
  
  weatherData: [],
  weatherForecast: [],
  
  alerts: [],
  addAlert: (alert) => set(s => ({ alerts: [alert, ...s.alerts] })),
  acknowledgeAlert: (id) =>
    set(s => ({
      alerts: s.alerts.map(a =>
        a.id === id ? { ...a, acknowledged: true, acknowledgedAt: new Date() } : a
      ),
    })),
  resolveAlert: (id) =>
    set(s => ({
      alerts: s.alerts.map(a =>
        a.id === id ? { ...a, resolved: true, resolvedAt: new Date() } : a
      ),
    })),
  clearResolvedAlerts: () =>
    set(s => ({ alerts: s.alerts.filter(a => !a.resolved) })),
  
  caseStudies: [],
  startCaseStudy: (id) =>
    set(s => ({
      caseStudies: s.caseStudies.map(cs =>
        cs.id === id ? { ...cs, status: 'running' as const, currentStep: 0 } : cs
      ),
    })),
  pauseCaseStudy: (id) =>
    set(s => ({
      caseStudies: s.caseStudies.map(cs =>
        cs.id === id ? { ...cs, status: 'paused' as const } : cs
      ),
    })),
  resetCaseStudy: (id) =>
    set(s => ({
      caseStudies: s.caseStudies.map(cs =>
        cs.id === id ? { ...cs, status: 'idle' as const, currentStep: 0, alerts: [] } : cs
      ),
    })),
  advanceCaseStudy: (id) =>
    set(s => ({
      caseStudies: s.caseStudies.map(cs =>
        cs.id === id && cs.currentStep < cs.totalSteps
          ? { ...cs, currentStep: cs.currentStep + 1, status: cs.currentStep + 1 >= cs.totalSteps ? 'completed' as const : cs.status }
          : cs
      ),
    })),
  
  cropProfiles: [],
  soilProfiles: [],
  
  simulation: { isActive: false, manualOverrides: {} },
  setSimulationOverride: (key, value) =>
    set(s => ({
      simulation: {
        ...s.simulation,
        isActive: true,
        manualOverrides: { ...s.simulation.manualOverrides, [key]: value },
      },
    })),
  resetSimulation: () =>
    set({ simulation: { isActive: false, manualOverrides: {} } }),
  
  updateSensorValue: (farmId, fieldId, sensorId, value) =>
    set(s => ({
      farms: s.farms.map(farm =>
        farm.id === farmId
          ? {
              ...farm,
              fields: farm.fields.map(field =>
                field.id === fieldId
                  ? {
                      ...field,
                      sensors: {
                        ...field.sensors,
                        sensors: field.sensors.sensors.map(sensor =>
                          sensor.id === sensorId
                            ? { ...sensor, currentValue: value, lastUpdate: new Date() }
                            : sensor
                        ),
                      },
                    }
                  : field
              ),
            }
          : farm
      ),
    })),
  
  updateFieldMoisture: (fieldId, moisture) =>
    set(s => ({
      farms: s.farms.map(farm => ({
        ...farm,
        fields: farm.fields.map(field =>
          field.id === fieldId ? { ...field, currentMoisture: moisture, lastUpdated: new Date() } : field
        ),
      })),
    })),
  
  initialized: false,
  initialize: () => {
    if (get().initialized) return;
    const farms = generateDemoFarms();
    const forecasts = generateDemoForecasts(farms);
    const alerts = generateDemoAlerts();
    const weather = generateDemoWeather();
    const cases = generateCaseStudies();
    set({
      farms,
      forecasts,
      alerts,
      weatherData: weather.current,
      weatherForecast: weather.forecast,
      caseStudies: cases,
      cropProfiles: CROP_PROFILES,
      soilProfiles: SOIL_PROFILES,
      initialized: true,
    });
  },
}));

