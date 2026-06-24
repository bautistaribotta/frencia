/* Frencia · BirthDatePicker (fallback no-iOS) — tres ruedas dia/mes/año.
   La app se publica solo en iOS (alli se usa el DatePicker nativo de
   BirthDatePicker.ios.tsx). Esta version reutiliza el WheelPicker propio para
   que el bundle de web/Android no se rompa y siga siendo usable en desarrollo. */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  WheelPicker,
  radius,
  space,
  type Palette,
  useThemedStyles,
} from '@/design';
import { MAX_BIRTHDATE, MIN_BIRTHDATE } from '@/lib/birthdate';

export interface BirthDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const ITEM_H = 44;
const VISIBLE = 7;
const STAGE_H = ITEM_H * VISIBLE;

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

export function BirthDatePicker({ value, onChange }: BirthDatePickerProps) {
  const styles = useThemedStyles(makeStyles);

  const minYear = MIN_BIRTHDATE.getFullYear();
  const maxYear = MAX_BIRTHDATE.getFullYear();
  const years = range(minYear, maxYear);

  const year = value.getFullYear();
  const month = value.getMonth() + 1;
  const day = value.getDate();
  const days = range(1, daysInMonth(year, month));

  // Recompone la fecha y recorta el dia si el mes nuevo tiene menos dias.
  function emit(y: number, m: number, d: number) {
    const safeDay = Math.min(d, daysInMonth(y, m));
    onChange(new Date(y, m - 1, safeDay, 12, 0, 0, 0));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        <View pointerEvents="none" style={styles.highlight} />
        <View style={styles.row}>
          <WheelPicker
            values={days}
            index={day - 1}
            onIndexChange={(i) => emit(year, month, days[i])}
            itemHeight={ITEM_H}
            visibleCount={VISIBLE}
            width={64}
            align="center"
          />
          <WheelPicker
            values={MESES}
            index={month - 1}
            onIndexChange={(i) => emit(year, i + 1, day)}
            itemHeight={ITEM_H}
            visibleCount={VISIBLE}
            width={150}
            align="center"
          />
          <WheelPicker
            values={years}
            index={year - minYear}
            onIndexChange={(i) => emit(years[i], month, day)}
            itemHeight={ITEM_H}
            visibleCount={VISIBLE}
            width={96}
            align="center"
          />
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: { alignItems: 'center' },
    stage: { height: STAGE_H, alignSelf: 'stretch', justifyContent: 'center' },
    highlight: {
      position: 'absolute',
      left: space[6],
      right: space[6],
      top: (STAGE_H - ITEM_H) / 2,
      height: ITEM_H,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceCardElevated,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    row: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[2],
    },
  });
