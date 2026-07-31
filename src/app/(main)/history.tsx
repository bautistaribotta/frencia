/* Frencia · Historial — lo que ya se entreno.
   Todavia no esta construido: la pestania existe para reservarle el lugar en la
   barra. El estado no promete datos que no hay, dice que la pantalla falta y
   que va a leer de session_sets, que ya se escribe en cada sesion. */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FrenciaText,
  Icon,
  radius,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

export default function HistoryScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FrenciaText role="dataLabel" color={colors.textTertiary}>
          Historial
        </FrenciaText>

        <View style={styles.vacio}>
          <Icon name="history" size={26} color={colors.textTertiary} />
          <FrenciaText role="subtitle" style={styles.centerText}>
            Todavía no está listo
          </FrenciaText>
          <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.vacioPara}>
            Acá van a estar los pesos que levantaste, las series que hiciste y cómo progresás
            sesión a sesión. Mientras tanto, cada sesión que registres ya se está guardando.
          </FrenciaText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    scroll: {
      paddingHorizontal: spacing.padScreen,
      paddingTop: space[7],
      paddingBottom: space[12],
      gap: space[6],
    },
    centerText: { textAlign: 'center' },

    vacio: {
      alignItems: 'center',
      gap: space[4],
      paddingVertical: space[10],
      paddingHorizontal: space[6],
      borderRadius: radius.xl,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.borderDefault,
    },
    vacioPara: { textAlign: 'center', maxWidth: 300 },
  });
