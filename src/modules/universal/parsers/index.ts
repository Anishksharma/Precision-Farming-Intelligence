/**
 * Unified document parser entry point.
 * Dispatches to the correct parser based on file type.
 */

import type { ParsedData, SupportedFileType } from '../../../types';
import { detectFileType } from '../../../utils/fileUtils';
import { parseCSV } from './csvParser';
import { parseXLSX } from './xlsxParser';
import { parseJSON } from './jsonParser';
import { parseText } from './textParser';
import { parsePDF } from './pdfParser';

/**
 * Parse a document file and return structured ParsedData.
 * Automatically detects the file type and dispatches to the appropriate parser.
 *
 * @throws Error if the file type is unsupported or parsing fails
 */
export async function parseDocument(file: File): Promise<ParsedData> {
  const fileType = detectFileType(file);

  if (!fileType) {
    throw new Error(
      `Unsupported file type: ${file.name}. Supported types: csv, xlsx, xls, json, txt, md, pdf`
    );
  }

  const parserMap: Record<SupportedFileType, (f: File) => Promise<ParsedData>> = {
    csv: parseCSV,
    xlsx: parseXLSX,
    xls: parseXLSX,
    json: parseJSON,
    txt: parseText,
    md: parseText,
    pdf: parsePDF,
  };

  const parser = parserMap[fileType];
  return parser(file);
}

export { parseCSV } from './csvParser';
export { parseXLSX } from './xlsxParser';
export { parseJSON } from './jsonParser';
export { parseText } from './textParser';
export { parsePDF } from './pdfParser';
