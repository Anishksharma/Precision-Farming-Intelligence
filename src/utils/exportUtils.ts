/**
 * Export utilities for data and dashboard output.
 */

/**
 * Export tabular data as a CSV file download.
 */
export function exportAsCSV(
  headers: string[],
  rows: Record<string, unknown>[],
  fileName = 'export.csv'
): void {
  const escapeCSV = (val: unknown): string => {
    const str = val == null ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCSV).join(',');
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCSV(row[h])).join(',')
  );
  const csvContent = [headerLine, ...dataLines].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export array of records as CSV automatically discovering headers.
 */
export function exportToCsv(
  rows: Record<string, unknown>[],
  fileName = 'export.csv'
): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  exportAsCSV(headers, rows, fileName);
}

/**
 * Export the current dashboard view as a printable report using window.print().
 */
export function exportDashboardAsPrint(): void {
  window.print();
}

/**
 * Export data as a JSON file download.
 */
export function exportAsJSON(data: unknown, fileName = 'export.json'): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
