/**
 * Intelligence Pipeline entry point.
 * Orchestrates classification, extraction, and analysis.
 */

import type { ParsedData, DocumentClassification, DocumentInsights } from '../../../types';
import { classifyDocument } from './classifier';
import { analyzeDocument } from './analyzer';

export { classifyDocument } from './classifier';
export { extractEntities, extractTabularMetrics } from './extractor';
export { analyzeDocument } from './analyzer';

/**
 * Process a parsed document through the full intelligence pipeline.
 * Returns classification and insights.
 */
export function processDocument(
  parsedData: ParsedData,
  existingClassification?: DocumentClassification
): { classification: DocumentClassification; insights: DocumentInsights } {
  // Step 1: Classify the document (or use existing classification)
  const classification = existingClassification ?? classifyDocument(parsedData);

  // Step 2: Run full analysis
  const insights = analyzeDocument(parsedData, classification);

  return { classification, insights };
}
