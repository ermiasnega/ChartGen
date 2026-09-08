export type DataType = 'text' | 'integer' | 'decimal' | 'percentage' | 'date';

export interface DataColumn {
  id: string;
  name: string;
  type: DataType;
}

export type DataCell = string;

export interface DataTable {
  id: string;
  name: string;
  columns: DataColumn[];
  rows: DataCell[][];
}

export type ChartType =
  | 'bar' | 'horizontal-bar' | 'line' | 'area' | 'pie' | 'doughnut'
  | 'scatter' | 'histogram' | 'box-plot' | 'radar' | 'polar-area'
  | 'bubble' | 'funnel' | 'gauge' | 'combo' | 'stacked-bar' | 'stacked-area';

export interface ChartMapping {
  categoryColumnId?: string;
  valueColumnIds: string[];
  xColumnId?: string;
  yColumnId?: string;
  sizeColumnId?: string;
  groupColumnId?: string;
}

export interface SeriesCustomization {
  name?: string;
  visible: boolean;
  color: string;
  lineWidth: number;
  lineType: 'solid' | 'dashed' | 'dotted';
  symbol: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'none';
  symbolSize: number;
  barWidth: number;
  opacity: number;
  areaFill: boolean;
  labelVisible: boolean;
}

export interface ChartCustomization {
  subtitle: string;
  description: string;
  background: string;
  width: number;
  height: number;
  margins: { top: number; right: number; bottom: number; left: number };
  typography: { fontFamily: string; titleSize: number; subtitleSize: number; axisFontSize: number; legendFontSize: number; dataLabelSize: number };
  xAxis: { show: boolean; title: string; position: 'top' | 'bottom'; labels: boolean; rotation: number; min?: number; max?: number };
  yAxis: { show: boolean; title: string; labels: boolean; min?: number; max?: number; numberFormat: 'auto' | 'number' | 'currency' | 'percentage' };
  legend: { show: boolean; position: 'top' | 'bottom' | 'left' | 'right'; orientation: 'horizontal' | 'vertical' };
  grid: { show: boolean; x: boolean; y: boolean; opacity: number };
  dataLabels: { show: boolean; position: 'top' | 'inside' | 'outside'; numberFormat: 'auto' | 'number' | 'percentage'; decimals: number };
  palette: string;
  colors: string[];
  textColor: string;
  gridColor: string;
  series: Record<string, SeriesCustomization>;
  specific: { barWidth: number; borderRadius: number; stacked: boolean; smooth: boolean; symbols: boolean; areaFill: boolean; pieInnerRadius: number; pieOuterRadius: number; pieLabelPosition: 'inside' | 'outside'; pieStartAngle: number; radarRadius: number; gaugeMin: number; gaugeMax: number; gaugeStartAngle: number; gaugeEndAngle: number };
}

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  mapping: ChartMapping;
  customization: ChartCustomization;
  dataset?: DataTable;
  data?: { categories: string[]; series: { name: string; data: number[] }[] };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}