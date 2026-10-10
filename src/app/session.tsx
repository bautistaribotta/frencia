/* Frencia · Sesion de entrenamiento — wizard paso a paso.
   Ver docs/specs/registro-de-sesion.md, seccion 6.

   Un paso por pantalla, con Anterior y Siguiente. Los pasos se generan del plan
   del dia: una serie, su descanso, la siguiente serie, y asi. El telefono en el
   gimnasio se mira de a segundos entre serie y serie, muchas veces con una mano;
   una sola decision por pantalla se completa sin leer.

   Cada serie se escribe al pasar al paso siguiente, no al terminar la sesion:
   un entrenamiento dura una hora con la pantalla apagandose y salir de la app
   no puede perder nada. */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

import { supabase } from '@/lib/supabase';
import { esSerieUnica } from '@/lib/dia';
import { reloj } from '@/lib/tiempo';
import {
  distanciaACanonico,
  distanciaTabla,
  mostrarDistancia,
  type UnidadDistancia,
} from '@/lib/distancia';
import { mostrarPeso, pesoACanonico, type UnidadPeso } from '@/lib/peso';
import { alerta } from '@/lib/alerta';
import {
  agruparPorEjercicio,
  type EjercicioResumen,
} from '@/lib/resumen-sesion';
import {
  cargarFantasmas,
  cargarNombreDia,
  cargarParaResumen,
  cargarPlan,
  cargarSeriesDeSesion,
  claveSerie,
  crearSesion,
  descartarSesion,
  guardarSerieConRespaldo,
  haceCuanto,
  leerPendientes,
  sesionEnCurso,
  sincronizarPendientes,
  terminarSesion,
  type EjercicioPlan,
  type Medidor,
  type SerieCargada,
  type SerieFantasma,
} from '@/lib/session';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { MarqueeText } from '@/components/MarqueeText';
import { ResumenSesion } from '@/components/ResumenSesion';
import { RestRing } from '@/components/RestRing';
import { SerieComparativa, type ColumnaSerie } from '@/components/SerieComparativa';

