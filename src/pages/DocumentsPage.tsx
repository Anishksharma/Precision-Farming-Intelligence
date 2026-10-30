import React from 'react';
import { DocumentUpload } from '../modules/universal/components/DocumentUpload';
import { DocumentList } from '../modules/universal/components/DocumentList';
import { useAppStore } from '../store/appStore';
import { FileText } from 'lucide-react';

const DocumentsPage: React.FC = () => {
  const { documents } = useAppStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide" style={{ color: '#F4F1E9' }}>
            UNIVERSAL DOCUMENTS
          </h1>
          <p className="text-sm mt-1" style={{ color: '#A6A69A' }}>
            Upload any document to generate an intelligent, interactive dashboard
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#171714', border: '1px solid #34342B' }}>
          <FileText size={16} style={{ color: '#FF8A24' }} />
          <span className="text-sm font-mono" style={{ color: '#A6A69A' }}>
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Upload Area */}
      <DocumentUpload />

      {/* Document List */}
      <DocumentList />
    </div>
  );
};

export default DocumentsPage;

