/* Frencia · Tag — etiqueta para grupos musculares, categorias y filtros (Lume).
   Pildora de vidrio de 34 px con el texto en secundario. Elegida, se rellena
   en accent (lume en oscuro, tinta en claro) con el texto en text-on-accent;
   quien la usa ademas cambia el icono por un check, asi la seleccion no
   depende solo del color. */

import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '../Icon';
import { useLume } from '../lume/useLume';
import { lumeFuente } from '../lume/tipografia';

export interface TagProps {
  selected?: boolean;
  selectable?: boolean;
  dot?: boolean;
  /** Icono antes del texto, en el mismo color (filtro por tipo del catalogo). */
  icon?: IconName;
  onPress?: () => void;
  /** Nombre para el lector de pantalla cuando el texto visible no alcanza. */
  accessibilityLabel?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function Tag({
  selected = false,
  selectable = false,
  dot = false,
  icon,
  onPress,
  accessibilityLabel,
  children,
  style,
}: TagProps) {
  const { t } = useLume();
  const fg = selected ? t.textOnAccent : t.textSecondary;
  const content = (
    <>
      {dot ? <View style={[styles.dot, { backgroundColor: fg }]} /> : null}
      {icon ? <Icon name={icon} size={14} strokeWidth={1.75} color={fg} /> : null}
      <Text style={[styles.text, { color: fg }]}>{children}</Text>
    </>
  );
  const boxStyle = [
    styles.base,
    selected
      ? { backgroundColor: t.accent, borderColor: t.accent }
      : { backgroundColor: t.surfaceCard, borderColor: t.glassLine },
    style,
  ];

  if (selectable || onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...boxStyle,
          pressed && !selected && { borderColor: t.borderStrong },
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={boxStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { fontFamily: lumeFuente.medium, fontSize: 13, lineHeight: 17 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});
