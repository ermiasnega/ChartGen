import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { BarChart3, ChevronDown, Copy, Expand, Filter, Gauge, GitBranch, LayoutGrid, LineChart, PieChart, Radar, Redo2, RotateCcw, Save, Search, ScatterChart, SlidersHorizontal, Table2, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { CustomizationSidebar } from '@/components/chart/CustomizationSidebar';
import { sampleDatasets } from '@/constants/sampleDatasets';
import { useChartStore, useDataStore, useProjectStore } from '@/store';
import { ChartType, DataColumn } from '@/types';
import { buildChartOption, chartTypeGroups, createDefaultChart, createDefaultCustomization } from '@/utils/chartOptions';
import clsx from 'clsx';

const chartIcons: Record<ChartType, typeof BarChart3> = { bar: BarChart3, 'horizontal-bar': BarChart3, line: LineChart, area: LineChart, pie: PieChart, doughnut: PieChart, scatter: ScatterChart, histogram: LayoutGrid, 'box-plot': LayoutGrid, radar: Radar, 'polar-area': Radar, bubble: ScatterChart, funnel: Filter, gauge: Gauge, combo: GitBranch, 'stacked-bar': BarChart3, 'stacked-area': LineChart };
const allTypes = chartTypeGroups.flatMap((group) => group.types);
const isChartType = (value: string | null): value is ChartType => allTypes.some((item) => item.id === value);
const numericColumns = (columns: DataColumn[]) => columns.filter((column) => column.type !== 'text' && column.type !== 'date');

export const NewChart = () => {
  const [searchParams] = useSearchParams();
  const { table, loadTable } = useDataStore();
  const { projects, hydrated, hydrate, updateChart } = useProjectStore();
  const { currentChart, past, future, setCurrentChart, setChartType, updateCurrentChart, updateMapping, updateCustomization, updateSeries, applyPreset, resetCustomization, savePreset, duplicate, reset, undo, redo } = useChartStore();
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [mobileCustomize, setMobileCustomize] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const chart = currentChart;
  const projectId = searchParams.get('projectId');
  const chartId = searchParams.get('chartId');
  const project = projects.find((item) => item.id === projectId);
  const numeric = numericColumns(table.columns);
  const categoryColumns = table.columns.filter((column) => column.type === 'text' || column.type === 'date');
  const filteredGroups = useMemo(() => chartTypeGroups.map((group) => ({ ...group, types: group.types.filter((item) => item.label.toLowerCase().includes(search.toLowerCase())) })).filter((group) => group.types.length), [search]);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrate, hydrated]);

  useEffect(() => {
    const savedChart = project?.charts.find((item) => item.id === chartId);
    if (savedChart && currentChart?.id !== savedChart.id) {
      setCurrentChart(savedChart);
      if (savedChart.dataset) loadTable(savedChart.dataset);
    }
  }, [chartId, currentChart?.id, loadTable, project, setCurrentChart]);

  useEffect(() => {
    const requestedType = searchParams.get('type');
    if (!currentChart) setCurrentChart(createDefaultChart(table, isChartType(requestedType) ? requestedType : 'bar'));
    else if (!currentChart.customization) setCurrentChart({ ...currentChart, customization: createDefaultCustomization(table), dataset: table });
    else if (isChartType(requestedType) && currentChart.type !== requestedType) setChartType(requestedType);
    else if (currentChart.dataset?.id !== table.id) updateCurrentChart({ dataset: table });
  }, [currentChart, searchParams, setChartType, setCurrentChart, table, updateCurrentChart]);

  useEffect(() => {
    if (projectId && chart && useProjectStore.getState().projects.some((item) => item.id === projectId && item.charts.some((savedChart) => savedChart.id === chart.id))) updateChart(projectId, { ...chart, dataset: table });
  }, [chart, projectId, table, updateChart]);

  if (!chart) return null;
  const option = buildChartOption(table, chart);
  const enterFullscreen = async () => { if (!previewRef.current) return; if (!document.fullscreenElement) await previewRef.current.requestFullscreen(); else await document.exitFullscreen(); setFullscreen(Boolean(document.fullscreenElement)); };
  const changeValues = (columnId: string) => updateMapping({ valueColumnIds: chart.mapping.valueColumnIds.includes(columnId) ? chart.mapping.valueColumnIds.filter((id) => id !== columnId) : [...chart.mapping.valueColumnIds, columnId] });
  const customization = <CustomizationSidebar chart={chart} columns={table.columns} updateCustomization={updateCustomization} updateSeries={updateSeries} applyPreset={applyPreset} resetCustomization={resetCustomization} savePreset={savePreset} />;
  const mapping = <div className="space-y-5"><div><label className="mb-2 block text-sm font-medium">Category / X-axis</label><Select value={chart.mapping.categoryColumnId ?? ''} columns={categoryColumns.length ? categoryColumns : table.columns} onChange={(value) => updateMapping({ categoryColumnId: value, xColumnId: value })} /></div>{(chart.type === 'scatter' || chart.type === 'bubble') && <><Field label="X value"><Select value={chart.mapping.xColumnId ?? numeric[0]?.id ?? ''} columns={numeric} onChange={(value) => updateMapping({ xColumnId: value })} /></Field><Field label="Y value"><Select value={chart.mapping.yColumnId ?? numeric[1]?.id ?? numeric[0]?.id ?? ''} columns={numeric} onChange={(value) => updateMapping({ yColumnId: value })} /></Field>{chart.type === 'bubble' && <Field label="Bubble size"><Select value={chart.mapping.sizeColumnId ?? numeric[2]?.id ?? numeric[0]?.id ?? ''} columns={numeric} onChange={(value) => updateMapping({ sizeColumnId: value })} /></Field>}</>}{chart.type !== 'gauge' && chart.type !== 'scatter' && chart.type !== 'bubble' && <div><p className="mb-2 text-sm font-medium">Value series</p><div className="space-y-2">{numeric.map((column) => <label key={column.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={chart.mapping.valueColumnIds.includes(column.id)} onChange={() => changeValues(column.id)} className="h-4 w-4 accent-accent" />{column.name}<span className="ml-auto text-[10px] uppercase text-muted-foreground">{column.type}</span></label>)}</div></div>}<div className="rounded-md border border-border bg-background p-3 text-xs text-muted-foreground"><div className="flex items-center gap-2 font-medium text-foreground"><Table2 className="h-3.5 w-3.5" />{table.name}</div><p className="mt-2">{table.rows.length} rows · {table.columns.length} columns</p><Link to="/data" className="mt-3 inline-flex items-center text-accent hover:underline">Edit source data <ChevronDown className="ml-1 h-3 w-3 -rotate-90" /></Link></div></div>;

  return <div className={clsx('flex min-h-[calc(100vh-10rem)] flex-col gap-4', fullscreen && 'bg-background p-6')}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Chart studio</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Build a chart from your data</h1></div><div className="flex flex-wrap gap-2"><Button variant="ghost" size="sm" disabled={!past.length} onClick={undo} title="Undo"><Undo2 className="h-4 w-4" /></Button><Button variant="ghost" size="sm" disabled={!future.length} onClick={redo} title="Redo"><Redo2 className="h-4 w-4" /></Button><Button variant="outline" size="sm" onClick={duplicate}><Copy className="mr-2 h-4 w-4" />Duplicate</Button><Button variant="outline" size="sm" onClick={enterFullscreen}><Expand className="mr-2 h-4 w-4" />{fullscreen ? 'Exit full screen' : 'Full screen'}</Button><Button variant="outline" size="sm" className="xl:hidden" onClick={() => setMobileCustomize(true)}><SlidersHorizontal className="mr-2 h-4 w-4" />Customize</Button><Button size="sm" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2200); }}><Save className="mr-2 h-4 w-4" />{saved ? 'Saved' : 'Save'}</Button></div></div>
    <div className="grid min-h-[660px] flex-1 grid-cols-1 overflow-hidden rounded-lg border border-border bg-card shadow-sm xl:grid-cols-[220px_minmax(0,1fr)_320px]">
      <aside className="order-2 border-t border-border bg-secondary/20 p-4 xl:order-1 xl:border-r xl:border-t-0"><div className="mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-accent" /><h2 className="font-semibold">Chart types</h2></div><label className="relative block"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search charts" className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" aria-label="Search chart types" /></label><div className="mt-4 max-h-[520px] space-y-5 overflow-y-auto pr-1">{filteredGroups.map((group) => <section key={group.name}><h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{group.name}</h3><div className="space-y-1">{group.types.map((item) => { const Icon = chartIcons[item.id]; return <button key={item.id} onClick={() => setChartType(item.id)} className={clsx('flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors', chart.type === item.id ? 'bg-accent text-accent-foreground' : 'hover:bg-secondary')}><Icon className="h-4 w-4 shrink-0" /><span>{item.label}</span></button>; })}</div></section>)}</div></aside>
      <main ref={previewRef} className="order-1 flex min-h-[520px] flex-col bg-background p-4 sm:p-6 xl:order-2"><div className="flex items-center justify-between gap-3 border-b border-border pb-4"><div><input value={chart.title} onChange={(event) => updateCurrentChart({ title: event.target.value })} className="w-full bg-transparent text-lg font-semibold outline-none" aria-label="Chart title" /><p className="mt-1 text-xs text-muted-foreground">Live preview · {table.name}</p></div><button onClick={() => reset(createDefaultChart(table, chart.type))} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" title="Reset chart" aria-label="Reset chart"><RotateCcw className="h-4 w-4" /></button></div>{table.rows.length ? <div className="min-h-0 flex-1"><ReactECharts option={option} notMerge lazyUpdate style={{ height: chart.customization.height, minHeight: 480, width: `${chart.customization.width}%` }} opts={{ renderer: 'canvas' }} /></div> : <EmptyChart onUseSample={() => loadTable(sampleDatasets[0])} />}</main>
      <aside className="order-3 hidden overflow-y-auto border-t border-border bg-secondary/10 p-5 xl:block xl:border-l xl:border-t-0"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Data mapping</h2><p className="mt-1 text-xs text-muted-foreground">Choose fields, then customize appearance.</p></div><GitBranch className="h-4 w-4 text-accent" /></div>{mapping}<div className="my-5 border-t border-border" />{customization}</aside>
    </div>
    {mobileCustomize && <div className="fixed inset-0 z-[70] xl:hidden"><button className="absolute inset-0 bg-black/40" onClick={() => setMobileCustomize(false)} aria-label="Close customization drawer" /><div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-xl border border-border bg-card p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Customize chart</h2><button onClick={() => setMobileCustomize(false)} aria-label="Close customization"><X className="h-5 w-5" /></button></div>{mapping}<div className="my-5 border-t border-border" />{customization}</div></div>}
  </div>;
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => <label className="block"><span className="mb-2 block text-sm font-medium">{label}</span>{children}</label>;
const Select = ({ value, columns, onChange }: { value: string; columns: DataColumn[]; onChange: (value: string) => void }) => <div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring"><option value="">Select a column</option>{columns.map((column) => <option key={column.id} value={column.id}>{column.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" /></div>;
const EmptyChart = ({ onUseSample }: { onUseSample: () => void }) => <div className="flex flex-1 flex-col items-center justify-center text-center"><div className="rounded-full bg-accent/10 p-4"><BarChart3 className="h-8 w-8 text-accent" /></div><h2 className="mt-4 text-lg font-semibold">Add data to generate your chart.</h2><p className="mt-2 max-w-sm text-muted-foreground">Connect a dataset, import a file, or use a sample to start building your visualization.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Link to="/data"><Button><Table2 className="mr-2 h-4 w-4" />Enter data</Button></Link><Button variant="outline" onClick={onUseSample}><Save className="mr-2 h-4 w-4" />Use sample data</Button></div></div>;