import {
  Button,
  DistanceField,
  DurationField,
  FrenciaText,
  Icon,
  IconButton,
  IsoTimer,
  NumberField,
  ProgressBar,
  mono,
  radius,
  sizing,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

// --- Modelo de pasos ---------------------------------------------------------

type Paso =
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
function generarPasos(plan: EjercicioPlan[], cantidades: number[]): Paso[] {
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

function claveDescanso(p: Extract<Paso, { tipo: 'descanso' }>): string {
  return `d-${p.ejercicio}-${p.despuesDe}`;
}

// --- Helpers -----------------------------------------------------------------

/** Acepta coma o punto: en el teclado del telefono sale la coma. */
function parseNum(texto: string): number | null {
  const limpio = texto.replace(',', '.').trim();
  if (limpio === '') return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

function mmss(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Intensidad pelada para una celda: la columna ya dice si es RIR o RPE.
 *  null si no hay intensidad. */
function valorIntensidad(kind: Medidor | null, value: number | null): string | null {
  if (kind === null || value === null) return null;
  if (kind === 'rir' && value < 0) return 'Fallo';
  return String(value);
}

/** Cuanto suma o resta cada toque a los botones del descanso, en segundos. */
const PASO_AJUSTE = 10;

/* Aviso de fin del descanso: tres golpes fuertes en vez de la notificacion del
   sistema, que con el telefono en el bolsillo pasa desapercibida. Lo que lo
   hace reconocible es la repeticion, no la fuerza de cada golpe: uno solo, por
   fuerte que sea, se confunde con cualquier otra cosa. */
const AVISO_FIN = [0, 160, 320];

function avisarFinDescanso() {
  if (Platform.OS === 'web') return;
  AVISO_FIN.forEach((demora) => {
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }, demora);
  });
}

/** Series del ejercicio que quedaron hechas al llegar a un descanso. */
function seriesHechas(hechas: number, total: number): string {
  return `${hechas} de ${total} ${total === 1 ? 'serie hecha' : 'series hechas'}`;
}

/** Lo cargado en una serie. Peso, reps e intensidad son el texto de su caja;
 *  el tiempo va en segundos y la distancia en la unidad del usuario, que es lo
 *  que manejan sus campos. */
interface ValoresSerie {
  peso: string;
  reps: string;
  intensidad: string;
  tiempo: number | null;
  distancia: number | null;
}

const VACIO: ValoresSerie = { peso: '', reps: '', intensidad: '', tiempo: null, distancia: null };

/** Una serie guardada (en la base o pendiente en el telefono) vuelta a los
 *  campos, en las unidades del usuario. */
function aValores(
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

// --- Pantalla ----------------------------------------------------------------

export default function SessionScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { showToast } = useToast();
  const { profile } = useProfile();

  const params = useLocalSearchParams<{ dia?: string; nombre?: string }>();
  const trainingDayId = params.dia ?? '';
  // El nombre llega por parametro para pintarlo sin esperar la red, pero lo
  // pisa el del dia real si se termina retomando una sesion de otro dia.
  const [nombreDia, setNombreDia] = useState(params.nombre ?? 'Entrenamiento');

  const medidor: Medidor = profile?.medidorEsfuerzo ?? 'rir';
  const unidad: UnidadPeso = profile?.unidadPeso ?? 'kg';
  const unidadDistancia: UnidadDistancia = profile?.unidadDistancia ?? 'km';

  const [fase, setFase] = useState<
    'cargando' | 'conflicto' | 'sinEjercicios' | 'listo' | 'resumen'
  >('cargando');
  // Sesion en curso que no es de este dia. Bloquea empezar (solo puede haber
  // una) y hay que resolverla a mano: retomarla o descartarla.
  const [conflicto, setConflicto] = useState<{
    id: string;
    diaId: string | null;
    nombre: string;
  } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [plan, setPlan] = useState<EjercicioPlan[]>([]);
  const [fantasmas, setFantasmas] = useState<Map<string, SerieFantasma>>(new Map());
  // Series por ejercicio. Arranca en lo planificado y el usuario la mueve en
  // vivo (sumar una serie, cortar el ejercicio aca).
  const [cantidades, setCantidades] = useState<number[]>([]);
  const [valores, setValores] = useState<Record<string, ValoresSerie>>({});
  const [indiceGuardado, setIndex] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  // Ultimo paso del wizard: lo que quedo guardado, antes de cerrar la sesion.
  // La duracion se congela al llegar aca para que el ticket no cambie mientras
  // se lo mira.
  const [resumen, setResumen] = useState<{
    inicio: number;
    duracionSegundos: number;
    ejercicios: EjercicioResumen[];
  } | null>(null);
  // El ticket que se captura como imagen al compartir.
  const capturaRef = useRef<View>(null);
  const [compartiendo, setCompartiendo] = useState(false);
  // El cronometro del isometrico esta midiendo: la serie ya no esta vacia
  // aunque todavia no tenga tiempo.
  const [midiendo, setMidiendo] = useState(false);

  // Momento en que se entro a cada paso de descanso. El restante se calcula
  // contra esto y no descontando de a un segundo, asi el numero sigue siendo
  // correcto despues de que la app estuvo en segundo plano.
  const [iniciosDescanso, setIniciosDescanso] = useState<Record<string, number>>({});
  // Segundos sumados o restados a mano en cada descanso. El descanso del plan
  // es una guia: el ajuste vale solo para ese descanso y el siguiente vuelve a
  // arrancar en lo que dice el plan.
  const [ajustesDescanso, setAjustesDescanso] = useState<Record<string, number>>({});
  const [ahora, setAhora] = useState(() => Date.now());
  const yaVibro = useRef<Set<string>>(new Set());
  // Se avisa una sola vez por sesion que hay series guardadas solo en el
  // telefono; repetirlo en cada paso sin senal seria puro ruido.
  const avisoPendientes = useRef(false);

  // Con el teclado abierto el alto se achica y la serie anclada abajo queda
  // fuera de vista: el scroll baja hasta el final para mostrar la fila de hoy.
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => sub.remove();
  }, []);

  const pasos = useMemo(() => generarPasos(plan, cantidades), [plan, cantidades]);
  // Cortar un ejercicio saca pasos de la lista y puede dejar el indice guardado
  // mas alla del final. Se lee acotado al ultimo paso que quedo.
  const index = Math.min(indiceGuardado, Math.max(0, pasos.length - 1));
  const paso = pasos[index] ?? null;
  const ejercicioActual = paso ? plan[paso.ejercicio] : null;

  // --- Carga inicial ---------------------------------------------------------

  /** Deja la pantalla lista para registrar contra una sesion y un dia dados. */
  const preparar = useCallback(
    async (sesId: string, diaId: string, nombre: string, planPrecargado?: EjercicioPlan[]) => {
      const [ejercicios, ghosts, yaCargadas, pendientes] = await Promise.all([
        planPrecargado ? Promise.resolve(planPrecargado) : cargarPlan(diaId),
        cargarFantasmas(diaId),
        cargarSeriesDeSesion(sesId),
        leerPendientes(sesId),
      ]);

      setSessionId(sesId);
      setNombreDia(nombre);

      if (ejercicios.length === 0) {
        setFase('sinEjercicios');
        return;
      }

      // Lo ya registrado vuelve a los campos, en la unidad del usuario, para
      // que retomar muestre exactamente lo que se habia anotado.
      const previos: Record<string, ValoresSerie> = {};
      yaCargadas.forEach((v, clave) => {
        previos[clave] = aValores(v, unidad, unidadDistancia);
      });
      // Lo que quedo solo en el telefono es mas nuevo que lo de la base.
      for (const p of pendientes) {
        previos[claveSerie(p.exerciseId, p.setIndex)] = aValores(p, unidad, unidadDistancia);
      }
      if (pendientes.length > 0) sincronizarPendientes(sesId).catch(() => {});

      const cant = ejercicios.map((e) => Math.max(1, e.sets));

      // Retomar cae en la primera serie sin cargar, no en el principio.
      let arranque = generarPasos(ejercicios, cant).findIndex(
        (p) =>
          p.tipo === 'serie' &&
          !previos[claveSerie(ejercicios[p.ejercicio].exerciseId, p.serie + 1)],
      );
      if (arranque < 0) arranque = 0;

      setPlan(ejercicios);
      setFantasmas(ghosts);
      setCantidades(cant);
      setValores(previos);
      setIndex(arranque);
      setFase('listo');
    },
    [unidad, unidadDistancia],
  );

  useEffect(() => {
    let cancelado = false;

    (async () => {
      if (!trainingDayId) {
        setFase('sinEjercicios');
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelado) {
        setFase('sinEjercicios');
        return;
      }

      const abierta = await sesionEnCurso(user.id);
      if (cancelado) return;

      // Sesion en curso de otro dia. No se retoma sola: puede ser de una rutina
      // que despues se archivo, y como el indice unico solo deja una sesion
      // abierta, retomarla en silencio dejaba al usuario encerrado sin poder
      // empezar ninguna otra.
      if (abierta && abierta.trainingDayId !== trainingDayId) {
        const nombre = abierta.trainingDayId
          ? await cargarNombreDia(abierta.trainingDayId)
          : null;
        if (cancelado) return;
        setConflicto({
          id: abierta.id,
          diaId: abierta.trainingDayId,
          nombre: nombre ?? 'un día que ya no existe',
        });
        setFase('conflicto');
        return;
      }

      if (abierta) {
        await preparar(abierta.id, trainingDayId, params.nombre ?? 'Entrenamiento');
        return;
      }

      // Sin sesion previa. Miramos el plan antes de crear nada: abrir una
      // sesion para un dia sin ejercicios deja otra sesion muerta trabando la
      // siguiente.
      const ejercicios = await cargarPlan(trainingDayId);
      if (cancelado) return;
      if (ejercicios.length === 0) {
        setFase('sinEjercicios');
        return;
      }

      const nueva = await crearSesion(user.id, trainingDayId);
      if (cancelado) return;
      if (!nueva) {
        showToast({ message: 'No pudimos abrir la sesión. Proba de nuevo.', type: 'error' });
        setFase('sinEjercicios');
        return;
      }

      await preparar(nueva.id, trainingDayId, params.nombre ?? 'Entrenamiento', ejercicios);
    })();

    return () => {
      cancelado = true;
    };
    // Solo al montar: la sesion se abre una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingDayId]);

  // --- Descanso --------------------------------------------------------------

  /** Mueve al paso `i`. Al entrar a un descanso se fija su arranque, una sola
   *  vez: volver atras y avanzar de nuevo retoma la cuenta donde iba en vez de
   *  reiniciarla. El reloj se pone en hora en el mismo momento para que el
   *  primer cuadro no calcule contra un `ahora` viejo. */
  function irAPaso(i: number) {
    setIndex(i);
    const destino = pasos[i];
    if (!destino || destino.tipo !== 'descanso') return;
    const k = claveDescanso(destino);
    const t = Date.now();
    setAhora(t);
    setIniciosDescanso((prev) => (prev[k] ? prev : { ...prev, [k]: t }));
  }

  // El reloj solo corre mientras se esta parado en un descanso. Cada medio
  // segundo para que el numero no se atrase visiblemente respecto del segundo
  // real que se muestra.
  useEffect(() => {
    if (!paso || paso.tipo !== 'descanso') return;
    const id = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(id);
  }, [paso]);

  let restante = 0;
  // Duracion del descanso con los ajustes a mano ya aplicados. El aro se dibuja
  // contra esto para que la parte llena siga siendo la proporcion real.
  let totalDescanso = 0;
  // Momento en que termina, para que el aro anime contra un instante fijo en
  // vez de reaccionar al tick del texto.
  let finDescanso = 0;
  if (paso?.tipo === 'descanso' && ejercicioActual?.restSeconds) {
    const k = claveDescanso(paso);
    totalDescanso = ejercicioActual.restSeconds + (ajustesDescanso[k] ?? 0);
    const inicio = iniciosDescanso[k];
    restante = inicio
      ? Math.max(0, totalDescanso - Math.floor((ahora - inicio) / 1000))
      : totalDescanso;
    finDescanso = inicio ? inicio + totalDescanso * 1000 : 0;
  }

  useEffect(() => {
    if (!paso || paso.tipo !== 'descanso' || restante > 0) return;
    const k = claveDescanso(paso);
    if (yaVibro.current.has(k)) return;
    yaVibro.current.add(k);
    avisarFinDescanso();
  }, [paso, restante]);

  /** Suma o resta segundos al descanso que esta corriendo. */
  function ajustarDescanso(delta: number) {
    if (!paso || paso.tipo !== 'descanso') return;
    const base = ejercicioActual?.restSeconds;
    if (!base) return;
    // Restar cuando ya no queda nada no hace nada: el descanso termino.
    if (delta < 0 && restante === 0) return;

    // El piso es lo que ya paso, no cero: restar 10 sobre 4 segundos termina el
    // descanso y no deja una deuda que despues haya que compensar sumando.
    const transcurrido = totalDescanso - restante;
    const nuevo = Math.max(transcurrido, totalDescanso + delta);
    if (nuevo === totalDescanso) return;

    const k = claveDescanso(paso);
    // Sumar tiempo despues de que sono devuelve el aviso del nuevo final.
    if (delta > 0) yaVibro.current.delete(k);
    setAjustesDescanso((prev) => ({ ...prev, [k]: nuevo - base }));

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }

  // --- Valores de la serie ---------------------------------------------------

  const claveActual =
    paso?.tipo === 'serie' && ejercicioActual
      ? claveSerie(ejercicioActual.exerciseId, paso.serie + 1)
      : null;

  const valorActual = claveActual ? (valores[claveActual] ?? VACIO) : VACIO;

  const setCampo = useCallback(
    <K extends keyof ValoresSerie>(campo: K, valor: ValoresSerie[K]) => {
      if (!claveActual) return;
      setValores((prev) => ({
        ...prev,
        [claveActual]: { ...(prev[claveActual] ?? VACIO), [campo]: valor },
      }));
    },
    [claveActual],
  );

  // --- Navegacion ------------------------------------------------------------

  /** Escribe la serie del paso actual si esta completa. Incompleta no bloquea:
   *  la sesion es libre, simplemente no se registra nada. */
  const persistirSiCorresponde = useCallback(async () => {
    if (!paso || paso.tipo !== 'serie' || !ejercicioActual || !sessionId || !claveActual) return;

    const v = valores[claveActual];
    if (!v) return;

    const datos = datosAGuardar(ejercicioActual, v, unidad, unidadDistancia, medidor);
    if (!datos) return;

    const resultado = await guardarSerieConRespaldo({
      sessionId,
      exerciseId: ejercicioActual.exerciseId,
      setIndex: paso.serie + 1,
      ...datos,
    });

    if (resultado === 'guardada') {
      // Volvio la conexion: aprovechamos para vaciar lo que haya quedado atras.
      sincronizarPendientes(sessionId).catch(() => {});
    } else if (!avisoPendientes.current) {
      avisoPendientes.current = true;
      showToast({
        message: 'Sin conexión. La serie queda en el teléfono y se sincroniza sola.',
        type: 'error',
      });
    }
  }, [paso, ejercicioActual, sessionId, claveActual, valores, unidad, unidadDistancia, medidor, showToast]);

  async function siguiente() {
    if (guardando) return;
    if (index >= pasos.length - 1) {
      finalizar();
      return;
    }
    setGuardando(true);
    await persistirSiCorresponde();
    setGuardando(false);
    irAPaso(index + 1);
  }

  async function anterior() {
    if (guardando || index === 0) return;
    setGuardando(true);
    await persistirSiCorresponde();
    setGuardando(false);
    irAPaso(index - 1);
  }

  /** Sale dejando la sesion en curso: al volver se retoma donde quedo. */
  function salir() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  function finalizar() {
    return terminar(true);
  }

  /** Lleva al resumen, el ultimo paso del wizard. Con `guardarActual` en
   *  false la serie del paso actual no se escribe: es lo que pasa al
   *  saltearla en el ultimo paso. La sesion todavia no se cierra: eso pasa
   *  recien con Hecho, en el resumen. */
  async function terminar(guardarActual: boolean) {
    if (!sessionId) return;
    setGuardando(true);
    if (guardarActual) await persistirSiCorresponde();

    // No se cierra una sesion con series que todavia no llegaron a la base:
    // el historial y las fantasmas de la proxima vez saldrian incompletos.
    const sinSincronizar = await sincronizarPendientes(sessionId);
    if (sinSincronizar > 0) {
      setGuardando(false);
      setMenuAbierto(false);
      const cuantas = sinSincronizar === 1 ? 'Queda 1 serie' : `Quedan ${sinSincronizar} series`;
      showToast({
        message: `${cuantas} sin sincronizar. Revisá la conexión y probá de nuevo.`,
        type: 'error',
      });
      return;
    }

    // El resumen sale de la base y no de los campos: una serie salteada puede
    // tener datos escritos que nunca se guardaron.
    const registro = await cargarParaResumen(sessionId);
    setGuardando(false);
    setMenuAbierto(false);
    if (!registro) {
      showToast({ message: 'No pudimos armar el resumen. Probá de nuevo.', type: 'error' });
      return;
    }

    // Una sesion sin series no se guarda vacia: ensuciaria el historial y
    // contaria para la racha sin que se haya entrenado.
    if (registro.series.length === 0) {
      alerta(
        'No registraste ninguna serie',
        'Una sesión vacía no se guarda en el historial. ¿La descartamos?',
        [
          { text: 'Seguir entrenando', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => { void descartarVacia(); } },
        ],
      );
      return;
    }

    setResumen({
      inicio: registro.startedAt,
      duracionSegundos: Math.max(0, Math.round((Date.now() - registro.startedAt) / 1000)),
      ejercicios: agruparPorEjercicio(plan, registro.series),
    });
    setFase('resumen');
  }

  async function descartarVacia() {
    if (!sessionId) return;
    if (!(await descartarSesion(sessionId))) {
      showToast({ message: 'No pudimos descartar la sesión. Probá de nuevo.', type: 'error' });
      return;
    }
    showToast({ message: 'Sesión descartada', type: 'info' });
    router.replace('/home');
  }

  /** Hecho en el resumen: recien aca se setea finished_at. */
  async function confirmarTerminar() {
    if (!sessionId || guardando) return;
    setGuardando(true);
    const ok = await terminarSesion(sessionId);
    setGuardando(false);
    if (!ok) {
      showToast({ message: 'No pudimos guardar el entrenamiento. Probá de nuevo.', type: 'error' });
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    showToast({ message: 'Entrenamiento guardado', type: 'success' });
    router.replace('/home');
  }

  /** Vuelve del resumen al wizard, al mismo paso, para corregir algo. */
  function volverASesion() {
    setResumen(null);
    setFase('listo');
  }

  /** Comparte el ticket como imagen PNG, tal como se ve en pantalla. */
  async function compartirResumen() {
    if (!resumen || compartiendo) return;
    setCompartiendo(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        showToast({ message: 'Este dispositivo no permite compartir imágenes.', type: 'error' });
        return;
      }
      const uri = await captureRef(capturaRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        UTI: 'public.png',
        dialogTitle: 'Compartir sesión',
      });
    } catch {
      showToast({ message: 'No pudimos compartir el resumen.', type: 'error' });
    } finally {
      setCompartiendo(false);
    }
  }

  // --- Resolucion del conflicto de sesiones ----------------------------------

  async function retomarConflicto() {
    if (!conflicto?.diaId) return;
    setFase('cargando');
    await preparar(conflicto.id, conflicto.diaId, conflicto.nombre);
    setConflicto(null);
  }

  /** Tira la sesion vieja y arranca la de este dia. */
  async function descartarConflicto() {
    if (!conflicto) return;
    setFase('cargando');

    if (!(await descartarSesion(conflicto.id))) {
      showToast({ message: 'No pudimos descartar la sesión. Proba de nuevo.', type: 'error' });
      setFase('conflicto');
      return;
    }
    setConflicto(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const ejercicios = user ? await cargarPlan(trainingDayId) : [];
    if (!user || ejercicios.length === 0) {
      setFase('sinEjercicios');
      return;
    }

    const nueva = await crearSesion(user.id, trainingDayId);
    if (!nueva) {
      showToast({ message: 'No pudimos abrir la sesión. Proba de nuevo.', type: 'error' });
      setFase('sinEjercicios');
      return;
    }
    await preparar(nueva.id, trainingDayId, params.nombre ?? 'Entrenamiento', ejercicios);
  }

  /** Salida de emergencia del dia sin ejercicios: si quedo una sesion abierta
   *  apuntando aca, se tira para no trabar la proxima. */
  async function descartarYSalir() {
    if (sessionId) await descartarSesion(sessionId);
    salir();
  }

  // --- Acciones del menu -----------------------------------------------------

  function sumarSerie() {
    if (!paso) return;
    setCantidades((prev) => prev.map((c, i) => (i === paso.ejercicio ? c + 1 : c)));
    setMenuAbierto(false);
  }

  /** Corta el ejercicio en la serie actual: las que quedaban desaparecen. */
  function cortarEjercicio() {
    if (!paso) return;
    const hasta = paso.tipo === 'serie' ? paso.serie + 1 : paso.despuesDe + 1;
    setCantidades((prev) => prev.map((c, i) => (i === paso.ejercicio ? Math.min(c, hasta) : c)));
    setMenuAbierto(false);
  }

  /** Saltea la serie actual: no se guarda y se pasa a la proxima serie, sin
   *  el descanso de por medio, que era para despues de esta. En la ultima
   *  serie de la sesion la cierra. Se puede deshacer desde el aviso, por si
   *  fue un toque sin querer: la serie sigue en la lista, solo se la pasa. */
  function saltarSerie() {
    if (!paso || paso.tipo !== 'serie') return;
    setMenuAbierto(false);
    const desde = index;
    const proxima = pasos.findIndex((p, i) => i > index && p.tipo === 'serie');
    if (proxima < 0) {
      terminar(false);
      return;
    }
    irAPaso(proxima);
    showToast({
      message: 'Serie salteada',
      type: 'info',
      action: { label: 'Deshacer', onPress: () => setIndex(desde) },
    });
  }

  // --- Render ----------------------------------------------------------------

  if (fase === 'cargando') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centro}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (fase === 'conflicto' && conflicto) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centro}>
          <Icon name="alert-triangle" size={28} color={colors.intensity} />
          <FrenciaText role="title" style={styles.centrado}>
            Tenés una sesión sin terminar
          </FrenciaText>
          <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.centrado}>
            Quedó abierta en {conflicto.nombre}. Solo puede haber una sesión a la vez, así que
            hay que cerrarla antes de empezar esta.
          </FrenciaText>
          {conflicto.diaId ? (
            <Button variant="secondary" size="lg" icon="play" fullWidth onPress={retomarConflicto}>
              Retomar la anterior
            </Button>
          ) : null}
          <Button variant="primary" size="lg" icon="trash-2" fullWidth onPress={descartarConflicto}>
            Descartarla y empezar esta
          </Button>
          <Button variant="ghost" size="lg" fullWidth onPress={salir}>
            Volver
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (fase === 'resumen' && resumen && sessionId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ResumenSesion
          sessionId={sessionId}
          nombreDia={nombreDia}
          inicio={resumen.inicio}
          duracionSegundos={resumen.duracionSegundos}
          ejercicios={resumen.ejercicios}
          unidad={unidad}
          unidadDistancia={unidadDistancia}
          guardando={guardando}
          capturaRef={capturaRef}
          compartiendo={compartiendo}
          onVolver={volverASesion}
          onCompartir={compartirResumen}
          onHecho={confirmarTerminar}
        />
      </SafeAreaView>
    );
  }

  if (fase === 'sinEjercicios' || pasos.length === 0 || !paso || !ejercicioActual) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centro}>
          <Icon name="dumbbell" size={28} color={colors.textTertiary} />
          <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.centrado}>
            {nombreDia} no tiene ejercicios cargados.
          </FrenciaText>
          <Button variant="secondary" size="lg" fullWidth onPress={descartarYSalir}>
            Volver
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const totalEjercicios = cantidades.filter((c) => c > 0).length;
  const nroEjercicio = cantidades.slice(0, paso.ejercicio).filter((c) => c > 0).length + 1;
  const seriesDelEjercicio = cantidades[paso.ejercicio];
  const fantasma =
    paso.tipo === 'serie'
      ? fantasmas.get(claveSerie(ejercicioActual.exerciseId, paso.serie + 1))
      : undefined;
  const cardio = esSerieUnica(ejercicioActual.kind);
  const isometrico = ejercicioActual.kind === 'isometrico';
  // Cardio e isometricos se cargan en sus campos, debajo de la grilla; la
  // fuerza, en la fila Hoy de la grilla.
  const conCampos = cardio || isometrico;
  const columnas = cardio
    ? columnasCardio(ejercicioActual, fantasma, unidadDistancia)
    : isometrico
      ? columnasIsometrico(ejercicioActual, fantasma, unidad)
      : columnasFuerza(ejercicioActual, fantasma, valorActual, unidad, medidor, setCampo);
  const esSerie = paso.tipo === 'serie';
  const ultimoPaso = index === pasos.length - 1;
  // El boton a la vista solo aparece con la serie vacia: apenas se carga un
  // dato, saltar deja de ser lo probable y el camino queda en el menu.
  const serieVacia =
    !midiendo &&
    valorActual.peso === '' &&
    valorActual.reps === '' &&
    valorActual.intensidad === '' &&
    valorActual.tiempo === null &&
    valorActual.distancia === null;
  // No se avanza con una serie incompleta: no se guardaria y se perderia sin
  // aviso. Para no hacerla esta Saltar serie.
  const falta = esSerie ? faltantes(ejercicioActual, valorActual, medidor) : [];
  const faltaTiempo = cardio && falta.includes('el tiempo');
  const textoSaltar = ultimoPaso ? 'Saltar y terminar' : 'Saltar serie';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header: salir, progreso de toda la sesion, menu */}
        <View style={styles.header}>
          <Button variant="ghost" size="sm" icon="x" onPress={salir}>
            Salir
          </Button>
          <View style={styles.flexItem}>
            <ProgressBar value={index + 1} max={pasos.length} tone="green" size="sm" />
          </View>
          <IconButton
            icon="more-horizontal"
            variant="ghost"
            size="sm"
            accessibilityLabel="Opciones del ejercicio"
            onPress={() => setMenuAbierto(true)}
          />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scroll, esSerie && !conCampos && styles.scrollAnclado]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bloque}>
            <FrenciaText role="dataLabel" color={colors.accentText}>
              {nombreDia} · Ejercicio {nroEjercicio} de {totalEjercicios}
            </FrenciaText>
            <MarqueeText text={ejercicioActual.name} role="title" />
            {/* En el descanso, lo que importa es cuanto del ejercicio ya quedo
               atras. En la serie el objetivo ya no vive aca: es la primera fila
               de la grilla, al lado de lo que se hizo y de lo que se esta
               cargando. Ahi lo dice el titulo de abajo. */}
            {paso.tipo === 'descanso' ? (
              <FrenciaText role="bodySm" color={colors.textSecondary}>
                {seriesHechas(paso.despuesDe + 1, seriesDelEjercicio)}
              </FrenciaText>
            ) : null}
          </View>

          {paso.tipo === 'descanso' ? (
            <View style={styles.descanso}>
              <RestRing
                total={totalDescanso}
                finAt={finDescanso}
                color={colors.accent}
                colorPista={colors.dataTrack}
              >
                <FrenciaText role="dataLabel" color={colors.textTertiary}>
                  Descanso
                </FrenciaText>
                {/* Mono y no la display: los digitos de un contador cambian
                   cada segundo, y sin ancho fijo el numero baila. */}
                <Text
                  style={[
                    styles.reloj,
                    { color: restante === 0 ? colors.accent : colors.textPrimary },
                  ]}
                >
                  {mmss(restante)}
                </Text>
              </RestRing>

              {/* El descanso del plan es una guia y el gimnasio no siempre la
                 respeta. Restar no puede dejar el reloj en negativo, asi que
                 con el descanso terminado solo queda sumar. */}
              <View style={styles.ajustes}>
                <Button
                  variant="secondary"
                  size="md"
                  icon="minus"
                  disabled={restante === 0}
                  onPress={() => ajustarDescanso(-PASO_AJUSTE)}
                  accessibilityLabel={`Restar ${PASO_AJUSTE} segundos al descanso`}
                >
                  {PASO_AJUSTE}s
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  icon="plus"
                  onPress={() => ajustarDescanso(PASO_AJUSTE)}
                  accessibilityLabel={`Sumar ${PASO_AJUSTE} segundos al descanso`}
                >
                  {PASO_AJUSTE}s
                </Button>
              </View>

              {restante === 0 ? (
                <FrenciaText role="bodySm" color={colors.accentText} style={styles.centrado}>
                  Descanso finalizado
                </FrenciaText>
              ) : null}
            </View>
          ) : (
            /* En fuerza la serie baja a la zona del pulgar, pegada a
               Siguiente: el contexto queda arriba y lo que se completa, abajo.
               Cardio e isometricos siguen centrados, con sus campos. */
            <View style={conCampos ? styles.serieCampos : styles.serieAnclada}>
              <View style={styles.serieHead}>
                <FrenciaText role="subtitle">
                  {seriesDelEjercicio === 1
                    ? 'Serie única'
                    : `Serie ${paso.serie + 1} de ${seriesDelEjercicio}`}
                </FrenciaText>
                {/* Con la grilla abajo, saltar sube al titulo de la serie:
                   queda a mano pero lejos de la barra que se toca de memoria. */}
                {serieVacia && !conCampos ? (
                  <Button variant="soft" size="sm" icon="skip-forward" onPress={saltarSerie}>
                    {textoSaltar}
                  </Button>
                ) : null}
              </View>

              {/* Las tres lecturas de la serie en una sola grilla. Los campos
                 de hoy van vacios a proposito, para que la progresion sea una
                 decision y no inercia: se ve lo anterior y se escribe igual. */}
              <SerieComparativa
                columnas={columnas}
                cuandoAnterior={fantasma ? haceCuanto(fantasma.hechaEl) : null}
                mostrarHoy={!conCampos}
                amplia={!conCampos}
              />
              {!conCampos && falta.length > 0 && !serieVacia ? (
                <FrenciaText role="bodySm" color={colors.warning} style={styles.centrado}>
                  Falta cargar {enumerar(falta)}.
                </FrenciaText>
              ) : null}

              {/* En cardio la grilla queda como referencia (plan y ultima) y
                 lo de hoy se carga solo en sus campos, que saben escribir un
                 reloj y una distancia con decimales. Repetirlo en una fila de
                 solo lectura era mostrar el mismo dato dos veces. */}
              {cardio ? (
                <View style={styles.cardio}>
                  {ejercicioActual.tracks.duration ? (
                    /* El aviso va pegado al campo y en el naranja de alerta
                       (warning): es lo que bloquea el avance y tiene que
                       leerse como parte del campo, no como otro bloque. */
                    <View style={styles.campoConAviso}>
                      <DurationField
                        label="Tiempo"
                        value={valorActual.tiempo}
                        onChange={(v) => setCampo('tiempo', v > 0 ? v : null)}
                        step={60}
                        allowHours
                        size="lg"
                        fullWidth
                      />
                      {faltaTiempo ? (
                        <FrenciaText role="bodySm" color={colors.warning} style={styles.centrado}>
                          Cargá el tiempo para seguir.
                        </FrenciaText>
                      ) : null}
                    </View>
                  ) : null}
                  {ejercicioActual.tracks.distance ? (
                    <DistanceField
                      label="Distancia"
                      value={valorActual.distancia}
                      onChange={(v) => setCampo('distancia', v !== null && v > 0 ? v : null)}
                      unit={unidadDistancia}
                      size="lg"
                      fullWidth
                    />
                  ) : null}
                  {/* Misma mecanica que tiempo y distancia, con la escala
                     entera de 1 a 10 que se ofrece al planificar. Es
                     opcional: borrar el numero deja la serie sin RPE. */}
                  {ejercicioActual.intensityKind !== null ? (
                    <NumberField
                      label="RPE · qué tan duro fue"
                      hint="1–10"
                      value={parseNum(valorActual.intensidad)}
                      onChange={(v) => setCampo('intensidad', v === null ? '' : String(v))}
                      min={1}
                      max={10}
                      size="lg"
                      fullWidth
                    />
                  ) : null}
                </View>
              ) : null}

              {/* Isometrico: el cronometro mide y completa el tiempo, que
                 queda editable; peso y RPE van debajo, opcionales salvo el
                 peso cuando el plan lo prescribe. La key reinicia el
                 cronometro en cada serie. */}
              {isometrico ? (
                <View style={styles.cardio}>
                  <IsoTimer
                    key={claveActual ?? ''}
                    target={ejercicioActual.durationSeconds}
                    value={valorActual.tiempo}
                    onChange={(v) => setCampo('tiempo', v)}
                    onMeasuringChange={setMidiendo}
                  />
                  {ejercicioActual.tracks.weight ? (
                    <NumberField
                      label={ejercicioActual.weightKg === null ? 'Peso · opcional' : 'Peso'}
                      value={parseNum(valorActual.peso)}
                      onChange={(v) => setCampo('peso', v !== null && v > 0 ? String(v) : '')}
                      min={0}
                      step={unidad === 'lb' ? 5 : 2.5}
                      decimals={1}
                      unit={unidad}
                      size="lg"
                      fullWidth
                    />
                  ) : null}
                  {ejercicioActual.intensityKind !== null ? (
                    <NumberField
                      label="RPE · qué tan duro fue"
                      hint="1–10"
                      value={parseNum(valorActual.intensidad)}
                      onChange={(v) => setCampo('intensidad', v === null ? '' : String(v))}
                      min={1}
                      max={10}
                      size="lg"
                      fullWidth
                    />
                  ) : null}
                  {falta.length > 0 && !serieVacia && !midiendo ? (
                    <FrenciaText role="bodySm" color={colors.warning} style={styles.centrado}>
                      Falta cargar {enumerar(falta)}.
                    </FrenciaText>
                  ) : null}
                </View>
              ) : null}

              {/* Verde y lejos de la barra de abajo: saltar es ocasional y
                 no puede quedar donde se toca "Siguiente" de memoria. */}
              {serieVacia && conCampos ? (
                <Button
                  variant="soft"
                  size="md"
                  icon="skip-forward"
                  onPress={saltarSerie}
                  style={styles.saltar}
                >
                  {textoSaltar}
                </Button>
              ) : null}
            </View>
          )}
        </ScrollView>

        <View style={styles.nav}>
          <Button
            variant="secondary"
            size="lg"
            icon="chevron-left"
            disabled={index === 0}
            onPress={anterior}
            style={styles.flexItem}
          >
            Anterior
          </Button>
          <Button
            variant="primary"
            size="lg"
            iconRight={index === pasos.length - 1 ? undefined : 'arrow-right'}
            loading={guardando}
            disabled={falta.length > 0}
            onPress={siguiente}
            style={styles.flexItem}
          >
            {index === pasos.length - 1 ? 'Terminar' : 'Siguiente'}
          </Button>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={menuAbierto} transparent animationType="fade" onRequestClose={() => setMenuAbierto(false)}>
        <View style={styles.menuFondo}>
          <View style={styles.menu}>
            <MarqueeText text={ejercicioActual.name} role="subtitle" />
            {/* El cardio es una sola serie continua: no se le suman series. */}
            {!esSerieUnica(ejercicioActual.kind) ? (
              <Button variant="secondary" size="lg" icon="plus" fullWidth onPress={sumarSerie}>
                Sumar una serie
              </Button>
            ) : null}
            {esSerie ? (
              <Button variant="secondary" size="lg" icon="skip-forward" fullWidth onPress={saltarSerie}>
                {textoSaltar}
              </Button>
            ) : null}
            {/* En el cardio, de una sola serie, terminar el ejercicio en la
               serie actual no cambia nada. */}
            {!esSerieUnica(ejercicioActual.kind) ? (
              <Button variant="secondary" size="lg" icon="check" fullWidth onPress={cortarEjercicio}>
                Terminar este ejercicio
              </Button>
            ) : null}
            <Button variant="primary" size="lg" icon="flame" fullWidth loading={guardando} onPress={finalizar}>
              Terminar la sesión
            </Button>
            <Button variant="ghost" size="lg" fullWidth onPress={() => setMenuAbierto(false)}>
              Cancelar
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Serie a guardar ---------------------------------------------------------

