/* Dia de entrenamiento: tipos, presentacion y persistencia.
   Lo comparten el wizard de creacion (src/app/create-routine.tsx), que arma
   dias en memoria, y la edicion (src/app/edit-day.tsx), que trae uno de la base
   y lo devuelve. Ver docs/specs/rutinas-y-dias.md */

import { supabase } from './supabase';

export type Medidor = 'rir' | 'rpe';

/** Ejercicio de un dia. Vive en memoria mientras se lo edita. */
export interface DayExercise {
  // Identidad propia de la fila, estable aunque se reordene o se repita el
  // mismo ejercicio en el dia. El indice no sirve como key: al arrastrar
  // cambia, y React desmontaria la fila en pleno gesto.
  uid: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  intensityKind: Medidor;
  intensityValue: number;
  // Descanso fijo entre series, en segundos. null = sin temporizador.
  restSeconds: number | null;
}

/** Dia de entrenamiento en edicion. */
export interface TrainingDay {
  name: string;
  weekdays: boolean[];
  exercises: DayExercise[];
}

let uidSeq = 0;
export function nextUid(): string {
  uidSeq += 1;
  return `ex-${uidSeq}`;
}

export function nuevoDia(n: number): TrainingDay {
  return { name: `Día ${n}`, weekdays: Array(7).fill(false), exercises: [] };
}

// Iniciales e indices de la semana (0 = lunes ... 6 = domingo, igual que el
// rango del check de training_day_weekdays.weekday).
export const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
export const SEMANA_NOMBRES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

// Opciones de intensidad segun el medidor del usuario. En RIR sumamos "Fallo"
// (centinela -1) como paso por debajo de 0 RIR; en RPE va de 1 a 10.
export function intensityOptions(medidor: Medidor): { label: string; value: number }[] {
  if (medidor === 'rir') {
    return [
      { label: 'Fallo', value: -1 },
      ...[0, 1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n })),
    ];
  }
  return Array.from({ length: 10 }, (_, i) => ({ label: String(i + 1), value: i + 1 }));
}

/** Valor inicial razonable al abrir el configurador de un ejercicio. */
export function defaultIntensity(medidor: Medidor): number {
  return medidor === 'rir' ? 2 : 8;
}

export function intensityLabel(kind: Medidor, value: number): string {
  if (kind === 'rir') return value < 0 ? 'Al fallo' : `${value} RIR`;
  return `RPE ${value}`;
}

// Descansos ofrecidos. Nadie necesita elegir 137 segundos: los valores reales
// caen en la grilla de 30 segundos, y por eso todas las apps de entrenamiento
// ofrecen una lista y no un campo libre. "Sin" guarda null: la sesion no
// muestra temporizador para ese ejercicio.
export const DESCANSOS: { label: string; value: number | null }[] = [
  { label: 'Sin', value: null },
  { label: '0:30', value: 30 },
  { label: '0:45', value: 45 },
  { label: '1:00', value: 60 },
  { label: '1:30', value: 90 },
  { label: '2:00', value: 120 },
  { label: '2:30', value: 150 },
  { label: '3:00', value: 180 },
  { label: '4:00', value: 240 },
  { label: '5:00', value: 300 },
];

// Dos minutos: el descanso tipico de hipertrofia y el punto medio de lo que
// ofrecen las apps del rubro. Sirve como valor razonable sin configurar nada.
export const DESCANSO_POR_DEFECTO = 120;

