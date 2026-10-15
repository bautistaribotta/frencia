/* ============================================================
   Frencia · Lume · Interruptor
   Pista de 50 x 30. Apagado: surface-chip con borde border-default y la
   perilla en texto secundario. Encendido: pista en accent y la perilla en
   text-on-accent, corrida 20 px. Deshabilitado: perilla en text-disabled.
   ============================================================ */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useLume } from './useLume';
import { lumeMotion } from './tokens';

export interface LumeSwitchProps {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function LumeSwitch({ checked, onChange, disabled = false, accessibilityLabel }: LumeSwitchProps) {
  const { t, reducirMovimiento } = useLume();
  const x = useSharedValue(checked ? 20 : 0);

  useEffect(() => {
    x.value = reducirMovimiento ? (checked ? 20 : 0) : withTiming(checked ? 20 : 0, { duration: lumeMotion.durBase });
  }, [checked, reducirMovimiento, x]);

  const perilla = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Pressable
      onPress={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      hitSlop={7}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled }}
      style={[
        styles.pista,
        checked
          ? { backgroundColor: t.accent, borderColor: t.accent }
          : { backgroundColor: t.surfaceChip, borderColor: disabled ? t.borderSubtle : t.borderDefault },
      ]}
    >
      <Animated.View
        style={[
          styles.perilla,
          { backgroundColor: disabled ? t.textDisabled : checked ? t.textOnAccent : t.textSecondary },
          perilla,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pista: { width: 50, height: 30, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
  perilla: {
    position: 'absolute',
    left: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
  },
});
