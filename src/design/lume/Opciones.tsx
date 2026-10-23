/* ============================================================
   Frencia · Lume · Opciones con radio
   Filas de vidrio de 60 px que se leen enteras y se tocan con el pulgar.
   La elegida sube a vidrio fuerte con borde accent y el radio relleno.
   ============================================================ */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useLumeStyles, type LumeSombras } from './useLume';
import { LumeText } from './LumeText';
import { lumeFuente } from './tipografia';
import { lumeRadius, lumeSpace, type LumePalette } from './tokens';

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
  const styles = useLumeStyles(makeStyles);

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
            style={[styles.opcion, sel ? styles.opcionElegida : styles.opcionLibre]}
          >
            <LumeText rol="body" style={styles.texto}>
              {o.label}
            </LumeText>
            <View style={[styles.radio, sel && styles.radioElegido]}>
              {sel ? <View style={styles.punto} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (t: LumePalette, sombras: LumeSombras) =>
  StyleSheet.create({
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
    opcionElegida: {
      backgroundColor: t.surfaceCardElevated,
      borderColor: t.accent,
      boxShadow: `${sombras.glass}, 0 0 0 0.5px ${t.accent}`,
    },
    opcionLibre: {
      backgroundColor: t.surfaceCard,
      borderColor: t.glassLine,
      borderTopColor: t.glassHighlight,
      boxShadow: sombras.glass,
    },
    texto: { flex: 1, fontFamily: lumeFuente.medium, lineHeight: 20 },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: t.borderStrong,
    },
    radioElegido: { borderColor: t.accent },
    punto: { width: 10, height: 10, borderRadius: 5, backgroundColor: t.accent },
  });
