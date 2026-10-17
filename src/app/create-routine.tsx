/* Frencia · Crear rutina — wizard (Lume).
   Una rutina es un conjunto de dias de entrenamiento. Cada dia tiene su nombre
   ("Dia 1" por defecto, renombrable a "Push"), los dias de la semana en que se
   entrena, y su lista de ejercicios con series, reps y medidor de esfuerzo.
   El wizard tiene dos pasos fijos y uno por cada dia:
     1. nombre de la rutina                Fondo base.
     2. cuantos dias tiene                 Fondo cumbre.
     3..n. armado de cada dia              Fondo cumbre.
   Mismo marco que el setup (PasoWizard): barra en pildora con el contador,
   escala de avance, una pregunta por pantalla a altura fija y una sola
   accion abajo. Sin opcion de saltar: los datos son esenciales. Las luces no
   derivan (eso es solo del onboarding): al cambiar de posicion, el Fondo hace
   un fundido.
   El armado de un dia es DayEditor, la misma vista que usa la edicion de un dia
   ya creado.
   Todo se acumula en memoria y recien al finalizar se persiste en una sola
   tanda (rutina + dias + weekdays + ejercicios), asi cancelar no deja basura. */

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { DayEditor } from '@/components/DayEditor';
import { ExercisePickerModal } from '@/components/ExercisePickerModal';
import { ArchiveRoutineDialog } from '@/components/ArchiveRoutineDialog';
import {
  aplicarEjercicio,
  filaEjercicio,
  nuevoDia,
  type DayExercise,
  type Medidor,
  type TrainingDay,
} from '@/lib/dia';

import { Tag } from '@/design';
import {
  Fondo,
  LumeButton,
  LumeText,
  PasoWizard,
  lumeFuente,
  lumeRadius,
  lumeSpace,
  useLume,
  type PosicionFondo,
} from '@/design/lume';

const MIN_DIAS = 1;
const MAX_DIAS = 7;
const DIAS_POR_DEFECTO = 3;

