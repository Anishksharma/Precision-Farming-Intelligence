/**
 * Entity Extractor.
 * Extracts organizations, locations, dates, metrics, percentages, and currencies
 * using regex patterns and statistical analysis.
 */

import type { ParsedData, ExtractedEntity, MetricItem } from '../../../types';
import {
  mean, median, stdDev, min, max,
  extractNumericColumn,
} from '../../../utils/dataUtils';

/** Regex patterns for entity extraction */
const PATTERNS = {
  date: /\b(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4})\b/gi,
  percentage: /\b(\d+\.?\d*)\s*%/g,
  currency: /(?:\$|€|£|¥|₹)\s*(\d[\d,]*\.?\d*)\b|\b(\d[\d,]*\.?\d*)\s*(?:USD|EUR|GBP|JPY|INR)\b/gi,
  metric: /\b(\d[\d,]*\.?\d*)\s*(kg|km|mi|lb|oz|mg|g|ml|L|m|cm|mm|ft|in|ha|acre|ton|kW|MW|GW|kWh|MWh|ppm|dB|rpm|psi|bar|Pa)\b/gi,
  organization: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\s+(?:Inc|Corp|Ltd|LLC|Co|Group|Foundation|Institute|University|Hospital|Bank|Association)\b/g,
  location: /\b(?:City of|State of|Province of|District of|County of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
};

/**
 * Extract entities from text content.
 */
function extractFromText(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  if (!text) return entities;

  // Dates
  let match: RegExpExecArray | null;
  const datePattern = new RegExp(PATTERNS.date.source, 'gi');
  while ((match = datePattern.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'date',
      value: match[0],
      confidence: 0.9,
    });
  }

  // Percentages
  const pctPattern = new RegExp(PATTERNS.percentage.source, 'g');
  while ((match = pctPattern.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'percentage',
      value: parseFloat(match[1]),
      confidence: 0.95,
    });
  }

  // Currencies
  const curPattern = new RegExp(PATTERNS.currency.source, 'gi');
  while ((match = curPattern.exec(text)) !== null) {
    const numStr = (match[1] || match[2]).replace(/,/g, '');
    entities.push({
      text: match[0],
      type: 'currency',
      value: parseFloat(numStr),
      confidence: 0.9,
    });
  }

  // Metrics with units
  const metricPattern = new RegExp(PATTERNS.metric.source, 'gi');
  while ((match = metricPattern.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'unit',
      value: parseFloat(match[1].replace(/,/g, '')),
      confidence: 0.85,
    });
  }

  // Organizations
  const orgPattern = new RegExp(PATTERNS.organization.source, 'g');
  while ((match = orgPattern.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'organization',
      value: match[0],
      confidence: 0.7,
    });
  }

  // Locations
  const locPattern = new RegExp(PATTERNS.location.source, 'g');
  while ((match = locPattern.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'location',
      value: match[1],
      confidence: 0.7,
    });
  }

  return entities;
}

/**
 * Extract key metrics from tabular data columns.
 */
export function extractTabularMetrics(
  data: ParsedData
): MetricItem[] {
  const metrics: MetricItem[] = [];

  if (!data.rows || !data.numericFields || data.numericFields.length === 0) {
    return metrics;
  }

  // Calculate statistics for each numeric field
  for (const field of data.numericFields.slice(0, 10)) {
    const values = extractNumericColumn(data.rows, field);
    if (values.length === 0) continue;

    const avg = mean(values);
    const med = median(values);
    const sd = stdDev(values);
    const minVal = min(values);
    const maxVal = max(values);

    // Add mean metric
    metrics.push({
      label: `Average ${field}`,
      value: Number(avg.toFixed(2)),
      source: 'calculated',
      description: `Mean of ${values.length} values`,
    });

    // Add range
    metrics.push({
      label: `${field} Range`,
      value: `${minVal.toFixed(1)} – ${maxVal.toFixed(1)}`,
      source: 'calculated',
      description: `Min to max range`,
    });

    // If std dev is significant, add it
    if (sd > 0 && avg !== 0) {
      const cv = (sd / Math.abs(avg)) * 100;
      if (cv > 10) {
        metrics.push({
          label: `${field} Variability`,
          value: Number(cv.toFixed(1)),
          unit: '%',
          source: 'calculated',
          description: `Coefficient of variation (std dev / mean)`,
        });
      }
    }

    // Add total if it makes sense (count > 1, all positive)
    if (values.length > 1 && values.every((v) => v >= 0)) {
      const total = values.reduce((s, v) => s + v, 0);
      metrics.push({
        label: `Total ${field}`,
        value: Number(total.toFixed(2)),
        source: 'calculated',
        description: `Sum of ${values.length} values`,
      });
    }

    // Check for trend
    if (values.length >= 5) {
      const firstHalf = mean(values.slice(0, Math.floor(values.length / 2)));
      const secondHalf = mean(values.slice(Math.floor(values.length / 2)));
      if (firstHalf !== 0) {
        const changePercent = ((secondHalf - firstHalf) / Math.abs(firstHalf)) * 100;
        if (Math.abs(changePercent) > 5) {
          metrics.push({
            label: `${field} Trend`,
            value: Number(Math.abs(changePercent).toFixed(1)),
            unit: '%',
            change: Number(changePercent.toFixed(1)),
            changeDirection: changePercent > 0 ? 'up' : 'down',
            source: 'calculated',
            description: `Change from first half to second half of data`,
          });
        }
      }
    }

    // Limit metrics per field
    if (metrics.length > 30) break;
  }

  // Add row count as a metric
  if (data.rowCount) {
    metrics.unshift({
      label: 'Total Records',
      value: data.rowCount,
      source: 'extracted',
      description: 'Number of data rows',
    });
  }

  return metrics;
}

/**
 * Run full entity extraction on a parsed document.
 */
export function extractEntities(data: ParsedData): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];

  // Extract from text content
  if (data.textContent) {
    entities.push(...extractFromText(data.textContent));
  }

  // Extract from row values (sample)
  if (data.rows) {
    const sampleRows = data.rows.slice(0, 30);
    for (const row of sampleRows) {
      for (const value of Object.values(row)) {
        if (typeof value === 'string' && value.length > 2) {
          entities.push(...extractFromText(value));
        }
      }
    }
  }

  // Extract from metadata
  if (data.metadata) {
    for (const value of Object.values(data.metadata)) {
      entities.push(...extractFromText(value));
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return entities.filter((e) => {
    const key = `${e.type}:${e.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
