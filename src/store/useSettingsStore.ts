import { create } from 'zustand';
import { ChartType } from '@/types';

export interface AppSettings {
  appearance: 'light' | 'dark' | 'system';
  defaultChartType: ChartType;
  defaultWidth: number;
  defaultHeight: number;
  autosave: boolean;
  showGrid: boolean;
  defaultExportFormat: 'png' | 'jpeg' | 'svg' | 'pdf' | 'csv';
  defaultExportWidth: number;
  defaultExportHeight: number;
  defaultExportQuality: number;
  keepSampleDataset: boolean;
}
const defaults: AppSettings = { appearance: 'system', defaultChartType: 'bar', defaultWidth: 1200, defaultHeight: 700, autosave: true, showGrid: true, defaultExportFormat: 'png', defaultExportWidth: 1200, defaultExportHeight: 700, defaultExportQuality: 0.92, keepSampleDataset: true };
const read = (): AppSettings => { try { return { ...defaults, ...(JSON.parse(localStorage.getItem('chartgen-settings') ?? '{}') as Partial<AppSettings>) }; } catch { return defaults; } };
export const useSettingsStore = create<{ settings: AppSettings; update: (updates: Partial<AppSettings>) => void; reset: () => void }>((set) => ({ settings: read(), update: (updates) => set((state) => { const settings = { ...state.settings, ...updates }; localStorage.setItem('chartgen-settings', JSON.stringify(settings)); return { settings }; }), reset: () => { localStorage.setItem('chartgen-settings', JSON.stringify(defaults)); set({ settings: defaults }); } }));
