/* Frencia · ExercisePickerModal — buscar un ejercicio y configurarlo.
   Dos caras del mismo modal: primero el catalogo con su buscador y el filtro
   por tipo o grupo muscular, y al elegir uno, lo que prescribe el plan: series,
   reps, esfuerzo y descanso en fuerza; tiempo, distancia y RPE en cardio;
   series, tiempo, peso opcional, RPE y descanso en isometricos.
   Lo usan el wizard de creacion y la edicion de un dia.

   En el catalogo, tocar una fila la despliega (nombre completo, musculos y
   equipamiento) y recien el boton Anadir pasa a configurarlo: explorar no
   tiene que sacarte de la lista.

   Con `editando` se abre directo en la segunda cara, con los valores de ese
   ejercicio cargados: el ejercicio ya esta elegido, lo que se cambia son los
   numeros.

   Va en Lume: fondo velado, el elegido en vidrio fuerte, los campos de la
   familia Stepper y las filas del catalogo que se despliegan en vidrio.

   Cada apertura monta el contenido de cero, con su estado inicial sacado de
   las props: el modal no arrastra lo que se configuro la vez anterior.

   Lo que se configura vive en un reducer (lib/config-ejercicio), la busqueda
   en useBusquedaCatalogo y cada cara en components/selector-ejercicio. */

import React, { useCallback, useReducer, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Hoja } from '@/components/Hoja';
import { MeasurePicker } from '@/components/MeasurePicker';
import { CatalogoEjercicios } from '@/components/selector-ejercicio/CatalogoEjercicios';
import { ConfigEjercicio } from '@/components/selector-ejercicio/ConfigEjercicio';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import {
  armarEjercicio,
  configInicial,
  medidorActivo as calcularMedidorActivo,
  reducerConfig,
  tiempoValido as calcularTiempoValido,
  type ConfigEjercicio as Config,
  type ContextoConfig,
} from '@/lib/config-ejercicio';
import { nextUid, type DayExercise, type Medidor } from '@/lib/dia';
import { useExerciseCatalog, type Exercise } from '@/lib/exercises';
import { useBusquedaCatalogo } from '@/lib/use-busqueda-catalogo';
import { Fondo, LumeButton, LumeText, lumeLayout, lumeSpace, useLume } from '@/design/lume';

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
  // Catalogo completo en memoria: la busqueda filtra sobre esto, sin red. Vive
  // aca y no en el contenido para no volver a pedirlo en cada apertura.
  const { exercises: catalog, loading: catalogLoading } = useExerciseCatalog();

  // Cada vez que el modal se abre cambia la key del contenido, que se monta de
  // nuevo con su estado inicial. Se detecta en el render comparando con el
  // valor anterior, no en un efecto: asi el primer cuadro ya sale limpio, sin
  // pintar el estado de la apertura anterior y reiniciarlo despues. Al cerrar
  // la key no cambia, para que el contenido no se reinicie mientras baja.
  const [apertura, setApertura] = useState(0);
  const [visibleAntes, setVisibleAntes] = useState(visible);
  if (visible !== visibleAntes) {
    setVisibleAntes(visible);
    if (visible) setApertura((n) => n + 1);
  }

  return (
    /* El Modal se monta en una ventana nativa aparte, fuera del arbol del
       SafeAreaProvider de la app. Sin un provider propio los insets llegan en
       cero y el header se mete abajo del notch. */
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaProvider>
        {/* Fondo velado: el catalogo y el configurador llevan mucho texto chico. */}
        <View style={styles.pantalla}>
          <Fondo posicion="velada" />
          <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <PickerContenido
              key={apertura}
              medidor={medidor}
              editando={editando}
              catalog={catalog}
              catalogLoading={catalogLoading}
              onClose={onClose}
              onSubmit={onSubmit}
            />
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}

interface PickerContenidoProps extends Omit<ExercisePickerModalProps, 'visible'> {
  catalog: Exercise[];
  catalogLoading: boolean;
}

