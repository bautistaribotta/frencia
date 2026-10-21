/* Frencia · Estado del wizard de la sesion y su reducer. Puro: lo que
   necesita la hora lo recibe en la accion. */

import type { EjercicioResumen } from './resumen-sesion';
import { claveDescanso, generarPasos, VACIO, type Paso, type ValoresSerie } from './sesion-pasos';
import type { EjercicioPlan, SerieFantasma } from './session';

// --- Estado ------------------------------------------------------------------

export type FaseSesion = 'cargando' | 'conflicto' | 'sinEjercicios' | 'listo' | 'resumen';

/** Sesion en curso que no es de este dia. Bloquea empezar (solo puede haber
 *  una) y hay que resolverla a mano: retomarla o descartarla. */
export interface ConflictoSesion {
  id: string;
  diaId: string | null;
  nombre: string;
}

/** Ultimo paso del wizard: lo que quedo guardado, antes de cerrar la sesion.
 *  La duracion se congela al llegar aca para que el ticket no cambie mientras
 *  se lo mira. */
export interface ResumenEnPantalla {
  inicio: number;
  duracionSegundos: number;
  ejercicios: EjercicioResumen[];
}

export interface EstadoSesion {
  fase: FaseSesion;
  // El nombre llega por parametro para pintarlo sin esperar la red, pero lo
  // pisa el del dia real si se termina retomando una sesion de otro dia.
  nombreDia: string;
  conflicto: ConflictoSesion | null;
  sessionId: string | null;
  plan: EjercicioPlan[];
  fantasmas: Map<string, SerieFantasma>;
  // Series por ejercicio. Arranca en lo planificado y el usuario la mueve en
  // vivo (sumar una serie, cortar el ejercicio aca).
  cantidades: number[];
  valores: Record<string, ValoresSerie>;
  indiceGuardado: number;
  guardando: boolean;
  menuAbierto: boolean;
  resumen: ResumenEnPantalla | null;
  compartiendo: boolean;
  // El cronometro del isometrico esta midiendo: la serie ya no esta vacia
  // aunque todavia no tenga tiempo.
  midiendo: boolean;
  // Momento en que se entro a cada paso de descanso. El restante se calcula
  // contra esto y no descontando de a un segundo, asi el numero sigue siendo
  // correcto despues de que la app estuvo en segundo plano.
  iniciosDescanso: Record<string, number>;
  // Segundos sumados o restados a mano en cada descanso. El descanso del plan
  // es una guia: el ajuste vale solo para ese descanso y el siguiente vuelve a
  // arrancar en lo que dice el plan.
  ajustesDescanso: Record<string, number>;
  descansoTerminado: boolean;
}

export type AccionSesion =
  | { tipo: 'fase'; fase: FaseSesion }
  | { tipo: 'conflicto'; conflicto: ConflictoSesion | null }
  | { tipo: 'sesion'; sessionId: string; nombreDia: string }
  | {
      tipo: 'preparada';
      plan: EjercicioPlan[];
      fantasmas: Map<string, SerieFantasma>;
      cantidades: number[];
      valores: Record<string, ValoresSerie>;
      indice: number;
    }
  | { tipo: 'irAPaso'; indice: number; ahora: number }
  | { tipo: 'indice'; indice: number }
  | { tipo: 'campo'; clave: string; campo: keyof ValoresSerie; valor: ValoresSerie[keyof ValoresSerie] }
  | { tipo: 'sumarSerie' }
  | { tipo: 'cortarEjercicio' }
  | { tipo: 'guardando'; valor: boolean }
  | { tipo: 'menu'; abierto: boolean }
  | { tipo: 'resumen'; resumen: ResumenEnPantalla }
  | { tipo: 'volverASesion' }
  | { tipo: 'compartiendo'; valor: boolean }
  | { tipo: 'midiendo'; valor: boolean }
  | { tipo: 'ajusteDescanso'; clave: string; ajuste: number }
  | { tipo: 'descansoTerminado'; valor: boolean };

