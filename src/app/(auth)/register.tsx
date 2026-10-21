/* Frencia · Registro — crear cuenta nueva (Lume).
   Espeja el login: misma marca, mismo fondo flanco animado y el formulario
   alineado a la izquierda. Si el correo ya tiene cuenta, ofrece recuperar la
   contraseña en el mismo lugar. "Empezá a registrar cada serie." */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { signInWithProvider, type OAuthProvider } from '@/lib/oauth';
import {
  AvisoTerminos,
  BotonOjo,
  BotonesSociales,
  CamposAcceso,
  Divisor,
  Enlace,
  ErrorAcceso,
  FormularioAcceso,
  Marca,
  PantallaAcceso,
  PieEnlace,
} from '@/components/Acceso';

import { Campo, LumeButton } from '@/design/lume';

export default function RegisterScreen() {
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

  return (
    <PantallaAcceso>
      <Marca />

      <FormularioAcceso titulo="Creá tu cuenta" bajada="Empezá a registrar cada serie desde hoy.">
        <CamposAcceso>
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
            final={<BotonOjo visible={showPass} onToggle={() => setShowPass((s) => !s)} />}
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
        </CamposAcceso>

        <ErrorAcceso
          mensaje={confirm.length > 0 && !passwordsMatch ? 'Las contraseñas no coinciden.' : undefined}
          live={false}
        />

        <ErrorAcceso mensaje={errorMsg} />

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
      </FormularioAcceso>

      <PieEnlace alFondo pregunta="¿Ya tenés cuenta?" enlace="Iniciá sesión" onPress={goToLogin} />
    </PantallaAcceso>
  );
}

const styles = StyleSheet.create({
  izquierda: { alignSelf: 'flex-start' },
});
