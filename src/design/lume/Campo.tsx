/* ============================================================
   Frencia · Lume · Campo de texto con icono
   Vidrio normal. En foco sube a vidrio fuerte y toma el borde de lume con
   un anillo de 1 px; el icono tambien pasa a lume. Nada mas cambia de
   color. Con `iconoAcento` el icono va en lume siempre (el nombre de la
   rutina o del dia); con `lg` el campo gana aire a los costados.
   ============================================================ */

import React, { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Icon, type IconName } from '../Icon';
import { useLume } from './useLume';
import { lumeFuente } from './tipografia';
import { lumeLayout, lumeRadius } from './tokens';

export interface CampoProps extends TextInputProps {
  icono: IconName;
  // Algo al final del campo (el ojo de la contraseña).
  final?: React.ReactNode;
  iconoAcento?: boolean;
  lg?: boolean;
}

export const Campo = forwardRef<TextInput, CampoProps>(function Campo(
  { icono, final, iconoAcento = false, lg = false, onFocus, onBlur, style, ...rest },
  ref,
) {
  const { t, sombras } = useLume();
  const [foco, setFoco] = useState(false);

  return (
    <View
      style={[
        styles.campo,
        lg && styles.campoLg,
        foco
          ? {
              backgroundColor: t.surfaceCardElevated,
              borderColor: t.signal,
              boxShadow: `${sombras.glass}, 0 0 0 1px ${t.signal}`,
            }
          : {
              backgroundColor: t.surfaceCard,
              borderColor: t.glassLine,
              borderTopColor: t.glassHighlight,
              boxShadow: sombras.glass,
            },
      ]}
    >
      <Icon name={icono} size={20} color={foco || iconoAcento ? t.signal : t.textTertiary} strokeWidth={1.75} />
      <TextInput
        ref={ref}
        style={[styles.input, { color: t.textPrimary }, style]}
        placeholderTextColor={t.textTertiary}
        selectionColor={t.signal}
        cursorColor={t.signal}
        onFocus={(e) => {
          setFoco(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFoco(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {final}
    </View>
  );
});

const styles = StyleSheet.create({
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: lumeLayout.controlHLg,
    paddingHorizontal: lumeLayout.padControl,
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
  },
  campoLg: { paddingHorizontal: 20 },
  input: {
    flex: 1,
    fontFamily: lumeFuente.regular,
    fontSize: 16,
    padding: 0,
  },
});
