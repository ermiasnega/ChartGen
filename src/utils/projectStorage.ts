import { Project } from '@/types';

const databaseName = 'chartgen-workspace';
const storeName = 'projects';
const fallbackKey = 'chartgen-projects-fallback';
const fallback = (): Project[] => { try { return JSON.parse(localStorage.getItem(fallbackKey) ?? '[]') as Project[]; } catch { return []; } };
const openDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => { const request = indexedDB.open(databaseName, 1); request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: 'id' }); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });

export const projectStorage = {
  async list(): Promise<Project[]> { if (typeof indexedDB === 'undefined') return fallback(); try { const db = await openDatabase(); return await new Promise((resolve, reject) => { const request = db.transaction(storeName, 'readonly').objectStore(storeName).getAll(); request.onsuccess = () => resolve(request.result as Project[]); request.onerror = () => reject(request.error); }); } catch { return fallback(); } },
  async save(project: Project): Promise<void> { if (typeof indexedDB === 'undefined') { const projects = fallback().filter((item) => item.id !== project.id); localStorage.setItem(fallbackKey, JSON.stringify([...projects, project])); return; } try { const db = await openDatabase(); await new Promise<void>((resolve, reject) => { const request = db.transaction(storeName, 'readwrite').objectStore(storeName).put(project); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); }); } catch { const projects = fallback().filter((item) => item.id !== project.id); localStorage.setItem(fallbackKey, JSON.stringify([...projects, project])); } },
  async remove(id: string): Promise<void> { if (typeof indexedDB === 'undefined') { localStorage.setItem(fallbackKey, JSON.stringify(fallback().filter((project) => project.id !== id))); return; } try { const db = await openDatabase(); await new Promise<void>((resolve, reject) => { const request = db.transaction(storeName, 'readwrite').objectStore(storeName).delete(id); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); }); } catch { localStorage.setItem(fallbackKey, JSON.stringify(fallback().filter((project) => project.id !== id))); } },
};