import { EChartsOption } from 'echarts';
import { ChartConfig, ChartType, DataTable } from '@/types';

export const chartTypeGroups: { name: string; types: { id: ChartType; label: string; description: string }[] }[] = [
  { name: 'Recommended', types: [{ id: 'bar', label: 'Bar', description: 'Compare categories' }, { id: 'line', label: 'Line', description: 'Show trends over time' }, { id: 'pie', label: 'Pie', description: 'Show composition' }] },
  { name: 'Basic', types: [{ id: 'horizontal-bar', label: 'Horizontal bar', description: 'Compare long labels' }, { id: 'area', label: 'Area', description: 'Emphasize volume over time' }, { id: 'doughnut', label: 'Doughnut', description: 'Composition with a center' }] },
  { name: 'Statistical', types: [{ id: 'scatter', label: 'Scatter', description: 'Compare two measures' }, { id: 'histogram', label: 'Histogram', description: 'Show distribution' }, { id: 'box-plot', label: 'Box plot', description: 'Summarize spread' }] },
  { name: 'Comparison', types: [{ id: 'stacked-bar', label: 'Stacked bar', description: 'Compare parts to whole' }, { id: 'stacked-area', label: 'Stacked area', description: 'Show cumulative trends' }, { id: 'combo', label: 'Combo', description: 'Mix bars and lines' }] },
  { name: 'Distribution', types: [{ id: 'bubble', label: 'Bubble', description: 'Add a size dimension' }, { id: 'polar-area', label: 'Polar area', description: 'Compare radial values' }, { id: 'funnel', label: 'Funnel', description: 'Show progressive stages' }] },
  { name: 'Specialized', types: [{ id: 'radar', label: 'Radar', description: 'Compare many dimensions' }, { id: 'gauge', label: 'Gauge', description: 'Show one KPI' }] },
];

const toNumber = (value: string | undefined) => {
  if (!value?.trim()) return null;
  const number = Number(value.replace(/[$,%\s,]/g, ''));
  return Number.isFinite(number) ? number : null;
};

const columnIndex = (table: DataTable, id?: string) => table.columns.findIndex((column) => column.id === id);
const values = (table: DataTable, id?: string) => { const index = columnIndex(table, id); return index < 0 ? [] : table.rows.map((row) => toNumber(row[index])); };
const categories = (table: DataTable, id?: string) => { const index = columnIndex(table, id); return index < 0 ? table.rows.map((_, row) => `Row ${row + 1}`) : table.rows.map((row, rowIndex) => row[index] || `Row ${rowIndex + 1}`); };
const cleanValues = (items: (number | null)[]) => items.map((value) => value ?? 0);
const axis = (name: string, type: 'category' | 'value' = 'category') => ({ type, name, axisLabel: { color: '#64748b' }, axisLine: { lineStyle: { color: '#cbd5e1' } }, splitLine: { lineStyle: { color: '#e2e8f0' } } });
const tooltip = { trigger: 'axis' as const, backgroundColor: '#0f172a', borderWidth: 0, textStyle: { color: '#f8fafc' } };

const emptyOption = (title: string): EChartsOption => ({ title: { text: title, left: 'center', top: 'middle', textStyle: { color: '#94a3b8', fontSize: 16, fontWeight: 'normal' } }, xAxis: { show: false }, yAxis: { show: false }, series: [] });

export const createDefaultChart = (table: DataTable, type: ChartType = 'bar'): ChartConfig => {
  const category = table.columns.find((column) => column.type === 'text' || column.type === 'date')?.id ?? table.columns[0]?.id;
  const numeric = table.columns.filter((column) => column.id !== category && column.type !== 'text' && column.type !== 'date').map((column) => column.id);
  return { id: `chart-${Date.now()}`, title: `${table.name} chart`, type, mapping: { categoryColumnId: category, valueColumnIds: numeric.length ? numeric.slice(0, 3) : table.columns[1] ? [table.columns[1].id] : [] } };
};

