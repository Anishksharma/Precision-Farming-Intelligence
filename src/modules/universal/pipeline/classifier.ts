/**
 * Document Classifier.
 * Classifies documents by industry and type using keyword matching,
 * statistical features, and column name analysis.
 */

import type { ParsedData, DocumentClassification } from '../../../types';

/** Industry keyword dictionaries */
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  agriculture: [
    'crop', 'yield', 'soil', 'moisture', 'harvest', 'farm', 'irrigation', 'fertilizer',
    'pesticide', 'seed', 'acre', 'hectare', 'rainfall', 'livestock', 'poultry',
    'wheat', 'rice', 'corn', 'maize', 'soybean', 'cotton', 'sugarcane',
    'organic', 'greenhouse', 'plantation', 'agronomy', 'nutrient', 'ph level',
    'nitrogen', 'phosphorus', 'potassium', 'humus', 'compost', 'tillage',
  ],
  finance: [
    'revenue', 'profit', 'loss', 'income', 'expense', 'budget', 'cost', 'price',
    'stock', 'share', 'dividend', 'interest', 'loan', 'debt', 'equity', 'asset',
    'liability', 'balance', 'cash flow', 'roi', 'margin', 'ebitda', 'invoice',
    'payment', 'transaction', 'account', 'portfolio', 'tax', 'fiscal', 'quarter',
    'annual', 'monetary', 'debit', 'credit', 'amortization', 'depreciation',
  ],
  healthcare: [
    'patient', 'diagnosis', 'treatment', 'symptom', 'medication', 'drug', 'dose',
    'hospital', 'clinic', 'doctor', 'nurse', 'surgery', 'therapy', 'disease',
    'blood', 'pressure', 'heart', 'pulse', 'temperature', 'bmi', 'cholesterol',
    'glucose', 'hemoglobin', 'lab result', 'vital', 'clinical', 'medical',
    'health', 'wellness', 'vaccine', 'infection', 'mortality', 'morbidity',
  ],
  engineering: [
    'load', 'stress', 'strain', 'torque', 'voltage', 'current', 'resistance',
    'frequency', 'amplitude', 'power', 'efficiency', 'capacity', 'throughput',
    'pressure', 'temperature', 'velocity', 'acceleration', 'force', 'mass',
    'dimension', 'tolerance', 'specification', 'calibration', 'sensor', 'actuator',
    'pipeline', 'circuit', 'component', 'assembly', 'mechanical', 'electrical',
  ],
  research: [
    'hypothesis', 'experiment', 'sample', 'control', 'p-value', 'significance',
    'correlation', 'regression', 'variance', 'standard deviation', 'confidence',
    'interval', 'study', 'survey', 'participant', 'observation', 'variable',
    'methodology', 'abstract', 'conclusion', 'findings', 'literature', 'citation',
    'peer review', 'analysis', 'data set', 'dataset', 'population', 'cohort',
  ],
  education: [
    'student', 'grade', 'score', 'exam', 'test', 'class', 'course', 'curriculum',
    'teacher', 'professor', 'enrollment', 'attendance', 'gpa', 'semester',
    'assignment', 'lecture', 'syllabus', 'school', 'university', 'college',
    'degree', 'diploma', 'academic', 'learning', 'assessment', 'evaluation',
  ],
  logistics: [
    'shipment', 'delivery', 'tracking', 'warehouse', 'inventory', 'order',
    'supply chain', 'freight', 'cargo', 'route', 'destination', 'origin',
    'transit', 'dispatch', 'fleet', 'vehicle', 'container', 'pallet',
    'weight', 'volume', 'sku', 'stock', 'fulfillment', 'procurement',
  ],
};

/** Document type keywords */
const DOCTYPE_KEYWORDS: Record<string, string[]> = {
  report: [
    'report', 'summary', 'overview', 'analysis', 'review', 'assessment',
    'findings', 'conclusion', 'recommendation', 'executive summary',
  ],
  dataset: [
    'id', 'name', 'value', 'count', 'total', 'amount', 'quantity', 'record',
  ],
  research: [
    'abstract', 'hypothesis', 'methodology', 'results', 'discussion',
    'conclusion', 'references', 'literature', 'study', 'experiment',
  ],
  invoice: [
    'invoice', 'bill', 'payment', 'due date', 'total', 'subtotal', 'tax',
    'item', 'quantity', 'unit price', 'amount due', 'receipt',
  ],
  log: [
    'timestamp', 'log', 'event', 'status', 'error', 'warning', 'info',
    'debug', 'trace', 'message', 'level', 'source',
  ],
  specification: [
    'specification', 'requirement', 'version', 'revision', 'standard',
    'compliance', 'parameter', 'threshold', 'limit', 'criteria',
  ],
};

