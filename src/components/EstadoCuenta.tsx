/* Frencia · Estado de cuenta (Lume).
   El marco de las dos pantallas unicas que el gate del layout raiz no deja
   pasar hasta resolverlas: la cuenta en eliminacion y la cuenta que no se pudo
   cargar. Fondo cumbre quieto; el icono en una caja de vidrio, el rotulo, el
   titulo y los parrafos arriba; la accion principal y una salida abajo.
   `peligro` pinta el icono y el rotulo en carmin: es el unico carmin de
   pantalla completa, para cuando la cuenta si corre peligro. */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/design';
import {
  Fondo,
  LumeButton,
  LumeText,
  Vidrio,
  lumeLayout,
  lumeRadius,
  lumeSpace,
  useLume,
} from '@/design/lume';

export interface EstadoCuentaProps {
  icono: IconName;
  peligro?: boolean;
  rotulo: string;
  titulo: string;
  parrafos: string[];
  accion: { texto: string; icono?: IconName; cargando?: boolean; onPress: () => void };
  salida: { texto: string; deshabilitada?: boolean; onPress: () => void };
}

export function EstadoCuenta({
  icono,
  peligro = false,
  rotulo,
  titulo,
  parrafos,
  accion,
  salida,
}: EstadoCuentaProps) {
  const { t } = useLume();

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" />
      <SafeAreaView style={styles.pantalla} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.cuerpo}>
          <Vidrio radio={lumeRadius.lg} style={styles.iconoCaja}>
            <Icon
              name={icono}
              size={28}
              strokeWidth={1.75}
              color={peligro ? t.dangerText : t.textSecondary}
            />
          </Vidrio>

          <LumeText rol="label" color={peligro ? t.dangerText : t.textTertiary}>
            {rotulo}
          </LumeText>

          <LumeText rol="title" accessibilityRole="header" style={styles.titulo}>
            {titulo}
          </LumeText>

          {parrafos.map((p) => (
            <LumeText key={p} rol="bodySm" color={t.textSecondary} style={styles.texto}>
              {p}
            </LumeText>
          ))}
        </View>

        <View style={styles.acciones}>
          <LumeButton
            variant="primary"
            size="lg"
            fullWidth
            icon={accion.icono}
            loading={accion.cargando}
            onPress={accion.onPress}
          >
            {accion.texto}
          </LumeButton>
          <LumeButton
            variant="ghost"
            size="md"
            fullWidth
            disabled={salida.deshabilitada}
            onPress={salida.onPress}
          >
            {salida.texto}
          </LumeButton>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  cuerpo: {
    flex: 1,
    justifyContent: 'center',
    gap: lumeSpace[4],
    paddingHorizontal: lumeLayout.padScreen,
  },
  iconoCaja: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: lumeSpace[3],
  },
  titulo: { marginTop: -lumeSpace[2] },
  texto: { marginTop: -lumeSpace[1] },
  acciones: {
    gap: lumeSpace[2],
    paddingHorizontal: lumeLayout.padScreen,
    paddingBottom: lumeSpace[4],
  },
});
