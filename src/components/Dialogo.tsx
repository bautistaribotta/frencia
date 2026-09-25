/* Frencia · Dialogo — base compartida de los modales de confirmacion.
   Tarjeta elevada centrada sobre un fondo oscuro, con titulo, texto y los
   botones apilados a lo ancho. La usan el modal de alerta
   (src/contexts/alerta.tsx) y ArchiveRoutineDialog, asi un cambio de diseno
   se aplica a los dos. Los botones los pone quien la usa. */

import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import {
  FrenciaText,
  radius,
  shadow,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

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
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDescartar} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onDescartar}>
        {/* Frena el toque para que tocar la tarjeta no la cierre. */}
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.texts}>
            {titulo ? <FrenciaText role="subtitle">{titulo}</FrenciaText> : null}
            {mensaje ? (
              <FrenciaText role="bodySm" color={colors.textSecondary}>
                {mensaje}
              </FrenciaText>
            ) : null}
          </View>

          <View style={styles.actions}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.padScreen,
    },
    card: {
      width: '100%',
      maxWidth: 480,
      backgroundColor: colors.surfaceCardElevated,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: radius.xl,
      padding: spacing.padCard,
      gap: space[7],
      ...shadow.lg,
    },
    texts: { gap: space[3] },
    actions: { gap: space[3] },
  });
