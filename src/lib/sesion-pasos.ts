/* Frencia · Logica pura del wizard de la sesion: los pasos que salen del
   plan, los valores de cada serie y las reglas para guardarla.
   Ver docs/specs/registro-de-sesion.md, seccion 6. */

import { esSerieUnica } from './dia';
import { distanciaACanonico, distanciaTabla, mostrarDistancia, type UnidadDistancia } from './distancia';
import { mostrarPeso, pesoACanonico, type UnidadPeso } from './peso';
import type { EjercicioPlan, Medidor, SerieCargada, SerieFantasma } from './session';
import { reloj } from './tiempo';

// --- Modelo de pasos ---------------------------------------------------------

export type Paso =
  | { tipo: 'serie'; ejercicio: number; serie: number }
  | { tipo: 'descanso'; ejercicio: number; despuesDe: number };

/**
 * Aplana el plan del dia en la secuencia de pasos.
 *
 * El descanso va despues de cada serie, incluida la ultima de un ejercicio: al
 * cambiar de ejercicio tambien se descansa, con el tiempo del que acaba de
 * terminar. La excepcion es el final: despues de la ultima serie del ultimo
 * ejercicio no queda nada para lo que descansar.
 */
export function generarPasos(plan: EjercicioPlan[], cantidades: number[]): Paso[] {
  const pasos: Paso[] = [];

  plan.forEach((ej, i) => {
    const n = cantidades[i] ?? 0;
    for (let s = 0; s < n; s++) {
      pasos.push({ tipo: 'serie', ejercicio: i, serie: s });

      const quedanSeriesAca = s < n - 1;
      const quedanEjercicios = cantidades.slice(i + 1).some((c) => c > 0);
      if (ej.restSeconds !== null && (quedanSeriesAca || quedanEjercicios)) {
        pasos.push({ tipo: 'descanso', ejercicio: i, despuesDe: s });
      }
    }
  });

  return pasos;
}

export function claveDescanso(p: Extract<Paso, { tipo: 'descanso' }>): string {
  return `d-${p.ejercicio}-${p.despuesDe}`;
}

// --- Valores de una serie ----------------------------------------------------

