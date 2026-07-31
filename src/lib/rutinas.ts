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

// Hoisteado: construir un Intl.DateTimeFormat es caro y esto se llama una vez
// por fila.
const FORMATO_FECHA = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/**
 * "29 JUL 2026".
 *
 * Se arma por partes en vez de formatear derecho porque cada version de ICU
 * decora distinto la fecha corta en es-AR: "29 jul 2026", "29 jul. 2026" o
 * "29 de jul de 2026". Tomando dia, mes y anio sueltos el resultado es el mismo
 * en todos lados.
 */
export function fechaCorta(iso: string): string {
  const partes = FORMATO_FECHA.formatToParts(new Date(iso));
  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value ?? '';
  const mes = parte('month').replace('.', '').toUpperCase();
  return `${parte('day')} ${mes} ${parte('year')}`;
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
