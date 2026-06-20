/* Frencia · Crear rutina — wizard.
   Pide los datos de la rutina de a uno por pantalla, con la misma
   experiencia que el setup inicial del perfil. Por ahora solo dos pasos:
   nombre y cantidad de dias. Son datos esenciales: no se pueden saltar,
   pero si volver al paso anterior. Solo front: todavia no persiste nada. */

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  FrenciaText,
  Icon,
  radius,
  sans,
  sizing,
  space,
  spacing,
  Stepper,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

type StepKey = 'nombre' | 'dias';
type StepType = 'text' | 'stepper';

interface StepDef {
  key: StepKey;
  type: StepType;
  title: string;
  hint: string;
  icon: string;
  placeholder?: string;
  maxLength?: number;
}

const STEPS: StepDef[] = [
  {
    key: 'nombre',
    type: 'text',
    icon: 'list',
    title: '¿Cómo se llama tu rutina?',
    hint: 'Elegi un nombre para reconocerla.',
    placeholder: 'Nombre de la rutina',
    maxLength: 40,
  },
  {
    key: 'dias',
    type: 'stepper',
    icon: 'calendar',
    title: '¿Cuántos días tiene?',
    hint: 'La cantidad de días de entrenamiento por semana.',
  },
];

const DIAS_MIN = 1;
const DIAS_MAX = 7;

export default function CreateRoutineScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [nombre, setNombre] = useState('');
  const [dias, setDias] = useState(3);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  // El nombre es obligatorio; los dias siempre son validos (default 3).
  const currentValid = step.key === 'nombre' ? nombre.trim() !== '' : true;

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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Progreso: volver + puntos */}
        <View style={styles.header}>
          <Button variant="ghost" size="sm" icon="chevron-left" onPress={goBack}>
            {index === 0 ? 'Salir' : 'Atrás'}
          </Button>
          <View style={styles.dots}>
            {STEPS.map((s, i) => (
              <View
                key={s.key}
                style={[styles.dot, i === index ? styles.dotActive : styles.dotIdle]}
              />
            ))}
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Cuerpo: un unico dato ocupando la pantalla.
           Tocar fuera del input cierra el teclado. */}
        <Pressable style={styles.body} onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.iconWrap}>
            <Icon name={step.icon} size={32} color={colors.accentText} />
          </View>

          <View style={styles.titleBlock}>
            <FrenciaText role="dataLabel" color={colors.textTertiary}>
              Paso {index + 1} de {STEPS.length}
            </FrenciaText>
            <FrenciaText role="display" style={styles.title}>
              {step.title}
            </FrenciaText>
            <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.hint}>
              {step.hint}
            </FrenciaText>
          </View>

          {step.type === 'text' ? (
            <View style={styles.field}>
              <Icon name={step.icon} size={20} color={colors.accent} />
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
          ) : (
            <View style={styles.stepperWrap}>
              <Stepper
                value={dias}
                onChange={setDias}
                min={DIAS_MIN}
                max={DIAS_MAX}
                size="lg"
                unit={dias === 1 ? ' día' : ' días'}
              />
            </View>
          )}
        </Pressable>

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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dots: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    dot: { height: 6, borderRadius: radius.pill },
    dotActive: { width: 22, backgroundColor: colors.accent },
    dotIdle: { width: 6, backgroundColor: colors.surfaceChip },
    headerSpacer: { width: 72 },

    // Cuerpo: arranca arriba, debajo del header
    body: { marginTop: space[8], gap: space[6] },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceOrangeSoft,
      borderWidth: 1,
      borderColor: colors.surfaceOrangeLine,
    },
    titleBlock: { gap: space[3] },
    title: { fontSize: 40, lineHeight: 52, includeFontPadding: false },
    hint: { maxWidth: 320 },

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
    stepperWrap: { alignItems: 'center' },

    // Navegacion
    nav: { gap: space[2], marginTop: space[10] },
  });
