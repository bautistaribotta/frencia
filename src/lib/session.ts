/* Datos de una sesion de entrenamiento. Ver docs/specs/registro-de-sesion.md
   Cubre: abrir o retomar la sesion, traer el plan del dia, traer las series
   fantasma, guardar cada serie y terminar. */

import { supabase } from './supabase';

export type Medidor = 'rir' | 'rpe';

/** Un ejercicio tal como quedo planificado en el dia. */
export interface EjercicioPlan {
  exerciseId: string;
  name: string;
  /** Series planificadas. Es el punto de partida del wizard, no un limite. */
  sets: number;
  reps: number;
  intensityKind: Medidor;
  intensityValue: number;
  restSeconds: number | null;
}

/** Lo que se hizo en esta misma serie la vez anterior. */
export interface SerieFantasma {
  weightKg: number;
  reps: number;
  intensityKind: Medidor;
  intensityValue: number;
  /** Cuando termino esa sesion, en epoch ms. */
  hechaEl: number;
}

/**
 * "hoy", "ayer", "hace 6 dias". La referencia sirve distinto segun cuanto haga:
 * repetir el peso de anteayer no es lo mismo que repetir el de hace una semana.
 */
export function haceCuanto(epochMs: number): string {
  const hoy = new Date();
  const entonces = new Date(epochMs);
  // Contra el arranque del dia y no contra la hora exacta: entrenar a la manana
  // y mirar a la noche no puede convertir "hoy" en "hace 1 dia".
  const dia = 24 * 60 * 60 * 1000;
  const aMedianoche = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((aMedianoche(hoy) - aMedianoche(entonces)) / dia);

  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  return `hace ${dias} días`;
}

/** Clave de una serie dentro del dia: ejercicio + numero de serie (base 1). */
export function claveSerie(exerciseId: string, setIndex: number): string {
  return `${exerciseId}|${setIndex}`;
}

// Ventana de comparacion. Ver seccion 3.1 del spec: cubre la semana normal mas
// una sesion salteada. Mas alla de eso no se progresa contra el numero viejo.
const DIAS_DE_VENTANA = 10;

/**
 * Devuelve la sesion en curso del usuario, si hay alguna. Solo puede haber una,
 * forzado por indice unico parcial.
 */
export async function sesionEnCurso(
  userId: string,
): Promise<{ id: string; trainingDayId: string | null } | null> {
  const { data } = await supabase
    .from('workout_sessions')
    .select('id, training_day_id')
    .eq('user_id', userId)
    .is('finished_at', null)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, trainingDayId: data.training_day_id };
}

/**
 * Crea una sesion para el dia. Falla si ya hay una en curso: el indice unico
 * parcial no deja tener dos, y quien llama tiene que resolver ese conflicto
 * antes (retomar la vieja o descartarla).
 */
export async function crearSesion(
  userId: string,
  trainingDayId: string,
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ user_id: userId, training_day_id: trainingDayId })
    .select('id')
    .single();

  if (error || !data) return null;
  return { id: data.id };
}

/** Nombre del dia, para cuando se retoma una sesion de otro dia distinto al
 *  que se toco en el home. */
export async function cargarNombreDia(trainingDayId: string): Promise<string | null> {
  const { data } = await supabase
    .from('training_days')
    .select('name')
    .eq('id', trainingDayId)
    .maybeSingle();
  return data?.name ?? null;
}

/** Ejercicios del dia, en el orden en que se entrenan. */
export async function cargarPlan(trainingDayId: string): Promise<EjercicioPlan[]> {
  const { data, error } = await supabase
    .from('training_day_exercises')
    .select('exercise_id, position, sets, reps, intensity_kind, intensity_value, rest_seconds, exercises(name)')
    .eq('training_day_id', trainingDayId)
    .order('position');

  if (error || !data) return [];

  return data.map((fila) => {
    // El embed de una relacion to-one puede llegar como objeto o como array de
    // uno segun la version del cliente; normalizamos.
    const ejercicio = Array.isArray(fila.exercises) ? fila.exercises[0] : fila.exercises;
    return {
      exerciseId: fila.exercise_id,
      name: (ejercicio as { name?: string } | null)?.name ?? 'Ejercicio',
      sets: fila.sets ?? 3,
      reps: fila.reps ?? 10,
      intensityKind: fila.intensity_kind === 'rpe' ? 'rpe' : 'rir',
      intensityValue: Number(fila.intensity_value),
      restSeconds: fila.rest_seconds,
    };
  });
}

