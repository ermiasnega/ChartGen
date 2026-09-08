import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChartConfig, ChartCustomization, ChartMapping, ChartType, SeriesCustomization } from '@/types';
import { createDefaultCustomization, customizationPresets } from '@/utils/chartOptions';

interface ChartState {
  currentChart: ChartConfig | null;
  past: ChartConfig[];
  future: ChartConfig[];
  savedPresets: Record<string, ChartCustomization>;
  setCurrentChart: (chart: ChartConfig | null) => void;
  updateCurrentChart: (updates: Partial<ChartConfig>) => void;
  setChartType: (type: ChartType) => void;
  updateMapping: (mapping: Partial<ChartMapping>) => void;
  updateCustomization: (updates: Partial<ChartCustomization>) => void;
  updateSeries: (id: string, updates: Partial<SeriesCustomization>) => void;
  applyPreset: (name: string) => void;
  resetCustomization: () => void;
  savePreset: (name: string) => void;
  duplicate: () => void;
  reset: (chart: ChartConfig) => void;
  undo: () => void;
  redo: () => void;
}

const commit = (state: ChartState, chart: ChartConfig) => ({ currentChart: chart, past: state.currentChart ? [...state.past, state.currentChart].slice(-30) : state.past, future: [] });
export const useChartStore = create<ChartState>()(persist((set) => ({
  currentChart: null, past: [], future: [], savedPresets: {},
  setCurrentChart: (chart) => set({ currentChart: chart, past: [], future: [] }),
  updateCurrentChart: (updates) => set((state) => state.currentChart ? commit(state, { ...state.currentChart, ...updates }) : state),
  setChartType: (type) => set((state) => state.currentChart ? commit(state, { ...state.currentChart, type }) : state),
  updateMapping: (mapping) => set((state) => state.currentChart ? commit(state, { ...state.currentChart, mapping: { ...state.currentChart.mapping, ...mapping } }) : state),
  updateCustomization: (updates) => set((state) => state.currentChart ? commit(state, { ...state.currentChart, customization: { ...state.currentChart.customization, ...updates, typography: { ...state.currentChart.customization.typography, ...(updates.typography ?? {}) }, margins: { ...state.currentChart.customization.margins, ...(updates.margins ?? {}) }, xAxis: { ...state.currentChart.customization.xAxis, ...(updates.xAxis ?? {}) }, yAxis: { ...state.currentChart.customization.yAxis, ...(updates.yAxis ?? {}) }, legend: { ...state.currentChart.customization.legend, ...(updates.legend ?? {}) }, grid: { ...state.currentChart.customization.grid, ...(updates.grid ?? {}) }, dataLabels: { ...state.currentChart.customization.dataLabels, ...(updates.dataLabels ?? {}) }, specific: { ...state.currentChart.customization.specific, ...(updates.specific ?? {}) } } }) : state),
  updateSeries: (id, updates) => set((state) => state.currentChart ? commit(state, { ...state.currentChart, customization: { ...state.currentChart.customization, series: { ...state.currentChart.customization.series, [id]: { ...state.currentChart.customization.series[id], ...updates } } } }) : state),
  applyPreset: (name) => set((state) => { if (!state.currentChart) return state; const preset = state.savedPresets[name] ?? customizationPresets[name]; if (!preset) return state; const colors = preset.colors ?? state.currentChart.customization.colors; const series = Object.fromEntries(Object.entries(state.currentChart.customization.series).map(([id, style], index) => [id, { ...style, color: colors[index % colors.length] }])) as Record<string, SeriesCustomization>; const customization: ChartCustomization = { ...state.currentChart.customization, ...preset, colors, series }; return commit(state, { ...state.currentChart, customization }); }),
  resetCustomization: () => set((state) => state.currentChart ? commit(state, { ...state.currentChart, customization: createDefaultCustomization(state.currentChart.dataset) }) : state),
  savePreset: (name) => set((state) => state.currentChart && name.trim() ? { savedPresets: { ...state.savedPresets, [name.trim()]: state.currentChart.customization } } : state),
  duplicate: () => set((state) => state.currentChart ? { ...commit(state, { ...state.currentChart, id: `chart-${Date.now()}`, title: `${state.currentChart.title} copy` }), currentChart: { ...state.currentChart, id: `chart-${Date.now()}`, title: `${state.currentChart.title} copy` } } : state),
  reset: (chart) => set((state) => state.currentChart ? commit(state, chart) : { currentChart: chart, past: [], future: [] }),
  undo: () => set((state) => { const chart = state.past[state.past.length - 1]; return chart ? { currentChart: chart, past: state.past.slice(0, -1), future: state.currentChart ? [state.currentChart, ...state.future] : state.future } : state; }),
  redo: () => set((state) => { const chart = state.future[0]; return chart ? { currentChart: chart, past: state.currentChart ? [...state.past, state.currentChart] : state.past, future: state.future.slice(1) } : state; }),
}), { name: 'chartgen-chart-config' }));