/** Lo que se escribe de una serie completa, o null si le falta algo. El
 *  cardio pide el tiempo, con distancia y RPE opcionales; el isometrico, el
 *  tiempo, con RPE opcional y peso opcional salvo que el plan lo prescriba; la
 *  fuerza, peso, reps y el esfuerzo con el medidor del perfil. */
function datosAGuardar(
  ej: EjercicioPlan,
  v: ValoresSerie,
  unidad: UnidadPeso,
  unidadDistancia: UnidadDistancia,
  medidor: Medidor,
) {
  if (esSerieUnica(ej.kind)) {
    const durationSeconds = ej.tracks.duration ? v.tiempo : null;
    // Una distancia que redondea a 0 m cuenta como no cargada.
    const distanceM =
      (ej.tracks.distance && v.distancia
        ? distanciaACanonico(v.distancia, unidadDistancia)
        : 0) || null;
    // El tiempo es obligatorio; la distancia y el RPE, opcionales.
    if (ej.tracks.duration && !durationSeconds) return null;
    const rpe = ej.intensityKind === null ? null : parseNum(v.intensidad);
    return {
      weightKg: null,
      reps: null,
      durationSeconds,
      distanceM,
      intensityKind: rpe === null ? null : ('rpe' as const),
      intensityValue: rpe,
    };
  }

  if (ej.kind === 'isometrico') {
    if (faltantes(ej, v, medidor).length > 0) return null;
    const peso = ej.tracks.weight ? parseNum(v.peso) : null;
    const rpe = ej.intensityKind === null ? null : parseNum(v.intensidad);
    return {
      // Sin peso (o en 0) la serie se hizo sin carga.
      weightKg: peso !== null && peso > 0 ? pesoACanonico(peso, unidad) : null,
      reps: null,
      durationSeconds: ej.tracks.duration ? v.tiempo : null,
      distanceM: null,
      intensityKind: rpe === null ? null : ('rpe' as const),
      intensityValue: rpe,
    };
  }

  const peso = parseNum(v.peso);
  const reps = parseNum(v.reps);
  const intensidad = parseNum(v.intensidad);
  if (peso === null || reps === null || intensidad === null) return null;
  if (peso < 0 || reps <= 0) return null;
  return {
    weightKg: pesoACanonico(peso, unidad),
    reps: Math.round(reps),
    intensityKind: medidor,
    intensityValue: intensidad,
  };
}

