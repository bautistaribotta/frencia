/* Conversion de distancia. El canonico es siempre el metro: la distancia de una
   serie se guarda en metros sin importar la preferencia del usuario, y la
   conversion pasa recien al mostrar o al leer lo que se escribio. La
   preferencia (profiles.unidad_distancia) es km o mi. Mismo criterio que
   src/lib/peso.ts */

export const M_POR_KM = 1000;
export const M_POR_MI = 1609.344;

export type UnidadDistancia = 'km' | 'mi';

/** Pasa metros a la unidad del usuario, redondeado a dos decimales. */
export function mostrarDistancia(metros: number, unidad: UnidadDistancia): number {
  const valor = metros / (unidad === 'mi' ? M_POR_MI : M_POR_KM);
  return Math.round(valor * 100) / 100;
}

/** Pasa lo que el usuario escribio, en su unidad, a los metros que se guardan. */
export function distanciaACanonico(valor: number, unidad: UnidadDistancia): number {
  return Math.round(valor * (unidad === 'mi' ? M_POR_MI : M_POR_KM));
}
