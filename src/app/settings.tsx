/* Frencia · Configuracion.
   Pantalla de configuracion de la cuenta. Se llega desde el perfil con boton
   de volver y gesto horizontal. Expone los textos legales y la eliminacion
   de cuenta, con dos confirmaciones en el modal de alerta de la app y 30 dias
   de gracia; ver docs/specs/eliminacion-de-cuenta.md. */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  Button,
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
import { usePedirEliminarCuenta } from '@/lib/pedir-eliminar-cuenta';

export default function SettingsScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { pedir: pedirEliminarCuenta, eliminando } = usePedirEliminarCuenta();

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/profile');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.backBtn}>
        <Button variant="ghost" size="sm" icon="chevron-left" onPress={goBack}>
          Atrás
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <FrenciaText role="title">Configuración</FrenciaText>
        </View>

        {/* Legal: textos de solo lectura, en un mismo recuadro. */}
        <View style={styles.group}>
          <FrenciaText role="dataLabel" color={colors.textTertiary}>
            Legal
          </FrenciaText>
          <View style={styles.list}>
            <Pressable
              onPress={() => router.push('/terms')}
              accessibilityRole="button"
              accessibilityLabel="Términos y Condiciones"
            >
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Icon name="file-text" size={20} color={colors.textSecondary} />
                  <FrenciaText role="bodySm" style={styles.rowTitle}>
                    Términos y Condiciones
                  </FrenciaText>
                </View>
                <Icon name="chevron-right" size={20} color={colors.textTertiary} />
              </View>
            </Pressable>
            <View style={styles.rowDivider} />
            <Pressable
              onPress={() => router.push('/privacy')}
              accessibilityRole="button"
              accessibilityLabel="Política de Privacidad"
            >
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Icon name="shield" size={20} color={colors.textSecondary} />
                  <FrenciaText role="bodySm" style={styles.rowTitle}>
                    Política de Privacidad
                  </FrenciaText>
                </View>
                <Icon name="chevron-right" size={20} color={colors.textTertiary} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Eliminacion de cuenta: recuadro propio, accion destructiva. */}
        <Pressable
          style={styles.list}
          onPress={pedirEliminarCuenta}
          disabled={eliminando}
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
  // Envuelve el Button de Atras: da el margen de pantalla y el aire.
  backBtn: {
    flexDirection: 'row',
    paddingHorizontal: spacing.padScreen,
    paddingTop: space[8],
    paddingBottom: space[2],
  },
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
  group: { gap: space[3] },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  rowTitle: { fontFamily: sans.semibold },
  rowDivider: { height: 1, marginLeft: space[5], backgroundColor: colors.divider },
  dangerTitle: { fontFamily: sans.semibold, color: colors.dangerText },
});
