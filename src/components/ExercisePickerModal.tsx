/* Frencia · ExercisePickerModal — buscar un ejercicio y configurarlo.
   Dos caras del mismo modal: primero el catalogo con su buscador, y al elegir
   uno, las series, reps, esfuerzo y descanso. Lo usan el wizard de creacion y
   la edicion de un dia.

   Con `editando` se abre directo en la segunda cara, con los valores de ese
   ejercicio cargados: el ejercicio ya esta elegido, lo que se cambia son los
   numeros. */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

import { useExerciseCatalog, foldText, type Exercise } from '@/lib/exercises';
import {
  DESCANSOS,
  DESCANSO_POR_DEFECTO,
  defaultIntensity,
  intensityOptions,
  nextUid,
  restLabel,
  type DayExercise,
  type Medidor,
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

/** Ejercicio ya elegido, venga del catalogo o de un dia armado. */
interface Elegido {
  id: string;
  name: string;
}

export interface ExercisePickerModalProps {
  visible: boolean;
  /** Medidor de esfuerzo del perfil: define las opciones y el valor inicial. */
  medidor: Medidor;
  /** Ejercicio del dia a editar. null o ausente = agregar uno nuevo. */
  editando?: DayExercise | null;
  onClose: () => void;
  /** Entrega el ejercicio configurado. Conserva el uid si se estaba editando. */
  onSubmit: (ejercicio: DayExercise) => void;
}

export function ExercisePickerModal({
  visible,
  medidor,
  editando,
  onClose,
  onSubmit,
}: ExercisePickerModalProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  // Catalogo completo en memoria: la busqueda filtra sobre esto, sin red.
  const { exercises: catalog, loading: catalogLoading } = useExerciseCatalog();

  const [query, setQuery] = useState('');
  // Ejercicio elegido dentro del modal (null = todavia buscando).
  const [selected, setSelected] = useState<Elegido | null>(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [intensityValue, setIntensityValue] = useState(() => defaultIntensity(medidor));
  const [restSeconds, setRestSeconds] = useState<number | null>(DESCANSO_POR_DEFECTO);

  // Editando se respeta el medidor con el que se guardo el ejercicio, no la
  // preferencia actual del perfil. Si el usuario paso de RIR a RPE, reetiquetar
  // un "2 RIR" como "2 RPE" cambiaria el dato sin que nadie lo pida. Ademas el
  // centinela -1 ("al fallo") solo existe en RIR y hay que poder mostrarlo.
  const medidorActivo: Medidor = editando?.intensityKind ?? medidor;
  const opts = intensityOptions(medidorActivo);

  // Cada apertura arranca de cero, o de los valores del ejercicio que se edita.
  // El modal no arrastra lo que se configuro la vez anterior.
  useEffect(() => {
    if (!visible) return;
    setQuery('');
    if (editando) {
      setSelected({ id: editando.exerciseId, name: editando.name });
      setSets(editando.sets);
      setReps(editando.reps);
      setIntensityValue(editando.intensityValue);
      setRestSeconds(editando.restSeconds);
      return;
    }
    setSelected(null);
    setSets(3);
    setReps(10);
    setIntensityValue(defaultIntensity(medidor));
    setRestSeconds(DESCANSO_POR_DEFECTO);
  }, [visible, medidor, editando]);

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

  // Estable: lo usa el renderItem de la lista, que se memoiza contra el.
  const pickExercise = useCallback(
    (hit: Exercise) => {
      setSelected({ id: hit.id, name: hit.name });
      setSets(3);
      setReps(10);
      setIntensityValue(defaultIntensity(medidor));
      setRestSeconds(DESCANSO_POR_DEFECTO);
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

  // Editando conserva el uid: quien recibe el ejercicio lo usa para reemplazar
  // la fila en su lugar en vez de agregar otra al final.
  const editMode = editando != null;

  function saveExercise() {
    if (!selected) return;
    onSubmit({
      uid: editando?.uid ?? nextUid(),
      exerciseId: selected.id,
      name: selected.name,
      sets,
      reps,
      intensityKind: medidorActivo,
      intensityValue,
      restSeconds,
    });
    onClose();
  }

  return (
    /* El Modal se monta en una ventana nativa aparte, fuera del arbol del
       SafeAreaProvider de la app. Sin un provider propio los insets llegan en
       cero y el header se mete abajo del notch. */
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Header del modal: solo la salida. El titulo va mas abajo,
               junto al contenido, para que no compita con el boton. */}
            {/* Editando no hay atras al buscador: el ejercicio ya esta elegido
               y la unica salida es cerrar. */}
            <View style={styles.modalHeader}>
              <Button
                variant="ghost"
                size="sm"
                icon={selected && !editMode ? 'chevron-left' : 'x'}
                onPress={() => (selected && !editMode ? setSelected(null) : onClose())}
              >
                {selected && !editMode ? 'Atrás' : 'Cerrar'}
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
                <FrenciaText role="title">
                  {editMode ? 'Editar ejercicio' : 'Configurar'}
                </FrenciaText>

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

                <View style={styles.chipsBlock}>
                  <FrenciaText role="dataLabel" color={colors.textTertiary}>
                    Esfuerzo · {medidorActivo === 'rir' ? 'RIR' : 'RPE'}
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

                <View style={styles.chipsBlock}>
                  <FrenciaText role="dataLabel" color={colors.textTertiary}>
                    Descanso entre series
                  </FrenciaText>
                  <View style={styles.chipsRow}>
                    {DESCANSOS.map((o) => {
                      const on = o.value === restSeconds;
                      return (
                        <Pressable
                          key={String(o.value)}
                          onPress={() => setRestSeconds(o.value)}
                          accessibilityRole="button"
                          accessibilityState={{ selected: on }}
                          accessibilityLabel={restLabel(o.value)}
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
                          <FrenciaText
                            role="bodySm"
                            color={colors.textTertiary}
                            style={styles.centerText}
                          >
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
                  {editMode ? 'Guardar cambios' : 'Guardar ejercicio'}
                </Button>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    flex: { flex: 1, paddingHorizontal: spacing.padScreen, paddingVertical: space[5] },

    centerText: { textAlign: 'center' },
    input: { flex: 1, fontFamily: sans.regular, fontSize: 16, color: colors.textPrimary },
    nav: { paddingHorizontal: spacing.padScreen, paddingBottom: space[5] },

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

    chipsBlock: { gap: space[4] },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    chip: {
      minWidth: 52,
      paddingHorizontal: space[4],
      paddingVertical: space[3],
      borderRadius: radius.pill,
      alignItems: 'center',
    },
    chipOn: { backgroundColor: colors.accent },
    chipOff: {
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
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
