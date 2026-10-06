import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileWarning, Hand, Loader2, RectangleHorizontal, X } from 'lucide-react';
import type { ExportMethod, TriptychProject } from '../types';
import TriptychView from './TriptychView';
import { cn } from '../utils/cn';

/* ---------- оболочка ---------- */

function Shell({
  onClose,
  children,
  wide = false,
}: {
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'animate-scale-in max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#1D1A16] p-5 shadow-2xl slim-scroll sm:rounded-3xl sm:p-6',
          wide ? 'max-w-5xl' : 'max-w-md',
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- подтверждение нового триптиха ---------- */

export function ConfirmNewModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <Shell onClose={onCancel}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15">
        <AlertTriangle className="h-6 w-6 text-amber-300" />
      </div>
      <h2 className="font-display text-[22px] font-bold text-stone-100">Начать новый триптих?</h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-stone-400">
        Текущая работа — название, тема, тексты, изображения и оформление — будет очищена. Это действие нельзя отменить.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          autoFocus
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[14px] font-bold text-stone-200 transition hover:border-white/30 hover:bg-white/10"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-xl bg-red-500 px-4 py-3 text-[14px] font-extrabold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-400"
        >
          Создать новый
        </button>
      </div>
      <p className="mt-3 text-center text-[12.5px] text-stone-500">При выборе «Отмена» все данные сохранятся без изменений.</p>
    </Shell>
  );
}

/* ---------- полноэкранное превью ---------- */

export function PreviewModal({
  project,
  onClose,
  onDownload,
  downloading,
}: {
  project: TriptychProject;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
}) {
  return (
    <Shell onClose={onClose} wide>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div>
          <h2 className="font-display text-[22px] font-bold leading-tight text-stone-100">Превью триптиха</h2>
          <p className="text-[13px] text-stone-500">Рабочий просмотр — подстраивается под экран для удобства</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-[13.5px] font-extrabold text-stone-950 transition hover:bg-amber-300 disabled:opacity-70"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? 'Готовим…' : 'Скачать PNG'}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть превью"
            className="rounded-xl border border-white/15 bg-white/5 p-2.5 text-stone-300 transition hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[.07] px-3.5 py-2.5 text-[13px] font-semibold text-emerald-200">
        <RectangleHorizontal className="h-4 w-4 shrink-0" />
        На узком экране панели показаны друг над другом для читаемости, но в PNG-файле они всегда идут слева направо — горизонтально.
      </div>
      <TriptychView project={project} variant="live" />
    </Shell>
  );
}

/* ---------- результат выгрузки ---------- */

function useImageSize(src: string | null) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    if (!src) {
      setSize(null);
      return;
    }
    const img = new Image();
    img.onload = () => setSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setSize(null);
    img.src = src;
  }, [src]);
  return size;
}

export function ExportModal({
  image,
  method,
  fileName,
  onClose,
  onDownloadAgain,
}: {
  image: string | null;
  method: ExportMethod;
  fileName: string;
  onClose: () => void;
  onDownloadAgain: () => void;
}) {
  const delivered = method === 'picker' || method === 'download';
  const size = useImageSize(image);
  const horizontal = size ? size.w >= size.h : null;

  return (
    <Shell onClose={onClose} wide>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', delivered ? 'bg-emerald-500/15' : 'bg-amber-400/15')}>
            {delivered ? <CheckCircle2 className="h-6 w-6 text-emerald-400" /> : <FileWarning className="h-6 w-6 text-amber-300" />}
          </div>
          <div>
            <h2 className="font-display text-[22px] font-bold leading-tight text-stone-100">
              {delivered ? 'Триптих сохранён' : 'Изображение готово'}
            </h2>
            <p className="text-[13px] text-stone-500">
              {method === 'picker' && `Файл «${fileName}» сохранён через диалог браузера.`}
              {method === 'download' && `Файл «${fileName}» загружен. Проверьте папку загрузок.`}
              {method === 'manual' && 'Браузер заблокировал автозагрузку — сохраните картинку вручную.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="ml-auto rounded-xl border border-white/15 bg-white/5 p-2.5 text-stone-300 transition hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Плашка ориентации — подтверждение горизонтального формата */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[12.5px] font-extrabold text-emerald-200">
          <RectangleHorizontal className="h-4 w-4" />
          Горизонтальный формат · 3 панели слева направо
        </span>
        {size && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-bold tabular-nums',
              horizontal ? 'border-white/10 bg-white/5 text-stone-300' : 'border-red-500/40 bg-red-500/10 text-red-300',
            )}
          >
            {size.w} × {size.h}px {horizontal ? '· альбомная' : '· ВНИМАНИЕ: не альбомная!'}
          </span>
        )}
      </div>

      {image ? (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <img src={image} alt="Готовый горизонтальный триптих — три панели слева направо" className="block w-full" />
        </div>
      ) : (
        <p className="rounded-2xl border border-white/10 bg-black/30 p-6 text-center text-stone-400">Не удалось подготовить изображение.</p>
      )}

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-stone-300">
          <Hand className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <span>
            <b>Ручное сохранение:</b> нажмите на картинку правой кнопкой мыши и выберите «Сохранить изображение как…».
            На смартфоне — удерживайте палец на картинке и выберите «Сохранить» или «Поделиться».
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDownloadAgain}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-[13.5px] font-extrabold text-stone-950 transition hover:bg-amber-300"
          >
            <Download className="h-4 w-4" /> Скачать повторно
          </button>
          <a
            href={image ?? undefined}
            download={fileName}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[13.5px] font-bold text-stone-200 transition hover:bg-white/10"
          >
            Открыть файл напрямую
          </a>
        </div>
      </div>
    </Shell>
  );
}
