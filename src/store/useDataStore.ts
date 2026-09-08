import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sampleDatasets } from '@/constants/sampleDatasets';
import { DataCell, DataTable } from '@/types';

export type CellAddress = { row: number; column: number };
interface Snapshot { table: DataTable; selected: string[]; }
interface DataState {
  table: DataTable; selectedCells: CellAddress[]; past: Snapshot[]; future: Snapshot[];
  selectCell: (cell: CellAddress, additive?: boolean) => void; editCell: (row: number, column: number, value: DataCell) => void;
  addRow: () => void; deleteRows: () => void; addColumn: () => void; deleteColumn: () => void; deleteColumnAt: (column: number) => void;
  renameColumn: (column: number, name: string) => void; clearSelected: () => void; clearData: () => void;
  loadTable: (table: DataTable) => void; undo: () => void; redo: () => void;
}
const key = (cell: CellAddress) => `${cell.row}:${cell.column}`;
const snapshot = (state: DataState): Snapshot => ({ table: state.table, selected: state.selectedCells.map(key) });
const restoreSelection = (keys: string[]): CellAddress[] => keys.map((value) => { const [row, column] = value.split(':').map(Number); return { row, column }; });

export const useDataStore = create<DataState>()(persist((set) => ({
  table: sampleDatasets[0], selectedCells: [], past: [], future: [],
  selectCell: (cell, additive = false) => set((state) => ({ selectedCells: additive ? [...state.selectedCells.filter((item) => key(item) !== key(cell)), cell] : [cell] })),
  editCell: (row, column, value) => set((state) => ({ table: { ...state.table, rows: state.table.rows.map((current, rowIndex) => rowIndex === row ? current.map((item, columnIndex) => columnIndex === column ? value : item) : current) }, past: [...state.past, snapshot(state)].slice(-50), future: [] })),
  addRow: () => set((state) => ({ table: { ...state.table, rows: [...state.table.rows, state.table.columns.map(() => '')] }, past: [...state.past, snapshot(state)].slice(-50), future: [] })),
  deleteRows: () => set((state) => { const indexes = new Set(state.selectedCells.map((cell) => cell.row)); if (!indexes.size) return state; return { table: { ...state.table, rows: state.table.rows.filter((_, index) => !indexes.has(index)) }, selectedCells: [], past: [...state.past, snapshot(state)].slice(-50), future: [] }; }),
  addColumn: () => set((state) => ({ table: { ...state.table, columns: [...state.table.columns, { id: `column-${Date.now()}`, name: `Column ${state.table.columns.length + 1}`, type: 'text' },], rows: state.table.rows.map((row) => [...row, '']) }, past: [...state.past, snapshot(state)].slice(-50), future: [] })),
  deleteColumn: () => set((state) => { const columns = new Set(state.selectedCells.map((cell) => cell.column)); if (!columns.size) return state; return { table: { ...state.table, columns: state.table.columns.filter((_, index) => !columns.has(index)), rows: state.table.rows.map((row) => row.filter((_, index) => !columns.has(index))) }, selectedCells: [], past: [...state.past, snapshot(state)].slice(-50), future: [] }; }),
  deleteColumnAt: (column) => set((state) => ({ table: { ...state.table, columns: state.table.columns.filter((_, index) => index !== column), rows: state.table.rows.map((row) => row.filter((_, index) => index !== column)) }, selectedCells: [], past: [...state.past, snapshot(state)].slice(-50), future: [] })),
  renameColumn: (column, name) => set((state) => { const trimmed = name.trim(); if (!trimmed || state.table.columns.some((item, index) => index !== column && item.name.toLowerCase() === trimmed.toLowerCase())) return state; return { table: { ...state.table, columns: state.table.columns.map((item, index) => index === column ? { ...item, name: trimmed } : item) }, past: [...state.past, snapshot(state)].slice(-50), future: [] }; }),
  clearSelected: () => set((state) => { if (!state.selectedCells.length) return state; const cells = new Set(state.selectedCells.map(key)); return { table: { ...state.table, rows: state.table.rows.map((row, rowIndex) => row.map((value, columnIndex) => cells.has(key({ row: rowIndex, column: columnIndex })) ? '' : value)) }, past: [...state.past, snapshot(state)].slice(-50), future: [] }; }),
  clearData: () => set((state) => ({ table: { ...state.table, rows: [] }, selectedCells: [], past: [...state.past, snapshot(state)].slice(-50), future: [] })),
  loadTable: (table) => set((state) => ({ table, selectedCells: [], past: [...state.past, snapshot(state)].slice(-50), future: [] })),
  undo: () => set((state) => { const previous = state.past[state.past.length - 1]; if (!previous) return state; return { table: previous.table, selectedCells: restoreSelection(previous.selected), past: state.past.slice(0, -1), future: [snapshot(state), ...state.future].slice(0, 50) }; }),
  redo: () => set((state) => { const next = state.future[0]; if (!next) return state; return { table: next.table, selectedCells: restoreSelection(next.selected), past: [...state.past, snapshot(state)].slice(-50), future: state.future.slice(1) }; }),
}), { name: 'chartgen-data-workspace' }));