/* Frencia · Piezas de las pantallas de acceso (login, registro y recuperar
   contraseña) en Lume. Mismo esqueleto en las tres: el icono de la app como
   marca, el formulario alineado a la izquierda y Apple / Google como
   secundarios en vidrio. Ver "Pantallas - 1 Acceso" en el design system. */

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Fondo, IconoApp, LumeButton, LumeText, lumeFuente, lumeSpace, useLume } from '@/design/lume';
import type { OAuthProvider } from '@/lib/oauth';

import AppleLogo from '@/assets/icons/apple.svg';
import GoogleLogo from '@/assets/icons/google.svg';

/* La marca es el icono de la app tal cual, con el lema debajo. */
export function Marca() {
  const { t } = useLume();
  return (
    <View style={styles.marca}>
      <IconoApp size={64} />
      <LumeText rol="label" color={t.textTertiary}>
        Cada serie cuenta
      </LumeText>
    </View>
  );
}

/* Separador entre el formulario y los proveedores. */
export function Divisor({ texto }: { texto: string }) {
  const { t } = useLume();
  return (
    <View style={styles.divisor}>
      <View style={[styles.linea, { backgroundColor: t.glassLine }]} />
      <LumeText rol="label" color={t.textTertiary}>
        {texto}
      </LumeText>
      <View style={[styles.linea, { backgroundColor: t.glassLine }]} />
    </View>
  );
}

/* Apple y Google: secundarios en vidrio, mitad y mitad. */
export function BotonesSociales({
  cargando,
  onPress,
}: {
  cargando: OAuthProvider | null;
  onPress: (proveedor: OAuthProvider) => void;
}) {
  const { t } = useLume();
  return (
    <View style={styles.social}>
      <LumeButton
        variant="secondary"
        size="lg"
        style={styles.socialBoton}
        leading={<AppleLogo width={18} height={18} color={t.textPrimary} />}
        loading={cargando === 'apple'}
        disabled={cargando !== null && cargando !== 'apple'}
        onPress={() => onPress('apple')}
      >
        Apple
      </LumeButton>
      <LumeButton
        variant="secondary"
        size="lg"
        style={styles.socialBoton}
        leading={<GoogleLogo width={18} height={18} />}
        loading={cargando === 'google'}
        disabled={cargando !== null && cargando !== 'google'}
        onPress={() => onPress('google')}
      >
        Google
      </LumeButton>
    </View>
  );
}

/* Aceptacion implicita de los textos legales: cubre los tres caminos de alta
   (email, Apple, Google) sin un checkbox que el login social no respetaria. */
export function AvisoTerminos() {
  const { t } = useLume();
  const router = useRouter();
  return (
    <LumeText rol="bodySm" color={t.textTertiary} style={styles.centro}>
      Al continuar, aceptás los{' '}
      <LumeText
        rol="bodySm"
        color={t.signalText}
        style={styles.semi}
        onPress={() => router.push('/terms')}
        accessibilityRole="link"
      >
        Términos y Condiciones
      </LumeText>{' '}
      y la{' '}
      <LumeText
        rol="bodySm"
        color={t.signalText}
        style={styles.semi}
        onPress={() => router.push('/privacy')}
        accessibilityRole="link"
      >
        Política de Privacidad
      </LumeText>{' '}
      de Frencia.
    </LumeText>
  );
}

/* Enlace de texto en signal-text (¿Olvidaste tu contraseña?, Creá una). */
export function Enlace({
  children,
  onPress,
  semi = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  semi?: boolean;
}) {
  const { t } = useLume();
  return (
    <Pressable hitSlop={10} onPress={onPress} accessibilityRole="link">
      {({ pressed }) => (
        <LumeText rol="bodySm" color={t.signalText} style={[semi && styles.semi, pressed && styles.presionado]}>
          {children}
        </LumeText>
      )}
    </Pressable>
  );
}

/* Pie con la pregunta y el enlace a la otra pantalla. */
export function PieEnlace({ pregunta, enlace, onPress }: { pregunta: string; enlace: string; onPress: () => void }) {
  const { t } = useLume();
  return (
    <View style={styles.pie}>
      <LumeText rol="bodySm" color={t.textSecondary}>
        {pregunta}{' '}
      </LumeText>
      <Enlace semi onPress={onPress}>
        {enlace}
      </Enlace>
    </View>
  );
}

/* Tapa la pantalla con el fondo y un spinner mientras el gate del layout
   raiz decide a donde ir despues de ingresar. */
export function Entrando() {
  const { t } = useLume();
  return (
    <View style={[StyleSheet.absoluteFill, styles.entrando]}>
      <Fondo posicion="flanco" />
      <ActivityIndicator size="large" color={t.signal} />
    </View>
  );
}

const styles = StyleSheet.create({
  marca: { alignItems: 'flex-start', gap: lumeSpace[5] },
  divisor: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4] },
  linea: { flex: 1, height: 1 },
  social: { flexDirection: 'row', gap: lumeSpace[3] },
  socialBoton: { flex: 1, minWidth: 0 },
  centro: { textAlign: 'center' },
  semi: { fontFamily: lumeFuente.semibold },
  presionado: { opacity: 0.6 },
  pie: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  entrando: { alignItems: 'center', justifyContent: 'center' },
});
