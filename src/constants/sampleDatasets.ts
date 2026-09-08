import { DataTable } from '@/types';

const dataset = (id: string, name: string, columns: [string, DataTable['columns'][number]['type']][], rows: string[][]): DataTable => ({
  id,
  name,
  columns: columns.map(([columnName, type], index) => ({ id: `${id}-${index}`, name: columnName, type })),
  rows,
});

export const sampleDatasets: DataTable[] = [
  dataset('monthly-sales', 'Monthly Sales', [['Month', 'text'], ['Sales', 'integer'], ['Revenue', 'integer'], ['Profit', 'integer']], [['January', '120', '4500', '1200'], ['February', '180', '6200', '1900'], ['March', '240', '8100', '2700'], ['April', '220', '7600', '2450'], ['May', '290', '9400', '3200']]),
  dataset('website-traffic', 'Website Traffic', [['Month', 'text'], ['Visitors', 'integer'], ['Bounce Rate', 'percentage'], ['Conversions', 'integer']], [['January', '12500', '42%', '380'], ['February', '14800', '39%', '465'], ['March', '17600', '36%', '590'], ['April', '19800', '34%', '710']]),
  dataset('student-performance', 'Student Performance', [['Student', 'text'], ['Math', 'integer'], ['Reading', 'integer'], ['Writing', 'integer']], [['Avery', '88', '92', '86'], ['Jordan', '76', '84', '80'], ['Morgan', '95', '89', '93'], ['Riley', '82', '78', '85']]),
  dataset('population', 'Population', [['Country', 'text'], ['Population', 'integer'], ['Growth', 'percentage']], [['United States', '334900000', '0.5%'], ['India', '1428000000', '0.8%'], ['Brazil', '216400000', '0.6%'], ['Japan', '124600000', '-0.4%']]),
  dataset('revenue-profit', 'Revenue & Profit', [['Quarter', 'text'], ['Revenue', 'decimal'], ['Expenses', 'decimal'], ['Profit Margin', 'percentage']], [['Q1 2024', '125000.50', '83000.25', '33.6%'], ['Q2 2024', '148500.00', '91000.00', '38.7%'], ['Q3 2024', '172250.75', '102400.50', '40.6%']]),
  dataset('marketing-campaign', 'Marketing Campaign', [['Campaign', 'text'], ['Start Date', 'date'], ['Spend', 'decimal'], ['Leads', 'integer']], [['Spring Launch', '2024-03-01', '12000.00', '420'], ['Product Webinar', '2024-04-15', '7600.00', '285'], ['Summer Retargeting', '2024-06-01', '15400.00', '610']]),
];