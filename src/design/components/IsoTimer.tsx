/* Frencia · IsoTimer — RN port of components/log/IsoTimer.jsx
   Cronometro de esfuerzo para isometricos. Cuenta hacia arriba contra el
   objetivo del plan; al frenar completa la duracion de la serie, que queda
   editable. Opuesto visual al RestRing: barra y no anillo, sube y no baja,
   naranja (esfuerzo) y no verde (pausa).

   Diferencias con el design system, acordadas para la app:
   - Cuenta regresiva de 3 s al tocar Empezar, para apoyar el telefono y
     ponerse en posicion. Cancelable.
   - Los digitos van en mono y no en la display, igual que el descanso: cambian
     cada segundo y sin ancho fijo el numero baila.
   - Vibra en cada segundo de la cuenta regresiva, al arrancar y al llegar al
     objetivo. Llegar no frena: el que corta es el usuario, con Frenar.
   - Mientras mide, la pantalla no se apaga.

   El tiempo sale de restar contra la hora de arranque y no de sumar ticks, asi
   que sigue siendo correcto si la app estuvo en segundo plano. */

import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { mono, motion, radius, sans, space, tracking, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';
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

/** Mantiene la pantalla encendida mientras esta montado. */
function PantallaEncendida() {
  useKeepAwake();
  return null;
}

export function IsoTimer({
  target = null,
  value,
  onChange,
  onMeasuringChange,
  countdown = 3,
  style,
}: IsoTimerProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
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
    const t = Date.now();
    setArranque(t);
    setAhora(t);
    setFase('midiendo');
  }

  function frenar() {
    const medido = Math.max(1, Math.round((Date.now() - inicioConteo) / 1000));
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
    <View style={[styles.base, midiendo && styles.baseMidiendo, style]}>
      {midiendo ? <PantallaEncendida /> : null}

      <View style={styles.arriba}>
        <View style={styles.titulo}>
          {midiendo && !enCuenta ? <View style={styles.enVivo} /> : null}
          <Text style={[styles.cap, midiendo && styles.capMidiendo]}>{titulo}</Text>
        </View>
        <Text style={styles.objetivo}>
          Objetivo <Text style={styles.objetivoValor}>{target ? reloj(target) : '—'}</Text>
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
              fase === 'idle' && styles.digitosApagados,
              enCuenta && styles.digitosCuenta,
            ]}
            accessibilityLiveRegion="none"
          >
            {enCuenta ? String(cuentaRestante) : reloj(seg)}
          </Text>
          {target ? (
            <View
              style={styles.barra}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: target, now: Math.floor(seg) }}
            >
              <View style={[styles.relleno, { width: `${lleno}%` }]} />
              <View style={[styles.marca, { left: `${marca}%` }]} />
            </View>
          ) : null}
          <Text style={[styles.nota, midiendo && llego && styles.notaSobre]}>{nota}</Text>
        </>
      )}

      {fase === 'idle' ? (
        <Pressable
          accessibilityRole="button"
          onPress={empezar}
          style={({ pressed }) => [styles.boton, styles.botonEmpezar, pressed && styles.presionado]}
        >
          <Icon name="play" size={20} strokeWidth={2.5} color={colors.textOnAccent} />
          <Text style={[styles.botonTexto, styles.botonTextoEmpezar]}>Empezar</Text>
        </Pressable>
      ) : enCuenta ? (
        <Pressable
          accessibilityRole="button"
          onPress={cancelar}
          style={({ pressed }) => [styles.boton, styles.botonCancelar, pressed && styles.presionado]}
        >
          <Icon name="x" size={20} strokeWidth={2.5} color={colors.textPrimary} />
          <Text style={[styles.botonTexto, styles.botonTextoCancelar]}>Cancelar</Text>
        </Pressable>
      ) : midiendo ? (
        <Pressable
          accessibilityRole="button"
          onPress={frenar}
          style={({ pressed }) => [styles.boton, styles.botonFrenar, pressed && styles.presionado]}
        >
          <Icon name="square" size={20} strokeWidth={2.5} color={colors.textInverse} />
          <Text style={[styles.botonTexto, styles.botonTextoFrenar]}>Frenar</Text>
        </Pressable>
      ) : (
        <View style={styles.fila}>
          <Text style={styles.nota}>Corregilo si hace falta.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={empezar}
            hitSlop={8}
            style={({ pressed }) => [styles.link, pressed && styles.linkPresionado]}
          >
            <Icon name="rotate-ccw" size={16} color={colors.accentText} />
            <Text style={styles.linkTexto}>Volver a medir</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: {
      gap: space[5],
      padding: space[6],
      borderRadius: radius.xl,
      backgroundColor: colors.surfaceCardElevated,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    baseMidiendo: { borderColor: colors.surfaceOrangeLine },
    arriba: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: space[4],
    },
    titulo: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 },
    enVivo: { width: 8, height: 8, borderRadius: 2, backgroundColor: colors.intensity },
    cap: {
      fontFamily: mono.semibold,
      fontSize: 11,
      letterSpacing: tracking.wider,
      textTransform: 'uppercase',
      color: colors.textTertiary,
    },
    capMidiendo: { color: colors.intensityText },
    objetivo: { fontFamily: mono.regular, fontSize: 12, color: colors.textTertiary },
    objetivoValor: { fontFamily: mono.bold, color: colors.textSecondary },
    digitos: {
      fontFamily: mono.bold,
      fontSize: 64,
      lineHeight: 72,
      includeFontPadding: false,
      color: colors.textPrimary,
      fontVariant: ['tabular-nums'],
    },
    digitosApagados: { color: colors.textDisabled },
    digitosCuenta: { color: colors.intensityText },
    barra: {
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: colors.dataTrack,
    },
    relleno: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      borderRadius: radius.pill,
      backgroundColor: colors.intensity,
    },
    marca: {
      position: 'absolute',
      top: -5,
      bottom: -5,
      width: 2,
      marginLeft: -1,
      borderRadius: 1,
      backgroundColor: colors.textPrimary,
    },
    nota: { fontFamily: mono.regular, fontSize: 12, color: colors.textSecondary, minHeight: 16 },
    notaSobre: { color: colors.intensityText },
    boton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      height: 56,
      borderRadius: radius.md,
    },
    botonEmpezar: { backgroundColor: colors.accent },
    botonFrenar: { backgroundColor: colors.textPrimary },
    botonCancelar: {
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderDefault,
    },
    presionado: { transform: [{ scale: motion.pressScale }] },
    botonTexto: { fontFamily: sans.bold, fontSize: 17 },
    botonTextoEmpezar: { color: colors.textOnAccent },
    botonTextoFrenar: { color: colors.textInverse },
    botonTextoCancelar: { color: colors.textPrimary },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },
    link: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 4 },
    linkPresionado: { opacity: 0.6 },
    linkTexto: { fontFamily: sans.semibold, fontSize: 14, color: colors.accentText },
  });
