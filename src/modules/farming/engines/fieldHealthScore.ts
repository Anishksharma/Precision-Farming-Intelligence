// Transparent Field Health Score Engine (0 - 100)
import type { Field, CropProfile, SoilProfile } from '../../../types/farming';

export interface FieldHealthBreakdown {
  totalScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  components: {
    moistureStability: { score: number; max: 25; explanation: string };
    sensorDataQuality: { score: number; max: 25; explanation: string };
    cropAgronomicMatch: { score: number; max: 25; explanation: string };
    waterStressIndex: { score: number; max: 25; explanation: string };
  };
}

/**
 * Computes transparent, non-black-box agronomic health index.
 */
export function calculateFieldHealthScore(
  field: Field,
  crop: CropProfile | undefined,
  soil: SoilProfile | undefined
): FieldHealthBreakdown {
  const thresholds = crop?.moistureThresholds[field.growthStage] || {
    min: 35,
    max: 70,
    optimal: 50,
    wilting: 20,
  };

  const moisture = field.currentMoisture;

  // 1. Moisture Stability (0 - 25)
  let moistureScore = 25;
  let moistureExp = 'Moisture strictly within optimal agronomic envelope.';
  if (moisture < thresholds.wilting) {
    moistureScore = 2;
    moistureExp = 'Severe deficit below permanent wilting point.';
  } else if (moisture < thresholds.min) {
    const ratio = (moisture - thresholds.wilting) / (thresholds.min - thresholds.wilting);
    moistureScore = Math.round(5 + ratio * 12);
    moistureExp = `Sub-optimal moisture (${moisture.toFixed(1)}%), irrigation recommended.`;
  } else if (soil && moisture > soil.saturation - 2) {
    moistureScore = 4;
    moistureExp = 'Critical waterlogging saturation approaching.';
  } else if (moisture > thresholds.max) {
    moistureScore = 15;
    moistureExp = 'Slight moisture surplus; potential for nitrogen leaching.';
  }

  // 2. Sensor Data Quality (0 - 25)
  let sensorScore = 25;
  let sensorExp = 'All telemetry nodes operational with high signal-to-noise ratio.';
  if (field.sensors) {
    if (field.sensors.connectivity === 'offline') {
      sensorScore = 5;
      sensorExp = 'Telemetry station offline; operating on dead reckoning.';
    } else if (field.sensors.connectivity === 'intermittent') {
      sensorScore = 14;
      sensorExp = 'Packet drops detected in last 24 telemetry frames.';
    }
    const poorSensors = field.sensors.sensors.filter(s => s.quality === 'poor' || s.quality === 'fair');
    if (poorSensors.length > 0) {
      sensorScore = Math.max(8, sensorScore - poorSensors.length * 3);
      sensorExp += ` (${poorSensors.length} sensors with degraded SNR)`;
    }
  }

  // 3. Crop Agronomic Match (0 - 25)
  let cropScore = 23;
  let cropExp = `Conditions well-attuned for ${crop?.name || field.crop} in ${field.growthStage} stage.`;
  const distFromOptimal = Math.abs(moisture - thresholds.optimal);
  if (distFromOptimal > 15) {
    cropScore = Math.max(8, 25 - distFromOptimal);
    cropExp = `Divergence of ${distFromOptimal.toFixed(1)}% from physiological optimum.`;
  }

  // 4. Water Stress Risk (0 - 25)
  let stressScore = 25;
  let stressExp = 'Zero thermal/stomatal transpiration stress observed.';
  if (moisture < thresholds.min + 2) {
    stressScore = 10;
    stressExp = 'Early transpiration restriction detected.';
  } else if (soil && moisture >= soil.fieldCapacity + 5) {
    stressScore = 12;
    stressExp = 'Anoxic root respiration risk present.';
  }

  const totalScore = Math.min(100, Math.max(0, moistureScore + sensorScore + cropScore + stressScore));

  let grade: FieldHealthBreakdown['grade'] = 'A';
  if (totalScore >= 92) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 68) grade = 'B';
  else if (totalScore >= 50) grade = 'C';
  else if (totalScore >= 35) grade = 'D';
  else grade = 'F';

  return {
    totalScore,
    grade,
    components: {
      moistureStability: { score: moistureScore, max: 25, explanation: moistureExp },
      sensorDataQuality: { score: sensorScore, max: 25, explanation: sensorExp },
      cropAgronomicMatch: { score: cropScore, max: 25, explanation: cropExp },
      waterStressIndex: { score: stressScore, max: 25, explanation: stressExp },
    },
  };
}
