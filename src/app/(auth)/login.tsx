/* Frencia · Login — pantalla de acceso (Lume).
   Fondo flanco animado: la luz entra por el borde derecho y deja libre el
   formulario, alineado a la izquierda. El campo en foco toma el borde de
   lume; Ingresar queda deshabilitado hasta tener correo y una contraseña de
   6 o mas. "Cada serie cuenta." */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { signInWithProvider, type OAuthProvider } from '@/lib/oauth';
import { AvisoTerminos, BotonesSociales, Divisor, Enlace, Entrando, Marca, PieEnlace } from '@/components/Acceso';

import { Icon } from '@/design';
import { Campo, Fondo, LumeButton, LumeText, lumeLayout, lumeSpace, useLume } from '@/design/lume';

export default function LoginScreen() {
  const { t } = useLume();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  // Credenciales validadas: tapamos la pantalla con el spinner hasta que el
  // gate del layout raiz navegue a setup u home.
  const [entering, setEntering] = useState(false);

  const canSubmit = email.trim().length > 3 && password.length >= 6;

  // Tras un login exitoso no navegamos a mano: el gate del layout raiz
  // detecta la nueva sesion y decide entre setup (perfil incompleto) y home.
  async function handleLogin() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      // El servidor puede fallar por credenciales (400) o por un problema
      // temporal de conexion/servidor (500, timeout, proyecto despertando de
      // una pausa). En ese segundo caso el SDK a veces deja la sesion creada
      // igual: confirmamos antes de culpar a la contraseña, asi no mostramos
      // un error falso mientras el gate ya esta por redirigir.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setEntering(true);
        return;
      }

      const credencialesInvalidas =
        error.status === 400 || /invalid login credentials/i.test(error.message);
      setErrorMsg(
        credencialesInvalidas
          ? 'Correo o contraseña incorrectos.'
          : 'No pudimos conectar con el servidor. Probá de nuevo en unos segundos.',
      );
      return;
    }

    setEntering(true);
  }

  async function handleOAuth(provider: OAuthProvider) {
    if (oauthLoading) return;
    setOauthLoading(provider);
    setErrorMsg('');
    // El navegador tapa la app durante el flujo; al volver, el spinner cubre
    // el hueco hasta que el gate redirija.
    setEntering(true);

    const { error } = await signInWithProvider(provider);

    setOauthLoading(null);

    if (error) {
      setEntering(false);
      setErrorMsg('No pudimos ingresar con ese proveedor. Probá de nuevo.');
    }
  }

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="flanco" animado />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + lumeSpace[7] },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Marca />

          <View style={styles.form}>
            <LumeText rol="title" accessibilityRole="header" style={styles.titulo}>
              Entrá a tu cuenta
            </LumeText>
            <LumeText rol="bodySm" color={t.textSecondary}>
              Seguí registrando cada serie donde la dejaste.
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
              />
              <Campo
                icono="lock"
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoComplete="password"
                onSubmitEditing={handleLogin}
                final={
                  <Pressable
                    hitSlop={10}
                    onPress={() => setShowPass((s) => !s)}
                    accessibilityRole="button"
                    accessibilityLabel={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <Icon name={showPass ? 'eye-off' : 'eye'} size={20} color={t.textTertiary} strokeWidth={1.75} />
                  </Pressable>
                }
              />
            </View>

            <View style={styles.olvido}>
              <Enlace onPress={() => router.push({ pathname: '/forgot-password', params: { email: email.trim() } })}>
                ¿Olvidaste tu contraseña?
              </Enlace>
            </View>

            <LumeButton
              variant="primary"
              size="lg"
              fullWidth
              iconRight="arrow-right"
              disabled={!canSubmit}
              loading={loading}
              onPress={handleLogin}
            >
              Ingresar
            </LumeButton>

            {errorMsg ? (
              <LumeText rol="bodySm" color={t.dangerText} accessibilityLiveRegion="polite">
                {errorMsg}
              </LumeText>
            ) : null}

            <Divisor texto="o continuá con" />
            <BotonesSociales cargando={oauthLoading} onPress={handleOAuth} />
            <AvisoTerminos />
          </View>

          <View style={styles.pie}>
            <PieEnlace pregunta="¿No tenés cuenta?" enlace="Creá una" onPress={() => router.push('/register')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {entering ? <Entrando /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  flex: { flex: 1 },
  // La marca y el formulario van arriba; el pie baja al borde inferior y el
  // espacio que sobra queda entre los botones y el pie.
  scroll: {
    flexGrow: 1,
    paddingHorizontal: lumeLayout.padScreen,
  },
  form: { gap: lumeSpace[5] },
  pie: { marginTop: 'auto', paddingTop: lumeSpace[7] },
  titulo: { marginBottom: -lumeSpace[3] },
  campos: { gap: lumeSpace[3], marginTop: lumeSpace[3] },
  olvido: { alignSelf: 'flex-end', marginTop: -lumeSpace[2] },
});
