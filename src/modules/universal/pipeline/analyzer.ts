/**
 * Document Analyzer.
 * Generates insights, trends, risks, data quality assessments, and recommendations
 * from parsed document data.
 */

import type {
  ParsedData,
  DocumentClassification,
  DocumentInsights,
  MetricItem,
  TrendItem,
  RiskItem,
  DataQualityAssessment,
} from '../../../types';
import {
  mean, median, stdDev, extractNumericColumn,
  detectTrend, detectOutliers, coefficientOfVariation,
  isDateLike,
} from '../../../utils/dataUtils';
import { extractEntities, extractTabularMetrics } from './extractor';

/**
 * Assess the quality of the parsed data.
 */
function assessDataQuality(data: ParsedData): DataQualityAssessment {
  const issues: string[] = [];
  let completeness = 1.0;
  let accuracy = 0.9;
  let consistency = 0.9;
  let timeliness = 0.8;

  if (data.rows && data.headers) {
    // Check completeness: ratio of non-null values
    let totalCells = 0;
    let nullCells = 0;
    const sampleRows = data.rows.slice(0, 200);

    for (const row of sampleRows) {
      for (const header of data.headers) {
        totalCells++;
        const val = row[header];
        if (val === null || val === undefined || val === '' || val === 'null' || val === 'N/A') {
          nullCells++;
        }
      }
    }

    completeness = totalCells > 0 ? (totalCells - nullCells) / totalCells : 0;

    if (completeness < 0.8) {
      issues.push(`Data has ${((1 - completeness) * 100).toFixed(1)}% missing values`);
    }

    // Check for duplicate rows
    const rowStrings = sampleRows.map((r) => JSON.stringify(r));
    const uniqueRows = new Set(rowStrings).size;
    const dupRatio = 1 - uniqueRows / rowStrings.length;
    if (dupRatio > 0.05) {
      consistency -= dupRatio;
      issues.push(`${(dupRatio * 100).toFixed(1)}% potential duplicate rows detected`);
    }

    // Check numeric field consistency
    if (data.numericFields) {
      for (const field of data.numericFields.slice(0, 5)) {
        const values = extractNumericColumn(data.rows, field);
        if (values.length > 3) {
          const outliers = detectOutliers(values);
          if (outliers.length > values.length * 0.1) {
            accuracy -= 0.05;
            issues.push(`Field "${field}" has ${outliers.length} potential outliers`);
          }
        }
      }
    }

    // Check for date columns and timeliness
    if (data.dates && data.dates.length > 0) {
      const latestDate = new Date(
        Math.max(...data.dates.map((d) => new Date(d).getTime()).filter((t) => !isNaN(t)))
      );
      const daysSince = (Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > 365) {
        timeliness = 0.5;
        issues.push(`Most recent data is over ${Math.floor(daysSince / 365)} year(s) old`);
      } else if (daysSince > 90) {
        timeliness = 0.7;
        issues.push(`Most recent data is ${Math.floor(daysSince)} days old`);
      }
    } else {
      timeliness = 0.6;
    }
  } else if (data.type === 'text') {
    completeness = data.textContent ? 0.9 : 0.3;
    accuracy = 0.7;
    consistency = 0.8;
    if (!data.textContent || data.textContent.length < 100) {
      issues.push('Very little text content extracted');
    }
  }

  if (issues.length === 0) {
    issues.push('No significant quality issues detected');
  }

  const scores = [completeness, accuracy, consistency, timeliness];
  const overallScore = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));

  return {
    overallScore: Math.max(0, Math.min(1, overallScore)),
    completeness: Math.max(0, Math.min(1, Number(completeness.toFixed(2)))),
    accuracy: Math.max(0, Math.min(1, Number(accuracy.toFixed(2)))),
    consistency: Math.max(0, Math.min(1, Number(consistency.toFixed(2)))),
    timeliness: Math.max(0, Math.min(1, Number(timeliness.toFixed(2)))),
    issues,
  };
}

/**
 * Identify trends from time-series data.
 */
