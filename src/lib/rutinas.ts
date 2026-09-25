/* Rutinas del usuario: el listado completo y el detalle de una.
   El home trae solo la activa porque su pregunta es "que entreno hoy". Aca la
   pregunta es otra: que planes tuve y cual esta corriendo, asi que se trae la
   activa y las archivadas de a paginas (sin tope de cantidad para premium).
   Ver docs/specs/rutinas-y-dias.md */

import { supabase } from './supabase';

/** Una rutina en el listado. */
export interface RutinaResumen {
  id: string;
  name: string;
  /** Sin archivar. Solo una por usuario, forzado por indice unico parcial. */
  activa: boolean;
  creadaEl: string;
  archivadaEl: string | null;
  dias: number;
}

/** Un dia dentro del detalle de una rutina. */
export interface DiaResumen {
  id: string;
  name: string;
  /** Indices 0 = lunes ... 6 = domingo, ordenados. */
  weekdays: number[];
  ejercicios: number;
}

export interface RutinaDetalle extends Omit<RutinaResumen, 'dias'> {
  dias: DiaResumen[];
}

const MESES = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
];

/**
 * "29 JUL 2026". Fecha local, que es el dia que el usuario vivio.
 *
 * Sin Intl a proposito. Hermes lo resuelve contra el ICU del sistema y ahi
 * cambia todo segun el dispositivo: el formato corto en es-AR sale "29 jul
 * 2026", "29 jul. 2026" o "29 de jul de 2026", y formatToParts directamente
 * devuelve el dia y deja mes y anio vacios. Doce abreviaturas escritas a mano
 * no dependen de nada y salen igual en todos lados.
 */
export function fechaCorta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export const RUTINAS_PAGINA = 20;

export interface CursorRutinas {
  id: string;
  // Conservar el timestamp de Postgres: Date pierde los microsegundos.
  creadaEl: string;
}

export type PaginaRutinas =
  | {
      estado: 'ok';
      /** Solo en la primera pagina (sin cursor): undefined en las siguientes. */
      activa?: RutinaResumen | null;
      anteriores: RutinaResumen[];
      siguiente: CursorRutinas | null;
    }
  | { estado: 'error' };

const COLUMNAS = 'id, name, archived_at, created_at, training_days(id)';

interface FilaRutina {
  id: string;
  name: string;
  archived_at: string | null;
  created_at: string;
  training_days: { id: string }[] | null;
}

function aResumen(r: FilaRutina): RutinaResumen {
  return {
    id: r.id,
    name: r.name,
    activa: r.archived_at === null,
    creadaEl: r.created_at,
    archivadaEl: r.archived_at,
    dias: (r.training_days ?? []).length,
  };
}

/**
 * Una pagina de rutinas archivadas, de la mas nueva a la mas vieja, con la
 * misma paginacion por cursor que el historial: sin OFFSET ni COUNT, y el
 * registro extra dice si quedan mas. Crear o borrar una rutina entre paginas no
 * repite ni saltea ninguna.
 *
 * La activa se pide aparte en la primera pagina: va arriba de todo aunque sea
 * vieja y no tiene que esperar a que el usuario scrollee hasta ella.
 *
 * `limite` permite recargar de una vez todo lo que ya estaba a la vista, para
 * que volver de editar no achique la lista ni mueva el scroll.
 */
