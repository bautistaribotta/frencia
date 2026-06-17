/* Frencia · Filtros de daltonismo.
   Permite elegir entre cuatro filtros para daltonismo. Por ahora es solo
   front: la seleccion vive en estado local y no aplica ningun filtro real.
   Se abre desde Configuracion en el perfil. Entra desde la derecha y se
   vuelve con la flecha o con el swipe horizontal del Stack. */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  FrenciaText,
  Icon,
  useColors,
  useThemedStyles,
  radius,
  sans,
  space,
  spacing,
  type Palette,
} from '@/design';

// Filtros disponibles. La descripcion ayuda a identificar cada tipo.
const FILTROS = [
  {
    value: 'protanopia',
    label: 'Protanopía',
    desc: 'Dificultad para percibir el rojo',
  },
  {
    value: 'deuteranopia',
    label: 'Deuteranopía',
    desc: 'Dificultad para percibir el verde',
  },
  {
    value: 'tritanopia',
    label: 'Tritanopía',
    desc: 'Dificultad para percibir el azul',
  },
  {
    value: 'acromatopsia',
    label: 'Acromatopsia',
    desc: 'Ausencia total de color',
  },
];

export default function ColorblindScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  // Seleccion solo visual: aun no aplica ningun filtro real.
  const [selected, setSelected] = useState<string | null>(null);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/profile');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable
        hitSlop={10}
        onPress={goBack}
        accessibilityRole="button"
        accessibilityLabel="Volver atras"
        style={styles.backBtn}
      >
        <Icon name="chevron-left" size={24} color={colors.textPrimary} />
        <FrenciaText role="bodySm" color={colors.textPrimary} style={styles.backLabel}>
          Volver atras
        </FrenciaText>
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <FrenciaText role="title">Filtros de daltonismo</FrenciaText>
          <FrenciaText role="bodySm" color={colors.textSecondary}>
            Elegí un filtro para adaptar los colores de la app.
          </FrenciaText>
        </View>

        <View style={styles.list}>
          {FILTROS.map((filtro, i) => {
            const activo = selected === filtro.value;
            return (
              <Pressable
                key={filtro.value}
                onPress={() => setSelected(filtro.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                accessibilityLabel={filtro.label}
                style={[styles.row, i > 0 && styles.rowDivider]}
              >
                <View style={styles.rowLeft}>
                  <Icon name="eye" size={20} color={colors.textSecondary} />
                  <View style={styles.rowText}>
                    <FrenciaText role="bodySm" style={styles.rowTitle}>
                      {filtro.label}
                    </FrenciaText>
                    <FrenciaText
                      role="bodySm"
                      color={colors.textTertiary}
                      style={styles.rowSub}
                    >
                      {filtro.desc}
                    </FrenciaText>
                  </View>
                </View>
                <View style={[styles.radio, activo && styles.radioOn]}>
                  {activo ? (
                    <Icon name="check" size={14} color={colors.textOnAccent} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.padScreen,
      paddingTop: space[8],
      paddingBottom: space[2],
    },
    backLabel: { fontFamily: sans.semibold },
    scroll: {
      paddingHorizontal: spacing.padScreen,
      paddingTop: space[4],
      paddingBottom: space[12],
      gap: space[6],
    },
    heading: { gap: space[2] },

    list: {
      backgroundColor: colors.surfaceCard,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[4],
      padding: space[5],
    },
    rowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
    rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[4] },
    rowText: { flex: 1, gap: space[1] },
    rowTitle: { fontFamily: sans.semibold, color: colors.textPrimary },
    rowSub: { fontSize: 12.5, lineHeight: 17 },

    radio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOn: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
  });
