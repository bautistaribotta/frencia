/* Frencia · Switch — RN port of components/feedback/Switch.jsx
   iOS toggle switch with animated thumb. */

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { radius, motion } from '../theme';
import { useColors } from '../theme-context';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Switch({ checked = false, onChange, disabled = false, style }: SwitchProps) {
  const colors = useColors();
  const t = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: checked ? 1 : 0,
      duration: motion.durBase,
      useNativeDriver: false,
    }).start();
  }, [checked, t]);

  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [3, 23] });
  const trackColor = t.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceChip, colors.accent],
  });
  const borderColor = t.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderSubtle, colors.accent],
  });
  const thumbColor = t.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.switchThumb, colors.switchThumbActive],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => !disabled && onChange?.(!checked)}
      style={style}
    >
      <Animated.View
        style={[styles.track, { backgroundColor: trackColor, borderColor }, disabled && styles.disabled]}
      >
        <Animated.View style={[styles.thumb, { backgroundColor: thumbColor, transform: [{ translateX }] }]} />
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
    ...StyleSheet.flatten({ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.4, shadowRadius: 1, elevation: 1 }),
  },
  disabled: { opacity: 0.4 },
});
