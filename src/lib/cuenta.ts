/* Eliminacion de cuenta con periodo de gracia.
   Ver docs/specs/eliminacion-de-cuenta.md. Nada se borra desde la app: las
   RPCs solo marcan o desmarcan `profiles.deletion_requested_at`, y un job
   diario en Postgres purga las cuentas con mas de 30 dias de solicitud. */

import { supabase } from './supabase';
export { fechaLarga } from './tiempo';

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

/** Hora UTC a la que corre el job diario `purgar-cuentas` (pg_cron, '0 3 * * *'). */
const HORA_UTC_PURGA = 3;

/** Momento en que el job de purga borra la cuenta, a partir de la fecha de
 *  solicitud que devolvio el servidor. La cuenta califica cuando se cumplen
 *  exactamente 30 dias (motivo_de_purga compara con `<`), pero el job corre una
 *  vez por dia: el borrado real es la primera corrida despues de ese momento,
 *  que puede caer hasta un dia mas tarde. */
export function fechaPurga(solicitadaEn: Date): Date {
  const califica = solicitadaEn.getTime() + DIAS_DE_GRACIA * 24 * 60 * 60 * 1000;
  const corrida = new Date(califica);
  corrida.setUTCHours(HORA_UTC_PURGA, 0, 0, 0);
  if (corrida.getTime() <= califica) corrida.setUTCDate(corrida.getUTCDate() + 1);
  return corrida;
}
