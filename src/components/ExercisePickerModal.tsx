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
   las props: el modal no arrastra lo que se configuro la vez anterior. */

import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';

import { MarqueeText } from '@/components/MarqueeText';
import { Hoja } from '@/components/Hoja';
import { MeasurePicker } from '@/components/MeasurePicker';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { distanciaACanonico, mostrarDistancia } from '@/lib/distancia';
import { mostrarPeso, pesoACanonico } from '@/lib/peso';
import {
  TIPOS,
  contarTipo,
  datosAbreviados,
  equipmentLabel,
  foldText,
  muscleGroupsOf,
  useExerciseCatalog,
  type DatosRegistrados,
  type Exercise,
  type TipoEjercicio,
} from '@/lib/exercises';
import {
  DESCANSO_POR_DEFECTO,
  defaultIntensity,
  esRpeOpcional,
  esSerieUnica,
  intensityRange,
  intensityValueLabel,
  nextUid,
  restLabel,
  type DayExercise,
  type Medidor,
} from '@/lib/dia';

import {
  DistanceField,
  DurationField,
  ExerciseTypeTag,
  Icon,
  NumberField,
  Stepper,
  Tag,
} from '@/design';
import {
  Cargando,
  Fondo,
  LumeButton,
  LumeText,
  Segmentado,
  Vidrio,
  lumeFuente,
  lumeLayout,
  lumeMotion,
  lumeRadius,
  lumeSpace,
  useLume,
} from '@/design/lume';

// La mascara del fundido solo mira el alfa: lleno se ve, vacio no. No son
// colores de la interfaz.
const MASCARA_LLENA = '#000000';
const MASCARA_VACIA = 'transparent';


/** Ejercicio ya elegido, venga del catalogo o de un dia armado. */
interface Elegido {
  id: string;
  name: string;
  kind: TipoEjercicio;
  tracks: DatosRegistrados;
}

// Tipos que se ofrecen como filtro junto a los musculos. La fuerza no: es casi
// todo el catalogo y ya la cubren los grupos musculares.
const TIPOS_FILTRO: TipoEjercicio[] = ['cardio', 'isometrico', 'hibrido'];

// RPE de arranque al activar la intensidad en cardio: un ritmo comodo pero
// sostenido, el mismo valor que usa el design system.
const RPE_CARDIO_POR_DEFECTO = 6;

// Isometricos: una plancha tipica de arranque y un descanso corto, los mismos
// valores de ejemplo del design system.
const TIEMPO_ISOMETRICO_POR_DEFECTO = 30;
const DESCANSO_ISOMETRICO_POR_DEFECTO = 60;

