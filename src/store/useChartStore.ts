import { create } from 'zustand';
import { ChartConfig } from '@/types';

interface ChartState {
  currentChart: ChartConfig | null;
  setCurrentChart: (chart: ChartConfig | null) => void;
  updateCurrentChart: (updates: Partial<ChartConfig>) => void;
}

const initialChart: ChartConfig = {
  id: 'new-chart',
  title: 'Untitled Chart',
  type: 'bar',
  data: {
    categories: ['Category 1', 'Category 2', 'Category 3'],
    series: [
      {
        name: 'Series 1',
        data: [10, 20, 30],
      },
    ],
  },
};

export const useChartStore = create<ChartState>((set) => ({
  currentChart: null,
  setCurrentChart: (chart) => set({ currentChart: chart }),
  updateCurrentChart: (updates) =>
    set((state) => ({
      currentChart: state.currentChart
        ? { ...state.currentChart, ...updates }
        : { ...initialChart, ...updates },
    })),
}));
