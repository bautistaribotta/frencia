/* Frencia · Registro — crear cuenta nueva (Lume).
   Espeja el login: misma marca, mismo fondo flanco animado y el formulario
   alineado a la izquierda. Si el correo ya tiene cuenta, ofrece recuperar la
   contraseña en el mismo lugar. "Empezá a registrar cada serie." */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { signInWithProvider, type OAuthProvider } from '@/lib/oauth';
import { AvisoTerminos, BotonesSociales, Divisor, Enlace, Marca, PieEnlace } from '@/components/Acceso';

import { Icon } from '@/design';
import { Campo, Fondo, LumeButton, LumeText, lumeLayout, lumeSpace, useLume } from '@/design/lume';

export default function RegisterScreen() {
  const { t } = useLume();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  // Supabase responde "User already registered" cuando el email ya tiene
  // cuenta. Lo mostramos en castellano y ofrecemos recuperar la contraseña.
  const [emailTaken, setEmailTaken] = useState(false);

  const passwordsMatch = password.length >= 6 && password === confirm;
  const canSubmit = name.trim().length > 1 && email.trim().length > 3 && passwordsMatch;

  function goToLogin() {
    // Vuelve al login dentro del stack de auth.
    if (router.canGoBack()) router.back();
    else router.replace('/login');
  }

  async function handleRegister() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setErrorMsg('');
    setEmailTaken(false);

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
      if (/already registered/i.test(error.message)) {
        setEmailTaken(true);
        setErrorMsg('Email ya registrado.');
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    // Cuenta creada: por ahora cerramos la sesion (si la hubiera) y
    // volvemos al login. Mas adelante usaremos confirmacion por email.
    await supabase.auth.signOut();
    goToLogin();
  }

  // Registrarse con un proveedor es la misma operacion que iniciar sesion: si
  // el usuario no existe, el proveedor lo crea. Tras el exito no navegamos a
  // mano; el gate del layout raiz detecta la sesion y decide setup vs home.
  async function handleOAuth(provider: OAuthProvider) {
    if (oauthLoading) return;
    setOauthLoading(provider);
    setErrorMsg('');
    setEmailTaken(false);

    const { error } = await signInWithProvider(provider);

    setOauthLoading(null);

    if (error) setErrorMsg('No pudimos continuar con ese proveedor. Probá de nuevo.');
  }

  const ojo = (
    <Pressable
      hitSlop={10}
      onPress={() => setShowPass((s) => !s)}
      accessibilityRole="button"
      accessibilityLabel={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      <Icon name={showPass ? 'eye-off' : 'eye'} size={20} color={t.textTertiary} strokeWidth={1.75} />
    </Pressable>
  );

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
              Creá tu cuenta
            </LumeText>
            <LumeText rol="bodySm" color={t.textSecondary}>
              Empezá a registrar cada serie desde hoy.
            </LumeText>

            <View style={styles.campos}>
              <Campo
                icono="user"
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
              <Campo
                icono="mail"
                placeholder="Correo electrónico"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setEmailTaken(false);
                }}
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
                autoComplete="password-new"
                final={ojo}
              />
              <Campo
                icono="lock"
                placeholder="Repetí la contraseña"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoComplete="password-new"
                onSubmitEditing={handleRegister}
              />
            </View>

            {confirm.length > 0 && !passwordsMatch ? (
              <LumeText rol="bodySm" color={t.dangerText}>
                Las contraseñas no coinciden.
              </LumeText>
            ) : null}

            {errorMsg ? (
              <LumeText rol="bodySm" color={t.dangerText} accessibilityLiveRegion="polite">
                {errorMsg}
              </LumeText>
            ) : null}

            {emailTaken ? (
              <View style={styles.izquierda}>
                <Enlace onPress={() => router.push({ pathname: '/forgot-password', params: { email: email.trim() } })}>
                  ¿Olvidaste tu contraseña?
                </Enlace>
              </View>
            ) : null}

            <LumeButton
              variant="primary"
              size="lg"
              fullWidth
              iconRight="arrow-right"
              disabled={!canSubmit}
              loading={loading}
              onPress={handleRegister}
            >
              Crear cuenta
            </LumeButton>

            <Divisor texto="o registrate con" />
            <BotonesSociales cargando={oauthLoading} onPress={handleOAuth} />
            <AvisoTerminos />
          </View>

          <View style={styles.pie}>
            <PieEnlace pregunta="¿Ya tenés cuenta?" enlace="Iniciá sesión" onPress={goToLogin} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  izquierda: { alignSelf: 'flex-start' },
});
