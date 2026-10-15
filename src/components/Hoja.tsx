/* Frencia · Hoja — hoja inferior de Lume.
   Vidrio denso (surface-raised) con radio 3xl arriba, un tirador de 36 px y
   el contenido apilado. El fondo se oscurece con el scrim; tocarlo cierra.
   La usan la foto de perfil y la rueda de editar perfil. `rueda` le da el
   aire de la hoja con ruedas (mas margen abajo, mas separacion).
   `onDismiss` es el del Modal: en iOS corre cuando la hoja termino de
   cerrarse, el momento seguro para abrir otro modal nativo.
   Con `superpuesta` no abre un Modal propio: se dibuja como capa encima de
   la pantalla que la contiene (que tiene que montarla como ultimo hijo).
   La usa el selector de ejercicios, que ya es un Modal: una hoja con ruedas
   en un Modal adentro de otro no dejaba scrollear las ruedas. */

import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { lumeLayout, lumeMotion, lumeRadius, lumeSpace, useLume } from '@/design/lume';

export interface HojaProps {
  visible: boolean;
  onCerrar: () => void;
  onDismiss?: () => void;
  rueda?: boolean;
  superpuesta?: boolean;
  children: React.ReactNode;
}

export function Hoja({
  visible,
  onCerrar,
  onDismiss,
  rueda = false,
  superpuesta = false,
  children,
}: HojaProps) {
  const { t, sombras } = useLume();
  const insets = useSafeAreaInsets();

  const contenido = (
    <View style={[styles.velo, { backgroundColor: t.scrim }]}>
      {/* El fondo tocable va al lado de la hoja y no la envuelve: un
         Pressable alrededor le ganaba el gesto a las ruedas, que son un
         scroll, y no se podian mover. */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onCerrar}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
      />
      <View
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
      </View>
    </View>
  );

  if (superpuesta) {
    // Cubre tambien las zonas seguras de quien la contiene, como el Modal.
    if (!visible) return null;
    return (
      <Animated.View
        entering={FadeIn.duration(lumeMotion.durBase)}
        style={[styles.capa, { top: -insets.top, bottom: -insets.bottom }]}
      >
        {contenido}
      </Animated.View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
      onDismiss={onDismiss}
      statusBarTranslucent
    >
      {contenido}
    </Modal>
  );
}

const styles = StyleSheet.create({
  capa: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
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
