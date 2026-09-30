/* Datos de una sesion de entrenamiento. Ver docs/specs/registro-de-sesion.md
   Cubre: abrir o retomar la sesion, traer el plan del dia, traer las series
   fantasma, guardar cada serie y terminar. */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { esSerieUnica, intensidadDeFila } from './dia';
import {
  COLUMNAS_TIPO,
  tipoDeFila,
  type DatosRegistrados,
  type FilaTipo,
  type TipoEjercicio,
} from './exercises';
import { supabase } from './supabase';

export type Medidor = 'rir' | 'rpe';

/** Un ejercicio tal como quedo planificado en el dia. Lo que el ejercicio no
 *  registra (`tracks`) llega en null. */
export interface EjercicioPlan {
  exerciseId: string;
  name: string;
  kind: TipoEjercicio;
  tracks: DatosRegistrados;
  /** Series planificadas. Es el punto de partida del wizard, no un limite. */
  sets: number;
  reps: number | null;
  durationSeconds: number | null;
  distanceM: number | null;
  /** Peso por serie que prescribe el plan, en kg. Solo isometricos: si esta,
   *  la sesion lo pide en cada serie. */
  weightKg: number | null;
  /** null = sin intensidad (cardio o isometrico sin RPE). */
  intensityKind: Medidor | null;
  intensityValue: number | null;
  restSeconds: number | null;
}

/** Lo que se hizo en esta misma serie la vez anterior. Cada dato es null si el
 *  ejercicio no lo registra. */
export interface SerieFantasma {
  weightKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
  distanceM: number | null;
  intensityKind: Medidor | null;
  intensityValue: number | null;
  /** Cuando termino esa sesion, en epoch ms. */
  hechaEl: number;
}

/** Los datos de una serie tal como llegan de session_sets. */
interface FilaSerie {
  weight_kg: number | string | null;
  reps: number | null;
  duration_seconds: number | null;
  distance_m: number | null;
  intensity_kind: string | null;
  intensity_value: number | string | null;
}

/** numeric llega como string desde PostgREST; null sigue siendo null. */
function numero(v: number | string | null): number | null {
  return v === null ? null : Number(v);
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
    .select(
      `exercise_id, position, sets, reps, duration_seconds, distance_m, weight_kg, intensity_kind, intensity_value, rest_seconds, exercises(name, ${COLUMNAS_TIPO})`,
    )
    .eq('training_day_id', trainingDayId)
    .order('position');

  if (error || !data) return [];

  return (data as unknown as FilaPlanSesion[]).map((fila) => {
    // El embed de una relacion to-one puede llegar como objeto o como array de
    // uno segun la version del cliente; normalizamos.
    const ejercicio = Array.isArray(fila.exercises) ? fila.exercises[0] : fila.exercises;
    const { kind, tracks } = tipoDeFila(ejercicio);
    return {
      exerciseId: fila.exercise_id,
      name: ejercicio?.name ?? 'Ejercicio',
      kind,
      tracks,
      sets: fila.sets ?? (esSerieUnica(kind) ? 1 : 3),
      reps: tracks.reps ? (fila.reps ?? 10) : null,
      durationSeconds: fila.duration_seconds,
      distanceM: fila.distance_m,
      weightKg: numero(fila.weight_kg),
      ...intensidadDeFila(fila.intensity_kind, fila.intensity_value),
      restSeconds: fila.rest_seconds,
    };
  });
}

/** Un ejercicio del plan tal como llega de la base, con su ejercicio embebido. */
interface FilaPlanSesion {
  exercise_id: string;
  sets: number | null;
  reps: number | null;
  duration_seconds: number | null;
  distance_m: number | null;
  weight_kg: number | string | null;
  intensity_kind: string | null;
  intensity_value: number | string | null;
  rest_seconds: number | null;
  exercises: ({ name?: string } & FilaTipo) | ({ name?: string } & FilaTipo)[] | null;
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
      'exercise_id, set_index, weight_kg, reps, duration_seconds, distance_m, intensity_kind, intensity_value, workout_sessions!inner(finished_at, training_day_id)',
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
    mapa.set(clave, { ...datosDeSerie(fila), hechaEl: finDe(fila) });
  }

  return mapa;
}

/** Datos de una serie de la base, con los que el ejercicio no registra en null. */
function datosDeSerie(fila: FilaSerie): SerieCargada {
  return {
    weightKg: numero(fila.weight_kg),
    reps: fila.reps,
    durationSeconds: fila.duration_seconds,
    distanceM: fila.distance_m,
    ...intensidadDeFila(fila.intensity_kind, fila.intensity_value),
  };
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
  /** Lo que el ejercicio no registra va en null. Las series que quedaron
   *  pendientes antes de que existiera el cardio no traen duracion ni
   *  distancia: por eso son opcionales. */
  weightKg: number | null;
  reps: number | null;
  durationSeconds?: number | null;
  distanceM?: number | null;
  intensityKind: Medidor | null;
  intensityValue: number | null;
}): Promise<boolean> {
  const { error } = await supabase.from('session_sets').upsert(
    {
      session_id: params.sessionId,
      exercise_id: params.exerciseId,
      set_index: params.setIndex,
      weight_kg: params.weightKg,
      reps: params.reps,
      duration_seconds: params.durationSeconds ?? null,
      distance_m: params.distanceM ?? null,
      intensity_kind: params.intensityKind,
      intensity_value: params.intensityValue,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'session_id,exercise_id,set_index' },
  );
  return !error;
}