/** Lo que le falta a la serie para poder guardarse, en palabras: "el peso",
 *  "las reps". Vacio = completa. Sigue las mismas reglas que datosAGuardar. */
function faltantes(ej: EjercicioPlan, v: ValoresSerie, medidor: Medidor): string[] {
  if (esSerieUnica(ej.kind)) {
    return ej.tracks.duration && !v.tiempo ? ['el tiempo'] : [];
  }
  if (ej.kind === 'isometrico') {
    const falta: string[] = [];
    if (ej.tracks.duration && !v.tiempo) falta.push('el tiempo');
    // El peso es opcional, salvo que el plan lo prescriba.
    const peso = parseNum(v.peso);
    if (ej.tracks.weight && ej.weightKg !== null && (peso === null || peso <= 0)) {
      falta.push('el peso');
    }
    return falta;
  }
  const falta: string[] = [];
  const peso = parseNum(v.peso);
  const reps = parseNum(v.reps);
  if (peso === null || peso < 0) falta.push('el peso');
  if (reps === null || reps <= 0) falta.push('las reps');
  if (parseNum(v.intensidad) === null) falta.push(medidor === 'rir' ? 'el RIR' : 'el RPE');
  return falta;
}

/** "a", "a y b", "a, b y c". */
function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

// --- Columnas de la grilla --------------------------------------------------

