/* Frencia · Columnas de la grilla de la serie (SerieComparativa) para cada
   tipo de ejercicio. */

import type { ColumnaSerie } from '@/components/SerieComparativa';
import { distanciaTabla, type UnidadDistancia } from '@/lib/distancia';
import { mostrarPeso, type UnidadPeso } from '@/lib/peso';
import type { EjercicioPlan, Medidor, SerieFantasma } from '@/lib/session';
import { valorIntensidad, type ValoresSerie } from '@/lib/sesion-pasos';
import { reloj } from '@/lib/tiempo';

/** Fuerza: peso, reps y esfuerzo, las tres editables en la fila de hoy. */
export function columnasFuerza(
  ej: EjercicioPlan,
  fantasma: SerieFantasma | undefined,
  hoy: ValoresSerie,
  unidad: UnidadPeso,
  medidor: Medidor,
  setCampo: <K extends keyof ValoresSerie>(campo: K, valor: ValoresSerie[K]) => void,
): ColumnaSerie[] {
  const etiquetaMedidor = medidor === 'rir' ? 'RIR' : 'RPE';
  return [
    {
      key: 'peso',
      label: unidad,
      // La rutina nunca prescribe peso.
      plan: null,
      anterior: fantasma?.weightKg != null ? String(mostrarPeso(fantasma.weightKg, unidad)) : null,
      hoy: hoy.peso,
      onHoy: (t) => setCampo('peso', t),
      teclado: 'decimal-pad',
      accesible: `Peso en ${unidad}`,
    },
    {
      key: 'reps',
      label: 'Reps',
      plan: ej.reps === null ? null : String(ej.reps),
      anterior: fantasma?.reps != null ? String(fantasma.reps) : null,
      hoy: hoy.reps,
      onHoy: (t) => setCampo('reps', t),
      accesible: 'Repeticiones',
    },
    {
      key: 'intensidad',
      label: etiquetaMedidor,
      plan: valorIntensidad(ej.intensityKind, ej.intensityValue),
      anterior: fantasma ? valorIntensidad(fantasma.intensityKind, fantasma.intensityValue) : null,
      hoy: hoy.intensidad,
      onHoy: (t) => setCampo('intensidad', t),
      accesible: etiquetaMedidor,
    },
  ];
}

/** Isometrico: peso, tiempo y el RPE si el plan lo pide. Solo plan y ultima:
 *  lo de hoy se carga en el cronometro y los campos de abajo de la grilla. */
export function columnasIsometrico(
  ej: EjercicioPlan,
  fantasma: SerieFantasma | undefined,
  unidad: UnidadPeso,
): ColumnaSerie[] {
  const columnas: ColumnaSerie[] = [];
  if (ej.tracks.weight) {
    columnas.push({
      key: 'peso',
      label: unidad,
      plan: ej.weightKg === null ? null : String(mostrarPeso(ej.weightKg, unidad)),
      anterior: fantasma?.weightKg != null ? String(mostrarPeso(fantasma.weightKg, unidad)) : null,
      hoy: '',
      accesible: `Peso en ${unidad}`,
    });
  }
  if (ej.tracks.duration) {
    columnas.push({
      key: 'tiempo',
      label: 'Tiempo',
      plan: ej.durationSeconds === null ? null : reloj(ej.durationSeconds),
      anterior: fantasma?.durationSeconds != null ? reloj(fantasma.durationSeconds) : null,
      hoy: '',
      accesible: 'Tiempo',
    });
  }
  if (ej.intensityKind !== null) {
    columnas.push({
      key: 'intensidad',
      label: 'RPE',
      plan: valorIntensidad(ej.intensityKind, ej.intensityValue),
      anterior: fantasma ? valorIntensidad(fantasma.intensityKind, fantasma.intensityValue) : null,
      hoy: '',
      accesible: 'RPE',
    });
  }
  return columnas;
}

/** Cardio: tiempo, distancia y el RPE si el plan lo pide. Solo plan y ultima:
 *  lo de hoy se carga en los campos de abajo de la grilla. */
export function columnasCardio(
  ej: EjercicioPlan,
  fantasma: SerieFantasma | undefined,
  unidadDistancia: UnidadDistancia,
): ColumnaSerie[] {
  const columnas: ColumnaSerie[] = [];
  if (ej.tracks.duration) {
    columnas.push({
      key: 'tiempo',
      label: 'Tiempo',
      plan: ej.durationSeconds === null ? null : reloj(ej.durationSeconds),
      anterior: fantasma?.durationSeconds != null ? reloj(fantasma.durationSeconds) : null,
      hoy: '',
      accesible: 'Tiempo',
    });
  }
  if (ej.tracks.distance) {
    columnas.push({
      key: 'distancia',
      label: unidadDistancia,
      plan: ej.distanceM === null ? null : distanciaTabla(ej.distanceM, unidadDistancia),
      anterior:
        fantasma?.distanceM != null ? distanciaTabla(fantasma.distanceM, unidadDistancia) : null,
      hoy: '',
      accesible: `Distancia en ${unidadDistancia}`,
    });
  }
  if (ej.intensityKind !== null) {
    columnas.push({
      key: 'intensidad',
      label: 'RPE',
      plan: valorIntensidad(ej.intensityKind, ej.intensityValue),
      anterior: fantasma ? valorIntensidad(fantasma.intensityKind, fantasma.intensityValue) : null,
      hoy: '',
      accesible: 'RPE',
    });
  }
  return columnas;
}
