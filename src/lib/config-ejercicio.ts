/* Frencia · Lo que prescribe el plan para un ejercicio, mientras se configura
   en el selector: estado inicial, reducer y armado del ejercicio del dia. */

import {
  DESCANSO_POR_DEFECTO,
  defaultIntensity,
  esRpeOpcional,
  esSerieUnica,
  type DayExercise,
  type Medidor,
} from './dia';
import { distanciaACanonico, mostrarDistancia, type UnidadDistancia } from './distancia';
import type { DatosRegistrados, TipoEjercicio } from './exercises';
import { mostrarPeso, pesoACanonico, type UnidadPeso } from './peso';

/** Ejercicio ya elegido, venga del catalogo o de un dia armado. */
export interface Elegido {
  id: string;
  name: string;
  kind: TipoEjercicio;
  tracks: DatosRegistrados;
}

// RPE de arranque al activar la intensidad en cardio: un ritmo comodo pero
// sostenido, el mismo valor que usa el design system.
const RPE_CARDIO_POR_DEFECTO = 6;

// Isometricos: una plancha tipica de arranque y un descanso corto, los mismos
// valores de ejemplo del design system.
const TIEMPO_ISOMETRICO_POR_DEFECTO = 30;
const DESCANSO_ISOMETRICO_POR_DEFECTO = 60;

/** RPE de arranque segun el tipo, cuando la intensidad es un RPE opcional. */
function rpePorDefecto(kind: TipoEjercicio): number {
  return kind === 'cardio' ? RPE_CARDIO_POR_DEFECTO : defaultIntensity('rpe');
}

export interface ConfigEjercicio {
  // Ejercicio elegido dentro del modal (null = todavia buscando).
  selected: Elegido | null;
  sets: number;
  reps: number;
  intensityValue: number;
  // null es "sin descanso", un valor valido: no se puede usar ?? con el.
  restSeconds: number | null;
  // Cardio e isometricos: tiempo en segundos y distancia en la unidad del
  // usuario. null (o 0) es "el plan no lo dice". El tiempo es obligatorio; la
  // distancia, como el RPE, es opcional.
  tiempo: number | null;
  distancia: number | null;
  // Isometricos: peso por serie en la unidad del usuario. null = sin peso, lo
  // habitual en una plancha.
  pesoPlan: number | null;
  // En cardio e isometricos la intensidad es un RPE opcional ("Sin RPE" es la
  // otra opcion).
  conRpe: boolean;
}

export interface ContextoConfig {
  medidor: Medidor;
  editando: DayExercise | null | undefined;
  unidadDistancia: UnidadDistancia;
  unidadPeso: UnidadPeso;
}

/** Editando arranca con el ejercicio y sus valores; agregando, con los de
 *  siempre. */
export function configInicial({ medidor, editando, unidadDistancia, unidadPeso }: ContextoConfig): ConfigEjercicio {
  return {
    selected: editando
      ? { id: editando.exerciseId, name: editando.name, kind: editando.kind, tracks: editando.tracks }
      : null,
    sets: editando?.sets ?? 3,
    reps: editando?.reps ?? 10,
    intensityValue:
      editando?.intensityValue ??
      (editando && esRpeOpcional(editando.kind) ? rpePorDefecto(editando.kind) : defaultIntensity(medidor)),
    restSeconds: editando ? editando.restSeconds : DESCANSO_POR_DEFECTO,
    tiempo: editando?.durationSeconds ?? null,
    distancia: editando?.distanceM != null ? mostrarDistancia(editando.distanceM, unidadDistancia) : null,
    pesoPlan: editando?.weightKg != null ? mostrarPeso(editando.weightKg, unidadPeso) : null,
    conRpe: editando ? editando.intensityKind !== null : false,
  };
}

type CampoConfig = Exclude<keyof ConfigEjercicio, 'selected'>;

export type AccionConfig =
  | { tipo: 'elegir'; ejercicio: Elegido; medidor: Medidor }
  | { tipo: 'soltar' }
  | { [K in CampoConfig]: { tipo: 'campo'; campo: K; valor: ConfigEjercicio[K] } }[CampoConfig];

