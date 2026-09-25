import * as React from 'react';
import type { Exercise, UnitPrefs, IntensityScale } from './ExerciseMetrics';
import type { SerieValues } from './SerieComparativa';

export interface SeriesTableProps extends React.HTMLAttributes<HTMLDivElement> {
  exercise: Exercise;
  /** Series registradas, en orden. */
  sets: SerieValues[];
  /** Escala usada en la sesión; null = sin columna de intensidad. */
  intensity?: IntensityScale | null;
  prefs?: UnitPrefs;
}

/** Tabla de series registradas (historial) con las columnas fijas del ejercicio. */
export function SeriesTable(props: SeriesTableProps): React.ReactElement;
