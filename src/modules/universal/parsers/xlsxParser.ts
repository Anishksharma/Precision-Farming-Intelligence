/**
 * Excel (XLSX/XLS) Parser using the xlsx library.
 * Supports multiple sheets, date/number formats.
 */

import * as XLSX from 'xlsx';
import type { ParsedData, TabularData } from '../../../types';
import { readFileAsArrayBuffer } from '../../../utils/fileUtils';
import { isNumeric, isDateLike } from '../../../utils/dataUtils';

/**
 * Parse an Excel file and return structured ParsedData.
 */
export async function parseXLSX(file: File): Promise<ParsedData> {
  const buffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    cellNF: true,
    cellStyles: false,
  });

  const tables: TabularData[] = [];
  let primaryHeaders: string[] = [];
  let primaryRows: Record<string, unknown>[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      raw: false,
    });

    if (jsonData.length === 0) continue;

    const headers = Object.keys(jsonData[0]);

    // Convert date objects to strings and clean values
    const rows = jsonData.map((row) => {
      const cleanedRow: Record<string, unknown> = {};
      for (const key of headers) {
        let val = row[key];
        if (val instanceof Date) {
          val = val.toISOString().split('T')[0];
        }
        // Try to parse numeric strings
        if (typeof val === 'string') {
          const cleaned = val.replace(/[,$]/g, '');
          const num = Number(cleaned);
          if (!isNaN(num) && cleaned !== '') {
            val = num;
          }
        }
        cleanedRow[key.trim()] = val;
      }
      return cleanedRow;
    });

    const trimmedHeaders = headers.map((h) => h.trim());
    tables.push({ headers: trimmedHeaders, rows, name: sheetName });

    // Use the first sheet with data as the primary data source
    if (primaryHeaders.length === 0) {
      primaryHeaders = trimmedHeaders;
      primaryRows = rows;
    }
  }

  // Classify fields
  const numericFields: string[] = [];
  const categoricalFields: string[] = [];
  const dates: string[] = [];

  for (const header of primaryHeaders) {
    const sampleValues = primaryRows
      .slice(0, Math.min(50, primaryRows.length))
      .map((r) => r[header])
      .filter((v) => v != null && v !== '');

    const numericCount = sampleValues.filter(isNumeric).length;
    const ratio = sampleValues.length > 0 ? numericCount / sampleValues.length : 0;

    if (ratio > 0.7) {
      numericFields.push(header);
    } else {
      categoricalFields.push(header);
      // Check for date columns
      const dateCount = sampleValues.filter(isDateLike).length;
      if (dateCount > sampleValues.length * 0.5) {
        primaryRows.forEach((r) => {
          const val = r[header];
          if (val && typeof val === 'string') dates.push(val);
        });
      }
    }
  }

  return {
    type: 'tabular',
    headers: primaryHeaders,
    rows: primaryRows,
    tables,
    numericFields,
    categoricalFields,
    dates,
    rowCount: primaryRows.length,
    columnCount: primaryHeaders.length,
    metadata: {
      sheetCount: String(workbook.SheetNames.length),
      sheetNames: workbook.SheetNames.join(', '),
    },
  };
}
