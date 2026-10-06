/**
 * Читает файл изображения, уменьшает до разумного размера и возвращает dataURL.
 * Уменьшение нужно, чтобы проект помещался в localStorage и быстро выгружался в PNG.
 */
export function fileToDataURL(file: File, maxSide = 1200, quality = 0.84): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.onload = () => {
      const src = String(reader.result ?? '');
      const img = new Image();
      img.onload = () => {
        try {
          const { width, height } = img;
          const scale = Math.min(1, maxSide / Math.max(width, height));
          const w = Math.max(1, Math.round(width * scale));
          const h = Math.max(1, Math.round(height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(src);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          // PNG с прозрачностью сохраняем как PNG, остальное — компактный JPEG
          const hasAlpha = file.type === 'image/png';
          resolve(canvas.toDataURL(hasAlpha ? 'image/png' : 'image/jpeg', quality));
        } catch (e) {
          reject(e instanceof Error ? e : new Error('Не удалось обработать изображение'));
        }
      };
      img.onerror = () => reject(new Error('Файл не похож на изображение'));
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export function dataURLtoBlob(dataURL: string): Blob {
  const [head, body] = dataURL.split(',');
  const mime = /data:(.*?);/.exec(head)?.[1] ?? 'image/png';
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function slugify(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return s || 'triptih';
}
