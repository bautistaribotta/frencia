/* ============================================================
   Frencia · Lume · Marco de un paso de wizard
   Los tres wizards de la app (setup, crear rutina y la sesion) comparten
   este marco, para que el pulgar aprenda una sola vez donde esta cada
   cosa:
   1. Barra en una pildora de vidrio: volver a la izquierda (Salir en el
      primer paso, Atras despues), contador 01 / 04 al centro y una accion
      secundaria a la derecha (Saltar en el setup).
   2. Escala de avance debajo de la barra.
   3. Enunciado que arranca siempre a la misma altura: rotulo, pregunta y
      una linea de ayuda. Nunca centrado en vertical.
   4. El control del paso: una sola cosa por pantalla.
   5. Pie con una unica accion ancha.
   El Fondo lo pone la pantalla, porque cada paso declara el suyo.
   ============================================================ */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLume } from './useLume';
import { LumeText } from './LumeText';
import { LumeButton } from './LumeButton';
import { Vidrio } from './Vidrio';
import { Escala } from './Escala';
import { lumeFuente } from './tipografia';
import { lumeLayout, lumeRadius, lumeSpace } from './tokens';

export interface PasoWizardProps {
  actual: number;
  total: number;
  volver?: 'Salir' | 'Atrás';
  onVolver?: () => void;
  volverOff?: boolean;
  derecha?: React.ReactNode;
  rotulo?: string;
  pregunta: string;
  ayuda?: string;
  pie?: React.ReactNode;
  cortes?: number[];
  // El cuerpo scrollea solo si el control no trae su propio scroll
  // vertical (una rueda adentro de un ScrollView pelea por el gesto).
  scroll?: boolean;
  children?: React.ReactNode;
}

const dosCifras = (n: number) => String(n).padStart(2, '0');

export function PasoWizard({
  actual,
  total,
  volver = 'Atrás',
  onVolver,
  volverOff = false,
  derecha,
  rotulo,
  pregunta,
  ayuda,
  pie,
  cortes,
  scroll = false,
  children,
}: PasoWizardProps) {
  const { t } = useLume();
  const insets = useSafeAreaInsets();

  const enunciado = (
    <View style={styles.enunciado}>
      {rotulo ? (
        <LumeText rol="label" color={t.textTertiary}>
          {rotulo}
        </LumeText>
      ) : null}
      <LumeText rol="display" accessibilityRole="header">
        {pregunta}
      </LumeText>
      {ayuda ? (
        <LumeText rol="bodySm" color={t.textSecondary} style={styles.ayuda}>
          {ayuda}
        </LumeText>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.paso, { paddingTop: insets.top }]}>
      <Vidrio nivel="denso" radio={lumeRadius.pill} style={styles.barra}>
        <View style={styles.lado}>
          <LumeButton
            variant="ghost"
            size="sm"
            icon={volver === 'Salir' ? 'x' : 'chevron-left'}
            disabled={volverOff}
            onPress={onVolver}
          >
            {volver}
          </LumeButton>
        </View>
        <View style={styles.contador} accessibilityLabel={`Paso ${actual + 1} de ${total}`}>
          <LumeText rol="data" style={styles.contadorActual}>
            {dosCifras(actual + 1)}
          </LumeText>
          <LumeText rol="data" color={t.textTertiary} style={styles.contadorTotal}>
            / {dosCifras(total)}
          </LumeText>
        </View>
        <View style={[styles.lado, styles.ladoDerecho]}>{derecha}</View>
      </Vidrio>

      <View style={styles.escala}>
        <Escala total={total} actual={actual} cortes={cortes} />
      </View>

      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.cuerpo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {enunciado}
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.cuerpo]}>
          {enunciado}
          {children}
        </View>
      )}

      {pie ? <View style={[styles.pie, { paddingBottom: insets.bottom + lumeSpace[5] }]}>{pie}</View> : null}
    </View>
  );
}

/* Boton de texto para la barra (Saltar, Omitir). */
export interface BotonTextoProps {
  children: React.ReactNode;
  onPress?: () => void;
  senal?: boolean;
  disabled?: boolean;
}

export function BotonTexto({ children, onPress, senal = false, disabled = false }: BotonTextoProps) {
  const { t } = useLume();
  const color = disabled ? t.textDisabled : senal ? t.signalText : t.textSecondary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      hitSlop={4}
      style={({ pressed }) => [styles.botonTexto, pressed && { opacity: 0.6 }]}
    >
      <LumeText rol="bodySm" color={color} style={styles.botonTextoLetra}>
        {children}
      </LumeText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  paso: { flex: 1 },
  flex: { flex: 1 },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: lumeSpace[3],
    marginHorizontal: lumeLayout.padScreen - 6,
    paddingHorizontal: 2,
    minHeight: 44,
  },
  lado: { width: 88, alignItems: 'flex-start' },
  ladoDerecho: { alignItems: 'flex-end' },
  contador: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 6 },
  contadorActual: { fontFamily: lumeFuente.semibold, fontSize: 13, lineHeight: 16 },
  contadorTotal: { fontSize: 13, lineHeight: 16 },
  escala: { paddingTop: lumeSpace[4], paddingHorizontal: lumeLayout.padScreen },
  cuerpo: {
    paddingTop: lumeSpace[9],
    paddingHorizontal: lumeLayout.padScreen,
    paddingBottom: lumeSpace[7],
    gap: lumeSpace[8],
  },
  enunciado: { gap: lumeSpace[4] },
  ayuda: { maxWidth: 320 },
  pie: { gap: lumeSpace[3], paddingTop: lumeSpace[5], paddingHorizontal: lumeLayout.padScreen },
  botonTexto: { height: 44, paddingHorizontal: 10, justifyContent: 'center' },
  botonTextoLetra: { fontFamily: lumeFuente.semibold, lineHeight: 18 },
});
