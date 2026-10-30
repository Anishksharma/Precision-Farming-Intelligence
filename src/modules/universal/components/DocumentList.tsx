import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, LayoutDashboard, RefreshCw, Calendar, Database } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatFileSize, formatDate } from '../../../utils/formatUtils';
import { getFileIcon } from '../../../utils/fileUtils';

export const DocumentList: React.FC = () => {
  const { documents, removeDocument, setActiveDocument, setCurrentPage } = useAppStore();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredDocs = documents.filter((doc) => {
    if (filterType === 'all') return true;
    return doc.fileType === filterType;
  });

  const handleOpenDashboard = (docId: string) => {
    setActiveDocument(docId);
    setCurrentPage('document-dashboard');
  };

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={32} />}
        title="No Documents Ingested Yet"
        description="Upload a CSV, Excel sheet, PDF research paper, JSON sensor log, or technical report above to generate an instant interactive intelligence dashboard."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading font-semibold text-base" style={{ color: '#F4F1E9' }}>
            Processed Documents & Artifacts
          </h3>
          <p className="text-xs font-mono" style={{ color: '#A6A69A' }}>
            Select any document to reopen its adaptive intelligence dashboard
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg border text-xs font-mono" style={{ backgroundColor: '#10100E', borderColor: '#34342B' }}>
          {['all', 'csv', 'xlsx', 'pdf', 'json'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className="px-2.5 py-1 rounded capitalize transition-colors"
              style={{
                backgroundColor: filterType === t ? '#20201B' : 'transparent',
                color: filterType === t ? '#FF8A24' : '#A6A69A',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredDocs.map((doc) => (
          <Card
            key={doc.id}
            padding="sm"
            className="flex flex-col justify-between hover:border-[#FF8A24]/50 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl flex-shrink-0">{getFileIcon(doc.fileType)}</span>
                  <div className="min-w-0">
                    <h4 className="font-medium text-xs truncate" style={{ color: '#F4F1E9' }} title={doc.fileName}>
                      {doc.fileName}
                    </h4>
                    <span className="text-[10px] font-mono" style={{ color: '#6B6B60' }}>
                      {formatFileSize(doc.fileSize)} • {doc.fileType.toUpperCase()}
                    </span>
                  </div>
                </div>
                {doc.classification && (
                  <Badge variant="orange" size="sm">
                    {doc.classification.industry}
                  </Badge>
                )}
              </div>

              {/* Status and Details */}
              <div className="pt-2 border-t flex items-center justify-between text-[10px] font-mono" style={{ borderColor: '#282820', color: '#A6A69A' }}>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {formatDate(doc.uploadedAt, 'short')}
                </span>
                {doc.parsedData?.rowCount && (
                  <span className="flex items-center gap-1">
                    <Database size={11} />
                    {doc.parsedData.rowCount} rows
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t" style={{ borderColor: '#34342B' }}>
              <Button
                variant="primary"
                size="sm"
                icon={<LayoutDashboard size={13} />}
                onClick={() => handleOpenDashboard(doc.id)}
                className="w-full text-xs"
              >
                Open Dashboard
              </Button>
              <button
                onClick={() => removeDocument(doc.id)}
                className="p-1.5 rounded-lg border transition-colors hover:bg-red-950/30 hover:border-red-800"
                style={{ backgroundColor: '#20201B', borderColor: '#34342B', color: '#A6A69A' }}
                title="Remove Document"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
