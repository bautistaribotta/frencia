/* Resumen de una sesion al terminarla. Ver docs/specs/registro-de-sesion.md,
   seccion 6.4: duracion, series totales, volumen y ejercicios tocados.

   Se arma con lo que quedo en la base, no con lo que hay en los campos: una
   serie salteada puede tener datos escritos que nunca se guardaron, y el
   resumen tiene que coincidir con lo que despues muestra el historial. */

import type { DatosRegistrados, TipoEjercicio } from './exercises.ts';
import type { SerieRegistrada } from './session.ts';
import { distanciaCompacta, type UnidadDistancia } from './distancia.ts';
import { mostrarPeso, type UnidadPeso } from './peso.ts';
import { reloj } from './tiempo.ts';

/** Lo minimo del plan que hace falta para nombrar y ordenar los ejercicios. */
export interface EjercicioDelPlan {
  exerciseId: string;
  name: string;
  kind: TipoEjercicio;
  tracks: DatosRegistrados;
}

export interface EjercicioResumen extends EjercicioDelPlan {
  series: SerieRegistrada[];
}

/**
 * Agrupa las series por ejercicio, en el orden del plan. Los ejercicios sin
 * ninguna serie guardada no aparecen: el resumen cuenta los ejercicios
 * tocados, no los planificados.
 */
export function agruparPorEjercicio(
  plan: EjercicioDelPlan[],
  series: SerieRegistrada[],
): EjercicioResumen[] {
  const vistos = new Set<string>();
  const resumen: EjercicioResumen[] = [];

  for (const ej of plan) {
    // Un dia puede repetir un ejercicio; sus series comparten clave, asi que
    // se listan una sola vez.
    if (vistos.has(ej.exerciseId)) continue;
    vistos.add(ej.exerciseId);

    const propias = series
      .filter((s) => s.exerciseId === ej.exerciseId)
      .sort((a, b) => a.setIndex - b.setIndex);
    if (propias.length > 0) resumen.push({ ...ej, series: propias });
  }

  return resumen;
}

/**
 * Tonelaje en kg: suma de peso por reps. Solo cuentan las series que tienen
 * las dos cosas, o sea la fuerza. El isometrico y el cardio no tienen reps y
 * no suman; un ejercicio con peso corporal cargado en 0 suma 0.
 */
export function volumenKg(series: SerieRegistrada[]): number {
  return series.reduce(
    (total, s) => (s.weightKg !== null && s.reps !== null ? total + s.weightKg * s.reps : total),
    0,
  );
}

/** Si alguna serie entra en el tonelaje. Sin ninguna, mostrar 0 kg diria que
 *  no se levanto nada cuando en realidad no hay nada que medir. */
export function tieneVolumen(series: SerieRegistrada[]): boolean {
  return series.some((s) => s.weightKg !== null && s.reps !== null);
}

/** Miles separados con espacio duro, como en el design system: "12 480". */
export function miles(valor: number): string {
  return String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * La mejor serie del ejercicio en una sola cifra, para la fila del resumen.
 * Fuerza: el peso mas alto, o las reps si se hizo sin carga. Isometrico: el
 * tiempo mas largo. Cardio: la distancia, o el tiempo si no se midio.
 */
export function mejorMarca(
  ej: EjercicioResumen,
  unidad: UnidadPeso,
  unidadDistancia: UnidadDistancia,
): string {
  const max = (valores: (number | null)[]) =>
    valores.reduce<number | null>((m, v) => (v !== null && (m === null || v > m) ? v : m), null);

  const peso = ej.tracks.weight ? max(ej.series.map((s) => s.weightKg)) : null;
  const reps = ej.tracks.reps ? max(ej.series.map((s) => s.reps)) : null;
  const tiempo = ej.tracks.duration ? max(ej.series.map((s) => s.durationSeconds)) : null;
  const distancia = ej.tracks.distance ? max(ej.series.map((s) => s.distanceM)) : null;

  if (ej.kind === 'cardio') {
    if (distancia !== null) return distanciaCompacta(distancia, unidadDistancia);
    return tiempo !== null ? reloj(tiempo) : '';
  }
  if (ej.kind === 'isometrico') {
    return tiempo !== null ? reloj(tiempo) : '';
  }
  if (peso !== null && peso > 0) return `${mostrarPeso(peso, unidad)} ${unidad}`;
  if (reps !== null) return `${reps} reps`;
  return tiempo !== null ? reloj(tiempo) : '';
}

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

/** Fecha y hora de arranque del ticket: "9 OCT 2026" y "07:42". Armado a mano
 *  porque toLocaleDateString cambia de formato entre motores ("oct." u "oct"). */
export function fechaTicket(epochMs: number): { fecha: string; hora: string } {
  const d = new Date(epochMs);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return {
    fecha: `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`,
    hora: `${hh}:${mm}`,
  };
}

/** Numero de ticket a partir del id de la sesion: "FRENCIA-1A2B-3C4D5E6". */
export function codigoTicket(sessionId: string): string {
  const hex = sessionId.replace(/-/g, '').toUpperCase();
  return `FRENCIA-${hex.slice(0, 4)}-${hex.slice(4, 11)}`;
}

/**
 * Anchos de las barras del codigo de barras decorativo, alternando barra y
 * espacio. Salen del id de la sesion: cada ticket tiene el suyo y siempre el
 * mismo. Cada cifra hexadecimal da una barra de 1 a 3 y un espacio de 1 a 4.
 */
export function barrasTicket(sessionId: string): { barra: number; espacio: number }[] {
  const hex = sessionId.replace(/[^0-9a-f]/gi, '') || '0';
  return [...hex].map((c) => {
    const n = parseInt(c, 16);
    return { barra: 1 + (n % 3), espacio: 1 + (n >> 2) };
  });
}

/** Texto para compartir el entrenamiento por cualquier app de mensajes. */
export function textoParaCompartir(params: {
  nombreDia: string;
  inicio: number;
  duracionSegundos: number;
  ejercicios: EjercicioResumen[];
  unidad: UnidadPeso;
  unidadDistancia: UnidadDistancia;
}): string {
  const { nombreDia, inicio, duracionSegundos, ejercicios, unidad, unidadDistancia } = params;
  const series = ejercicios.flatMap((e) => e.series);
  const { fecha } = fechaTicket(inicio);

  const cifras = [fecha.toLowerCase(), reloj(duracionSegundos)];
  if (tieneVolumen(series)) {
    cifras.push(`${miles(mostrarPeso(volumenKg(series), unidad))} ${unidad}`);
  }

  const lineas = [
    `Sesión completa · ${nombreDia}`,
    cifras.join(' · '),
    `${ejercicios.length} ${ejercicios.length === 1 ? 'ejercicio' : 'ejercicios'} · ${series.length} ${series.length === 1 ? 'serie' : 'series'}`,
    '',
    ...ejercicios.map((e) => {
      const marca = mejorMarca(e, unidad, unidadDistancia);
      return `${e.series.length}× ${e.name}${marca ? ` · ${marca}` : ''}`;
    }),
    '',
    'Registrado con Frencia',
  ];
  return lineas.join('\n');
}
