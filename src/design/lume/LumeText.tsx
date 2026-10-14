/* Frencia · Lume · Texto con los roles tipograficos de Lume. */

import React from 'react';
import { Text, type TextProps } from 'react-native';

import { useLume } from './useLume';
import { lumeTexto, type LumeRolTexto } from './tipografia';

export interface LumeTextProps extends TextProps {
  rol?: LumeRolTexto;
  color?: string;
}

export function LumeText({ rol = 'body', color, style, ...rest }: LumeTextProps) {
  const { t } = useLume();
  return <Text style={[lumeTexto[rol], { color: color ?? t.textPrimary }, style]} {...rest} />;
}
