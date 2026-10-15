/* Frencia · Configuracion.
   Pantalla de configuracion de la cuenta. Se llega desde el perfil con boton
   de volver y gesto horizontal. Expone los textos legales y la eliminacion
   de cuenta, con dos confirmaciones en el modal de alerta de la app y 30 dias
   de gracia; ver docs/specs/eliminacion-de-cuenta.md. */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Icon } from '@/design';
import { Fondo, LumeButton, LumeText, Vidrio, lumeFuente, lumeLayout, lumeSpace, useLume } from '@/design/lume';
import { usePedirEliminarCuenta } from '@/lib/pedir-eliminar-cuenta';

export default function SettingsScreen() {
  const { t } = useLume();
  const router = useRouter();
  const { pedir: pedirEliminarCuenta, eliminando } = usePedirEliminarCuenta();

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/profile');
  }

  // Una fila de la lista: icono, titulo y chevron.
  const fila = (
    icono: string,
    titulo: string,
    onPress: () => void,
    { peligro = false, deshabilitada = false }: { peligro?: boolean; deshabilitada?: boolean } = {},
  ) => (
    <Pressable
      onPress={onPress}
      disabled={deshabilitada}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      style={({ pressed }) => [styles.fila, pressed && { backgroundColor: t.surfaceChip }]}
    >
      <View style={styles.filaIzq}>
        <Icon name={icono} size={20} color={peligro ? t.dangerText : t.textSecondary} strokeWidth={1.75} />
        <LumeText rol="bodySm" color={peligro ? t.dangerText : t.textPrimary} style={styles.filaTitulo}>
          {titulo}
        </LumeText>
      </View>
      <Icon name="chevron-right" size={20} color={t.textTertiary} strokeWidth={1.75} />
    </Pressable>
  );

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.volver}>
          <LumeButton variant="ghost" size="sm" icon="chevron-left" onPress={goBack}>
            Atrás
          </LumeButton>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.titulo}>
            <LumeText rol="title">Configuración</LumeText>
          </View>

          {/* Legal: textos de solo lectura, en un mismo recuadro. */}
          <View style={styles.grupo}>
            <LumeText rol="label" color={t.textTertiary}>
              Legal
            </LumeText>
            <Vidrio style={styles.lista}>
              {fila('file-text', 'Términos y Condiciones', () => router.push('/terms'))}
              <View style={[styles.divisor, { backgroundColor: t.divider }]} />
              {fila('shield', 'Política de Privacidad', () => router.push('/privacy'))}
            </Vidrio>
          </View>

          {/* Eliminacion de cuenta: recuadro propio, accion destructiva. */}
          <Vidrio style={styles.lista}>
            {fila('trash-2', 'Eliminación de cuenta', pedirEliminarCuenta, {
              peligro: true,
              deshabilitada: eliminando,
            })}
          </Vidrio>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  safe: { flex: 1 },
  // El boton ghost trae su propio padding: el margen lo corre 10 px a la
  // izquierda para que el chevron quede alineado con el borde del contenido.
  volver: {
    flexDirection: 'row',
    paddingHorizontal: lumeLayout.padScreen - 10,
    paddingTop: lumeSpace[6],
    paddingBottom: lumeSpace[2],
  },
  scroll: {
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[4],
    paddingBottom: lumeSpace[12],
    gap: lumeSpace[7],
  },
  titulo: { justifyContent: 'center', minHeight: 40 },
  grupo: { gap: lumeSpace[3] },
  lista: { overflow: 'hidden' },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: lumeSpace[4],
    padding: lumeSpace[5],
    minHeight: 60,
  },
  filaIzq: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4] },
  filaTitulo: { fontFamily: lumeFuente.semibold },
  divisor: { height: 1, marginLeft: lumeSpace[5] },
});
