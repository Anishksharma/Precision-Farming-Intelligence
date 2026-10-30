/**
 * CSV Parser using PapaParse.
 * Auto-detects headers, delimiters, and handles encoding issues.
 */

import Papa from 'papaparse';
import type { ParsedData } from '../../../types';
import { isNumeric, isDateLike } from '../../../utils/dataUtils';

/**
 * Parse a CSV file and return structured ParsedData.
 */
export async function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      encoding: 'UTF-8',
      comments: '#',
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        try {
          const headers = results.meta.fields ?? [];
          const rows = results.data as Record<string, unknown>[];

          // Classify fields as numeric or categorical
          const numericFields: string[] = [];
          const categoricalFields: string[] = [];

          for (const header of headers) {
            const sampleValues = rows
              .slice(0, Math.min(50, rows.length))
              .map((r) => r[header])
              .filter((v) => v != null && v !== '');

            const numericCount = sampleValues.filter(isNumeric).length;
            const ratio = sampleValues.length > 0 ? numericCount / sampleValues.length : 0;

            if (ratio > 0.7) {
              numericFields.push(header);
            } else {
              categoricalFields.push(header);
            }
          }

          // Extract dates
          const dates: string[] = [];
          for (const header of categoricalFields) {
            const sample = rows.slice(0, 10).map((r) => r[header]);
            const dateCount = sample.filter(isDateLike).length;
            if (dateCount > sample.length * 0.5) {
              rows.forEach((r) => {
                const val = r[header];
                if (val && typeof val === 'string') dates.push(val);
              });
            }
          }

          resolve({
            type: 'tabular',
            headers,
            rows,
            numericFields,
            categoricalFields,
            dates,
            rowCount: rows.length,
            columnCount: headers.length,
            metadata: {
              delimiter: results.meta.delimiter,
              lineBreak: results.meta.linebreak,
              truncated: String(results.meta.truncated),
              parseErrors: String(results.errors.length),
            },
          });
        } catch (err) {
          reject(new Error(`CSV parse error: ${err instanceof Error ? err.message : String(err)}`));
        }
      },
      error: (error: Error) => {
        reject(new Error(`CSV parse error: ${error.message}`));
      },
    });
  });
}
