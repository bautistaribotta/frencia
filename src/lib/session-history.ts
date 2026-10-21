/* Detalle historico: lee las series realizadas, nunca el plan actual del dia. */

import { intensidadDeFila } from './dia';
import {
  COLUMNAS_TIPO,
  tipoDeFila,
  type DatosRegistrados,
  type TipoEjercicio,
} from './exercises';
import { supabase } from './supabase';
import type { SesionTerminada } from './history';
import type { Medidor } from './session';
import { duracionSesion } from './tiempo';
import { esUuid } from './validacion';

export { duracionSesion };

/** Una serie tal como se guardo. Lo que el ejercicio no registra es null. */
export interface SerieRealizada {
  id: string;
  setIndex: number;
  weightKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
  distanceM: number | null;
  intensityKind: Medidor | null;
  intensityValue: number | null;
  completedAt: number;
}

export interface EjercicioRealizado {
  exerciseId: string;
  name: string;
  kind: TipoEjercicio;
  tracks: DatosRegistrados;
  series: SerieRealizada[];
}

export interface SesionDetalle extends SesionTerminada {
  ejercicios: EjercicioRealizado[];
}

export type ResultadoDetalleSesion =
  | { estado: 'ok'; sesion: SesionDetalle }
  | { estado: 'no-encontrada' }
  | { estado: 'error' };

const SERIES_PAGINA = 200;

/** Cabecera + paginas de series con el nombre del ejercicio en el mismo pedido.
 * El filtro de usuario se suma a RLS; solo se pueden abrir sesiones terminadas.
 * Paginar tambien el detalle evita truncarlo al limite de filas de la API.
 * No se muestra un resultado parcial si falla alguna pagina. */
export async function cargarDetalleSesion(
  userId: string,
  sessionId: string,
  signal?: AbortSignal,
): Promise<ResultadoDetalleSesion> {
  if (!esUuid(sessionId) || !userId) return { estado: 'no-encontrada' };

  try {
    if (signal?.aborted) return { estado: 'error' };
    const cabecera = supabase
      .from('workout_sessions')
      .select('id, started_at, finished_at, training_days(name)')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .not('finished_at', 'is', null);
    if (signal) cabecera.abortSignal(signal);
    const { data: sesion, error } = await cabecera.maybeSingle();
    if (error) return { estado: 'error' };
    if (!sesion) return { estado: 'no-encontrada' };

    const grupos = new Map<string, EjercicioRealizado>();
    for (let desde = 0; ; desde += SERIES_PAGINA) {
      if (signal?.aborted) return { estado: 'error' };
      const consulta = supabase
        .from('session_sets')
        .select(
          `id, exercise_id, set_index, weight_kg, reps, duration_seconds, distance_m, intensity_kind, intensity_value, completed_at, exercises(name, ${COLUMNAS_TIPO})`,
        )
        .eq('session_id', sessionId)
        .order('exercise_id')
        .order('set_index')
        .range(desde, desde + SERIES_PAGINA - 1);
      if (signal) consulta.abortSignal(signal);
      const { data, error: errorSeries } = await consulta;
      if (errorSeries || !data) return { estado: 'error' };
      for (const fila of data) {
        let grupo = grupos.get(fila.exercise_id);
        if (!grupo) {
          const ejercicio = fila.exercises;
          grupo = {
            exerciseId: fila.exercise_id,
            name: ejercicio?.name ?? 'Ejercicio',
            ...tipoDeFila(ejercicio),
            series: [],
          };
          grupos.set(fila.exercise_id, grupo);
        }
        grupo.series.push({
          id: fila.id,
          setIndex: fila.set_index,
          weightKg: fila.weight_kg === null ? null : Number(fila.weight_kg),
          reps: fila.reps,
          durationSeconds: fila.duration_seconds,
          distanceM: fila.distance_m,
          ...intensidadDeFila(fila.intensity_kind, fila.intensity_value),
          completedAt: Date.parse(fila.completed_at),
        });
      }
      if (data.length < SERIES_PAGINA) break;
    }

    // Orden historico por primer registro; dentro de cada ejercicio, numero de serie.
    // La lectura usa el indice unico (session_id, exercise_id, set_index).
    const primerRegistro = (ejercicio: EjercicioRealizado) =>
      ejercicio.series.reduce((primero, serie) => Math.min(primero, serie.completedAt), Infinity);
    const ejercicios = [...grupos.values()].sort((a, b) =>
      primerRegistro(a) - primerRegistro(b) || a.exerciseId.localeCompare(b.exerciseId),
    );
    return {
      estado: 'ok',
      sesion: {
        id: sesion.id,
        dayName: sesion.training_days?.name ?? null,
        startedAt: Date.parse(sesion.started_at),
        finishedAt: Date.parse(sesion.finished_at as string),
        ejercicios,
      },
    };
  } catch {
    return { estado: 'error' };
  }
}

export function fechaSesion(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