/** Section suggestions by industry */
const SECTION_SUGGESTIONS: Record<string, string[]> = {
  agriculture: ['Overview', 'Crop Metrics', 'Soil Analysis', 'Weather Impact', 'Yield Trends', 'Recommendations'],
  finance: ['Overview', 'Financial Summary', 'Revenue Analysis', 'Cost Breakdown', 'Trends', 'Risk Assessment'],
  healthcare: ['Overview', 'Patient Metrics', 'Clinical Data', 'Treatment Outcomes', 'Trends', 'Alerts'],
  engineering: ['Overview', 'Performance Metrics', 'Specifications', 'Test Results', 'Quality Analysis', 'Anomalies'],
  research: ['Overview', 'Data Summary', 'Statistical Analysis', 'Findings', 'Correlations', 'Conclusions'],
  education: ['Overview', 'Student Performance', 'Grade Distribution', 'Attendance', 'Trends', 'Recommendations'],
  logistics: ['Overview', 'Shipment Metrics', 'Inventory Status', 'Route Analysis', 'Delivery Performance', 'Forecasts'],
  general: ['Overview', 'Key Metrics', 'Data Explorer', 'Trends', 'Insights', 'Verdict'],
};

/**
 * Score text against a keyword dictionary.
 */
function scoreKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) {
      score += matches.length;
    }
  }
  return score;
}

/**
 * Build a searchable text corpus from ParsedData.
 */
function buildCorpus(data: ParsedData): string {
  const parts: string[] = [];

  // Add headers
  if (data.headers) {
    parts.push(data.headers.join(' '));
  }

  // Add text content
  if (data.textContent) {
    parts.push(data.textContent.slice(0, 10000));
  }

  // Add sample row values
  if (data.rows) {
    const sampleRows = data.rows.slice(0, 20);
    for (const row of sampleRows) {
      parts.push(Object.values(row).filter((v) => typeof v === 'string').join(' '));
    }
  }

  // Add metadata
  if (data.metadata) {
    parts.push(Object.entries(data.metadata).map(([k, v]) => `${k} ${v}`).join(' '));
  }

  return parts.join(' ');
}

/**
 * Classify a document by industry and type.
 */
export function classifyDocument(data: ParsedData): DocumentClassification {
  const corpus = buildCorpus(data);

  // Score each industry
  const industryScores: Record<string, number> = {};
  let maxIndustryScore = 0;
  let bestIndustry = 'general';

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    const score = scoreKeywords(corpus, keywords);
    industryScores[industry] = score;
    if (score > maxIndustryScore) {
      maxIndustryScore = score;
      bestIndustry = industry;
    }
  }

  // Score each document type
  const docTypeScores: Record<string, number> = {};
  let maxDocTypeScore = 0;
  let bestDocType = 'dataset';

  for (const [docType, keywords] of Object.entries(DOCTYPE_KEYWORDS)) {
    const score = scoreKeywords(corpus, keywords);
    docTypeScores[docType] = score;
    if (score > maxDocTypeScore) {
      maxDocTypeScore = score;
      bestDocType = docType;
    }
  }

  // If data is mostly tabular with no strong doc-type signal, default to dataset
  if (data.type === 'tabular' && maxDocTypeScore < 3) {
    bestDocType = 'dataset';
  }

  // Calculate confidence (0-1) based on how dominant the top score is
  const totalIndustryScore = Object.values(industryScores).reduce((a, b) => a + b, 0);
  const industryConfidence =
    totalIndustryScore > 0
      ? Math.min(maxIndustryScore / totalIndustryScore + 0.2, 1)
      : 0.3;

  // Generate tags
  const tags: string[] = [bestIndustry, bestDocType];
  if (data.type === 'tabular') tags.push('tabular');
  if (data.type === 'text') tags.push('text');
  if (data.type === 'mixed') tags.push('mixed');
  if (data.numericFields && data.numericFields.length > 5) tags.push('data-rich');
  if (data.rowCount && data.rowCount > 100) tags.push('large-dataset');
  if (data.dates && data.dates.length > 0) tags.push('time-series');

  // Determine subject from column names or content
  const subject = deriveSubject(data, bestIndustry);

  return {
    industry: bestIndustry,
    subject,
    documentType: bestDocType,
    confidence: Number(industryConfidence.toFixed(2)),
    tags,
    suggestedSections: SECTION_SUGGESTIONS[bestIndustry] || SECTION_SUGGESTIONS.general,
  };
}

/**
 * Derive a human-readable subject from the data.
 */
function deriveSubject(data: ParsedData, industry: string): string {
  if (data.headers && data.headers.length > 0) {
    // Use the first few column names to describe the data
    const mainCols = data.headers.slice(0, 3).join(', ');
    return `${industry.charAt(0).toUpperCase() + industry.slice(1)} data: ${mainCols}`;
  }
  if (data.textContent) {
    // Use the first line or sentence
    const firstLine = data.textContent.split('\n').find((l) => l.trim().length > 5);
    if (firstLine) {
      return firstLine.trim().slice(0, 80);
    }
  }
  return `${industry.charAt(0).toUpperCase() + industry.slice(1)} document`;
}
