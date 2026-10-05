/* Dia de entrenamiento: tipos, presentacion y persistencia.
   Lo comparten el wizard de creacion (src/app/create-routine.tsx), que arma
   dias en memoria, y la edicion (src/app/edit-day.tsx), que trae uno de la base
   y lo devuelve. Ver docs/specs/rutinas-y-dias.md */

import { distanciaCompacta, type UnidadDistancia } from './distancia';
import {
  COLUMNAS_TIPO,
  tipoDeFila,
  type DatosRegistrados,
  type FilaTipo,
  type TipoEjercicio,
} from './exercises';
import { mostrarPeso, type UnidadPeso } from './peso';
import { supabase } from './supabase';
import { duracionCompacta } from './tiempo';

export type Medidor = 'rir' | 'rpe';

/** Ejercicio de un dia. Vive en memoria mientras se lo edita.
 *
 *  Que campos lleva depende de lo que registra el ejercicio (`tracks`): la
 *  fuerza prescribe reps, el cardio y el isometrico tiempo, el cardio ademas
 *  distancia. Lo que el ejercicio no registra va en null. El peso solo se
 *  planifica en isometricos, y es opcional. */
export interface DayExercise {
  // Identidad propia de la fila, estable aunque se reordene o se repita el
  // mismo ejercicio en el dia. El indice no sirve como key: al arrastrar
  // cambia, y React desmontaria la fila en pleno gesto.
  uid: string;
  exerciseId: string;
  name: string;
  kind: TipoEjercicio;
  tracks: DatosRegistrados;
  sets: number;
  reps: number | null;
  durationSeconds: number | null;
  distanceM: number | null;
  // Peso por serie, en kg. Solo isometricos; null = sin peso.
  weightKg: number | null;
  // null = sin intensidad: en cardio e isometricos el RPE es opcional.
  intensityKind: Medidor | null;
  intensityValue: number | null;
  // Descanso fijo entre series, en segundos. null = sin temporizador.
  restSeconds: number | null;
}

/** El cardio se planifica y se registra como una sola serie continua, sin
 *  descanso. Ver docs/specs/catalogo-de-ejercicios.md, seccion 6.5. */
export function esSerieUnica(kind: TipoEjercicio): boolean {
  return kind === 'cardio';
}

/** Cardio e isometricos miden esfuerzo solo con RPE, y es opcional:
 *  "repeticiones en reserva" no aplica a correr ni a sostener una posicion. */
export function esRpeOpcional(kind: TipoEjercicio): boolean {
  return kind === 'cardio' || kind === 'isometrico';
}

/** El plan puede prescribir peso solo en isometricos que lo registran (una
 *  plancha con disco). En fuerza el peso se elige serie por serie. */
