/* ============================================================
   Frencia · Lume · Chip de metrica
   Icono + rotulo + valor sobre vidrio: duracion, descanso, RIR, ritmo.
     stack   rotulo arriba y valor abajo, 44 px de alto
     inline  rotulo y valor en una linea, 34 px
   Tonos: neutral (vidrio), signal (lume suave), intensity (tinta suave).
   ============================================================ */

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '../Icon';
import { useLume } from './useLume';
import { LumeText } from './LumeText';
import { lumeFuente } from './tipografia';
import { lumeRadius } from './tokens';

export interface LumeMetricPillProps {
  icon?: string;
  label?: string;
  value: React.ReactNode;
  tone?: 'neutral' | 'signal' | 'intensity';
  layout?: 'stack' | 'inline';
  style?: StyleProp<ViewStyle>;
}

export function LumeMetricPill({
  icon,
  label,
  value,
  tone = 'neutral',
  layout = 'stack',
  style,
}: LumeMetricPillProps) {
  const { t } = useLume();
  const fondo =
    tone === 'signal' ? t.surfaceSignalSoft : tone === 'intensity' ? t.surfaceIntensitySoft : t.surfaceCard;
  const borde =
    tone === 'signal' ? t.surfaceSignalLine : tone === 'intensity' ? t.surfaceIntensityLine : t.glassLine;
  const tinta = tone === 'signal' ? t.signalText : tone === 'intensity' ? t.intensityText : undefined;
  const inline = layout === 'inline';

  return (
    <View
      style={[
        styles.base,
        inline ? styles.inline : styles.stack,
        { backgroundColor: fondo, borderColor: borde },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={16} color={tinta ?? t.textTertiary} strokeWidth={1.75} /> : null}
      <View style={inline ? styles.cuerpoInline : styles.cuerpo}>
        {label ? (
          <LumeText rol="label" color={t.textTertiary} style={styles.rotulo}>
            {label}
          </LumeText>
        ) : null}
        <LumeText rol="data" color={tinta ?? t.textPrimary} style={styles.valor}>
          {value}
        </LumeText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    borderRadius: lumeRadius.md,
    borderWidth: 1,
  },
  stack: { height: 44, paddingHorizontal: 14 },
  inline: { height: 34, paddingHorizontal: 12 },
  cuerpo: { gap: 3 },
  cuerpoInline: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  rotulo: { fontSize: 9.5, lineHeight: 11 },
  valor: { fontFamily: lumeFuente.semibold, fontSize: 15, lineHeight: 17 },
});
