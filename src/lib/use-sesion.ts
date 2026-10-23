/* Frencia · Estado y acciones de la sesion de entrenamiento.
   El estado vive en un reducer (lib/sesion-estado); el hook carga la sesion, la persiste paso a
   paso y expone lo que la pantalla necesita para dibujarse.

   Cada serie se escribe al pasar al paso siguiente, no al terminar la sesion:
   un entrenamiento dura una hora con la pantalla apagandose y salir de la app
   no puede perder nada. */

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { Platform, type View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useProfile } from '@/contexts/profile';
import { useSession } from '@/contexts/session';
import { useToast } from '@/contexts/toast';
import { alerta } from '@/lib/alerta';
import { AVISO_COMPARTIR, compartirTicket } from '@/lib/compartir-ticket';
import type { UnidadDistancia } from '@/lib/distancia';
import type { UnidadPeso } from '@/lib/peso';
import { agruparPorEjercicio } from '@/lib/resumen-sesion';
import { estadoInicial, indiceAcotado, reducerSesion } from '@/lib/sesion-estado';
import { aValores, datosAGuardar, generarPasos, VACIO, type ValoresSerie } from '@/lib/sesion-pasos';
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
  leerPendientes,
  sesionEnCurso,
  sincronizarPendientes,
  terminarSesion,
  type EjercicioPlan,
  type Medidor,
} from '@/lib/session';

// --- Hook --------------------------------------------------------------------

