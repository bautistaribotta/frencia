/* Frencia · SeriesTable — RN port of components/log/SeriesTable.jsx
   Series registradas de un ejercicio (historial): columna # y una columna por
   cada dato del ejercicio. Las unidades van en el encabezado y no en las
   celdas, asi entran varias columnas en 375 px. Las celdas llegan ya
   formateadas; null se muestra como "—", que significa solo "no hay valor". */

import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { mono, tracking, type Palette } from '../theme';
import { useThemedStyles } from '../theme-context';

const DASH = '—';

export interface SeriesTableColumn {
  key: string;
  /** Encabezado en mayusculas: "PESO", "REPS", "RIR". */
  label: string;
  /** Unidad chica al lado del encabezado: "kg", "m". */
  unit?: string;
  /** Columna de intensidad: sus valores van en naranja. */
  intensity?: boolean;
}

export interface SeriesTableProps {
  columns: SeriesTableColumn[];
  /** Una fila por serie, con un valor por columna en el mismo orden. */
  rows: (string | null)[][];
  style?: ViewStyle;
}

export function SeriesTable({ columns, rows, style }: SeriesTableProps) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={style}>
      <View style={styles.row}>
        <Text style={[styles.head, styles.index]}>#</Text>
        {columns.map((c) => (
          <Text key={c.key} style={[styles.head, styles.cell]} numberOfLines={1}>
            {c.label}
            {c.unit ? <Text style={styles.unit}> {c.unit}</Text> : null}
          </Text>
        ))}
      </View>
      {rows.map((valores, i) => (
        <View key={i} style={[styles.row, styles.bodyRow]}>
          <Text style={[styles.indexValue, styles.index]}>{i + 1}</Text>
          {columns.map((c, j) => {
            const v = valores[j];
            const vacio = v === null || v === undefined;
            return (
              <Text
                key={c.key}
                style={[
                  styles.value,
                  styles.cell,
                  vacio ? styles.dash : c.intensity ? styles.int : null,
                ]}
                numberOfLines={1}
              >
                {vacio ? DASH : v}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', columnGap: 6 },
    bodyRow: { borderTopWidth: 1, borderTopColor: colors.divider },
    index: { width: 28 },
    cell: { flex: 1, minWidth: 0, textAlign: 'right' },
    head: {
      fontFamily: mono.medium,
      fontSize: 10,
      letterSpacing: tracking.wider,
      textTransform: 'uppercase',
      color: colors.textTertiary,
      paddingHorizontal: 6,
      paddingBottom: 6,
    },
    unit: { color: colors.textDisabled, textTransform: 'none', letterSpacing: 0 },
    indexValue: {
      fontFamily: mono.bold,
      fontSize: 12,
      color: colors.textTertiary,
      paddingHorizontal: 6,
      paddingVertical: 9,
    },
    value: {
      fontFamily: mono.semibold,
      fontSize: 15,
      color: colors.textPrimary,
      fontVariant: ['tabular-nums'],
      paddingHorizontal: 6,
      paddingVertical: 9,
    },
    dash: { fontFamily: mono.medium, color: colors.textDisabled },
    int: { color: colors.intensityText },
  });
