/* Frencia · Crear rutina — wizard.
   Una rutina es un "dia": una lista de ejercicios con nombre libre. El doble
   turno (entrenar dos veces el mismo dia) se resuelve creando rutinas separadas
   ("Martes manana" / "Martes tarde"). El wizard arma la ficha en dos pasos:
     1. nombre
     2. que dias de la semana entrena (opcional, se puede repetir en varios).
   Al terminar persiste la rutina y sus dias en Supabase. Los ejercicios se
   agregan despues, desde el detalle de la rutina. */

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

import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/toast';

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
  tracking,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

type StepKey = 'nombre' | 'dias';
type StepType = 'text' | 'weekdays';

interface StepDef {
  key: StepKey;
  type: StepType;
  // Etiqueta corta del paso para el eyebrow (PASO 1 DE 2 · NOMBRE).
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
    hint: 'Por ejemplo "Push" o "Martes por la mañana".',
    placeholder: 'Push Pull Legs',
    maxLength: 40,
  },
  {
    key: 'dias',
    type: 'weekdays',
    tag: 'Días',
    prompt: '¿Qué días la entrenás?',
    hint: 'Opcional. Tocá los días que quieras; podés elegir varios.',
  },
];

// Iniciales e indices de la semana (0 = lunes ... 6 = domingo, igual que el
// rango del check de routine_weekdays.weekday).
const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const SEMANA_NOMBRES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function CreateRoutineScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { showToast } = useToast();
  const [index, setIndex] = useState(0);
  const [nombre, setNombre] = useState('');
  // Dias seleccionados: bandera por dia de la semana (lunes a domingo).
  const [diasSel, setDiasSel] = useState<boolean[]>(() => Array(7).fill(false));
  const [saving, setSaving] = useState(false);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const nombreLimpio = nombre.trim();
  const diasElegidos = diasSel.filter(Boolean).length;

  // El nombre es obligatorio; los dias son opcionales.
  const currentValid = step.key === 'nombre' ? nombreLimpio !== '' : true;

  function alternarDia(i: number) {
    setDiasSel((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  function goNext() {
    if (isLast) {
      handleCreate();
      return;
    }
    setIndex((i) => i + 1);
  }

  // En el primer paso, volver sale del wizard. En los demas retrocede uno.
  function goBack() {
    if (saving) return;
    if (index === 0) {
      if (router.canGoBack()) router.back();
      else router.replace('/home');
      return;
    }
    setIndex((i) => i - 1);
  }

  function finish() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  async function handleCreate() {
    if (!currentValid || saving) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      showToast({ message: 'No pudimos identificar tu sesión. Volvé a ingresar.', type: 'error' });
      return;
    }

    // La nueva rutina se agrega al final del orden actual.
    const { count } = await supabase
      .from('routines')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { data: routine, error } = await supabase
      .from('routines')
      .insert({ user_id: user.id, name: nombreLimpio, position: count ?? 0 })
      .select('id')
      .single();

    if (error || !routine) {
      setSaving(false);
      showToast({ message: 'No pudimos crear la rutina. Proba de nuevo.', type: 'error' });
      return;
    }

    // Dias asignados (opcional): una fila por dia elegido.
    const weekdays = diasSel
      .map((on, i) => (on ? i : -1))
      .filter((i) => i >= 0)
      .map((weekday) => ({ routine_id: routine.id, weekday }));

    if (weekdays.length > 0) {
      await supabase.from('routine_weekdays').insert(weekdays);
    }

    setSaving(false);
    showToast({ message: 'Rutina creada', type: 'success' });
    finish();
  }

  // Resumen de dias en el preview.
  const resumenDias =
    diasElegidos === 0
      ? 'Sin días asignados'
      : `${diasElegidos} ${diasElegidos === 1 ? 'día' : 'días'} por semana`;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header: salir + barra de progreso por segmentos */}
        <View style={styles.header}>
          <Button variant="ghost" size="sm" icon="chevron-left" onPress={goBack} disabled={saving}>
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

            {/* Tira de semana: refleja los dias asignados */}
            <View style={styles.weekRow}>
              {SEMANA.map((d, i) => {
                const on = diasSel[i];
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
                  </View>
                );
              })}
            </View>

            <FrenciaText role="bodySm" color={colors.textSecondary}>
              {resumenDias}
            </FrenciaText>
          </View>

          {/* Control del paso actual */}
          <View style={styles.control}>
            <FrenciaText role="dataLabel" color={colors.accentText}>
              Paso {index + 1} de {STEPS.length} · {step.tag}
            </FrenciaText>
            <FrenciaText role="subtitle">{step.prompt}</FrenciaText>
            <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.hint}>
              {step.hint}
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
            ) : (
              <View style={styles.pickerRow}>
                {SEMANA.map((d, i) => {
                  const on = diasSel[i];
                  return (
                    <Pressable
                      key={d}
                      onPress={() => alternarDia(i)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={SEMANA_NOMBRES[i]}
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
            loading={saving}
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

    // Selector de dias de la semana
    pickerRow: { flexDirection: 'row', gap: space[2], marginTop: space[2] },
    pickerCell: {
      flex: 1,
      height: 56,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickerCellOn: { backgroundColor: colors.accent },
    pickerCellOff: { backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderSubtle },
    pickerCellPressed: { opacity: 0.7 },
    pickerLetter: { fontFamily: sans.bold, fontSize: 17 },

    // Navegacion: fija debajo del scroll, nunca tapa el input
    nav: { gap: space[2], paddingTop: space[4] },
  });
