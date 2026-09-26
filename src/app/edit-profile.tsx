/* Frencia · Editar perfil.
   Precarga los datos guardados y permite actualizarlos. Ningun campo es
   obligatorio: los vacios se persisten como null. Guardar se habilita solo
   cuando algo cambio. Salir con cambios sin guardar (Atras, Cancelar o el
   gesto) pide confirmar antes de descartarlos. */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { edadAFechaNacimiento, fechaNacimientoAEdad } from '@/lib/edad';
import { mostrarAltura } from '@/lib/altura';
import { mostrarPeso } from '@/lib/peso';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { useDescartarAlSalir } from '@/lib/descartar-al-salir';
import { MeasurePicker } from '@/components/MeasurePicker';

import {
  Button,
  FrenciaText,
  Icon,
  SegmentedControl,
  useColors,
  useThemedStyles,
  radius,
  sans,
  sizing,
  space,
  spacing,
  type Palette,
} from '@/design';

// Opciones de sexo: el value coincide con los permitidos en la tabla profiles.
const SEXO_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

// Firma de lo que se persiste, para saber si hay cambios sin guardar.
function firma(campos: string[]): string {
  return JSON.stringify(campos.map((c) => c.trim()));
}

export default function EditProfileScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { profile, refresh, savePreferencias } = useProfile();
  const { showToast } = useToast();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // Mientras traemos el perfil mostramos un spinner para tapar la demora inicial.
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  // Firma de los datos tal como se cargaron. null hasta terminar la carga.
  const [original, setOriginal] = useState<string | null>(null);
  // Rueda de altura/peso: misma experiencia que el setup inicial. `draft`
  // guarda el valor canonico (cm o kg) mientras la rueda esta abierta. La
  // unidad sale del contexto: la rueda abre en la preferida y cambiarla ahi
  // es lo mismo que tocar el switch del perfil, vale para toda la app.
  const [picker, setPicker] = useState<null | 'age' | 'height' | 'weight'>(null);
  const [draft, setDraft] = useState(0);
  const unidadAltura = profile?.unidadAltura ?? 'cm';
  const unidadPeso = profile?.unidadPeso ?? 'kg';

  function openPicker(kind: 'age' | 'height' | 'weight') {
    const source = kind === 'age' ? edad : kind === 'height' ? altura : peso;
    setDraft(Number(source) || 0);
    setPicker(kind);
  }

  function confirmPicker() {
    if (picker === 'age') setEdad(String(draft));
    else if (picker === 'height') setAltura(String(draft));
    else if (picker === 'weight') setPeso(String(draft));
    setPicker(null);
  }

  // El toggle de la rueda cambia la preferencia global. Se persiste al toque,
  // no con Guardar: es un ajuste, no un dato del perfil.
  async function cambiarUnidad(unit: 'metric' | 'imperial') {
    const ok = await savePreferencias(
      picker === 'height'
        ? { unidadAltura: unit === 'imperial' ? 'ft' : 'cm' }
        : { unidadPeso: unit === 'imperial' ? 'lb' : 'kg' },
    );
    if (!ok) showToast({ message: 'No pudimos guardar la unidad. Proba de nuevo.', type: 'error' });
  }

  // Traemos los datos ya guardados para precompletar los inputs al editar.
  useEffect(() => {
    let activo = true;

    async function cargarPerfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (activo) setCargandoPerfil(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('name, surname, fecha_nacimiento, sexo, altura, peso')
        .eq('id', user.id)
        .single();

      if (!activo) return;

      const edadCalc = data ? fechaNacimientoAEdad(data.fecha_nacimiento) : null;
      const cargados = [
        data?.name ?? '',
        data?.surname ?? '',
        edadCalc != null ? String(edadCalc) : '',
        data?.sexo ?? '',
        data?.altura != null ? String(data.altura) : '',
        data?.peso != null ? String(data.peso) : '',
      ];
      const [n, a, e, sx, al, p] = cargados;
      setNombre(n);
      setApellido(a);
      setEdad(e);
      setSexo(sx);
      setAltura(al);
      setPeso(p);
      setOriginal(firma(cargados));
      setCargandoPerfil(false);
    }

    cargarPerfil();
    return () => {
      activo = false;
    };
  }, []);

  // Ningun campo es obligatorio: validamos solo el formato de lo que se completa.
  const edadNum = Number(edad);
  const alturaNum = Number(altura);
  const pesoNum = Number(peso);

  const edadValida =
    edad.trim() === '' || (Number.isInteger(edadNum) && edadNum >= 0 && edadNum <= 150);
  const alturaValida = altura.trim() === '' || (Number.isFinite(alturaNum) && alturaNum > 0);
  const pesoValida = peso.trim() === '' || (Number.isFinite(pesoNum) && pesoNum > 0);

  const sucio =
    original !== null && firma([nombre, apellido, edad, sexo, altura, peso]) !== original;
  // Guardar se habilita solo si algo cambio y lo cargado tiene formato valido.
  const canSubmit = sucio && edadValida && alturaValida && pesoValida;

  const salir = useDescartarAlSalir({
    sucio,
    ocupado: loading,
    mensaje: 'Lo que editaste en tu perfil se va a perder.',
    respaldo: '/profile',
  });

  async function handleSave() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setErrorMsg('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setErrorMsg('No pudimos identificar tu sesión. Volvé a ingresar.');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name: nombre.trim() === '' ? null : nombre.trim(),
        surname: apellido.trim() === '' ? null : apellido.trim(),
        fecha_nacimiento: edad.trim() === '' ? null : edadAFechaNacimiento(edadNum),
        sexo: SEXO_OPTIONS.some((o) => o.value === sexo) ? sexo : null,
        altura: altura.trim() === '' ? null : alturaNum,
        peso: peso.trim() === '' ? null : pesoNum,
      })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      setErrorMsg('No pudimos guardar tu perfil. Proba de nuevo.');
      return;
    }

    // Releemos el perfil compartido, avisamos con un toast y volvemos al perfil.
    await refresh();
    showToast({ message: 'Perfil actualizado', type: 'success' });
    salir({ sinPreguntar: true });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.backBtn}>
        <Button variant="ghost" size="sm" icon="chevron-left" onPress={() => salir()} disabled={loading}>
          Atrás
        </Button>
      </View>
      {cargandoPerfil ? (
        <View style={styles.spinnerWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Form */}
          <View style={styles.form}>
            <FrenciaText role="title" style={styles.heading}>
              Editar perfil
            </FrenciaText>
            <FrenciaText role="bodySm" color={colors.textSecondary}>
              Cambiá los datos de los campos para actualizarlos.
            </FrenciaText>

            <View style={styles.fields}>
              <TextEntryField
                label="Nombre"
                icon="user"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Tu nombre"
              />
              <TextEntryField
                label="Apellido"
                icon="user"
                value={apellido}
                onChangeText={setApellido}
                placeholder="Tu apellido"
              />

              <View style={styles.segGroup}>
                <FrenciaText role="dataLabel" color={colors.textTertiary}>
                  Sexo
                </FrenciaText>
                <SegmentedControl
                  fullWidth
                  options={SEXO_OPTIONS}
                  value={sexo}
                  onChange={setSexo}
                />
              </View>

              <SelectField
                label="Edad"
                icon="calendar"
                value={edad ? `${edad} años` : ''}
                placeholder="Elegí tu edad"
                onPress={() => openPicker('age')}
              />

              {/* Guardado en cm y kg; se muestra en la unidad preferida. */}
              <SelectField
                label="Altura"
                icon="trending-up"
                value={altura ? mostrarAltura(alturaNum, unidadAltura) : ''}
                placeholder="Elegí tu altura"
                onPress={() => openPicker('height')}
              />
              <SelectField
                label="Peso"
                icon="target"
                value={peso ? `${mostrarPeso(pesoNum, unidadPeso)} ${unidadPeso}` : ''}
                placeholder="Elegí tu peso"
                onPress={() => openPicker('weight')}
              />
            </View>

            {errorMsg ? (
              <FrenciaText role="bodySm" color={colors.dangerText}>
                {errorMsg}
              </FrenciaText>
            ) : null}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              iconRight="arrow-right"
              disabled={!canSubmit}
              loading={loading}
              onPress={handleSave}
            >
              Guardar
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              icon="x"
              disabled={loading}
              onPress={() => salir()}
              style={styles.cancelar}
            >
              Cancelar
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      )}

      {/* Rueda de altura/peso, reciclando la del setup inicial */}
      <Modal
        visible={picker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPicker(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPicker(null)} />
        <View style={styles.sheet}>
          <FrenciaText role="title" style={styles.sheetTitle}>
            {picker === 'age' ? 'Tu edad' : picker === 'height' ? 'Tu altura' : 'Tu peso'}
          </FrenciaText>
          {picker !== null ? (
            <MeasurePicker
              kind={picker}
              initial={draft}
              onChange={setDraft}
              initialUnit={
                picker === 'height'
                  ? unidadAltura === 'ft' ? 'imperial' : 'metric'
                  : picker === 'weight'
                    ? unidadPeso === 'lb' ? 'imperial' : 'metric'
                    : 'metric'
              }
              onUnitChange={picker === 'age' ? undefined : cambiarUnidad}
            />
          ) : null}
          <Button variant="primary" size="lg" fullWidth onPress={confirmPicker}>
            Listo
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ── Campo de texto: nombre y apellido se escriben a teclado ─── */
interface TextEntryFieldProps {
  icon: string;
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (t: string) => void;
}

function TextEntryField({ icon, label, value, placeholder, onChangeText }: TextEntryFieldProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.fieldGroup}>
      <FrenciaText role="dataLabel" color={colors.textTertiary}>
        {label}
      </FrenciaText>
      <View style={styles.field}>
        <Icon name={icon} size={20} color={colors.textTertiary} />
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
          autoComplete="off"
          maxLength={40}
        />
      </View>
    </View>
  );
}

