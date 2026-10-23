/* ============================================================
   Frencia · Lume · Boton
     primary    lume en oscuro, tinta en claro, con su resplandor
     secondary  vidrio
     ghost      solo texto
     soft       texto en lume / oliva
     danger     carmin delineado
   Deshabilitado: el relleno pasa a surface-chip y el texto a
   text-disabled; no se baja la opacidad. Presionar achica a 0.985.
   ============================================================ */

import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '../Icon';
import { useLume, useLumeStyles, type LumeSombras } from './useLume';
import { LumeText } from './LumeText';
import { lumeFuente } from './tipografia';
import { lumeMotion, lumeRadius, type LumePalette } from './tokens';
import { Cargando } from './Cargando';

export type VarianteBoton = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger';
export type TamanioBoton = 'sm' | 'md' | 'lg';

export interface LumeButtonProps {
  children?: React.ReactNode;
  variant?: VarianteBoton;
  size?: TamanioBoton;
  fullWidth?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  // Algo propio antes del texto (el logo de Apple o Google).
  leading?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const TAMANIOS: Record<TamanioBoton, { alto: number; padding: number; fuente: number; gap: number; icono: number }> = {
  sm: { alto: 36, padding: 14, fuente: 14, gap: 6, icono: 16 },
  md: { alto: 44, padding: 20, fuente: 15, gap: 8, icono: 17 },
  lg: { alto: 54, padding: 24, fuente: 16, gap: 8, icono: 18 },
};

export function LumeButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconRight,
  leading,
  loading = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  style,
}: LumeButtonProps) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);
  const tam = TAMANIOS[size];
  const apagado = disabled || loading;

  // Color del texto y del icono segun variante y estado.
  const tinta = disabled
    ? t.textDisabled
    : variant === 'primary'
      ? t.textOnAccent
      : variant === 'secondary'
        ? t.textPrimary
        : variant === 'soft'
          ? t.signalText
          : variant === 'danger'
            ? t.dangerText
            : t.textSecondary;

  function relleno(presionado: boolean): StyleProp<ViewStyle> {
    switch (variant) {
      case 'primary':
        if (disabled) return styles.primarioApagado;
        return [styles.primario, presionado && styles.primarioPresionado];
      case 'secondary':
        return [styles.secundario, presionado && styles.secundarioPresionado, disabled && styles.secundarioApagado];
      case 'danger':
        return [styles.peligro, presionado && styles.fondoPresionado, disabled && styles.peligroApagado];
      case 'soft':
        return presionado && styles.suavePresionado;
      default:
        return presionado && styles.fondoPresionado;
    }
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={apagado}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: apagado, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { height: tam.alto, paddingHorizontal: tam.padding, gap: tam.gap },
        fullWidth && styles.full,
        relleno(pressed && !apagado),
        pressed && !apagado && styles.presionado,
        style,
      ]}
    >
      {loading ? (
        <Cargando tam="sm" color={tinta} />
      ) : (
        <>
          {leading ?? (icon ? <Icon name={icon} size={tam.icono} color={tinta} strokeWidth={1.75} /> : null)}
          {children != null ? (
            <LumeText
              rol="body"
              color={tinta}
              numberOfLines={1}
              style={[styles.texto, { fontSize: tam.fuente, lineHeight: tam.fuente + 4 }]}
            >
              {children}
            </LumeText>
          ) : null}
          {iconRight ? <Icon name={iconRight} size={tam.icono} color={tinta} strokeWidth={1.75} /> : null}
        </>
      )}
    </Pressable>
  );
}

const makeStyles = (t: LumePalette, sombras: LumeSombras) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: lumeRadius.lg,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    full: { alignSelf: 'stretch' },
    presionado: { transform: [{ scale: lumeMotion.pressScale }] },
    primario: { backgroundColor: t.accent, boxShadow: sombras.haloAccent },
    primarioPresionado: { backgroundColor: t.accentPress },
    primarioApagado: { backgroundColor: t.surfaceChip },
    secundario: {
      backgroundColor: t.surfaceCard,
      borderColor: t.glassLine,
      borderTopColor: t.glassHighlight,
      boxShadow: sombras.glass,
    },
    secundarioPresionado: { backgroundColor: t.surfaceCardElevated },
    secundarioApagado: { borderColor: t.borderSubtle, borderTopColor: t.borderSubtle },
    peligro: { borderColor: t.danger },
    peligroApagado: { borderColor: t.borderSubtle },
    suavePresionado: { backgroundColor: t.surfaceSignalSoft },
    fondoPresionado: { backgroundColor: t.surfaceChip },
    texto: { fontFamily: lumeFuente.semibold, letterSpacing: -0.08 },
  });
