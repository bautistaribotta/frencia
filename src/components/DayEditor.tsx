/* Frencia · DayEditor — armado de un dia de entrenamiento.
   Nombre del dia, dias de la semana en que se entrena, y la lista ordenada de
   ejercicios. Es el paso 3 del wizard de creacion, y la misma vista se usa para
   editar un dia que ya existe.

   No guarda nada ni sabe de la base: recibe el dia y avisa cada cambio. Quien
   lo monta decide si eso va a memoria (wizard) o a la base (edicion).

   Va en Lume: el nombre en un Campo grande con el icono en lume, la semana
   como eleccion (accent) y los ejercicios en filas de vidrio. */

import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { DraggableRowList } from '@/components/DraggableRowList';
import { useProfile } from '@/contexts/profile';
import {
  partesResumen,
  type DayExercise,
  type TrainingDay,
} from '@/lib/dia';

import { ExerciseSummary, Icon } from '@/design';
import {
  Campo,
  LumeButton,
  LumeText,
  Semana,
  lumeRadius,
  lumeSpace,
  useLume,
} from '@/design/lume';

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
  const { t } = useLume();
  const { profile } = useProfile();
  const unidadDistancia = profile?.unidadDistancia ?? 'km';
  const unidadPeso = profile?.unidadPeso ?? 'kg';

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
        detail: <ExerciseSummary {...partesResumen(ex, unidadDistancia, unidadPeso)} />,
      })),
    [dia.exercises, unidadDistancia, unidadPeso],
  );

  // La semana del dia como indices marcados (0 = lunes), que es lo que pinta Semana.
  const marcados = dia.weekdays.flatMap((on, i) => (on ? [i] : []));

  return (
    <View style={styles.paso}>
      <Campo
        lg
        iconoAcento
        icono="calendar"
        placeholder={placeholderNombre}
        value={dia.name}
        onChangeText={(name) => onChange({ name })}
        maxLength={40}
        returnKeyType="done"
        accessibilityLabel="Nombre del día"
      />

      <Semana editor marcados={marcados} onToggle={alternarDiaSemana} />

      {dia.exercises.length === 0 ? (
        <View style={[styles.vacio, { backgroundColor: t.surfaceInset, borderColor: t.borderStrong }]}>
          <Icon name="dumbbell" size={22} strokeWidth={1.75} color={t.textTertiary} />
          <LumeText rol="bodySm" color={t.textTertiary} style={styles.centrado}>
            Todavía no agregaste ejercicios.
          </LumeText>
        </View>
      ) : (
        <View style={styles.ejercicios}>
          {/* Las dos acciones de la fila no tienen icono propio, asi que se
             enuncian. Reordenar solo aparece cuando hay algo que reordenar. */}
          <LumeText rol="label" color={t.textTertiary}>
            {dia.exercises.length > 1
              ? 'Tocá un ejercicio para editarlo · mantenelo apretado para cambiarlo de orden'
              : 'Tocá el ejercicio para editarlo'}
          </LumeText>
          <DraggableRowList
            items={exerciseItems}
            onReorder={moverEjercicio}
            onRemove={quitarEjercicio}
            onPress={abrirEjercicio}
          />
        </View>
      )}

      <LumeButton variant="secondary" size="lg" icon="plus" fullWidth onPress={onAgregarEjercicio}>
        {dia.exercises.length === 0 ? 'Agregar ejercicio' : 'Agregar otro ejercicio'}
      </LumeButton>
    </View>
  );
}

const styles = StyleSheet.create({
  paso: { gap: lumeSpace[5] },
  centrado: { textAlign: 'center' },
  vacio: {
    alignItems: 'center',
    gap: lumeSpace[3],
    paddingVertical: lumeSpace[8],
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  ejercicios: { gap: lumeSpace[4] },
});