function identifyTrends(data: ParsedData): TrendItem[] {
  const trends: TrendItem[] = [];

  if (!data.rows || !data.numericFields || data.numericFields.length === 0) {
    return trends;
  }

  // Find a date/time column to use as x-axis
  let timeColumn: string | null = null;
  if (data.categoricalFields) {
    for (const field of data.categoricalFields) {
      const sample = data.rows.slice(0, 10).map((r) => r[field]);
      const dateCount = sample.filter(isDateLike).length;
      if (dateCount > sample.length * 0.5) {
        timeColumn = field;
        break;
      }
    }
  }

  // Generate trends for numeric fields
  for (const field of data.numericFields.slice(0, 5)) {
    const values = extractNumericColumn(data.rows, field);
    if (values.length < 3) continue;

    const direction = detectTrend(values);
    const cv = coefficientOfVariation(values);

    const trendData = values.map((y, i) => ({
      x: timeColumn && data.rows
        ? String(data.rows[i]?.[timeColumn] ?? i)
        : i,
      y,
    })) as TrendItem['data'];

    let significance: TrendItem['significance'] = 'low';
    if (cv > 0.3) significance = 'high';
    else if (cv > 0.15) significance = 'medium';

    trends.push({
      label: field,
      data: trendData.slice(0, 50), // Limit data points for display
      direction,
      significance,
    });
  }

  return trends;
}

/**
 * Identify potential risks and anomalies.
 */
function identifyRisks(data: ParsedData, quality: DataQualityAssessment): RiskItem[] {
  const risks: RiskItem[] = [];

  // Data quality risks
  if (quality.completeness < 0.7) {
    risks.push({
      title: 'High Data Incompleteness',
      description: `${((1 - quality.completeness) * 100).toFixed(0)}% of data values are missing, which may affect analysis accuracy.`,
      severity: quality.completeness < 0.5 ? 'critical' : 'high',
      likelihood: 'high',
      mitigation: 'Consider data imputation or collecting additional data to fill gaps.',
    });
  }

  if (quality.overallScore < 0.6) {
    risks.push({
      title: 'Low Overall Data Quality',
      description: `Data quality score is ${(quality.overallScore * 100).toFixed(0)}%. Results should be interpreted with caution.`,
      severity: 'high',
      likelihood: 'high',
      mitigation: 'Review data sources and collection methods.',
    });
  }

  // Outlier risks
  if (data.rows && data.numericFields) {
    for (const field of data.numericFields.slice(0, 5)) {
      const values = extractNumericColumn(data.rows, field);
      if (values.length < 5) continue;
      const outliers = detectOutliers(values);
      if (outliers.length > 0) {
        const pct = ((outliers.length / values.length) * 100).toFixed(1);
        risks.push({
          title: `Outliers in "${field}"`,
          description: `${outliers.length} outlier values detected (${pct}% of data), which may indicate data entry errors or unusual events.`,
          severity: outliers.length > values.length * 0.1 ? 'medium' : 'low',
          likelihood: 'medium',
          mitigation: `Review flagged values in the "${field}" column for accuracy.`,
        });
      }
    }
  }

  // Volatility risks
  if (data.rows && data.numericFields) {
    for (const field of data.numericFields.slice(0, 3)) {
      const values = extractNumericColumn(data.rows, field);
      if (values.length < 5) continue;
      const cv = coefficientOfVariation(values);
      if (cv > 0.5) {
        risks.push({
          title: `High Volatility in "${field}"`,
          description: `Coefficient of variation is ${(cv * 100).toFixed(0)}%, indicating highly variable data.`,
          severity: cv > 1 ? 'high' : 'medium',
          likelihood: 'medium',
          mitigation: 'Investigate causes of variability and consider smoothing techniques.',
        });
      }
    }
  }

  // Small dataset risk
  if (data.rowCount !== undefined && data.rowCount < 10 && data.rowCount > 0) {
    risks.push({
      title: 'Small Sample Size',
      description: `Only ${data.rowCount} records available. Statistical conclusions may not be reliable.`,
      severity: 'medium',
      likelihood: 'high',
      mitigation: 'Collect more data before making critical decisions based on these results.',
    });
  }

  return risks;
}

