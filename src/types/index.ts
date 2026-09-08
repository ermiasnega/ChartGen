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

export interface ChartConfig {
  id: string;
  title: string;
  type: string;
  data: { categories: string[]; series: { name: string; data: number[] }[] };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}