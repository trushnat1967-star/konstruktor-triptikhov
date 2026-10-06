import { toPng } from 'html-to-image';
import type { ExportMethod } from '../types';
import { dataURLtoBlob } from './image';

interface SaveResult {
  method: ExportMethod;
  /** true, если файл реально ушёл в загрузку/диалог */
  delivered: boolean;
}

/**
 * Рендерит узел в PNG и сохраняет результат несколькими способами:
 * 1) нативный диалог сохранения (File System Access API);
 * 2) автоматическая загрузка через объектный URL;
 * 3) возврат dataURL — приложение покажет готовое изображение,
 *    чтобы его можно было сохранить вручную (долгое нажатие / ПКМ).
 */
export async function renderNodeToPng(node: HTMLElement): Promise<string> {
  // Даём шрифтам и картинкам шанс догрузиться перед снимком
  try {
    await document.fonts.ready;
  } catch {
    /* noop */
  }
  const images = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(resolve, 2500);
          }),
    ),
  );
  // Небольшая пауза, чтобы применились веб-шрифты внутри узла
  await new Promise((r) => setTimeout(r, 120));
  return toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: undefined,
    style: { transform: 'none' },
  });
}

export async function savePng(dataURL: string, fileName: string): Promise<SaveResult> {
  const blob = dataURLtoBlob(dataURL);

  // Способ 1: нативный диалог «Сохранить как»
  try {
    const w = window as unknown as {
      showSaveFilePicker?: (opts: unknown) => Promise<{
        createWritable: () => Promise<{ write: (b: Blob) => Promise<void>; close: () => Promise<void> }>;
      }>;
    };
    if (typeof w.showSaveFilePicker === 'function') {
      const handle = await w.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'PNG image', accept: { 'image/png': ['.png'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { method: 'picker', delivered: true };
    }
  } catch (e) {
    // AbortError — пользователь сам закрыл диалог: считаем ручным сценарием
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { method: 'manual', delivered: false };
    }
    // остальные ошибки — пробуем следующий способ
  }

  // Способ 2: автоматическая загрузка через объектный URL
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return { method: 'download', delivered: true };
  } catch {
    return { method: 'manual', delivered: false };
  }
}
