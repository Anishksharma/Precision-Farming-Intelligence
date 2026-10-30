// Crop and Soil Profile Data — Real agronomic ranges
import type { CropProfile, SoilProfile } from '../../../types/farming';

/**
 * Complete moisture thresholds for all 7 crop types across all growth stages.
 * Data sourced from FAO Irrigation & Drainage Paper 56 and Indian agronomy references.
 */
export const CROP_PROFILES: CropProfile[] = [
  {
    type: 'wheat',
    name: 'Wheat (Triticum aestivum)',
    waterRequirement: 4.5,
    growthDuration: 120,
    description: 'Rabi season cereal crop. Requires moderate moisture; sensitive to waterlogging.',
    rootDepth: {
      germination: 10, seedling: 15, vegetative: 30, flowering: 40,
      fruiting: 40, maturity: 35, harvest: 30,
    },
    moistureThresholds: {
      germination:  { min: 40, max: 70, optimal: 55, wilting: 22 },
      seedling:     { min: 38, max: 68, optimal: 52, wilting: 20 },
      vegetative:   { min: 35, max: 70, optimal: 50, wilting: 20 },
      flowering:    { min: 40, max: 72, optimal: 55, wilting: 22 },
      fruiting:     { min: 35, max: 65, optimal: 48, wilting: 18 },
      maturity:     { min: 25, max: 55, optimal: 38, wilting: 15 },
      harvest:      { min: 20, max: 45, optimal: 30, wilting: 12 },
    },
  },
  {
    type: 'rice',
    name: 'Rice (Oryza sativa)',
    waterRequirement: 7.0,
    growthDuration: 135,
    description: 'Kharif season paddy crop. Requires standing water or saturated conditions during most stages.',
    rootDepth: {
      germination: 8, seedling: 12, vegetative: 25, flowering: 30,
      fruiting: 30, maturity: 25, harvest: 20,
    },
    moistureThresholds: {
      germination:  { min: 60, max: 95, optimal: 80, wilting: 40 },
      seedling:     { min: 55, max: 90, optimal: 75, wilting: 38 },
      vegetative:   { min: 60, max: 92, optimal: 78, wilting: 40 },
      flowering:    { min: 60, max: 90, optimal: 75, wilting: 40 },
      fruiting:     { min: 55, max: 85, optimal: 70, wilting: 35 },
      maturity:     { min: 40, max: 70, optimal: 55, wilting: 28 },
      harvest:      { min: 25, max: 50, optimal: 35, wilting: 18 },
    },
  },
  {
    type: 'maize',
    name: 'Maize (Zea mays)',
    waterRequirement: 5.5,
    growthDuration: 110,
    description: 'Versatile cereal crop; moderately drought-tolerant but sensitive during tasseling.',
    rootDepth: {
      germination: 10, seedling: 18, vegetative: 35, flowering: 50,
      fruiting: 50, maturity: 45, harvest: 35,
    },
    moistureThresholds: {
      germination:  { min: 40, max: 72, optimal: 55, wilting: 22 },
      seedling:     { min: 35, max: 70, optimal: 50, wilting: 20 },
      vegetative:   { min: 35, max: 68, optimal: 48, wilting: 18 },
      flowering:    { min: 45, max: 75, optimal: 58, wilting: 25 },
      fruiting:     { min: 40, max: 70, optimal: 52, wilting: 22 },
      maturity:     { min: 30, max: 58, optimal: 42, wilting: 16 },
      harvest:      { min: 22, max: 48, optimal: 32, wilting: 12 },
    },
  },
  {
    type: 'cotton',
    name: 'Cotton (Gossypium)',
    waterRequirement: 5.0,
    growthDuration: 180,
    description: 'Cash crop needing well-drained soils; sensitive to waterlogging at all stages.',
    rootDepth: {
      germination: 10, seedling: 20, vegetative: 40, flowering: 60,
      fruiting: 60, maturity: 50, harvest: 40,
    },
    moistureThresholds: {
      germination:  { min: 35, max: 65, optimal: 50, wilting: 18 },
      seedling:     { min: 30, max: 62, optimal: 45, wilting: 16 },
      vegetative:   { min: 30, max: 60, optimal: 42, wilting: 15 },
      flowering:    { min: 35, max: 65, optimal: 48, wilting: 18 },
      fruiting:     { min: 30, max: 58, optimal: 42, wilting: 15 },
      maturity:     { min: 22, max: 50, optimal: 35, wilting: 12 },
      harvest:      { min: 18, max: 42, optimal: 28, wilting: 10 },
    },
  },
  {
    type: 'sugarcane',
    name: 'Sugarcane (Saccharum officinarum)',
    waterRequirement: 6.5,
    growthDuration: 360,
    description: 'High water-demand perennial cash crop; long growing season of 10-12 months.',
    rootDepth: {
      germination: 10, seedling: 15, vegetative: 35, flowering: 50,
      fruiting: 50, maturity: 45, harvest: 40,
    },
    moistureThresholds: {
      germination:  { min: 50, max: 80, optimal: 65, wilting: 30 },
      seedling:     { min: 45, max: 78, optimal: 60, wilting: 28 },
      vegetative:   { min: 50, max: 82, optimal: 65, wilting: 30 },
      flowering:    { min: 45, max: 75, optimal: 58, wilting: 25 },
      fruiting:     { min: 42, max: 72, optimal: 55, wilting: 24 },
      maturity:     { min: 35, max: 60, optimal: 45, wilting: 20 },
      harvest:      { min: 25, max: 48, optimal: 35, wilting: 15 },
    },
  },
  {
    type: 'mustard',
    name: 'Mustard (Brassica juncea)',
    waterRequirement: 3.0,
    growthDuration: 110,
    description: 'Rabi oilseed crop with low water requirements; drought-tolerant once established.',
    rootDepth: {
      germination: 8, seedling: 12, vegetative: 25, flowering: 35,
      fruiting: 35, maturity: 30, harvest: 25,
    },
    moistureThresholds: {
      germination:  { min: 35, max: 65, optimal: 48, wilting: 18 },
      seedling:     { min: 30, max: 60, optimal: 42, wilting: 16 },
      vegetative:   { min: 28, max: 58, optimal: 40, wilting: 14 },
      flowering:    { min: 32, max: 62, optimal: 45, wilting: 16 },
      fruiting:     { min: 28, max: 55, optimal: 38, wilting: 14 },
      maturity:     { min: 22, max: 48, optimal: 32, wilting: 12 },
      harvest:      { min: 18, max: 40, optimal: 28, wilting: 10 },
    },
  },
  {
    type: 'vegetables',
    name: 'Vegetables (Mixed)',
    waterRequirement: 4.0,
    growthDuration: 90,
    description: 'Mixed vegetables including tomato, potato, onion, cauliflower. Moderate water demand.',
    rootDepth: {
      germination: 5, seedling: 10, vegetative: 20, flowering: 30,
      fruiting: 30, maturity: 25, harvest: 20,
    },
    moistureThresholds: {
      germination:  { min: 45, max: 75, optimal: 60, wilting: 25 },
      seedling:     { min: 40, max: 72, optimal: 55, wilting: 22 },
      vegetative:   { min: 38, max: 70, optimal: 52, wilting: 20 },
      flowering:    { min: 42, max: 72, optimal: 55, wilting: 22 },
      fruiting:     { min: 40, max: 70, optimal: 52, wilting: 20 },
      maturity:     { min: 32, max: 60, optimal: 44, wilting: 16 },
      harvest:      { min: 25, max: 50, optimal: 35, wilting: 14 },
    },
  },
];

