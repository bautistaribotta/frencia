/* Frencia · Onboarding — completar el perfil tras el primer login.
   Espeja el login/registro. "Cada serie cuenta." */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

import {
  Button,
  FrenciaText,
  Icon,
  SegmentedControl,
  useColors,
  useThemedStyles,
  radius,
  sans,
  shadow,
  sizing,
  space,
  spacing,
  type Palette,
} from '@/design';

interface OnboardingScreenProps {
  userName?: string;
  onComplete?: () => void;
  // Si se provee, muestra un boton para cancelar la edicion y volver atras.
  onCancel?: () => void;
}

// Opciones de sexo: el value coincide con los permitidos en la tabla profiles.
const SEXO_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

export default function OnboardingScreen({ userName, onComplete, onCancel }: OnboardingScreenProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // Mientras traemos el perfil mostramos un spinner para tapar la demora inicial.
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // Modo edicion: hay un boton para cancelar y volver atras.
  const isEditing = !!onCancel;

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
        .select('edad, sexo, altura, peso')
        .eq('id', user.id)
        .single();

      if (!activo) return;

      if (data) {
        if (data.edad != null) setEdad(String(data.edad));
        if (data.sexo != null) setSexo(data.sexo);
        if (data.altura != null) setAltura(String(data.altura));
        if (data.peso != null) setPeso(String(data.peso));
      }
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

  // El boton esta siempre disponible salvo que algun dato cargado sea invalido.
  const canSubmit = edadValida && alturaValida && pesoValida;

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
        edad: edad.trim() === '' ? null : edadNum,
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

    onComplete?.();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {onCancel ? (
        <Pressable
          hitSlop={10}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancelar edicion"
          style={styles.backBtn}
        >
          <Icon name="chevron-left" size={24} color={colors.textPrimary} />
        </Pressable>
      ) : null}
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
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.brandRow}>
              <View style={styles.mark}>
                <Icon name="dumbbell" size={34} color={colors.textOnAccent} />
              </View>
              <View style={styles.brandText}>
                <FrenciaText role="display" style={styles.wordmark}>
                  FRENCIA
                </FrenciaText>
                <FrenciaText
                  role="dataLabel"
                  color={colors.accentText}
                  style={styles.tagline}
                >
                  Cada serie cuenta
                </FrenciaText>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <FrenciaText role="title" style={styles.heading}>
              {isEditing ? 'Editar perfil' : 'Completá tu perfil'}
            </FrenciaText>
            <FrenciaText role="bodySm" color={colors.textSecondary}>
              {isEditing
                ? 'Cambiá los datos de los campos para actualizarlos.'
                : userName
                  ? `Unos datos más, ${userName}, y arrancamos a entrenar.`
                  : 'Unos datos más y arrancamos a entrenar.'}
            </FrenciaText>

            <View style={styles.fields}>
              <Field
                icon="calendar"
                placeholder="Edad"
                value={edad}
                onChangeText={setEdad}
                keyboardType="numeric"
                inputMode="numeric"
                maxLength={3}
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

              <Field
                icon="trending-up"
                placeholder="Altura (cm)"
                value={altura}
                onChangeText={setAltura}
                keyboardType="numeric"
                inputMode="numeric"
                maxLength={3}
              />
              <Field
                icon="target"
                placeholder="Peso (kg)"
                value={peso}
                onChangeText={setPeso}
                keyboardType="numeric"
                inputMode="numeric"
                maxLength={6}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

/* ── Campo de texto con icono, focus de acento ───────────────── */
interface FieldProps extends TextInputProps {
  icon: string;
  trailing?: React.ReactNode;
}

function Field({ icon, trailing, ...rest }: FieldProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.field,
        focused && styles.fieldFocused,
      ]}
    >
      <Icon name={icon} size={20} color={focused ? colors.accent : colors.textTertiary} />
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textTertiary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {trailing}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgApp },
  flex: { flex: 1 },
  spinnerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute',
    top: space[4],
    left: space[4],
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.padScreen,
    paddingBottom: space[8],
    justifyContent: 'center',
    gap: space[10],
  },

  // Hero
  hero: { alignItems: 'center', gap: space[4] },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  mark: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.glowGreenSoft,
  },
  brandText: { height: 72, justifyContent: 'center' },
  wordmark: {
    color: colors.textPrimary,
    fontSize: 56,
    lineHeight: 72,
    includeFontPadding: false,
  },
  tagline: { marginTop: -space[2] },

  // Form
  form: { gap: space[5] },
  heading: { marginBottom: -space[3] },
  fields: { gap: space[4], marginTop: space[2] },
  segGroup: { gap: space[2] },
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
  fieldFocused: {
    borderColor: colors.surfaceGreenLine,
    backgroundColor: colors.surfaceCardElevated,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: sans.regular,
    fontSize: 16,
    padding: 0,
  },
});