/* ── Campo de seleccion: abre la rueda en vez de teclado ─────── */
interface SelectFieldProps {
  icon: string;
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}

function SelectField({ icon, label, value, placeholder, onPress }: SelectFieldProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.fieldGroup}>
      <FrenciaText role="dataLabel" color={colors.textTertiary}>
        {label}
      </FrenciaText>
      <Pressable
        style={styles.field}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
      >
        <Icon name={icon} size={20} color={colors.textTertiary} />
        <FrenciaText
          role="bodySm"
          color={value ? colors.textPrimary : colors.textTertiary}
          style={styles.selectValue}
        >
          {value || placeholder}
        </FrenciaText>
        <Icon name="chevron-right" size={20} color={colors.textTertiary} />
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgApp },
  flex: { flex: 1 },
  spinnerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // Envuelve el Button de Atras: da el margen de pantalla y el aire.
  backBtn: {
    flexDirection: 'row',
    paddingHorizontal: spacing.padScreen,
    paddingTop: space[9],
    paddingBottom: space[5],
  },
  // paddingTop: aire entre Atras y el titulo cuando el form llena la pantalla
  // y deja de estar centrado.
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.padScreen,
    paddingTop: space[6],
    paddingBottom: space[8],
    justifyContent: 'center',
    gap: space[10],
  },

  // Form
  form: { gap: space[5] },
  heading: { marginBottom: -space[3] },
  // El form separa bloques con gap 5; Cancelar va pegado a Guardar.
  cancelar: { marginTop: -space[3] },
  fields: { gap: space[4], marginTop: space[2] },
  segGroup: { gap: space[2] },
  fieldGroup: { gap: space[2] },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    height: sizing.controlHLg,
    paddingHorizontal: spacing.padControl,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  selectValue: { flex: 1 },
  textInput: { flex: 1, fontFamily: sans.regular, fontSize: 16, color: colors.textPrimary, padding: 0 },

  // Sheet de la rueda
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  sheet: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingHorizontal: spacing.padScreen,
    paddingTop: space[6],
    paddingBottom: space[10],
    gap: space[6],
  },
  sheetTitle: { textAlign: 'center' },
});
