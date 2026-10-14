/* ============================================================
   Frencia · Lume · Datos del fondo de luces
   Copia de entrega/fondos.json del design system. Cada pantalla elige una
   de cinco posiciones fijas segun donde esta su contenido, para que el
   texto chico nunca caiga sobre la zona clara. Si una pantalla nueva no
   cumple la regla de lectura, se cambia la posicion, no el texto.
   ============================================================ */

export type CapaLuz = 'a' | 'b' | 'c';
export type PosicionFondo = 'cumbre' | 'centro' | 'flanco' | 'base' | 'velada';
export type IntensidadFondo = 'pleno' | 'suave';

export interface Luz {
  capa: CapaLuz;
  // Centro en % del ancho y del alto de la pantalla (puede salir de 0-100:
  // la luz entra desde el borde).
  x: number;
  y: number;
  // Radio en % del ANCHO de la pantalla.
  radio: number;
  alfa: number;
}

const luz = (capa: CapaLuz, x: number, y: number, radio: number, alfa: number): Luz => ({ capa, x, y, radio, alfa });

export const POSICIONES: Record<PosicionFondo, Luz[]> = {
  // Arriba a la derecha: pestañas, listas y formularios bajo el titulo.
  cumbre: [luz('a', 92, 2, 95, 0.5), luz('b', 8, 62, 115, 0.9), luz('c', 96, 94, 70, 0.22)],
  // Detras del centro: un control protagonista en vidrio (rueda, regla).
  centro: [luz('a', 56, 54, 92, 0.42), luz('b', 4, 14, 95, 0.85), luz('c', 100, 96, 72, 0.2)],
  // Borde derecho a media altura: formularios alineados a la izquierda.
  flanco: [luz('a', 112, 42, 88, 0.5), luz('b', -2, 82, 115, 0.9), luz('c', -6, -2, 62, 0.2)],
  // Sube desde abajo a la izquierda: contenido arriba y la accion abajo.
  base: [luz('a', -4, 86, 90, 0.42), luz('b', 100, 18, 110, 0.9), luz('c', 70, 104, 60, 0.18)],
  // Solo en los bordes: pantallas densas en datos.
  velada: [luz('a', 102, 104, 82, 0.4), luz('b', 12, 58, 110, 0.85), luz('c', -6, -4, 62, 0.22)],
};

export const INTENSIDAD_SUAVE: Record<CapaLuz, number> = { a: 0.8, b: 0.95, c: 0.8 };

/** Multiplica el alfa de cada luz (tope 1). En claro el lume palido sobre
 *  marfil necesita mas opacidad para leerse como luz. */
export const GANANCIA = { oscuro: 1, claro: 1.7, reducirTransparencia: 0.45 } as const;

/** Deriva de las luces en el onboarding: duracion del ciclo y desfase (ms). */
export const DERIVA: Record<CapaLuz, { duracion: number; desfase: number }> = {
  a: { duracion: 20000, desfase: 0 },
  b: { duracion: 26000, desfase: 7000 },
  c: { duracion: 31000, desfase: 13000 },
};
