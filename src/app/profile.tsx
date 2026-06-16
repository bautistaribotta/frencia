/* Frencia · Perfil — pantalla de perfil y ajustes.
   Se abre al tocar el encabezado de saludo. Tarjeta de usuario,
   editar perfil y filas de ajustes (RIR/RPE, tema). Sin persistencia. */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Avatar,
  Button,
  FrenciaText,
  Icon,
  Switch,
  colors,
  radius,
  sans,
  space,
  spacing,
} from '@/design';

interface ProfileScreenProps {
  userName?: string;
  onClose?: () => void;
  onEditProfile?: () => void;
}

export default function ProfileScreen({
  userName = 'Marco',
  onClose,
  onEditProfile,
}: ProfileScreenProps) {
  // Estado local visual, sin persistencia ni tema real conectado.
  const [useRpe, setUseRpe] = useState(false);
  const [useLb, setUseLb] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado con cierre */}
        <View style={styles.header}>
          <Pressable
            hitSlop={10}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar perfil"
            style={styles.closeBtn}
          >
            <Icon name="chevron-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <FrenciaText role="title">Perfil</FrenciaText>
          {/* Espaciador para centrar el titulo */}
          <View style={styles.closeBtn} />
        </View>

        {/* Tarjeta de usuario */}
        <View style={styles.userCard}>
          <Avatar name={userName} size="lg" ring />
          <View style={styles.userText}>
            <FrenciaText role="subtitle">{userName}</FrenciaText>
            <FrenciaText role="dataLabel" color={colors.textTertiary}>
              Tu cuenta
            </FrenciaText>
          </View>
        </View>

        {/* Editar perfil */}
        <Button
          variant="secondary"
          size="lg"
          icon="user"
          fullWidth
          onPress={onEditProfile}
        >
          Editar perfil
        </Button>

        {/* Ajustes */}
        <View style={styles.settingsBlock}>
          <FrenciaText
            role="dataLabel"
            color={colors.textTertiary}
            style={styles.settingsLabel}
          >
            Ajustes
          </FrenciaText>

          <View style={styles.settingsList}>
            {/* Fila: RIR / RPE */}
            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <FrenciaText role="bodySm" style={styles.settingTitle}>
                  Usar RIR / RPE
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.settingSub}>
                  {useRpe ? 'Midiendo con RPE' : 'Midiendo con RIR'}
                </FrenciaText>
              </View>
              <Switch checked={useRpe} onChange={setUseRpe} />
            </View>

            {/* Fila: unidad de peso */}
            <View style={[styles.settingRow, styles.settingRowDivider]}>
              <View style={styles.settingText}>
                <FrenciaText role="bodySm" style={styles.settingTitle}>
                  Unidad de peso kg/lb
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.settingSub}>
                  {useLb ? 'En libras (lb)' : 'En kilogramos (kg)'}
                </FrenciaText>
              </View>
              <Switch checked={useLb} onChange={setUseLb} />
            </View>

            {/* Fila: tema */}
            <View style={[styles.settingRow, styles.settingRowDivider]}>
              <View style={styles.settingText}>
                <FrenciaText role="bodySm" style={styles.settingTitle}>
                  Modo oscuro / claro
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.settingSub}>
                  {darkMode ? 'Modo oscuro' : 'Modo claro'}
                </FrenciaText>
              </View>
              <Switch checked={darkMode} onChange={setDarkMode} />
            </View>
          </View>
        </View>

        {/* Configuracion (sin accion por ahora) */}
        <Button
          variant="ghost"
          size="lg"
          icon="settings"
          fullWidth
          onPress={() => {}}
        >
          Configuracion
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgApp },
  scroll: {
    paddingHorizontal: spacing.padScreen,
    paddingTop: space[7],
    paddingBottom: space[12],
    gap: space[7],
  },

  // Encabezado
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tarjeta de usuario
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: space[5],
  },
  userText: { gap: space[1] },

  // Ajustes
  settingsBlock: { gap: space[4] },
  settingsLabel: { paddingHorizontal: space[1] },
  settingsList: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[4],
    padding: space[5],
  },
  settingRowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  settingText: { flex: 1, gap: space[1] },
  settingTitle: { fontFamily: sans.semibold, color: colors.textPrimary },
  settingSub: { fontSize: 12.5, lineHeight: 17 },
});