/** RPE de arranque segun el tipo, cuando la intensidad es un RPE opcional. */
function rpePorDefecto(kind: TipoEjercicio): number {
  return kind === 'cardio' ? RPE_CARDIO_POR_DEFECTO : defaultIntensity('rpe');
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
  const { t, sombras } = useLume();
  const { showToast } = useToast();
  const { profile } = useProfile();
  const unidadDistancia = profile?.unidadDistancia ?? 'km';
  const unidadPeso = profile?.unidadPeso ?? 'kg';

  const [query, setQuery] = useState('');
  // Filtro del catalogo: un grupo muscular o un tipo, uno a la vez (null en
  // los dos = todos).
  const [grupo, setGrupo] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoEjercicio | null>(null);
  // Fila del catalogo desplegada: una sola a la vez.
  const [abierta, setAbierta] = useState<string | null>(null);
  // Ejercicio elegido dentro del modal (null = todavia buscando). Editando
  // arranca con el ejercicio y sus valores; agregando, con los de siempre.
  const [selected, setSelected] = useState<Elegido | null>(() =>
    editando
      ? { id: editando.exerciseId, name: editando.name, kind: editando.kind, tracks: editando.tracks }
      : null,
  );
  const [sets, setSets] = useState(editando?.sets ?? 3);
  const [reps, setReps] = useState(editando?.reps ?? 10);
  const [intensityValue, setIntensityValue] = useState(
    () =>
      editando?.intensityValue ??
      (editando && esRpeOpcional(editando.kind)
        ? rpePorDefecto(editando.kind)
        : defaultIntensity(medidor)),
  );
  // null es "sin descanso", un valor valido: no se puede usar ?? aca.
  const [restSeconds, setRestSeconds] = useState<number | null>(
    editando ? editando.restSeconds : DESCANSO_POR_DEFECTO,
  );
  // Cardio e isometricos: tiempo en segundos y distancia en la unidad del
  // usuario. null (o 0) es "el plan no lo dice". El tiempo es obligatorio; la
  // distancia, como el RPE, es opcional.
  const [tiempo, setTiempo] = useState<number | null>(editando?.durationSeconds ?? null);
  const [distancia, setDistancia] = useState<number | null>(() =>
    editando?.distanceM != null ? mostrarDistancia(editando.distanceM, unidadDistancia) : null,
  );
  // Isometricos: peso por serie en la unidad del usuario. null = sin peso, lo
  // habitual en una plancha.
  const [pesoPlan, setPesoPlan] = useState<number | null>(() =>
    editando?.weightKg != null ? mostrarPeso(editando.weightKg, unidadPeso) : null,
  );
  // En cardio e isometricos la intensidad es un RPE opcional ("Sin RPE" es la
  // otra opcion).
  const [conRpe, setConRpe] = useState(editando ? editando.intensityKind !== null : false);

  const esCardio = selected !== null && esSerieUnica(selected.kind);
  const esIsometrico = selected?.kind === 'isometrico';
  const rpeOpcional = selected !== null && esRpeOpcional(selected.kind);

  // Editando se respeta el medidor con el que se guardo el ejercicio, no la
  // preferencia actual del perfil. Si el usuario paso de RIR a RPE, reetiquetar
  // un "2 RIR" como "2 RPE" cambiaria el dato sin que nadie lo pida. Ademas el
  // centinela -1 ("al fallo") solo existe en RIR y hay que poder mostrarlo.
  // Cardio e isometricos solo admiten RPE: "repeticiones en reserva" no aplica
  // a correr ni a sostener una posicion.
  const medidorActivo: Medidor = rpeOpcional ? 'rpe' : (editando?.intensityKind ?? medidor);
  const rango = intensityRange(medidorActivo);
  // En los dos el tiempo es lo unico obligatorio del plan.
  const tiempoValido =
    !(esCardio || esIsometrico) || !selected?.tracks.duration || (tiempo ?? 0) > 0;

  // Hoja con las ruedas del descanso. El borrador solo pasa al ejercicio con
  // Listo; cerrarla tocando afuera lo descarta.
  const [descansoAbierto, setDescansoAbierto] = useState(false);
  const [descansoBorrador, setDescansoBorrador] = useState(0);

  function abrirDescanso() {
    setDescansoBorrador(restSeconds ?? 0);
    setDescansoAbierto(true);
  }

  function confirmarDescanso() {
    // 0:00 es "sin descanso", que se guarda como null.
    setRestSeconds(descansoBorrador > 0 ? descansoBorrador : null);
    setDescansoAbierto(false);
  }

  // Chips del filtro: solo grupos que son objetivo de algun ejercicio. El
  // conteo es sobre el catalogo entero, no sobre la busqueda, para que los
  // chips no bailen mientras se escribe.
  const grupos = useMemo(() => muscleGroupsOf(catalog), [catalog]);
  const grupoActivo = grupos.find((g) => g.group.slug === grupo)?.group ?? null;
  // Tipos con ejercicios, ofrecidos antes de los musculos: son otro eje y al
  // final de la tira quedarian fuera de la pantalla.
  const tipos = useMemo(
    () =>
      TIPOS_FILTRO.map((k) => ({ kind: k, count: contarTipo(catalog, k) })).filter(
        (t) => t.count > 0,
      ),
    [catalog],
  );
  const filtroActivo = tipo ? TIPOS[tipo].label : (grupoActivo?.name ?? null);

  // Clave de busqueda precalculada por ejercicio (nombre en espanol e ingles,
  // musculo objetivo y, fuera de fuerza, etiqueta del tipo) para no normalizar
  // todo el catalogo en cada tecla.
  const clavesBusqueda = useMemo(
    () =>
      catalog.map((e) =>
        foldText(
          [
            e.name,
            e.nameEn,
            e.primary?.name,
            e.kind !== 'fuerza' ? TIPOS[e.kind].label : null,
          ]
            .filter(Boolean)
            .join('\n'),
        ),
      ),
    [catalog],
  );

  // Busqueda instantanea: filtra el catalogo en memoria (sin acentos ni
  // mayusculas). Cero latencia, sin red por cada tecla. Mira tambien el nombre
  // en ingles, porque en el gimnasio se usan los dos ("jalon al pecho" y "lat
  // pulldown" tienen que encontrar el mismo ejercicio), y el musculo objetivo.
  // El filtro por grupo mira solo el musculo principal: "Triceps" no tiene que
  // traer todos los press de pecho. Los tipos que no son fuerza tambien se
  // encuentran escribiendo su nombre ("cardio").
  // Sin texto ni filtro se lista el catalogo entero por nombre: el usuario
  // puede explorar sin saber de antemano como se llama lo que busca.
  const results = useMemo(() => {
    const q = foldText(query.trim());
    return catalog.filter(
      (e, i) =>
        (grupo === null || e.primary?.slug === grupo) &&
        (tipo === null || e.kind === tipo) &&
        (q === '' || clavesBusqueda[i].includes(q)),
    );
  }, [query, grupo, tipo, catalog, clavesBusqueda]);

  // Estable: lo usa el renderItem de la lista, que se memoiza contra el.
  const pickExercise = useCallback(
    (hit: Exercise) => {
      const cardio = esSerieUnica(hit.kind);
      const isometrico = hit.kind === 'isometrico';
      setSelected({ id: hit.id, name: hit.name, kind: hit.kind, tracks: hit.tracks });
      setSets(cardio ? 1 : 3);
      setReps(10);
      setIntensityValue(
        esRpeOpcional(hit.kind) ? rpePorDefecto(hit.kind) : defaultIntensity(medidor),
      );
      setRestSeconds(
        cardio ? null : isometrico ? DESCANSO_ISOMETRICO_POR_DEFECTO : DESCANSO_POR_DEFECTO,
      );
      setTiempo(isometrico ? TIEMPO_ISOMETRICO_POR_DEFECTO : null);
      setDistancia(null);
      setPesoPlan(null);
      setConRpe(false);
    },
    [medidor],
  );

  function filtrarGrupo(slug: string | null) {
    setTipo(null);
    setGrupo((g) => (slug === null || g === slug ? null : slug));
  }

  function filtrarTipo(kind: TipoEjercicio) {
    setGrupo(null);
    setTipo((t) => (t === kind ? null : kind));
  }

  const keyExtractor = useCallback((hit: Exercise) => hit.id, []);

  const toggleFila = useCallback((id: string) => {
    setAbierta((actual) => (actual === id ? null : id));
  }, []);

  const renderResult = useCallback(
    ({ item }: ListRenderItemInfo<Exercise>) => (
      <FilaCatalogo
        exercise={item}
        abierta={item.id === abierta}
        onToggle={toggleFila}
        onAdd={pickExercise}
      />
    ),
    [abierta, toggleFila, pickExercise],
  );

  // Editando conserva el uid: quien recibe el ejercicio lo usa para reemplazar
  // la fila en su lugar en vez de agregar otra al final.
  const editMode = editando != null;

  function saveExercise() {
    if (!selected) return;
    if (!tiempoValido) return;
    const base = {
      uid: editando?.uid ?? nextUid(),
      exerciseId: selected.id,
      name: selected.name,
      kind: selected.kind,
      tracks: selected.tracks,
      weightKg: null,
    };
    onSubmit(
      esCardio
        ? {
            ...base,
            sets: 1,
            reps: null,
            durationSeconds: selected.tracks.duration && tiempo ? tiempo : null,
            distanceM:
              selected.tracks.distance && distancia
                ? distanciaACanonico(distancia, unidadDistancia)
                : null,
            intensityKind: conRpe ? 'rpe' : null,
            intensityValue: conRpe ? intensityValue : null,
            restSeconds: null,
          }
        : esIsometrico
          ? {
              ...base,
              sets,
              reps: null,
              durationSeconds: selected.tracks.duration && tiempo ? tiempo : null,
              distanceM: null,
              weightKg:
                selected.tracks.weight && pesoPlan ? pesoACanonico(pesoPlan, unidadPeso) : null,
              intensityKind: conRpe ? 'rpe' : null,
              intensityValue: conRpe ? intensityValue : null,
              restSeconds,
            }
          : {
            ...base,
            sets,
            reps,
            durationSeconds: null,
            distanceM: null,
            intensityKind: medidorActivo,
            intensityValue,
            restSeconds,
          },
    );
    onClose();
    // El toast vive en la raiz: se ve apenas baja el modal. Igual que el
    // "Dia actualizado" de la edicion del dia.
    showToast({ message: editMode ? 'Ejercicio actualizado' : 'Ejercicio agregado', type: 'success' });
  }

  // RPE opcional de cardio e isometricos: "Sin RPE" o un objetivo de 1 a 10.
  const bloqueRpeOpcional = (
    <View style={styles.campoBloque}>
      <View style={styles.captionFila}>
        <LumeText rol="label" color={t.textTertiary}>
          Intensidad
        </LumeText>
        <LumeText rol="label" color={t.textDisabled}>
          opcional
        </LumeText>
      </View>
      <Segmentado
        value={conRpe ? 'rpe' : 'none'}
        onChange={(v) => setConRpe(v === 'rpe')}
        opciones={[
          { value: 'none', label: 'Sin RPE' },
          { value: 'rpe', label: 'RPE' },
        ]}
      />
      {conRpe ? (
        <Stepper
          label="RPE objetivo"
          value={intensityValue}
          onChange={setIntensityValue}
          min={rango.min}
          max={rango.max}
          size="lg"
          fullWidth
          style={styles.campoSeparado}
        />
      ) : null}
    </View>
  );

  // Descanso libre: el campo muestra el valor y abre las ruedas, igual que la
  // edad o el peso en el perfil.
  const bloqueDescanso = (
    <View style={styles.campoBloque}>
      <LumeText rol="label" color={t.textTertiary}>
        Descanso entre series
      </LumeText>
      <Pressable
        onPress={abrirDescanso}
        accessibilityRole="button"
        accessibilityLabel={`Descanso entre series: ${restLabel(restSeconds)}`}
        accessibilityHint="Abre las ruedas para elegir minutos y segundos"
        style={({ pressed }) => [
          styles.campoToque,
          {
            backgroundColor: pressed ? t.surfaceCardElevated : t.surfaceCard,
            borderColor: t.glassLine,
            borderTopColor: t.glassHighlight,
            boxShadow: sombras.glass,
          },
        ]}
      >
        <Icon name="timer" size={20} strokeWidth={1.75} color={t.textTertiary} />
        {restSeconds === null ? (
          <LumeText rol="body" color={t.textSecondary} style={styles.campoTexto}>
            Sin descanso
          </LumeText>
        ) : (
          <LumeText rol="hero" style={[styles.campoValor, styles.campoTexto]}>
            {restLabel(restSeconds)}
          </LumeText>
        )}
        <Icon name="chevron-right" size={18} strokeWidth={1.75} color={t.textTertiary} />
      </Pressable>
    </View>
  );

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
            onPress={() => (selected && !editMode ? setSelected(null) : onClose())}
          >
            {selected && !editMode ? 'Atrás' : 'Cerrar'}
          </LumeButton>
        </View>

        {selected ? (
          /* Configurar: series, reps y medidor de esfuerzo */
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <LumeText rol="title">{editMode ? 'Editar ejercicio' : 'Configurar'}</LumeText>

            <Vidrio nivel="fuerte" style={styles.elegido}>
              <Icon name={TIPOS[selected.kind].icon} size={20} strokeWidth={1.75} color={t.textPrimary} />
              <View style={styles.nombre}>
                <MarqueeText text={selected.name} role="subtitle" color={t.textPrimary} />
                {selected.kind !== 'fuerza' ? (
                  <ExerciseTypeTag
                    label={TIPOS[selected.kind].label}
                    icon={TIPOS[selected.kind].icon}
                    metrics={datosAbreviados(selected.tracks)}
                  />
                ) : null}
              </View>
            </Vidrio>

            {esCardio ? (
              <>
                {/* Una sola serie continua: sin series ni descanso. El plan
                   prescribe tiempo, distancia o las dos cosas. */}
                <View style={styles.cardioCampos}>
                  {selected.tracks.duration ? (
                    <DurationField
                      label="Tiempo"
                      value={tiempo}
                      onChange={(v) => setTiempo(v > 0 ? v : null)}
                      step={60}
                      allowHours
                      size="lg"
                      fullWidth
                    />
                  ) : null}
                  {selected.tracks.distance ? (
                    <DistanceField
                      label="Distancia"
                      value={distancia}
                      onChange={(v) => setDistancia(v !== null && v > 0 ? v : null)}
                      unit={unidadDistancia}
                      size="lg"
                      fullWidth
                    />
                  ) : null}
                  {!tiempoValido ? (
                    <LumeText rol="bodySm" color={t.textTertiary}>
                      Cargá el tiempo para seguir.
                    </LumeText>
                  ) : null}
                </View>

                {bloqueRpeOpcional}
              </>
            ) : esIsometrico ? (
              <>
                {/* Series con descanso, como la fuerza, pero el volumen es el
                   tiempo sostenido. Las series van solas y a todo el ancho,
                   igual que el tiempo de abajo: el campo de tiempo no entra a
                   media anchura. */}
                <Stepper label="Series" value={sets} onChange={setSets} min={1} max={20} size="lg" fullWidth />
                <View style={styles.cardioCampos}>
                  {selected.tracks.duration ? (
                    <DurationField
                      label={sets > 1 ? 'Tiempo por serie' : 'Tiempo'}
                      value={tiempo}
                      onChange={(v) => setTiempo(v > 0 ? v : null)}
                      step={5}
                      size="lg"
                      fullWidth
                    />
                  ) : null}
                  {!tiempoValido ? (
                    <LumeText rol="bodySm" color={t.textTertiary}>
                      Cargá el tiempo para seguir.
                    </LumeText>
                  ) : null}
                </View>

                {/* El peso es opcional: la plancha suele ir sin carga. Si el
                   plan lo prescribe, la sesion lo pide en cada serie. */}
                {selected.tracks.weight ? (
                  <View style={styles.campoBloque}>
                    <View style={styles.captionFila}>
                      <LumeText rol="label" color={t.textTertiary}>
                        {sets > 1 ? 'Peso por serie' : 'Peso'}
                      </LumeText>
                      <LumeText rol="label" color={t.textDisabled}>
                        opcional
                      </LumeText>
                    </View>
                    <NumberField
                      value={pesoPlan}
                      onChange={(v) => setPesoPlan(v !== null && v > 0 ? v : null)}
                      min={0}
                      step={unidadPeso === 'lb' ? 5 : 2.5}
                      decimals={1}
                      unit={unidadPeso}
                      size="lg"
                      fullWidth
                    />
                    <LumeText rol="bodySm" color={t.textTertiary}>
                      {pesoPlan
                        ? 'Con peso en el plan, la sesión lo pide en cada serie.'
                        : 'Sin peso en el plan, en la sesión es opcional.'}
                    </LumeText>
                  </View>
                ) : null}

                {bloqueRpeOpcional}
                {bloqueDescanso}
              </>
            ) : (
              <>
                {/* Series y repeticiones van juntas: son el volumen y se leen
                   de a par ("3 x 10"). */}
                <View style={styles.par}>
                  <Stepper
                    label="Series"
                    value={sets}
                    onChange={setSets}
                    min={1}
                    max={20}
                    size="lg"
                    fullWidth
                    style={styles.parItem}
                  />
                  <Stepper
                    label="Repeticiones"
                    value={reps}
                    onChange={setReps}
                    min={1}
                    max={50}
                    size="lg"
                    fullWidth
                    style={styles.parItem}
                  />
                </View>

                <Stepper
                  label={`Esfuerzo · ${medidorActivo === 'rir' ? 'RIR' : 'RPE'}`}
                  value={intensityValue}
                  onChange={setIntensityValue}
                  min={rango.min}
                  max={rango.max}
                  format={(v) => intensityValueLabel(medidorActivo, v)}
                  size="lg"
                  fullWidth
                />

                {bloqueDescanso}
              </>
            )}
          </ScrollView>
        ) : (
          /* Buscar: titulo, input y catalogo. El bloque de arriba baja
             respecto del boton Cerrar para que no queden pegados. */
          <View style={styles.flex}>
            <View style={styles.searchHeader}>
              <LumeText rol="title">Agregar ejercicio</LumeText>

              <View style={[styles.searchField, { backgroundColor: t.surfaceInset, borderColor: t.glassLine }]}>
                <Icon name="search" size={18} strokeWidth={1.75} color={t.textTertiary} />
                <TextInput
                  style={[styles.input, { color: t.textPrimary }]}
                  placeholder="Buscá por nombre o músculo"
                  placeholderTextColor={t.textTertiary}
                  selectionColor={t.signal}
                  cursorColor={t.signal}
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
                    <Icon name="x" size={18} strokeWidth={1.75} color={t.textTertiary} />
                  </Pressable>
                )}
              </View>

              {/* Filtro por tipo o por grupo muscular: uno a la vez, como un
                 radio. Tocar el activo lo suelta y vuelve a Todos. Los tipos
                 llevan su icono, que al elegirlos pasa a ser una marca: asi la
                 seleccion no depende solo del color. */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.chipsScroll}
                contentContainerStyle={styles.chipsFiltro}
              >
                <Tag
                  selectable
                  selected={grupo === null && tipo === null}
                  onPress={() => filtrarGrupo(null)}
                  accessibilityLabel={`Todos, ${catalog.length} ejercicios`}
                  style={styles.chipFiltro}
                >
                  Todos <Text style={styles.chipConteo}>{catalog.length}</Text>
                </Tag>
                {tipos.map(({ kind, count }) => (
                  <Tag
                    key={kind}
                    selectable
                    selected={tipo === kind}
                    icon={tipo === kind ? 'check' : TIPOS[kind].icon}
                    onPress={() => filtrarTipo(kind)}
                    accessibilityLabel={`${TIPOS[kind].label}, ${count} ejercicios`}
                    style={styles.chipFiltro}
                  >
                    {TIPOS[kind].label} <Text style={styles.chipConteo}>{count}</Text>
                  </Tag>
                ))}
                {grupos.map(({ group, count }) => (
                  <Tag
                    key={group.slug}
                    selectable
                    selected={grupo === group.slug}
                    onPress={() => filtrarGrupo(group.slug)}
                    accessibilityLabel={`${group.name}, ${count} ejercicios`}
                    style={styles.chipFiltro}
                  >
                    {group.name} <Text style={styles.chipConteo}>{count}</Text>
                  </Tag>
                ))}
              </ScrollView>

              {!catalogLoading && (
                <LumeText rol="label" color={t.textTertiary}>
                  {results.length} {results.length === 1 ? 'ejercicio' : 'ejercicios'}
                  {filtroActivo ? ` · ${filtroActivo}` : ''}
                </LumeText>
              )}
            </View>

            {/* Sin texto la lista trae el catalogo entero, asi que va
               virtualizada: montar 198 filas de una vez es caro. */}
            {catalogLoading ? (
              <View style={styles.resultsHint}>
                <Cargando />
              </View>
            ) : (
              /* Las filas se funden arriba con una mascara, no con un degradado
                 al color de fondo: debajo hay luces, no un color plano. */
              <MaskedView
                style={styles.listWrap}
                maskElement={
                  <View style={styles.flex}>
                    <LinearGradient colors={[MASCARA_VACIA, MASCARA_LLENA]} style={styles.fundido} />
                    <View style={[styles.flex, { backgroundColor: MASCARA_LLENA }]} />
                  </View>
                }
              >
                {/* Sin transicion de layout en las celdas: la de Reanimated
                   (itemLayoutAnimation) choca con la virtualizacion y, al
                   filtrar o al desplegar y plegar una fila, deja celdas en
                   posiciones viejas, encimadas sobre sus vecinas. */}
                <FlatList
                  data={results}
                  keyExtractor={keyExtractor}
                  renderItem={renderResult}
                  extraData={abierta}
                  contentContainerStyle={styles.resultsList}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="interactive"
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.resultsHint}>
                      <LumeText rol="bodySm" color={t.textTertiary} style={styles.centerText}>
                        No hay ejercicios que coincidan. Probá con otro nombre o sacá el filtro.
                      </LumeText>
                    </View>
                  }
                />
              </MaskedView>
            )}
          </View>
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