export function useSesion(trainingDayId: string, nombreParam: string | undefined) {
  const router = useRouter();
  const { showToast } = useToast();
  const { profile } = useProfile();
  const { user } = useSession();
  const nombrePorDefecto = nombreParam ?? 'Entrenamiento';
  const [estado, dispatch] = useReducer(reducerSesion, nombrePorDefecto, estadoInicial);
  const { fase, sessionId, plan, cantidades, valores, indiceGuardado, guardando, conflicto, resumen } = estado;

  const medidor: Medidor = profile?.medidorEsfuerzo ?? 'rir';
  const unidad: UnidadPeso = profile?.unidadPeso ?? 'kg';
  const unidadDistancia: UnidadDistancia = profile?.unidadDistancia ?? 'km';

  // El ticket que se captura como imagen al compartir.
  const capturaRef = useRef<View>(null);
  const yaVibro = useRef<Set<string>>(new Set());
  // Se avisa una sola vez por sesion que hay series guardadas solo en el
  // telefono; repetirlo en cada paso sin senal seria puro ruido.
  const avisoPendientes = useRef(false);

  const pasos = useMemo(() => generarPasos(plan, cantidades), [plan, cantidades]);
  const index = indiceAcotado(indiceGuardado, pasos);
  const paso = pasos[index] ?? null;
  const ejercicioActual = paso ? plan[paso.ejercicio] : null;

  const claveActual =
    paso?.tipo === 'serie' && ejercicioActual
      ? claveSerie(ejercicioActual.exerciseId, paso.serie + 1)
      : null;
  const valorActual = claveActual ? (valores[claveActual] ?? VACIO) : VACIO;

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

      dispatch({ tipo: 'sesion', sessionId: sesId, nombreDia: nombre });

      if (ejercicios.length === 0) {
        dispatch({ tipo: 'fase', fase: 'sinEjercicios' });
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

      dispatch({
        tipo: 'preparada',
        plan: ejercicios,
        fantasmas: ghosts,
        cantidades: cant,
        valores: previos,
        indice: arranque,
      });
    },
    [unidad, unidadDistancia],
  );

  useEffect(() => {
    let cancelado = false;

    (async () => {
      if (!trainingDayId) {
        dispatch({ tipo: 'fase', fase: 'sinEjercicios' });
        return;
      }

      if (!user || cancelado) {
        dispatch({ tipo: 'fase', fase: 'sinEjercicios' });
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
        dispatch({
          tipo: 'conflicto',
          conflicto: {
            id: abierta.id,
            diaId: abierta.trainingDayId,
            nombre: nombre ?? 'un día que ya no existe',
          },
        });
        dispatch({ tipo: 'fase', fase: 'conflicto' });
        return;
      }

      if (abierta) {
        await preparar(abierta.id, trainingDayId, nombrePorDefecto);
        return;
      }

      // Sin sesion previa. Miramos el plan antes de crear nada: abrir una
      // sesion para un dia sin ejercicios deja otra sesion muerta trabando la
      // siguiente.
      const ejercicios = await cargarPlan(trainingDayId);
      if (cancelado) return;
      if (ejercicios.length === 0) {
        dispatch({ tipo: 'fase', fase: 'sinEjercicios' });
        return;
      }

      const nueva = await crearSesion(user.id, trainingDayId);
      if (cancelado) return;
      if (!nueva) {
        showToast({ message: 'No pudimos abrir la sesión. Probá de nuevo.', type: 'error' });
        dispatch({ tipo: 'fase', fase: 'sinEjercicios' });
        return;
      }

      await preparar(nueva.id, trainingDayId, nombrePorDefecto, ejercicios);
    })();

    return () => {
      cancelado = true;
    };
    // Solo al montar: la sesion se abre una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingDayId]);

  // --- Descanso y valores ----------------------------------------------------

  /** Mueve al paso `i`, fijando el arranque del descanso si es uno. */
  function irAPaso(i: number) {
    dispatch({ tipo: 'irAPaso', indice: i, ahora: Date.now() });
  }

  const cambiarAjusteDescanso = useCallback((clave: string, ajuste: number) => {
    dispatch({ tipo: 'ajusteDescanso', clave, ajuste });
  }, []);

  const setDescansoTerminado = useCallback((valor: boolean) => {
    dispatch({ tipo: 'descansoTerminado', valor });
  }, []);

  const setMidiendo = useCallback((valor: boolean) => {
    dispatch({ tipo: 'midiendo', valor });
  }, []);

  const setCampo = useCallback(
    <K extends keyof ValoresSerie>(campo: K, valor: ValoresSerie[K]) => {
      if (!claveActual) return;
      dispatch({ tipo: 'campo', clave: claveActual, campo, valor });
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
    dispatch({ tipo: 'guardando', valor: true });
    await persistirSiCorresponde();
    dispatch({ tipo: 'guardando', valor: false });
    irAPaso(index + 1);
  }

  async function anterior() {
    if (guardando || index === 0) return;
    dispatch({ tipo: 'guardando', valor: true });
    await persistirSiCorresponde();
    dispatch({ tipo: 'guardando', valor: false });
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
    dispatch({ tipo: 'guardando', valor: true });
    if (guardarActual) await persistirSiCorresponde();

    // No se cierra una sesion con series que todavia no llegaron a la base:
    // el historial y las fantasmas de la proxima vez saldrian incompletos.
    const sinSincronizar = await sincronizarPendientes(sessionId);
    if (sinSincronizar > 0) {
      dispatch({ tipo: 'guardando', valor: false });
      dispatch({ tipo: 'menu', abierto: false });
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
    dispatch({ tipo: 'guardando', valor: false });
    dispatch({ tipo: 'menu', abierto: false });
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

    dispatch({
      tipo: 'resumen',
      resumen: {
        inicio: registro.startedAt,
        duracionSegundos: Math.max(0, Math.round((Date.now() - registro.startedAt) / 1000)),
        ejercicios: agruparPorEjercicio(plan, registro.series),
      },
    });
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
    dispatch({ tipo: 'guardando', valor: true });
    const ok = await terminarSesion(sessionId);
    dispatch({ tipo: 'guardando', valor: false });
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
    dispatch({ tipo: 'volverASesion' });
  }

  /** Comparte el ticket como imagen PNG, tal como se ve en pantalla. */
  async function compartirResumen() {
    if (!resumen || estado.compartiendo) return;
    dispatch({ tipo: 'compartiendo', valor: true });
    const resultado = await compartirTicket(capturaRef);
    dispatch({ tipo: 'compartiendo', valor: false });
    if (resultado !== 'ok') showToast({ message: AVISO_COMPARTIR[resultado], type: 'error' });
  }

  // --- Resolucion del conflicto de sesiones ----------------------------------

  async function retomarConflicto() {
    if (!conflicto?.diaId) return;
    dispatch({ tipo: 'fase', fase: 'cargando' });
    await preparar(conflicto.id, conflicto.diaId, conflicto.nombre);
    dispatch({ tipo: 'conflicto', conflicto: null });
  }

  /** Tira la sesion vieja y arranca la de este dia. */
  async function descartarConflicto() {
    if (!conflicto) return;
    dispatch({ tipo: 'fase', fase: 'cargando' });

    if (!(await descartarSesion(conflicto.id))) {
      showToast({ message: 'No pudimos descartar la sesión. Probá de nuevo.', type: 'error' });
      dispatch({ tipo: 'fase', fase: 'conflicto' });
      return;
    }
    dispatch({ tipo: 'conflicto', conflicto: null });

    const ejercicios = user ? await cargarPlan(trainingDayId) : [];
    if (!user || ejercicios.length === 0) {
      dispatch({ tipo: 'fase', fase: 'sinEjercicios' });
      return;
    }

    const nueva = await crearSesion(user.id, trainingDayId);
    if (!nueva) {
      showToast({ message: 'No pudimos abrir la sesión. Probá de nuevo.', type: 'error' });
      dispatch({ tipo: 'fase', fase: 'sinEjercicios' });
      return;
    }
    await preparar(nueva.id, trainingDayId, nombrePorDefecto, ejercicios);
  }

  /** Salida de emergencia del dia sin ejercicios: si quedo una sesion abierta
   *  apuntando aca, se tira para no trabar la proxima. */
  async function descartarYSalir() {
    if (sessionId) await descartarSesion(sessionId);
    salir();
  }

  // --- Acciones del menu -----------------------------------------------------

  function sumarSerie() {
    dispatch({ tipo: 'sumarSerie' });
  }

  function cortarEjercicio() {
    dispatch({ tipo: 'cortarEjercicio' });
  }

  /** Saltea la serie actual: no se guarda y se pasa a la proxima serie, sin
   *  el descanso de por medio, que era para despues de esta. En la ultima
   *  serie de la sesion la cierra. Se puede deshacer desde el aviso, por si
   *  fue un toque sin querer: la serie sigue en la lista, solo se la pasa. */
  function saltarSerie() {
    if (!paso || paso.tipo !== 'serie') return;
    dispatch({ tipo: 'menu', abierto: false });
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
      action: { label: 'Deshacer', onPress: () => dispatch({ tipo: 'indice', indice: desde }) },
    });
  }

  function abrirMenu() {
    dispatch({ tipo: 'menu', abierto: true });
  }

  function cerrarMenu() {
    dispatch({ tipo: 'menu', abierto: false });
  }

  return {
    estado,
    fase,
    medidor,
    unidad,
    unidadDistancia,
    pasos,
    index,
    paso,
    ejercicioActual,
    claveActual,
    valorActual,
    capturaRef,
    yaVibro,
    setCampo,
    setMidiendo,
    cambiarAjusteDescanso,
    setDescansoTerminado,
    siguiente,
    anterior,
    salir,
    finalizar,
    confirmarTerminar,
    volverASesion,
    compartirResumen,
    retomarConflicto,
    descartarConflicto,
    descartarYSalir,
    sumarSerie,
    cortarEjercicio,
    saltarSerie,
    abrirMenu,
    cerrarMenu,
  };
}

export type Sesion = ReturnType<typeof useSesion>;
