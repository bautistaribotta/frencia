/* Frencia · Crear rutina — wizard.
   Una rutina es un conjunto de dias de entrenamiento. Cada dia tiene su nombre
   ("Dia 1" por defecto, renombrable a "Push"), los dias de la semana en que se
   entrena, y su lista de ejercicios con series, reps y medidor de esfuerzo.
   El wizard tiene dos pasos fijos y uno por cada dia:
     1. nombre de la rutina
     2. cuantos dias tiene
     3..n. armado de cada dia
   El armado de un dia es DayEditor, la misma vista que usa la edicion de un dia
   ya creado.
   Todo se acumula en memoria y recien al finalizar se persiste en una sola
   tanda (rutina + dias + weekdays + ejercicios), asi cancelar no deja basura. */

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { DayEditor } from '@/components/DayEditor';
import { ExercisePickerModal } from '@/components/ExercisePickerModal';
import {
  aplicarEjercicio,
  nuevoDia,
  type DayExercise,
  type Medidor,
  type TrainingDay,
} from '@/lib/dia';

import {
  Button,
  FrenciaText,
  Icon,
  Stepper,
  radius,
  sans,
  sizing,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

const MIN_DIAS = 1;
const MAX_DIAS = 7;
const DIAS_POR_DEFECTO = 3;

export default function CreateRoutineScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { showToast } = useToast();
  const { profile } = useProfile();
  // El medidor de esfuerzo lo define la preferencia del perfil (RIR o RPE).
  const medidor: Medidor = profile?.medidorEsfuerzo ?? 'rir';

  const [index, setIndex] = useState(0);
  const [nombre, setNombre] = useState('');
  const [dias, setDias] = useState<TrainingDay[]>(() =>
    Array.from({ length: DIAS_POR_DEFECTO }, (_, i) => nuevoDia(i + 1)),
  );
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Ejercicio abierto en el modal. null = se esta agregando uno nuevo.
  const [editando, setEditando] = useState<DayExercise | null>(null);

  // Dos pasos fijos (nombre y cantidad) y uno por cada dia.
  const totalSteps = 2 + dias.length;
  const isLast = index === totalSteps - 1;
  const nombreLimpio = nombre.trim();

  // A partir del paso 2 estamos armando un dia concreto.
  const diaIndex = index - 2;
  const diaActual = diaIndex >= 0 ? dias[diaIndex] : null;

  // Solo el nombre de la rutina es obligatorio.
  const currentValid = index === 0 ? nombreLimpio !== '' : true;

  // --- Edicion de los dias ---------------------------------------------------

  // Ajusta la cantidad de dias conservando lo ya cargado en los que siguen
  // existiendo. Al recortar se pierden los dias del final.
  function setCantidadDias(cantidad: number) {
    setDias((prev) => {
      if (cantidad === prev.length) return prev;
      if (cantidad < prev.length) return prev.slice(0, cantidad);
      const extra = Array.from({ length: cantidad - prev.length }, (_, i) =>
        nuevoDia(prev.length + i + 1),
      );
      return [...prev, ...extra];
    });
  }

  function actualizarDia(i: number, patch: Partial<TrainingDay>) {
    setDias((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  function abrirPicker(ejercicio: DayExercise | null) {
    setEditando(ejercicio);
    setPickerOpen(true);
  }

  function guardarEjercicio(ex: DayExercise) {
    setDias((prev) =>
      prev.map((d, idx) =>
        idx === diaIndex ? { ...d, exercises: aplicarEjercicio(d.exercises, ex) } : d,
      ),
    );
  }

  // --- Navegacion ------------------------------------------------------------

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

  // --- Persistencia ----------------------------------------------------------

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

    // Solo puede haber una rutina activa: archivamos la anterior antes de
    // insertar, o el indice unico parcial rechaza la nueva.
    await supabase
      .from('routines')
      .update({ archived_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('archived_at', null);

    const { data: routine, error } = await supabase
      .from('routines')
      .insert({ user_id: user.id, name: nombreLimpio })
      .select('id')
      .single();

    if (error || !routine) {
      setSaving(false);
      showToast({ message: 'No pudimos crear la rutina. Proba de nuevo.', type: 'error' });
      return;
    }

    // Los dias se insertan juntos; Supabase devuelve las filas en el mismo
    // orden en que se enviaron, asi que los ids se pueden aparear por indice.
    const { data: diasCreados, error: errorDias } = await supabase
      .from('training_days')
      .insert(
        dias.map((d, i) => ({
          routine_id: routine.id,
          user_id: user.id,
          name: d.name.trim() || `Día ${i + 1}`,
          position: i,
        })),
      )
      .select('id');

    if (errorDias || !diasCreados) {
      setSaving(false);
      showToast({ message: 'No pudimos crear los días. Proba de nuevo.', type: 'error' });
      return;
    }

    // Dias de la semana y ejercicios de todos los dias, en dos tandas.
    const weekdayRows = dias.flatMap((d, i) =>
      d.weekdays
        .map((on, w) => (on ? w : -1))
        .filter((w) => w >= 0)
        .map((weekday) => ({ training_day_id: diasCreados[i].id, weekday })),
    );

    const exerciseRows = dias.flatMap((d, i) =>
      d.exercises.map((ex, pos) => ({
        training_day_id: diasCreados[i].id,
        exercise_id: ex.exerciseId,
        position: pos,
        sets: ex.sets,
        reps: ex.reps,
        intensity_kind: ex.intensityKind,
        intensity_value: ex.intensityValue,
        rest_seconds: ex.restSeconds,
      })),
    );

    if (weekdayRows.length > 0) {
      await supabase.from('training_day_weekdays').insert(weekdayRows);
    }
    if (exerciseRows.length > 0) {
      await supabase.from('training_day_exercises').insert(exerciseRows);
    }

    setSaving(false);
    showToast({ message: 'Rutina creada', type: 'success' });
    finish();
  }

  // --- Textos del paso actual ------------------------------------------------

  const stepTag = index === 0 ? 'Nombre' : index === 1 ? 'Días' : `Día ${diaIndex + 1}`;
  const stepPrompt =
    index === 0
      ? '¿Cómo se llama tu rutina?'
      : index === 1
        ? '¿Cuántos días tiene?'
        : `¿Qué entrenás el ${diaActual?.name || `día ${diaIndex + 1}`}?`;
  const stepHint =
    index === 0
      ? 'Por ejemplo "Push Pull Legs" o "Fuerza 4 días".'
      : index === 1
        ? 'Podés agregar o quitar días más adelante.'
        : 'Poné un nombre al día, marcá cuándo lo entrenás y sumá ejercicios.';

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
            {Array.from({ length: totalSteps }, (_, i) => (
              <View
                key={i}
                style={[styles.segment, i <= index ? styles.segmentOn : styles.segmentOff]}
              />
            ))}
          </View>
        </View>

        {/* Cuerpo scrolleable: contenido centrado en vertical, entra con el
           teclado abierto y tocar fuera del input lo cierra
           (keyboardShouldPersistTaps). */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {/* Control del paso actual */}
          <View style={styles.control}>
            <FrenciaText role="dataLabel" color={colors.accentText}>
              Paso {index + 1} de {totalSteps} · {stepTag}
            </FrenciaText>
            <FrenciaText role="subtitle">{stepPrompt}</FrenciaText>
            <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.hint}>
              {stepHint}
            </FrenciaText>

            {/* Paso 1: nombre de la rutina */}
            {index === 0 && (
              <View style={styles.field}>
                <Icon name="list" size={20} color={colors.accent} />
                <TextInput
                  style={styles.input}
                  placeholder="Push Pull Legs"
                  placeholderTextColor={colors.textTertiary}
                  value={nombre}
                  onChangeText={setNombre}
                  maxLength={40}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    if (currentValid) goNext();
                  }}
                />
              </View>
            )}

            {/* Paso 2: cuantos dias tiene la rutina */}
            {index === 1 && (
              <Stepper
                label="Días de entrenamiento"
                value={dias.length}
                onChange={setCantidadDias}
                min={MIN_DIAS}
                max={MAX_DIAS}
                size="lg"
              />
            )}

            {/* Pasos siguientes: armado de cada dia */}
            {diaActual && (
              <DayEditor
                dia={diaActual}
                placeholderNombre={`Día ${diaIndex + 1}`}
                onChange={(patch) => actualizarDia(diaIndex, patch)}
                onAgregarEjercicio={() => abrirPicker(null)}
                onEditarEjercicio={abrirPicker}
              />
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
            {isLast ? 'Finalizar rutina' : 'Siguiente'}
          </Button>
        </View>
      </KeyboardAvoidingView>

      <ExercisePickerModal
        visible={pickerOpen}
        medidor={medidor}
        editando={editando}
        onClose={() => setPickerOpen(false)}
        onSubmit={guardarEjercicio}
      />
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

    // Cuerpo scrolleable. Centrado vertical para que los inputs caigan en la
    // zona que el pulgar alcanza usando el telefono con una mano. Con flexGrow
    // el contenido largo (armado de un dia) sigue scrolleando normalmente.
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingTop: space[8],
      paddingBottom: space[6],
      gap: space[8],
    },

    // Control del paso
    control: { gap: space[3] },
    hint: { marginBottom: space[2], maxWidth: 320 },

    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      paddingHorizontal: space[5],
      height: sizing.controlHLg,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    input: { flex: 1, fontFamily: sans.regular, fontSize: 16, color: colors.textPrimary },

    // Navegacion inferior
    nav: { paddingHorizontal: spacing.padScreen, paddingBottom: space[5] },
  });
