/* ============================================================
   Frencia · Lume · Semana
   La tira de lunes a domingo de un dia de entrenamiento. En la home los
   dias son dato: marcados en tinta (text-primary). En el editor de dia son
   una eleccion: marcados en accent, mas altos y tocables.
   0 = lunes.
   ============================================================ */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useLume, useLumeStyles } from './useLume';
import { LumeText } from './LumeText';
import { lumeRadius, type LumePalette } from './tokens';

const LETRAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const NOMBRES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export interface SemanaProps {
  marcados: number[];
  editor?: boolean;
  // Solo en el editor.
  onToggle?: (dia: number) => void;
}

export function Semana({ marcados, editor = false, onToggle }: SemanaProps) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);

  return (
    <View style={styles.fila}>
      {LETRAS.map((letra, i) => {
        const on = marcados.includes(i);
        const tinta = on ? (editor ? t.textOnAccent : t.bgApp) : editor ? t.textSecondary : t.textTertiary;
        const celda = [
          styles.dia,
          editor ? styles.diaEditor : null,
          on && (editor ? styles.elegido : styles.marcado),
        ];
        const texto = (
          <LumeText rol={editor ? 'data' : 'label'} color={tinta}>
            {letra}
          </LumeText>
        );
        return editor ? (
          <Pressable
            key={letra}
            onPress={() => onToggle?.(i)}
            accessibilityRole="checkbox"
            accessibilityLabel={NOMBRES[i]}
            accessibilityState={{ checked: on }}
            style={celda}
          >
            {texto}
          </Pressable>
        ) : (
          <View key={letra} style={celda} accessibilityLabel={on ? NOMBRES[i] : undefined}>
            {texto}
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    fila: { flexDirection: 'row', gap: 4 },
    dia: {
      flex: 1,
      height: 30,
      borderRadius: lumeRadius.sm,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.surfaceCard,
      borderColor: t.glassLine,
    },
    diaEditor: { height: 44, borderRadius: lumeRadius.md },
    marcado: { backgroundColor: t.textPrimary, borderColor: t.textPrimary },
    elegido: { backgroundColor: t.accent, borderColor: t.accent },
  });
