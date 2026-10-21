/* Frencia · Escrituras y lecturas puntuales de la fila del perfil.
   La lectura completa y compartida vive en ProfileProvider; aca quedan las que
   hace cada pantalla por su cuenta, para que ninguna consulte la base directo. */

import type { Tables, TablesUpdate } from './database.types';
import { supabase } from './supabase';

export type DatosPersonales = Pick<
  Tables<'profiles'>,
  'name' | 'surname' | 'fecha_nacimiento' | 'sexo' | 'altura' | 'peso'
>;

/** Lo que edita la pantalla de perfil, tal como esta guardado. */
export async function leerDatosPersonales(
  userId: string,
): Promise<{ estado: 'ok'; datos: DatosPersonales } | { estado: 'error' }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, surname, fecha_nacimiento, sexo, altura, peso')
    .eq('id', userId)
    .single();
  return error || !data ? { estado: 'error' } : { estado: 'ok', datos: data };
}

export async function guardarDatosPersonales(userId: string, datos: DatosPersonales): Promise<boolean> {
  const { error } = await supabase.from('profiles').update(datos).eq('id', userId);
  return !error;
}

/**
 * Cierra el setup. Upsert por id en vez de update: garantiza que la fila exista
 * y, con .select(), confirma que se escribio. Un update sin select que matchea
 * 0 filas devuelve exito silencioso.
 */
export async function guardarSetup(userId: string, datos: TablesUpdate<'profiles'>): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...datos, id: userId }, { onConflict: 'id' })
    .select('id')
    .maybeSingle();
  return !error && !!data;
}

/** Guarda el tema elegido. Sin esperar: si falla, queda la copia local. */
export function guardarTema(userId: string, tema: string): void {
  void supabase.from('profiles').update({ tema }).eq('id', userId);
}
