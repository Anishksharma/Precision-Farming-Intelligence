/**
 * File utility functions for the Universal Document Intelligence Engine.
 * Handles file type detection, size formatting, and file reading.
 */

import type { SupportedFileType } from '../types';

/** Map file extensions to SupportedFileType */
const EXTENSION_MAP: Record<string, SupportedFileType> = {
  '.csv': 'csv',
  '.xlsx': 'xlsx',
  '.xls': 'xls',
  '.json': 'json',
  '.txt': 'txt',
  '.md': 'md',
  '.pdf': 'pdf',
};

/** MIME type to SupportedFileType mapping */
const MIME_MAP: Record<string, SupportedFileType> = {
  'text/csv': 'csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'application/json': 'json',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'application/pdf': 'pdf',
};

/** Maximum file size in bytes (50 MB) */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** Supported file extensions */
export const SUPPORTED_EXTENSIONS = Object.keys(EXTENSION_MAP);

/**
 * Format a file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Get the file extension (lowercase, including dot).
 */
export function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return fileName.slice(dotIndex).toLowerCase();
}

/**
 * Detect the SupportedFileType from a File object.
 * Returns null if unsupported.
 */
export function detectFileType(file: File): SupportedFileType | null {
  // Try MIME type first
  if (file.type && MIME_MAP[file.type]) {
    return MIME_MAP[file.type];
  }
  // Fall back to extension
  const ext = getFileExtension(file.name);
  return EXTENSION_MAP[ext] || null;
}

/**
 * Check if a file type is supported.
 */
export function isFileSupported(file: File): boolean {
  return detectFileType(file) !== null;
}

/**
 * Check if file size is within the limit.
 */
export function isFileSizeValid(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * Read a file as text (UTF-8).
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Read a file as ArrayBuffer (for binary formats like xlsx, pdf).
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Get an emoji icon for a file type.
 */
export function getFileIcon(type: SupportedFileType): string {
  const icons: Record<SupportedFileType, string> = {
    csv: '📊',
    xlsx: '📗',
    xls: '📗',
    json: '🔧',
    pdf: '📄',
    txt: '📝',
    md: '📋',
  };
  return icons[type] || '📎';
}

/**
 * Get a human-readable label for a file type.
 */
export function getFileTypeLabel(type: SupportedFileType): string {
  const labels: Record<SupportedFileType, string> = {
    csv: 'CSV Spreadsheet',
    xlsx: 'Excel Workbook',
    xls: 'Excel Workbook (Legacy)',
    json: 'JSON Data',
    txt: 'Text Document',
    md: 'Markdown Document',
    pdf: 'PDF Document',
  };
  return labels[type] || 'Unknown';
}

/**
 * Get the icon name (lucide) for a file type.
 */
export function getFileTypeIcon(type: SupportedFileType): string {
  const icons: Record<SupportedFileType, string> = {
    csv: 'Sheet',
    xlsx: 'FileSpreadsheet',
    xls: 'FileSpreadsheet',
    json: 'FileJson',
    txt: 'FileText',
    md: 'FileText',
    pdf: 'FileText',
  };
  return icons[type] || 'File';
}

/**
 * Generate a unique document ID.
 */
export function generateDocumentId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Validate a file for upload. Returns { valid: boolean; error?: string; errors: string[] }
 */
export function validateFile(file: File): { valid: boolean; error?: string; errors: string[] } {
  const errors: string[] = [];
  if (!isFileSupported(file)) {
    errors.push(`Unsupported file type: ${getFileExtension(file.name) || 'unknown'}. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`);
  }
  if (!isFileSizeValid(file)) {
    errors.push(`File too large: ${formatFileSize(file.size)}. Maximum: ${formatFileSize(MAX_FILE_SIZE)}`);
  }
  return {
    valid: errors.length === 0,
    error: errors[0],
    errors,
  };
}