// --- Series pendientes de sincronizar ----------------------------------------
// En el gimnasio la senal va y viene. Una serie que no se pudo escribir no se
// pierde: queda en el telefono y se reintenta en el proximo paso o al terminar.

export type SeriePendiente = Parameters<typeof guardarSerie>[0];

function clavePendientes(sessionId: string): string {
  return `frencia.session.pendientes.${sessionId}`;
}

export async function leerPendientes(sessionId: string): Promise<SeriePendiente[]> {
  try {
    const raw = await AsyncStorage.getItem(clavePendientes(sessionId));
    return raw ? (JSON.parse(raw) as SeriePendiente[]) : [];
  } catch {
    return [];
  }
}

async function escribirPendientes(sessionId: string, lista: SeriePendiente[]): Promise<void> {
  try {
    if (lista.length === 0) await AsyncStorage.removeItem(clavePendientes(sessionId));
    else await AsyncStorage.setItem(clavePendientes(sessionId), JSON.stringify(lista));
  } catch {
    // Sin almacenamiento local no hay respaldo posible; la escritura ya fallo.
  }
}

/** Encola una serie que no se pudo escribir. Si ya habia una pendiente para el
 *  mismo (ejercicio, serie), la reemplaza: vale la ultima que anoto el usuario. */
export async function encolarPendiente(serie: SeriePendiente): Promise<void> {
  const lista = await leerPendientes(serie.sessionId);
  const clave = claveSerie(serie.exerciseId, serie.setIndex);
  const resto = lista.filter((p) => claveSerie(p.exerciseId, p.setIndex) !== clave);
  await escribirPendientes(serie.sessionId, [...resto, serie]);
}

/** Reintenta escribir todo lo pendiente. Devuelve cuantas series siguen sin
 *  sincronizar; 0 significa que la sesion esta completa en la base. */
export async function sincronizarPendientes(sessionId: string): Promise<number> {
  const lista = await leerPendientes(sessionId);
  if (lista.length === 0) return 0;

  const restantes: SeriePendiente[] = [];
  for (const serie of lista) {
    if (!(await guardarSerie(serie))) restantes.push(serie);
  }
  await escribirPendientes(sessionId, restantes);
  return restantes.length;
}

/** Guarda la serie y, si falla, la deja pendiente. */
export async function guardarSerieConRespaldo(
  serie: SeriePendiente,
): Promise<'guardada' | 'pendiente'> {
  if (await guardarSerie(serie)) return 'guardada';
  await encolarPendiente(serie);
  return 'pendiente';
}

export async function borrarPendientes(sessionId: string): Promise<void> {
  await escribirPendientes(sessionId, []);
}

/** Una serie ya cargada en esta sesion. */
export type SerieCargada = Omit<SerieFantasma, 'hechaEl'>;

/** Series ya cargadas en esta sesion, para retomarla donde quedo. */
export async function cargarSeriesDeSesion(sessionId: string): Promise<Map<string, SerieCargada>> {
  const { data } = await supabase
    .from('session_sets')
    .select('exercise_id, set_index, weight_kg, reps, duration_seconds, distance_m, intensity_kind, intensity_value')
    .eq('session_id', sessionId);

  const mapa = new Map<string, SerieCargada>();
  for (const fila of data ?? []) {
    mapa.set(claveSerie(fila.exercise_id, fila.set_index), datosDeSerie(fila));
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
  if (!error) await borrarPendientes(sessionId);
  return !error;
}

/**
 * Borra una sesion terminada del historial y, por cascada, sus series. No se
 * puede deshacer. Cuenta las filas borradas: si RLS la filtra, delete no da
 * error pero no borra nada, y eso tambien es un fallo.
 */
export async function eliminarSesion(sessionId: string): Promise<boolean> {
  const { error, count } = await supabase
    .from('workout_sessions')
    .delete({ count: 'exact' })
    .eq('id', sessionId);
  return !error && count === 1;
}

/** Una sesion terminada, resumida para el historial. */
export interface SesionTerminada {
  id: string;
  /** Nombre del dia, o null si el dia se borro (la sesion sobrevive). */
  dayName: string | null;
  startedAt: number;
  finishedAt: number;
}

// La lectura paginada vive separada del registro de entrenamiento.
export { cargarHistorial, HISTORIAL_PAGINA } from './history';
