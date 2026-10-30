// Demo Farm Data Generator — All data marked as simulated
import type { Farm, Field, SensorStation, Sensor, SensorType, SensorCategory, CropType, GrowthStage, SoilType } from '../../../types/farming';

/* ─── Sensor specification table ─── */
interface SensorSpec {
  type: SensorType;
  category: SensorCategory;
  unit: string;
  minRange: number;
  maxRange: number;
  generate: (fieldCtx: FieldContext) => number;
}

interface FieldContext {
  moisture: number;
  crop: CropType;
  soilType: SoilType;
  lat: number;
}

const SENSOR_SPECS: SensorSpec[] = [
  {
    type: 'capacitive_moisture',
    category: 'soil',
    unit: '%',
    minRange: 0,
    maxRange: 100,
    generate: (ctx) => ctx.moisture + (Math.random() - 0.5) * 2,
  },
  {
    type: 'soil_temperature',
    category: 'soil',
    unit: '°C',
    minRange: 0,
    maxRange: 60,
    generate: (ctx) => {
      const base = ctx.lat > 25 ? 22 : 26;
      return base + (Math.random() - 0.5) * 6;
    },
  },
  {
    type: 'soil_ph',
    category: 'soil',
    unit: 'pH',
    minRange: 3,
    maxRange: 10,
    generate: (ctx) => {
      const bases: Record<SoilType, number> = {
        sandy: 6.2, sandy_loam: 6.5, loam: 6.8, clay_loam: 7.0, clay: 7.3,
      };
      return (bases[ctx.soilType] || 6.8) + (Math.random() - 0.5) * 0.6;
    },
  },
  {
    type: 'electrical_conductivity',
    category: 'soil',
    unit: 'dS/m',
    minRange: 0,
    maxRange: 8,
    generate: () => 0.3 + Math.random() * 1.5,
  },
  {
    type: 'air_temperature',
    category: 'environmental',
    unit: '°C',
    minRange: -10,
    maxRange: 55,
    generate: (ctx) => {
      const base = ctx.lat > 25 ? 28 : 32;
      return base + (Math.random() - 0.5) * 8;
    },
  },
  {
    type: 'relative_humidity',
    category: 'environmental',
    unit: '%',
    minRange: 0,
    maxRange: 100,
    generate: (ctx) => {
      const base = ctx.moisture > 50 ? 65 : 50;
      return base + (Math.random() - 0.5) * 20;
    },
  },
  {
    type: 'rainfall',
    category: 'environmental',
    unit: 'mm/hr',
    minRange: 0,
    maxRange: 100,
    generate: () => Math.random() < 0.7 ? 0 : Math.random() * 8,
  },
  {
    type: 'light_intensity',
    category: 'environmental',
    unit: 'lux',
    minRange: 0,
    maxRange: 120000,
    generate: () => 25000 + Math.random() * 55000,
  },
  {
    type: 'wind_speed',
    category: 'environmental',
    unit: 'm/s',
    minRange: 0,
    maxRange: 30,
    generate: () => 1.5 + Math.random() * 5,
  },
  {
    type: 'atmospheric_pressure',
    category: 'environmental',
    unit: 'hPa',
    minRange: 950,
    maxRange: 1050,
    generate: () => 1008 + (Math.random() - 0.5) * 12,
  },
  {
    type: 'water_flow',
    category: 'water',
    unit: 'L/min',
    minRange: 0,
    maxRange: 200,
    generate: () => Math.random() < 0.6 ? 0 : 20 + Math.random() * 80,
  },
  {
    type: 'water_level',
    category: 'water',
    unit: 'cm',
    minRange: 0,
    maxRange: 200,
    generate: (ctx) => ctx.moisture > 60 ? 40 + Math.random() * 60 : 5 + Math.random() * 30,
  },
];

function generateSensors(fieldId: string, farmId: string, ctx: FieldContext): Sensor[] {
  const now = new Date();
  return SENSOR_SPECS.map((spec, i) => {
    const rawValue = spec.generate(ctx);
    const value = Math.round(Math.max(spec.minRange, Math.min(spec.maxRange, rawValue)) * 100) / 100;
    return {
      id: `${fieldId}-sensor-${i + 1}`,
      type: spec.type,
      category: spec.category,
      currentValue: value,
      unit: spec.unit,
      minRange: spec.minRange,
      maxRange: spec.maxRange,
      lastUpdate: new Date(now.getTime() - Math.random() * 300000), // within last 5 min
      quality: 'good' as const,
      status: 'active' as const,
      isSimulated: true,
    };
  });
}

function generateSensorStation(fieldId: string, farmId: string, lat: number, lng: number, ctx: FieldContext): SensorStation {
  return {
    id: `station-${fieldId}`,
    fieldId,
    farmId,
    location: { lat: lat + (Math.random() - 0.5) * 0.01, lng: lng + (Math.random() - 0.5) * 0.01 },
    sensors: generateSensors(fieldId, farmId, ctx),
    connectivity: 'online',
    lastSync: new Date(),
    batteryLevel: 70 + Math.random() * 28,
  };
}

interface FieldDef {
  id: string;
  name: string;
  area: number;
  crop: CropType;
  growthStage: GrowthStage;
  soilType: SoilType;
  moisture: number;
}

