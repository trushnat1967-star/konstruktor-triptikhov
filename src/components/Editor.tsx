import { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Columns3,
  ImagePlus,
  Loader2,
  Palette as PaletteIcon,
  PenLine,
  RefreshCw,
  Trash2,
  Type,
  Lightbulb,
} from 'lucide-react';
import type { TriptychProject } from '../types';
import { BACKGROUNDS, FONTS, PALETTES, PART_LABELS, PART_NUMERALS } from '../constants';
import { fileToDataURL } from '../utils/image';
import { cn } from '../utils/cn';

/* ---------- общие мелочи ---------- */

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="mb-1.5 flex items-baseline justify-between text-[12px] font-bold uppercase tracking-[.12em] text-stone-400">
      <span>{children}</span>
      {hint && <span className="font-sans text-[11px] font-semibold normal-case tracking-normal text-stone-500">{hint}</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-[15px] text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15';

/* ---------- компактный загрузчик изображений ---------- */

function ImageUploader({
  value,
  numeral,
  onChange,
}: {
  value: string | null;
  numeral: string;
  onChange: (v: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Выберите файл-изображение (PNG, JPG, WEBP…)');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const dataURL = await fileToDataURL(file);
      onChange(dataURL);
    } catch {
      setError('Не удалось прочитать изображение');
    } finally {
      setLoading(false);
    }
  }

  if (value) {
    return (
      <div>
        <div className="group relative overflow-hidden rounded-xl border border-white/10">
          <img src={value} alt={`Изображение части ${numeral}`} className="aspect-[16/8] w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 p-3 opacity-0 backdrop-blur-[2px] transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[13px] font-bold text-stone-900 transition hover:bg-amber-200"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Заменить
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/90 px-3 py-2 text-[13px] font-bold text-white transition hover:bg-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" /> Убрать
            </button>
          </div>
          <div className="absolute bottom-2 right-2 flex gap-1.5 sm:hidden">
            <button
              type="button"
              aria-label="Заменить изображение"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-black/70 p-2 text-white backdrop-blur"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Убрать изображение"
              onClick={() => onChange(null)}
              className="rounded-lg bg-black/70 p-2 text-white backdrop-blur"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
        {error && <p className="mt-2 flex items-center gap-1.5 text-[13px] text-red-400"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 text-left transition',
          dragOver ? 'border-amber-400/70 bg-amber-400/10' : 'border-white/15 bg-black/20 hover:border-amber-400/40 hover:bg-amber-400/5',
        )}
      >
        {loading ? (
          <Loader2 className="h-8 w-8 shrink-0 animate-spin text-amber-300" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5">
            <ImagePlus className="h-5 w-5 text-amber-300" />
          </span>
        )}
        <span>
          <span className="block text-[14px] font-bold text-stone-200">
            {loading ? 'Обрабатываем…' : dragOver ? 'Отпустите файл' : 'Загрузить изображение'}
          </span>
          <span className="block text-[12.5px] text-stone-500">Нажмите или перетащите файл · PNG, JPG, WEBP</span>
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
      {error && <p className="mt-2 flex items-center gap-1.5 text-[13px] text-red-400"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
    </div>
  );
}

/* ---------- вкладки редактора ---------- */

const TABS = [
  { id: 0, label: 'Основа', icon: PenLine, hint: 'Название и тема' },
  { id: 1, label: 'Части', icon: Columns3, hint: 'Тексты и изображения' },
  { id: 2, label: 'Оформление', icon: PaletteIcon, hint: 'Палитра, фон, шрифт' },
] as const;

interface EditorProps {
  project: TriptychProject;
  activePart: number;
  onActivePart: (i: number) => void;
  onPatch: (patch: Partial<TriptychProject>) => void;
  onPartPatch: (index: number, patch: Partial<TriptychProject['parts'][number]>) => void;
  onStyle: (patch: Partial<TriptychProject['style']>) => void;
  activeTab: number;
  onTabChange: (t: number) => void;
}

export default function Editor({
  project,
  activePart,
  onActivePart,
  onPatch,
  onPartPatch,
  onStyle,
  activeTab,
  onTabChange,
}: EditorProps) {
  const part = project.parts[activePart];

  const basisDone = Boolean(project.title.trim() && project.theme.trim());
  const basisHalf = Boolean(project.title.trim() || project.theme.trim());
  const partsDoneCount = project.parts.filter((p) => p.heading.trim() && p.text.trim() && p.image).length;

  function partDone(i: number) {
    const p = project.parts[i];
    return Boolean(p.heading.trim() && p.text.trim() && p.image);
  }

  function tabStatus(id: number): 'done' | 'half' | 'todo' {
    if (id === 0) return basisDone ? 'done' : basisHalf ? 'half' : 'todo';
    if (id === 1) return partsDoneCount === 3 ? 'done' : partsDoneCount > 0 ? 'half' : 'todo';
    return 'done'; // оформление всегда имеет значения по умолчанию
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.04] backdrop-blur-sm">
      {/* Шаговая навигация — всё заполнение без длинного скролла: один шаг на экране */}
      <div className="grid grid-cols-3 gap-1.5 border-b border-white/10 bg-black/20 p-2">
        {TABS.map((t) => {
          const active = activeTab === t.id;
          const status = tabStatus(t.id);
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={cn(
                'relative flex items-center gap-1.5 rounded-xl px-2 py-2 text-left transition sm:gap-2 sm:px-3 sm:py-2.5',
                active ? 'bg-amber-400 text-stone-950 shadow-lg shadow-amber-400/20' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px] font-black sm:h-7 sm:w-7 sm:text-[13px]',
                  active ? 'bg-stone-950/15' : 'bg-white/5',
                )}
              >
                {status === 'done' && !active ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400 sm:h-4 sm:w-4" strokeWidth={3} />
                ) : (
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-extrabold leading-tight sm:text-[13.5px]">
                  {t.id + 1}. {t.label}
                </span>
                <span className={cn('hidden truncate text-[11.5px] leading-tight sm:block', active ? 'text-stone-800' : 'text-stone-600')}>
                  {t.id === 1 ? `${partsDoneCount}/3 заполнено` : t.hint}
                </span>
              </span>
              {status === 'half' && !active && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Контент шага */}
      <div className="p-4 sm:p-5">
        {activeTab === 0 && (
          <div key="tab-0" className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 className="font-display text-[19px] font-bold text-stone-100">Основа триптиха</h2>
              <p className="mt-0.5 text-[13px] text-stone-400">Название и общая тема связывают все три части в единое целое.</p>
            </div>
            <div>
              <FieldLabel hint={`${project.title.length}/80`}>Название триптиха</FieldLabel>
              <input
                className={inputCls}
                value={project.title}
                maxLength={80}
                onChange={(e) => onPatch({ title: e.target.value })}
                placeholder="Например: «Тишина трёх часов»"
              />
            </div>
            <div>
              <FieldLabel hint={`${project.theme.length}/220`}>Общая тема</FieldLabel>
              <textarea
                className={cn(inputCls, 'min-h-[92px] leading-relaxed')}
                value={project.theme}
                maxLength={220}
                onChange={(e) => onPatch({ theme: e.target.value })}
                placeholder="Одна-две фразы о том, что объединяет левую, центральную и правую части…"
              />
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/[.07] p-3 text-[13px] leading-relaxed text-amber-100/90">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <span>
                Сильная тема — это один образ, увиденный трижды: то же место в разное время, то же чувство с трёх сторон,
                начало — середина — финал одной истории.
              </span>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div key="tab-1" className="animate-fade-in flex flex-col gap-4">
            <div className="flex items-end justify-between gap-2">
              <div>
                <h2 className="font-display text-[19px] font-bold text-stone-100">Три части</h2>
                <p className="mt-0.5 text-[13px] text-stone-400">Заголовок, текст и изображение для каждой панели.</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[12px] font-bold text-stone-300">
                {partsDoneCount}/3 готово
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-black/30 p-1.5">
              {PART_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onActivePart(i)}
                  className={cn(
                    'relative flex items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-[12px] font-bold transition sm:gap-1.5 sm:px-2 sm:text-[13px]',
                    activePart === i ? 'bg-amber-400 text-stone-950 shadow' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200',
                  )}
                >
                  <span className={cn('text-[10px] font-extrabold tracking-[.12em] sm:text-[11px]', activePart === i ? 'text-stone-800' : 'text-stone-600')}>
                    {PART_NUMERALS[i]}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{['Левая', 'Центр', 'Правая'][i]}</span>
                  {partDone(i) && (
                    <span className={cn('flex h-4 w-4 items-center justify-center rounded-full', activePart === i ? 'bg-stone-950 text-amber-300' : 'bg-emerald-500 text-white')}>
                      <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div key={activePart} className="animate-fade-in flex flex-col gap-3.5">
              <div>
                <FieldLabel hint={`${part.heading.length}/60`}>
                  Заголовок · {PART_LABELS[activePart].toLowerCase()} часть
                </FieldLabel>
                <input
                  className={inputCls}
                  value={part.heading}
                  maxLength={60}
                  onChange={(e) => onPartPatch(activePart, { heading: e.target.value })}
                  placeholder={['Например: «Рассвет»', 'Например: «Полдень»', 'Например: «Закат»'][activePart]}
                />
              </div>
              <div>
                <FieldLabel hint={`${part.text.length}/280`}>Короткий текст</FieldLabel>
                <textarea
                  className={cn(inputCls, 'min-h-[76px] leading-relaxed')}
                  value={part.text}
                  maxLength={280}
                  onChange={(e) => onPartPatch(activePart, { text: e.target.value })}
                  placeholder="Образ, настроение и роль этой части в общей истории…"
                />
              </div>
              <div>
                <FieldLabel>Изображение</FieldLabel>
                <ImageUploader value={part.image} numeral={PART_NUMERALS[activePart]} onChange={(image) => onPartPatch(activePart, { image })} />
              </div>
              {/* Быстрая навигация между частями — без скролла */}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={activePart === 0}
                  onClick={() => onActivePart(activePart - 1)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[13px] font-bold text-stone-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> {activePart > 0 ? PART_LABELS[activePart - 1] : 'Назад'}
                </button>
                <button
                  type="button"
                  disabled={activePart === 2}
                  onClick={() => onActivePart(activePart + 1)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[13px] font-bold text-stone-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {activePart < 2 ? PART_LABELS[activePart + 1] : 'Далее'} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div key="tab-2" className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 className="font-display text-[19px] font-bold text-stone-100">Оформление</h2>
              <p className="mt-0.5 text-[13px] text-stone-400">Палитра, фон и шрифт применяются сразу ко всем трём частям.</p>
            </div>

            <div>
              <div className="mb-1.5 text-[12px] font-bold uppercase tracking-[.12em] text-stone-400">Цветовая палитра</div>
              <div className="grid grid-cols-2 gap-2">
                {PALETTES.map((p) => {
                  const active = project.style.paletteId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onStyle({ paletteId: p.id })}
                      className={cn(
                        'rounded-xl border p-2 text-left transition',
                        active ? 'border-amber-400/70 bg-amber-400/10 ring-1 ring-amber-400/40' : 'border-white/10 bg-black/20 hover:border-white/25',
                      )}
                    >
                      <span className="mb-1.5 flex gap-1">
                        {p.chip.map((c) => (
                          <span key={c} className="h-5 flex-1 rounded-md border border-black/20" style={{ backgroundColor: c }} />
                        ))}
                      </span>
                      <span className="block text-[13px] font-bold leading-tight text-stone-100">{p.name}</span>
                      <span className="block text-[11.5px] text-stone-500">{p.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-[12px] font-bold uppercase tracking-[.12em] text-stone-400">Фон триптиха</div>
              <div className="grid grid-cols-3 gap-2">
                {BACKGROUNDS.map((b) => {
                  const active = project.style.backgroundId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onStyle({ backgroundId: b.id })}
                      title={b.hint}
                      className={cn(
                        'rounded-xl border px-1.5 py-2 text-center transition',
                        active ? 'border-amber-400/70 bg-amber-400/10 text-amber-200 ring-1 ring-amber-400/40' : 'border-white/10 bg-black/20 text-stone-300 hover:border-white/25',
                      )}
                    >
                      <span className="mx-auto mb-1 block h-7 overflow-hidden rounded-md border border-white/10">
                        <BackgroundThumb id={b.id} />
                      </span>
                      <span className="block text-[11.5px] font-bold leading-tight">{b.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[.12em] text-stone-400">
                <Type className="h-3.5 w-3.5" /> Шрифт триптиха
              </div>
              <div className="flex flex-col gap-1.5">
                {FONTS.map((f) => {
                  const active = project.style.fontId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onStyle({ fontId: f.id })}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition',
                        active ? 'border-amber-400/70 bg-amber-400/10 ring-1 ring-amber-400/40' : 'border-white/10 bg-black/20 hover:border-white/25',
                      )}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg text-stone-100" style={{ fontFamily: f.family }}>
                        Аа
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-bold leading-tight text-stone-100">{f.name}</span>
                        <span className="block truncate text-[12px] leading-tight text-stone-500" style={{ fontFamily: f.family }}>
                          Тишина трёх часов
                        </span>
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0 text-amber-300" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Навигация по шагам */}
      <div className="flex items-center gap-2 border-t border-white/10 bg-black/20 px-4 py-3 sm:px-5">
        <button
          type="button"
          disabled={activeTab === 0}
          onClick={() => onTabChange(activeTab - 1)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-[13px] font-bold text-stone-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Назад
        </button>
        <span className="mx-auto text-[12px] font-bold uppercase tracking-[.16em] text-stone-500">
          Шаг {activeTab + 1} из 3
        </span>
        {activeTab < 2 ? (
          <button
            type="button"
            onClick={() => onTabChange(activeTab + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-[13px] font-extrabold text-stone-950 transition hover:bg-amber-300"
          >
            Далее <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-2 text-[13px] font-bold text-emerald-300">
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> Всё настроено
          </span>
        )}
      </div>
    </div>
  );
}

/** Миниатюра фона в сетке выбора */
function BackgroundThumb({ id }: { id: string }) {
  const base = 'h-full w-full';
  if (id === 'clean') return <span className={base} style={{ background: '#e8e2d4', display: 'block' }} />;
  if (id === 'glow') return <span className={base} style={{ background: 'radial-gradient(120% 90% at 50% 0%, #fff 0%, #d9d2c0 70%)', display: 'block' }} />;
  if (id === 'grain')
    return (
      <span
        className={base}
        style={{
          display: 'block',
          backgroundColor: '#ddd6c4',
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
        }}
      />
    );
  if (id === 'lines')
    return <span className={base} style={{ display: 'block', background: 'repeating-linear-gradient(180deg, #efe9da 0 3px, #cfc7b2 3px 4px)' }} />;
  if (id === 'arches')
    return (
      <span
        className={base}
        style={{
          display: 'block',
          background: 'radial-gradient(40% 120% at 20% 100%, #b9b09a 0 60%, transparent 61%), radial-gradient(40% 120% at 50% 100%, #b9b09a 0 60%, transparent 61%), radial-gradient(40% 120% at 80% 100%, #b9b09a 0 60%, transparent 61%), #ece6d6',
        }}
      />
    );
  return (
    <span
      className={base}
      style={{ display: 'block', background: 'radial-gradient(45% 80% at 20% 30%, #c99a5b 0%, transparent 70%), radial-gradient(45% 80% at 80% 70%, #8a6fb8 0%, transparent 70%), #ece6d6' }}
    />
  );
}
