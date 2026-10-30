// Irrigation Recommendation Engine
import type { 
  Field, MoistureForecast, WeatherData, CropProfile, SoilProfile, IrrigationRecommendation 
} from '../../../types/farming';

/**
 * Calculates net water deficit in Liters and Cubic Meters to bring soil to target moisture.
 * Deficit = (Target% - Current%) / 100 * RootDepth (m) * Area (m²) * 1000 (L/m³)
 */
export function calculateWaterDeficit(
  currentMoisture: number,
  targetMoisture: number,
  areaHectares: number,
  rootDepthCm: number
): { liters: number; cubicMeters: number } {
  if (currentMoisture >= targetMoisture) {
    return { liters: 0, cubicMeters: 0 };
  }

  const moistureDeficitFraction = (targetMoisture - currentMoisture) / 100;
  const areaM2 = areaHectares * 10000;
  const rootDepthM = rootDepthCm / 100;

  const cubicMeters = Math.round(moistureDeficitFraction * rootDepthM * areaM2);
  const liters = cubicMeters * 1000;

  return { liters, cubicMeters };
}

/**
 * Calculates recommended irrigation duration in minutes.
 * Standard drip system: ~25 m³/ha/hour flow rate at 90% application efficiency.
 */
export function calculateIrrigationDuration(
  waterNeededM3: number,
  areaHectares: number,
  flowRateM3PerHourPerHa = 25,
  efficiency = 0.90
): number {
  if (waterNeededM3 <= 0 || areaHectares <= 0) return 0;
  const effectiveFlowRate = flowRateM3PerHourPerHa * areaHectares * efficiency;
  const hours = waterNeededM3 / effectiveFlowRate;
  return Math.round(hours * 60);
}

/**
 * Generates an intelligent, forecast-adjusted irrigation recommendation.
 * Considers upcoming rainfall in the next 24-48h to avoid redundant pumping.
 */
export function generateRecommendation(
  field: Field,
  forecast: MoistureForecast | undefined,
  weatherForecast: WeatherData[],
  crop: CropProfile,
  soil: SoilProfile
): IrrigationRecommendation {
  const thresholds = crop.moistureThresholds[field.growthStage] || {
    min: 35,
    max: 70,
    optimal: 50,
    wilting: 20,
  };
  const rootDepth = crop.rootDepth[field.growthStage] || 30;

  // Upcoming rainfall in next 24 hours (sum)
  const next24hRainfall = weatherForecast
    .slice(0, 24)
    .reduce((sum, w) => sum + (w.rainfall || 0), 0);

  // Convert upcoming rain to expected moisture increase
  const rainMoistureEquivalent = Number(((next24hRainfall / (rootDepth * 10)) * 100).toFixed(1));

  const current = field.currentMoisture;
  const deficitGap = thresholds.optimal - current;

  let required = false;
  let urgency: IrrigationRecommendation['urgency'] = 'none';
  let recommendedTime = 'No irrigation required within next 48h';
  let reasoning = `Soil moisture at ${current.toFixed(1)}% is within optimal range (${thresholds.min}% - ${thresholds.max}%).`;

  if (current <= thresholds.wilting + 2) {
    required = true;
    urgency = 'critical';
    recommendedTime = 'IMMEDIATE — Within 1 hour';
    reasoning = `Moisture at ${current.toFixed(1)}% is dangerously close to wilting threshold (${thresholds.wilting}%). Emergency irrigation needed to avert yield penalty.`;
  } else if (current <= thresholds.min) {
    required = true;
    urgency = 'high';
    recommendedTime = 'Dusk today (18:30 IST) to minimize evaporative loss';
    reasoning = `Moisture (${current.toFixed(1)}%) has breached lower boundary (${thresholds.min}%). Root suction tension increasing.`;
  } else if (current <= thresholds.min + 4) {
    if (rainMoistureEquivalent >= 5) {
      required = false;
      urgency = 'low';
      recommendedTime = 'Irrigation on hold — Rain forecasted';
      reasoning = `Approaching lower threshold (${thresholds.min}%), but ${next24hRainfall.toFixed(1)} mm rainfall projected within 24h will replenish ~${rainMoistureEquivalent}% moisture.`;
    } else {
      required = true;
      urgency = 'medium';
      recommendedTime = 'Tomorrow morning (05:30 IST)';
      reasoning = `Moisture will hit critical limit within ${forecast?.timeToThreshold || 12} hours. Preventive irrigation advised.`;
    }
  }

  // Calculate gross volumetric requirement
  const rawDeficit = calculateWaterDeficit(current, thresholds.optimal, field.area, rootDepth);

  // Rainfall credit adjustment: reduce irrigation volume by natural precipitation
  const rainfallAdjustmentM3 = Math.round(
    ((next24hRainfall / 1000) * (field.area * 10000) * 0.8) // 80% effective capture
  );

  const adjustedWaterM3 = Math.max(0, rawDeficit.cubicMeters - rainfallAdjustmentM3);
  const adjustedWaterLiters = adjustedWaterM3 * 1000;

  // Water savings compared to fixed calendar flooding (typical flood = 60mm = 600 m³/ha)
  const conventionalFloodM3 = field.area * 600;
  const waterSavedM3 = Math.max(0, conventionalFloodM3 - adjustedWaterM3);
  const waterSavingOpportunity = Math.round((waterSavedM3 / conventionalFloodM3) * 100);

  const durationMins = calculateIrrigationDuration(adjustedWaterM3, field.area);

  return {
    fieldId: field.id,
    required,
    urgency,
    recommendedTime,
    waterRequired: adjustedWaterLiters,
    waterRequiredM3: adjustedWaterM3,
    expectedRecovery: thresholds.optimal,
    rainfallAdjustment: Math.round(rainMoistureEquivalent),
    waterSavingOpportunity,
    irrigationDuration: durationMins,
    method: 'Micro-Drip Precision Fertigation (Pressure Compensated)',
    reasoning,
  };
}
