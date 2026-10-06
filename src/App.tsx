import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Expand, Info, PanelLeft, RectangleHorizontal, Sparkles } from 'lucide-react';
import Header from './components/Header';
import Editor from './components/Editor';
import TriptychView from './components/TriptychView';
import { ConfirmNewModal, ExportModal, PreviewModal } from './components/Modals';
import type { ExportMethod, TriptychProject } from './types';
import { completionOf, emptyProject, hasFilledData } from './constants';
import { loadProject, saveProject } from './utils/storage';
import { renderNodeToPng, savePng } from './utils/export';
import { slugify } from './utils/image';

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function App() {
  const [boot] = useState(() => loadProject());
  const [project, setProject] = useState<TriptychProject>(boot.project);
  const restored = boot.restored;
  const [activePart, setActivePart] = useState(1);
  // Уже заполненный проект открывается сразу на шаге «Части» — главном рабочем экране
  const [activeTab, setActiveTab] = useState(() => (hasFilledData(boot.project) ? 1 : 0));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [savedAt, setSavedAt] = useState<number>(Date.now());
  const [toast, setToast] = useState<string | null>(restored ? 'Проект восстановлен из браузера' : null);
  const [exportState, setExportState] = useState<{ open: boolean; image: string | null; method: ExportMethod; fileName: string }>({
    open: false,
    image: null,
    method: null,
    fileName: 'triptih.png',
  });
  const exportRef = useRef<HTMLDivElement>(null);

  /* ---------- автосохранение в браузере ---------- */
  useEffect(() => {
    const t = setTimeout(() => {
      const ok = saveProject(project);
      setSaveFailed(!ok);
      if (ok) setSavedAt(Date.now());
    }, 450);
    return () => clearTimeout(t);
  }, [project]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  const completion = useMemo(() => completionOf(project), [project]);

  /* ---------- правки ---------- */
  const patch = useCallback((p: Partial<TriptychProject>) => {
    setProject((prev) => ({ ...prev, ...p }));
  }, []);

  const partPatch = useCallback((index: number, p: Partial<TriptychProject['parts'][number]>) => {
    setProject((prev) => {
      const parts = [...prev.parts] as TriptychProject['parts'];
      parts[index] = { ...parts[index], ...p };
      return { ...prev, parts };
    });
  }, []);

  const stylePatch = useCallback((s: Partial<TriptychProject['style']>) => {
    setProject((prev) => ({ ...prev, style: { ...prev.style, ...s } }));
  }, []);

  /* ---------- новый триптих ---------- */
  const requestNew = useCallback(() => {
    if (hasFilledData(project)) {
      setConfirmOpen(true);
    } else {
      setProject(emptyProject());
      setActivePart(0);
      setActiveTab(0);
      setToast('Новый чистый триптих готов к работе');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [project]);

  const confirmNew = useCallback(() => {
    setProject(emptyProject());
    setActivePart(0);
    setActiveTab(0);
    setConfirmOpen(false);
    setToast('Создан новый триптих');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* ---------- выгрузка PNG (всегда горизонтальная: 1600px, 3 панели в ряд) ---------- */
  const handleDownload = useCallback(async () => {
    if (downloading) return;
    const node = exportRef.current;
    if (!node) return;
    setDownloading(true);
    const fileName = `${slugify(project.title) || 'triptih'}.png`;
    try {
      const dataURL = await renderNodeToPng(node);
      const result = await savePng(dataURL, fileName);
      setExportState({ open: true, image: dataURL, method: result.method, fileName });
    } catch {
      setExportState({ open: true, image: null, method: 'manual', fileName });
    } finally {
      setDownloading(false);
    }
  }, [downloading, project.title]);

  const downloadAgain = useCallback(async () => {
    if (!exportState.image) return;
    const result = await savePng(exportState.image, exportState.fileName);
    setExportState((prev) => ({ ...prev, method: result.method }));
    if (result.delivered) setToast('Файл отправлен в загрузку повторно');
  }, [exportState.image, exportState.fileName]);

  return (
    <div className="relative min-h-screen bg-[#141210]">
      {/* фоновое свечение */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(217,164,65,.14)_0%,transparent_70%)]" />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10">
        <Header
          onNew={requestNew}
          onPreview={() => setPreviewOpen(true)}
          onDownload={handleDownload}
          downloading={downloading}
          saveFailed={saveFailed}
          savedLabel={`Сохранено · ${formatTime(savedAt)}`}
          completion={completion}
        />

        <main className="mx-auto max-w-[1440px] px-4 pb-10 pt-5 lg:px-8">
          {/* Компактная приветственная полоса */}
          <div className="animate-fade-up mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 sm:flex">
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h1 className="font-display text-[22px] font-black leading-tight text-stone-50 sm:text-[26px]">
                  Соберите свой триптих
                </h1>
                <p className="mt-0.5 max-w-2xl text-[13.5px] leading-snug text-stone-400">
                  Три шага слева — живое превью справа. Всё, что вы меняете, мгновенно появляется в превью.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[.07] px-3 py-2 text-[12.5px] font-bold text-emerald-200">
              <RectangleHorizontal className="h-4 w-4" />
              Экспорт: горизонтальный PNG · 3 панели в ряд
            </div>
          </div>

          {/* Рабочая зона.
              На широких экранах (xl+) — две сбалансированные колонки: каждая помещается
              в высоту экрана и прокручивается независимо, превью всегда перед глазами.
              На средних экранах и планшетах — одна колонка: редактор и широкое превью
              во всю ширину, чтобы панели не становились узкими. */}
          <div className="grid items-start gap-4 xl:grid-cols-[480px_minmax(0,1fr)] 2xl:grid-cols-[500px_minmax(0,1fr)]">
            {/* Левая колонка — пошаговый редактор */}
            <div className="animate-fade-up stagger-1 xl:sticky xl:top-[76px] xl:max-h-[calc(100vh-92px)] xl:overflow-y-auto xl:pr-0.5 xl:pb-1 slim-scroll">
              <Editor
                project={project}
                activePart={activePart}
                onActivePart={setActivePart}
                onPatch={patch}
                onPartPatch={partPatch}
                onStyle={stylePatch}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              <div className="mt-3 hidden items-start gap-2 rounded-2xl border border-white/10 bg-white/[.03] p-3.5 text-[12.5px] leading-relaxed text-stone-500 xl:flex">
                <PanelLeft className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <span>
                  Заполнение идёт по шагам: <b className="text-stone-300">Основа → Части → Оформление</b>.
                  Переключайтесь кнопками «Далее / Назад» — длинная прокрутка больше не нужна.
                </span>
              </div>
            </div>

            {/* Правая колонка — живое превью */}
            <div className="animate-fade-up stagger-2 xl:sticky xl:top-[76px] xl:max-h-[calc(100vh-92px)] xl:overflow-y-auto slim-scroll xl:pb-1">
              <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4 backdrop-blur-sm sm:p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  <h2 className="text-[14px] font-extrabold uppercase tracking-[.14em] text-stone-300">Живое превью</h2>
                  <span className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11.5px] font-bold text-stone-400 md:inline-flex">
                    <RectangleHorizontal className="h-3.5 w-3.5 text-emerald-300" /> в файле — всегда горизонтально
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[13px] font-bold text-stone-200 transition hover:bg-white/10"
                  >
                    <Expand className="h-3.5 w-3.5" /> Открыть превью
                  </button>
                </div>

                <TriptychView project={project} variant="live" />

                <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-[12.5px] leading-relaxed text-stone-400">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span>
                    Рабочее превью подстраивается под экран: на смартфоне панели встают друг над другом для читаемости.
                    А итоговый PNG-файл — <b className="text-stone-200">всегда горизонтальный</b>: три панели слева
                    направо во всю ширину холста.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-[12.5px] text-stone-600">
            <span>Мини-конструктор триптихов · I — II — III</span>
            <span>Горизонтальный экспорт PNG · 1600px · слева направо</span>
          </footer>
        </main>
      </div>

      {/* тост */}
      {toast && (
        <div className="animate-scale-in fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-[#24211c]/95 py-2.5 pl-4 pr-5 text-[13.5px] font-bold text-stone-100 shadow-2xl backdrop-blur">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Скрытый ГОРИЗОНТАЛЬНЫЙ постер 1600px для выгрузки: 3 панели строго в ряд */}
      <div aria-hidden className="pointer-events-none fixed left-[-1800px] top-0 z-0">
        <TriptychView ref={exportRef} project={project} variant="poster" />
      </div>

      {/* модалки */}
      {confirmOpen && <ConfirmNewModal onConfirm={confirmNew} onCancel={() => setConfirmOpen(false)} />}
      {previewOpen && (
        <PreviewModal project={project} onClose={() => setPreviewOpen(false)} onDownload={handleDownload} downloading={downloading} />
      )}
      {exportState.open && (
        <ExportModal
          image={exportState.image}
          method={exportState.method}
          fileName={exportState.fileName}
          onClose={() => setExportState((p) => ({ ...p, open: false }))}
          onDownloadAgain={downloadAgain}
        />
      )}
    </div>
  );
}