export const buildChartOption = (table: DataTable, config: ChartConfig): EChartsOption => {
  if (!table.rows.length || !table.columns.length) return emptyOption('Add data to generate your chart.');
  const selectedIds = config.mapping.valueColumnIds.length ? config.mapping.valueColumnIds : [table.columns[1]?.id].filter(Boolean) as string[];
  const labels = categories(table, config.mapping.categoryColumnId);
  const selectedSeries = selectedIds.map((id) => ({ name: table.columns.find((column) => column.id === id)?.name ?? 'Value', data: cleanValues(values(table, id)) }));
  const first = selectedSeries[0] ?? { name: 'Value', data: [] };
  const common = { animationDuration: 500, color: ['#2563eb', '#f97316', '#10b981', '#a855f7', '#eab308'], tooltip };
  if (!selectedSeries.length) return emptyOption('Map a numeric column to preview this chart.');

  switch (config.type) {
    case 'pie': case 'doughnut': return { ...common, title: { text: config.title, left: 'center' }, tooltip: { trigger: 'item' }, series: [{ type: 'pie', radius: config.type === 'doughnut' ? ['42%', '72%'] : '68%', data: labels.map((name, index) => ({ name, value: first.data[index] })), label: { formatter: '{b}: {d}%' } }] };
    case 'funnel': return { ...common, title: { text: config.title, left: 'center' }, tooltip: { trigger: 'item' }, series: [{ type: 'funnel', left: '10%', width: '80%', minSize: '10%', maxSize: '100%', sort: 'descending', data: labels.map((name, index) => ({ name, value: first.data[index] })) }] };
    case 'gauge': return { ...common, title: { text: config.title, left: 'center' }, series: [{ type: 'gauge', progress: { show: true }, detail: { valueAnimation: true, formatter: '{value}' }, data: [{ value: first.data[0] ?? 0, name: first.name }] }] };
    case 'radar': return { ...common, title: { text: config.title, left: 'center' }, tooltip: { trigger: 'item' }, radar: { indicator: labels.map((name) => ({ name, max: Math.max(...selectedSeries.flatMap((series) => series.data), 1) })) }, series: [{ type: 'radar', data: selectedSeries.map((series) => ({ name: series.name, value: series.data })) }] };
    case 'polar-area': return { ...common, title: { text: config.title, left: 'center' }, angleAxis: { type: 'category', data: labels }, radiusAxis: {}, polar: {}, tooltip, series: [{ type: 'bar', coordinateSystem: 'polar', data: first.data, name: first.name }] };
    case 'scatter': return { ...common, title: { text: config.title, left: 'center' }, tooltip, xAxis: axis(table.columns.find((column) => column.id === config.mapping.xColumnId)?.name ?? 'X', 'value'), yAxis: axis(table.columns.find((column) => column.id === config.mapping.yColumnId)?.name ?? first.name, 'value'), series: [{ type: 'scatter', data: table.rows.map((row) => [toNumber(row[columnIndex(table, config.mapping.xColumnId)]), toNumber(row[columnIndex(table, config.mapping.yColumnId)])]).filter(([x, y]) => x !== null && y !== null) }] };
    case 'bubble': return { ...common, title: { text: config.title, left: 'center' }, tooltip, xAxis: axis('X', 'value'), yAxis: axis('Y', 'value'), series: [{ type: 'scatter', data: table.rows.map((row) => { const x = toNumber(row[columnIndex(table, config.mapping.xColumnId)]); const y = toNumber(row[columnIndex(table, config.mapping.yColumnId)]); const size = toNumber(row[columnIndex(table, config.mapping.sizeColumnId)]) ?? 10; return { value: [x, y], symbolSize: Math.max(8, Math.min(60, size / 2)) }; }).filter((point) => point.value[0] !== null && point.value[1] !== null) }] };
    case 'histogram': {
      const numbers = values(table, config.mapping.xColumnId ?? selectedIds[0]).filter((value): value is number => value !== null);
      if (!numbers.length) return emptyOption('Map a numeric column to preview this chart.');
      const minimum = Math.min(...numbers); const maximum = Math.max(...numbers); const size = (maximum - minimum || 1) / 6;
      const bins = Array.from({ length: 6 }, (_, index) => numbers.filter((value) => value >= minimum + index * size && (index === 5 || value < minimum + (index + 1) * size)).length);
      return { ...common, title: { text: config.title, left: 'center' }, tooltip, xAxis: axis('Range'), yAxis: axis('Frequency', 'value'), series: [{ type: 'bar', data: bins, barWidth: '98%' }] };
    }
    case 'box-plot': { const sorted = first.data.slice().sort((a, b) => a - b); const percentile = (ratio: number) => sorted[Math.floor((sorted.length - 1) * ratio)] ?? 0; return { ...common, title: { text: config.title, left: 'center' }, tooltip, xAxis: axis(first.name), yAxis: axis('Value', 'value'), series: [{ type: 'boxplot', data: [[sorted[0] ?? 0, percentile(0.25), percentile(0.5), percentile(0.75), sorted[sorted.length - 1] ?? 0]] }] }; }
    case 'horizontal-bar': return { ...common, title: { text: config.title, left: 'center' }, tooltip, xAxis: axis('Value', 'value'), yAxis: { ...axis('Category'), data: labels }, series: selectedSeries.map((series) => ({ type: 'bar', name: series.name, data: series.data })) };
    case 'stacked-bar': case 'stacked-area': return { ...common, title: { text: config.title, left: 'center' }, tooltip, legend: { top: 30 }, xAxis: { ...axis(config.mapping.categoryColumnId ? table.columns.find((column) => column.id === config.mapping.categoryColumnId)?.name ?? 'Category' : 'Category'), data: labels }, yAxis: axis('Value', 'value'), series: selectedSeries.map((series) => ({ type: config.type === 'stacked-area' ? 'line' : 'bar', name: series.name, stack: 'total', areaStyle: config.type === 'stacked-area' ? {} : undefined, data: series.data })) };
    case 'combo': return { ...common, title: { text: config.title, left: 'center' }, tooltip, legend: { top: 30 }, xAxis: { ...axis('Category'), data: labels }, yAxis: axis('Value', 'value'), series: selectedSeries.map((series, index) => ({ type: index === 0 ? 'bar' : 'line', name: series.name, data: series.data, smooth: index > 0 })) };
    default: return { ...common, title: { text: config.title, left: 'center' }, tooltip, legend: selectedSeries.length > 1 ? { top: 30 } : undefined, xAxis: { ...axis('Category'), data: labels }, yAxis: axis('Value', 'value'), series: selectedSeries.map((series) => ({ type: config.type === 'area' ? 'line' : 'bar', name: series.name, data: series.data, smooth: config.type === 'line' || config.type === 'area', areaStyle: config.type === 'area' ? {} : undefined })) as EChartsOption['series'] };
  }
};