/** Fuerza: peso, reps y esfuerzo, las tres editables en la fila de hoy. */
function columnasFuerza(
  ej: EjercicioPlan,
  fantasma: SerieFantasma | undefined,
  hoy: ValoresSerie,
  unidad: UnidadPeso,
  medidor: Medidor,
  setCampo: <K extends keyof ValoresSerie>(campo: K, valor: ValoresSerie[K]) => void,
): ColumnaSerie[] {
  const etiquetaMedidor = medidor === 'rir' ? 'RIR' : 'RPE';
  return [
    {
      key: 'peso',
      label: unidad,
      // La rutina nunca prescribe peso.
      plan: null,
      anterior: fantasma?.weightKg != null ? String(mostrarPeso(fantasma.weightKg, unidad)) : null,
      hoy: hoy.peso,
      onHoy: (t) => setCampo('peso', t),
      teclado: 'decimal-pad',
      accesible: `Peso en ${unidad}`,
    },
    {
      key: 'reps',
      label: 'Reps',
      plan: ej.reps === null ? null : String(ej.reps),
      anterior: fantasma?.reps != null ? String(fantasma.reps) : null,
      hoy: hoy.reps,
      onHoy: (t) => setCampo('reps', t),
      accesible: 'Repeticiones',
    },
    {
      key: 'intensidad',
      label: etiquetaMedidor,
      plan: valorIntensidad(ej.intensityKind, ej.intensityValue),
      anterior: fantasma ? valorIntensidad(fantasma.intensityKind, fantasma.intensityValue) : null,
      hoy: hoy.intensidad,
      onHoy: (t) => setCampo('intensidad', t),
      accesible: etiquetaMedidor,
    },
  ];
}

