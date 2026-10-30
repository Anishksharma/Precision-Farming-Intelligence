import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { parseDocument } from '../parsers';
import { processDocument } from '../pipeline';
import { generateDashboardConfig } from '../dashboard/configGenerator';
import { validateFile, formatFileSize, getFileIcon } from '../../../utils/fileUtils';
import type { UploadedDocument, DocumentStatus, SupportedFileType } from '../../../types';

const PIPELINE_STAGES: { key: DocumentStatus; label: string }[] = [
  { key: 'uploading', label: 'Upload' },
  { key: 'validating', label: 'Validate' },
  { key: 'extracting', label: 'Extract' },
  { key: 'classifying', label: 'Classify' },
  { key: 'analyzing', label: 'Analyze' },
  { key: 'generating', label: 'Generate' },
  { key: 'ready', label: 'Ready' },
];

export const DocumentUpload: React.FC = () => {
  const { addDocument, updateDocument, setActiveDocument, setCurrentPage } = useAppStore();
  const [currentStatus, setCurrentStatus] = useState<DocumentStatus | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadError(null);
    setActiveFileName(file.name);

    // 1. Validation Stage
    setCurrentStatus('validating');
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file format');
      setCurrentStatus('error');
      return;
    }

    const docId = `doc-${Date.now()}`;
    const newDoc: UploadedDocument = {
      id: docId,
      fileName: file.name,
      fileType: (file.name.split('.').pop()?.toLowerCase() as SupportedFileType) || 'csv',
      fileSize: file.size,
      uploadedAt: new Date(),
      status: 'uploading',
      rawContent: null,
      parsedData: null,
      classification: null,
      insights: null,
      dashboardConfig: null,
      errors: [],
    };

    addDocument(newDoc);

    try {
      // 2. Extraction & Parsing Stage
      setCurrentStatus('extracting');
      updateDocument(docId, { status: 'extracting' });
      const parsedData = await parseDocument(file);

      // 3. Document Intelligence & Classification Stage
      setCurrentStatus('classifying');
      updateDocument(docId, { status: 'classifying', parsedData });

      // 4. Analytics & Insight Generation Stage
      setCurrentStatus('analyzing');
      const { classification, insights } = processDocument(parsedData);
      updateDocument(docId, { status: 'analyzing', classification, insights });

      // 5. Dashboard Configuration Generation Stage
      setCurrentStatus('generating');
      updateDocument(docId, { status: 'generating' });

      const partialDoc: UploadedDocument = {
        ...newDoc,
        parsedData,
        classification,
        insights,
        status: 'generating',
      };
      const dashboardConfig = generateDashboardConfig(partialDoc);

      // 6. Finalization
      setCurrentStatus('ready');
      updateDocument(docId, {
        status: 'ready',
        dashboardConfig,
      });

      // Automatically set as active and navigate to dashboard
      setTimeout(() => {
        setActiveDocument(docId);
        setCurrentPage('document-dashboard');
      }, 600);
    } catch (err: any) {
      console.error('Document processing error:', err);
      setUploadError(err.message || 'Failed to process document');
      setCurrentStatus('error');
      updateDocument(docId, {
        status: 'error',
        errors: [err.message || 'Processing failed'],
      });
    }
  }, [addDocument, updateDocument, setActiveDocument, setCurrentPage]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0]);
    }
  }, [handleFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  });

  return (
    <div className="space-y-4">
      {/* Drop Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-[#FF8A24] bg-[#20201B]' : 'border-[#34342B] bg-[#171714] hover:border-[#FF8A24]/60 hover:bg-[#1a1a17]'}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform"
            style={{ backgroundColor: '#20201B', border: '1px solid #34342B' }}
          >
            {currentStatus && currentStatus !== 'ready' && currentStatus !== 'error' ? (
              <Loader2 size={28} className="animate-spin" style={{ color: '#FF8A24' }} />
            ) : (
              <Upload size={28} style={{ color: isDragActive ? '#FF8A24' : '#A6A69A' }} />
            )}
          </div>

          <div>
            <h3 className="font-heading font-bold text-base tracking-wide" style={{ color: '#F4F1E9' }}>
              {isDragActive ? 'Drop file to initiate engine' : 'Drag & Drop Any Document or Dataset'}
            </h3>
            <p className="text-xs font-mono mt-1" style={{ color: '#A6A69A' }}>
              Supports PDF, CSV, Excel (XLS/XLSX), JSON, TXT, Markdown, Scientific Datasets
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {['CSV', 'XLSX', 'PDF', 'JSON', 'TXT', 'MD'].map((ext) => (
              <span
                key={ext}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-medium border"
                style={{
                  backgroundColor: '#20201B',
                  borderColor: '#34342B',
                  color: '#A6A69A',
                }}
              >
                {ext}
              </span>
            ))}
            <span className="text-[11px] font-mono" style={{ color: '#6B6B60' }}>
              • Max 50 MB
            </span>
          </div>
        </div>
      </div>

      {/* Pipeline Status Stepper */}
      <AnimatePresence>
        {currentStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border p-4 space-y-3"
            style={{ backgroundColor: '#171714', borderColor: '#34342B' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: '#FF8A24' }} />
                <span className="text-xs font-mono font-semibold" style={{ color: '#F4F1E9' }}>
                  Processing: {activeFileName}
                </span>
              </div>
              <span
                className="text-[11px] font-mono uppercase font-bold"
                style={{
                  color: currentStatus === 'error' ? '#FF4545' : currentStatus === 'ready' ? '#54E38E' : '#FF8A24',
                }}
              >
                {currentStatus}
              </span>
            </div>

            {/* Stage Indicators */}
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {PIPELINE_STAGES.map((st, i) => {
                const currentIndex = PIPELINE_STAGES.findIndex((s) => s.key === currentStatus);
                const isPassed = currentIndex > i || currentStatus === 'ready';
                const isCurrent = currentStatus === st.key;

                return (
                  <div
                    key={st.key}
                    className="p-2 rounded border text-center transition-all"
                    style={{
                      backgroundColor: isCurrent ? 'rgba(255, 138, 36, 0.15)' : isPassed ? 'rgba(84, 227, 142, 0.1)' : '#10100E',
                      borderColor: isCurrent ? '#FF8A24' : isPassed ? '#54E38E' : '#34342B',
                    }}
                  >
                    <p
                      className="text-[10px] font-mono font-medium truncate"
                      style={{
                        color: isCurrent ? '#FF8A24' : isPassed ? '#54E38E' : '#6B6B60',
                      }}
                    >
                      {st.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 text-xs font-mono p-2.5 rounded bg-red-950/20 border border-red-900/40" style={{ color: '#FF4545' }}>
                <AlertCircle size={15} />
                <span>{uploadError}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
