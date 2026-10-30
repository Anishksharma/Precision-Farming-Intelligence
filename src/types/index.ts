// Universal Document Types
export type SupportedFileType = 'pdf' | 'csv' | 'xlsx' | 'xls' | 'json' | 'txt' | 'md';

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileType: SupportedFileType;
  fileSize: number;
  uploadedAt: Date;
  status: DocumentStatus;
  rawContent: string | ArrayBuffer | null;
  parsedData: ParsedData | null;
  classification: DocumentClassification | null;
  insights: DocumentInsights | null;
  dashboardConfig: DashboardConfig | null;
  errors: string[];
}

export type DocumentStatus = 
  | 'uploading' 
  | 'validating' 
  | 'extracting' 
  | 'classifying' 
  | 'analyzing' 
  | 'generating' 
  | 'ready' 
  | 'error';

export interface ParsedData {
  type: 'tabular' | 'text' | 'mixed';
  headers?: string[];
  rows?: Record<string, unknown>[];
  textContent?: string;
  metadata?: Record<string, string>;
  tables?: TabularData[];
  entities?: ExtractedEntity[];
  dates?: string[];
  numericFields?: string[];
  categoricalFields?: string[];
  rowCount?: number;
  columnCount?: number;
}

export interface TabularData {
  headers: string[];
  rows: Record<string, unknown>[];
  name?: string;
}

export interface ExtractedEntity {
  text: string;
  type: 'organization' | 'location' | 'date' | 'metric' | 'percentage' | 'currency' | 'unit';
  value?: string | number;
  confidence: number;
}

export interface DocumentClassification {
  industry: string;
  subject: string;
  documentType: string;
  confidence: number;
  tags: string[];
  suggestedSections: string[];
}

export interface DocumentInsights {
  summary: string;
  keyMetrics: MetricItem[];
  trends: TrendItem[];
  risks: RiskItem[];
  recommendations: string[];
  verdict: string;
  dataQuality: DataQualityAssessment;
  factsSeparation: {
    extractedFacts: string[];
    calculatedMetrics: string[];
    estimates: string[];
  };
}

export interface MetricItem {
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeDirection?: 'up' | 'down' | 'stable';
  source: 'extracted' | 'calculated' | 'estimated';
  description?: string;
}

export interface TrendItem {
  label: string;
  data: { x: string | number; y: number }[];
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  significance: 'high' | 'medium' | 'low';
}

export interface RiskItem {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  mitigation?: string;
}

export interface DataQualityAssessment {
  overallScore: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  issues: string[];
}

// Dashboard Configuration
export interface DashboardConfig {
  title: string;
  subtitle: string;
  sections: DashboardSection[];
  theme: 'agriculture' | 'finance' | 'healthcare' | 'engineering' | 'research' | 'general';
}

export interface DashboardSection {
  id: string;
  title: string;
  type: SectionType;
  order: number;
  visible: boolean;
  widgets: DashboardWidget[];
}

export type SectionType = 
  | 'overview' 
  | 'insights' 
  | 'metrics' 
  | 'explorer' 
  | 'trends' 
  | 'risks' 
  | 'verdict'
  | 'comparison'
  | 'distribution'
  | 'ranking'
  | 'custom';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  data: unknown;
  config: WidgetConfig;
}

export type WidgetType = 
  | 'metric-card'
  | 'line-chart'
  | 'area-chart'
  | 'bar-chart'
  | 'donut-chart'
  | 'scatter-plot'
  | 'radar-chart'
  | 'distribution'
  | 'ranking'
  | 'table'
  | 'risk-matrix'
  | 'text-block'
  | 'heatmap';

export interface WidgetConfig {
  width?: 'full' | 'half' | 'third' | 'quarter';
  height?: 'sm' | 'md' | 'lg';
  colors?: string[];
  xAxis?: string;
  yAxis?: string;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
}

// Navigation
export type AppPage = 
  | 'command-center'
  | 'documents'
  | 'document-dashboard'
  | 'farm-locations'
  | 'soil-moisture'
  | 'forecast'
  | 'irrigation'
  | 'sensors'
  | 'weather'
  | 'alerts'
  | 'case-studies'
  | 'analytics'
  | 'settings'
  | 'test-results';

