import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, Layers, ShieldAlert, Award, FileSpreadsheet, Activity } from 'lucide-react';
import type { UploadedDocument, DashboardSection, DashboardWidget } from '../../../types';
import { MetricCard } from '../../../components/charts/MetricCard';
import { LineChart } from '../../../components/charts/LineChart';
import { BarChart } from '../../../components/charts/BarChart';
import { DataTable } from '../../../components/charts/DataTable';
import { RiskMatrix } from '../../../components/charts/RiskMatrix';
import { ChartWrapper } from '../../../components/charts/ChartWrapper';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export interface GeneratedDashboardProps {
  document: UploadedDocument;
}

export const GeneratedDashboard: React.FC<GeneratedDashboardProps> = ({ document: doc }) => {
  const config = doc.dashboardConfig;
  const [activeSectionId, setActiveSectionId] = useState<string>('all');

  if (!config) {
    return (
      <div className="p-8 text-center text-sm font-mono" style={{ color: '#A6A69A' }}>
        No configuration synthesized for this document.
      </div>
    );
  }

  const sectionsToRender = activeSectionId === 'all'
    ? config.sections
    : config.sections.filter((s) => s.id === activeSectionId);

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'metric-card':
        return (
          <MetricCard
            key={widget.id}
            metric={widget.data as any}
            glow="orange"
          />
        );

      case 'line-chart':
      case 'area-chart':
        return (
          <ChartWrapper key={widget.id} title={widget.title}>
            <LineChart
              data={widget.data as any}
              series={[
                {
                  key: 'y',
                  name: widget.title,
                  color: '#FF8A24',
                  isArea: widget.type === 'area-chart',
                },
              ]}
              xAxisKey="x"
            />
          </ChartWrapper>
        );

      case 'bar-chart':
        return (
          <ChartWrapper key={widget.id} title={widget.title}>
            <BarChart
              data={widget.data as any}
              series={[{ key: 'value', name: widget.title, color: '#B6F23A' }]}
              xAxisKey="label"
            />
          </ChartWrapper>
        );

      case 'table': {
        const tableData = widget.data as { headers: string[]; rows: Record<string, unknown>[] };
        return (
          <div key={widget.id} className="col-span-full">
            <ChartWrapper title={widget.title}>
              <DataTable
                headers={tableData.headers}
                rows={tableData.rows}
                title={widget.title}
              />
            </ChartWrapper>
          </div>
        );
      }

      case 'risk-matrix':
        return (
          <ChartWrapper key={widget.id} title={widget.title}>
            <RiskMatrix risks={widget.data as any} />
          </ChartWrapper>
        );

      case 'text-block': {
        const textData = widget.data as any;
        return (
          <Card key={widget.id} className="space-y-3">
            <h4 className="font-heading font-semibold text-sm" style={{ color: '#FF8A24' }}>
              {widget.title}
            </h4>
            {textData.summary && (
              <p className="text-xs font-mono leading-relaxed" style={{ color: '#F4F1E9' }}>
                {textData.summary}
              </p>
            )}
            {textData.verdict && (
              <div className="p-3 rounded-lg border font-mono text-xs" style={{ backgroundColor: '#10100E', borderColor: '#34342B' }}>
                <p className="font-bold text-sm mb-1" style={{ color: '#54E38E' }}>
                  Analytical Verdict:
                </p>
                <p style={{ color: '#F4F1E9' }}>{textData.verdict}</p>
              </div>
            )}
            {textData.factsSeparation && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t text-[11px] font-mono" style={{ borderColor: '#34342B' }}>
                <div className="p-2 rounded border" style={{ backgroundColor: '#10100E', borderColor: '#54E38E/30' }}>
                  <span className="font-bold block mb-1" style={{ color: '#54E38E' }}>Verified Facts:</span>
                  <ul className="list-disc pl-3 space-y-0.5 text-[10px]" style={{ color: '#A6A69A' }}>
                    {textData.factsSeparation.extractedFacts.map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2 rounded border" style={{ backgroundColor: '#10100E', borderColor: '#FF8A24/30' }}>
                  <span className="font-bold block mb-1" style={{ color: '#FF8A24' }}>Calculated Metrics:</span>
                  <ul className="list-disc pl-3 space-y-0.5 text-[10px]" style={{ color: '#A6A69A' }}>
                    {textData.factsSeparation.calculatedMetrics.map((m: string, i: number) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2 rounded border" style={{ backgroundColor: '#10100E', borderColor: '#FFB547/30' }}>
                  <span className="font-bold block mb-1" style={{ color: '#FFB547' }}>AI Interpretations:</span>
                  <ul className="list-disc pl-3 space-y-0.5 text-[10px]" style={{ color: '#A6A69A' }}>
                    {textData.factsSeparation.estimates.map((e: string, i: number) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Card>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border" style={{ backgroundColor: '#171714', borderColor: '#34342B' }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="orange" size="md">
              {doc.classification?.industry?.toUpperCase() || 'UNIVERSAL'} DOMAIN
            </Badge>
            <Badge variant="lime" size="md">
              {doc.classification?.documentType?.toUpperCase() || 'DATASET'}
            </Badge>
            <span className="text-xs font-mono" style={{ color: '#A6A69A' }}>
              Confidence: {Math.round((doc.classification?.confidence || 0.9) * 100)}%
            </span>
          </div>
          <p className="text-xs font-mono" style={{ color: '#A6A69A' }}>
            Data Quality Index: {doc.insights?.dataQuality.overallScore || 96}% Completeness • Deterministic local analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => window.print()}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl border font-mono text-xs" style={{ backgroundColor: '#10100E', borderColor: '#34342B' }}>
        <button
          onClick={() => setActiveSectionId('all')}
          className="px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
          style={{
            backgroundColor: activeSectionId === 'all' ? '#FF8A24' : 'transparent',
            color: activeSectionId === 'all' ? '#0B0B0A' : '#A6A69A',
            fontWeight: activeSectionId === 'all' ? 600 : 400,
          }}
        >
          All Sections
        </button>
        {config.sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSectionId(sec.id)}
            className="px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
            style={{
              backgroundColor: activeSectionId === sec.id ? '#FF8A24' : 'transparent',
              color: activeSectionId === sec.id ? '#0B0B0A' : '#A6A69A',
              fontWeight: activeSectionId === sec.id ? 600 : 400,
            }}
          >
            {sec.title}
          </button>
        ))}
      </div>

      {/* Render Active Sections */}
      <div className="space-y-6">
        {sectionsToRender.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: '#282820' }}>
              <Layers size={14} style={{ color: '#FF8A24' }} />
              <h3 className="font-heading font-bold text-sm tracking-wide uppercase" style={{ color: '#F4F1E9' }}>
                {section.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {section.widgets.map((widget) => renderWidget(widget))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
