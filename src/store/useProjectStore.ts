import { create } from 'zustand';
import { ChartConfig, Project } from '@/types';
import { projectStorage } from '@/utils/projectStorage';
import { chartTemplates } from '@/constants/templates';

type SaveState = 'saved' | 'saving' | 'unsaved';
interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  hydrated: boolean;
  saveState: SaveState;
  hydrate: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string, charts?: ChartConfig[]) => Project;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | undefined;
  addChart: (projectId: string, chart: ChartConfig) => void;
  updateChart: (projectId: string, chart: ChartConfig) => void;
  deleteChart: (projectId: string, chartId: string) => void;
  duplicateChart: (projectId: string, chartId: string) => ChartConfig | undefined;
}
const now = () => new Date().toISOString();
const defaults = (project: Project): Project => ({ ...project, charts: project.charts ?? [] });

export const useProjectStore = create<ProjectState>((set, get) => {
  const persist = (project: Project) => { set({ saveState: 'saving' }); void projectStorage.save(project).then(() => set({ saveState: 'saved' })).catch(() => set({ saveState: 'unsaved' })); };
  const replace = (project: Project) => { const updated = { ...defaults(project), updatedAt: now() }; set((state) => ({ projects: state.projects.map((item) => item.id === updated.id ? updated : item), currentProject: state.currentProject?.id === updated.id ? updated : state.currentProject, saveState: 'unsaved' })); persist(updated); };
  return {
    currentProject: null, projects: [], hydrated: false, saveState: 'saved',
    hydrate: async () => { let projects = (await projectStorage.list()).map(defaults); if (!projects.length) { projects = chartTemplates.slice(0, 5).map((template, index) => ({ id: `demo-project-${index}`, name: template.name, charts: [{ ...template.chart, id: `demo-chart-${index}` }], createdAt: now(), updatedAt: now() })); await Promise.all(projects.map((project) => projectStorage.save(project))); } set({ projects, currentProject: projects[0] ?? null, hydrated: true, saveState: 'saved' }); },
    setCurrentProject: (project) => set({ currentProject: project ? defaults(project) : null }),
    createProject: (name, charts = []) => { const project: Project = { id: `project-${Date.now()}`, name: name.trim() || 'Untitled project', charts, createdAt: now(), updatedAt: now() }; set((state) => ({ projects: [...state.projects, project], currentProject: project, saveState: 'unsaved' })); persist(project); return project; },
    addProject: (project) => { const next = defaults(project); set((state) => ({ projects: [...state.projects, next], currentProject: next, saveState: 'unsaved' })); persist(next); },
    updateProject: (id, updates) => { const project = get().projects.find((item) => item.id === id); if (project) replace({ ...project, ...updates }); },
    deleteProject: (id) => { set((state) => ({ projects: state.projects.filter((project) => project.id !== id), currentProject: state.currentProject?.id === id ? null : state.currentProject, saveState: 'unsaved' })); set({ saveState: 'saving' }); void projectStorage.remove(id).then(() => set({ saveState: 'saved' })); },
    duplicateProject: (id) => { const source = get().projects.find((project) => project.id === id); if (!source) return undefined; const copy: Project = { ...source, id: `project-${Date.now()}`, name: `${source.name} copy`, charts: source.charts.map((chart, index) => ({ ...chart, id: `chart-${Date.now()}-${index}` })), createdAt: now(), updatedAt: now() }; set((state) => ({ projects: [...state.projects, copy], currentProject: copy, saveState: 'unsaved' })); persist(copy); return copy; },
    addChart: (projectId, chart) => { const project = get().projects.find((item) => item.id === projectId); if (project) replace({ ...project, charts: [...project.charts, chart], activeChartId: chart.id }); },
    updateChart: (projectId, chart) => { const project = get().projects.find((item) => item.id === projectId); if (project) replace({ ...project, charts: project.charts.map((item) => item.id === chart.id ? chart : item) }); },
    deleteChart: (projectId, chartId) => { const project = get().projects.find((item) => item.id === projectId); if (project) replace({ ...project, charts: project.charts.filter((chart) => chart.id !== chartId), activeChartId: project.activeChartId === chartId ? project.charts.find((chart) => chart.id !== chartId)?.id : project.activeChartId }); },
    duplicateChart: (projectId, chartId) => { const project = get().projects.find((item) => item.id === projectId); const source = project?.charts.find((chart) => chart.id === chartId); if (!project || !source) return undefined; const copy = { ...source, id: `chart-${Date.now()}`, title: `${source.title} copy` }; replace({ ...project, charts: [...project.charts, copy], activeChartId: copy.id }); return copy; },
  };
});