/** Isometrico: peso, tiempo y el RPE si el plan lo pide. Solo plan y ultima:
 *  lo de hoy se carga en el cronometro y los campos de abajo de la grilla. */
function columnasIsometrico(
  ej: EjercicioPlan,
  fantasma: SerieFantasma | undefined,
  unidad: UnidadPeso,
): ColumnaSerie[] {
  const columnas: ColumnaSerie[] = [];
  if (ej.tracks.weight) {
    columnas.push({
      key: 'peso',
      label: unidad,
      plan: ej.weightKg === null ? null : String(mostrarPeso(ej.weightKg, unidad)),
      anterior: fantasma?.weightKg != null ? String(mostrarPeso(fantasma.weightKg, unidad)) : null,
      hoy: '',
      accesible: `Peso en ${unidad}`,
    });
  }
  if (ej.tracks.duration) {
    columnas.push({
      key: 'tiempo',
      label: 'Tiempo',
      plan: ej.durationSeconds === null ? null : reloj(ej.durationSeconds),
      anterior: fantasma?.durationSeconds != null ? reloj(fantasma.durationSeconds) : null,
      hoy: '',
      accesible: 'Tiempo',
    });
  }
  if (ej.intensityKind !== null) {
    columnas.push({
      key: 'intensidad',
      label: 'RPE',
      plan: valorIntensidad(ej.intensityKind, ej.intensityValue),
      anterior: fantasma ? valorIntensidad(fantasma.intensityKind, fantasma.intensityValue) : null,
      hoy: '',
      accesible: 'RPE',
    });
  }
  return columnas;
}

