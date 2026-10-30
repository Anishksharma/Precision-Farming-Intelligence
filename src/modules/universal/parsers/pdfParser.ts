/**
 * PDF Parser — browser-based best-effort text extraction.
 * Full PDF parsing requires server-side tools; this provides a basic approach
 * using the raw binary to extract readable text content.
 */

import type { ParsedData, TabularData } from '../../../types';
import { readFileAsArrayBuffer } from '../../../utils/fileUtils';

/**
 * Extract text strings from a PDF binary buffer.
 * This is a best-effort extraction that reads text from PDF stream objects.
 */
function extractTextFromPDFBinary(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const text: string[] = [];

  // Decode to Latin1 first (PDF is mostly ASCII/Latin)
  let pdfString = '';
  for (let i = 0; i < bytes.length; i++) {
    pdfString += String.fromCharCode(bytes[i]);
  }

  // Extract text between BT (begin text) and ET (end text) operators
  const btEtPattern = /BT\s([\s\S]*?)ET/g;
  let match: RegExpExecArray | null;

  while ((match = btEtPattern.exec(pdfString)) !== null) {
    const block = match[1];

    // Extract text from Tj operator: (text) Tj
    const tjPattern = /\(([^)]*)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjPattern.exec(block)) !== null) {
      text.push(tjMatch[1]);
    }

    // Extract text from TJ operator (array form): [(text)] TJ
    const tjArrayPattern = /\[([^\]]*)\]\s*TJ/g;
    let tjArrMatch: RegExpExecArray | null;
    while ((tjArrMatch = tjArrayPattern.exec(block)) !== null) {
      const inner = tjArrMatch[1];
      const parts = /\(([^)]*)\)/g;
      let partMatch: RegExpExecArray | null;
      while ((partMatch = parts.exec(inner)) !== null) {
        text.push(partMatch[1]);
      }
    }
  }

  // Clean up extracted text
  let extracted = text.join(' ');

  // Handle PDF escape sequences
  extracted = extracted
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');

  // If BT/ET extraction yielded nothing, try to find any readable strings
  if (extracted.trim().length < 10) {
    const readablePattern = /[\x20-\x7E]{8,}/g;
    const readableMatches = pdfString.match(readablePattern) || [];
    // Filter out PDF commands and metadata noise
    const filtered = readableMatches.filter(
      (s) =>
        !s.startsWith('/') &&
        !s.startsWith('<<') &&
        !s.includes('endobj') &&
        !s.includes('stream') &&
        !s.includes('xref') &&
        !/^\d+ \d+ obj/.test(s)
    );
    extracted = filtered.join('\n');
  }

  return extracted;
}

/**
 * Try to detect table-like structures in extracted text.
 */
function detectTablesInText(text: string): TabularData[] {
  const tables: TabularData[] = [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Look for lines that could be table rows (consistent delimiters)
  const potentialRows: string[][] = [];
  for (const line of lines) {
    // Tab-delimited
    if (line.includes('\t')) {
      potentialRows.push(line.split('\t').map((c) => c.trim()));
    }
    // Multiple spaces (at least 2+ between "columns")
    else if (/\s{2,}/.test(line)) {
      const cells = line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        potentialRows.push(cells);
      }
    }
  }

  // If we have consistent row lengths, treat it as a table
  if (potentialRows.length >= 3) {
    const colCounts = potentialRows.map((r) => r.length);
    const modeCount = colCounts.sort(
      (a, b) =>
        colCounts.filter((v) => v === b).length -
        colCounts.filter((v) => v === a).length
    )[0];

    const consistentRows = potentialRows.filter((r) => r.length === modeCount);
    if (consistentRows.length >= 3) {
      const headers = consistentRows[0];
      const rows = consistentRows.slice(1).map((cells) => {
        const row: Record<string, unknown> = {};
        headers.forEach((h, i) => {
          row[h] = cells[i] ?? '';
        });
        return row;
      });
      tables.push({ headers, rows, name: 'Detected Table' });
    }
  }

  return tables;
}

/**
 * Parse a PDF file with best-effort browser-side text extraction.
 */
export async function parsePDF(file: File): Promise<ParsedData> {
  const buffer = await readFileAsArrayBuffer(file);
  const extractedText = extractTextFromPDFBinary(buffer);

  const tables = detectTablesInText(extractedText);

  // Extract dates
  const datePattern =
    /\b\d{4}[-/]\d{2}[-/]\d{2}\b|\b\d{2}[-/]\d{2}[-/]\d{4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4}\b/gi;
  const dates = extractedText.match(datePattern) || [];

  // Build result
  const hasTable = tables.length > 0;

  return {
    type: hasTable ? 'mixed' : 'text',
    headers: hasTable ? tables[0].headers : undefined,
    rows: hasTable ? tables[0].rows : undefined,
    textContent: extractedText || '(No readable text could be extracted from this PDF. Full PDF parsing requires a server-side solution.)',
    tables: hasTable ? tables : undefined,
    dates: dates.length > 0 ? dates : undefined,
    rowCount: hasTable ? tables[0].rows.length : 0,
    columnCount: hasTable ? tables[0].headers.length : 0,
    metadata: {
      fileSize: String(buffer.byteLength),
      extractionMethod: 'browser-binary-scan',
      extractedTextLength: String(extractedText.length),
      tablesFound: String(tables.length),
      note: 'Browser-based extraction is limited. For full PDF parsing, use a server-side solution.',
    },
  };
}
