/* ============================================================
   Frencia · Lume · Opciones con radio
   Filas de vidrio de 60 px que se leen enteras y se tocan con el pulgar.
   La elegida sube a vidrio fuerte con borde accent y el radio relleno.
   ============================================================ */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useLume } from './useLume';
import { LumeText } from './LumeText';
import { lumeFuente } from './tipografia';
import { lumeRadius, lumeSpace } from './tokens';

export interface Opcion {
  value: string;
  label: string;
}

export interface OpcionesProps {
  opciones: Opcion[];
  value: string;
  onChange: (value: string) => void;
}

export function Opciones({ opciones, value, onChange }: OpcionesProps) {
  const { t, sombras } = useLume();

  return (
    <View style={styles.lista} accessibilityRole="radiogroup">
      {opciones.map((o) => {
        const sel = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              if (!sel) Haptics.selectionAsync().catch(() => {});
              onChange(o.value);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: sel }}
            style={[
              styles.opcion,
              sel
                ? {
                    backgroundColor: t.surfaceCardElevated,
                    borderColor: t.accent,
                    boxShadow: `${sombras.glass}, 0 0 0 0.5px ${t.accent}`,
                  }
                : {
                    backgroundColor: t.surfaceCard,
                    borderColor: t.glassLine,
                    borderTopColor: t.glassHighlight,
                    boxShadow: sombras.glass,
                  },
            ]}
          >
            <LumeText rol="body" style={styles.texto}>
              {o.label}
            </LumeText>
            <View style={[styles.radio, { borderColor: sel ? t.accent : t.borderStrong }]}>
              {sel ? <View style={[styles.punto, { backgroundColor: t.accent }]} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { gap: lumeSpace[3] },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    height: 60,
    paddingHorizontal: lumeSpace[5],
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
  },
  texto: { flex: 1, fontFamily: lumeFuente.medium, lineHeight: 20 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  punto: { width: 10, height: 10, borderRadius: 5 },
});
