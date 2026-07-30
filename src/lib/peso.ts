/* Conversion de peso. El canonico es siempre el kilo: session_sets.weight_kg y
   profiles.peso se guardan en kg sin importar la preferencia del usuario, y la
   conversion pasa recien al mostrar o al leer lo que se escribio.
   Ver seccion 4.4 de docs/specs/registro-de-sesion.md */

export const KG_POR_LB = 0.45359237;

export type UnidadPeso = 'kg' | 'lb';

export function kgALb(kg: number): number {
  return kg / KG_POR_LB;
}

export function lbAKg(lb: number): number {
  return lb * KG_POR_LB;
}

/** Pasa un peso en kg a la unidad del usuario, redondeado a un decimal. */
export function mostrarPeso(kg: number, unidad: UnidadPeso): number {
  const valor = unidad === 'lb' ? kgALb(kg) : kg;
  return Math.round(valor * 10) / 10;
}

/** Pasa lo que el usuario escribio, en su unidad, al kilo que se guarda. */
export function pesoACanonico(valor: number, unidad: UnidadPeso): number {
  const kg = unidad === 'lb' ? lbAKg(valor) : valor;
  return Math.round(kg * 100) / 100;
}
