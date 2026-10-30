import React from 'react';
import { useAppStore } from '../store/appStore';
import { GeneratedDashboard } from '../modules/universal/components/GeneratedDashboard';
import { ArrowLeft, FileText } from 'lucide-react';

const DocumentDashboard: React.FC = () => {
  const { activeDocumentId, documents, setCurrentPage, setActiveDocument } = useAppStore();
  const doc = documents.find(d => d.id === activeDocumentId);

  if (!doc || !doc.dashboardConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <FileText size={48} style={{ color: '#34342B' }} />
        <p className="text-lg" style={{ color: '#A6A69A' }}>No dashboard generated yet</p>
        <button
          onClick={() => setCurrentPage('documents')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#FF8A24', color: '#0B0B0A' }}
        >
          <ArrowLeft size={16} />
          Upload a Document
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setActiveDocument(null); setCurrentPage('documents'); }}
          className="p-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#171714', color: '#A6A69A' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl tracking-wide" style={{ color: '#F4F1E9' }}>
            {doc.dashboardConfig.title}
          </h1>
          <p className="text-xs font-mono" style={{ color: '#A6A69A' }}>
            Generated from: {doc.fileName}
          </p>
        </div>
      </div>
      <GeneratedDashboard document={doc} />
    </div>
  );
};

export default DocumentDashboard;

