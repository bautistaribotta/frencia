/* Frencia · Editar dia de entrenamiento.
   Misma vista que el paso 3 del wizard de creacion (DayEditor), pero cargada
   con un dia que ya existe. Se edita todo en memoria y se guarda de una:
   nombre, dias de la semana y ejercicios. Ver docs/specs/rutinas-y-dias.md */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { DayEditor } from '@/components/DayEditor';
import { ExercisePickerModal } from '@/components/ExercisePickerModal';
import {
  aplicarEjercicio,
  cargarDia,
  eliminarDia,
  guardarDia,
  type DayExercise,
  type Medidor,
  type TrainingDay,
} from '@/lib/dia';

import {
  Button,
  FrenciaText,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

// Interpolar hacia 'transparent' no sirve: es negro con alpha 0, y en el tema
// claro el degradado saldria gris sucio en vez de desvanecerse.
function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Firma del dia para saber si hay cambios sin guardar. Compara lo que se
// persiste y nada mas: el uid de cada fila es de la vista, no del dato.
function firma(dia: TrainingDay): string {
  return JSON.stringify({
    name: dia.name.trim(),
    weekdays: dia.weekdays,
    exercises: dia.exercises.map((ex) => [
      ex.exerciseId,
      ex.sets,
      ex.reps,
      ex.intensityKind,
      ex.intensityValue,
      ex.restSeconds,
    ]),
  });
}

export default function EditDayScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { showToast } = useToast();
  const { profile } = useProfile();
  const medidor: Medidor = profile?.medidorEsfuerzo ?? 'rir';

  const { dia: diaId } = useLocalSearchParams<{ dia?: string }>();

  const [dia, setDia] = useState<TrainingDay | null>(null);
  const [rutina, setRutina] = useState('');
  const [original, setOriginal] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Ejercicio abierto en el modal. null = se esta agregando uno nuevo.
  const [editando, setEditando] = useState<DayExercise | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      if (!diaId) {
        if (!cancelado) setCargando(false);
        return;
      }
      const cargado = await cargarDia(diaId);
      if (cancelado) return;
      if (cargado) {
        setDia(cargado.dia);
        setRutina(cargado.rutina);
        setOriginal(firma(cargado.dia));
      }
      setCargando(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [diaId]);

  const sucio = useMemo(() => (dia ? firma(dia) !== original : false), [dia, original]);
  const nombreValido = (dia?.name.trim() ?? '') !== '';

  const salir = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }, [router]);

  function volver() {
    if (guardando) return;
    if (!sucio) {
      salir();
      return;
    }
    // Salir sin guardar tira el trabajo: no hay borrador, la pantalla edita en
    // memoria y recien escribe al confirmar.
    Alert.alert('Descartar cambios', 'Lo que editaste en este día se va a perder.', [
      { text: 'Seguir editando', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: salir },
    ]);
  }

  function actualizar(patch: Partial<TrainingDay>) {
    setDia((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function abrirPicker(ejercicio: DayExercise | null) {
    setEditando(ejercicio);
    setPickerOpen(true);
  }

  function guardarEjercicio(ex: DayExercise) {
    setDia((prev) => (prev ? { ...prev, exercises: aplicarEjercicio(prev.exercises, ex) } : prev));
  }

  async function guardar() {
    if (!dia || !diaId || !nombreValido || guardando) return;
    setGuardando(true);

    const ok = await guardarDia(diaId, dia);

    if (!ok) {
      setGuardando(false);
      showToast({ message: 'No pudimos guardar el día. Proba de nuevo.', type: 'error' });
      return;
    }

    setGuardando(false);
    showToast({ message: 'Día actualizado', type: 'success' });
    salir();
  }

  // Borrar el dia es destructivo y no hay deshacer: la confirmacion la lleva el
  // Alert, no el color del boton.
  function eliminar() {
    if (!dia || !diaId || guardando || borrando) return;
    const n = dia.exercises.length;
    const detalle = n > 0 ? ` y sus ${n} ${n === 1 ? 'ejercicio' : 'ejercicios'}` : '';
    Alert.alert(
      `Eliminar ${dia.name.trim() || 'este día'}`,
      `Se va a borrar el día${detalle}. No se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: confirmarEliminar },
      ],
    );
  }

  async function confirmarEliminar() {
    if (!diaId) return;
    setBorrando(true);
    const res = await eliminarDia(diaId);
    setBorrando(false);

    if (res === 'ultimo') {
      showToast({
        message: 'Es el único día de la rutina. Para eliminarlo, borrá la rutina.',
        type: 'info',
      });
      return;
    }
    if (res === 'error') {
      showToast({ message: 'No pudimos eliminar el día. Proba de nuevo.', type: 'error' });
      return;
    }
    showToast({ message: 'Día eliminado', type: 'success' });
    salir();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            icon="chevron-left"
            onPress={volver}
            disabled={guardando || borrando}
          >
            Atrás
          </Button>
        </View>

        {cargando ? (
          <View style={styles.centro}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !dia ? (
          <View style={styles.centro}>
            <FrenciaText role="subtitle" style={styles.centerText}>
              No encontramos este día
            </FrenciaText>
            <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.centerText}>
              Puede que lo hayas borrado desde otro dispositivo.
            </FrenciaText>
          </View>
        ) : (
          <View style={styles.scrollWrap}>
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.control}>
                {/* El nombre de la rutina ubica el dia: el campo de abajo edita
                   el nombre del dia, y sin este dato no se sabe de cual cuelga. */}
                <FrenciaText role="dataLabel" color={colors.accentText}>
                  Editar día{rutina ? ` · ${rutina}` : ''}
                </FrenciaText>
                <FrenciaText role="subtitle">{dia.name || 'Día sin nombre'}</FrenciaText>
                <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.hint}>
                  Cambiá el nombre, cuándo lo entrenás y sus ejercicios.
                </FrenciaText>

                <DayEditor
                  dia={dia}
                  placeholderNombre="Nombre del día"
                  onChange={actualizar}
                  onAgregarEjercicio={() => abrirPicker(null)}
                  onEditarEjercicio={abrirPicker}
                />
              </View>
            </ScrollView>

            {/* Funde el contenido contra el fondo antes de que toque el boton
               de guardar, en lugar del corte seco. No intercepta toques. */}
            <LinearGradient
              colors={[withAlpha(colors.bgApp, 0), colors.bgApp]}
              style={styles.fadeBottom}
              pointerEvents="none"
            />
          </View>
        )}

        {dia && (
          <View style={styles.nav}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon="check"
              disabled={!sucio || !nombreValido || borrando}
              loading={guardando}
              onPress={guardar}
            >
              Guardar cambios
            </Button>
            <Button
              variant="danger"
              size="lg"
              fullWidth
              icon="trash-2"
              disabled={guardando}
              loading={borrando}
              onPress={eliminar}
            >
              Eliminar día
            </Button>
          </View>
        )}
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

    header: { flexDirection: 'row', alignItems: 'center', minHeight: 40 },

    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[3] },
    centerText: { textAlign: 'center' },

    // A diferencia del wizard, aca el contenido arranca arriba: el dia ya
    // tiene ejercicios, asi que la pantalla nace larga y centrarla la haria
    // saltar segun cuantos haya.
    scroll: { paddingTop: space[6], paddingBottom: space[6] },
    control: { gap: space[3] },
    hint: { marginBottom: space[2], maxWidth: 320 },

    // Envuelve el scroll para colgarle el degradado encima sin sacarlo de flujo.
    scrollWrap: { flex: 1 },
    fadeBottom: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: space[11],
      pointerEvents: 'none',
    },

    nav: { paddingHorizontal: spacing.padScreen, paddingBottom: space[5], gap: space[2] },
  });
