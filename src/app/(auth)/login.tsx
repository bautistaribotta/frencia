/* Frencia · Login — pantalla de acceso (Lume).
   Fondo flanco animado: la luz entra por el borde derecho y deja libre el
   formulario, alineado a la izquierda. El campo en foco toma el borde de
   lume; Ingresar queda deshabilitado hasta tener correo y una contraseña de
   6 o mas. "Cada serie cuenta." */

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
  Entrando,
  ErrorAcceso,
  FormularioAcceso,
  Marca,
  PantallaAcceso,
  PieEnlace,
} from '@/components/Acceso';

import { Campo, LumeButton, lumeSpace } from '@/design/lume';

export default function LoginScreen() {
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
    <PantallaAcceso overlay={entering ? <Entrando /> : null}>
      <Marca />

      <FormularioAcceso titulo="Entrá a tu cuenta" bajada="Seguí registrando cada serie donde la dejaste.">
        <CamposAcceso>
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
            final={<BotonOjo visible={showPass} onToggle={() => setShowPass((s) => !s)} />}
          />
        </CamposAcceso>

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

        <ErrorAcceso mensaje={errorMsg} />

        <Divisor texto="o continuá con" />
        <BotonesSociales cargando={oauthLoading} onPress={handleOAuth} />
        <AvisoTerminos />
      </FormularioAcceso>

      <PieEnlace alFondo pregunta="¿No tenés cuenta?" enlace="Creá una" onPress={() => router.push('/register')} />
    </PantallaAcceso>
  );
}

const styles = StyleSheet.create({
  olvido: { alignSelf: 'flex-end', marginTop: -lumeSpace[2] },
});
