// Precision Farming Types
export interface Farm {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  region: string;
  totalArea: number; // hectares
  fields: Field[];
  status: 'active' | 'inactive' | 'maintenance';
}

export interface Field {
  id: string;
  farmId: string;
  name: string;
  area: number; // hectares
  crop: CropType;
  growthStage: GrowthStage;
  soilType: SoilType;
  sensors: SensorStation;
  currentMoisture: number;
  forecastMoisture: number;
  irrigationStatus: IrrigationStatus;
  healthScore: number;
  lastUpdated: Date;
}

export type CropType = 'wheat' | 'rice' | 'maize' | 'cotton' | 'sugarcane' | 'mustard' | 'vegetables';
export type GrowthStage = 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity' | 'harvest';
export type SoilType = 'sandy' | 'sandy_loam' | 'loam' | 'clay_loam' | 'clay';
export type IrrigationStatus = 'not_required' | 'recommended' | 'urgent' | 'in_progress' | 'completed';

export interface SensorStation {
  id: string;
  fieldId: string;
  farmId: string;
  location: { lat: number; lng: number };
  sensors: Sensor[];
  connectivity: 'online' | 'offline' | 'intermittent';
  lastSync: Date;
  batteryLevel: number;
}

export interface Sensor {
  id: string;
  type: SensorType;
  category: SensorCategory;
  currentValue: number;
  unit: string;
  minRange: number;
  maxRange: number;
  lastUpdate: Date;
  quality: DataQuality;
  status: 'active' | 'inactive' | 'error' | 'calibrating';
  isSimulated: boolean;
}

export type SensorCategory = 'soil' | 'environmental' | 'water';

export type SensorType =
  | 'capacitive_moisture'
  | 'soil_temperature'
  | 'soil_ph'
  | 'electrical_conductivity'
  | 'npk'
  | 'soil_salinity'
  | 'air_temperature'
  | 'relative_humidity'
  | 'rainfall'
  | 'light_intensity'
  | 'wind_speed'
  | 'atmospheric_pressure'
  | 'water_flow'
  | 'water_level'
  | 'pump_status'
  | 'irrigation_valve';

export type DataQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unavailable';

// Forecasting Types
export interface MoistureForecast {
  fieldId: string;
  currentMoisture: number;
  predictions: ForecastPoint[];
  confidence: number;
  model: ForecastModel;
  depletionRate: number; // % per hour
  timeToThreshold: number | null; // hours until irrigation threshold
  rainfallImpact: number;
  cropTarget: { min: number; max: number; optimal: number };
  lastUpdated: Date;
}

export interface ForecastPoint {
  timestamp: Date;
  predicted: number;
  lower: number; // confidence interval
  upper: number;
  label: string; // e.g., "1h", "6h", "24h"
}

export type ForecastModel = 'persistence' | 'rolling_average' | 'water_balance' | 'ml_regression' | 'time_series';

export interface ForecastModelInfo {
  name: string;
  type: ForecastModel;
  isActive: boolean;
  requiresTrainingData: boolean;
  minDataPoints: number;
  currentDataPoints: number;
  performance?: {
    mae: number;
    rmse: number;
    r2: number;
  };
  description: string;
}

// Irrigation Types
export interface IrrigationRecommendation {
  fieldId: string;
  required: boolean;
  urgency: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recommendedTime: string;
  waterRequired: number; // liters
  waterRequiredM3: number; // cubic meters
  expectedRecovery: number; // target moisture %
  rainfallAdjustment: number; // reduction in water needed
  waterSavingOpportunity: number; // % savings
  irrigationDuration: number; // minutes
  method: string;
  reasoning: string;
}

// Weather Types
export interface WeatherData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  solarRadiation: number;
  pressure: number;
  evapotranspiration: number;
  isSimulated: boolean;
}

export interface WeatherForecast {
  daily: WeatherData[];
  hourly: WeatherData[];
  source: 'api' | 'simulation';
}

// Alert Types
export interface Alert {
  id: string;
  type: AlertType;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  fieldId?: string;
  farmId?: string;
  sensorId?: string;
  value?: number;
  threshold?: number;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
}

export type AlertType =
  | 'sudden_moisture_decrease'
  | 'sudden_moisture_increase'
  | 'dry_soil'
  | 'waterlogging_risk'
  | 'sensor_disconnection'
  | 'abnormal_reading'
  | 'forecast_threshold'
  | 'unexpected_fluctuation'
  | 'high_crop_stress';

// Case Study Types
export interface CaseStudy {
  id: string;
  title: string;
  type: 'drought' | 'waterlogging' | 'smart_irrigation' | 'sensor_failure';
  description: string;
  status: 'idle' | 'running' | 'paused' | 'completed';
  currentStep: number;
  totalSteps: number;
  timeline: CaseStudyEvent[];
  beforeState: Record<string, number>;
  afterState: Record<string, number>;
  alerts: Alert[];
  recommendation: string;
  outcome: string;
  chartData: { time: string; value: number; baseline?: number }[];
}

export interface CaseStudyEvent {
  timestamp: string;
  event: string;
  impact: string;
  type: 'info' | 'warning' | 'critical' | 'action' | 'result';
}

// Crop and Soil Profiles
export interface CropProfile {
  type: CropType;
  name: string;
  moistureThresholds: Record<GrowthStage, { min: number; max: number; optimal: number; wilting: number }>;
  rootDepth: Record<GrowthStage, number>; // cm
  waterRequirement: number; // mm/day average
  growthDuration: number; // days
  description: string;
}

export interface SoilProfile {
  type: SoilType;
  name: string;
  fieldCapacity: number; // %
  wiltingPoint: number; // %
  saturation: number; // %
  infiltrationRate: number; // mm/hr
  drainageRate: number; // mm/hr
  waterHoldingCapacity: number; // mm/m
  description: string;
}

// Simulation
export interface SimulationState {
  isActive: boolean;
  manualOverrides: {
    rainfall?: number;
    temperature?: number;
    irrigation?: number;
    moisture?: number;
    sensorDisconnected?: string[];
  };
  activeScenario?: string;
}

