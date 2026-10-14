/* Frencia · Piezas de las pantallas de acceso (login, registro y recuperar
   contraseña) en Lume. Login y registro llevan arriba el nombre FRENCIA.
   como marca; las tres comparten el formulario alineado a la izquierda y
   Apple / Google como secundarios en vidrio. Ver "Pantallas - 1 Acceso" en
   el design system. */

import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Fondo, LumeButton, LumeText, lumeFuente, lumeSpace, useLume } from '@/design/lume';
import type { OAuthProvider } from '@/lib/oauth';

import AppleLogo from '@/assets/icons/apple.svg';
import GoogleLogo from '@/assets/icons/google.svg';

// Mascaras del nombre FRENCIA. con las letras del icono de la app: letras y
// punto por separado, del mismo tamaño (1004 x 268), y se tiñen con tintColor.
const LETRAS = require('../../assets/images/lume/marca-letras.png');
const PUNTO = require('../../assets/images/lume/marca-punto.png');
const ANCHO_MARCA = 168;
const ALTO_MARCA = (ANCHO_MARCA * 268) / 1004;

/* La marca del acceso: solo el nombre FRENCIA., sin icono ni lema, centrado
   arriba de todo con un margen fijo bajo la barra de estado y cerca del
   titulo del formulario. */
export function Marca() {
  const { t } = useLume();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.marca, { paddingTop: insets.top + lumeSpace[8] + 50 }]}>
      <View style={styles.nombre} accessibilityRole="image" accessibilityLabel="Frencia">
        <Image source={LETRAS} style={[styles.capa, { tintColor: t.marca }]} />
        <Image source={PUNTO} style={[styles.capa, { tintColor: t.marca }]} />
      </View>
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
  // El nombre va 50 px mas abajo del margen base y 40 px arriba del titulo:
  // el bloque mide lo mismo, asi que el formulario no se mueve.
  marca: { alignSelf: 'stretch', alignItems: 'center', paddingBottom: lumeSpace[9] },
  nombre: { width: ANCHO_MARCA, height: ALTO_MARCA },
  capa: { position: 'absolute', top: 0, left: 0, width: ANCHO_MARCA, height: ALTO_MARCA },
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