export async function cargarRutinas(
  userId: string,
  cursor: CursorRutinas | null = null,
  signal?: AbortSignal,
  limite = RUTINAS_PAGINA,
): Promise<PaginaRutinas> {
  try {
    if (signal?.aborted) return { estado: 'error' };
    const consulta = supabase
      .from('routines')
      .select(COLUMNAS)
      .eq('user_id', userId)
      .not('archived_at', 'is', null)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limite + 1);

    if (cursor) {
      // Los valores se interpolan en sintaxis PostgREST; validar antes de usar.
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursor.id) ||
          !/^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})$/.test(cursor.creadaEl) ||
          !Number.isFinite(Date.parse(cursor.creadaEl))) return { estado: 'error' };
      consulta
        .lte('created_at', cursor.creadaEl)
        .or(`created_at.lt.${cursor.creadaEl},and(created_at.eq.${cursor.creadaEl},id.lt.${cursor.id})`);
    }
    if (signal) consulta.abortSignal(signal);

    const activaFiltro = supabase
      .from('routines')
      .select(COLUMNAS)
      .eq('user_id', userId)
      .is('archived_at', null);
    if (signal) activaFiltro.abortSignal(signal);
    const activaConsulta = cursor ? null : activaFiltro.maybeSingle();

    const [pagina, activa] = await Promise.all([consulta, activaConsulta]);
    if (pagina.error || !pagina.data || activa?.error || signal?.aborted) return { estado: 'error' };

    const filas = pagina.data as FilaRutina[];
    const visibles = filas.slice(0, limite);
    const ultima = visibles[visibles.length - 1];
    return {
      estado: 'ok',
      ...(activa ? { activa: activa.data ? aResumen(activa.data as FilaRutina) : null } : {}),
      anteriores: visibles.map(aResumen),
      siguiente: filas.length > limite && ultima ? { id: ultima.id, creadaEl: ultima.created_at } : null,
    };
  } catch {
    return { estado: 'error' };
  }
}

/** Un dia tal como lo manda la edicion de la rutina. `id` null = dia nuevo. */
export interface DiaAGuardar {
  id: string | null;
  name: string;
}

/**
 * Reemplaza nombre y dias de una rutina. `dias` es el orden final completo: los
 * que no esten se borran, con sus ejercicios.
 *
 * Va por RPC y no por llamadas sueltas porque son cuatro operaciones —
 * renombrar, borrar, reordenar, insertar— y una a medio hacer deja la rutina
 * rota. Ver la migracion guardar_rutina.
 */
export async function guardarRutina(
  routineId: string,
  name: string,
  dias: DiaAGuardar[],
): Promise<boolean> {
  const { error } = await supabase.rpc('guardar_rutina', {
    p_routine_id: routineId,
    p_name: name.trim() || 'Rutina',
    p_dias: dias.map((d, i) => ({ id: d.id, name: d.name.trim() || `Día ${i + 1}` })),
  });
  return !error;
}

/**
 * Deja `routineId` como la unica rutina activa: archiva la que estaba en curso
 * y desarchiva esta. Va por RPC porque son dos updates sobre el indice unico
 * parcial y uno solo a medias dejaria al usuario sin ninguna activa. Ver la
 * migracion activar_rutina.
 */
export async function activarRutina(routineId: string): Promise<boolean> {
  const { error } = await supabase.rpc('activar_rutina', { p_routine_id: routineId });
  return !error;
}

/**
 * Borra una rutina y, por cascada, sus dias, sus dias de la semana y los
 * ejercicios de cada dia. El historial de sesiones sobrevive: apunta al dia con
 * on delete set null. No se puede deshacer.
 */
export async function eliminarRutina(routineId: string): Promise<boolean> {
  const { error } = await supabase.from('routines').delete().eq('id', routineId);
  return !error;
}

/** Una rutina con sus dias en orden. null si no existe o no es del usuario. */
export async function cargarRutina(routineId: string): Promise<RutinaDetalle | null> {
  const { data, error } = await supabase
    .from('routines')
    .select(
      'id, name, archived_at, created_at, training_days(id, name, position, training_day_weekdays(weekday), training_day_exercises(id))',
    )
    .eq('id', routineId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    activa: data.archived_at === null,
    creadaEl: data.created_at,
    archivadaEl: data.archived_at,
    dias: (data.training_days ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((d) => ({
        id: d.id,
        name: d.name,
        weekdays: (d.training_day_weekdays ?? []).map((w) => w.weekday).sort((a, b) => a - b),
        ejercicios: (d.training_day_exercises ?? []).length,
      })),
  };
}
