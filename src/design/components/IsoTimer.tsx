/* Frencia · IsoTimer — RN port of components/log/IsoTimer.jsx (Lume)
   Cronometro de esfuerzo para isometricos. Cuenta hacia arriba contra el
   objetivo del plan; al frenar completa la duracion de la serie, que queda
   editable. Opuesto visual al RestRing: barra y no esfera, sube y no baja,
   tinta (esfuerzo) y no lume (pausa). Va en una tarjeta de vidrio que toma
   el borde de esfuerzo mientras mide; Frenar es el unico relleno de tinta de
   la pantalla.

   Diferencias con el design system, acordadas para la app:
   - Cuenta regresiva de 3 s al tocar Empezar, para apoyar el telefono y
     ponerse en posicion. Cancelable.
   - Vibra en cada segundo de la cuenta regresiva, al arrancar y al llegar al
     objetivo. Llegar no frena: el que corta es el usuario, con Frenar.
   - Mientras mide, la pantalla no se apaga.
   - Medido, la nota y Volver a medir van apiladas y centradas en el ancho
     de la tarjeta, no en una fila.

   El tiempo sale de restar contra la hora de arranque y no de sumar ticks, asi
   que sigue siendo correcto si la app estuvo en segundo plano. */

import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useLume } from '../lume/useLume';
import { lumeFuente, lumeTexto } from '../lume/tipografia';
import { lumeMotion, lumeRadius, lumeSpace } from '../lume/tokens';
import { Vidrio } from '../lume/Vidrio';
import { LumeButton } from '../lume/LumeButton';
import { Icon } from '../Icon';
import { DurationField } from './DurationField';

export interface IsoTimerProps {
  /** Objetivo del plan, en segundos. Sin objetivo no hay barra y se muestra "—". */
  target?: number | null;
  /** Duracion cargada, en segundos. Con valor arranca como registrada. */
  value: number | null;
  /** Al frenar entrega lo medido; despues, lo que se corrija a mano. */
  onChange: (seconds: number | null) => void;
  /** Avisa si esta midiendo (cuenta regresiva incluida). */
  onMeasuringChange?: (measuring: boolean) => void;
  /** Segundos de cuenta regresiva antes de contar. 0 = arranca directo. */
  countdown?: number;
  style?: ViewStyle;
}

type Fase = 'idle' | 'midiendo' | 'hecho';

