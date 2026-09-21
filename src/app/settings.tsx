/* Frencia · Configuracion.
   Pantalla de configuracion de la cuenta. Se llega desde el perfil con boton
   de volver y gesto horizontal. Por ahora solo expone la entrada de
   eliminacion de cuenta (sin accion todavia). */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  FrenciaText,
  Icon,
  radius,
  sans,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

export default function SettingsScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

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
        accessibilityLabel="Volver"
        style={styles.backBtn}
      >
        <Icon name="chevron-left" size={24} color={colors.textPrimary} />
        <FrenciaText role="bodySm" color={colors.textPrimary} style={styles.backLabel}>
          Volver
        </FrenciaText>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <FrenciaText role="title">Configuración</FrenciaText>
        </View>

        {/* Eliminacion de cuenta: recuadro propio, accion destructiva.
            Todavia no hace nada; el flujo de borrado se conecta mas adelante. */}
        <Pressable
          style={styles.list}
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Eliminación de cuenta"
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Icon name="trash-2" size={20} color={colors.dangerText} />
              <FrenciaText role="bodySm" style={styles.dangerTitle}>
                Eliminación de cuenta
              </FrenciaText>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textTertiary} />
          </View>
        </Pressable>
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
    gap: space[7],
  },
  header: { justifyContent: 'center', minHeight: 40 },
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
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  dangerTitle: { fontFamily: sans.semibold, color: colors.dangerText },
});
