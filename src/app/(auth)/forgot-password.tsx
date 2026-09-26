/* Frencia · Recuperar contraseña — pedir el email y enviar el correo.
   Espeja el login. Primera etapa del flujo: la pantalla para escribir la
   contraseña nueva (tras el deep link) queda para mas adelante. */

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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { makeRedirectUri } from 'expo-auth-session';

import { supabase } from '@/lib/supabase';

import {
  Button,
  FrenciaText,
  Icon,
  useColors,
  useThemedStyles,
  radius,
  sans,
  sizing,
  space,
  spacing,
  tracking,
  type Palette,
} from '@/design';

// URL a la que vuelve el link del correo. Expo Go -> exp://... ;
// build nativo -> frencia://reset-password. Hay que darla de alta en
// Supabase (Authentication > URL Configuration > Redirect URLs).
const redirectTo = makeRedirectUri({ path: 'reset-password' });

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  // Login y registro pasan el email que el usuario ya tipeo.
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sent, setSent] = useState(false);

  const canSubmit = email.trim().length > 3;

  function goToLogin() {
    if (router.canGoBack()) router.back();
    else router.replace('/login');
  }

  async function handleSend() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      // Supabase limita la frecuencia de envio por email.
      const rateLimited = error.status === 429 || /rate limit/i.test(error.message);
      setErrorMsg(
        rateLimited
          ? 'Ya te enviamos un correo hace poco. Esperá un momento y probá de nuevo.'
          : 'No pudimos enviar el correo. Probá de nuevo.',
      );
      return;
    }

    setSent(true);
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
          {/* Atrás */}
          <View style={styles.back}>
            <Button variant="ghost" size="sm" icon="chevron-left" onPress={goToLogin}>
              Atrás
            </Button>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.mark}>
              <Icon name={sent ? 'check' : 'lock'} size={34} color={colors.textOnAccent} />
            </View>
          </View>

          {sent ? (
            /* Estado de exito: el form se reemplaza por el aviso. */
            <View style={styles.form}>
              <FrenciaText role="title" style={styles.heading}>
                Revisá tu correo
              </FrenciaText>
              <FrenciaText role="bodySm" color={colors.textSecondary}>
                Te enviamos un enlace a{' '}
                <FrenciaText role="bodySm" color={colors.textPrimary} style={styles.strong}>
                  {email.trim()}
                </FrenciaText>{' '}
                para que elijas una contraseña nueva. Si no lo ves, mirá en spam.
              </FrenciaText>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                iconRight="arrow-right"
                onPress={goToLogin}
              >
                Volver al inicio de sesión
              </Button>

              <View style={styles.footer}>
                <FrenciaText role="bodySm" color={colors.textSecondary}>
                  ¿No te llegó?{' '}
                </FrenciaText>
                <Pressable hitSlop={8} onPress={() => setSent(false)}>
                  <FrenciaText role="bodySm" color={colors.accentText} style={styles.footerLink}>
                    Reenviar
                  </FrenciaText>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.form}>
              <FrenciaText role="title" style={styles.heading}>
                Recuperá tu contraseña
              </FrenciaText>
              <FrenciaText role="bodySm" color={colors.textSecondary}>
                Escribí tu correo y te enviamos un enlace para elegir una nueva.
              </FrenciaText>

              <View style={styles.fields}>
                <Field
                  icon="mail"
                  placeholder="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  inputMode="email"
                  autoFocus={!params.email}
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
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
                onPress={handleSend}
              >
                Enviar enlace
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ── Campo de texto con icono, focus de acento ───────────────── */
interface FieldProps extends TextInputProps {
  icon: string;
}

function Field({ icon, ...rest }: FieldProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      <Icon name={icon} size={20} color={focused ? colors.accent : colors.textTertiary} />
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textTertiary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgApp },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.padScreen,
    paddingBottom: space[8],
    justifyContent: 'center',
    gap: space[10],
  },

  back: {
    position: 'absolute',
    top: space[4],
    left: spacing.padScreen,
  },

  // Hero
  hero: { alignItems: 'center' },
  mark: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Form
  form: { gap: space[5] },
  heading: { marginBottom: -space[3] },
  strong: { fontFamily: sans.semibold },
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

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerLink: { fontFamily: sans.semibold, letterSpacing: tracking.normal },
});
