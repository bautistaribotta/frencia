/* Frencia · Sesion · Cabecera del wizard: salir, dia y ejercicio, menu.
   Debajo, la escala con toda la sesion. */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Escala,
  LumeIconButton,
  LumeText,
  Vidrio,
  lumeFuente,
  lumeLayout,
  lumeRadius,
  lumeSpace,
  useLume,
} from '@/design/lume';

export function CabezaSesion({
  nombreDia,
  nroEjercicio,
  totalEjercicios,
  totalPasos,
  actual,
  cortes,
  onSalir,
  onMenu,
}: {
  nombreDia: string;
  nroEjercicio: number;
  totalEjercicios: number;
  totalPasos: number;
  actual: number;
  cortes: number[];
  onSalir: () => void;
  onMenu: () => void;
}) {
  const { t } = useLume();
  return (
    <>
      <Vidrio nivel="denso" radio={lumeRadius.pill} style={styles.cabeza}>
        <LumeIconButton
          icon="x"
          variant="ghost"
          size="md"
          accessibilityLabel="Salir"
          onPress={onSalir}
        />
        <View
          style={styles.contador}
          accessible
          accessibilityLabel={`${nombreDia}, ejercicio ${nroEjercicio} de ${totalEjercicios}`}
        >
          <LumeText rol="data" numberOfLines={1} style={styles.contadorDia}>
            {nombreDia}
          </LumeText>
          <LumeText rol="data" color={t.textTertiary} style={styles.contadorNro}>
            · {nroEjercicio} / {totalEjercicios}
          </LumeText>
        </View>
        <LumeIconButton
          icon="more-horizontal"
          variant="ghost"
          size="md"
          accessibilityLabel="Menú del ejercicio"
          onPress={onMenu}
        />
      </Vidrio>
      <View style={styles.escala}>
        <Escala total={totalPasos} actual={actual} cortes={cortes} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // La cabecera en una pildora de vidrio, como la barra de los otros wizards.
  cabeza: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[3],
    marginTop: lumeSpace[2],
    marginHorizontal: lumeLayout.padScreen - 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  contador: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  contadorDia: { flexShrink: 1, fontFamily: lumeFuente.semibold, fontSize: 13, lineHeight: 16 },
  contadorNro: { fontSize: 13, lineHeight: 16 },
  escala: { paddingTop: lumeSpace[4], paddingHorizontal: lumeLayout.padScreen },
});
