/* ============================================================
   Frencia · Lume · Casilla (checkbox)
   Cuadrada, radio 8. Marcada = relleno accent con el check en
   text-on-accent. Sin onChange es un indicador estatico.
   ============================================================ */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '../Icon';
import { useLume } from './useLume';
import { lumeRadius } from './tokens';

export interface CasillaProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Casilla({ checked, onChange, disabled = false }: CasillaProps) {
  const { t } = useLume();
  return (
    <Pressable
      disabled={disabled || !onChange}
      onPress={() => onChange?.(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={[
        styles.caja,
        checked
          ? { backgroundColor: t.accent, borderColor: t.accent }
          : { borderColor: disabled ? t.borderSubtle : t.borderStrong },
      ]}
    >
      {checked ? <Icon name="check" size={15} color={t.textOnAccent} strokeWidth={2.5} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  caja: {
    width: 24,
    height: 24,
    borderRadius: lumeRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
