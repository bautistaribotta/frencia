/* Frencia · Hoja — hoja inferior de Lume.
   Vidrio denso (surface-raised) con radio 3xl arriba, un tirador de 36 px y
   el contenido apilado. El fondo se oscurece con el scrim; tocarlo cierra.
   La usan la foto de perfil y la rueda de editar perfil. `rueda` le da el
   aire de la hoja con ruedas (mas margen abajo, mas separacion).
   `onDismiss` es el del Modal: en iOS corre cuando la hoja termino de
   cerrarse, el momento seguro para abrir otro modal nativo. */

import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { lumeLayout, lumeRadius, lumeSpace, useLume } from '@/design/lume';

export interface HojaProps {
  visible: boolean;
  onCerrar: () => void;
  onDismiss?: () => void;
  rueda?: boolean;
  children: React.ReactNode;
}

export function Hoja({ visible, onCerrar, onDismiss, rueda = false, children }: HojaProps) {
  const { t, sombras } = useLume();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
      onDismiss={onDismiss}
      statusBarTranslucent
    >
      <Pressable style={[styles.velo, { backgroundColor: t.scrim }]} onPress={onCerrar}>
        {/* Frena el toque para que tocar la hoja no la cierre. */}
        <Pressable
          onPress={() => {}}
          style={[
            styles.hoja,
            rueda && styles.hojaRueda,
            {
              backgroundColor: t.surfaceRaisedOpaco,
              borderColor: t.glassLine,
              boxShadow: sombras.lg,
              paddingBottom: (rueda ? lumeSpace[9] : lumeSpace[8]) + insets.bottom,
            },
          ]}
        >
          <View style={[styles.tirador, { backgroundColor: t.borderDefault }]} />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  velo: { flex: 1, justifyContent: 'flex-end' },
  hoja: {
    borderTopLeftRadius: lumeRadius['3xl'],
    borderTopRightRadius: lumeRadius['3xl'],
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: lumeSpace[3],
    paddingHorizontal: lumeLayout.padScreen,
    gap: lumeSpace[3],
  },
  hojaRueda: { gap: lumeSpace[5] },
  tirador: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, marginBottom: lumeSpace[3] },
});
