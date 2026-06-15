/* Frencia · Registro — crear cuenta nueva.
   Espeja el login. "Empezá a registrar cada serie." */

import React, { useState } from 'react';
import {
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

import AppleLogo from '@/assets/icons/apple.svg';
import GoogleLogo from '@/assets/icons/google.svg';

import {
  Button,
  FrenciaText,
  Icon,
  colors,
  radius,
  sans,
  shadow,
  sizing,
  space,
  spacing,
  tracking,
} from '@/design';

interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const passwordsMatch = password.length >= 6 && password === confirm;
  const canSubmit =
    name.trim().length > 1 && email.trim().length > 3 && passwordsMatch;

  async function handleRegister() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // El trigger en Supabase guarda este nombre en la tabla profiles.
        data: { name: name.trim() },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // Cuenta creada: por ahora cerramos la sesion (si la hubiera) y
    // volvemos al login. Mas adelante usaremos confirmacion por email.
    await supabase.auth.signOut();
    onNavigateToLogin?.();
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
              Creá tu cuenta
            </FrenciaText>
            <FrenciaText role="bodySm" color={colors.textSecondary}>
              Empezá a registrar cada serie desde hoy.
            </FrenciaText>

            <View style={styles.fields}>
              <Field
                icon="user"
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
              <Field
                icon="mail"
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                inputMode="email"
              />
              <Field
                icon="lock"
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoComplete="password-new"
                trailing={
                  <Pressable
                    hitSlop={10}
                    onPress={() => setShowPass((s) => !s)}
                    accessibilityRole="button"
                    accessibilityLabel={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <Icon
                      name={showPass ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.textTertiary}
                    />
                  </Pressable>
                }
              />
              <Field
                icon="lock"
                placeholder="Repetí la contraseña"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoComplete="password-new"
              />
            </View>

            {confirm.length > 0 && !passwordsMatch ? (
              <FrenciaText role="bodySm" color={colors.dangerText}>
                Las contraseñas no coinciden.
              </FrenciaText>
            ) : null}

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
              onPress={handleRegister}
            >
              Crear cuenta
            </Button>

            {/* Divisor */}
            <View style={styles.divider}>
              <View style={styles.line} />
              <FrenciaText role="dataLabel" color={colors.textTertiary}>
                o registrate con
              </FrenciaText>
              <View style={styles.line} />
            </View>

            <View style={styles.social}>
              <Button
                variant="secondary"
                size="lg"
                leading={<AppleLogo width={20} height={20} />}
                style={styles.socialBtn}
              >
                Apple
              </Button>
              <Button
                variant="secondary"
                size="lg"
                leading={<GoogleLogo width={20} height={20} />}
                style={styles.socialBtn}
              >
                Google
              </Button>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <FrenciaText role="bodySm" color={colors.textSecondary}>
              ¿Ya tenés cuenta?{' '}
            </FrenciaText>
            <Pressable hitSlop={8} onPress={onNavigateToLogin}>
              <FrenciaText role="bodySm" color={colors.accentText} style={styles.footerLink}>
                Iniciá sesión
              </FrenciaText>
            </Pressable>
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

  // Divisor
  divider: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  line: { flex: 1, height: 1, backgroundColor: colors.divider },

  // Social
  social: { flexDirection: 'row', gap: space[4] },
  socialBtn: { flex: 1 },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerLink: { fontFamily: sans.semibold, letterSpacing: tracking.normal },
});
