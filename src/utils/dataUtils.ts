/**
 * Statistical and data utility functions for the Universal Document Intelligence Engine.
 */

/**
 * Calculate the arithmetic mean of an array of numbers.
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate the median of an array of numbers.
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate the standard deviation of an array of numbers.
 */
export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map((v) => Math.pow(v - avg, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

/**
 * Calculate a specific percentile (0-100) of an array of numbers.
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculate the Pearson correlation coefficient between two arrays.
 */
export function correlation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  const meanX = mean(x.slice(0, n));
  const meanY = mean(y.slice(0, n));
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  const denom = Math.sqrt(denomX * denomY);
  return denom === 0 ? 0 : numerator / denom;
}

/**
 * Calculate min value.
 */
export function min(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

/**
 * Calculate max value.
 */
export function max(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

/**
 * Calculate sum.
 */
export function sum(values: number[]): number {
  return values.reduce((s, v) => s + v, 0);
}

/**
 * Normalize an array to [0, 1] range.
 */
export function normalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;
  if (range === 0) return values.map(() => 0.5);
  return values.map((v) => (v - minVal) / range);
}

/**
 * Detect outliers using the IQR method. Returns indices of outlier values.
 */
export function detectOutliers(values: number[], threshold = 1.5): number[] {
  if (values.length < 4) return [];
  const q1 = percentile(values, 25);
  const q3 = percentile(values, 75);
  const iqr = q3 - q1;
  const lowerBound = q1 - threshold * iqr;
  const upperBound = q3 + threshold * iqr;
  const outlierIndices: number[] = [];
  values.forEach((v, i) => {
    if (v < lowerBound || v > upperBound) {
      outlierIndices.push(i);
    }
  });
  return outlierIndices;
}

/**
 * Try to parse a value as a number. Returns NaN if not a number.
 */
export function parseNumeric(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,$%\s]/g, '');
    const num = Number(cleaned);
    return num;
  }
  return NaN;
}

/**
 * Check if a value is numeric.
 */
export function isNumeric(value: unknown): boolean {
  return !isNaN(parseNumeric(value));
}

/**
 * Extract numeric values from a column of records.
 */
export function extractNumericColumn(
  rows: Record<string, unknown>[],
  field: string
): number[] {
  return rows
    .map((row) => parseNumeric(row[field]))
    .filter((v) => !isNaN(v));
}

/** Common date formats for parsing */
const DATE_PATTERNS: RegExp[] = [
  /^\d{4}-\d{2}-\d{2}$/,                           // ISO: 2024-01-15
  /^\d{4}\/\d{2}\/\d{2}$/,                          // 2024/01/15
  /^\d{2}\/\d{2}\/\d{4}$/,                          // MM/DD/YYYY
  /^\d{2}-\d{2}-\d{4}$/,                            // DD-MM-YYYY
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,          // ISO datetime
  /^\w{3}\s+\d{1,2},?\s+\d{4}$/,                   // Jan 15, 2024
  /^\d{1,2}\s+\w{3}\s+\d{4}$/,                     // 15 Jan 2024
];

/**
 * Check if a string looks like a date.
 */
export function isDateLike(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > 30) return false;
  return DATE_PATTERNS.some((p) => p.test(trimmed)) || !isNaN(Date.parse(trimmed));
}

/**
 * Parse a date string safely. Returns null if unparseable.
 */
export function parseDate(value: string): Date | null {
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  // Sanity: reject dates too far in the past or future
  const year = d.getFullYear();
  if (year < 1900 || year > 2100) return null;
  return d;
}

/**
 * Calculate the coefficient of variation.
 */
export function coefficientOfVariation(values: number[]): number {
  const avg = mean(values);
  if (avg === 0) return 0;
  return stdDev(values) / Math.abs(avg);
}

/**
 * Calculate simple moving average.
 */
export function movingAverage(values: number[], window: number): number[] {
  if (values.length < window) return values;
  const result: number[] = [];
  for (let i = 0; i <= values.length - window; i++) {
    const slice = values.slice(i, i + window);
    result.push(mean(slice));
  }
  return result;
}

/**
 * Determine the trend direction from a series of values.
 */
export function detectTrend(
  values: number[]
): 'increasing' | 'decreasing' | 'stable' | 'volatile' {
  if (values.length < 2) return 'stable';
  const n = values.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const corr = correlation(xs, values);
  const cv = coefficientOfVariation(values);

  if (cv > 0.5) return 'volatile';
  if (corr > 0.3) return 'increasing';
  if (corr < -0.3) return 'decreasing';
  return 'stable';
}