export function estadoInicial(nombreDia: string): EstadoSesion {
  return {
    fase: 'cargando',
    nombreDia,
    conflicto: null,
    sessionId: null,
    plan: [],
    fantasmas: new Map(),
    cantidades: [],
    valores: {},
    indiceGuardado: 0,
    guardando: false,
    menuAbierto: false,
    resumen: null,
    compartiendo: false,
    midiendo: false,
    iniciosDescanso: {},
    ajustesDescanso: {},
    descansoTerminado: false,
  };
}

/** Cortar un ejercicio saca pasos de la lista y puede dejar el indice guardado
 *  mas alla del final. Se lee acotado al ultimo paso que quedo. */
export function indiceAcotado(indiceGuardado: number, pasos: Paso[]): number {
  return Math.min(indiceGuardado, Math.max(0, pasos.length - 1));
}

function pasoActual(e: EstadoSesion): Paso | null {
  const pasos = generarPasos(e.plan, e.cantidades);
  return pasos[indiceAcotado(e.indiceGuardado, pasos)] ?? null;
}

export function reducerSesion(e: EstadoSesion, a: AccionSesion): EstadoSesion {
  switch (a.tipo) {
    case 'fase':
      return { ...e, fase: a.fase };
    case 'conflicto':
      return { ...e, conflicto: a.conflicto };
    case 'sesion':
      return { ...e, sessionId: a.sessionId, nombreDia: a.nombreDia };
    case 'preparada':
      return {
        ...e,
        plan: a.plan,
        fantasmas: a.fantasmas,
        cantidades: a.cantidades,
        valores: a.valores,
        indiceGuardado: a.indice,
        fase: 'listo',
      };
    case 'irAPaso': {
      // Al entrar a un descanso se fija su arranque, una sola vez: volver
      // atras y avanzar de nuevo retoma la cuenta donde iba en vez de
      // reiniciarla.
      const destino = generarPasos(e.plan, e.cantidades)[a.indice];
      if (!destino || destino.tipo !== 'descanso') return { ...e, indiceGuardado: a.indice };
      const k = claveDescanso(destino);
      return {
        ...e,
        indiceGuardado: a.indice,
        iniciosDescanso: e.iniciosDescanso[k] ? e.iniciosDescanso : { ...e.iniciosDescanso, [k]: a.ahora },
      };
    }
    case 'indice':
      return { ...e, indiceGuardado: a.indice };
    case 'campo':
      return {
        ...e,
        valores: { ...e.valores, [a.clave]: { ...(e.valores[a.clave] ?? VACIO), [a.campo]: a.valor } },
      };
    case 'sumarSerie': {
      const paso = pasoActual(e);
      if (!paso) return e;
      return {
        ...e,
        cantidades: e.cantidades.map((c, i) => (i === paso.ejercicio ? c + 1 : c)),
        menuAbierto: false,
      };
    }
    case 'cortarEjercicio': {
      // Corta el ejercicio en la serie actual: las que quedaban desaparecen.
      const paso = pasoActual(e);
      if (!paso) return e;
      const hasta = paso.tipo === 'serie' ? paso.serie + 1 : paso.despuesDe + 1;
      return {
        ...e,
        cantidades: e.cantidades.map((c, i) => (i === paso.ejercicio ? Math.min(c, hasta) : c)),
        menuAbierto: false,
      };
    }
    case 'guardando':
      return { ...e, guardando: a.valor };
    case 'menu':
      return { ...e, menuAbierto: a.abierto };
    case 'resumen':
      return { ...e, resumen: a.resumen, fase: 'resumen' };
    case 'volverASesion':
      return { ...e, resumen: null, fase: 'listo' };
    case 'compartiendo':
      return { ...e, compartiendo: a.valor };
    case 'midiendo':
      return { ...e, midiendo: a.valor };
    case 'ajusteDescanso':
      return { ...e, ajustesDescanso: { ...e.ajustesDescanso, [a.clave]: a.ajuste } };
    case 'descansoTerminado':
      return { ...e, descansoTerminado: a.valor };
  }
}
