/* Frencia · Crear rutina — wizard.
   Una rutina es un conjunto de dias de entrenamiento. Cada dia tiene su nombre
   ("Dia 1" por defecto, renombrable a "Push"), los dias de la semana en que se
   entrena, y su lista de ejercicios con series, reps y medidor de esfuerzo.
   El wizard tiene dos pasos fijos y uno por cada dia:
     1. nombre de la rutina
     2. cuantos dias tiene
     3..n. armado de cada dia
   Todo se acumula en memoria y recien al finalizar se persiste en una sola
   tanda (rutina + dias + weekdays + ejercicios), asi cancelar no deja basura. */

import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { supabase } from '@/lib/supabase';
import { useExerciseCatalog, foldText, type Exercise } from '@/lib/exercises';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { DraggableExerciseList } from '@/components/DraggableExerciseList';

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

// Iniciales e indices de la semana (0 = lunes ... 6 = domingo, igual que el
// rango del check de training_day_weekdays.weekday).
const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const SEMANA_NOMBRES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const MIN_DIAS = 1;
const MAX_DIAS = 7;
const DIAS_POR_DEFECTO = 3;

type Medidor = 'rir' | 'rpe';

// Ejercicio elegido para un dia. Vive en memoria hasta finalizar.
interface DayExercise {
  // Identidad propia de la fila, estable aunque se reordene o se repita el
  // mismo ejercicio en el dia. El indice no sirve como key: al arrastrar
  // cambia, y React desmontaria la fila en pleno gesto.
  uid: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  intensityKind: Medidor;
  intensityValue: number;
}

let uidSeq = 0;
function nextUid(): string {
  uidSeq += 1;
  return `ex-${uidSeq}`;
}

// Dia de entrenamiento en construccion.
interface TrainingDay {
  name: string;
  weekdays: boolean[];
  exercises: DayExercise[];
}