export function planificaPeso(kind: TipoEjercicio, tracks: DatosRegistrados): boolean {
  return kind === 'isometrico' && tracks.weight;
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
// Para los resumenes de una linea, donde el nombre entero no entra y la
// inicial sola no se entiende fuera de la tira de siete.
export const SEMANA_CORTA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Rango de intensidad segun el medidor del usuario. En RIR el minimo es
// "Fallo" (centinela -1), un paso por debajo de 0 RIR; en RPE va de 1 a 10.
export function intensityRange(medidor: Medidor): { min: number; max: number } {
  return medidor === 'rir' ? { min: -1, max: 5 } : { min: 1, max: 10 };
}

/** Valor de intensidad tal como se muestra en el selector: numero o "Fallo". */
export function intensityValueLabel(medidor: Medidor, value: number): string {
  return medidor === 'rir' && value < 0 ? 'Fallo' : String(value);
}

/** Valor inicial razonable al abrir el configurador de un ejercicio. */
export function defaultIntensity(medidor: Medidor): number {
  return medidor === 'rir' ? 2 : 8;
}

export function intensityLabel(kind: Medidor, value: number): string {
  if (kind === 'rir') return value < 0 ? 'Al fallo' : `RIR ${value}`;
  return `RPE ${value}`;
}

// El descanso se elige libre en ruedas de minutos y segundos (cada 5 s, hasta
// DESCANSO_MAXIMO). 0:00 guarda null: la sesion no muestra temporizador para
// ese ejercicio.
export const DESCANSO_MAXIMO = 10 * 60 + 55;

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

/** Partes del resumen de un ejercicio ya agregado, para ExerciseSummary.
 *
 *  Formato del design system: "[Nx]volumen · intensidad · descanso". El
 *  volumen junta los datos que prescribe el plan ("30 min · 5 km"); el prefijo
 *  Nx y el descanso se omiten en el mismo caso, el cardio de una sola serie. */
export function partesResumen(
  ex: DayExercise,
  unidadDistancia: UnidadDistancia,
  unidadPeso: UnidadPeso,
): {
  volume: string;
  intensity: string | null;
  rest: string | null;
} {
  const partes: string[] = [];
  if (ex.tracks.reps && ex.reps !== null) partes.push(String(ex.reps));
  if (ex.tracks.duration && ex.durationSeconds !== null) {
    partes.push(duracionCompacta(ex.durationSeconds));
  }
  if (ex.tracks.distance && ex.distanceM !== null) {
    partes.push(distanciaCompacta(ex.distanceM, unidadDistancia));
  }
  if (planificaPeso(ex.kind, ex.tracks) && ex.weightKg !== null) {
    partes.push(`${mostrarPeso(ex.weightKg, unidadPeso)} ${unidadPeso}`);
  }

  const conSeries = !(esSerieUnica(ex.kind) && ex.sets === 1);
  if (conSeries && partes.length > 0) partes[0] = `${ex.sets}x${partes[0]}`;
  if (conSeries && partes.length === 0) partes.push(`${ex.sets} series`);

  return {
    volume: partes.join(' · '),
    intensity:
      ex.intensityKind === null || ex.intensityValue === null
        ? null
        : intensityLabel(ex.intensityKind, ex.intensityValue),
    // Sin descanso no suma nada al resumen: se omite en vez de ocupar una
    // linea con la ausencia del dato.
    rest: !conSeries || ex.restSeconds === null ? null : duracionCompacta(ex.restSeconds),
  };
}

/** Linea de resumen en texto plano: "3x10 · RIR 2 · 2 min". */
export function resumenEjercicio(
  ex: DayExercise,
  unidadDistancia: UnidadDistancia,
  unidadPeso: UnidadPeso,
): string {
  const { volume, intensity, rest } = partesResumen(ex, unidadDistancia, unidadPeso);
  return [volume, intensity, rest].filter(Boolean).join(' · ');
}

/** Fila de training_day_exercises lista para insertar (o para mandar a
 *  guardar_dia_entrenamiento). Lo que el ejercicio no registra va en null:
 *  el trigger de la tabla rechaza cualquier dato de mas. */
export function filaEjercicio(ex: DayExercise, position: number) {
  return {
    exercise_id: ex.exerciseId,
    position,
    sets: ex.sets,
    reps: ex.tracks.reps ? ex.reps : null,
    duration_seconds: ex.tracks.duration ? ex.durationSeconds : null,
    distance_m: ex.tracks.distance ? ex.distanceM : null,
    weight_kg: planificaPeso(ex.kind, ex.tracks) ? ex.weightKg : null,
    intensity_kind: ex.intensityKind,
    intensity_value: ex.intensityKind === null ? null : ex.intensityValue,
    rest_seconds: esSerieUnica(ex.kind) ? null : ex.restSeconds,
  };
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
      `name, routines(name), training_day_weekdays(weekday), training_day_exercises(exercise_id, position, sets, reps, duration_seconds, distance_m, weight_kg, intensity_kind, intensity_value, rest_seconds, exercises(name, ${COLUMNAS_TIPO}))`,
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

  const exercises: DayExercise[] = ((data.training_day_exercises ?? []) as FilaPlan[])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((fila) => {
      const ejercicio = unoDe(fila.exercises);
      const { kind, tracks } = tipoDeFila(ejercicio);
      return {
        uid: nextUid(),
        exerciseId: fila.exercise_id,
        name: ejercicio?.name ?? 'Ejercicio',
        kind,
        tracks,
        sets: fila.sets ?? (esSerieUnica(kind) ? 1 : 3),
        reps: tracks.reps ? (fila.reps ?? 10) : null,
        durationSeconds: fila.duration_seconds,
        distanceM: fila.distance_m,
        weightKg: fila.weight_kg === null ? null : Number(fila.weight_kg),
        ...intensidadDeFila(fila.intensity_kind, fila.intensity_value),
        restSeconds: fila.rest_seconds,
      };
    });

  return {
    dia: { name: data.name, weekdays, exercises },
    rutina: unoDe(data.routines as { name?: string } | { name?: string }[] | null)?.name ?? '',
  };
}

/** Un ejercicio del dia tal como llega de la base, con su ejercicio embebido. */
interface FilaPlan {
  exercise_id: string;
  position: number;
  sets: number | null;
  reps: number | null;
  duration_seconds: number | null;
  distance_m: number | null;
  // numeric llega como string desde PostgREST.
  weight_kg: number | string | null;
  intensity_kind: string | null;
  intensity_value: number | string | null;
  rest_seconds: number | null;
  exercises:
    | ({ name?: string } & FilaTipo)
    | ({ name?: string } & FilaTipo)[]
    | null;
}

/** Intensidad de una fila de la base. Sin medidor queda "sin intensidad". */
export function intensidadDeFila(
  kind: string | null,
  value: number | string | null,
): { intensityKind: Medidor | null; intensityValue: number | null } {
  if (kind !== 'rir' && kind !== 'rpe') return { intensityKind: null, intensityValue: null };
  return { intensityKind: kind, intensityValue: value === null ? null : Number(value) };
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
    p_exercises: dia.exercises.map(filaEjercicio),
  });

  return !error;
}

/** Resultado de intentar borrar un dia. `ultimo` = es el unico de la rutina. */
export type ResultadoBorrado = 'ok' | 'ultimo' | 'error';

/**
 * Borra un dia de entrenamiento con sus ejercicios y dias de semana (cascade en
 * la base). Las sesiones ya registradas no se pierden: su vinculo al dia queda
 * en null.
 *
 * No deja borrar el ultimo dia de la rutina: una rutina sin dias no sirve para
 * nada, la misma regla que la pantalla de editar rutina.
 */
export async function eliminarDia(trainingDayId: string): Promise<ResultadoBorrado> {
  const { data: dia, error: errDia } = await supabase
    .from('training_days')
    .select('routine_id')
    .eq('id', trainingDayId)
    .maybeSingle();
  if (errDia || !dia) return 'error';

  const { count, error: errCount } = await supabase
    .from('training_days')
    .select('id', { count: 'exact', head: true })
    .eq('routine_id', dia.routine_id);
  if (errCount || count === null) return 'error';
  if (count <= 1) return 'ultimo';

  const { error } = await supabase.from('training_days').delete().eq('id', trainingDayId);
  return error ? 'error' : 'ok';
}
