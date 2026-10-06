import type { BackgroundOption, FontOption, Palette, TriptychProject } from './types';

export const PART_LABELS = ['Левая', 'Центральная', 'Правая'] as const;
export const PART_NUMERALS = ['I', 'II', 'III'] as const;

export const PALETTES: Palette[] = [
  {
    id: 'gallery',
    name: 'Галерейная',
    hint: 'Тёплый свет зала',
    bg: '#F5F0E6',
    card: '#FFFFFF',
    ink: '#1C1917',
    accent: '#B45309',
    muted: '#837768',
    line: '#E4DACA',
    chip: ['#1C1917', '#B45309', '#F5F0E6', '#FFFFFF'],
  },
  {
    id: 'night',
    name: 'Ночь в музее',
    hint: 'Глубокий графит',
    bg: '#12100D',
    card: '#1E1B16',
    ink: '#F3EDE0',
    accent: '#D9A441',
    muted: '#A39E93',
    line: '#33302A',
    chip: ['#12100D', '#D9A441', '#F3EDE0', '#1E1B16'],
  },
  {
    id: 'terracotta',
    name: 'Терракота',
    hint: 'Жар южной глины',
    bg: '#FFF3E7',
    card: '#FFFFFF',
    ink: '#431407',
    accent: '#C2410C',
    muted: '#A08068',
    line: '#F2CFAF',
    chip: ['#431407', '#C2410C', '#FFF3E7', '#FDBA74'],
  },
  {
    id: 'abyss',
    name: 'Морская глубина',
    hint: 'Холод и воздух',
    bg: '#EAF2F8',
    card: '#FFFFFF',
    ink: '#0C2D48',
    accent: '#0E7490',
    muted: '#647D8F',
    line: '#BFDBEC',
    chip: ['#0C2D48', '#0E7490', '#EAF2F8', '#7DD3FC'],
  },
  {
    id: 'garden',
    name: 'Сад',
    hint: 'Утро в зелени',
    bg: '#EDF5EC',
    card: '#FFFFFF',
    ink: '#14532D',
    accent: '#15803D',
    muted: '#6F8A74',
    line: '#C4E3C6',
    chip: ['#14532D', '#15803D', '#EDF5EC', '#86EFAC'],
  },
  {
    id: 'avantgarde',
    name: 'Авангард',
    hint: 'Пурпур и дерзость',
    bg: '#F4EEFB',
    card: '#FFFFFF',
    ink: '#33124F',
    accent: '#7E22CE',
    muted: '#8B7AA6',
    line: '#DCCBF3',
    chip: ['#33124F', '#7E22CE', '#F4EEFB', '#F0ABFC'],
  },
];

export const BACKGROUNDS: BackgroundOption[] = [
  { id: 'clean', name: 'Чистый холст', hint: 'Ровная заливка' },
  { id: 'glow', name: 'Свечение', hint: 'Мягкий свет сверху' },
  { id: 'grain', name: 'Льняное зерно', hint: 'Живая фактура' },
  { id: 'lines', name: 'Тонкие линии', hint: 'Горизонтальный ритм' },
  { id: 'arches', name: 'Аркада', hint: 'Музейные арки' },
  { id: 'spots', name: 'Пятна краски', hint: 'Живописные облака' },
];

export const FONTS: FontOption[] = [
  {
    id: 'academy',
    name: 'Академия',
    hint: 'Антиква с характером',
    family: "'Playfair Display', Georgia, serif",
    headingWeight: 700,
    letterSpacing: '-0.01em',
  },
  {
    id: 'classic',
    name: 'Классика',
    hint: 'Книжный Cormorant',
    family: "'Cormorant Garamond', Georgia, serif",
    headingWeight: 600,
    letterSpacing: '0em',
  },
  {
    id: 'modern',
    name: 'Модерн',
    hint: 'Строгий гротеск',
    family: "'Manrope', system-ui, sans-serif",
    headingWeight: 800,
    letterSpacing: '-0.02em',
  },
  {
    id: 'avantgarde',
    name: 'Выставка',
    hint: 'Широкий Unbounded',
    family: "'Unbounded', system-ui, sans-serif",
    headingWeight: 600,
    letterSpacing: '-0.01em',
  },
  {
    id: 'manuscript',
    name: 'Рукопись',
    hint: 'Живой росчерк',
    family: "'Marck Script', cursive",
    headingWeight: 400,
    letterSpacing: '0em',
  },
  {
    id: 'mono',
    name: 'Моно',
    hint: 'Структурный JetBrains Mono',
    family: "'JetBrains Mono', ui-monospace, monospace",
    headingWeight: 700,
    letterSpacing: '-0.02em',
  },
];

export const EMPTY_PART = { heading: '', text: '', image: null };

export function emptyProject(): TriptychProject {
  return {
    title: '',
    theme: '',
    parts: [
      { ...EMPTY_PART },
      { ...EMPTY_PART },
      { ...EMPTY_PART },
    ] as TriptychProject['parts'],
    style: { paletteId: 'gallery', backgroundId: 'glow', fontId: 'academy' },
    updatedAt: Date.now(),
  };
}

export function demoProject(): TriptychProject {
  return {
    title: 'Тишина трёх часов',
    theme: 'Один и тот же пейзаж — рассветом, полднем и закатом: как меняется свет, настроение и смысл места.',
    parts: [
      {
        heading: 'Рассвет',
        text: 'Туман держится за воду, и мир ещё не решил, каким ему быть. Первый час — про надежду.',
        image: 'images/part-left.jpg',
      },
      {
        heading: 'Полдень',
        text: 'Свет становится прямым и честным. Все тени короткие, все краски — в полную силу.',
        image: 'images/part-center.jpg',
      },
      {
        heading: 'Закат',
        text: 'День складывает инструменты. Горизонт горит тихо, как догорающая свеча в окне.',
        image: 'images/part-right.jpg',
      },
    ] as TriptychProject['parts'],
    style: { paletteId: 'gallery', backgroundId: 'glow', fontId: 'academy' },
    updatedAt: Date.now(),
  };
}

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

export function getFont(id: string): FontOption {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}

export function hasFilledData(p: TriptychProject): boolean {
  if (p.title.trim() || p.theme.trim()) return true;
  return p.parts.some((part) => part.heading.trim() || part.text.trim() || part.image);
}

/** Насколько заполнен проект, 0..100 — для индикатора прогресса */
export function completionOf(p: TriptychProject): number {
  let got = 0;
  const total = 2 + 3 * 3; // название, тема + (заголовок, текст, изображение) × 3
  if (p.title.trim()) got += 1;
  if (p.theme.trim()) got += 1;
  for (const part of p.parts) {
    if (part.heading.trim()) got += 1;
    if (part.text.trim()) got += 1;
    if (part.image) got += 1;
  }
  return Math.round((got / total) * 100);
}
