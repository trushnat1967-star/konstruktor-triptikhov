import { forwardRef } from 'react';
import { ImagePlus } from 'lucide-react';
import type { TriptychProject } from '../types';
import { PART_LABELS, PART_NUMERALS, getFont, getPalette } from '../constants';

interface Props {
  project: TriptychProject;
  /**
   * live — адаптивное превью в интерфейсе (на узких экранах панели
   * встают друг над другом для читаемости).
   * poster — фиксированный ГОРИЗОНТАЛЬНЫЙ макет 1600px для выгрузки:
   * три панели всегда идут слева направо и занимают основную ширину холста.
   */
  variant?: 'live' | 'poster';
}

/** Фиксированная ширина экспортного холста. Высота всегда меньше — ориентация горизонтальная. */
export const POSTER_WIDTH = 1600;

/** Декоративные слои фона. Только CSS-градиенты — корректно запекаются в PNG. */
function BackgroundLayers({ backgroundId, accent }: { backgroundId: string; accent: string }) {
  if (backgroundId === 'clean') return null;
  if (backgroundId === 'glow') {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(120% 70% at 50% 0%, rgba(255,255,255,.75) 0%, rgba(255,255,255,0) 60%)' }}
      />
    );
  }
  if (backgroundId === 'grain') {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.10'/%3E%3C/svg%3E\")",
        }}
      />
    );
  }
  if (backgroundId === 'lines') {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'repeating-linear-gradient(180deg, rgba(127,127,127,.10) 0px, rgba(127,127,127,.10) 1px, transparent 1px, transparent 26px)' }}
      />
    );
  }
  if (backgroundId === 'arches') {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 bottom-0 top-1/3"
          style={{
            background:
              'radial-gradient(46% 88% at 16.5% 100%, rgba(127,127,127,.13) 0%, rgba(127,127,127,.13) 62%, transparent 63%), radial-gradient(46% 88% at 50% 100%, rgba(127,127,127,.13) 0%, rgba(127,127,127,.13) 62%, transparent 63%), radial-gradient(46% 88% at 83.5% 100%, rgba(127,127,127,.13) 0%, rgba(127,127,127,.13) 62%, transparent 63%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(110% 60% at 50% 0%, rgba(255,255,255,.5) 0%, rgba(255,255,255,0) 55%)' }}
        />
      </div>
    );
  }
  // spots
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: `radial-gradient(38% 46% at 12% 18%, ${accent}26 0%, transparent 70%), radial-gradient(34% 42% at 88% 12%, ${accent}1f 0%, transparent 70%), radial-gradient(46% 52% at 82% 92%, ${accent}24 0%, transparent 70%), radial-gradient(40% 48% at 14% 88%, ${accent}1c 0%, transparent 70%)`,
      }}
    />
  );
}