/** Las dos caras del modal. Su estado vive una sola apertura. */
function PickerContenido({
  medidor,
  editando,
  catalog,
  catalogLoading,
  onClose,
  onSubmit,
}: PickerContenidoProps) {
  const { t } = useLume();
  const { showToast } = useToast();
  const { profile } = useProfile();
  const ctx: ContextoConfig = {
    medidor,
    editando,
    unidadDistancia: profile?.unidadDistancia ?? 'km',
    unidadPeso: profile?.unidadPeso ?? 'kg',
  };

  const [config, dispatch] = useReducer(reducerConfig, ctx, configInicial);
  const { selected } = config;
  const busqueda = useBusquedaCatalogo(catalog);
  const medidorActivo = calcularMedidorActivo(config, ctx);
  const tiempoValido = calcularTiempoValido(config);

  const set = useCallback(
    <K extends Exclude<keyof Config, 'selected'>>(campo: K, valor: Config[K]) => {
      dispatch({ tipo: 'campo', campo, valor } as Parameters<typeof reducerConfig>[1]);
    },
    [],
  );

  // Estable: lo usa el renderItem de la lista, que se memoiza contra el.
  const pickExercise = useCallback(
    (hit: Exercise) => {
      dispatch({
        tipo: 'elegir',
        ejercicio: { id: hit.id, name: hit.name, kind: hit.kind, tracks: hit.tracks },
        medidor,
      });
    },
    [medidor],
  );

  // Hoja con las ruedas del descanso. El borrador solo pasa al ejercicio con
  // Listo; cerrarla tocando afuera lo descarta.
  const [descansoAbierto, setDescansoAbierto] = useState(false);
  const [descansoBorrador, setDescansoBorrador] = useState(0);

  function abrirDescanso() {
    setDescansoBorrador(config.restSeconds ?? 0);
    setDescansoAbierto(true);
  }

  function confirmarDescanso() {
    // 0:00 es "sin descanso", que se guarda como null.
    set('restSeconds', descansoBorrador > 0 ? descansoBorrador : null);
    setDescansoAbierto(false);
  }

  // Editando conserva el uid: quien recibe el ejercicio lo usa para reemplazar
  // la fila en su lugar en vez de agregar otra al final.
  const editMode = editando != null;

  function saveExercise() {
    const ejercicio = armarEjercicio(config, ctx, editando?.uid ?? nextUid());
    if (!ejercicio) return;
    onSubmit(ejercicio);
    onClose();
    // El toast vive en la raiz: se ve apenas baja el modal. Igual que el
    // "Dia actualizado" de la edicion del dia.
    showToast({ message: editMode ? 'Ejercicio actualizado' : 'Ejercicio agregado', type: 'success' });
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.cuerpo}>
        {/* Header del modal: solo la salida. El titulo va mas abajo, junto
           al contenido, para que no compita con el boton. Editando no hay
           atras al buscador: el ejercicio ya esta elegido y la unica salida
           es cerrar. */}
        <View style={styles.modalHeader}>
          <LumeButton
            variant="ghost"
            size="sm"
            icon={selected && !editMode ? 'chevron-left' : 'x'}
            onPress={() => (selected && !editMode ? dispatch({ tipo: 'soltar' }) : onClose())}
          >
            {selected && !editMode ? 'Atrás' : 'Cerrar'}
          </LumeButton>
        </View>

        {selected ? (
          <ConfigEjercicio
            config={{ ...config, selected }}
            editMode={editMode}
            medidorActivo={medidorActivo}
            tiempoValido={tiempoValido}
            unidadDistancia={ctx.unidadDistancia}
            unidadPeso={ctx.unidadPeso}
            set={set}
            onAbrirDescanso={abrirDescanso}
          />
        ) : (
          <CatalogoEjercicios
            busqueda={busqueda}
            catalog={catalog}
            catalogLoading={catalogLoading}
            onAdd={pickExercise}
          />
        )}
      </View>

      {/* Guardar el ejercicio configurado y volver al armado del dia */}
      {selected && (
        <View style={styles.nav}>
          <LumeButton
            variant="primary"
            size="lg"
            fullWidth
            icon="check"
            disabled={!tiempoValido}
            onPress={saveExercise}
          >
            {editMode ? 'Guardar cambios' : 'Guardar ejercicio'}
          </LumeButton>
        </View>
      )}

      {/* Hoja con las ruedas del descanso, igual que la de edad y peso del
         perfil. Cerrarla tocando afuera descarta el cambio. Va superpuesta y
         al final, encima de todo: el selector ya es un Modal. */}
      <Hoja visible={descansoAbierto} onCerrar={() => setDescansoAbierto(false)} rueda superpuesta>
        <View style={styles.hojaTitulo}>
          <LumeText rol="title" style={styles.centerText}>
            Descanso entre series
          </LumeText>
          <LumeText rol="bodySm" color={t.textTertiary} style={styles.centerText}>
            En 0:00 queda sin descanso.
          </LumeText>
        </View>
        {descansoAbierto ? (
          <MeasurePicker kind="rest" initial={descansoBorrador} onChange={setDescansoBorrador} />
        ) : null}
        <LumeButton variant="primary" size="lg" fullWidth onPress={confirmarDescanso}>
          Listo
        </LumeButton>
      </Hoja>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  // El marco del modal: margen de pantalla a los costados.
  cuerpo: { flex: 1, paddingHorizontal: lumeLayout.padScreen, paddingTop: lumeSpace[3] },
  centerText: { textAlign: 'center' },
  nav: { paddingHorizontal: lumeLayout.padScreen, paddingTop: lumeSpace[4], paddingBottom: lumeSpace[5] },
  // El boton ghost trae su propio padding: el margen lo corre 10 px a la
  // izquierda para que el icono quede alineado con el borde del contenido.
  modalHeader: { flexDirection: 'row', alignItems: 'center', minHeight: 40, marginLeft: -10 },
  hojaTitulo: { gap: lumeSpace[3] },
});