/**
 * Soil hydraulic properties for all 5 soil types.
 * Based on USDA soil classification and FAO soil data.
 */
export const SOIL_PROFILES: SoilProfile[] = [
  {
    type: 'sandy',
    name: 'Sandy Soil',
    fieldCapacity: 15,
    wiltingPoint: 5,
    saturation: 40,
    infiltrationRate: 50,
    drainageRate: 25,
    waterHoldingCapacity: 100,
    description: 'Coarse texture with rapid drainage. Low water retention, high aeration. Requires frequent irrigation.',
  },
  {
    type: 'sandy_loam',
    name: 'Sandy Loam',
    fieldCapacity: 22,
    wiltingPoint: 8,
    saturation: 45,
    infiltrationRate: 25,
    drainageRate: 15,
    waterHoldingCapacity: 140,
    description: 'Moderately coarse texture. Better water retention than sand with good drainage.',
  },
  {
    type: 'loam',
    name: 'Loam Soil',
    fieldCapacity: 30,
    wiltingPoint: 12,
    saturation: 50,
    infiltrationRate: 13,
    drainageRate: 8,
    waterHoldingCapacity: 180,
    description: 'Balanced mixture of sand, silt, and clay. Ideal for most crops with good water-holding capacity.',
  },
  {
    type: 'clay_loam',
    name: 'Clay Loam',
    fieldCapacity: 35,
    wiltingPoint: 16,
    saturation: 52,
    infiltrationRate: 8,
    drainageRate: 4,
    waterHoldingCapacity: 200,
    description: 'Fine-textured with high water retention. Moderate drainage; susceptible to compaction.',
  },
  {
    type: 'clay',
    name: 'Clay Soil',
    fieldCapacity: 40,
    wiltingPoint: 20,
    saturation: 55,
    infiltrationRate: 5,
    drainageRate: 2,
    waterHoldingCapacity: 220,
    description: 'Very fine texture, high water holding capacity. Slow drainage, prone to waterlogging.',
  },
];

/**
 * Lookup helpers
 */
export function getCropProfile(cropType: string): CropProfile | undefined {
  return CROP_PROFILES.find(p => p.type === cropType);
}

export function getSoilProfile(soilType: string): SoilProfile | undefined {
  return SOIL_PROFILES.find(p => p.type === soilType);
}
