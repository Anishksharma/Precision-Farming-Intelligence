// In-dashboard Alert and Change-Detection Engine
import type { Field, Alert, MoistureForecast, WeatherData, CropProfile, SoilProfile } from '../../../types/farming';

export interface AlertThresholdConfig {
  maxDepletionRatePerHour: number; // % drop / hr
  maxMoistureJumpPerHour: number;  // % increase / hr
  waterloggingSaturationBuffer: number; // % below saturation
  cropWaterStressThreshold: number; // 0 to 1 index
}

export const DEFAULT_ALERT_CONFIG: AlertThresholdConfig = {
  maxDepletionRatePerHour: 1.2,
  maxMoistureJumpPerHour: 8.0,
  waterloggingSaturationBuffer: 3.0,
  cropWaterStressThreshold: 0.65,
};

/**
 * Evaluates operational conditions for a field and triggers corresponding alerts.
 */
export function evaluateAlerts(
  field: Field,
  forecast: MoistureForecast | undefined,
  crop: CropProfile,
  soil: SoilProfile,
  weather: WeatherData | undefined,
  config = DEFAULT_ALERT_CONFIG
): Alert[] {
  const alerts: Alert[] = [];
  const thresholds = crop.moistureThresholds[field.growthStage];
  const now = new Date();
  const moisture = field.currentMoisture;

  // 1. Dry soil condition & wilting point breach
  if (thresholds && moisture <= thresholds.wilting) {
    alerts.push({
      id: `alert-dry-crit-${field.id}-${Date.now()}`,
      type: 'dry_soil',
      severity: 'critical',
      title: `Critical Desiccation: ${field.name}`,
      message: `Soil moisture (${moisture.toFixed(1)}%) is at or below the permanent wilting point (${thresholds.wilting}%).`,
      fieldId: field.id,
      farmId: field.farmId,
      value: moisture,
      threshold: thresholds.wilting,
      timestamp: now,
      acknowledged: false,
      resolved: false,
    });
  } else if (thresholds && moisture < thresholds.min) {
    alerts.push({
      id: `alert-dry-warn-${field.id}-${Date.now()}`,
      type: 'dry_soil',
      severity: 'high',
      title: `Soil Moisture Depleted: ${field.name}`,
      message: `Moisture (${moisture.toFixed(1)}%) has fallen below the optimal minimum of ${thresholds.min}%.`,
      fieldId: field.id,
      farmId: field.farmId,
      value: moisture,
      threshold: thresholds.min,
      timestamp: now,
      acknowledged: false,
      resolved: false,
    });
  }

  // 2. Waterlogging risk
  const saturationThreshold = soil.saturation - config.waterloggingSaturationBuffer;
  if (moisture >= saturationThreshold) {
    alerts.push({
      id: `alert-waterlog-${field.id}-${Date.now()}`,
      type: 'waterlogging_risk',
      severity: 'critical',
      title: `Waterlogging & Hypoxia Risk: ${field.name}`,
      message: `Moisture (${moisture.toFixed(1)}%) is nearing soil saturation capacity (${soil.saturation}%). Aerobic root respiration blocked.`,
      fieldId: field.id,
      farmId: field.farmId,
      value: moisture,
      threshold: saturationThreshold,
      timestamp: now,
      acknowledged: false,
      resolved: false,
    });
  }

  // 3. Forecast threshold crossing
  if (forecast && forecast.timeToThreshold !== null && forecast.timeToThreshold <= 12 && forecast.timeToThreshold > 0) {
    alerts.push({
      id: `alert-forecast-cross-${field.id}-${Date.now()}`,
      type: 'forecast_threshold',
      severity: 'medium',
      title: `Depletion Crossing Projected in ${forecast.timeToThreshold}h`,
      message: `Water balance model predicts threshold breach within ${forecast.timeToThreshold} hours at current depletion rate (${forecast.depletionRate}%/hr).`,
      fieldId: field.id,
      farmId: field.farmId,
      value: forecast.timeToThreshold,
      threshold: 12,
      timestamp: now,
      acknowledged: false,
      resolved: false,
    });
  }

  // 4. Sensor health & disconnection
  if (field.sensors) {
    if (field.sensors.connectivity === 'offline') {
      alerts.push({
        id: `alert-offline-${field.id}-${Date.now()}`,
        type: 'sensor_disconnection',
        severity: 'high',
        title: `Telemetry Offline: ${field.sensors.id}`,
        message: `Field station has not established handshake for over 60 minutes. System switched to fallback physics model.`,
        fieldId: field.id,
        farmId: field.farmId,
        sensorId: field.sensors.id,
        timestamp: now,
        acknowledged: false,
        resolved: false,
      });
    }

    // Inspect individual sensor readings for anomalies
    for (const s of field.sensors.sensors) {
      if (s.currentValue < s.minRange || s.currentValue > s.maxRange) {
        alerts.push({
          id: `alert-abnormal-${s.id}-${Date.now()}`,
          type: 'abnormal_reading',
          severity: 'medium',
          title: `Sensor Out-of-Range: ${s.type}`,
          message: `Reading ${s.currentValue} ${s.unit} is outside sensor operating envelope (${s.minRange} - ${s.maxRange} ${s.unit}).`,
          fieldId: field.id,
          farmId: field.farmId,
          sensorId: s.id,
          value: s.currentValue,
          timestamp: now,
          acknowledged: false,
          resolved: false,
        });
      }
    }
  }

  // 5. Crop Water Stress Index check (CWSI)
  if (weather && thresholds) {
    const vpd = Math.max(0.5, (weather.temperature - 20) * 0.1);
    const moistureDeficit = Math.max(0, (thresholds.optimal - moisture) / thresholds.optimal);
    const estimatedCWSI = Number((moistureDeficit * 0.7 + (vpd / 4.0) * 0.3).toFixed(2));

    if (estimatedCWSI >= config.cropWaterStressThreshold) {
      alerts.push({
        id: `alert-cwsi-${field.id}-${Date.now()}`,
        type: 'high_crop_stress',
        severity: estimatedCWSI > 0.8 ? 'critical' : 'high',
        title: `High Crop Stress Index (CWSI: ${estimatedCWSI})`,
        message: `Thermal transpiration stress elevated due to high VPD and root moisture depletion.`,
        fieldId: field.id,
        farmId: field.farmId,
        value: estimatedCWSI,
        threshold: config.cropWaterStressThreshold,
        timestamp: now,
        acknowledged: false,
        resolved: false,
      });
    }
  }

  return alerts;
}

