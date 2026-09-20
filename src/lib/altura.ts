/* Conversion de altura. El canonico es siempre el centimetro: profiles.altura
   se guarda en cm sin importar la preferencia del usuario, y la conversion
   pasa recien al mostrar. La preferencia imperial (profiles.unidad_altura =
   'ft') se lee y se escribe en pies y pulgadas, que es como se dice la altura
   en voz alta, no en pulgadas sueltas. Mismo criterio que src/lib/peso.ts */

export const CM_POR_IN = 2.54;

export type UnidadAltura = 'cm' | 'ft';

/** Pasa centimetros a pies y pulgadas enteras, con las pulgadas ya acarreadas
 *  al pie cuando redondean a 12. */
export function cmAPiesPulgadas(cm: number): { pies: number; pulgadas: number } {
  const totalPulgadas = Math.round(cm / CM_POR_IN);
  return { pies: Math.floor(totalPulgadas / 12), pulgadas: totalPulgadas % 12 };
}

export function piesPulgadasACm(pies: number, pulgadas: number): number {
  return Math.round((pies * 12 + pulgadas) * CM_POR_IN);
}

/** Texto listo para mostrar en la unidad del usuario: `175 cm` o `5' 9"`. */
export function mostrarAltura(cm: number, unidad: UnidadAltura): string {
  if (unidad === 'ft') {
    const { pies, pulgadas } = cmAPiesPulgadas(cm);
    return `${pies}' ${pulgadas}"`;
  }
  return `${Math.round(cm)} cm`;
}
