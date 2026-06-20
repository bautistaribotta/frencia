/* Frencia · Crear rutina — wizard.
   Arma una ficha de rutina de a un dato por pantalla, con un preview en vivo.
   Tres pasos esenciales:
     1. nombre
     2. cantidad de dias por semana (stepper)
     3. que dias de la semana entrena (se eligen exactamente esa cantidad;
        un dia elegido se puede tocar de nuevo para marcar doble turno x2,
        pensado para quienes entrenan dos veces el mismo dia).
   No se saltan pasos pero si se vuelve atras. Solo front: no persiste nada. */

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  FrenciaText,
  Icon,
  display,
  radius,
  sans,
  sizing,
  space,
  spacing,
  Stepper,
  tracking,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

type StepKey = 'nombre' | 'cantidad' | 'dias';
type StepType = 'text' | 'stepper' | 'weekdays';

interface StepDef {
  key: StepKey;
  type: StepType;
  // Etiqueta corta del paso para el eyebrow (PASO 1 DE 3 · NOMBRE).
  tag: string;
  prompt: string;
  hint: string;
  placeholder?: string;
  maxLength?: number;
}

const STEPS: StepDef[] = [
  {
    key: 'nombre',
    type: 'text',
    tag: 'Nombre',
    prompt: '¿Cómo se llama tu rutina?',
    hint: 'Elegi un nombre para reconocerla.',
    placeholder: 'Push Pull Legs',
    maxLength: 40,
  },
  {
    key: 'cantidad',
    type: 'stepper',
    tag: 'Frecuencia',
    prompt: '¿Cuántos días por semana?',
    hint: 'Cantidad de días de entrenamiento.',
  },
  {
    key: 'dias',
    type: 'weekdays',
    tag: 'Días',
    prompt: '¿Qué días entrenás?',
    hint: 'Tocá un día para elegirlo. Tocalo de nuevo para doble turno (x2).',
  },
];

const DIAS_MIN = 1;
const DIAS_MAX = 7;