const TriptychView = forwardRef<HTMLDivElement, Props>(function TriptychView({ project, variant = 'live' }, ref) {
  const palette = getPalette(project.style.paletteId);
  const font = getFont(project.style.fontId);
  const poster = variant === 'poster';

  const title = project.title.trim();
  const theme = project.theme.trim();

  return (
    <div
      ref={ref}
      className={poster ? 'relative overflow-hidden' : 'relative overflow-hidden rounded-2xl'}
      style={{
        // Постер: строго фиксированная ширина — гарантия горизонтального холста при экспорте
        width: poster ? POSTER_WIDTH : undefined,
        minWidth: poster ? POSTER_WIDTH : undefined,
        maxWidth: poster ? POSTER_WIDTH : undefined,
        backgroundColor: palette.bg,
        color: palette.ink,
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}
    >
      <BackgroundLayers backgroundId={project.style.backgroundId} accent={palette.accent} />

      <div className="relative" style={{ padding: poster ? 60 : 20 }}>
        {/* Шапка */}
        <div className="text-center" style={{ marginBottom: poster ? 36 : 16 }}>
          <div
            className="inline-flex items-center gap-2 rounded-full border"
            style={{
              borderColor: palette.line,
              color: palette.muted,
              fontSize: poster ? 14 : 10.5,
              letterSpacing: '.22em',
              padding: poster ? '8px 20px' : '5px 12px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette.accent }} />
            Триптих · концепция
          </div>

          <h1
            style={{
              fontFamily: font.family,
              fontWeight: font.headingWeight,
              letterSpacing: font.letterSpacing,
              fontSize: poster ? 68 : 'clamp(24px, 4vw, 36px)',
              lineHeight: 1.08,
              marginTop: poster ? 20 : 10,
              color: title ? palette.ink : palette.muted,
              opacity: title ? 1 : 0.55,
              fontStyle: title ? 'normal' : 'italic',
            }}
          >
            {title || 'Название триптиха'}
          </h1>

          <p
            style={{
              color: palette.muted,
              opacity: theme ? 1 : 0.6,
              fontStyle: theme ? 'normal' : 'italic',
              fontSize: poster ? 20 : 13,
              lineHeight: 1.6,
              maxWidth: poster ? 980 : 560,
              margin: `${poster ? 16 : 8}px auto 0`,
            }}
          >
            {theme || 'Общая тема, которая связывает все три части…'}
          </p>

          <div className="flex items-center justify-center gap-3" style={{ marginTop: poster ? 24 : 12 }}>
            <span className="h-px w-16" style={{ backgroundColor: palette.line }} />
            <span
              className="inline-block rotate-45"
              style={{ width: poster ? 9 : 7, height: poster ? 9 : 7, backgroundColor: palette.accent }}
            />
            <span className="h-px w-16" style={{ backgroundColor: palette.line }} />
          </div>
        </div>

        {/* Три части.
            Постер: жёсткая сетка 3 колонки инлайн-стилями (не зависит от Tailwind-брейкпоинтов
            и ширины вьюпорта) — панели всегда слева направо.
            Live: адаптивная сетка для удобной работы в конструкторе. */}
        <div
          className={poster ? undefined : 'grid grid-cols-1 min-[600px]:grid-cols-3'}
          style={
            poster
              ? { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 30 }
              : { gap: 12 }
          }
        >
          {project.parts.map((part, i) => {
            const heading = part.heading.trim();
            const text = part.text.trim();
            return (
              <article
                key={i}
                className="overflow-hidden"
                style={{
                  minWidth: 0,
                  backgroundColor: palette.card,
                  border: `1px solid ${palette.line}`,
                  borderRadius: poster ? 22 : 14,
                  boxShadow: poster
                    ? '0 24px 60px -24px rgba(0,0,0,.25)'
                    : '0 12px 32px -16px rgba(0,0,0,.18)',
                }}
              >
                {/* Изображение — широкое 16/10, чтобы панели были приземистыми и холст оставался горизонтальным */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    aspectRatio: '16 / 10',
                    background: `linear-gradient(135deg, ${palette.bg} 0%, ${palette.line} 100%)`,
                    borderBottom: `1px solid ${palette.line}`,
                  }}
                >
                  {part.image ? (
                    <img
                      src={part.image}
                      alt={heading || `Часть ${PART_LABELS[i]}`}
                      crossOrigin="anonymous"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full flex-col items-center justify-center gap-2"
                      style={{ color: palette.muted }}
                    >
                      <ImagePlus style={{ width: poster ? 44 : 26, height: poster ? 44 : 26, opacity: 0.5 }} strokeWidth={1.5} />
                      <span style={{ fontSize: poster ? 15 : 11, opacity: 0.7, fontStyle: 'italic' }}>
                        Изображение части {PART_NUMERALS[i]}
                      </span>
                    </div>
                  )}
                  <span
                    className="absolute left-3 top-3 rounded-full"
                    style={{
                      backgroundColor: 'rgba(0,0,0,.55)',
                      color: '#fff',
                      fontSize: poster ? 14 : 10.5,
                      fontWeight: 800,
                      letterSpacing: '.18em',
                      padding: poster ? '7px 16px 7px 18px' : '4px 10px 4px 12px',
                    }}
                  >
                    {PART_NUMERALS[i]}
                  </span>
                </div>

                {/* Текст */}
                <div style={{ padding: poster ? '28px 30px 32px' : '12px 14px 16px' }}>
                  <div
                    style={{
                      fontSize: poster ? 13 : 10,
                      fontWeight: 800,
                      letterSpacing: '.2em',
                      textTransform: 'uppercase',
                      color: palette.accent,
                      marginBottom: poster ? 10 : 5,
                    }}
                  >
                    {PART_LABELS[i]} часть
                  </div>
                  <h2
                    style={{
                      fontFamily: font.family,
                      fontWeight: font.headingWeight,
                      letterSpacing: font.letterSpacing,
                      fontSize: poster ? 33 : 18,
                      lineHeight: 1.15,
                      color: heading ? palette.ink : palette.muted,
                      opacity: heading ? 1 : 0.5,
                      fontStyle: heading ? 'normal' : 'italic',
                    }}
                  >
                    {heading || 'Заголовок части'}
                  </h2>
                  <p
                    style={{
                      fontSize: poster ? 17.5 : 12.5,
                      lineHeight: 1.65,
                      color: palette.muted,
                      opacity: text ? 1 : 0.6,
                      fontStyle: text ? 'normal' : 'italic',
                      marginTop: poster ? 12 : 6,
                    }}
                  >
                    {text || 'Короткий текст: образ, настроение и роль этой части в общей истории.'}
                  </p>
                </div>
                <div className="h-1 w-full" style={{ backgroundColor: palette.accent, opacity: 0.85 }} />
              </article>
            );
          })}
        </div>

        {/* Подпись */}
        <div
          className="text-center"
          style={{ marginTop: poster ? 32 : 14, fontSize: poster ? 14 : 10.5, letterSpacing: '.28em', textTransform: 'uppercase', color: palette.muted, opacity: 0.75, fontWeight: 700 }}
        >
          I — II — III · единая композиция
        </div>
      </div>
    </div>
  );
});

export default TriptychView;
