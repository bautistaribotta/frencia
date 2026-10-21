/* Frencia · Switch — RN port of components/feedback/Switch.jsx
   iOS toggle switch with animated thumb. */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { radius, motion } from '../theme';
import { useColors, useShadows } from '../theme-context';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Switch({ checked = false, onChange, disabled = false, style }: SwitchProps) {
  const colors = useColors();
  const shadows = useShadows();
  const t = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    t.set(withTiming(checked ? 1 : 0, { duration: motion.durBase }));
  }, [checked, t]);

  const pista = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.get(), [0, 1], [colors.surfaceChip, colors.accent]),
    borderColor: interpolateColor(t.get(), [0, 1], [colors.borderSubtle, colors.accent]),
  }));
  const perilla = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.get(), [0, 1], [colors.switchThumb, colors.switchThumbActive]),
    transform: [{ translateX: 3 + t.get() * 20 }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => !disabled && onChange?.(!checked)}
      style={style}
    >
      <Animated.View style={[styles.track, pista, disabled && styles.disabled]}>
        <Animated.View style={[styles.thumb, shadows.sm, perilla]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 52,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  disabled: { opacity: 0.4 },
});