interface FilaCatalogoProps {
  exercise: Exercise;
  abierta: boolean;
  onToggle: (id: string) => void;
  onAdd: (exercise: Exercise) => void;
}

/** Fila del catalogo. Plegada: nombre en una linea y musculo objetivo.
 *  Desplegada: nombre completo, musculos (el objetivo con punto) y
 *  equipamiento, y el boton que pasa a configurarlo; sube a vidrio fuerte.
 *  Lo tocable es la cabecera, no la fila entera: un boton adentro de otro es
 *  HTML invalido en web, y en iOS VoiceOver agrupa la fila en un solo
 *  elemento y el boton Anadir queda inalcanzable. */
const FilaCatalogo = React.memo(function FilaCatalogo({
  exercise,
  abierta,
  onToggle,
  onAdd,
}: FilaCatalogoProps) {
  const { t, sombras } = useLume();
  const equipo = equipmentLabel(exercise.equipment);
  // La fuerza es casi todo el catalogo: su tipo no se anuncia en cada fila.
  // Los demas si, porque cambian lo que se carga en la sesion.
  const tipo = exercise.kind === 'fuerza' ? null : TIPOS[exercise.kind];

  return (
    <View
      style={[
        styles.fila,
        { borderBottomColor: t.divider },
        abierta && [
          styles.filaAbierta,
          {
            backgroundColor: t.surfaceCardElevated,
            borderColor: t.glassLine,
            borderTopColor: t.glassHighlight,
            boxShadow: sombras.glass,
          },
        ],
      ]}
    >
      <Pressable
        onPress={() => onToggle(exercise.id)}
        accessibilityRole="button"
        accessibilityState={{ expanded: abierta }}
        accessibilityLabel={[exercise.name, exercise.primary?.name, tipo?.label].filter(Boolean).join(', ')}
        style={({ pressed }) => [
          styles.filaCabeza,
          abierta && styles.filaCabezaAbierta,
          pressed && !abierta && styles.filaPresionada,
        ]}
      >
        <View style={styles.filaPrincipal}>
          <LumeText rol="body" style={styles.filaNombre} numberOfLines={abierta ? undefined : 1}>
            {exercise.name}
          </LumeText>
          {tipo && !abierta ? (
            <ExerciseTypeTag label={tipo.label} icon={tipo.icon} metrics={datosAbreviados(exercise.tracks)} />
          ) : null}
        </View>
        {!abierta && exercise.primary && (
          <LumeText rol="bodySm" color={t.textTertiary} style={styles.filaMusculo} numberOfLines={1}>
            {exercise.primary.name}
          </LumeText>
        )}
        <Icon
          name={abierta ? 'chevron-up' : 'chevron-down'}
          size={18}
          strokeWidth={1.75}
          color={t.textTertiary}
        />
      </Pressable>

      {abierta && (
        <Animated.View entering={FadeIn.duration(lumeMotion.durBase)} style={styles.filaDetalle}>
          <View style={styles.filaMeta}>
            <View style={styles.filaMusculos}>
              {exercise.primary && <Tag dot>{exercise.primary.name}</Tag>}
              {exercise.secondary.map((m) => (
                <Tag key={m.slug}>{m.name}</Tag>
              ))}
            </View>
            {equipo && (
              <LumeText rol="bodySm" color={t.textTertiary}>
                {equipo}
              </LumeText>
            )}
          </View>
          <LumeButton variant="primary" size="md" icon="plus" fullWidth onPress={() => onAdd(exercise)}>
            Añadir
          </LumeButton>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  // El marco del modal: margen de pantalla a los costados.
  cuerpo: { flex: 1, paddingHorizontal: lumeLayout.padScreen, paddingTop: lumeSpace[3] },
  // Caja del nombre dentro de una fila: ocupa lo que dejan los iconos.
  nombre: { flex: 1, minWidth: 0, gap: lumeSpace[3] },

  centerText: { textAlign: 'center' },
  input: { flex: 1, fontFamily: lumeFuente.regular, fontSize: 16, padding: 0 },
  nav: { paddingHorizontal: lumeLayout.padScreen, paddingTop: lumeSpace[4], paddingBottom: lumeSpace[5] },

  // El boton ghost trae su propio padding: el margen lo corre 10 px a la
  // izquierda para que el icono quede alineado con el borde del contenido.
  modalHeader: { flexDirection: 'row', alignItems: 'center', minHeight: 40, marginLeft: -10 },
  // Titulo e input separados del boton Cerrar, que queda solo arriba.
  searchHeader: { paddingTop: lumeSpace[5], gap: lumeSpace[5] },
  modalBody: { paddingTop: lumeSpace[6], paddingBottom: lumeSpace[6], gap: lumeSpace[8] },

  elegido: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4], padding: lumeSpace[5] },

  par: { flexDirection: 'row', gap: lumeSpace[3] },
  parItem: { flex: 1, minWidth: 0 },

  campoBloque: { gap: lumeSpace[3] },
  cardioCampos: { gap: lumeSpace[5] },
  captionFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  campoSeparado: { marginTop: lumeSpace[4] },
  campoToque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    height: 60,
    paddingHorizontal: lumeSpace[5],
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
  },
  campoTexto: { flex: 1 },
  campoValor: { fontSize: 30, lineHeight: 34, letterSpacing: -0.6 },

  hojaTitulo: { gap: lumeSpace[3] },

  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    paddingHorizontal: lumeSpace[4],
    height: lumeLayout.controlHMd,
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
  },

  // Los chips corren de borde a borde de la pantalla: el scroll anula el
  // padding del contenedor y lo repone adentro.
  chipsScroll: { marginHorizontal: -lumeLayout.padScreen, flexGrow: 0 },
  chipsFiltro: { paddingHorizontal: lumeLayout.padScreen, gap: lumeSpace[2] },
  chipFiltro: { height: lumeLayout.controlHSm },
  // Sin color propio: hereda el del chip (relleno si esta activo).
  chipConteo: { fontFamily: lumeFuente.medium, fontSize: 11, opacity: 0.6, fontVariant: ['tabular-nums'] },
  // La lista va de borde a borde y repone el margen en su contenido: si no,
  // el scroll recorta el fondo de la fila desplegada, que se sale del texto.
  listWrap: { flex: 1, marginHorizontal: -lumeLayout.padScreen },
  fundido: { height: lumeSpace[7] },
  // El padding de arriba iguala la altura del fundido: en reposo la primera
  // fila se ve entera, y al scrollear las filas se funden ahi en vez de
  // cortarse pegadas al buscador.
  resultsList: {
    paddingTop: lumeSpace[7],
    paddingBottom: lumeSpace[6],
    paddingHorizontal: lumeLayout.padScreen,
  },
  resultsHint: { paddingVertical: lumeSpace[8], alignItems: 'center' },

  // Filas planas con divisor. Desplegada sube a vidrio fuerte; el margen
  // negativo compensa su padding para que el texto no se corra. El alto lo da
  // la cabecera, asi toda la fila plegada responde al toque.
  fila: { borderBottomWidth: 1 },
  filaAbierta: {
    marginHorizontal: -lumeSpace[4],
    marginVertical: lumeSpace[2],
    paddingHorizontal: lumeSpace[4],
    paddingBottom: lumeSpace[5],
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
  },
  filaPresionada: { opacity: 0.6 },
  filaCabeza: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4], paddingVertical: 14 },
  filaCabezaAbierta: { paddingVertical: lumeSpace[5] },
  filaPrincipal: { flex: 1, minWidth: 0, gap: 5 },
  filaNombre: { fontFamily: lumeFuente.medium, lineHeight: 22 },
  filaMusculo: { maxWidth: 104, fontSize: 13, lineHeight: 18, textAlign: 'right' },
  filaDetalle: { gap: lumeSpace[5] },
  filaMeta: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4] },
  filaMusculos: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: lumeSpace[3] },
});
