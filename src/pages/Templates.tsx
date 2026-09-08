import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Copy, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { chartTemplates } from '@/constants/templates';
import { useProjectStore } from '@/store';

export const Templates = () => {
  const navigate = useNavigate();
  const { hydrated, hydrate, createProject } = useProjectStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrate, hydrated]);
  const categories = ['All', ...Array.from(new Set(chartTemplates.map((template) => template.category)))];
  const templates = useMemo(() => chartTemplates.filter((template) => (category === 'All' || template.category === category) && `${template.name} ${template.category} ${template.description}`.toLowerCase().includes(search.toLowerCase())), [category, search]);
  const handleTemplate = (template: typeof chartTemplates[number]) => { const chart = { ...template.chart, id: `chart-${Date.now()}`, dataset: template.chart.dataset ? { ...template.chart.dataset, id: `${template.chart.dataset.id}-${Date.now()}` } : undefined }; const project = createProject(template.name, [chart]); navigate(`/projects/${project.id}`); };
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Starting points</p><h1 className="mt-1 text-3xl font-bold">Template gallery</h1><p className="mt-2 text-muted-foreground">Start with a complete dataset, chart, and visual style.</p></div><div className="flex flex-wrap gap-3"><label className="relative min-w-[260px] flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search templates" className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">{categories.map((item) => <option key={item}>{item}</option>)}</select></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{templates.map((template) => <Card key={template.id} className="overflow-hidden"><div className="flex h-32 items-center justify-center bg-secondary/40"><BarChart3 className="h-14 w-14 text-accent" /></div><CardContent className="p-5"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-accent">{template.category}</span><span className="text-xs capitalize text-muted-foreground">{template.chart.type}</span></div><h2 className="mt-2 text-lg font-semibold">{template.name}</h2><p className="mt-2 min-h-10 text-sm text-muted-foreground">{template.description}</p><div className="mt-4 flex gap-2"><Button className="flex-1" onClick={() => handleTemplate(template)}>Use Template</Button><Button variant="outline" size="sm" onClick={() => handleTemplate(template)} title="Duplicate template" aria-label="Duplicate template"><Copy className="h-4 w-4" /></Button></div></CardContent></Card>)}</div></div>;
};
