import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChartConfig, ChartMapping, ChartType } from '@/types';

interface ChartState {
  currentChart: ChartConfig | null;
  past: ChartConfig[];
  future: ChartConfig[];
  setCurrentChart: (chart: ChartConfig | null) => void;
  updateCurrentChart: (updates: Partial<ChartConfig>) => void;
  setChartType: (type: ChartType) => void;
  updateMapping: (mapping: Partial<ChartMapping>) => void;
  duplicate: () => void;
  reset: (chart: ChartConfig) => void;
  undo: () => void;
  redo: () => void;
}

const commit = (state: ChartState, chart: ChartConfig) => ({ currentChart: chart, past: state.currentChart ? [...state.past, state.currentChart].slice(-30) : state.past, future: [] });
export const useChartStore = create<ChartState>()(persist((set) => ({
  currentChart: null, past: [], future: [],
  setCurrentChart: (chart) => set({ currentChart: chart, past: [], future: [] }),
  updateCurrentChart: (updates) => set((state) => state.currentChart ? commit(state, { ...state.currentChart, ...updates }) : state),
  setChartType: (type) => set((state) => state.currentChart ? commit(state, { ...state.currentChart, type }) : state),
  updateMapping: (mapping) => set((state) => state.currentChart ? commit(state, { ...state.currentChart, mapping: { ...state.currentChart.mapping, ...mapping } }) : state),
  duplicate: () => set((state) => state.currentChart ? { ...commit(state, { ...state.currentChart, id: `chart-${Date.now()}`, title: `${state.currentChart.title} copy` }), currentChart: { ...state.currentChart, id: `chart-${Date.now()}`, title: `${state.currentChart.title} copy` } } : state),
  reset: (chart) => set((state) => state.currentChart ? commit(state, chart) : { currentChart: chart, past: [], future: [] }),
  undo: () => set((state) => { const chart = state.past[state.past.length - 1]; return chart ? { currentChart: chart, past: state.past.slice(0, -1), future: state.currentChart ? [state.currentChart, ...state.future] : state.future } : state; }),
  redo: () => set((state) => { const chart = state.future[0]; return chart ? { currentChart: chart, past: state.currentChart ? [...state.past, state.currentChart] : state.past, future: state.future.slice(1) } : state; }),
}), { name: 'chartgen-chart-config' }));
