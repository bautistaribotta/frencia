/* ============================================================
   Frencia · Lume · Badge
   Marca de estado compacta: la racha, RIR, PR, tipo de serie. Sans en
   mayusculas, ancho semi.
     neutral    delineado, texto secundario
     signal     lume suave (lo en curso)
     intensity  tinta suave (el esfuerzo; va con la llama)
     danger     carmin delineado
   ============================================================ */

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '../Icon';
import { useLume } from './useLume';
import { LumeText } from './LumeText';
import { lumeFuente } from './tipografia';
import { lumeRadius } from './tokens';

export type TonoBadge = 'neutral' | 'signal' | 'intensity' | 'danger';

export interface LumeBadgeProps {
  tone?: TonoBadge;
  icon?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function LumeBadge({ tone = 'neutral', icon, children, style }: LumeBadgeProps) {
  const { t } = useLume();
  const tonos: Record<TonoBadge, { fondo: string; tinta: string; borde: string }> = {
    neutral: { fondo: 'transparent', tinta: t.textSecondary, borde: t.borderDefault },
    signal: { fondo: t.surfaceSignalSoft, tinta: t.signalText, borde: t.surfaceSignalLine },
    intensity: { fondo: t.surfaceIntensitySoft, tinta: t.intensityText, borde: t.surfaceIntensityLine },
    danger: { fondo: 'transparent', tinta: t.dangerText, borde: t.danger },
  };
  const { fondo, tinta, borde } = tonos[tone];

  return (
    <View style={[styles.base, { backgroundColor: fondo, borderColor: borde }, style]}>
      {icon ? <Icon name={icon} size={12} color={tinta} strokeWidth={2} /> : null}
      <LumeText rol="label" color={tinta} style={styles.texto} numberOfLines={1}>
        {children}
      </LumeText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: lumeRadius.sm,
    borderWidth: 1,
  },
  texto: { fontFamily: lumeFuente.semiSemibold, fontSize: 10.5, lineHeight: 13, letterSpacing: 0.84 },
});
