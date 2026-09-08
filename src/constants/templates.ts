import { ChartTemplate } from '@/types';
import { sampleDatasets } from './sampleDatasets';
import { createDefaultChart } from '@/utils/chartOptions';

const template = (id: string, name: string, category: ChartTemplate['category'], description: string, datasetId: string, type: Parameters<typeof createDefaultChart>[1]): ChartTemplate => {
  const dataset = sampleDatasets.find((item) => item.id === datasetId) ?? sampleDatasets[0];
  const chart = createDefaultChart(dataset, type);
  return { id, name, category, description, chart: { ...chart, title: name, dataset } };
};

export const chartTemplates: ChartTemplate[] = [
  template('sales-performance', 'Sales Performance', 'Business', 'Track revenue, sales, and profit together.', 'monthly-sales', 'bar'),
  template('executive-revenue', 'Executive Revenue', 'Finance', 'A clear quarterly revenue and margin view.', 'revenue-profit', 'combo'),
  template('student-outcomes', 'Student Outcomes', 'Education', 'Compare learning outcomes across students.', 'student-performance', 'radar'),
  template('campaign-funnel', 'Campaign Funnel', 'Marketing', 'Visualize campaign stages and conversion volume.', 'marketing-campaign', 'funnel'),
  template('traffic-overview', 'Traffic Overview', 'Analytics', 'Monitor visitors and conversions over time.', 'website-traffic', 'line'),
  template('report-summary', 'Report Summary', 'Presentation', 'A polished chart for a presentation slide.', 'revenue-profit', 'doughnut'),
  template('minimal-trend', 'Minimal Trend', 'Minimal', 'A restrained trend chart for focused reporting.', 'monthly-sales', 'area'),
  template('dark-kpi', 'Dark KPI', 'Dark', 'A high-contrast KPI gauge for dashboards.', 'website-traffic', 'gauge'),
];
