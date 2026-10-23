/* ============================================================
   Frencia · Lume · Boton de icono
     primary  lume con su resplandor
     surface  vidrio
     ghost    solo el icono, en texto secundario
   Tamaños 36 / 44 / 54 con iconos de 18 / 20 / 22. Presionar achica a
   0.985, como el boton con texto.
   ============================================================ */

import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '../Icon';
import { useLume, useLumeStyles, type LumeSombras } from './useLume';
import { lumeMotion, lumeRadius, type LumePalette } from './tokens';

export type VarianteBotonIcono = 'primary' | 'surface' | 'ghost';

export interface LumeIconButtonProps {
  icon: IconName;
  variant?: VarianteBotonIcono;
  size?: 'sm' | 'md' | 'lg';
  round?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

const TAMANIOS = { sm: { lado: 36, icono: 18 }, md: { lado: 44, icono: 20 }, lg: { lado: 54, icono: 22 } };

export function LumeIconButton({
  icon,
  variant = 'surface',
  size = 'md',
  round = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  style,
}: LumeIconButtonProps) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);
  const { lado, icono } = TAMANIOS[size];

  const tinta = disabled
    ? t.textDisabled
    : variant === 'primary'
      ? t.textOnAccent
      : variant === 'surface'
        ? t.textPrimary
        : t.textSecondary;

  function relleno(presionado: boolean): StyleProp<ViewStyle> {
    switch (variant) {
      case 'primary':
        if (disabled) return styles.primarioApagado;
        return [styles.primario, presionado && styles.primarioPresionado];
      case 'surface':
        return [styles.vidrio, presionado && styles.vidrioPresionado];
      default:
        return presionado && styles.fondoPresionado;
    }
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={size === 'sm' ? 4 : 0}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        { width: lado, height: lado, borderRadius: round ? lado / 2 : lumeRadius.lg },
        relleno(pressed && !disabled),
        pressed && !disabled && styles.presionado,
        style,
      ]}
    >
      <Icon name={icon} size={icono} color={tinta} strokeWidth={1.75} />
    </Pressable>
  );
}

const makeStyles = (t: LumePalette, sombras: LumeSombras) =>
  StyleSheet.create({
    base: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
    presionado: { transform: [{ scale: lumeMotion.pressScale }] },
    primario: { backgroundColor: t.accent, boxShadow: sombras.haloAccent },
    primarioPresionado: { backgroundColor: t.accentPress },
    primarioApagado: { backgroundColor: t.surfaceChip },
    vidrio: {
      backgroundColor: t.surfaceCard,
      borderColor: t.glassLine,
      borderTopColor: t.glassHighlight,
      boxShadow: sombras.glass,
    },
    vidrioPresionado: { backgroundColor: t.surfaceCardElevated },
    fondoPresionado: { backgroundColor: t.surfaceChip },
  });
