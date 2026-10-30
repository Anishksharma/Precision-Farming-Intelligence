/**
 * Text/Markdown Parser.
 * Extracts key-value pairs, tables, lists, and detects structure from plain text.
 */

import type { ParsedData, TabularData } from '../../../types';
import { readFileAsText } from '../../../utils/fileUtils';

/**
 * Extract key-value pairs from text (patterns like "Key: Value" or "Key = Value").
 */
function extractKeyValuePairs(text: string): Record<string, string> {
  const pairs: Record<string, string> = {};
  const kvPattern = /^([A-Za-z][\w\s]{0,40}):\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = kvPattern.exec(text)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (key && value && !value.includes('\n')) {
      pairs[key] = value;
    }
  }
  // Also try "Key = Value" pattern
  const eqPattern = /^([A-Za-z][\w\s]{0,40})\s*=\s*(.+)$/gm;
  while ((match = eqPattern.exec(text)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (key && value) {
      pairs[key] = value;
    }
  }
  return pairs;
}

/**
 * Extract markdown or text tables.
 */
function extractTables(text: string): TabularData[] {
  const tables: TabularData[] = [];

  // Markdown table pattern: | Header1 | Header2 |
  const lines = text.split('\n');
  let tableStart = -1;
  let tableLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isTableLine = line.startsWith('|') && line.endsWith('|') && line.includes('|');
    const isSeparator = /^\|[\s:|-]+\|$/.test(line);

    if (isTableLine || isSeparator) {
      if (tableStart === -1) tableStart = i;
      tableLines.push(line);
    } else {
      if (tableLines.length >= 3) {
        // We have a markdown table
        const table = parseMarkdownTable(tableLines);
        if (table) tables.push(table);
      }
      tableStart = -1;
      tableLines = [];
    }
  }

  // Handle table at end of file
  if (tableLines.length >= 3) {
    const table = parseMarkdownTable(tableLines);
    if (table) tables.push(table);
  }

  return tables;
}

/**
 * Parse markdown table lines into TabularData.
 */
function parseMarkdownTable(lines: string[]): TabularData | null {
  if (lines.length < 3) return null;

  const parseRow = (line: string): string[] =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());

  const headers = parseRow(lines[0]);
  if (headers.length === 0) return null;

  // Skip separator line (index 1)
  const rows: Record<string, unknown>[] = [];
  for (let i = 2; i < lines.length; i++) {
    if (/^\|[\s:|-]+\|$/.test(lines[i])) continue;
    const cells = parseRow(lines[i]);
    const row: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? '';
    });
    rows.push(row);
  }

  return { headers, rows, name: 'Table' };
}

/**
 * Extract bullet/numbered lists from text.
 */
function extractLists(text: string): string[][] {
  const lists: string[][] = [];
  const lines = text.split('\n');
  let currentList: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isListItem =
      /^[-*•]\s+/.test(trimmed) ||
      /^\d+[.)]\s+/.test(trimmed);

    if (isListItem) {
      currentList.push(trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, ''));
    } else {
      if (currentList.length > 0) {
        lists.push(currentList);
        currentList = [];
      }
    }
  }
  if (currentList.length > 0) {
    lists.push(currentList);
  }

  return lists;
}

/**
 * Parse a plain text or markdown file and return structured ParsedData.
 */
export async function parseText(file: File): Promise<ParsedData> {
  const text = await readFileAsText(file);

  const keyValuePairs = extractKeyValuePairs(text);
  const tables = extractTables(text);
  const lists = extractLists(text);

  // Build metadata from key-value pairs
  const metadata: Record<string, string> = { ...keyValuePairs };
  if (lists.length > 0) {
    metadata['listsFound'] = String(lists.length);
  }

  // If we found tables, use the first one as primary data
  let headers: string[] | undefined;
  let rows: Record<string, unknown>[] | undefined;
  let numericFields: string[] | undefined;
  let categoricalFields: string[] | undefined;

  if (tables.length > 0) {
    headers = tables[0].headers;
    rows = tables[0].rows;

    numericFields = [];
    categoricalFields = [];
    for (const header of headers) {
      const values = rows.map((r) => r[header]).filter((v) => v != null);
      const numCount = values.filter((v) => !isNaN(Number(v))).length;
      if (numCount > values.length * 0.7) {
        numericFields.push(header);
      } else {
        categoricalFields.push(header);
      }
    }
  }

  // Extract dates from text
  const datePattern = /\b\d{4}[-/]\d{2}[-/]\d{2}\b|\b\d{2}[-/]\d{2}[-/]\d{4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4}\b/gi;
  const dates = text.match(datePattern) || [];

  // Word count and line count for metadata
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const lineCount = text.split('\n').length;
  metadata['wordCount'] = String(wordCount);
  metadata['lineCount'] = String(lineCount);
  metadata['characterCount'] = String(text.length);

  return {
    type: tables.length > 0 ? 'mixed' : 'text',
    headers,
    rows,
    textContent: text,
    metadata,
    tables: tables.length > 0 ? tables : undefined,
    numericFields,
    categoricalFields,
    dates: dates.length > 0 ? dates : undefined,
    rowCount: rows?.length ?? 0,
    columnCount: headers?.length ?? 0,
  };
}
