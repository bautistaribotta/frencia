/* Frencia · Layout raiz (Expo Router).
   Monta los providers globales (gestos, safe-area, sesion, perfil, tema),
   define el Stack de navegacion y aplica el gate de autenticacion que
   decide entre el flujo de auth, el setup inicial y la app. */

import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { FrenciaThemeProvider, useColors, useFrenciaFonts, useTheme } from '@/design';
import { useLumeFonts } from '@/design/lume';
import { SessionProvider, useSession } from '@/contexts/session';
import { ProfileProvider, useProfile } from '@/contexts/profile';
import { ToastProvider } from '@/contexts/toast';
import { AlertaProvider } from '@/contexts/alerta';
import { ONBOARDING_SIEMPRE } from '@/lib/onboarding';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFrenciaFonts();
  // Fuentes de Lume (Frencia 2.0): conviven con las del sistema anterior
  // mientras las pantallas se migran de a partes.
  const [lumeLoaded, lumeError] = useLumeFonts();

  // No bloquear para siempre si una fuente falla en cargar (web): renderizar igual.
  if (!fontsLoaded && !fontError) return null;
  if (!lumeLoaded && !lumeError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
          <ProfileProvider>
            <FrenciaThemeProvider>
              <ToastProvider>
                <AnimatedSplashOverlay />
                <AlertaProvider>
                  <RootNavigator />
                </AlertaProvider>
              </ToastProvider>
            </FrenciaThemeProvider>
          </ProfileProvider>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// El Stack ya define `animation: 'slide_from_right'` en screenOptions; cada
// grupo de pantallas solo declara como responde al gesto de volver.
const OPCIONES_GESTO_VOLVER = {
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
} as const;

const OPCIONES_SIN_GESTO = {
  gestureEnabled: false,
} as const;

const OPCIONES_BLOQUEO_FADE = {
  animation: 'fade',
  gestureEnabled: false,
} as const;

/* Navegacion + gate de auth. Vive dentro de los providers para poder leer
   sesion y perfil, y dentro del router para usar router/segments. */
function RootNavigator() {
  const colors = useColors();
  const { mode } = useTheme();

  useAuthRedirect();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgApp },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="setup" />
        {/* Card (no modal nativo) para que el toast del root quede por encima
            sin bloquear la interaccion. edit-profile entra desde la derecha y
            permite volver con swipe horizontal en toda la pantalla. */}
        <Stack.Screen name="edit-profile" options={OPCIONES_GESTO_VOLVER} />
        {/* Configuracion de la cuenta. Solo lectura por ahora: el gesto de
            volver no puede perder nada. */}
        <Stack.Screen name="settings" options={OPCIONES_GESTO_VOLVER} />
        {/* Textos legales. Solo lectura, accesibles con o sin sesion. */}
        <Stack.Screen name="terms" options={OPCIONES_GESTO_VOLVER} />
        <Stack.Screen name="privacy" options={OPCIONES_GESTO_VOLVER} />
        {/* Cuenta en periodo de gracia. Sin gesto de volver: no hay a donde
            volver, la unica salida es recuperar la cuenta o cerrar sesion. */}
        <Stack.Screen name="account-recovery" options={OPCIONES_BLOQUEO_FADE} />
        {/* Aceptacion de los textos legales. Sin gesto de volver: no hay a
            donde volver, las salidas son aceptar o cerrar sesion. */}
        <Stack.Screen name="legal-consent" options={OPCIONES_BLOQUEO_FADE} />
        {/* No se pudo leer el perfil. Sin gesto de volver por lo mismo: las
            salidas son reintentar o volver al login. */}
        <Stack.Screen name="profile-error" options={OPCIONES_BLOQUEO_FADE} />
        {/* Wizard de creacion de rutina. Sin gesto de volver: los pasos
            manejan el retroceso con su propio boton para no perder datos. */}
        <Stack.Screen name="create-routine" options={OPCIONES_SIN_GESTO} />
        {/* Detalle de una rutina. Es solo lectura, asi que el gesto de volver
            no puede perder nada. */}
        <Stack.Screen name="routine" options={OPCIONES_GESTO_VOLVER} />
        <Stack.Screen name="session-history" options={OPCIONES_GESTO_VOLVER} />
        <Stack.Screen name="session-ticket" options={OPCIONES_GESTO_VOLVER} />
        {/* Editar una rutina y editar un dia. Con gesto de volver: si hay
            cambios sin guardar, useDescartarAlSalir frena la salida y pregunta
            antes de descartarlos, igual que el boton Atras. */}
        <Stack.Screen name="edit-routine" options={OPCIONES_GESTO_VOLVER} />
        <Stack.Screen name="edit-day" options={OPCIONES_GESTO_VOLVER} />
        {/* Sesion de entrenamiento. Sin gesto de volver por la misma razon que
            el wizard: los pasos manejan el retroceso con su propio boton. */}
        <Stack.Screen name="session" options={OPCIONES_SIN_GESTO} />
      </Stack>
    </>
  );
}

/* Reglas:
   - Sin sesion: solo el grupo (auth) y los textos legales. Si esta afuera,
     lo mandamos a /login.
   - Con sesion pero sin poder leer el perfil (error o limite de tiempo): a
     la pantalla de error, que ofrece reintentar o volver al login. Nunca al
     setup: una lectura fallida no es una cuenta nueva.
   - Con sesion y eliminacion de cuenta pendiente: siempre a la pantalla de
     recuperacion, este donde este.
   - Con sesion y sin aceptar las versiones vigentes de los textos legales:
     a /legal-consent, este donde este, salvo los propios textos, que se
     abren desde ahi. Va antes que el setup: es lo primero del primer
     ingreso. Estas dos son las unicas reglas que fuerzan ruta una vez
     adentro.
   - Con sesion entrando a la app (grupo auth o raiz): decide entre setup
     (perfil incompleto, primer ingreso) y home. Una vez adentro no fuerza
     mas: el usuario puede saltar el setup y navegar libre. */
function useAuthRedirect() {
  const { session, initializing } = useSession();
  const { needsOnboarding, needsLegalAcceptance, loading, loadError, profile } = useProfile();
  const eliminacionPendiente = profile?.deletionRequestedAt != null;
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';
    const atRoot = pathname === '/';
    // Los textos legales se leen desde login y registro, antes de tener cuenta.
    const esRutaPublica = pathname === '/terms' || pathname === '/privacy';

    if (!session) {
      if (!inAuthGroup && !esRutaPublica) router.replace('/login');
      return;
    }

    if (loading) return;

    if (loadError) {
      if (pathname !== '/profile-error') router.replace('/profile-error');
      return;
    }

    // Cuenta marcada para eliminar: no se entra a la app hasta recuperarla.
    if (eliminacionPendiente) {
      if (pathname !== '/account-recovery') router.replace('/account-recovery');
      return;
    }

    // Sin aceptar los textos legales vigentes no se entra a la app.
    if (needsLegalAcceptance) {
      if (pathname !== '/legal-consent' && !esRutaPublica) router.replace('/legal-consent');
      return;
    }

    // Sesion activa: decidimos destino al entrar desde auth o desde la raiz, al
    // salir de la pantalla de error cuando el reintento anduvo, o al terminar
    // de aceptar los textos legales.
    if (inAuthGroup || atRoot || pathname === '/profile-error' || pathname === '/legal-consent') {
      router.replace(needsOnboarding || ONBOARDING_SIEMPRE ? '/setup' : '/home');
    }
  }, [session, initializing, loading, loadError, needsOnboarding, needsLegalAcceptance, eliminacionPendiente, segments, pathname, router]);
}
