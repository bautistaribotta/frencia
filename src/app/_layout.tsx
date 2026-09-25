/* Frencia · Layout raiz (Expo Router).
   Monta los providers globales (gestos, safe-area, tema, sesion, perfil),
   define el Stack de navegacion y aplica el gate de autenticacion que
   decide entre el flujo de auth, el setup inicial y la app. */

import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { FrenciaThemeProvider, useColors, useFrenciaFonts, useTheme } from '@/design';
import { SessionProvider, useSession } from '@/contexts/session';
import { ProfileProvider, useProfile } from '@/contexts/profile';
import { ToastProvider } from '@/contexts/toast';
import { AlertaProvider } from '@/contexts/alerta';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFrenciaFonts();

  // No bloquear para siempre si una fuente falla en cargar (web): renderizar igual.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FrenciaThemeProvider>
        <SafeAreaProvider>
          <SessionProvider>
            <ProfileProvider>
              <ToastProvider>
                <AnimatedSplashOverlay />
                <AlertaProvider>
                  <RootNavigator />
                </AlertaProvider>
              </ToastProvider>
            </ProfileProvider>
          </SessionProvider>
        </SafeAreaProvider>
      </FrenciaThemeProvider>
    </GestureHandlerRootView>
  );
}

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
        <Stack.Screen
          name="edit-profile"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        {/* Configuracion de la cuenta. Solo lectura por ahora: el gesto de
            volver no puede perder nada. */}
        <Stack.Screen
          name="settings"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        {/* Textos legales. Solo lectura, accesibles con o sin sesion. */}
        <Stack.Screen
          name="terms"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        {/* Cuenta en periodo de gracia. Sin gesto de volver: no hay a donde
            volver, la unica salida es recuperar la cuenta o cerrar sesion. */}
        <Stack.Screen
          name="account-recovery"
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        {/* Wizard de creacion de rutina. Sin gesto de volver: los pasos
            manejan el retroceso con su propio boton para no perder datos. */}
        <Stack.Screen
          name="create-routine"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        />
        {/* Detalle de una rutina. Es solo lectura, asi que el gesto de volver
            no puede perder nada. */}
        <Stack.Screen
          name="routine"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="session-history"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        {/* Editar una rutina y editar un dia. Sin gesto de volver: hay cambios
            sin guardar y el boton Atras es el que pregunta antes de
            descartarlos. */}
        <Stack.Screen
          name="edit-routine"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="edit-day"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        />
        {/* Sesion de entrenamiento. Sin gesto de volver por la misma razon que
            el wizard: los pasos manejan el retroceso con su propio boton. */}
        <Stack.Screen
          name="session"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        />
      </Stack>
    </>
  );
}

/* Reglas:
   - Sin sesion: solo el grupo (auth) y los textos legales. Si esta afuera,
     lo mandamos a /login.
   - Con sesion y eliminacion de cuenta pendiente: siempre a la pantalla de
     recuperacion, este donde este. Es la unica regla que fuerza ruta una vez
     adentro.
   - Con sesion entrando a la app (grupo auth o raiz): decide entre setup
     (perfil incompleto, primer ingreso) y home. Una vez adentro no fuerza
     mas: el usuario puede saltar el setup y navegar libre. */
function useAuthRedirect() {
  const { session, initializing } = useSession();
  const { needsOnboarding, loading, profile } = useProfile();
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

    // Cuenta marcada para eliminar: no se entra a la app hasta recuperarla.
    if (eliminacionPendiente) {
      if (pathname !== '/account-recovery') router.replace('/account-recovery');
      return;
    }

    // Sesion activa: decidimos destino al entrar desde auth o desde la raiz.
    if (inAuthGroup || atRoot) {
      router.replace(needsOnboarding ? '/setup' : '/home');
    }
  }, [session, initializing, loading, needsOnboarding, eliminacionPendiente, segments, pathname, router]);
}
