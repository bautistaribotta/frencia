import { supabase } from './supabase';
import type { SesionTerminada } from './session';
import { fechaLocal, RACHA_TOPE_DIAS } from './streak';

export const HISTORIAL_PAGINA = 20;

export interface CursorHistorial {
  id: string;
  // Conservar el timestamp de Postgres: Date pierde los microsegundos.
  finishedAt: string;
}

export type PaginaHistorial =
  | {
      estado: 'ok';
      sesiones: SesionTerminada[];
      siguiente: CursorHistorial | null;
      proximaFecha: number | null;
    }
  | { estado: 'error' };

/** Una pagina, sin OFFSET ni COUNT. El registro extra permite saber si quedan
 * sesiones y si el ultimo mes esta completo, sin otra consulta. */
export async function cargarHistorial(
  userId: string,
  cursor: CursorHistorial | null = null,
  signal?: AbortSignal,
): Promise<PaginaHistorial> {
  try {
    if (signal?.aborted) return { estado: 'error' };
    const consulta = supabase
      .from('workout_sessions')
      .select('id, started_at, finished_at, training_days(name)')
      .eq('user_id', userId)
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(HISTORIAL_PAGINA + 1);

    if (cursor) {
      // Los valores se interpolan en sintaxis PostgREST; validar antes de usar.
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursor.id) ||
          !/^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})$/.test(cursor.finishedAt) ||
          !Number.isFinite(Date.parse(cursor.finishedAt))) return { estado: 'error' };
      consulta
        // Este limite explicito permite aprovechar el indice por usuario/fecha.
        .lte('finished_at', cursor.finishedAt)
        .or(`finished_at.lt.${cursor.finishedAt},and(finished_at.eq.${cursor.finishedAt},id.lt.${cursor.id})`);
    }
    if (signal) consulta.abortSignal(signal);
    const { data, error } = await consulta;
    if (error || !data || signal?.aborted) return { estado: 'error' };

    const visibles = data.slice(0, HISTORIAL_PAGINA);
    const extra = data[HISTORIAL_PAGINA];
    const ultima = visibles[visibles.length - 1];
    return {
      estado: 'ok',
      sesiones: visibles.map((fila) => {
        const dia = Array.isArray(fila.training_days) ? fila.training_days[0] : fila.training_days;
        return {
          id: fila.id,
          dayName: (dia as { name?: string } | null)?.name ?? null,
          startedAt: Date.parse(fila.started_at),
          finishedAt: Date.parse(fila.finished_at as string),
        };
      }),
      siguiente: extra && ultima ? { id: ultima.id, finishedAt: ultima.finished_at as string } : null,
      proximaFecha: extra ? Date.parse(extra.finished_at as string) : null,
    };
  } catch {
    return { estado: 'error' };
  }
}

/**
 * Fechas locales ("YYYY-MM-DD") con alguna sesion terminada dentro del tope de
 * la racha. Solo trae finished_at: es lo unico que calcularRacha necesita.
 * Devuelve null si falla; la racha no es critica y el badge se oculta.
 * Ver docs/specs/racha-de-entrenamientos.md
 */
export async function cargarFechasEntrenadas(userId: string): Promise<string[] | null> {
  const desde = new Date();
  desde.setDate(desde.getDate() - RACHA_TOPE_DIAS);
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('finished_at')
    .eq('user_id', userId)
    .not('finished_at', 'is', null)
    .gte('finished_at', desde.toISOString())
    .order('finished_at', { ascending: false });
  if (error || !data) return null;
  return data.map((fila) => fechaLocal(Date.parse(fila.finished_at as string)));
}

export interface MesHistorial {
  key: string;
  finishedAt: number;
  completo: boolean;
  data: SesionTerminada[];
}

function claveMes(epochMs: number): string {
  const fecha = new Date(epochMs);
  return `${fecha.getFullYear()}-${fecha.getMonth()}`;
}

/** Usa el mismo calendario local que las fechas visibles, incluido el anio. */
export function agruparHistorial(sesiones: SesionTerminada[], proximaFecha: number | null): MesHistorial[] {
  const meses: MesHistorial[] = [];
  for (const sesion of sesiones) {
    const key = claveMes(sesion.finishedAt);
    const ultimo = meses[meses.length - 1];
    if (ultimo?.key === key) ultimo.data.push(sesion);
    else meses.push({ key, finishedAt: sesion.finishedAt, completo: true, data: [sesion] });
  }
  const ultimo = meses[meses.length - 1];
  if (ultimo && proximaFecha !== null && ultimo.key === claveMes(proximaFecha)) ultimo.completo = false;
  return meses;
}