/**
 * Generate recommendations based on the analysis.
 */
function generateRecommendations(
  data: ParsedData,
  classification: DocumentClassification,
  quality: DataQualityAssessment,
  trends: TrendItem[],
  risks: RiskItem[]
): string[] {
  const recs: string[] = [];

  // Quality-based recommendations
  if (quality.completeness < 0.9) {
    recs.push('Address missing data by implementing validation rules at the data entry point.');
  }
  if (quality.consistency < 0.8) {
    recs.push('Standardize data formats and establish consistency checks to reduce duplicates and formatting issues.');
  }

  // Trend-based recommendations
  const decliningTrends = trends.filter((t) => t.direction === 'decreasing' && t.significance !== 'low');
  if (decliningTrends.length > 0) {
    recs.push(
      `Monitor declining trends in: ${decliningTrends.map((t) => t.label).join(', ')}. Investigate root causes and consider corrective actions.`
    );
  }

  const volatileTrends = trends.filter((t) => t.direction === 'volatile');
  if (volatileTrends.length > 0) {
    recs.push(
      `High variability detected in: ${volatileTrends.map((t) => t.label).join(', ')}. Consider implementing stabilization measures or smoothing techniques.`
    );
  }

  // Risk-based recommendations
  const criticalRisks = risks.filter((r) => r.severity === 'critical');
  if (criticalRisks.length > 0) {
    recs.push('Address critical risks immediately before relying on this data for decisions.');
  }

  // Industry-specific recommendations
  if (classification.industry === 'agriculture') {
    recs.push('Consider correlating crop data with weather patterns for more accurate yield predictions.');
  } else if (classification.industry === 'finance') {
    recs.push('Ensure all financial figures are reconciled against source documents for audit compliance.');
  } else if (classification.industry === 'healthcare') {
    recs.push('Verify patient data anonymization and HIPAA compliance before sharing insights.');
  }

  // Data exploration recommendations
  if (data.numericFields && data.numericFields.length > 3) {
    recs.push('Explore correlations between numeric variables to uncover hidden relationships.');
  }
  if (data.rowCount && data.rowCount > 1000) {
    recs.push('Consider segmenting this large dataset for more granular analysis.');
  }

  // Fallback
  if (recs.length === 0) {
    recs.push('Continue monitoring data quality and trends for ongoing improvement.');
  }

  return recs;
}

/**
 * Generate a summary of the document.
 */
function generateSummary(
  data: ParsedData,
  classification: DocumentClassification,
  metrics: MetricItem[]
): string {
  const parts: string[] = [];

  parts.push(
    `This ${classification.documentType} document belongs to the ${classification.industry} domain`
    + (classification.confidence > 0.7 ? ` (${(classification.confidence * 100).toFixed(0)}% confidence).` : '.')
  );

  if (data.type === 'tabular' || data.type === 'mixed') {
    parts.push(
      `It contains ${data.rowCount ?? 0} records across ${data.columnCount ?? 0} fields.`
    );
    if (data.numericFields && data.numericFields.length > 0) {
      parts.push(
        `Numeric fields: ${data.numericFields.slice(0, 5).join(', ')}${data.numericFields.length > 5 ? ` (+${data.numericFields.length - 5} more)` : ''}.`
      );
    }
  }

  if (data.type === 'text' || data.type === 'mixed') {
    const wordCount = data.metadata?.wordCount;
    if (wordCount) {
      parts.push(`Text content: ~${wordCount} words.`);
    }
  }

  if (metrics.length > 0) {
    const topMetrics = metrics
      .filter((m) => m.source === 'calculated')
      .slice(0, 3)
      .map((m) => `${m.label}: ${m.value}${m.unit ? ` ${m.unit}` : ''}`)
      .join('; ');
    if (topMetrics) {
      parts.push(`Key findings: ${topMetrics}.`);
    }
  }

  return parts.join(' ');
}

/**
 * Generate a verdict/conclusion.
 */