function reloj(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

function vibrar(fuerte: boolean) {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(
    fuerte ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light,
  ).catch(() => {});
}

/** Mantiene la pantalla encendida mientras esta montado. Si el sistema no
 *  llego a conceder el bloqueo (en web, con la pestana oculta), soltarlo no es
 *  un error. */
function PantallaEncendida() {
  useKeepAwake(undefined, { suppressDeactivateWarnings: true });
  return null;
}

/** El punto que late al lado de "contando". Quieto con Reducir movimiento. */
function EnVivo({ color }: { color: string }) {
  const { reducirMovimiento } = useLume();
  const opacidad = useSharedValue(1);

  useEffect(() => {
    if (reducirMovimiento) return;
    opacidad.value = withRepeat(
      withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(opacidad);
  }, [reducirMovimiento, opacidad]);

  const latido = useAnimatedStyle(() => ({ opacity: opacidad.value }));
  return <Animated.View style={[styles.enVivo, { backgroundColor: color }, latido]} />;
}

export function IsoTimer({
  target = null,
  value,
  onChange,
  onMeasuringChange,
  countdown = 3,
  style,
}: IsoTimerProps) {
  const { t } = useLume();
  const [fase, setFase] = useState<Fase>(value !== null ? 'hecho' : 'idle');
  // Momento en que se toco Empezar. Contar arranca `countdown` segundos despues.
  const [arranque, setArranque] = useState(0);
  const [ahora, setAhora] = useState(() => Date.now());

  const midiendo = fase === 'midiendo';
  const inicioConteo = arranque + countdown * 1000;
  const enCuenta = midiendo && ahora < inicioConteo;
  const cuentaRestante = enCuenta ? Math.ceil((inicioConteo - ahora) / 1000) : 0;
  const seg = midiendo && !enCuenta ? (ahora - inicioConteo) / 1000 : 0;
  const llego = target !== null && seg >= target;

  // Una decima: el segundo que se muestra cambia a tiempo sin atrasarse.
  useEffect(() => {
    if (!midiendo) return;
    const id = setInterval(() => setAhora(Date.now()), 100);
    return () => clearInterval(id);
  }, [midiendo]);

  // El padre usa esto para saber que la serie ya no esta vacia. Al desmontar
  // (cambio de paso) deja de medir.
  const avisar = useRef(onMeasuringChange);
  useEffect(() => {
    avisar.current = onMeasuringChange;
  });
  useEffect(() => {
    avisar.current?.(midiendo);
    return () => avisar.current?.(false);
  }, [midiendo]);

  // Un golpe suave por cada numero de la cuenta, uno fuerte al arrancar.
  const ultimaCuenta = useRef<number | null>(null);
  useEffect(() => {
    if (!midiendo) {
      ultimaCuenta.current = null;
      return;
    }
    if (cuentaRestante === ultimaCuenta.current) return;
    ultimaCuenta.current = cuentaRestante;
    vibrar(cuentaRestante === 0);
  }, [midiendo, cuentaRestante]);

  // Llegar al objetivo avisa una vez por medicion.
  const yaLlego = useRef(false);
  useEffect(() => {
    if (!midiendo) {
      yaLlego.current = false;
      return;
    }
    if (!llego || yaLlego.current) return;
    yaLlego.current = true;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [midiendo, llego]);

  function empezar() {
    const t0 = Date.now();
    setArranque(t0);
    setAhora(t0);
    setFase('midiendo');
  }

  function frenar() {
    // Floor y no round: se registra el mismo segundo que se estaba viendo.
    const medido = Math.max(1, Math.floor((Date.now() - inicioConteo) / 1000));
    setFase('hecho');
    onChange(medido);
  }

  function cancelar() {
    setFase(value !== null ? 'hecho' : 'idle');
  }

  const escala = target ? Math.max(target * 1.2, seg) : 0;
  const lleno = target ? Math.min(100, (seg / escala) * 100) : 0;
  const marca = target ? (target / escala) * 100 : 0;

  let nota = '';
  if (fase === 'idle') nota = 'Arrancá cuando estés en posición.';
  else if (enCuenta) nota = 'Ponete en posición.';
  else if (midiendo && target) {
    nota = llego ? `+${reloj(seg - target)} sobre el objetivo` : `Faltan ${reloj(Math.ceil(target - seg))}`;
  }

  const titulo = enCuenta
    ? 'Esfuerzo · preparate'
    : midiendo
      ? 'Esfuerzo · contando'
      : fase === 'hecho'
        ? 'Esfuerzo · registrado'
        : 'Esfuerzo';

  return (
    <Vidrio
      radio={lumeRadius.xl}
      borde={midiendo ? t.surfaceIntensityLine : undefined}
      style={[styles.base, style]}
    >
      {midiendo ? <PantallaEncendida /> : null}

      <View style={styles.arriba}>
        <View style={styles.titulo}>
          {midiendo && !enCuenta ? <EnVivo color={t.intensity} /> : null}
          <Text style={[lumeTexto.label, { color: midiendo ? t.intensityText : t.textTertiary }]}>
            {titulo}
          </Text>
        </View>
        <Text style={[styles.objetivo, { color: t.textTertiary }]}>
          Objetivo{' '}
          <Text style={[styles.objetivoValor, { color: t.textPrimary }]}>
            {target ? reloj(target) : '—'}
          </Text>
        </Text>
      </View>

      {fase === 'hecho' ? (
        <DurationField
          label="Duración de la serie"
          value={value}
          onChange={(v) => onChange(v > 0 ? v : null)}
          step={5}
          size="lg"
          fullWidth
        />
      ) : (
        <>
          <Text
            style={[
              styles.digitos,
              {
                color:
                  fase === 'idle' ? t.textDisabled : enCuenta ? t.intensityText : t.textPrimary,
              },
            ]}
            accessibilityLiveRegion="none"
          >
            {enCuenta ? String(cuentaRestante) : reloj(seg)}
          </Text>
          {target ? (
            <View
              style={[styles.barra, { backgroundColor: t.dataTrack }]}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: target, now: Math.floor(seg) }}
            >
              <View style={[styles.relleno, { width: `${lleno}%`, backgroundColor: t.intensity }]} />
              {/* La marca del objetivo: una linea fina con su punta arriba. */}
              <View style={[styles.marca, { left: `${marca}%`, backgroundColor: t.textPrimary }]}>
                <View style={[styles.punta, { borderTopColor: t.textPrimary }]} />
              </View>
            </View>
          ) : null}
          <Text
            style={[
              styles.nota,
              { color: midiendo && llego ? t.intensityText : t.textSecondary },
            ]}
          >
            {nota}
          </Text>
        </>
      )}

      {fase === 'idle' ? (
        <LumeButton variant="primary" size="lg" icon="play" fullWidth onPress={empezar}>
          Empezar
        </LumeButton>
      ) : enCuenta ? (
        <LumeButton variant="secondary" size="lg" icon="x" fullWidth onPress={cancelar}>
          Cancelar
        </LumeButton>
      ) : midiendo ? (
        <Pressable
          accessibilityRole="button"
          onPress={frenar}
          style={({ pressed }) => [
            styles.frenar,
            { backgroundColor: t.intensity },
            pressed && { transform: [{ scale: lumeMotion.pressScale }] },
          ]}
        >
          <Icon name="square" size={18} strokeWidth={2} color={t.textOnIntensity} />
          <Text style={[styles.frenarTexto, { color: t.textOnIntensity }]}>Frenar</Text>
        </Pressable>
      ) : (
        <View style={styles.fila}>
          <Text style={[styles.nota, styles.centrado, { color: t.textSecondary }]}>
            Corregilo si hace falta.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={empezar}
            hitSlop={8}
            style={({ pressed }) => [styles.link, pressed && styles.linkPresionado]}
          >
            <Icon name="rotate-ccw" size={16} strokeWidth={1.75} color={t.signalText} />
            <Text style={[styles.linkTexto, { color: t.signalText }]}>Volver a medir</Text>
          </Pressable>
        </View>
      )}
    </Vidrio>
  );
}

const styles = StyleSheet.create({
  base: { gap: 18, padding: lumeSpace[6] },
  arriba: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: lumeSpace[4],
  },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[3], flexShrink: 1 },
  enVivo: { width: 6, height: 6, borderRadius: 3 },
  objetivo: { fontFamily: lumeFuente.regular, fontSize: 13, lineHeight: 18 },
  objetivoValor: { fontFamily: lumeFuente.semibold, fontVariant: ['tabular-nums'] },
  digitos: {
    fontFamily: lumeFuente.condMedium,
    fontSize: 80,
    lineHeight: 84,
    letterSpacing: -3.2,
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  barra: { height: 4, borderRadius: lumeRadius.xs, marginTop: 6 },
  relleno: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: lumeRadius.xs },
  marca: { position: 'absolute', top: -7, bottom: -7, width: 1, marginLeft: -0.5 },
  punta: {
    position: 'absolute',
    top: -4,
    left: -3,
    width: 0,
    height: 0,
    borderLeftWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  nota: {
    fontFamily: lumeFuente.regular,
    fontSize: 13,
    lineHeight: 18,
    minHeight: 18,
    fontVariant: ['tabular-nums'],
  },
  centrado: { textAlign: 'center' },
  frenar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: lumeRadius.lg,
  },
  frenarTexto: { fontFamily: lumeFuente.semibold, fontSize: 16, lineHeight: 20 },
  // La nota arriba y el link abajo, centrados en el ancho de la tarjeta.
  fila: { alignItems: 'center', gap: lumeSpace[1] },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 4 },
  linkPresionado: { opacity: 0.6 },
  linkTexto: { fontFamily: lumeFuente.semibold, fontSize: 14, lineHeight: 18 },
});
