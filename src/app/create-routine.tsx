/* Frencia · Crear rutina — wizard.
   Una rutina es un "dia": una lista de ejercicios con nombre libre. El doble
   turno (entrenar dos veces el mismo dia) se resuelve creando rutinas separadas
   ("Martes manana" / "Martes tarde"). El wizard arma la ficha en tres pasos:
     1. nombre
     2. que dias de la semana entrena (opcional, se puede repetir en varios)
     3. ejercicios: buscador del catalogo + series y medidor de esfuerzo.
   Los ejercicios se eligen contra el catalogo de Supabase (busqueda por nombre
   con debounce) y se acumulan en memoria. Recien al finalizar se persiste todo
   (rutina + dias + ejercicios) en una sola tanda, asi cancelar no deja basura. */

import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useExerciseCatalog, foldText, type Exercise } from '@/lib/exercises';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';

import {
  Button,
  FrenciaText,
  Icon,
  Stepper,
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

type StepKey = 'nombre' | 'dias' | 'ejercicios';
type StepType = 'text' | 'weekdays' | 'exercises';

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
  {
    key: 'ejercicios',
    type: 'exercises',
    tag: 'Ejercicios',
    prompt: '¿Qué ejercicios incluye?',
    hint: 'Buscá en el catálogo y definí series y esfuerzo para cada uno.',
  },
];

// Iniciales e indices de la semana (0 = lunes ... 6 = domingo, igual que el
// rango del check de routine_weekdays.weekday).
const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const SEMANA_NOMBRES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

type Medidor = 'rir' | 'rpe';

// Ejercicio elegido para la rutina. Vive en memoria hasta finalizar.
interface RoutineExercise {
  exerciseId: string;
  name: string;
  sets: number;
  intensityKind: Medidor;
  intensityValue: number;
}

// Opciones de intensidad segun el medidor del usuario. En RIR sumamos "Fallo"
// (centinela -1) como paso por debajo de 0 RIR; en RPE va de 1 a 10.
function intensityOptions(medidor: Medidor): { label: string; value: number }[] {
  if (medidor === 'rir') {
    return [{ label: 'Fallo', value: -1 }, ...[0, 1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n }))];
  }
  return Array.from({ length: 10 }, (_, i) => ({ label: String(i + 1), value: i + 1 }));
}

// Valor inicial razonable al abrir el configurador de un ejercicio.
function defaultIntensity(medidor: Medidor): number {
  return medidor === 'rir' ? 2 : 8;
}