// Iniciales de la semana (X para miercoles, asi no se confunde con martes).
const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function CreateRoutineScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [nombre, setNombre] = useState('');
  const [dias, setDias] = useState(3);
  // Sesiones por dia de la semana: 0 = no entrena, 1 = una, 2 = doble turno.
  const [sesiones, setSesiones] = useState<number[]>(() => Array(7).fill(0));

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const diasElegidos = sesiones.filter((s) => s > 0).length;
  const totalSesiones = sesiones.reduce((a, b) => a + b, 0);

  // Validacion por paso: nombre obligatorio, cantidad siempre ok, y en el
  // ultimo paso hay que elegir exactamente la cantidad de dias indicada.
  const currentValid =
    step.key === 'nombre'
      ? nombre.trim() !== ''
      : step.key === 'dias'
        ? diasElegidos === dias
        : true;

  // Cambiar la cantidad recorta dias sobrantes para no quedar en estado invalido.
  function cambiarCantidad(n: number) {
    setDias(n);
    setSesiones((prev) => {
      let count = prev.filter((s) => s > 0).length;
      if (count <= n) return prev;
      const next = [...prev];
      for (let i = next.length - 1; i >= 0 && count > n; i--) {
        if (next[i] > 0) {
          next[i] = 0;
          count -= 1;
        }
      }
      return next;
    });
  }

  // Ciclo por dia: libre -> 1 sesion -> doble turno -> libre. No deja superar
  // la cantidad elegida al sumar dias nuevos.
  function alternarDia(i: number) {
    setSesiones((prev) => {
      const next = [...prev];
      const actual = next[i];
      if (actual === 0) {
        const count = prev.filter((s) => s > 0).length;
        if (count >= dias) return prev;
        next[i] = 1;
      } else if (actual === 1) {
        next[i] = 2;
      } else {
        next[i] = 0;
      }
      return next;
    });
  }

  function goNext() {
    if (isLast) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
  }

  // En el primer paso, volver sale del wizard. En los demas retrocede uno.
  function goBack() {
    if (index === 0) {
      if (router.canGoBack()) router.back();
      else router.replace('/home');
      return;
    }
    setIndex((i) => i - 1);
  }

  // Sin backend todavia: cerramos el wizard y volvemos a la app.
  function finish() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  const nombreLimpio = nombre.trim();

  // Mensaje guia del paso de dias segun cuanto falta elegir.
  let ayudaDias = step.hint;
  if (step.key === 'dias') {
    const faltan = dias - diasElegidos;
    if (faltan > 0) {
      ayudaDias = `Elegí ${faltan} día${faltan === 1 ? '' : 's'} más.`;
    } else if (faltan < 0) {
      const sobran = -faltan;
      ayudaDias = `Quitá ${sobran} día${sobran === 1 ? '' : 's'}.`;
    } else {
      ayudaDias = 'Listo. Tocá un día otra vez para doble turno (x2).';
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header: salir + barra de progreso por segmentos */}
        <View style={styles.header}>
          <Button variant="ghost" size="sm" icon="chevron-left" onPress={goBack}>
            {index === 0 ? 'Salir' : 'Atrás'}
          </Button>
          <View style={styles.progress}>
            {STEPS.map((s, i) => (
              <View
                key={s.key}
                style={[styles.segment, i <= index ? styles.segmentOn : styles.segmentOff]}
              />
            ))}
          </View>
        </View>

        {/* Cuerpo scrolleable: entra con el teclado abierto y tocar fuera
           del input lo cierra (keyboardShouldPersistTaps). */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {/* Heroe: ficha de la rutina armandose en vivo */}
          <View style={styles.preview}>
            <FrenciaText role="dataLabel" color={colors.textTertiary}>
              Tu rutina
            </FrenciaText>

            <FrenciaText
              numberOfLines={2}
              style={[styles.previewName, !nombreLimpio && styles.previewNameGhost]}
            >
              {nombreLimpio || 'Sin nombre'}
            </FrenciaText>

            {/* Tira de semana: refleja los dias elegidos y el doble turno */}
            <View style={styles.weekRow}>
              {SEMANA.map((d, i) => {
                const on = sesiones[i] > 0;
                return (
                  <View
                    key={d}
                    style={[styles.weekCell, on ? styles.weekCellOn : styles.weekCellOff]}
                  >
                    <FrenciaText
                      role="dataLabel"
                      color={on ? colors.textOnAccent : colors.textTertiary}
                      style={styles.weekLetter}
                    >
                      {d}
                    </FrenciaText>
                    {sesiones[i] === 2 ? (
                      <FrenciaText
                        role="dataLabel"
                        color={colors.textOnAccent}
                        style={styles.weekDouble}
                      >
                        x2
                      </FrenciaText>
                    ) : null}
                  </View>
                );
              })}
            </View>

            <FrenciaText role="bodySm" color={colors.textSecondary}>
              {dias} {dias === 1 ? 'día' : 'días'} por semana
              {totalSesiones > diasElegidos && diasElegidos > 0
                ? ` · ${totalSesiones} sesiones`
                : ''}
            </FrenciaText>
          </View>

          {/* Control del paso actual */}
          <View style={styles.control}>
            <FrenciaText role="dataLabel" color={colors.accentText}>
              Paso {index + 1} de {STEPS.length} · {step.tag}
            </FrenciaText>
            <FrenciaText role="subtitle">{step.prompt}</FrenciaText>
            <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.hint}>
              {ayudaDias}
            </FrenciaText>

            {step.type === 'text' ? (
              <View style={styles.field}>
                <Icon name="list" size={20} color={colors.accent} />
                <TextInput
                  style={styles.input}
                  placeholder={step.placeholder}
                  placeholderTextColor={colors.textTertiary}
                  value={nombre}
                  onChangeText={setNombre}
                  maxLength={step.maxLength}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    if (currentValid) goNext();
                  }}
                />
              </View>
            ) : step.type === 'stepper' ? (
              <View style={styles.stepperWrap}>
                <Stepper
                  value={dias}
                  onChange={cambiarCantidad}
                  min={DIAS_MIN}
                  max={DIAS_MAX}
                  size="lg"
                  unit={dias === 1 ? ' día' : ' días'}
                />
              </View>
            ) : (
              <View style={styles.pickerRow}>
                {SEMANA.map((d, i) => {
                  const s = sesiones[i];
                  const on = s > 0;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => alternarDia(i)}
                      accessibilityRole="button"
                      accessibilityLabel={`${d}${s === 2 ? ' doble turno' : on ? ' elegido' : ''}`}
                      style={({ pressed }) => [
                        styles.pickerCell,
                        on ? styles.pickerCellOn : styles.pickerCellOff,
                        pressed && styles.pickerCellPressed,
                      ]}
                    >
                      <FrenciaText
                        style={styles.pickerLetter}
                        color={on ? colors.textOnAccent : colors.textSecondary}
                      >
                        {d}
                      </FrenciaText>
                      {s === 2 ? (
                        <FrenciaText
                          role="dataLabel"
                          color={colors.textOnAccent}
                          style={styles.pickerDouble}
                        >
                          x2
                        </FrenciaText>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Navegacion: sin opcion de saltar, los datos son esenciales */}
        <View style={styles.nav}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            iconRight={isLast ? undefined : 'arrow-right'}
            disabled={!currentValid}
            onPress={goNext}
          >
            {isLast ? 'Crear rutina' : 'Siguiente'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    flex: { flex: 1, paddingHorizontal: spacing.padScreen, paddingVertical: space[5] },

    // Header / progreso
    header: { flexDirection: 'row', alignItems: 'center', gap: space[5] },
    progress: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[2] },
    segment: { flex: 1, height: 4, borderRadius: radius.pill },
    segmentOn: { backgroundColor: colors.accent },
    segmentOff: { backgroundColor: colors.surfaceChip },

    // Cuerpo scrolleable
    scroll: { paddingTop: space[8], paddingBottom: space[6], gap: space[8] },

    // Heroe: ficha de rutina
    preview: {
      gap: space[5],
      padding: spacing.padCard,
      borderRadius: radius.xl,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    previewName: {
      fontFamily: display,
      fontSize: 40,
      lineHeight: 50,
      letterSpacing: tracking.display,
      color: colors.textPrimary,
    },
    previewNameGhost: { color: colors.textTertiary },
    weekRow: { flexDirection: 'row', gap: space[2] },
    weekCell: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekCellOn: { backgroundColor: colors.accent },
    weekCellOff: { backgroundColor: colors.surfaceInset, borderWidth: 1, borderColor: colors.borderSubtle },
    weekLetter: { lineHeight: 14 },
    weekDouble: { fontSize: 8, lineHeight: 10, marginTop: 2 },

    // Control del paso
    control: { gap: space[3] },
    hint: { marginBottom: space[2], maxWidth: 320 },

    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      height: sizing.controlHLg,
      paddingHorizontal: spacing.padControl,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.surfaceGreenLine,
    },
    input: {
      flex: 1,
      color: colors.textPrimary,
      fontFamily: sans.regular,
      fontSize: 18,
      padding: 0,
    },
    stepperWrap: { alignItems: 'center', marginTop: space[2] },

    // Selector de dias de la semana
    pickerRow: { flexDirection: 'row', gap: space[2], marginTop: space[2] },
    pickerCell: {
      flex: 1,
      height: 56,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    pickerCellOn: { backgroundColor: colors.accent },
    pickerCellOff: { backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderSubtle },
    pickerCellPressed: { opacity: 0.7 },
    pickerLetter: { fontFamily: sans.bold, fontSize: 17 },
    pickerDouble: { fontSize: 9, lineHeight: 11 },

    // Navegacion: fija debajo del scroll, nunca tapa el input
    nav: { gap: space[2], paddingTop: space[4] },
  });
