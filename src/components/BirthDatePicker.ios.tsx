/* Frencia · BirthDatePicker (iOS) — rueda de fecha nativa.
   Usa el DatePicker de SwiftUI en estilo "wheel" via @expo/ui: la misma rueda
   dia/mes/año del sistema, con su fisica y sus haptics nativas. El mes sale en
   español segun el locale del dispositivo. Solo iOS; el fallback vive en
   BirthDatePicker.tsx. */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Host, DatePicker } from '@expo/ui/swift-ui';
import { datePickerStyle } from '@expo/ui/swift-ui/modifiers';

import { useTheme } from '@/design';
import { MAX_BIRTHDATE, MIN_BIRTHDATE } from '@/lib/birthdate';

export interface BirthDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export function BirthDatePicker({ value, onChange }: BirthDatePickerProps) {
  const { mode } = useTheme();
  return (
    <View style={styles.wrap}>
      <Host matchContents colorScheme={mode} style={styles.host}>
        <DatePicker
          selection={value}
          displayedComponents={['date']}
          range={{ start: MIN_BIRTHDATE, end: MAX_BIRTHDATE }}
          onDateChange={onChange}
          modifiers={[datePickerStyle('wheel')]}
        />
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', alignItems: 'center' },
  host: { alignSelf: 'stretch', height: 216 },
});
