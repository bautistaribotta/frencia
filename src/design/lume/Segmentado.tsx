/* ============================================================
   Frencia · Lume · Control segmentado
   Pista de vidrio. La opcion activa sube a vidrio fuerte; con `accent`
   va rellena en accent (la unidad de altura y peso del setup).
   ============================================================ */

import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useLume } from './useLume';
import { LumeText } from './LumeText';
import { lumeFuente } from './tipografia';
import { lumeRadius } from './tokens';

export interface SegmentadoProps {
  opciones: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  accent?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Segmentado({ opciones, value, onChange, accent = false, style }: SegmentadoProps) {
  const { t, sombras } = useLume();

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.pista, { backgroundColor: t.surfaceCard, borderColor: t.glassLine }, style]}
    >
      {opciones.map((o) => {
        const activa = o.value === value;
        const fondoActivo: ViewStyle = accent
          ? { backgroundColor: t.accent, borderColor: t.accent }
          : { backgroundColor: t.surfaceCardElevated, borderColor: t.glassLine, boxShadow: sombras.glass };
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: activa }}
            onPress={() => onChange(o.value)}
            style={[styles.opcion, activa && fondoActivo]}
          >
            <LumeText
              rol="bodySm"
              color={activa ? (accent ? t.textOnAccent : t.textPrimary) : t.textTertiary}
              style={styles.texto}
            >
              {o.label}
            </LumeText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pista: {
    flexDirection: 'row',
    padding: 3,
    gap: 2,
    borderRadius: lumeRadius.md,
    borderWidth: 1,
  },
  opcion: {
    flex: 1,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontFamily: lumeFuente.semibold },
});
