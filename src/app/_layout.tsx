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
                <RootNavigator />
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
          name="profile"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="colorblind"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
      </Stack>
    </>
  );
}

/* Reglas:
   - Sin sesion: solo el grupo (auth). Si esta afuera, lo mandamos a /login.
   - Con sesion entrando a la app (grupo auth o raiz): decide entre setup
     (perfil incompleto, primer ingreso) y home. Una vez adentro no fuerza
     mas: el usuario puede saltar el setup y navegar libre. */
function useAuthRedirect() {
  const { session, initializing } = useSession();
  const { needsOnboarding, loading } = useProfile();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';
    const atRoot = pathname === '/';

    if (!session) {
      if (!inAuthGroup) router.replace('/login');
      return;
    }

    // Sesion activa: decidimos destino al entrar desde auth o desde la raiz.
    if (inAuthGroup || atRoot) {
      if (loading) return;
      router.replace(needsOnboarding ? '/setup' : '/home');
    }
  }, [session, initializing, loading, needsOnboarding, segments, pathname, router]);
}
