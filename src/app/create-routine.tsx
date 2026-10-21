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
   Todo se acumula en memoria durante el wizard y recien al finalizar se
   persiste en la base (rutina, dias, weekdays y ejercicios en consultas
   sucesivas), asi cancelar antes de confirmar no deja filas sueltas. */

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { crearRutina, nombreRutinaActiva } from '@/lib/rutinas';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { DayEditor } from '@/components/DayEditor';
import { ExercisePickerModal } from '@/components/ExercisePickerModal';
import { ArchiveRoutineDialog } from '@/components/ArchiveRoutineDialog';
import {
  aplicarEjercicio,
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
  // al finalizar el usuario decide que hacer con ella: archivarla y activar la
  // nueva, o seguir con la actual y guardar la nueva archivada. Se pregunta al
  // final y no al entrar: recien ahi la rutina nueva existe y la pregunta se
  // entiende. Mientras el dialogo esta abierto, aca va el nombre de la activa.
  const [rutinaActiva, setRutinaActiva] = useState<string | null>(null);

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

  /** Usuario de la sesion, o null con el aviso ya mostrado. */
  async function usuarioActual(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      showToast({ message: 'No pudimos identificar tu sesión. Volvé a ingresar.', type: 'error' });
      return null;
    }
    return user.id;
  }

  // Finalizar rutina. Sin otra rutina activa se crea directo y activa; con
  // una, primero se pregunta que hacer con ella. La activa se lee recien
  // ahora, no al entrar: mientras se armaba la nueva pudo haber cambiado.
  async function handleCreate() {
    if (!currentValid || saving) return;
    setSaving(true);

    const userId = await usuarioActual();
    if (!userId) {
      setSaving(false);
      return;
    }

    const activa = await nombreRutinaActiva(userId);
    if (activa !== null) {
      setSaving(false);
      setRutinaActiva(activa);
      return;
    }

    await crear(userId, true);
  }

  // Respuesta del dialogo. Cerrarlo sin elegir (tocar afuera o volver) no
  // crea nada y deja el wizard en el ultimo paso, con todo lo armado.
  async function decidir(activar: boolean) {
    setRutinaActiva(null);
    setSaving(true);
    const userId = await usuarioActual();
    if (!userId) {
      setSaving(false);
      return;
    }
    await crear(userId, activar);
  }

  async function crear(userId: string, activar: boolean) {
    const resultado = await crearRutina(userId, nombreLimpio, dias, activar);
    setSaving(false);
    if (resultado !== 'ok') {
      showToast({
        message:
          resultado === 'error-rutina'
            ? 'No pudimos crear la rutina. Proba de nuevo.'
            : 'No pudimos crear los días. Proba de nuevo.',
        type: 'error',
      });
      return;
    }
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
        onCerrar={() => setRutinaActiva(null)}
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
