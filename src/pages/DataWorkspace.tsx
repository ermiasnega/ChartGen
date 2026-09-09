import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState } from 'react';
import { Check, Database, FileJson, FileSpreadsheet, Plus, Redo2, Trash2, Undo2, Upload, X } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { Link } from 'react-router-dom';
import { sampleDatasets } from '@/constants/sampleDatasets';
import { useDataStore } from '@/store';
import { parseCsv, parseJson } from '@/utils/dataUtils';
import clsx from 'clsx';

const typeLabel: Record<string, string> = { text: 'Text', integer: 'Integer', decimal: 'Decimal', percentage: 'Percentage', date: 'Date' };

export const DataWorkspace = () => {
  const { table, selectedCells, past, future, selectCell, editCell, addRow, deleteRows, addColumn, deleteColumnAt, renameColumn, clearSelected, clearData, loadTable, undo, redo } = useDataStore();
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importKind, setImportKind] = useState<'csv' | 'json'>('csv');
  const [preview, setPreview] = useState<ReturnType<typeof parseCsv>['table']>();
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const selected = (row: number, column: number) => selectedCells.some((cell) => cell.row === row && cell.column === column);

  const importTextData = (text: string, kind = importKind, name = `Imported ${kind.toUpperCase()}`) => {
    const result = kind === 'csv' ? parseCsv(text, name) : parseJson(text, name);
    if (result.error) { setMessage(result.error); return; }
    if (result.table) setPreview(result.table);
  };
  const commitImport = () => { if (preview) { loadTable(preview); setImportText(''); setPreview(undefined); setImportOpen(false); setMessage(`Imported ${preview.rows.length} rows successfully.`); } };
  const handleFile = (file?: File) => {
    if (!file) return;
    const kind = file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv';
    setImportKind(kind);
    const reader = new FileReader();
    reader.onload = () => importTextData(String(reader.result ?? ''), kind, file.name.replace(/\.(csv|json)$/i, ''));
    reader.onerror = () => setMessage('Unable to read that file.');
    reader.readAsText(file);
  };
  const onPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData('text/plain');
    if (!text.includes('\t') && !text.includes('\n')) return;
    event.preventDefault();
    const rows = text.trimEnd().split(/\r?\n/).map((row) => row.split('\t'));
    const start = selectedCells[0] ?? { row: 0, column: 0 };
    rows.forEach((row, rowOffset) => row.forEach((value, columnOffset) => editCell(start.row + rowOffset, start.column + columnOffset, value)));
    setMessage(`Pasted ${rows.length} row${rows.length === 1 ? '' : 's'}.`);
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); handleFile(event.dataTransfer.files[0]); };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, row: number, column: number) => { if (event.key === 'Enter') editCell(row, column, event.currentTarget.value); };

  return <div className="space-y-6" onPaste={onPaste} onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Data workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Shape your source data</h1><p className="mt-2 text-muted-foreground">Edit, validate, and prepare a dataset for your next chart.</p></div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Upload className="mr-2 h-4 w-4" />Import</Button>
        <select className="rounded-md border border-input bg-background px-3 py-1.5 text-sm" value="" onChange={(event) => { const sample = sampleDatasets.find((item) => item.id === event.target.value); if (sample) loadTable(sample); }} aria-label="Load sample dataset"><option value="">Sample dataset</option>{sampleDatasets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <Link to="/charts/new"><Button size="sm" disabled={!table.rows.length || !table.columns.length}><Check className="mr-2 h-4 w-4" />Generate Chart</Button></Link>
      </div>
    </div>
    {message && <div className="flex items-center justify-between rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm"><span>{message}</span><button aria-label="Dismiss message" onClick={() => setMessage('')}><X className="h-4 w-4" /></button></div>}
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/30 px-4 py-3"><div className="flex items-center gap-2"><Database className="h-4 w-4 text-accent" /><span className="font-semibold">{table.name}</span><span className="text-sm text-muted-foreground">{table.rows.length} rows · {table.columns.length} columns</span></div><div className="flex flex-wrap gap-1"><Button variant="ghost" size="sm" disabled={!past.length} onClick={undo} title="Undo"><Undo2 className="h-4 w-4" /></Button><Button variant="ghost" size="sm" disabled={!future.length} onClick={redo} title="Redo"><Redo2 className="h-4 w-4" /></Button><span className="mx-1 border-l border-border" /><Button variant="ghost" size="sm" onClick={addRow}><Plus className="mr-1 h-4 w-4" />Row</Button><Button variant="ghost" size="sm" onClick={addColumn}><Plus className="mr-1 h-4 w-4" />Column</Button><Button variant="ghost" size="sm" disabled={!selectedCells.length} onClick={clearSelected}><Trash2 className="mr-1 h-4 w-4" />Clear</Button><Button variant="ghost" size="sm" onClick={clearData}><X className="mr-1 h-4 w-4" />Empty</Button></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-sm"><thead><tr className="bg-secondary/20"><th className="w-12 border-b border-r border-border px-3 py-3 text-center text-xs text-muted-foreground">#</th>{table.columns.map((column, index) => <th key={column.id} className="min-w-[160px] border-b border-r border-border p-0 text-left"><div className="flex items-center justify-between gap-2 px-3 pt-2"><input className="w-full bg-transparent font-semibold outline-none" value={column.name} onChange={(event) => renameColumn(index, event.target.value)} onBlur={(event) => renameColumn(index, event.target.value)} aria-label={`Rename ${column.name}`} /><button title="Delete column" aria-label={`Delete ${column.name}`} onClick={() => deleteColumnAt(index)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button></div><span className="inline-flex px-3 pb-2 pt-1 text-[10px] font-medium uppercase tracking-wider text-accent">{typeLabel[column.type]}</span></th>)}<th className="w-12 border-b border-border"><button onClick={addColumn} aria-label="Add column" title="Add column"><Plus className="mx-auto h-4 w-4" /></button></th></tr></thead><tbody>{table.rows.map((row, rowIndex) => <tr key={`${table.id}-${rowIndex}`} className="group hover:bg-accent/5"><td className="border-b border-r border-border px-3 py-2 text-center text-xs text-muted-foreground">{rowIndex + 1}</td>{table.columns.map((column, columnIndex) => <td key={column.id} className={clsx('border-b border-r border-border p-0', selected(rowIndex, columnIndex) && 'bg-accent/15 ring-2 ring-inset ring-accent')}><input className="w-full bg-transparent px-3 py-2.5 outline-none" value={row[columnIndex] ?? ''} onFocus={() => selectCell({ row: rowIndex, column: columnIndex })} onChange={(event) => editCell(rowIndex, columnIndex, event.target.value)} onKeyDown={(event) => onKeyDown(event, rowIndex, columnIndex)} aria-label={`${column.name}, row ${rowIndex + 1}`} /></td>) }<td className="border-b border-border" /></tr>)}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground"><span>Click a cell to select it. Paste tabular values directly into the grid.</span><button className="font-medium text-foreground hover:text-accent" onClick={deleteRows} disabled={!selectedCells.length}><Trash2 className="mr-1 inline h-3.5 w-3.5" />Delete selected row</button></div>
    </Card>
    <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]"><Card><CardContent className="p-5"><h2 className="font-semibold">Dataset information</h2><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-muted-foreground">Rows</p><p className="mt-1 text-xl font-semibold">{table.rows.length}</p></div><div><p className="text-muted-foreground">Columns</p><p className="mt-1 text-xl font-semibold">{table.columns.length}</p></div></div></CardContent></Card><Card><CardContent className="p-5"><h2 className="font-semibold">Detected data types</h2><div className="mt-3 flex flex-wrap gap-2">{table.columns.map((column) => <span key={column.id} className="rounded-full border border-border px-3 py-1 text-xs"><span className="font-medium">{column.name}</span><span className="ml-2 text-muted-foreground">{typeLabel[column.type]}</span></span>)}</div></CardContent></Card></div>
    {importOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"><Card className="w-full max-w-2xl"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="text-lg font-semibold">Import data</h2><p className="text-sm text-muted-foreground">Upload, drop, or paste CSV and JSON tabular data.</p></div><button onClick={() => setImportOpen(false)} aria-label="Close import dialog"><X /></button></div><div className="space-y-4 p-5"><div className="flex gap-2"><Button variant={importKind === 'csv' ? 'primary' : 'outline'} size="sm" onClick={() => { setImportKind('csv'); setPreview(undefined); }}><FileSpreadsheet className="mr-2 h-4 w-4" />CSV</Button><Button variant={importKind === 'json' ? 'primary' : 'outline'} size="sm" onClick={() => { setImportKind('json'); setPreview(undefined); }}><FileJson className="mr-2 h-4 w-4" />JSON</Button></div><div className="rounded-md border-2 border-dashed border-border p-5 text-center" onDrop={onDrop}><input ref={fileRef} type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={(event: ChangeEvent<HTMLInputElement>) => handleFile(event.target.files?.[0])} /><Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Choose a file</Button><p className="mt-2 text-xs text-muted-foreground">or drag and drop it here</p></div><textarea value={importText} onChange={(event) => { setImportText(event.target.value); setPreview(undefined); }} placeholder={importKind === 'csv' ? 'Month,Sales\nJanuary,120' : '[{"month":"January","sales":120}]'} className="min-h-[150px] w-full rounded-md border border-input bg-background p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring" />{preview && <div className="overflow-x-auto rounded-md border border-border"><p className="border-b border-border bg-secondary/30 px-3 py-2 text-xs font-semibold uppercase tracking-wider">Preview · {preview.rows.length} rows · {preview.columns.length} columns</p><table className="w-full text-xs"><thead><tr>{preview.columns.map((column) => <th key={column.id} className="border-b border-border px-3 py-2 text-left">{column.name}</th>)}</tr></thead><tbody>{preview.rows.slice(0, 3).map((row, index) => <tr key={index}>{row.map((value, cellIndex) => <td key={cellIndex} className="border-b border-border px-3 py-2">{value || <span className="text-muted-foreground">Empty</span>}</td>)}</tr>)}</tbody></table></div>}<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button>{preview ? <Button onClick={commitImport}><Check className="mr-2 h-4 w-4" />Import preview</Button> : <Button onClick={() => importTextData(importText)}><Check className="mr-2 h-4 w-4" />Preview</Button>}</div></div></Card></div>}
  </div>;
};