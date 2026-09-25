/* Frencia · No se pudo cargar la cuenta.
   El gate del layout raiz manda aca cuando hay sesion pero la lectura del
   perfil fallo o tardo mas que el limite (red caida, Supabase sin responder,
   consulta rota). Antes ese caso se confundia con una cuenta nueva y mandaba
   al setup, donde guardar pisaba los datos reales.

   Dos salidas: reintentar la lectura o volver al inicio de sesion. Si el
   reintento sale bien, el gate ve el perfil cargado y sigue solo a home. */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function ProfileErrorScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { refresh } = useProfile();
  const { showToast } = useToast();
  const [reintentando, setReintentando] = useState(false);

  async function reintentar() {
    setReintentando(true);
    const ok = await refresh();
    setReintentando(false);
    if (!ok) showToast({ message: 'Seguimos sin poder cargar tu cuenta.', type: 'error' });
  }

  // Cerrar la sesion devuelve al login: el gate lo detecta y redirige.
  async function volverAlLogin() {
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        {/* Neutro y no rojo: los datos no corren peligro, solo no se pudieron
            leer. El naranja queda reservado para la intensidad. */}
        <View style={styles.iconWrap}>
          <Icon name="alert-triangle" size={28} color={colors.textSecondary} />
        </View>

        <FrenciaText role="dataLabel" color={colors.textTertiary}>
          Sin respuesta del servidor
        </FrenciaText>

        <FrenciaText role="title" style={styles.title}>
          No pudimos cargar tu cuenta
        </FrenciaText>

        <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.text}>
          Tus datos están a salvo: falló la lectura, no se borró nada.
        </FrenciaText>
        <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.text}>
          Revisá tu conexión y probá de nuevo. Si sigue igual, el problema puede ser de nuestro
          lado.
        </FrenciaText>
      </View>

      <View style={styles.actions}>
        <Button variant="primary" size="lg" icon="repeat" fullWidth loading={reintentando} onPress={reintentar}>
          Reintentar
        </Button>
        <Button variant="ghost" size="md" fullWidth disabled={reintentando} onPress={volverAlLogin}>
          Volver al inicio de sesión
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
