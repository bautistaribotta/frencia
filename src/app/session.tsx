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
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { supabase } from '@/lib/supabase';
import { mostrarPeso, pesoACanonico, type UnidadPeso } from '@/lib/peso';
import {
  cargarFantasmas,
  cargarNombreDia,
  cargarPlan,
  cargarSeriesDeSesion,
  claveSerie,
  crearSesion,
  descartarSesion,
  guardarSerie,
  sesionEnCurso,
  terminarSesion,
  type EjercicioPlan,
  type Medidor,
  type SerieFantasma,
} from '@/lib/session';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { RestRing } from '@/components/RestRing';

import {
  Button,
  FrenciaText,
  Icon,
  IconButton,
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

function etiquetaIntensidad(kind: Medidor, value: number): string {
  if (kind === 'rir') return value < 0 ? 'al fallo' : `${value} RIR`;
  return `RPE ${value}`;
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

interface ValoresSerie {
  peso: string;
  reps: string;
  intensidad: string;
}

const VACIO: ValoresSerie = { peso: '', reps: '', intensidad: '' };

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

  const [fase, setFase] = useState<'cargando' | 'conflicto' | 'sinEjercicios' | 'listo'>('cargando');
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
  const [index, setIndex] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

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

  const pasos = useMemo(() => generarPasos(plan, cantidades), [plan, cantidades]);
  const paso = pasos[index] ?? null;
  const ejercicioActual = paso ? plan[paso.ejercicio] : null;

  // Cortar un ejercicio saca pasos de la lista y puede dejar el indice mas alla
  // del final. Lo traemos al ultimo paso que quedo.
  useEffect(() => {
    if (pasos.length > 0 && index > pasos.length - 1) setIndex(pasos.length - 1);
  }, [pasos.length, index]);

  // --- Carga inicial ---------------------------------------------------------

  /** Deja la pantalla lista para registrar contra una sesion y un dia dados. */
  const preparar = useCallback(
    async (sesId: string, diaId: string, nombre: string, planPrecargado?: EjercicioPlan[]) => {
      const [ejercicios, ghosts, yaCargadas] = await Promise.all([
        planPrecargado ? Promise.resolve(planPrecargado) : cargarPlan(diaId),
        cargarFantasmas(diaId),
        cargarSeriesDeSesion(sesId),
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
        previos[clave] = {
          peso: String(mostrarPeso(v.weightKg, unidad)),
          reps: String(v.reps),
          intensidad: String(v.intensityValue),
        };
      });

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
    [unidad],
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

  // Al entrar a un paso de descanso se fija su arranque, una sola vez. Volver
  // atras y avanzar de nuevo retoma la cuenta donde iba en vez de reiniciarla.
  useEffect(() => {
    if (!paso || paso.tipo !== 'descanso') return;
    const k = claveDescanso(paso);
    setIniciosDescanso((prev) => (prev[k] ? prev : { ...prev, [k]: Date.now() }));
  }, [paso]);

  // El reloj solo corre mientras se esta parado en un descanso. Cada medio
  // segundo para que el numero no se atrase visiblemente respecto del segundo
  // real que se muestra.
  useEffect(() => {
    if (!paso || paso.tipo !== 'descanso') return;
    setAhora(Date.now());
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
    (campo: keyof ValoresSerie, texto: string) => {
      if (!claveActual) return;
      setValores((prev) => ({
        ...prev,
        [claveActual]: { ...(prev[claveActual] ?? VACIO), [campo]: texto },
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

    const peso = parseNum(v.peso);
    const reps = parseNum(v.reps);
    const intensidad = parseNum(v.intensidad);
    if (peso === null || reps === null || intensidad === null) return;
    if (peso < 0 || reps <= 0) return;

    await guardarSerie({
      sessionId,
      exerciseId: ejercicioActual.exerciseId,
      setIndex: paso.serie + 1,
      weightKg: pesoACanonico(peso, unidad),
      reps: Math.round(reps),
      intensityKind: medidor,
      intensityValue: intensidad,
    });
  }, [paso, ejercicioActual, sessionId, claveActual, valores, unidad, medidor]);

  async function siguiente() {
    if (guardando) return;
    if (index >= pasos.length - 1) {
      finalizar();
      return;
    }
    setGuardando(true);
    await persistirSiCorresponde();
    setGuardando(false);
    setIndex((i) => i + 1);
  }

  async function anterior() {
    if (guardando || index === 0) return;
    setGuardando(true);
    await persistirSiCorresponde();
    setGuardando(false);
    setIndex((i) => i - 1);
  }

  /** Sale dejando la sesion en curso: al volver se retoma donde quedo. */
  function salir() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  async function finalizar() {
    if (!sessionId) return;
    setGuardando(true);
    await persistirSiCorresponde();
    const ok = await terminarSesion(sessionId);
    setGuardando(false);
    setMenuAbierto(false);
    if (!ok) {
      showToast({ message: 'No pudimos terminar la sesión. Proba de nuevo.', type: 'error' });
      return;
    }
    showToast({ message: 'Sesión terminada', type: 'success' });
    router.replace('/home');
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
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bloque}>
            <FrenciaText role="dataLabel" color={colors.accentText}>
              {nombreDia} · Ejercicio {nroEjercicio} de {totalEjercicios}
            </FrenciaText>
            <FrenciaText role="title">{ejercicioActual.name}</FrenciaText>
            {/* En el descanso, lo que importa es cuanto del ejercicio ya quedo
               atras. En la serie eso ya lo dice el titulo de abajo, asi que el
               lugar lo ocupa lo que hay que apuntarle a esta serie. */}
            <FrenciaText role="bodySm" color={colors.textSecondary}>
              {paso.tipo === 'descanso'
                ? seriesHechas(paso.despuesDe + 1, seriesDelEjercicio)
                : `Objetivo ${ejercicioActual.reps} reps · ${etiquetaIntensidad(
                    ejercicioActual.intensityKind,
                    ejercicioActual.intensityValue,
                  )}`}
            </FrenciaText>
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
            <>
              <View style={styles.serieHead}>
                <FrenciaText role="subtitle">
                  Serie {paso.serie + 1} de {seriesDelEjercicio}
                </FrenciaText>
              </View>

              {/* Serie fantasma: lo que se hizo en esta misma serie la vez
                 anterior. Los campos van vacios a proposito, para que la
                 progresion sea una decision y no inercia. */}
              {fantasma ? (
                <View style={styles.fantasma}>
                  <FrenciaText role="dataLabel" color={colors.textTertiary}>
                    Anterior
                  </FrenciaText>
                  <FrenciaText role="data" color={colors.textSecondary}>
                    {mostrarPeso(fantasma.weightKg, unidad)} {unidad} × {fantasma.reps} ·{' '}
                    {etiquetaIntensidad(fantasma.intensityKind, fantasma.intensityValue)}
                  </FrenciaText>
                </View>
              ) : (
                <View style={styles.fantasmaVacio}>
                  <FrenciaText role="bodySm" color={colors.textTertiary}>
                    Sin registro de los últimos 10 días.
                  </FrenciaText>
                </View>
              )}

              <View style={styles.campos}>
                <Campo
                  label={unidad === 'lb' ? 'Peso · lb' : 'Peso · kg'}
                  value={valorActual.peso}
                  onChangeText={(t) => setCampo('peso', t)}
                  keyboardType="decimal-pad"
                  styles={styles}
                  colors={colors}
                />
                <Campo
                  label="Reps"
                  value={valorActual.reps}
                  onChangeText={(t) => setCampo('reps', t)}
                  keyboardType="number-pad"
                  styles={styles}
                  colors={colors}
                />
                <Campo
                  label={medidor === 'rir' ? 'RIR' : 'RPE'}
                  value={valorActual.intensidad}
                  onChangeText={(t) => setCampo('intensidad', t)}
                  keyboardType="number-pad"
                  styles={styles}
                  colors={colors}
                />
              </View>
            </>
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
            <FrenciaText role="subtitle">{ejercicioActual.name}</FrenciaText>
            <Button variant="secondary" size="lg" icon="plus" fullWidth onPress={sumarSerie}>
              Sumar una serie
            </Button>
            <Button variant="secondary" size="lg" icon="check" fullWidth onPress={cortarEjercicio}>
              Terminar este ejercicio
            </Button>
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

/* Caja de un dato de la serie. Tipografia mono porque es un numero que se
   compara contra otro (la fantasma), y la mono los alinea. */
function Campo({
  label,
  value,
  onChangeText,
  keyboardType,
  styles,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType: 'decimal-pad' | 'number-pad';
  styles: ReturnType<typeof makeStyles>;
  colors: Palette;
}) {
  return (
    <View style={styles.campo}>
      <FrenciaText role="dataLabel" color={colors.textTertiary}>
        {label}
      </FrenciaText>
      <TextInput
        style={styles.campoInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder="—"
        placeholderTextColor={colors.textTertiary}
        maxLength={5}
        selectTextOnFocus
      />
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    flex: { flex: 1, paddingHorizontal: spacing.padScreen, paddingVertical: space[5] },
    flexItem: { flex: 1 },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[5], padding: spacing.padScreen },
    centrado: { textAlign: 'center' },

    header: { flexDirection: 'row', alignItems: 'center', gap: space[4] },

    scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: space[8], gap: space[7] },
    bloque: { gap: space[2] },
    serieHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

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

    fantasma: {
      gap: space[2],
      padding: spacing.padCard,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    // Mismo alto visual que la fantasma, para que la pantalla no salte entre
    // una serie con referencia y una sin.
    fantasmaVacio: {
      padding: spacing.padCard,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderSubtle,
    },

    campos: { flexDirection: 'row', gap: space[3] },
    campo: { flex: 1, gap: space[2] },
    campoInput: {
      height: sizing.controlHLg,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      textAlign: 'center',
      fontFamily: mono.bold,
      fontSize: 22,
      color: colors.textPrimary,
    },

    nav: { flexDirection: 'row', gap: space[3], paddingHorizontal: spacing.padScreen, paddingBottom: space[5] },

    // RN no parsea oklch, por eso el velo va en rgba como el resto de los
    // tokens (ver la nota en tokens/colors.ts). Mismo tratamiento que el sheet
    // de opciones del perfil.
    menuFondo: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
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
