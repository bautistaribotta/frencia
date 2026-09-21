/* Frencia · Recuperar cuenta.
   Unica pantalla visible mientras la cuenta esta en periodo de gracia: el
   gate del layout raiz manda aca a cualquier sesion con
   `deletion_requested_at` marcado. Ofrece dos salidas: cancelar la solicitud
   (la cuenta queda como estaba) o cerrar sesion. Ver seccion 6.2 de
   docs/specs/eliminacion-de-cuenta.md. */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  Button,
  FrenciaText,
  Icon,
  radius,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { supabase } from '@/lib/supabase';
import { cancelarEliminacionCuenta, fechaLarga, fechaPurga } from '@/lib/cuenta';

export default function AccountRecoveryScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { profile, refresh } = useProfile();
  const { showToast } = useToast();
  const [recuperando, setRecuperando] = useState(false);

  // El gate solo trae aca con la fecha cargada; el fallback es por tipado.
  const purga = profile?.deletionRequestedAt ? fechaLarga(fechaPurga(profile.deletionRequestedAt)) : '';

  // Cancela la solicitud y relee el perfil. Con `deletionRequestedAt` de vuelta
  // en null el gate deja de forzar esta ruta; navegamos a mano a la raiz para
  // que decida entre setup y home como en un ingreso normal.
  async function recuperar() {
    setRecuperando(true);
    const ok = await cancelarEliminacionCuenta();
    if (!ok) {
      setRecuperando(false);
      showToast({ message: 'No pudimos recuperar la cuenta. Proba de nuevo.', type: 'error' });
      return;
    }
    await refresh();
    showToast({ message: 'Cuenta recuperada', type: 'success' });
    router.replace('/');
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Icon name="clock" size={28} color={colors.dangerText} />
        </View>

        <FrenciaText role="dataLabel" color={colors.dangerText}>
          Eliminación programada
        </FrenciaText>

        <FrenciaText role="title" style={styles.title}>
          Tu cuenta se elimina el {purga}
        </FrenciaText>

        <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.text}>
          Pediste eliminar tu cuenta y la solicitud sigue vigente. Si la recuperás ahora, todo
          queda como lo dejaste: rutinas, sesiones e historial.
        </FrenciaText>
        <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.text}>
          Pasada esa fecha, los datos se borran y no se pueden recuperar.
        </FrenciaText>
      </View>

      <View style={styles.actions}>
        <Button variant="primary" size="lg" fullWidth loading={recuperando} onPress={recuperar}>
          Recuperar cuenta
        </Button>
        <Button variant="ghost" size="md" fullWidth disabled={recuperando} onPress={cerrarSesion}>
          Cerrar sesión
        </Button>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: spacing.padScreen },
    body: { flex: 1, justifyContent: 'center', gap: space[4] },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      marginBottom: space[2],
    },
    title: { marginTop: -space[2] },
    text: { marginTop: -space[1] },
    actions: { gap: space[2], paddingBottom: space[4] },
  });