/** Cardio: tiempo, distancia y el RPE si el plan lo pide. Solo plan y ultima:
 *  lo de hoy se carga en los campos de abajo de la grilla. */
function columnasCardio(
  ej: EjercicioPlan,
  fantasma: SerieFantasma | undefined,
  unidadDistancia: UnidadDistancia,
): ColumnaSerie[] {
  const columnas: ColumnaSerie[] = [];
  if (ej.tracks.duration) {
    columnas.push({
      key: 'tiempo',
      label: 'Tiempo',
      plan: ej.durationSeconds === null ? null : reloj(ej.durationSeconds),
      anterior: fantasma?.durationSeconds != null ? reloj(fantasma.durationSeconds) : null,
      hoy: '',
      accesible: 'Tiempo',
    });
  }
  if (ej.tracks.distance) {
    columnas.push({
      key: 'distancia',
      label: unidadDistancia,
      plan: ej.distanceM === null ? null : distanciaTabla(ej.distanceM, unidadDistancia),
      anterior:
        fantasma?.distanceM != null ? distanciaTabla(fantasma.distanceM, unidadDistancia) : null,
      hoy: '',
      accesible: `Distancia en ${unidadDistancia}`,
    });
  }
  if (ej.intensityKind !== null) {
    columnas.push({
      key: 'intensidad',
      label: 'RPE',
      plan: valorIntensidad(ej.intensityKind, ej.intensityValue),
      anterior: fantasma ? valorIntensidad(fantasma.intensityKind, fantasma.intensityValue) : null,
      hoy: '',
      accesible: 'RPE',
    });
  }
  return columnas;
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    flex: { flex: 1, paddingHorizontal: spacing.padScreen, paddingVertical: space[5] },
    flexItem: { flex: 1 },
    // El scroll no lleva padding vertical propio: en iOS ese padding recorta el
    // contenido en vez de sumarle aire, y la fila de hoy quedaba cortada abajo.
    // El aire vertical vive en el contentContainerStyle.
    scrollView: { flex: 1, paddingHorizontal: spacing.padScreen },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[5], padding: spacing.padScreen },
    centrado: { textAlign: 'center' },

    header: { flexDirection: 'row', alignItems: 'center', gap: space[4] },

    scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: space[8] + space[5], gap: space[7] },
    bloque: { gap: space[2] },
    // Fuerza: el bloque de arriba y la serie se separan hasta los bordes.
    scrollAnclado: { justifyContent: 'space-between', paddingTop: space[6] + space[5], paddingBottom: space[2] },
    serieAnclada: { gap: space[5] },
    serieCampos: { gap: space[7] },
    serieHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: sizing.controlHSm,
    },
    cardio: { gap: space[6] },
    campoConAviso: { gap: space[3] },
    saltar: { alignSelf: 'center' },

    // Descanso: el aro manda, todo lo demas es contexto.
    descanso: { alignItems: 'center', gap: space[6], paddingVertical: space[6] },
    // Al ancho del contenido y no estirados: dos botones anchos debajo del aro
    // le pelearian el peso, y aca el aro es lo que se mira.
    ajustes: { flexDirection: 'row', gap: space[3] },
    reloj: {
      fontFamily: mono.bold,
      fontSize: 48,
      lineHeight: 56,
      includeFontPadding: false,
    },

    // El aire de arriba es de la barra y no del scroll: con el teclado abierto
    // el scroll lleva la caja enfocada justo al borde y su padding no se ve.
    nav: {
      flexDirection: 'row',
      gap: space[3],
      paddingHorizontal: spacing.padScreen,
      paddingTop: space[5],
      paddingBottom: space[5],
    },

    // RN no parsea oklch, por eso el velo va en rgba como el resto de los
    // tokens (ver la nota en tokens/colors.ts). Mismo tratamiento que el sheet
    // de opciones del perfil.
    menuFondo: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.scrim },
    menu: {
      gap: space[4],
      padding: spacing.padScreen,
      paddingBottom: space[9],
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      backgroundColor: colors.surfaceRaised,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
    },
  });
