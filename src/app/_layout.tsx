/* Frencia · Layout raiz (Expo Router).
   Monta los providers globales (gestos, safe-area, sesion, perfil, tema),
   define el Stack de navegacion y aplica el gate de autenticacion que
   decide entre el flujo de auth, el setup inicial y la app. */

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/AnimatedSplashOverlay';
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

/* Fase de la cuenta, de la que salen las pantallas disponibles:
   - cargando: todavia no sabemos si hay sesion o no leimos el perfil.
   - invitado: sin sesion. Solo el grupo (auth) y los textos legales.
   - error: con sesion pero sin poder leer el perfil (error o limite de
     tiempo). Solo la pantalla de error, que ofrece reintentar o volver al
     login. Nunca el setup: una lectura fallida no es una cuenta nueva.
   - recuperacion: eliminacion de cuenta pendiente. Solo la pantalla de
     recuperacion, este donde este.
   - legal: sin aceptar las versiones vigentes de los textos legales. Solo
     /legal-consent y los textos, que se abren desde ahi. Va antes que el
     setup: es lo primero del primer ingreso.
   - adentro: la app. */
type Fase = 'cargando' | 'invitado' | 'error' | 'recuperacion' | 'legal' | 'adentro';

function useFase(): { fase: Fase; necesitaSetup: boolean } {
  const { session, initializing } = useSession();
  const { needsOnboarding, needsLegalAcceptance, loading, loadError, profile } = useProfile();
  let fase: Fase;
  if (initializing) fase = 'cargando';
  else if (!session) fase = 'invitado';
  else if (loading) fase = 'cargando';
  else if (loadError) fase = 'error';
  else if (profile?.deletionRequestedAt != null) fase = 'recuperacion';
  else if (needsLegalAcceptance) fase = 'legal';
  else fase = 'adentro';
  return { fase, necesitaSetup: needsOnboarding || ONBOARDING_SIEMPRE };
}

/* Navegacion + gate de auth. Vive dentro de los providers para poder leer
   sesion y perfil.

   El gate es declarativo: cada Stack.Protected saca del navegador las
   pantallas de las fases que no corresponden. Si la pantalla actual queda
   protegida, Expo Router lleva a la primera disponible en el orden de abajo,
   y por eso el orden importa: al entrar a la app, el setup (si hace falta)
   va antes que (main). Una vez adentro no se fuerza mas ruta: el usuario
   puede saltar el setup y navegar libre. Los textos legales van al final
   porque se ven en cualquier fase y nunca tienen que ser el destino. */
function RootNavigator() {
  const colors = useColors();
  const { mode } = useTheme();
  const { fase, necesitaSetup } = useFase();

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
        {/* Pantalla puente con spinner mientras se resuelve la fase. */}
        <Stack.Protected guard={fase === 'cargando'}>
          <Stack.Screen name="index" />
        </Stack.Protected>
        <Stack.Protected guard={fase === 'invitado'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={fase === 'error'}>
          {/* No se pudo leer el perfil. Sin gesto de volver por lo mismo: las
              salidas son reintentar o volver al login. */}
          <Stack.Screen name="profile-error" options={OPCIONES_BLOQUEO_FADE} />
        </Stack.Protected>
        <Stack.Protected guard={fase === 'recuperacion'}>
          {/* Cuenta en periodo de gracia. Sin gesto de volver: no hay a donde
              volver, la unica salida es recuperar la cuenta o cerrar sesion. */}
          <Stack.Screen name="account-recovery" options={OPCIONES_BLOQUEO_FADE} />
        </Stack.Protected>
        <Stack.Protected guard={fase === 'legal'}>
          {/* Aceptacion de los textos legales. Sin gesto de volver: no hay a
              donde volver, las salidas son aceptar o cerrar sesion. */}
          <Stack.Screen name="legal-consent" options={OPCIONES_BLOQUEO_FADE} />
        </Stack.Protected>
        <Stack.Protected guard={fase === 'adentro' && necesitaSetup}>
          <Stack.Screen name="setup" />
        </Stack.Protected>
        <Stack.Protected guard={fase === 'adentro'}>
          <Stack.Screen name="(main)" />
          {/* Card (no modal nativo) para que el toast del root quede por encima
              sin bloquear la interaccion. edit-profile entra desde la derecha y
              permite volver con swipe horizontal en toda la pantalla. */}
          <Stack.Screen name="edit-profile" options={OPCIONES_GESTO_VOLVER} />
          {/* Configuracion de la cuenta. Solo lectura por ahora: el gesto de
              volver no puede perder nada. */}
          <Stack.Screen name="settings" options={OPCIONES_GESTO_VOLVER} />
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
        </Stack.Protected>
        {/* Textos legales. Solo lectura, accesibles con o sin sesion. */}
        <Stack.Screen name="terms" options={OPCIONES_GESTO_VOLVER} />
        <Stack.Screen name="privacy" options={OPCIONES_GESTO_VOLVER} />
      </Stack>
    </>
  );
}
