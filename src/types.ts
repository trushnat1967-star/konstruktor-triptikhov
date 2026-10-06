export interface TriptychPart {
  heading: string;
  text: string;
  /** dataURL / public path / remote url */
  image: string | null;
}

export interface TriptychStyle {
  paletteId: string;
  backgroundId: string;
  fontId: string;
}

export interface TriptychProject {
  title: string;
  theme: string;
  parts: [TriptychPart, TriptychPart, TriptychPart];
  style: TriptychStyle;
  updatedAt: number;
}

export interface Palette {
  id: string;
  name: string;
  hint: string;
  bg: string;
  card: string;
  ink: string;
  accent: string;
  muted: string;
  line: string;
  chip: string[];
}

export interface BackgroundOption {
  id: string;
  name: string;
  hint: string;
}

export interface FontOption {
  id: string;
  name: string;
  hint: string;
  family: string;
  headingWeight: number;
  letterSpacing: string;
}

export type ExportMethod = 'picker' | 'download' | 'manual' | null;
