// Demo Forecast Generator — Uses soil water balance model
import type { Farm, MoistureForecast, ForecastPoint } from '../../../types/farming';
import { CROP_PROFILES, SOIL_PROFILES } from './profiles';

/**
 * Generates MoistureForecast for every field using the soil water balance model.
 * Predictions computed at: 1h, 6h, 12h, 24h, 48h, 72h, 168h (7d)
 */
export function generateDemoForecasts(farms: Farm[]): Record<string, MoistureForecast> {
  const forecasts: Record<string, MoistureForecast> = {};
  const horizons = [
    { hours: 1, label: '1h' },
    { hours: 6, label: '6h' },
    { hours: 12, label: '12h' },
    { hours: 24, label: '24h' },
    { hours: 48, label: '48h' },
    { hours: 72, label: '72h' },
    { hours: 168, label: '7d' },
  ];

  for (const farm of farms) {
    for (const field of farm.fields) {
      const crop = CROP_PROFILES.find(c => c.type === field.crop);
      const soil = SOIL_PROFILES.find(s => s.type === field.soilType);
      if (!crop || !soil) continue;

      const thresholds = crop.moistureThresholds[field.growthStage];
      const rootDepthCm = crop.rootDepth[field.growthStage];
      const rootDepthMm = rootDepthCm * 10;

      // Base ET rate (mm/hr) — approximate from daily water requirement
      const baseET = crop.waterRequirement / 24;

      // Depletion rate (%/hr) = ET contribution / effective soil column
      // θ change = (ET_mm / rootDepth_mm) * 100
      const depletionRate = (baseET / rootDepthMm) * 100;

      // Simulate some rainfall impact in next 24h
      const forecastRainfallMm = Math.random() < 0.4 ? 2 + Math.random() * 10 : 0;
      const rainfallImpactPct = (forecastRainfallMm / rootDepthMm) * 100;

      // Build predictions using water balance
      let moisture = field.currentMoisture;
      const now = new Date();
      const predictions: ForecastPoint[] = [];
      let prevHour = 0;

      for (const h of horizons) {
        const deltaH = h.hours - prevHour;

        // Depletion over interval
        const depletion = depletionRate * deltaH;

        // Rainfall: distribute simulated rainfall into first 24h
        let rainGain = 0;
        if (h.hours <= 24 && forecastRainfallMm > 0) {
          const fractionInInterval = deltaH / 24;
          const rainMm = forecastRainfallMm * fractionInInterval;
          rainGain = (rainMm / rootDepthMm) * 100;
          // Cap at infiltration rate
          const maxInfiltration = (soil.infiltrationRate * deltaH / rootDepthMm) * 100;
          rainGain = Math.min(rainGain, maxInfiltration);
        }

        // Drainage: if above field capacity, excess drains
        let drainage = 0;
        if (moisture > soil.fieldCapacity) {
          const excess = moisture - soil.fieldCapacity;
          const drainFraction = Math.min(1, (soil.drainageRate * deltaH) / (rootDepthMm * 0.1));
          drainage = excess * drainFraction;
        }

        // Apply water balance: θ(t+1) = θ(t) + rain - ET - drainage
        moisture = moisture + rainGain - depletion - drainage;
        moisture = Math.max(soil.wiltingPoint * 0.5, Math.min(soil.saturation, moisture));

        // Confidence interval — widens with horizon
        const halfWidth = 1.5 + (h.hours / 168) * 12;

        predictions.push({
          timestamp: new Date(now.getTime() + h.hours * 3600000),
          predicted: Math.round(moisture * 100) / 100,
          lower: Math.round(Math.max(0, moisture - halfWidth) * 100) / 100,
          upper: Math.round(Math.min(100, moisture + halfWidth) * 100) / 100,
          label: h.label,
        });

        prevHour = h.hours;
      }

      // Time to irrigation threshold
      const irrigThreshold = thresholds.min;
      let timeToThreshold: number | null = null;
      if (field.currentMoisture > irrigThreshold && depletionRate > 0) {
        timeToThreshold = Math.round((field.currentMoisture - irrigThreshold) / depletionRate);
      }

      forecasts[field.id] = {
        fieldId: field.id,
        currentMoisture: field.currentMoisture,
        predictions,
        confidence: 85 - Math.random() * 10,
        model: 'water_balance',
        depletionRate: Math.round(depletionRate * 1000) / 1000,
        timeToThreshold,
        rainfallImpact: Math.round(rainfallImpactPct * 100) / 100,
        cropTarget: { min: thresholds.min, max: thresholds.max, optimal: thresholds.optimal },
        lastUpdated: new Date(),
      };
    }
  }

  return forecasts;
}
