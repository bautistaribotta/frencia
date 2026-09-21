/* Eliminacion de cuenta con periodo de gracia.
   Ver docs/specs/eliminacion-de-cuenta.md. Nada se borra desde la app: las
   RPCs solo marcan o desmarcan `profiles.deletion_requested_at`, y un job
   diario en Postgres purga las cuentas con mas de 30 dias de solicitud. */

import { supabase } from './supabase';

export const DIAS_DE_GRACIA = 30;

/** Marca la cuenta para eliminar. Devuelve la fecha de solicitud registrada
 *  por el servidor (la original si ya habia una), o null si fallo. */
export async function solicitarEliminacionCuenta(): Promise<Date | null> {
  const { data, error } = await supabase.rpc('solicitar_eliminacion_cuenta');
  if (error || !data) return null;
  return new Date(data as string);
}

/** Cancela la solicitud pendiente. La cuenta queda como estaba. */
export async function cancelarEliminacionCuenta(): Promise<boolean> {
  const { error } = await supabase.rpc('cancelar_eliminacion_cuenta');
  return !error;
}

/** Dia en que el job de purga borra la cuenta, a partir de la fecha de
 *  solicitud que devolvio el servidor. */
export function fechaPurga(solicitadaEn: Date): Date {
  const d = new Date(solicitadaEn);
  d.setDate(d.getDate() + DIAS_DE_GRACIA);
  return d;
}

/** "21 de octubre de 2026" */
export function fechaLarga(fecha: Date): string {
  return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}