function generateVerdict(
  quality: DataQualityAssessment,
  trends: TrendItem[],
  risks: RiskItem[]
): string {
  const parts: string[] = [];

  // Quality verdict
  if (quality.overallScore >= 0.8) {
    parts.push('The data is of good quality and suitable for analysis.');
  } else if (quality.overallScore >= 0.6) {
    parts.push('The data quality is acceptable but has some issues that should be addressed.');
  } else {
    parts.push('The data quality is below acceptable levels. Results should be treated as preliminary.');
  }

  // Trend verdict
  const increasingHighSig = trends.filter((t) => t.direction === 'increasing' && t.significance === 'high');
  const decreasingHighSig = trends.filter((t) => t.direction === 'decreasing' && t.significance === 'high');

  if (increasingHighSig.length > 0) {
    parts.push(`Positive growth trends observed in ${increasingHighSig.map((t) => t.label).join(', ')}.`);
  }
  if (decreasingHighSig.length > 0) {
    parts.push(`Concerning decline in ${decreasingHighSig.map((t) => t.label).join(', ')} requires attention.`);
  }

  // Risk verdict
  const criticalCount = risks.filter((r) => r.severity === 'critical').length;
  const highCount = risks.filter((r) => r.severity === 'high').length;
  if (criticalCount > 0) {
    parts.push(`${criticalCount} critical risk(s) identified that require immediate action.`);
  } else if (highCount > 0) {
    parts.push(`${highCount} high-severity risk(s) should be reviewed.`);
  } else {
    parts.push('No critical risks detected.');
  }

  return parts.join(' ');
}

/**
 * Separate facts, calculations, and estimates.
 */
function separateFacts(
  data: ParsedData,
  metrics: MetricItem[],
  entities: ReturnType<typeof extractEntities>
): DocumentInsights['factsSeparation'] {
  const extractedFacts: string[] = [];
  const calculatedMetrics: string[] = [];
  const estimates: string[] = [];

  // Facts from entities
  for (const entity of entities.slice(0, 10)) {
    extractedFacts.push(`${entity.type}: ${entity.text}`);
  }

  // Facts from metadata
  if (data.metadata) {
    for (const [key, value] of Object.entries(data.metadata)) {
      if (key !== 'wordCount' && key !== 'lineCount' && key !== 'characterCount') {
        extractedFacts.push(`${key}: ${value}`);
      }
    }
  }

  // Calculated metrics
  for (const metric of metrics) {
    if (metric.source === 'calculated') {
      calculatedMetrics.push(`${metric.label}: ${metric.value}${metric.unit ? ` ${metric.unit}` : ''}`);
    } else if (metric.source === 'estimated') {
      estimates.push(`${metric.label}: ${metric.value}${metric.unit ? ` ${metric.unit}` : ''}`);
    } else {
      extractedFacts.push(`${metric.label}: ${metric.value}${metric.unit ? ` ${metric.unit}` : ''}`);
    }
  }

  return { extractedFacts, calculatedMetrics, estimates };
}

/**
 * Run the full analysis pipeline on parsed data.
 */
export function analyzeDocument(
  data: ParsedData,
  classification: DocumentClassification
): DocumentInsights {
  // Extract entities
  const entities = extractEntities(data);

  // Extract tabular metrics
  const keyMetrics = extractTabularMetrics(data);

  // Assess data quality
  const dataQuality = assessDataQuality(data);

  // Identify trends
  const trends = identifyTrends(data);

  // Identify risks
  const risks = identifyRisks(data, dataQuality);

  // Generate recommendations
  const recommendations = generateRecommendations(data, classification, dataQuality, trends, risks);

  // Generate summary
  const summary = generateSummary(data, classification, keyMetrics);

  // Generate verdict
  const verdict = generateVerdict(dataQuality, trends, risks);

  // Separate facts
  const factsSeparation = separateFacts(data, keyMetrics, entities);

  // Store entities on the parsed data
  data.entities = entities;

  return {
    summary,
    keyMetrics,
    trends,
    risks,
    recommendations,
    verdict,
    dataQuality,
    factsSeparation,
  };
}