function nuevoDia(n: number): TrainingDay {
  return { name: `Día ${n}`, weekdays: Array(7).fill(false), exercises: [] };
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

// Mismo color con alpha, para el degradado que funde la lista con el fondo.
// Interpolar hacia 'transparent' no sirve: es negro con alpha 0, y en el tema
// claro el degradado saldria gris sucio en vez de desvanecerse.
function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  const [dias, setDias] = useState<TrainingDay[]>(() =>
    Array.from({ length: DIAS_POR_DEFECTO }, (_, i) => nuevoDia(i + 1)),
  );
  const [saving, setSaving] = useState(false);

  // Catalogo completo en memoria: la busqueda filtra sobre esto, sin red.
  const { exercises: catalog, loading: catalogLoading } = useExerciseCatalog();

  // Estado del buscador/configurador de ejercicios (modal).
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Ejercicio elegido dentro del modal (null = todavia buscando).
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [intensityValue, setIntensityValue] = useState(() => defaultIntensity(medidor));

  // Dos pasos fijos (nombre y cantidad) y uno por cada dia.
  const totalSteps = 2 + dias.length;
  const isLast = index === totalSteps - 1;
  const nombreLimpio = nombre.trim();
  const opts = intensityOptions(medidor);

  // A partir del paso 2 estamos armando un dia concreto.
  const diaIndex = index - 2;
  const diaActual = diaIndex >= 0 ? dias[diaIndex] : null;

  // Solo el nombre de la rutina es obligatorio.
  const currentValid = index === 0 ? nombreLimpio !== '' : true;

  // Busqueda instantanea: filtra el catalogo en memoria (sin acentos ni
  // mayusculas). Cero latencia, sin red por cada tecla. Mira tambien el nombre
  // en ingles, porque en el gimnasio se usan los dos ("jalon al pecho" y "lat
  // pulldown" tienen que encontrar el mismo ejercicio).
  // Sin texto se lista el catalogo entero por nombre: el usuario puede
  // explorar sin saber de antemano como se llama lo que busca.
  const results = useMemo(() => {
    const q = foldText(query.trim());
    if (q === '') return catalog;
    return catalog.filter(
      (e) => foldText(e.name).includes(q) || (e.nameEn && foldText(e.nameEn).includes(q)),
    );
  }, [query, catalog]);

  // Filas que consume la lista arrastrable: solo texto, sin tipos del dominio.
  const exerciseItems = useMemo(
    () =>
      (diaActual?.exercises ?? []).map((ex) => ({
        key: ex.uid,
        title: ex.name,
        detail: `${ex.sets}x${ex.reps} · ${intensityLabel(ex.intensityKind, ex.intensityValue)}`,
      })),
    [diaActual],
  );

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

  function alternarDiaSemana(i: number) {
    if (!diaActual) return;
    const next = [...diaActual.weekdays];
    next[i] = !next[i];
    actualizarDia(diaIndex, { weekdays: next });
  }

  const removeExercise = useCallback(
    (i: number) => {
      setDias((prev) =>
        prev.map((d, idx) =>
          idx === diaIndex ? { ...d, exercises: d.exercises.filter((_, j) => j !== i) } : d,
        ),
      );
    },
    [diaIndex],
  );

  // El orden de los ejercicios es el orden en que se entrenan, asi que
  // arrastrarlos cambia el dato, no solo la vista.
  const moveExercise = useCallback(
    (from: number, to: number) => {
      setDias((prev) =>
        prev.map((d, idx) => {
          if (idx !== diaIndex) return d;
          const next = [...d.exercises];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { ...d, exercises: next };
        }),
      );
    },
    [diaIndex],
  );

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

  // --- Buscador / configurador de ejercicios ---------------------------------

  function openPicker() {
    setQuery('');
    setSelected(null);
    setSets(3);
    setReps(10);
    setIntensityValue(defaultIntensity(medidor));
    setPickerOpen(true);
  }

  // Estable: lo usa el renderItem de la lista, que se memoiza contra el.
  const pickExercise = useCallback(
    (hit: Exercise) => {
      setSelected(hit);
      setSets(3);
      setReps(10);
      setIntensityValue(defaultIntensity(medidor));
    },
    [medidor],
  );

  const keyExtractor = useCallback((hit: Exercise) => hit.id, []);

  const renderResult = useCallback(
    ({ item }: ListRenderItemInfo<Exercise>) => (
      <Pressable
        onPress={() => pickExercise(item)}
        accessibilityRole="button"
        accessibilityLabel={item.name}
        style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
      >
        <Icon name="dumbbell" size={18} color={colors.textSecondary} />
        <FrenciaText role="bodySm" style={styles.resultName} numberOfLines={1}>
          {item.name}
        </FrenciaText>
        <Icon name="plus" size={18} color={colors.accentText} />
      </Pressable>
    ),
    [pickExercise, styles, colors],
  );

  function saveExercise() {
    if (!selected || !diaActual) return;
    actualizarDia(diaIndex, {
      exercises: [
        ...diaActual.exercises,
        {
          uid: nextUid(),
          exerciseId: selected.id,
          name: selected.name,
          sets,
          reps,
          intensityKind: medidor,
          intensityValue,
        },
      ],
    });
    // Cerrar vuelve al armado del dia: ahi puede agregar otro o seguir.
    setPickerOpen(false);
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
              <View style={styles.dayStep}>
                <View style={styles.field}>
                  <Icon name="calendar" size={20} color={colors.accent} />
                  <TextInput
                    style={styles.input}
                    placeholder={`Día ${diaIndex + 1}`}
                    placeholderTextColor={colors.textTertiary}
                    value={diaActual.name}
                    onChangeText={(name) => actualizarDia(diaIndex, { name })}
                    maxLength={40}
                    returnKeyType="done"
                  />
                </View>

                <View style={styles.pickerRow}>
                  {SEMANA.map((d, i) => {
                    const on = diaActual.weekdays[i];
                    return (
                      <Pressable
                        key={d}
                        onPress={() => alternarDiaSemana(i)}
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

                {diaActual.exercises.length === 0 ? (
                  <View style={styles.emptyExercises}>
                    <Icon name="dumbbell" size={26} color={colors.textTertiary} />
                    <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.centerText}>
                      Todavía no agregaste ejercicios.
                    </FrenciaText>
                  </View>
                ) : (
                  <View style={styles.exerciseBlock}>
                    {diaActual.exercises.length > 1 && (
                      <FrenciaText role="dataLabel" color={colors.textTertiary}>
                        Mantené apretado un ejercicio para cambiarlo de orden
                      </FrenciaText>
                    )}
                    <DraggableExerciseList
                      items={exerciseItems}
                      onReorder={moveExercise}
                      onRemove={removeExercise}
                    />
                  </View>
                )}

                <Button variant="secondary" size="lg" icon="plus" fullWidth onPress={openPicker}>
                  {diaActual.exercises.length === 0 ? 'Agregar ejercicio' : 'Agregar otro ejercicio'}
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
      {/* El Modal se monta en una ventana nativa aparte, fuera del arbol del
         SafeAreaProvider de la app. Sin un provider propio los insets llegan en
         cero y el header se mete abajo del notch. */}
      <Modal
        visible={pickerOpen}
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
        statusBarTranslucent
      >
        <SafeAreaProvider>
          <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
              style={styles.flex}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              {/* Header del modal: solo la salida. El titulo va mas abajo,
                 junto al contenido, para que no compita con el boton. */}
              <View style={styles.modalHeader}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={selected ? 'chevron-left' : 'x'}
                  onPress={() => (selected ? setSelected(null) : setPickerOpen(false))}
                >
                  {selected ? 'Atrás' : 'Cerrar'}
                </Button>
              </View>

              {selected ? (
                /* Configurar: series, reps y medidor de esfuerzo */
                <ScrollView
                  style={styles.flex}
                  contentContainerStyle={styles.modalBody}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <FrenciaText role="title">Configurar</FrenciaText>

                  <View style={styles.selectedCard}>
                    <Icon name="dumbbell" size={20} color={colors.accent} />
                    <FrenciaText role="subtitle" style={styles.flex} numberOfLines={2}>
                      {selected.name}
                    </FrenciaText>
                  </View>

                  <Stepper label="Series" value={sets} onChange={setSets} min={1} max={20} size="lg" />
                  <Stepper
                    label="Repeticiones"
                    value={reps}
                    onChange={setReps}
                    min={1}
                    max={50}
                    size="lg"
                  />

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
                /* Buscar: titulo, input y catalogo. El bloque de arriba baja
                   respecto del boton Cerrar para que no queden pegados. */
                <View style={styles.flex}>
                  <View style={styles.searchHeader}>
                    <FrenciaText role="title">Buscar ejercicio</FrenciaText>

                    <View style={styles.searchField}>
                      <Icon name="search" size={20} color={colors.textTertiary} />
                      <TextInput
                        style={styles.input}
                        placeholder="Nombre del ejercicio"
                        placeholderTextColor={colors.textTertiary}
                        value={query}
                        onChangeText={setQuery}
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
                  </View>

                  {/* Sin texto la lista trae el catalogo entero, asi que va
                     virtualizada: montar 198 filas de una vez es caro. */}
                  {catalogLoading ? (
                    <View style={styles.resultsHint}>
                      <ActivityIndicator color={colors.accent} />
                    </View>
                  ) : (
                    <View style={styles.listWrap}>
                      <FlatList
                        data={results}
                        keyExtractor={keyExtractor}
                        renderItem={renderResult}
                        contentContainerStyle={styles.resultsList}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="interactive"
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                          <View style={styles.resultsHint}>
                            <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.centerText}>
                              Sin resultados para “{query.trim()}”.
                            </FrenciaText>
                          </View>
                        }
                      />

                      {/* Funde las filas contra el fondo antes de que lleguen
                         al buscador. Va despues de la lista para quedar encima,
                         y no intercepta toques. */}
                      <LinearGradient
                        colors={[colors.bgApp, withAlpha(colors.bgApp, 0)]}
                        style={styles.fadeTop}
                      />
                    </View>
                  )}
                </View>
              )}

              {/* Guardar el ejercicio configurado y volver al armado del dia */}
              {selected && (
                <View style={styles.nav}>
                  <Button variant="primary" size="lg" fullWidth icon="check" onPress={saveExercise}>
                    Guardar ejercicio
                  </Button>
                </View>
              )}
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
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
    centerText: { textAlign: 'center' },

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

    // Grilla de dias de la semana
    pickerRow: { flexDirection: 'row', gap: space[2] },
    pickerCell: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickerCellOn: { backgroundColor: colors.accent },
    pickerCellOff: { backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderSubtle },
    pickerCellPressed: { opacity: 0.75 },
    pickerLetter: { fontFamily: sans.medium, fontSize: 15 },

    // Armado de un dia
    dayStep: { gap: space[5] },
    emptyExercises: {
      alignItems: 'center',
      gap: space[3],
      paddingVertical: space[8],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderSubtle,
    },
    exerciseBlock: { gap: space[3] },

    // Navegacion inferior
    nav: { paddingHorizontal: spacing.padScreen, paddingBottom: space[5] },

    // Modal del buscador
    modalHeader: { flexDirection: 'row', alignItems: 'center', minHeight: 40 },
    // Titulo e input separados del boton Cerrar, que queda solo arriba.
    searchHeader: { paddingTop: space[7], gap: space[5] },
    modalBody: { paddingTop: space[7], paddingBottom: space[6], gap: space[8] },

    selectedCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      padding: spacing.padCard,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },

    intensityBlock: { gap: space[4] },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    chip: {
      minWidth: 52,
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderRadius: radius.pill,
      alignItems: 'center',
    },
    chipOn: { backgroundColor: colors.accent },
    chipOff: { backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.borderSubtle },
    chipText: { textAlign: 'center' },

    searchField: {
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
    listWrap: { flex: 1 },
    fadeTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: space[8],
      pointerEvents: 'none',
    },
    // El padding de arriba iguala la altura del degradado: en reposo la primera
    // fila se ve entera, y al scrollear las filas se funden ahi en vez de
    // cortarse pegadas al buscador.
    resultsList: { paddingTop: space[8], paddingBottom: space[6] },
    resultsHint: { paddingVertical: space[8], alignItems: 'center' },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      padding: spacing.padCard,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      marginBottom: space[2],
    },
    resultRowPressed: { opacity: 0.75 },
    resultName: { flex: 1, color: colors.textPrimary },
  });
