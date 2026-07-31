/* Rutinas del usuario: el listado completo y el detalle de una.
   El home trae solo la activa porque su pregunta es "que entreno hoy". Aca la
   pregunta es otra: que planes tuve y cual esta corriendo, asi que se traen
   todas y el estado archivada/activa es parte del dato.
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

/** Todas las rutinas del usuario, de la mas nueva a la mas vieja. */
export async function cargarRutinas(): Promise<RutinaResumen[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('routines')
    .select('id, name, archived_at, created_at, training_days(id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    name: r.name,
    activa: r.archived_at === null,
    creadaEl: r.created_at,
    archivadaEl: r.archived_at,
    dias: (r.training_days ?? []).length,
  }));
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