export function reducerConfig(c: ConfigEjercicio, a: AccionConfig): ConfigEjercicio {
  switch (a.tipo) {
    case 'elegir': {
      // Elegir del catalogo arranca con los valores de siempre para su tipo.
      const { kind } = a.ejercicio;
      const cardio = esSerieUnica(kind);
      const isometrico = kind === 'isometrico';
      return {
        selected: a.ejercicio,
        sets: cardio ? 1 : 3,
        reps: 10,
        intensityValue: esRpeOpcional(kind) ? rpePorDefecto(kind) : defaultIntensity(a.medidor),
        restSeconds: cardio ? null : isometrico ? DESCANSO_ISOMETRICO_POR_DEFECTO : DESCANSO_POR_DEFECTO,
        tiempo: isometrico ? TIEMPO_ISOMETRICO_POR_DEFECTO : null,
        distancia: null,
        pesoPlan: null,
        conRpe: false,
      };
    }
    case 'soltar':
      return { ...c, selected: null };
    case 'campo':
      return { ...c, [a.campo]: a.valor };
  }
}

/** Editando se respeta el medidor con el que se guardo el ejercicio, no la
 *  preferencia actual del perfil. Si el usuario paso de RIR a RPE, reetiquetar
 *  un "2 RIR" como "2 RPE" cambiaria el dato sin que nadie lo pida. Ademas el
 *  centinela -1 ("al fallo") solo existe en RIR y hay que poder mostrarlo.
 *  Cardio e isometricos solo admiten RPE: "repeticiones en reserva" no aplica
 *  a correr ni a sostener una posicion. */
export function medidorActivo(c: ConfigEjercicio, { medidor, editando }: ContextoConfig): Medidor {
  const rpeOpcional = c.selected !== null && esRpeOpcional(c.selected.kind);
  return rpeOpcional ? 'rpe' : (editando?.intensityKind ?? medidor);
}

/** En cardio e isometricos el tiempo es lo unico obligatorio del plan. */
export function tiempoValido(c: ConfigEjercicio): boolean {
  const s = c.selected;
  if (!s || !(esSerieUnica(s.kind) || s.kind === 'isometrico')) return true;
  return !s.tracks.duration || (c.tiempo ?? 0) > 0;
}

/** El ejercicio del dia tal como queda configurado, o null si falta algo. */
export function armarEjercicio(c: ConfigEjercicio, ctx: ContextoConfig, uid: string): DayExercise | null {
  const { selected, sets, reps, intensityValue, restSeconds, tiempo, distancia, pesoPlan, conRpe } = c;
  if (!selected || !tiempoValido(c)) return null;
  const base = {
    uid,
    exerciseId: selected.id,
    name: selected.name,
    kind: selected.kind,
    tracks: selected.tracks,
    weightKg: null,
  };
  if (esSerieUnica(selected.kind)) {
    return {
      ...base,
      sets: 1,
      reps: null,
      durationSeconds: selected.tracks.duration && tiempo ? tiempo : null,
      distanceM:
        selected.tracks.distance && distancia ? distanciaACanonico(distancia, ctx.unidadDistancia) : null,
      intensityKind: conRpe ? 'rpe' : null,
      intensityValue: conRpe ? intensityValue : null,
      restSeconds: null,
    };
  }
  if (selected.kind === 'isometrico') {
    return {
      ...base,
      sets,
      reps: null,
      durationSeconds: selected.tracks.duration && tiempo ? tiempo : null,
      distanceM: null,
      weightKg: selected.tracks.weight && pesoPlan ? pesoACanonico(pesoPlan, ctx.unidadPeso) : null,
      intensityKind: conRpe ? 'rpe' : null,
      intensityValue: conRpe ? intensityValue : null,
      restSeconds,
    };
  }
  return {
    ...base,
    sets,
    reps,
    durationSeconds: null,
    distanceM: null,
    intensityKind: medidorActivo(c, ctx),
    intensityValue,
    restSeconds,
  };
}
