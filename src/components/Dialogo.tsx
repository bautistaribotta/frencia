/* Frencia · Dialogo — base compartida de los modales de confirmacion (Lume).
   Vidrio denso centrado sobre el scrim, con titulo, texto y los botones
   apilados a lo ancho. La usan el modal de alerta (src/contexts/alerta.tsx)
   y ArchiveRoutineDialog, asi un cambio de diseno se aplica a los dos. Los
   botones los pone quien la usa. */

import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { LumeText, lumeLayout, lumeRadius, lumeSpace, useLume } from '@/design/lume';

export interface DialogoProps {
  visible: boolean;
  titulo?: string;
  mensaje?: string;
  /** Tocar fuera de la tarjeta o el boton atras de Android. */
  onDescartar: () => void;
  /** Los botones de accion. */
  children: React.ReactNode;
}

export function Dialogo({ visible, titulo, mensaje, onDescartar, children }: DialogoProps) {
  const { t, sombras } = useLume();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDescartar} statusBarTranslucent>
      <Pressable
        style={[styles.velo, { backgroundColor: t.scrim }]}
        onPress={onDescartar}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
      >
        {/* Frena el toque para que tocar la tarjeta no la cierre. */}
        <Pressable
          style={[
            styles.tarjeta,
            { backgroundColor: t.surfaceRaisedOpaco, borderColor: t.glassLine, boxShadow: sombras.lg },
          ]}
          onPress={() => {}}
          accessibilityRole="alert"
        >
          <View style={styles.textos}>
            {titulo ? <LumeText rol="subtitle">{titulo}</LumeText> : null}
            {mensaje ? (
              <LumeText rol="bodySm" color={t.textSecondary}>
                {mensaje}
              </LumeText>
            ) : null}
          </View>

          <View style={styles.acciones}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  velo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: lumeLayout.padScreen,
  },
  tarjeta: {
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderRadius: lumeRadius['2xl'],
    paddingTop: lumeSpace[7],
    paddingHorizontal: lumeLayout.padCard,
    paddingBottom: lumeLayout.padCard,
    gap: lumeSpace[7],
  },
  textos: { gap: lumeSpace[4] },
  acciones: { gap: lumeSpace[4] },
});
