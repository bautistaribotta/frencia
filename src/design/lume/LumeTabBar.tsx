/* ============================================================
   Frencia · Lume · Barra de pestañas
   Vidrio denso (surface-raised) con un filo glass-line arriba. La activa
   pasa a text-primary con el icono en signal y una marca de 2 px arriba,
   con su brillo; el resto queda en text-tertiary. Con `fab`, las pestañas
   se reparten a los dos lados de un boton cuadrado en accent con su
   resplandor.
   La barra va debajo de la pantalla, no encima: el kit la pone fuera del
   scroll. Por eso no lleva BlurView (no hay nada detras que desenfocar);
   el relleno de surface-raised ya es casi opaco.
   ============================================================ */

import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '../Icon';
import { useLume, useLumeStyles, type LumeSombras } from './useLume';
import { LumeText } from './LumeText';
import { lumeFuente } from './tipografia';
import { lumeRadius, type LumePalette } from './tokens';

export interface LumeTabItem {
  value: string;
  label: string;
  icon: IconName;
}

export interface LumeTabFab {
  icon?: IconName;
  label?: string;
  onPress?: () => void;
}

export interface LumeTabBarProps {
  items: LumeTabItem[];
  value: string;
  onChange?: (value: string) => void;
  fab?: LumeTabFab;
  style?: StyleProp<ViewStyle>;
}

export function LumeTabBar({ items, value, onChange, fab, style }: LumeTabBarProps) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const mid = Math.ceil(items.length / 2);
  const izquierda = fab ? items.slice(0, mid) : items;
  const derecha = fab ? items.slice(mid) : [];

  const pestania = (item: LumeTabItem) => {
    const activa = item.value === value;
    return (
      <Pressable
        key={item.value}
        style={styles.tab}
        onPress={() => onChange?.(item.value)}
        accessibilityRole="tab"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: activa }}
      >
        {activa ? (
          <View style={styles.marca} />
        ) : null}
        <Icon name={item.icon} size={22} color={activa ? t.signal : t.textTertiary} strokeWidth={1.75} />
        <LumeText rol="label" color={activa ? t.textPrimary : t.textTertiary} style={styles.rotulo}>
          {item.label}
        </LumeText>
      </Pressable>
    );
  };

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.barra, { paddingBottom: 8 + Math.max(insets.bottom, 8) }, style]}
    >
      {fab ? (
        /* Los dos lados van en grupos de ancho igual para que el boton quede
           centrado tambien con una cantidad impar de pestañas. */
        <>
          <View style={styles.grupo}>{izquierda.map(pestania)}</View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={fab.label || 'Acción'}
            onPress={fab.onPress}
            style={({ pressed }) => [styles.fab, pressed && styles.fabPresionado]}
          >
            <Icon name={fab.icon || 'plus'} size={22} strokeWidth={2} color={t.textOnAccent} />
          </Pressable>
          <View style={styles.grupo}>{derecha.map(pestania)}</View>
        </>
      ) : (
        items.map(pestania)
      )}
    </View>
  );
}

const makeStyles = (t: LumePalette, sombras: LumeSombras) =>
  StyleSheet.create({
    barra: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
      borderTopWidth: 1,
      paddingHorizontal: 8,
      paddingTop: 8,
      backgroundColor: t.surfaceRaised,
      borderTopColor: t.glassLine,
    },
    grupo: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
    tab: { flex: 1, alignItems: 'center', gap: 5, paddingTop: 6, paddingBottom: 2 },
    // La marca cuelga del filo de arriba de la barra.
    marca: {
      position: 'absolute',
      top: -9,
      width: 18,
      height: 2,
      borderBottomLeftRadius: 2,
      borderBottomRightRadius: 2,
      backgroundColor: t.signal,
      boxShadow: sombras.haloSignal,
    },
    rotulo: {
      fontFamily: lumeFuente.medium,
      fontSize: 10.5,
      lineHeight: 13,
      letterSpacing: 0.1,
      textTransform: 'none',
    },
    fab: {
      width: 48,
      height: 48,
      borderRadius: lumeRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.accent,
      boxShadow: sombras.haloAccent,
    },
    fabPresionado: { transform: [{ scale: 0.96 }], backgroundColor: t.accentPress },
  });
