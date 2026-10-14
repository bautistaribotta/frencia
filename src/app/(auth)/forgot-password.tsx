/* Frencia · Recuperar contraseña — pedir el email y enviar el correo (Lume).
   Espeja el login, con un sello de vidrio en lugar del icono de la app. Al
   enviar, el formulario se reemplaza por el aviso y el sello pasa a correo
   enviado. Primera etapa del flujo: la pantalla para escribir la contraseña
   nueva (tras el deep link) queda para mas adelante. */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { makeRedirectUri } from 'expo-auth-session';

import { supabase } from '@/lib/supabase';
import { PieEnlace } from '@/components/Acceso';

import { Icon } from '@/design';
import { Campo, Fondo, LumeButton, LumeText, Vidrio, lumeFuente, lumeLayout, lumeSpace, useLume } from '@/design/lume';

// URL a la que vuelve el link del correo. Expo Go -> exp://... ;
// build nativo -> frencia://reset-password. Hay que darla de alta en
// Supabase (Authentication > URL Configuration > Redirect URLs).
const redirectTo = makeRedirectUri({ path: 'reset-password' });

export default function ForgotPasswordScreen() {
  const { t } = useLume();
  const insets = useSafeAreaInsets();
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
    <View style={styles.pantalla}>
      <Fondo posicion="flanco" animado />

      <View style={[styles.atras, { top: insets.top + lumeSpace[3] }]}>
        <LumeButton variant="ghost" size="sm" icon="chevron-left" onPress={goToLogin}>
          Atrás
        </LumeButton>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + lumeSpace[11], paddingBottom: insets.bottom + lumeSpace[7] },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Vidrio radio={15} style={styles.sello}>
            <Icon name={sent ? 'mail-check' : 'key-round'} size={26} color={t.textPrimary} strokeWidth={1.75} />
          </Vidrio>

          {sent ? (
            <View style={styles.form}>
              <LumeText rol="title" accessibilityRole="header" style={styles.titulo}>
                Revisá tu correo
              </LumeText>
              <LumeText rol="bodySm" color={t.textSecondary}>
                Te enviamos un enlace a{' '}
                <LumeText rol="bodySm" style={styles.semi}>
                  {email.trim()}
                </LumeText>{' '}
                para que elijas una contraseña nueva. Si no lo ves, mirá en spam.
              </LumeText>
              <LumeButton variant="primary" size="lg" fullWidth iconRight="arrow-right" onPress={goToLogin}>
                Volver al inicio de sesión
              </LumeButton>
              <PieEnlace pregunta="¿No te llegó?" enlace="Reenviar" onPress={() => setSent(false)} />
            </View>
          ) : (
            <View style={styles.form}>
              <LumeText rol="title" accessibilityRole="header" style={styles.titulo}>
                Recuperá tu contraseña
              </LumeText>
              <LumeText rol="bodySm" color={t.textSecondary}>
                Escribí tu correo y te enviamos un enlace para elegir una nueva.
              </LumeText>

              <View style={styles.campos}>
                <Campo
                  icono="mail"
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
                <LumeText rol="bodySm" color={t.dangerText} accessibilityLiveRegion="polite">
                  {errorMsg}
                </LumeText>
              ) : null}

              <LumeButton
                variant="primary"
                size="lg"
                fullWidth
                iconRight="arrow-right"
                disabled={!canSubmit}
                loading={loading}
                onPress={handleSend}
              >
                Enviar enlace
              </LumeButton>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  flex: { flex: 1 },
  atras: { position: 'absolute', left: lumeLayout.padScreen - 10, zIndex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: lumeSpace[10],
    paddingHorizontal: lumeLayout.padScreen,
  },
  sello: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  form: { gap: lumeSpace[5] },
  titulo: { marginBottom: -lumeSpace[3] },
  campos: { gap: lumeSpace[3], marginTop: lumeSpace[3] },
  semi: { fontFamily: lumeFuente.semibold },
});
