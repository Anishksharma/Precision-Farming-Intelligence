/**
 * JSON Parser for structured data.
 * Handles arrays, objects, and nested structures; flattens for tabular display.
 */

import type { ParsedData } from '../../../types';
import { readFileAsText } from '../../../utils/fileUtils';
import { isNumeric, isDateLike } from '../../../utils/dataUtils';

/**
 * Flatten a nested object into a single-level object with dot-notation keys.
 */
function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
  maxDepth = 4,
  currentDepth = 0
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      currentDepth < maxDepth
    ) {
      Object.assign(
        result,
        flattenObject(value as Record<string, unknown>, newKey, maxDepth, currentDepth + 1)
      );
    } else if (Array.isArray(value)) {
      // If array of primitives, join them; otherwise store count
      if (value.length > 0 && typeof value[0] !== 'object') {
        result[newKey] = value.join(', ');
      } else {
        result[newKey] = `[${value.length} items]`;
      }
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Parse a JSON file and return structured ParsedData.
 */
export async function parseJSON(file: File): Promise<ParsedData> {
  const text = await readFileAsText(file);
  const parsed = JSON.parse(text);

  // Determine the shape of the data
  let rows: Record<string, unknown>[] = [];
  let textContent: string | undefined;

  if (Array.isArray(parsed)) {
    // Array of objects → tabular
    if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
      rows = parsed.map((item) =>
        flattenObject(item as Record<string, unknown>)
      );
    } else {
      // Array of primitives
      rows = parsed.map((item, i) => ({ index: i, value: item }));
    }
  } else if (typeof parsed === 'object' && parsed !== null) {
    // Single object — check if it has array properties that could be tabular
    const arrayProps = Object.entries(parsed as Record<string, unknown>).filter(
      ([, v]) => Array.isArray(v) && (v as unknown[]).length > 0
    );

    if (arrayProps.length > 0) {
      // Use the largest array property as the main data
      const [, largestArray] = arrayProps.sort(
        (a, b) => (b[1] as unknown[]).length - (a[1] as unknown[]).length
      )[0];
      const arr = largestArray as unknown[];

      if (typeof arr[0] === 'object' && arr[0] !== null) {
        rows = arr.map((item) =>
          flattenObject(item as Record<string, unknown>)
        );
      } else {
        rows = arr.map((item, i) => ({ index: i, value: item }));
      }
    } else {
      // Plain object, flatten it to a single row or show as text
      const flat = flattenObject(parsed as Record<string, unknown>);
      rows = [flat];
    }
    textContent = JSON.stringify(parsed, null, 2).slice(0, 5000);
  } else {
    // Primitive value
    textContent = String(parsed);
    return {
      type: 'text',
      textContent,
      rowCount: 0,
      columnCount: 0,
    };
  }

  // Derive headers from all rows
  const headerSet = new Set<string>();
  for (const row of rows) {
    Object.keys(row).forEach((k) => headerSet.add(k));
  }
  const headers = Array.from(headerSet);

  // Classify fields
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

  return {
    type: rows.length > 0 ? (textContent ? 'mixed' : 'tabular') : 'text',
    headers,
    rows,
    textContent,
    numericFields,
    categoricalFields,
    dates,
    rowCount: rows.length,
    columnCount: headers.length,
    metadata: {
      originalType: Array.isArray(parsed) ? 'array' : typeof parsed,
      originalLength: Array.isArray(parsed) ? String(parsed.length) : '1',
    },
  };
}