/** Segundos a mm:ss, el formato con el que se lee un descanso. */
export function restLabel(seconds: number | null): string {
  if (seconds === null) return 'Sin descanso';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Linea de resumen de un ejercicio ya agregado: "3x10 · 2 RIR · 2:00". */
export function resumenEjercicio(ex: DayExercise): string {
  return [
    `${ex.sets}x${ex.reps}`,
    intensityLabel(ex.intensityKind, ex.intensityValue),
    // Sin descanso no suma nada al resumen: se omite en vez de ocupar una
    // linea con la ausencia del dato.
    ex.restSeconds === null ? null : restLabel(ex.restSeconds),
  ]
    .filter(Boolean)
    .join(' · ');
}

/**
 * Mete un ejercicio en la lista del dia: lo reemplaza si ya estaba (mismo uid,
 * o sea que se lo estaba editando) o lo agrega al final si es nuevo.
 *
 * Va por uid y no por indice para que reemplazar no dependa de que la lista no
 * se haya movido entre que se abrio el editor y que se guardo.
 */
export function aplicarEjercicio(
  exercises: DayExercise[],
  ejercicio: DayExercise,
): DayExercise[] {
  const existe = exercises.some((e) => e.uid === ejercicio.uid);
  if (!existe) return [...exercises, ejercicio];
  return exercises.map((e) => (e.uid === ejercicio.uid ? ejercicio : e));
}

// --- Persistencia ------------------------------------------------------------

/** Un dia traido de la base, con el nombre de la rutina a la que pertenece. */
export interface DiaCargado {
  dia: TrainingDay;
  rutina: string;
}

/**
 * Trae un dia completo: nombre, dias de la semana y ejercicios en orden.
 * Devuelve null si no existe o no es del usuario (lo resuelve RLS).
 */
export async function cargarDia(trainingDayId: string): Promise<DiaCargado | null> {
  const { data, error } = await supabase
    .from('training_days')
    .select(
      'name, routines(name), training_day_weekdays(weekday), training_day_exercises(exercise_id, position, sets, reps, intensity_kind, intensity_value, rest_seconds, exercises(name))',
    )
    .eq('id', trainingDayId)
    .maybeSingle();

  if (error || !data) return null;

  const weekdays = Array(7).fill(false) as boolean[];
  for (const w of data.training_day_weekdays ?? []) {
    if (w.weekday >= 0 && w.weekday <= 6) weekdays[w.weekday] = true;
  }

  // El embed de una relacion to-one puede llegar como objeto o como array de
  // uno segun la version del cliente; normalizamos.
  const unoDe = <T,>(valor: T | T[] | null): T | null =>
    Array.isArray(valor) ? (valor[0] ?? null) : valor;

  const exercises: DayExercise[] = (data.training_day_exercises ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((fila) => ({
      uid: nextUid(),
      exerciseId: fila.exercise_id,
      name: unoDe(fila.exercises as { name?: string } | { name?: string }[] | null)?.name ?? 'Ejercicio',
      sets: fila.sets ?? 3,
      reps: fila.reps ?? 10,
      intensityKind: fila.intensity_kind === 'rpe' ? 'rpe' : 'rir',
      intensityValue: Number(fila.intensity_value),
      restSeconds: fila.rest_seconds,
    }));

  return {
    dia: { name: data.name, weekdays, exercises },
    rutina: unoDe(data.routines as { name?: string } | { name?: string }[] | null)?.name ?? '',
  };
}

/**
 * Reemplaza el contenido del dia: nombre, dias de la semana y ejercicios.
 *
 * Va por RPC y no por tres llamadas sueltas porque guardar es borrar e
 * insertar: si la red se corta entre el delete y el insert, el dia queda
 * vacio. La funcion corre todo en una transaccion, asi que o entra entero o no
 * entra nada.
 */
export async function guardarDia(trainingDayId: string, dia: TrainingDay): Promise<boolean> {
  const { error } = await supabase.rpc('guardar_dia_entrenamiento', {
    p_day_id: trainingDayId,
    p_name: dia.name.trim() || 'Día',
    p_weekdays: dia.weekdays.map((on, i) => (on ? i : -1)).filter((i) => i >= 0),
    p_exercises: dia.exercises.map((ex, pos) => ({
      exercise_id: ex.exerciseId,
      position: pos,
      sets: ex.sets,
      reps: ex.reps,
      intensity_kind: ex.intensityKind,
      intensity_value: ex.intensityValue,
      rest_seconds: ex.restSeconds,
    })),
  });

  return !error;
}
