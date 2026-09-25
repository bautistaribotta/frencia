export type ExerciseKind = 'fuerza' | 'isometrico' | 'cardio' | 'hibrido';
export type MetricKey = 'peso' | 'reps' | 'tiempo' | 'distancia';
export type IntensityScale = 'RIR' | 'RPE';

export interface Exercise {
  id?: string;
  name: string;
  muscle?: string;
  kind: ExerciseKind;
  /** Datos que registra por serie. Híbrido: al menos dos. */
  metrics: MetricKey[];
  /** 'corta' → siempre metros; 'larga' → km o mi según el usuario. Default 'larga'. */
  distScale?: 'corta' | 'larga';
}

export interface ExercisePlan {
  sets: number;
  reps?: number | null;
  /** Segundos. */
  tiempo?: number | null;
  /** En la unidad del ejercicio (m, km o mi). */
  distancia?: number | null;
  intensity?: IntensityScale | null;
  intensityValue?: number | null;
  /** Segundos. */
  rest?: number | null;
}

export interface UnitPrefs { weight?: 'kg' | 'lb'; dist?: 'km' | 'mi'; }

export interface Column { key: MetricKey | 'int'; label: string; unit: string; }

/** Reglas y formatos compartidos por los componentes de registro. No es un componente visual. */
export const ExerciseMetrics: {
  ORDER: MetricKey[];
  KINDS: Record<ExerciseKind, { label: string; icon: string; intensity: 'required' | 'optional'; scales: IntensityScale[] }>;
  LABELS: Record<MetricKey, string>;
  SHORT: Record<MetricKey, string>;
  DASH: string;
  REST_OPTIONS: number[];
  clock(sec: number | null): string;
  durCompact(sec: number | null): string;
  distUnit(ex: Exercise, prefs?: UnitPrefs): 'm' | 'km' | 'mi';
  dist(v: number | null, unit: string, mode?: 'table' | 'compact'): string;
  weight(v: number | null): string;
  metrics(ex: Exercise): MetricKey[];
  planMetrics(ex: Exercise): MetricKey[];
  columns(ex: Exercise, prefs?: UnitPrefs, intensity?: IntensityScale | null): Column[];
  value(key: string, v: number | null, ex: Exercise, prefs?: UnitPrefs, mode?: 'table' | 'compact'): string;
  restVisible(ex: Exercise, sets: number): boolean;
  summary(ex: Exercise, plan: ExercisePlan, prefs?: UnitPrefs): { volume: string; intensity: string | null; rest: string | null; text: string };
};