/** Acepta coma o punto: en el teclado del telefono sale la coma. */
export function parseNum(texto: string): number | null {
  const limpio = texto.replace(',', '.').trim();
  if (limpio === '') return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

/** Intensidad pelada para una celda: la columna ya dice si es RIR o RPE.
 *  null si no hay intensidad. */
export function valorIntensidad(kind: Medidor | null, value: number | null): string | null {
  if (kind === null || value === null) return null;
  if (kind === 'rir' && value < 0) return 'Fallo';
  return String(value);
}

/** Series del ejercicio que quedaron hechas al llegar a un descanso. */
export function seriesHechas(hechas: number, total: number): string {
  return `${hechas} de ${total} ${total === 1 ? 'serie hecha' : 'series hechas'}`;
}

/** Lo cargado en una serie. Peso, reps e intensidad son el texto de su caja;
 *  el tiempo va en segundos y la distancia en la unidad del usuario, que es lo
 *  que manejan sus campos. */
export interface ValoresSerie {
  peso: string;
  reps: string;
  intensidad: string;
  tiempo: number | null;
  distancia: number | null;
}

export const VACIO: ValoresSerie = { peso: '', reps: '', intensidad: '', tiempo: null, distancia: null };

/** Una serie guardada (en la base o pendiente en el telefono) vuelta a los
 *  campos, en las unidades del usuario. */
export function aValores(
  serie: Omit<SerieCargada, 'durationSeconds' | 'distanceM' | 'intensityKind'> & {
    durationSeconds?: number | null;
    distanceM?: number | null;
  },
  unidad: UnidadPeso,
  unidadDistancia: UnidadDistancia,
): ValoresSerie {
  return {
    peso: serie.weightKg === null ? '' : String(mostrarPeso(serie.weightKg, unidad)),
    reps: serie.reps === null ? '' : String(serie.reps),
    intensidad: serie.intensityValue === null ? '' : String(serie.intensityValue),
    tiempo: serie.durationSeconds ?? null,
    distancia:
      serie.distanceM == null ? null : mostrarDistancia(serie.distanceM, unidadDistancia),
  };
}

// --- Lo que viene despues del descanso ---------------------------------------

/** Los numeros de la proxima serie, en grupos para la tarjeta del descanso:
 *  fuerza "80 kg × 8"; cardio "30:00 · 5.00 km"; isometrico "1:00 · 10 kg". */
export function datosProximos(
  ej: EjercicioPlan,
  cargado: ValoresSerie | undefined,
  fantasma: SerieFantasma | undefined,
  unidad: UnidadPeso,
  unidadDistancia: UnidadDistancia,
  medidor: Medidor,
): { grupos: string[][]; esfuerzo: string | null } {
  const grupos: string[][] = [];

  const esfuerzoPlan = textoEsfuerzo(ej.intensityKind, ej.intensityValue);
  // Cardio e isometricos se cargan siempre en RPE; la fuerza, con el medidor
  // del perfil.
  const medidorCargado: Medidor = esSerieUnica(ej.kind) || ej.kind === 'isometrico' ? 'rpe' : medidor;
  const esfuerzoCargado = cargado ? textoEsfuerzo(medidorCargado, parseNum(cargado.intensidad)) : null;
  const esfuerzo =
    esfuerzoCargado ??
    esfuerzoPlan ??
    (fantasma ? textoEsfuerzo(fantasma.intensityKind, fantasma.intensityValue) : null);

  const tiempo = cargado?.tiempo ?? ej.durationSeconds ?? fantasma?.durationSeconds ?? null;

  if (esSerieUnica(ej.kind)) {
    const grupo: string[] = [];
    if (ej.tracks.duration && tiempo !== null) grupo.push(reloj(tiempo));
    const distancia =
      cargado?.distancia != null
        ? `${cargado.distancia.toFixed(2)} ${unidadDistancia}`
        : ej.distanceM != null
          ? `${distanciaTabla(ej.distanceM, unidadDistancia)} ${unidadDistancia}`
          : fantasma?.distanceM != null
            ? `${distanciaTabla(fantasma.distanceM, unidadDistancia)} ${unidadDistancia}`
            : null;
    if (ej.tracks.distance && distancia) grupo.push(distancia);
    grupo.forEach((d) => grupos.push([d]));
    return { grupos, esfuerzo };
  }

  const pesoCargado = cargado ? parseNum(cargado.peso) : null;
  const peso =
    pesoCargado !== null
      ? pesoCargado
      : ej.kind === 'isometrico' && ej.weightKg !== null
        ? mostrarPeso(ej.weightKg, unidad)
        : fantasma?.weightKg != null
          ? mostrarPeso(fantasma.weightKg, unidad)
          : null;
  const pesoTexto = peso !== null && peso > 0 ? `${peso} ${unidad}` : null;

  if (ej.kind === 'isometrico') {
    if (ej.tracks.duration && tiempo !== null) grupos.push([reloj(tiempo)]);
    if (ej.tracks.weight && pesoTexto) grupos.push([pesoTexto]);
    return { grupos, esfuerzo };
  }

  const repsCargadas = cargado ? parseNum(cargado.reps) : null;
  const reps = repsCargadas ?? fantasma?.reps ?? ej.reps ?? null;
  const fuerza: string[] = [];
  if (pesoTexto) fuerza.push(pesoTexto);
  if (reps !== null) fuerza.push(pesoTexto ? String(reps) : `${reps} reps`);
  if (fuerza.length > 0) grupos.push(fuerza);
  return { grupos, esfuerzo };
}

/** "RIR 2", "RPE 7" o "Al fallo". null sin esfuerzo. */
export function textoEsfuerzo(kind: Medidor | null, value: number | null): string | null {
  if (kind === null || value === null) return null;
  if (kind === 'rir') return value < 0 ? 'Al fallo' : `RIR ${value}`;
  return `RPE ${value}`;
}

// --- Serie a guardar ---------------------------------------------------------

/** Evalua la serie en un solo lugar: que campos le faltan (en palabras:
 *  "el peso", "las reps") y, cuando esta completa, los datos listos para
 *  guardar. El cardio pide el tiempo, con distancia y RPE opcionales; el
 *  isometrico, el tiempo, con RPE opcional y peso opcional salvo que el plan
 *  lo prescriba; la fuerza, peso, reps y el esfuerzo con el medidor del perfil. */
function evaluarSerie(
  ej: EjercicioPlan,
  v: ValoresSerie,
  unidad: UnidadPeso,
  unidadDistancia: UnidadDistancia,
  medidor: Medidor,
) {
  if (esSerieUnica(ej.kind)) {
    const durationSeconds = ej.tracks.duration ? v.tiempo : null;
    // El tiempo es obligatorio; la distancia y el RPE, opcionales.
    if (ej.tracks.duration && !durationSeconds) {
      return { falta: ['el tiempo'], datos: null };
    }
    // Una distancia que redondea a 0 m cuenta como no cargada.
    const distanceM =
      (ej.tracks.distance && v.distancia
        ? distanciaACanonico(v.distancia, unidadDistancia)
        : 0) || null;
    const rpe = ej.intensityKind === null ? null : parseNum(v.intensidad);
    return {
      falta: [] as string[],
      datos: {
        weightKg: null,
        reps: null,
        durationSeconds,
        distanceM,
        intensityKind: rpe === null ? null : ('rpe' as const),
        intensityValue: rpe,
      },
    };
  }

  if (ej.kind === 'isometrico') {
    const falta: string[] = [];
    const durationSeconds = ej.tracks.duration ? v.tiempo : null;
    if (ej.tracks.duration && !durationSeconds) falta.push('el tiempo');
    // El peso es opcional, salvo que el plan lo prescriba.
    const peso = ej.tracks.weight ? parseNum(v.peso) : null;
    if (ej.tracks.weight && ej.weightKg !== null && (peso === null || peso <= 0)) {
      falta.push('el peso');
    }
    if (falta.length > 0) return { falta, datos: null };
    const rpe = ej.intensityKind === null ? null : parseNum(v.intensidad);
    return {
      falta,
      datos: {
        // Sin peso (o en 0) la serie se hizo sin carga.
        weightKg: peso !== null && peso > 0 ? pesoACanonico(peso, unidad) : null,
        reps: null,
        durationSeconds,
        distanceM: null,
        intensityKind: rpe === null ? null : ('rpe' as const),
        intensityValue: rpe,
      },
    };
  }

  const falta: string[] = [];
  const peso = parseNum(v.peso);
  const reps = parseNum(v.reps);
  const intensidad = parseNum(v.intensidad);
  if (peso === null || peso < 0) falta.push('el peso');
  if (reps === null || reps <= 0) falta.push('las reps');
  if (intensidad === null) falta.push(medidor === 'rir' ? 'el RIR' : 'el RPE');
  if (falta.length > 0 || peso === null || reps === null || intensidad === null) {
    return { falta, datos: null };
  }
  return {
    falta,
    datos: {
      weightKg: pesoACanonico(peso, unidad),
      reps: Math.round(reps),
      intensityKind: medidor,
      intensityValue: intensidad,
    },
  };
}

/** Lo que se escribe de una serie completa, o null si le falta algo. */
export function datosAGuardar(
  ej: EjercicioPlan,
  v: ValoresSerie,
  unidad: UnidadPeso,
  unidadDistancia: UnidadDistancia,
  medidor: Medidor,
) {
  return evaluarSerie(ej, v, unidad, unidadDistancia, medidor).datos;
}

/** Lo que le falta a la serie para poder guardarse, en palabras: "el peso",
 *  "las reps". Vacio = completa. */
export function faltantes(ej: EjercicioPlan, v: ValoresSerie, medidor: Medidor): string[] {
  return evaluarSerie(ej, v, 'kg', 'km', medidor).falta;
}

/** "a", "a y b", "a, b y c". */
export function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}