function buildField(def: FieldDef, farmId: string, lat: number, lng: number): Field {
  const ctx: FieldContext = { moisture: def.moisture, crop: def.crop, soilType: def.soilType, lat };
  return {
    id: def.id,
    farmId,
    name: def.name,
    area: def.area,
    crop: def.crop,
    growthStage: def.growthStage,
    soilType: def.soilType,
    sensors: generateSensorStation(def.id, farmId, lat, lng, ctx),
    currentMoisture: def.moisture,
    forecastMoisture: def.moisture + (Math.random() - 0.5) * 6,
    irrigationStatus: def.moisture < 30 ? 'urgent' : def.moisture < 40 ? 'recommended' : 'not_required',
    healthScore: Math.round(50 + (def.moisture / 100) * 40 + Math.random() * 10),
    lastUpdated: new Date(),
  };
}

/**
 * Generates 4 demonstration farms with realistic Indian agricultural data.
 * All sensor readings are simulated.
 */
export function generateDemoFarms(): Farm[] {
  const farms: Farm[] = [
    {
      id: 'farm-1',
      name: 'Kisan Agro Research Farm',
      location: { lat: 28.6139, lng: 77.2090 },
      region: 'Delhi NCR',
      totalArea: 120,
      status: 'active',
      fields: [
        buildField({ id: 'field-A1', name: 'Field A1', area: 30, crop: 'wheat', growthStage: 'vegetative', soilType: 'loam', moisture: 42 }, 'farm-1', 28.6139, 77.2090),
        buildField({ id: 'field-A2', name: 'Field A2', area: 25, crop: 'rice', growthStage: 'flowering', soilType: 'clay_loam', moisture: 65 }, 'farm-1', 28.6139, 77.2090),
        buildField({ id: 'field-A3', name: 'Field A3', area: 35, crop: 'maize', growthStage: 'seedling', soilType: 'sandy_loam', moisture: 38 }, 'farm-1', 28.6139, 77.2090),
        buildField({ id: 'field-A4', name: 'Field A4', area: 30, crop: 'cotton', growthStage: 'vegetative', soilType: 'loam', moisture: 35 }, 'farm-1', 28.6139, 77.2090),
      ],
    },
    {
      id: 'farm-2',
      name: 'Green Valley Cooperative',
      location: { lat: 26.8467, lng: 80.9462 },
      region: 'Lucknow, UP',
      totalArea: 200,
      status: 'active',
      fields: [
        buildField({ id: 'field-B1', name: 'Field B1', area: 45, crop: 'sugarcane', growthStage: 'vegetative', soilType: 'clay_loam', moisture: 58 }, 'farm-2', 26.8467, 80.9462),
        buildField({ id: 'field-B2', name: 'Field B2', area: 50, crop: 'wheat', growthStage: 'maturity', soilType: 'loam', moisture: 30 }, 'farm-2', 26.8467, 80.9462),
        buildField({ id: 'field-B3', name: 'Field B3', area: 55, crop: 'rice', growthStage: 'flowering', soilType: 'clay', moisture: 70 }, 'farm-2', 26.8467, 80.9462),
        buildField({ id: 'field-B4', name: 'Field B4', area: 50, crop: 'mustard', growthStage: 'flowering', soilType: 'sandy_loam', moisture: 33 }, 'farm-2', 26.8467, 80.9462),
      ],
    },
    {
      id: 'farm-3',
      name: 'Punjab Smart Farm',
      location: { lat: 30.7333, lng: 76.7794 },
      region: 'Chandigarh, Punjab',
      totalArea: 150,
      status: 'active',
      fields: [
        buildField({ id: 'field-C1', name: 'Field C1', area: 40, crop: 'wheat', growthStage: 'vegetative', soilType: 'loam', moisture: 45 }, 'farm-3', 30.7333, 76.7794),
        buildField({ id: 'field-C2', name: 'Field C2', area: 35, crop: 'rice', growthStage: 'maturity', soilType: 'clay_loam', moisture: 55 }, 'farm-3', 30.7333, 76.7794),
        buildField({ id: 'field-C3', name: 'Field C3', area: 40, crop: 'maize', growthStage: 'flowering', soilType: 'sandy_loam', moisture: 40 }, 'farm-3', 30.7333, 76.7794),
        buildField({ id: 'field-C4', name: 'Field C4', area: 35, crop: 'vegetables', growthStage: 'fruiting', soilType: 'loam', moisture: 50 }, 'farm-3', 30.7333, 76.7794),
      ],
    },
    {
      id: 'farm-4',
      name: 'Deccan Plateau AgriTech',
      location: { lat: 17.3850, lng: 78.4867 },
      region: 'Hyderabad, Telangana',
      totalArea: 180,
      status: 'active',
      fields: [
        buildField({ id: 'field-D1', name: 'Field D1', area: 50, crop: 'cotton', growthStage: 'flowering', soilType: 'sandy', moisture: 28 }, 'farm-4', 17.3850, 78.4867),
        buildField({ id: 'field-D2', name: 'Field D2', area: 45, crop: 'sugarcane', growthStage: 'vegetative', soilType: 'clay_loam', moisture: 62 }, 'farm-4', 17.3850, 78.4867),
        buildField({ id: 'field-D3', name: 'Field D3', area: 45, crop: 'maize', growthStage: 'seedling', soilType: 'loam', moisture: 36 }, 'farm-4', 17.3850, 78.4867),
        buildField({ id: 'field-D4', name: 'Field D4', area: 40, crop: 'vegetables', growthStage: 'vegetative', soilType: 'sandy_loam', moisture: 44 }, 'farm-4', 17.3850, 78.4867),
      ],
    },
  ];

  return farms;
}