// Etiqueta corta para el resumen de un ejercicio ya agregado.
function intensityLabel(kind: Medidor, value: number): string {
  if (kind === 'rir') return value < 0 ? 'Al fallo' : `${value} RIR`;
  return `RPE ${value}`;
}

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
  // Dias seleccionados: bandera por dia de la semana (lunes a domingo).
  const [diasSel, setDiasSel] = useState<boolean[]>(() => Array(7).fill(false));
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [saving, setSaving] = useState(false);

  // Catalogo completo en memoria: la busqueda filtra sobre esto, sin red.
  const { exercises: catalog, loading: catalogLoading } = useExerciseCatalog();

  // Estado del buscador/configurador de ejercicios (modal).
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Ejercicio elegido dentro del modal (null = todavia buscando).
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [sets, setSets] = useState(3);
  const [intensityValue, setIntensityValue] = useState(() => defaultIntensity(medidor));

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const nombreLimpio = nombre.trim();
  const diasElegidos = diasSel.filter(Boolean).length;
  const opts = intensityOptions(medidor);

  // El nombre es obligatorio; dias y ejercicios son opcionales.
  const currentValid = step.key === 'nombre' ? nombreLimpio !== '' : true;

  // Busqueda instantanea: filtra el catalogo en memoria (sin acentos ni
  // mayusculas). Cero latencia, sin red por cada tecla.
  const results = useMemo(() => {
    const q = foldText(query.trim());
    if (q === '') return [];
    return catalog.filter((e) => foldText(e.name).includes(q)).slice(0, 50);
  }, [query, catalog]);

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

  // --- Buscador / configurador de ejercicios -------------------------------

  function openPicker() {
    setQuery('');
    setSelected(null);
    setSets(3);
    setIntensityValue(defaultIntensity(medidor));
    setPickerOpen(true);
  }

  function pickExercise(hit: Exercise) {
    setSelected(hit);
    setSets(3);
    setIntensityValue(defaultIntensity(medidor));
  }

  function saveExercise() {
    if (!selected) return;
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: selected.id,
        name: selected.name,
        sets,
        intensityKind: medidor,
        intensityValue,
      },
    ]);
    // Cerrar vuelve a la lista del paso 3: ahi puede agregar otro o finalizar.
    setPickerOpen(false);
  }

  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  // -------------------------------------------------------------------------

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

    // Ejercicios elegidos: una fila por ejercicio, en el orden agregado.
    if (exercises.length > 0) {
      const rows = exercises.map((ex, i) => ({
        routine_id: routine.id,
        exercise_id: ex.exerciseId,
        position: i,
        sets: ex.sets,
        intensity_kind: ex.intensityKind,
        intensity_value: ex.intensityValue,
      }));
      await supabase.from('routine_exercises').insert(rows);
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
              {exercises.length > 0
                ? ` · ${exercises.length} ${exercises.length === 1 ? 'ejercicio' : 'ejercicios'}`
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
              {step.hint}
            </FrenciaText>

            {step.type === 'text' && (
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
            )}

            {step.type === 'weekdays' && (
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

            {step.type === 'exercises' && (
              <View style={styles.exercisesStep}>
                {exercises.length === 0 ? (
                  <View style={styles.emptyExercises}>
                    <Icon name="dumbbell" size={26} color={colors.textTertiary} />
                    <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.centerText}>
                      Todavía no agregaste ejercicios.
                    </FrenciaText>
                  </View>
                ) : (
                  <View style={styles.exerciseList}>
                    {exercises.map((ex, i) => (
                      <View
                        key={`${ex.exerciseId}-${i}`}
                        style={[styles.exerciseRow, i > 0 && styles.exerciseRowDivider]}
                      >
                        <View style={styles.exerciseInfo}>
                          <FrenciaText role="bodySm" style={styles.exerciseName} numberOfLines={1}>
                            {ex.name}
                          </FrenciaText>
                          <FrenciaText role="dataLabel" color={colors.textTertiary}>
                            {ex.sets} {ex.sets === 1 ? 'serie' : 'series'} ·{' '}
                            {intensityLabel(ex.intensityKind, ex.intensityValue)}
                          </FrenciaText>
                        </View>
                        <Pressable
                          hitSlop={8}
                          onPress={() => removeExercise(i)}
                          accessibilityRole="button"
                          accessibilityLabel={`Quitar ${ex.name}`}
                        >
                          <Icon name="trash-2" size={18} color={colors.textTertiary} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}

                <Button variant="secondary" size="lg" icon="plus" fullWidth onPress={openPicker}>
                  {exercises.length === 0 ? 'Agregar ejercicio' : 'Agregar otro ejercicio'}
                </Button>
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
            {isLast ? 'Finalizar rutina' : 'Siguiente'}
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* Buscador + configurador de ejercicios */}
      <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Header del modal: cerrar o volver al buscador */}
            <View style={styles.modalHeader}>
              <Button
                variant="ghost"
                size="sm"
                icon={selected ? 'chevron-left' : 'x'}
                onPress={() => (selected ? setSelected(null) : setPickerOpen(false))}
              >
                {selected ? 'Atrás' : 'Cerrar'}
              </Button>
              <FrenciaText role="title" style={styles.modalTitle} pointerEvents="none">
                {selected ? 'Configurar' : 'Buscar ejercicio'}
              </FrenciaText>
            </View>

            {selected ? (
              /* Configurar: series + medidor de esfuerzo del ejercicio elegido */
              <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.modalBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.selectedCard}>
                  <Icon name="dumbbell" size={20} color={colors.accent} />
                  <FrenciaText role="subtitle" style={styles.flex} numberOfLines={2}>
                    {selected.name}
                  </FrenciaText>
                </View>

                <Stepper label="Series" value={sets} onChange={setSets} min={1} max={20} size="lg" />

                <View style={styles.intensityBlock}>
                  <FrenciaText role="dataLabel" color={colors.textTertiary}>
                    Esfuerzo · {medidor === 'rir' ? 'RIR' : 'RPE'}
                  </FrenciaText>
                  <View style={styles.chipsRow}>
                    {opts.map((o) => {
                      const on = o.value === intensityValue;
                      return (
                        <Pressable
                          key={o.value}
                          onPress={() => setIntensityValue(o.value)}
                          accessibilityRole="button"
                          accessibilityState={{ selected: on }}
                          accessibilityLabel={o.label}
                          style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                        >
                          <FrenciaText
                            role="bodySm"
                            color={on ? colors.textOnAccent : colors.textSecondary}
                            style={styles.chipText}
                          >
                            {o.label}
                          </FrenciaText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            ) : (
              /* Buscar: input + resultados del catalogo */
              <View style={styles.flex}>
                <View style={styles.searchField}>
                  <Icon name="search" size={20} color={colors.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Buscar ejercicio"
                    placeholderTextColor={colors.textTertiary}
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                    autoCorrect={false}
                    returnKeyType="search"
                  />
                  {query !== '' && (
                    <Pressable
                      hitSlop={8}
                      onPress={() => setQuery('')}
                      accessibilityRole="button"
                      accessibilityLabel="Borrar búsqueda"
                    >
                      <Icon name="x" size={18} color={colors.textTertiary} />
                    </Pressable>
                  )}
                </View>

                <ScrollView
                  style={styles.flex}
                  contentContainerStyle={styles.resultsList}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="interactive"
                  showsVerticalScrollIndicator={false}
                >
                  {catalogLoading ? (
                    <View style={styles.resultsHint}>
                      <ActivityIndicator color={colors.accent} />
                    </View>
                  ) : query.trim() === '' ? (
                    <View style={styles.resultsHint}>
                      <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.centerText}>
                        Escribí para buscar en el catálogo.
                      </FrenciaText>
                    </View>
                  ) : results.length === 0 ? (
                    <View style={styles.resultsHint}>
                      <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.centerText}>
                        Sin resultados para "{query.trim()}".
                      </FrenciaText>
                    </View>
                  ) : (
                    results.map((hit) => (
                      <Pressable
                        key={hit.id}
                        onPress={() => pickExercise(hit)}
                        accessibilityRole="button"
                        accessibilityLabel={hit.name}
                        style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
                      >
                        <Icon name="dumbbell" size={18} color={colors.textSecondary} />
                        <FrenciaText role="bodySm" style={styles.resultName} numberOfLines={1}>
                          {hit.name}
                        </FrenciaText>
                        <Icon name="plus" size={18} color={colors.accentText} />
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              </View>
            )}

            {/* Guardar el ejercicio configurado y volver a la lista */}
            {selected && (
              <View style={styles.nav}>
                <Button variant="primary" size="lg" fullWidth icon="check" onPress={saveExercise}>
                  Guardar ejercicio
                </Button>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
    centerText: { textAlign: 'center' },

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

    // Paso de ejercicios
    exercisesStep: { gap: space[4], marginTop: space[2] },
    emptyExercises: {
      alignItems: 'center',
      gap: space[3],
      paddingVertical: space[8],
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.borderDefault,
      backgroundColor: colors.surfaceCard,
    },
    exerciseList: {
      backgroundColor: colors.surfaceCard,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      overflow: 'hidden',
    },
    exerciseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      padding: space[5],
    },
    exerciseRowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
    exerciseInfo: { flex: 1, gap: space[1] },
    exerciseName: { fontFamily: sans.semibold, color: colors.textPrimary },

    // Navegacion: fija debajo del scroll, nunca tapa el input
    nav: { gap: space[2], paddingTop: space[4] },

    // Modal buscador / configurador
    modalHeader: { flexDirection: 'row', alignItems: 'center', minHeight: 40 },
    modalTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center' },
    modalBody: { paddingTop: space[8], paddingBottom: space[6], gap: space[8] },

    selectedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      padding: spacing.padCard,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.surfaceGreenLine,
    },

    intensityBlock: { gap: space[4] },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    chip: {
      minWidth: 52,
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipOn: { backgroundColor: colors.accent },
    chipOff: { backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderSubtle },
    chipText: { fontFamily: sans.semibold },

    // Buscador
    searchField: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      marginTop: space[5],
      height: sizing.controlHLg,
      paddingHorizontal: spacing.padControl,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.surfaceGreenLine,
    },
    resultsList: { paddingTop: space[4], paddingBottom: space[6], gap: space[2] },
    resultsHint: { paddingTop: space[10], alignItems: 'center' },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      padding: space[4],
      borderRadius: radius.md,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    resultRowPressed: { opacity: 0.7 },
    resultName: { flex: 1, fontFamily: sans.semibold, color: colors.textPrimary },
  });
