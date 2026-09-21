/* Frencia · ArchiveRoutineDialog — que hacer con la rutina activa al crear otra.
   Solo puede haber una rutina activa, asi que antes de armar una nueva el
   usuario decide: reemplazar la actual con la nueva, seguir con la actual y
   guardar la nueva archivada, o no crear nada (Cancelar). Es un Modal propio y no Alert nativo para respetar el diseno de
   la app: verde en el camino principal, rojo en el que aborta. */

import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import {
  Button,
  FrenciaText,
  radius,
  shadow,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

export interface ArchiveRoutineDialogProps {
  visible: boolean;
  /** Nombre de la rutina que hoy esta activa. */
  nombreActual: string;
  onContinuar: () => void;
  onMantener: () => void;
  onCancelar: () => void;
}

export function ArchiveRoutineDialog({
  visible,
  nombreActual,
  onContinuar,
  onMantener,
  onCancelar,
}: ArchiveRoutineDialogProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar} statusBarTranslucent>
      {/* Tocar fuera de la tarjeta cuenta como cancelar. */}
      <Pressable style={styles.backdrop} onPress={onCancelar}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.texts}>
            <FrenciaText role="subtitle">¿Qué hacemos con "{nombreActual}"?</FrenciaText>
            <FrenciaText role="bodySm" color={colors.textSecondary}>
              Solo podés tener una rutina activa. La nueva puede reemplazarla, o quedar
              guardada en tus rutinas para activarla cuando quieras.
            </FrenciaText>
          </View>

          <View style={styles.actions}>
            <Button variant="primary" size="lg" fullWidth onPress={onContinuar}>
              Reemplazarla con la nueva
            </Button>
            <Button variant="secondary" size="lg" fullWidth onPress={onMantener}>
              Seguir con esta, guardar la nueva
            </Button>
            <Button variant="danger" size="lg" fullWidth onPress={onCancelar}>
              Cancelar
            </Button>
          </View>
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
      padding: spacing.padScreen,
    },
    card: {
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
