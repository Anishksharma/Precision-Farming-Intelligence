import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportToCsv } from '../../utils/exportUtils';

export interface DataTableProps {
  headers: string[];
  rows: Record<string, unknown>[];
  pageSize?: number;
  searchable?: boolean;
  exportable?: boolean;
  title?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  headers,
  rows,
  pageSize = 10,
  searchable = true,
  exportable = true,
  title,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(term))
    );
  }, [rows, searchTerm]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredRows, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    exportToCsv(rows, title ? `${title.replace(/\s+/g, '_')}.csv` : 'dataset_export.csv');
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {searchable && (
          <div className="relative flex items-center min-w-[220px]">
            <Search size={14} className="absolute left-2.5 pointer-events-none" style={{ color: '#A6A69A' }} />
            <input
              type="text"
              placeholder="Search dataset..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border pl-8 pr-3 py-1.5 outline-none transition-colors"
              style={{
                backgroundColor: '#10100E',
                borderColor: '#34342B',
                color: '#F4F1E9',
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px]" style={{ color: '#A6A69A' }}>
            Showing {paginatedRows.length} of {filteredRows.length} entries
          </span>
          {exportable && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer"
              style={{
                backgroundColor: '#20201B',
                borderColor: '#34342B',
                color: '#FF8A24',
              }}
            >
              <Download size={13} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#34342B' }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#10100E', borderBottom: '1px solid #34342B' }}>
              {headers.map((h) => {
                const isSorted = sortColumn === h;
                return (
                  <th
                    key={h}
                    onClick={() => handleSort(h)}
                    className="p-2.5 font-medium cursor-pointer select-none transition-colors hover:text-[#FF8A24]"
                    style={{ color: isSorted ? '#FF8A24' : '#A6A69A' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>{h}</span>
                      {isSorted && (
                        sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="p-8 text-center" style={{ color: '#6B6B60' }}>
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="transition-colors hover:bg-[#20201B]"
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#171714' : '#141411',
                    borderBottom: '1px solid #282820',
                  }}
                >
                  {headers.map((h) => (
                    <td key={h} className="p-2.5 truncate max-w-[200px]" style={{ color: '#F4F1E9' }}>
                      {String(row[h] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px]" style={{ color: '#A6A69A' }}>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border disabled:opacity-30 transition-colors"
              style={{ backgroundColor: '#20201B', borderColor: '#34342B', color: '#F4F1E9' }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border disabled:opacity-30 transition-colors"
              style={{ backgroundColor: '#20201B', borderColor: '#34342B', color: '#F4F1E9' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
