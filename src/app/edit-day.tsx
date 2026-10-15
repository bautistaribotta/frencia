/* Frencia · Editar dia de entrenamiento.
   Misma vista que el paso 3 del wizard de creacion (DayEditor), pero cargada
   con un dia que ya existe. Se edita todo en memoria y se guarda de una:
   nombre, dias de la semana y ejercicios. Ver docs/specs/rutinas-y-dias.md

   Abajo quedan Guardar y Cancelar; el contenido se funde antes de llegar a
   ellos con una mascara (Lume). Eliminar el dia va al final del scroll:
   es destructivo y poco frecuente, asi que se llega a proposito y no queda
   a un toque de Guardar. */

import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { alerta } from '@/lib/alerta';
import { useDescartarAlSalir } from '@/lib/descartar-al-salir';
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

import { Cargando, Fondo, LumeButton, LumeText, lumeLayout, lumeSpace, useLume } from '@/design/lume';

// La mascara del fundido solo mira el alfa: lleno se ve, vacio no. No son
// colores de la interfaz.
const MASCARA_LLENA = '#000000';
const MASCARA_VACIA = 'transparent';


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
      ex.durationSeconds,
      ex.distanceM,
      ex.weightKg,
      ex.intensityKind,
      ex.intensityValue,
      ex.restSeconds,
    ]),
  });
}

export default function EditDayScreen() {
  const { t } = useLume();
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

  // Salir sin guardar tira el trabajo: no hay borrador, la pantalla edita en
  // memoria y recien escribe al confirmar. El hook pregunta antes de salir,
  // sea por Atras, Cancelar o el gesto de volver.
  const salir = useDescartarAlSalir({
    sucio,
    ocupado: guardando || borrando,
    mensaje: 'Lo que editaste en este día se va a perder.',
    respaldo: '/home',
  });

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
    salir({ sinPreguntar: true });
  }

  // Borrar el dia es destructivo y no hay deshacer: la confirmacion la lleva el
  // modal de alerta, no el color del boton.
  function eliminar() {
    if (!dia || !diaId || guardando || borrando) return;
    const n = dia.exercises.length;
    const detalle = n > 0 ? ` y sus ${n} ${n === 1 ? 'ejercicio' : 'ejercicios'}` : '';
    alerta(
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
    salir({ sinPreguntar: true });
  }

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.cuerpo}>
            <View style={styles.volver}>
              <LumeButton
                variant="ghost"
                size="sm"
                icon="chevron-left"
                onPress={() => salir()}
                disabled={guardando || borrando}
              >
                Atrás
              </LumeButton>
            </View>

            {cargando ? (
              <View style={styles.centro}>
                <Cargando />
              </View>
            ) : !dia ? (
              <View style={styles.centro}>
                <LumeText rol="subtitle" style={styles.centrado}>
                  No encontramos este día
                </LumeText>
                <LumeText rol="bodySm" color={t.textSecondary} style={styles.centrado}>
                  Puede que lo hayas borrado desde otro dispositivo.
                </LumeText>
              </View>
            ) : (
              /* El contenido se funde contra el fondo antes de los botones. Es
                 una mascara y no un degradado al color de fondo: debajo hay
                 luces, no un color plano. */
              <MaskedView
                style={styles.flex}
                maskElement={
                  <View style={styles.flex}>
                    <View style={[styles.flex, { backgroundColor: MASCARA_LLENA }]} />
                    <LinearGradient colors={[MASCARA_LLENA, MASCARA_VACIA]} style={styles.fundido} />
                  </View>
                }
              >
                <ScrollView
                  style={styles.flex}
                  contentContainerStyle={styles.scroll}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="interactive"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.control}>
                    {/* El nombre de la rutina ubica el dia: el campo de abajo
                       edita el nombre del dia, y sin este dato no se sabe de
                       cual cuelga. */}
                    <LumeText rol="label" color={t.signalText}>
                      Editar día{rutina ? ` · ${rutina}` : ''}
                    </LumeText>
                    <LumeText rol="subtitle">{dia.name || 'Día sin nombre'}</LumeText>
                    <LumeText rol="bodySm" color={t.textSecondary} style={styles.ayuda}>
                      Cambiá el nombre, cuándo lo entrenás y sus ejercicios.
                    </LumeText>

                    <DayEditor
                      dia={dia}
                      placeholderNombre="Nombre del día"
                      onChange={actualizar}
                      onAgregarEjercicio={() => abrirPicker(null)}
                      onEditarEjercicio={abrirPicker}
                    />
                  </View>

                  <View style={styles.zonaEliminar}>
                    <LumeButton
                      variant="danger"
                      size="lg"
                      fullWidth
                      icon="trash-2"
                      disabled={guardando}
                      loading={borrando}
                      onPress={eliminar}
                    >
                      Eliminar día
                    </LumeButton>
                  </View>
                </ScrollView>
              </MaskedView>
            )}
          </View>

          {dia && (
            <View style={styles.nav}>
              <LumeButton
                variant="primary"
                size="lg"
                fullWidth
                icon="check"
                disabled={!sucio || !nombreValido || borrando}
                loading={guardando}
                onPress={guardar}
              >
                Guardar cambios
              </LumeButton>
              <LumeButton
                variant="secondary"
                size="lg"
                fullWidth
                icon="x"
                disabled={guardando || borrando}
                onPress={() => salir()}
              >
                Cancelar
              </LumeButton>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ExercisePickerModal
        visible={pickerOpen}
        medidor={medidor}
        editando={editando}
        onClose={() => setPickerOpen(false)}
        onSubmit={guardarEjercicio}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  // El marco de los wizards: el contenido va con el margen de pantalla.
  cuerpo: { flex: 1, paddingHorizontal: lumeLayout.padScreen, paddingTop: lumeSpace[3] },
  // El boton ghost trae su propio padding: el margen lo corre 10 px a la
  // izquierda para que el chevron quede alineado con el borde del contenido.
  volver: { flexDirection: 'row', marginLeft: -10 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: lumeSpace[3] },
  centrado: { textAlign: 'center' },

  // A diferencia del wizard, aca el contenido arranca arriba: el dia ya
  // tiene ejercicios, asi que la pantalla nace larga y centrarla la haria
  // saltar segun cuantos haya. El padding de abajo deja salir el boton de
  // eliminar del fundido.
  scroll: { paddingTop: lumeSpace[6], paddingBottom: lumeSpace[11] },
  control: { gap: lumeSpace[3] },
  ayuda: { marginBottom: lumeSpace[2], maxWidth: 320 },
  // Separado de los ejercicios para que no se lea como parte del editor.
  zonaEliminar: { marginTop: lumeSpace[10] },
  fundido: { height: lumeSpace[11] },

  nav: {
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[4],
    paddingBottom: lumeSpace[5],
    gap: lumeSpace[2],
  },
});
