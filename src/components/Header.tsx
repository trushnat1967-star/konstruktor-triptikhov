import { Check, CloudOff, Download, Expand, Loader2, Plus } from 'lucide-react';
import { cn } from '../utils/cn';

interface Props {
  onNew: () => void;
  onPreview: () => void;
  onDownload: () => void;
  downloading: boolean;
  saveFailed: boolean;
  savedLabel: string;
  completion: number;
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center gap-[3px] rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 shadow-lg shadow-amber-500/20">
        <span className="h-5 w-[5px] rounded-[2px] bg-stone-950/85" />
        <span className="h-6 w-[5px] rounded-[2px] bg-stone-950/85" />
        <span className="h-5 w-[5px] rounded-[2px] bg-stone-950/85" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-[19px] font-black tracking-tight text-stone-50">Триптих</div>
        <div className="text-[11px] font-bold uppercase tracking-[.24em] text-stone-500">мини-конструктор</div>
      </div>
    </div>
  );
}

export default function Header({ onNew, onPreview, onDownload, downloading, saveFailed, savedLabel, completion }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#141210]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-3 lg:px-8">
        <Logo />

        <div className="ml-auto flex items-center gap-2">
          {/* Статус сохранения */}
          <div
            className={cn(
              'mr-1 hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold md:flex',
              saveFailed ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-white/10 bg-white/5 text-stone-400',
            )}
            title={saveFailed ? 'Браузер отклонил запись — возможно, переполнено хранилище' : 'Проект автоматически сохраняется в этом браузере'}
          >
            {saveFailed ? <CloudOff className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5 text-emerald-400" />}
            {saveFailed ? 'Не сохранено' : savedLabel}
          </div>

          {/* Прогресс */}
          <div className="mr-1 hidden items-center gap-2 lg:flex" title="Насколько заполнен триптих">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-[12.5px] font-bold tabular-nums text-stone-400">{completion}%</span>
          </div>

          <button
            type="button"
            onClick={onNew}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[13.5px] font-bold text-stone-200 transition hover:border-white/30 hover:bg-white/10 sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Создать новый триптих</span>
            <span className="sm:hidden">Новый</span>
          </button>

          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[13.5px] font-bold text-stone-200 transition hover:border-white/30 hover:bg-white/10 sm:px-4"
          >
            <Expand className="h-4 w-4" />
            <span className="hidden sm:inline">Открыть превью</span>
            <span className="sm:hidden">Превью</span>
          </button>

          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-2.5 text-[13.5px] font-extrabold text-stone-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-70 sm:px-4"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span className="hidden sm:inline">{downloading ? 'Готовим PNG…' : 'Скачать PNG'}</span>
            <span className="sm:hidden">{downloading ? '…' : 'PNG'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
