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

import { Icon, type IconName } from '../Icon';
import { useLume, useLumeStyles } from './useLume';
import { LumeText } from './LumeText';
import { lumeFuente } from './tipografia';
import { lumeRadius, type LumePalette } from './tokens';

export type TonoBadge = 'neutral' | 'signal' | 'intensity' | 'danger';

export interface LumeBadgeProps {
  tone?: TonoBadge;
  icon?: IconName;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function LumeBadge({ tone = 'neutral', icon, children, style }: LumeBadgeProps) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);
  const tinta: Record<TonoBadge, string> = {
    neutral: t.textSecondary,
    signal: t.signalText,
    intensity: t.intensityText,
    danger: t.dangerText,
  };

  return (
    <View style={[styles.base, styles[tone], style]}>
      {icon ? <Icon name={icon} size={12} color={tinta[tone]} strokeWidth={2} /> : null}
      <LumeText rol="label" color={tinta[tone]} style={styles.texto} numberOfLines={1}>
        {children}
      </LumeText>
    </View>
  );
}

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
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
    neutral: { borderColor: t.borderDefault },
    signal: { backgroundColor: t.surfaceSignalSoft, borderColor: t.surfaceSignalLine },
    intensity: { backgroundColor: t.surfaceIntensitySoft, borderColor: t.surfaceIntensityLine },
    danger: { borderColor: t.danger },
    texto: { fontFamily: lumeFuente.semiSemibold, fontSize: 10.5, lineHeight: 13, letterSpacing: 0.84 },
  });
