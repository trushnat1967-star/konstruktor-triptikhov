import type { TriptychProject } from '../types';
import { demoProject, emptyProject } from '../constants';

const KEY = 'triptych-constructor-v1';

function normalize(raw: unknown): TriptychProject | null {
  if (!raw || typeof raw !== 'object') return null;
  try {
    const p = raw as Partial<TriptychProject>;
    const parts = Array.isArray(p.parts) ? p.parts : [];
    const norm: TriptychProject = {
      title: typeof p.title === 'string' ? p.title : '',
      theme: typeof p.theme === 'string' ? p.theme : '',
      parts: [0, 1, 2].map((i) => {
        const part = (parts[i] ?? {}) as Partial<{ heading: string; text: string; image: string | null }>;
        return {
          heading: typeof part.heading === 'string' ? part.heading : '',
          text: typeof part.text === 'string' ? part.text : '',
          image: typeof part.image === 'string' && part.image.length > 0 ? part.image : null,
        };
      }) as TriptychProject['parts'],
      style: {
        paletteId: typeof p.style?.paletteId === 'string' ? p.style.paletteId : 'gallery',
        backgroundId: typeof p.style?.backgroundId === 'string' ? p.style.backgroundId : 'glow',
        fontId: typeof p.style?.fontId === 'string' ? p.style.fontId : 'academy',
      },
      updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : Date.now(),
    };
    return norm;
  } catch {
    return null;
  }
}

export function loadProject(): { project: TriptychProject; restored: boolean } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // Первый визит — показываем заполненный пример, чтобы было понятно устройство.
      // После первого автосохранения в хранилище появится запись,
      // и пример больше не будет подменять работу пользователя.
      return { project: demoProject(), restored: false };
    }
    const parsed = normalize(JSON.parse(raw));
    if (!parsed) return { project: emptyProject(), restored: false };
    return { project: parsed, restored: true };
  } catch {
    return { project: emptyProject(), restored: false };
  }
}

/** Возвращает false, если браузер отклонил запись (например, переполнена квота) */
export function saveProject(project: TriptychProject): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...project, updatedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}
