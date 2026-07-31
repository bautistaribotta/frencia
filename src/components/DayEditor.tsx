/* Frencia · DayEditor — armado de un dia de entrenamiento.
   Nombre del dia, dias de la semana en que se entrena, y la lista ordenada de
   ejercicios. Es el paso 3 del wizard de creacion, y la misma vista se usa para
   editar un dia que ya existe.

   No guarda nada ni sabe de la base: recibe el dia y avisa cada cambio. Quien
   lo monta decide si eso va a memoria (wizard) o a la base (edicion). */

import React, { useCallback, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { DraggableRowList } from '@/components/DraggableRowList';
import {
  SEMANA,
  SEMANA_NOMBRES,
  resumenEjercicio,
  type DayExercise,
  type TrainingDay,
} from '@/lib/dia';

import {
  Button,
  FrenciaText,
  Icon,
  radius,
  sans,
  sizing,
  space,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

export interface DayEditorProps {
  dia: TrainingDay;
  /** Texto guia del campo nombre, ej "Día 2". */
  placeholderNombre: string;
  onChange: (patch: Partial<TrainingDay>) => void;
  /** Abre el buscador de ejercicios. El modal lo monta la pantalla. */
  onAgregarEjercicio: () => void;
  /** Abre un ejercicio ya cargado para cambiarle series, reps, esfuerzo o descanso. */
  onEditarEjercicio: (ejercicio: DayExercise) => void;
}

export function DayEditor({
  dia,
  placeholderNombre,
  onChange,
  onAgregarEjercicio,
  onEditarEjercicio,
}: DayEditorProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  // Los callbacks de la lista tienen que ser referencias estables: la lista
  // memoiza los gestos contra ellas, y si cambian en pleno arrastre el Pan se
  // reconstruye a mitad del gesto. Con el ultimo valor en un ref, los callbacks
  // leen lo actual sin depender de el.
  const diaRef = useRef(dia);
  diaRef.current = dia;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onEditarRef = useRef(onEditarEjercicio);
  onEditarRef.current = onEditarEjercicio;

  // El orden de los ejercicios es el orden en que se entrenan, asi que
  // arrastrarlos cambia el dato, no solo la vista.
  const moverEjercicio = useCallback((from: number, to: number) => {
    const next = [...diaRef.current.exercises];
    const [movido] = next.splice(from, 1);
    next.splice(to, 0, movido);
    onChangeRef.current({ exercises: next });
  }, []);

  const quitarEjercicio = useCallback((i: number) => {
    onChangeRef.current({
      exercises: diaRef.current.exercises.filter((_, j) => j !== i),
    });
  }, []);

  const abrirEjercicio = useCallback((i: number) => {
    const ex = diaRef.current.exercises[i];
    if (ex) onEditarRef.current(ex);
  }, []);

  function alternarDiaSemana(i: number) {
    const next = [...dia.weekdays];
    next[i] = !next[i];
    onChange({ weekdays: next });
  }

  // Filas que consume la lista arrastrable: solo texto, sin tipos del dominio.
  const exerciseItems = useMemo(
    () =>
      dia.exercises.map((ex) => ({
        key: ex.uid,
        title: ex.name,
        detail: resumenEjercicio(ex),
      })),
    [dia.exercises],
  );

  return (
    <View style={styles.dayStep}>
      <View style={styles.field}>
        <Icon name="calendar" size={20} color={colors.accent} />
        <TextInput
          style={styles.input}
          placeholder={placeholderNombre}
          placeholderTextColor={colors.textTertiary}
          value={dia.name}
          onChangeText={(name) => onChange({ name })}
          maxLength={40}
          returnKeyType="done"
        />
      </View>

      <View style={styles.pickerRow}>
        {SEMANA.map((d, i) => {
          const on = dia.weekdays[i];
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

      {dia.exercises.length === 0 ? (
        <View style={styles.emptyExercises}>
          <Icon name="dumbbell" size={26} color={colors.textTertiary} />
          <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.centerText}>
            Todavía no agregaste ejercicios.
          </FrenciaText>
        </View>
      ) : (
        <View style={styles.exerciseBlock}>
          {/* Las dos acciones de la fila no tienen icono propio, asi que se
             enuncian. Reordenar solo aparece cuando hay algo que reordenar. */}
          <FrenciaText role="dataLabel" color={colors.textTertiary}>
            {dia.exercises.length > 1
              ? 'Tocá un ejercicio para editarlo · mantenelo apretado para cambiarlo de orden'
              : 'Tocá el ejercicio para editarlo'}
          </FrenciaText>
          <DraggableRowList
            items={exerciseItems}
            onReorder={moverEjercicio}
            onRemove={quitarEjercicio}
            onPress={abrirEjercicio}
          />
        </View>
      )}

      <Button variant="secondary" size="lg" icon="plus" fullWidth onPress={onAgregarEjercicio}>
        {dia.exercises.length === 0 ? 'Agregar ejercicio' : 'Agregar otro ejercicio'}
      </Button>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    dayStep: { gap: space[5] },
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
    pickerCellOff: {
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    pickerCellPressed: { opacity: 0.75 },
    pickerLetter: { fontFamily: sans.medium, fontSize: 15 },

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
  });
