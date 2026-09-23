/* Frencia · Aviso de aceptacion de los Terminos y Condiciones y la Politica
   de Privacidad.
   Va en login y registro, debajo de los botones de Apple y Google: cubre los
   tres caminos de alta (email, Apple, Google) sin agregar un checkbox que el
   login social no podria respetar. */

import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { FrenciaText, sans, useColors } from '@/design';

export function TermsNotice() {
  const colors = useColors();
  const router = useRouter();

  return (
    <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.text}>
      Al continuar, aceptás los{' '}
      <FrenciaText
        role="bodySm"
        color={colors.accentText}
        style={styles.link}
        onPress={() => router.push('/terms')}
        accessibilityRole="link"
      >
        Términos y Condiciones
      </FrenciaText>
      {' '}y la{' '}
      <FrenciaText
        role="bodySm"
        color={colors.accentText}
        style={styles.link}
        onPress={() => router.push('/privacy')}
        accessibilityRole="link"
      >
        Política de Privacidad
      </FrenciaText>
      {' '}de Frencia.
    </FrenciaText>
  );
}

const styles = StyleSheet.create({
  text: { textAlign: 'center' },
  link: { fontFamily: sans.semibold },
});
