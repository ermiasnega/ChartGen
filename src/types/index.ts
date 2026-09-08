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

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  mapping: ChartMapping;
  data?: { categories: string[]; series: { name: string; data: number[] }[] };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}