/* Frencia · Onboarding — completar el perfil tras el primer login.
   Espeja el login/registro. "Cada serie cuenta." */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
  colors,
  radius,
  sans,
  shadow,
  sizing,
  space,
  spacing,
} from '@/design';

interface OnboardingScreenProps {
  userName?: string;
  onComplete?: () => void;
}

// Opciones de sexo: el value coincide con los permitidos en la tabla profiles.
const SEXO_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

export default function OnboardingScreen({ userName, onComplete }: OnboardingScreenProps) {
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Validaciones acordes a las restricciones de la tabla profiles.
  const edadNum = Number(edad);
  const alturaNum = Number(altura);
  const pesoNum = Number(peso);

  const edadValida = edad.trim() !== '' && Number.isInteger(edadNum) && edadNum >= 0 && edadNum <= 150;
  const sexoValido = SEXO_OPTIONS.some((o) => o.value === sexo);
  const alturaValida = altura.trim() !== '' && Number.isFinite(alturaNum) && alturaNum > 0;
  const pesoValido = peso.trim() !== '' && Number.isFinite(pesoNum) && pesoNum > 0;

  const canSubmit = edadValida && sexoValido && alturaValida && pesoValido;

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
        edad: edadNum,
        sexo,
        altura: alturaNum,
        peso: pesoNum,
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
              Completá tu perfil
            </FrenciaText>
            <FrenciaText role="bodySm" color={colors.textSecondary}>
              {userName
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
              Guardar y continuar
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ── Campo de texto con icono, focus de acento ───────────────── */
interface FieldProps extends TextInputProps {
  icon: string;
  trailing?: React.ReactNode;
}

function Field({ icon, trailing, ...rest }: FieldProps) {
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgApp },
  flex: { flex: 1 },
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