/**
 * Evaluates dynamic changes made in the manual simulator and updates alerts.
 */
export function recalculateOnChange(
  fields: Field[],
  manualOverrides: {
    rainfall?: number;
    temperature?: number;
    irrigation?: number;
    moisture?: number;
  },
  crops: CropProfile[],
  soils: SoilProfile[]
): Alert[] {
  const dynamicAlerts: Alert[] = [];

  for (const field of fields) {
    const crop = crops.find(c => c.type === field.crop);
    const soil = soils.find(s => s.type === field.soilType);
    if (!crop || !soil) continue;

    // Apply simulation overrides
    let effectiveMoisture = manualOverrides.moisture !== undefined ? manualOverrides.moisture : field.currentMoisture;
    if (manualOverrides.rainfall) {
      effectiveMoisture += (manualOverrides.rainfall / 10); // Simulated surge
    }
    if (manualOverrides.irrigation) {
      effectiveMoisture += (manualOverrides.irrigation / 15);
    }

    const simulatedField: Field = {
      ...field,
      currentMoisture: Math.min(100, Math.max(0, effectiveMoisture)),
    };

    const simulatedWeather: WeatherData = {
      timestamp: new Date(),
      temperature: manualOverrides.temperature || 32,
      humidity: 50,
      rainfall: manualOverrides.rainfall || 0,
      windSpeed: 3.0,
      solarRadiation: 600,
      pressure: 1013,
      evapotranspiration: 0.22,
      isSimulated: true,
    };

    const alerts = evaluateAlerts(simulatedField, undefined, crop, soil, simulatedWeather);
    dynamicAlerts.push(...alerts);
  }

  return dynamicAlerts;
}
