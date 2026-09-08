import { DataCell, DataColumn, DataTable, DataType } from '@/types';

export interface ParseResult { table?: DataTable; error?: string; }

const normalizeHeader = (value: string, index: number) => value.trim() || `Column ${index + 1}`;

export const inferType = (values: DataCell[]): DataType => {
  const populated = values.map((value) => value.trim()).filter(Boolean);
  if (!populated.length) return 'text';
  if (populated.every((value) => /^-?\d+$/.test(value))) return 'integer';
  if (populated.every((value) => /^-?(?:\d+\.?\d*|\.\d+)%$/.test(value))) return 'percentage';
  if (populated.every((value) => /^-?(?:\d+\.?\d*|\.\d+)$/.test(value))) return 'decimal';
  if (populated.every((value) => !Number.isNaN(Date.parse(value)) && /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(value))) return 'date';
  return 'text';
};

export const createTable = (name: string, headers: string[], rows: string[][]): DataTable => ({
  id: `dataset-${Date.now()}`,
  name,
  columns: headers.map((header, index): DataColumn => ({ id: `column-${Date.now()}-${index}`, name: header, type: inferType(rows.map((row) => row[index] ?? '')) })),
  rows,
});

export const parseCsv = (input: string, name = 'Imported CSV'): ParseResult => {
  if (!input.trim()) return { error: 'The CSV file is empty.' };
  const records: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') { if (quoted && input[index + 1] === '"') { cell += '"'; index += 1; } else quoted = !quoted; }
    else if (character === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) { if (character === '\r' && input[index + 1] === '\n') index += 1; row.push(cell); cell = ''; if (row.some((value) => value.trim())) records.push(row); row = []; }
    else cell += character;
  }
  if (quoted) return { error: 'Invalid CSV: an opening quote is not closed.' };
  if (cell || row.length) { row.push(cell); if (row.some((value) => value.trim())) records.push(row); }
  if (!records.length) return { error: 'The CSV file contains no rows.' };
  const width = Math.max(...records.map((record) => record.length));
  const headers = records[0].map(normalizeHeader);
  while (headers.length < width) headers.push(`Column ${headers.length + 1}`);
  const duplicate = headers.find((header, index) => headers.indexOf(header) !== index);
  if (duplicate) return { error: `Duplicate column name: “${duplicate}”.` };
  return { table: createTable(name, headers, records.slice(1).map((record) => Array.from({ length: width }, (_, index) => record[index] ?? ''))) };
};

export const parseJson = (input: string, name = 'Imported JSON'): ParseResult => {
  if (!input.trim()) return { error: 'The JSON file is empty.' };
  try {
    const value: unknown = JSON.parse(input);
    if (!Array.isArray(value) || !value.length || value.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) return { error: 'JSON must be a non-empty array of objects.' };
    const headers = Array.from(new Set(value.flatMap((item) => Object.keys(item as Record<string, unknown>))));
    if (!headers.length) return { error: 'JSON objects do not contain any columns.' };
    const rows = value.map((item) => headers.map((header) => { const cell = (item as Record<string, unknown>)[header]; return cell === null || cell === undefined ? '' : typeof cell === 'object' ? JSON.stringify(cell) : String(cell); }));
    return { table: createTable(name, headers, rows) };
  } catch { return { error: 'Invalid JSON. Check the file syntax and try again.' }; }
};