export default function CreateRoutineScreen() {
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
  // Solo puede haber una rutina activa (indice unico parcial). Si ya hay una,
  // antes de armar nada el usuario decide que hacer con ella: archivarla y
  // activar la nueva, crear la nueva ya archivada, o no crear nada. La
  // decision se guarda aca y se aplica recien al persistir.
  const [rutinaActiva, setRutinaActiva] = useState<string | null>(null);
  const [activar, setActivar] = useState(true);

  useEffect(() => {
    let cancelado = false;
    supabase
      .from('routines')
      .select('name')
      .is('archived_at', null)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelado && data) setRutinaActiva(data.name);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  function decidir(activarNueva: boolean) {
    setActivar(activarNueva);
    setRutinaActiva(null);
  }

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

    await crearRutina(user.id);
  }

  async function crearRutina(userId: string) {
    if (activar) {
      // Archivamos la anterior antes de insertar, o el indice unico parcial
      // rechaza la nueva.
      await supabase
        .from('routines')
        .update({ archived_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('archived_at', null);
    }

    const { data: routine, error } = await supabase
      .from('routines')
      .insert({
        user_id: userId,
        name: nombreLimpio,
        // Nace archivada cuando el usuario quiso conservar la actual como activa.
        archived_at: activar ? null : new Date().toISOString(),
      })
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
          user_id: userId,
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
        ...filaEjercicio(ex, pos),
      })),
    );

    if (weekdayRows.length > 0) {
      await supabase.from('training_day_weekdays').insert(weekdayRows);
    }
    if (exerciseRows.length > 0) {
      await supabase.from('training_day_exercises').insert(exerciseRows);
    }

    setSaving(false);
    showToast({
      message: activar ? 'Rutina creada' : 'Rutina creada y archivada',
      type: 'success',
    });
    finish();
  }

  // --- Textos del paso actual ------------------------------------------------

  const nombreDia = diaActual?.name.trim() || `día ${diaIndex + 1}`;
  const etiqueta =
    index === 0 ? 'Nombre' : index === 1 ? 'Días' : `Día ${diaIndex + 1} de ${dias.length}`;
  const pregunta =
    index === 0
      ? '¿Cómo se llama tu rutina?'
      : index === 1
        ? '¿Cuántos días tiene?'
        : `¿Qué entrenás el ${nombreDia}?`;
  const ayuda =
    index === 0
      ? 'Un nombre que reconozcas de un vistazo.'
      : index === 1
        ? 'Después armás cada uno. Podés sumar o quitar días más adelante.'
        : 'Nombre, días de la semana y ejercicios.';
  const fondo: PosicionFondo = index === 0 ? 'base' : 'cumbre';

  return (
    <View style={styles.pantalla}>
      <Fondo posicion={fondo} />
      <KeyboardAvoidingView
        style={styles.pantalla}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <PasoWizard
          actual={index}
          total={totalSteps}
          volver={index === 0 ? 'Salir' : 'Atrás'}
          onVolver={goBack}
          volverOff={saving}
          rotulo={`Rutina nueva · ${etiqueta}`}
          pregunta={pregunta}
          ayuda={ayuda}
          scroll
          pie={
            <LumeButton
              variant="primary"
              size="lg"
              fullWidth
              icon={isLast ? 'check' : undefined}
              iconRight={isLast ? undefined : 'arrow-right'}
              disabled={!currentValid}
              loading={saving}
              onPress={goNext}
            >
              {isLast ? 'Finalizar rutina' : 'Siguiente'}
            </LumeButton>
          }
        >
          {index === 0 ? (
            <PasoNombre
              nombre={nombre}
              onNombre={setNombre}
              onListo={() => {
                if (currentValid) goNext();
              }}
            />
          ) : null}

          {index === 1 ? <PasoDias dias={dias} onCantidad={setCantidadDias} /> : null}

          {/* Pasos siguientes: armado de cada dia */}
          {diaActual ? (
            <DayEditor
              dia={diaActual}
              placeholderNombre={`Día ${diaIndex + 1}`}
              onChange={(patch) => actualizarDia(diaIndex, patch)}
              onAgregarEjercicio={() => abrirPicker(null)}
              onEditarEjercicio={abrirPicker}
            />
          ) : null}
        </PasoWizard>
      </KeyboardAvoidingView>

      <ArchiveRoutineDialog
        visible={rutinaActiva !== null}
        nombreActual={rutinaActiva ?? ''}
        onContinuar={() => decidir(true)}
        onMantener={() => decidir(false)}
        onCancelar={finish}
      />

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

// --- Paso 1: nombre ------------------------------------------------------------

const MAX_NOMBRE = 40;
const SUGERIDOS = ['Push Pull Legs', 'Torso / Pierna', 'Full body', 'Fuerza 4 días'];

/** El nombre se escribe grande sobre una linea. Las sugerencias completan el
 *  campo con un toque y desaparecen apenas hay texto. */
function PasoNombre({
  nombre,
  onNombre,
  onListo,
}: {
  nombre: string;
  onNombre: (nombre: string) => void;
  onListo: () => void;
}) {
  const { t } = useLume();
  const [foco, setFoco] = useState(false);

  return (
    <View style={styles.nombre}>
      <View style={styles.linea}>
        <TextInput
          style={[
            styles.lineaEntrada,
            {
              color: t.textPrimary,
              // En foco la linea pasa a lume y gana un pixel, sin mover el texto.
              borderBottomColor: foco ? t.signal : t.borderStrong,
              borderBottomWidth: foco ? 2 : 1,
              marginBottom: foco ? 0 : 1,
            },
          ]}
          placeholder="Nombre de la rutina"
          placeholderTextColor={t.textDisabled}
          selectionColor={t.signal}
          cursorColor={t.signal}
          value={nombre}
          onChangeText={onNombre}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          maxLength={MAX_NOMBRE}
          returnKeyType="next"
          onSubmitEditing={onListo}
          accessibilityLabel="Nombre de la rutina"
        />
        <View style={styles.lineaPie}>
          <LumeText rol="label" color={t.textTertiary}>
            {nombre ? '' : 'Obligatorio'}
          </LumeText>
          <LumeText rol="label" color={t.textTertiary} style={styles.cifras}>
            {nombre.length} / {MAX_NOMBRE}
          </LumeText>
        </View>
      </View>

      {nombre === '' ? (
        <View style={styles.sugerencias}>
          {SUGERIDOS.map((s) => (
            <Tag key={s} selectable onPress={() => onNombre(s)}>
              {s}
            </Tag>
          ))}
        </View>
      ) : null}
    </View>
  );
}

// --- Paso 2: cantidad de dias -----------------------------------------------

/** Siete numeros en vez de un stepper: se elige con un toque. Debajo, los dias
 *  que se van a armar y en que paso. */
function PasoDias({
  dias,
  onCantidad,
}: {
  dias: TrainingDay[];
  onCantidad: (cantidad: number) => void;
}) {
  const { t, sombras } = useLume();
  const opciones = Array.from({ length: MAX_DIAS - MIN_DIAS + 1 }, (_, i) => MIN_DIAS + i);

  return (
    <View style={styles.dias}>
      <View style={styles.selector} accessibilityRole="radiogroup">
        {opciones.map((n) => {
          const elegido = n === dias.length;
          return (
            <Pressable
              key={n}
              accessibilityRole="radio"
              accessibilityState={{ checked: elegido }}
              accessibilityLabel={n === 1 ? '1 día' : `${n} días`}
              onPress={() => onCantidad(n)}
              style={({ pressed }) => [
                styles.numero,
                elegido
                  ? { backgroundColor: t.accent, borderColor: t.accent, boxShadow: sombras.haloAccent }
                  : {
                      backgroundColor: pressed ? t.surfaceCardElevated : t.surfaceCard,
                      borderColor: t.glassLine,
                      borderTopColor: t.glassHighlight,
                    },
              ]}
            >
              <LumeText
                rol="data"
                color={elegido ? t.textOnAccent : t.textSecondary}
                style={styles.numeroTexto}
              >
                {n}
              </LumeText>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.previa, { borderTopColor: t.divider }]}>
        {dias.map((d, i) => (
          <View key={i} style={[styles.previaFila, { borderBottomColor: t.divider }]}>
            <LumeText rol="data" color={t.textTertiary} style={styles.previaNumero}>
              {String(i + 1).padStart(2, '0')}
            </LumeText>
            <LumeText rol="bodySm" color={t.textSecondary} numberOfLines={1} style={styles.flex}>
              {d.name.trim() || `Día ${i + 1}`}
            </LumeText>
            <LumeText rol="label" color={t.textDisabled}>
              Paso {i + 3}
            </LumeText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  flex: { flex: 1 },
  cifras: { fontVariant: ['tabular-nums'] },

  nombre: { gap: lumeSpace[6] },
  linea: { gap: 10 },
  lineaEntrada: {
    fontFamily: lumeFuente.medium,
    fontSize: 28,
    letterSpacing: -0.56,
    paddingTop: lumeSpace[3],
    paddingBottom: 10,
    paddingHorizontal: 0,
  },
  lineaPie: { flexDirection: 'row', justifyContent: 'space-between' },
  sugerencias: { flexDirection: 'row', flexWrap: 'wrap', gap: lumeSpace[3] },

  dias: { gap: lumeSpace[7] },
  selector: { flexDirection: 'row', gap: 6 },
  numero: {
    flex: 1,
    height: 56,
    borderRadius: lumeRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTexto: { fontFamily: lumeFuente.condMedium, fontSize: 22, lineHeight: 26 },
  previa: { borderTopWidth: 1 },
  previaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    height: 48,
    borderBottomWidth: 1,
  },
  previaNumero: { width: 22, fontFamily: lumeFuente.semibold, fontSize: 12, lineHeight: 16 },
});