/**
 * Series fantasma del dia, indexadas por claveSerie.
 *
 * Trae todas las series de las sesiones terminadas del dia dentro de la ventana
 * y resuelve en memoria cual gana. Es una sola consulta de pocas filas, en vez
 * de una por ejercicio en medio del entrenamiento, donde la conexion del
 * gimnasio suele ser mala.
 *
 * Para cada (ejercicio, numero de serie) gana la sesion mas reciente que lo
 * tenga, y no la ultima sesion entera: asi saltear un ejercicio una vez no borra
 * su referencia.
 */
export async function cargarFantasmas(
  trainingDayId: string,
): Promise<Map<string, SerieFantasma>> {
  const desde = new Date(Date.now() - DIAS_DE_VENTANA * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('session_sets')
    .select(
      'exercise_id, set_index, weight_kg, reps, intensity_kind, intensity_value, workout_sessions!inner(finished_at, training_day_id)',
    )
    .eq('workout_sessions.training_day_id', trainingDayId)
    .not('workout_sessions.finished_at', 'is', null)
    .gte('workout_sessions.finished_at', desde);

  const mapa = new Map<string, SerieFantasma>();
  if (error || !data) return mapa;

  const finDe = (fila: (typeof data)[number]): number => {
    const s = Array.isArray(fila.workout_sessions)
      ? fila.workout_sessions[0]
      : fila.workout_sessions;
    const valor = (s as { finished_at?: string } | null)?.finished_at;
    return valor ? Date.parse(valor) : 0;
  };

  // De mas nueva a mas vieja, y el primero que aparece para cada clave gana.
  const ordenadas = [...data].sort((a, b) => finDe(b) - finDe(a));

  for (const fila of ordenadas) {
    const clave = claveSerie(fila.exercise_id, fila.set_index);
    if (mapa.has(clave)) continue;
    mapa.set(clave, {
      weightKg: Number(fila.weight_kg),
      reps: fila.reps,
      intensityKind: fila.intensity_kind === 'rpe' ? 'rpe' : 'rir',
      intensityValue: Number(fila.intensity_value),
      hechaEl: finDe(fila),
    });
  }

  return mapa;
}

/**
 * Escribe una serie. Es upsert contra el indice unico
 * (session_id, exercise_id, set_index): volver atras y corregir un peso
 * reescribe la fila en vez de duplicarla.
 */
export async function guardarSerie(params: {
  sessionId: string;
  exerciseId: string;
  setIndex: number;
  weightKg: number;
  reps: number;
  intensityKind: Medidor;
  intensityValue: number;
}): Promise<boolean> {
  const { error } = await supabase.from('session_sets').upsert(
    {
      session_id: params.sessionId,
      exercise_id: params.exerciseId,
      set_index: params.setIndex,
      weight_kg: params.weightKg,
      reps: params.reps,
      intensity_kind: params.intensityKind,
      intensity_value: params.intensityValue,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'session_id,exercise_id,set_index' },
  );
  return !error;
}

/** Series ya cargadas en esta sesion, para retomarla donde quedo. */
export async function cargarSeriesDeSesion(
  sessionId: string,
): Promise<Map<string, { weightKg: number; reps: number; intensityValue: number }>> {
  const { data } = await supabase
    .from('session_sets')
    .select('exercise_id, set_index, weight_kg, reps, intensity_value')
    .eq('session_id', sessionId);

  const mapa = new Map<string, { weightKg: number; reps: number; intensityValue: number }>();
  for (const fila of data ?? []) {
    mapa.set(claveSerie(fila.exercise_id, fila.set_index), {
      weightKg: Number(fila.weight_kg),
      reps: fila.reps,
      intensityValue: Number(fila.intensity_value),
    });
  }
  return mapa;
}

export async function terminarSesion(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({ finished_at: new Date().toISOString() })
    .eq('id', sessionId);
  return !error;
}

/** Descarta una sesion sin terminar. Borra sus series por cascade. */
export async function descartarSesion(sessionId: string): Promise<boolean> {
  const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId);
  return !error;
}
