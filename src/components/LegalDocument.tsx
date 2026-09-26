/* Frencia · Documento legal.
   Presenta un texto legal de solo lectura (Terminos y Condiciones, Politica
   de Privacidad): boton de volver, titulo, fecha de vigencia y secciones.
   Las pantallas se llegan con y sin sesion, asi que el fallback de volver
   depende de eso. */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  Button,
  FrenciaText,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';
import { useSession } from '@/contexts/session';
import type { BloqueLegal, SeccionLegal } from '@/lib/legal';

interface LegalDocumentProps {
  titulo: string;
  vigencia: string;
  secciones: SeccionLegal[];
}

export function LegalDocument({ titulo, vigencia, secciones }: LegalDocumentProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { session } = useSession();

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace(session ? '/settings' : '/login');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.backBtn}>
        <Button variant="ghost" size="sm" icon="chevron-left" onPress={goBack}>
          Atrás
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <FrenciaText role="title">{titulo}</FrenciaText>
          <FrenciaText role="dataLabel" color={colors.textTertiary}>
            Última actualización: {vigencia}
          </FrenciaText>
        </View>

        {secciones.map((seccion) => (
          <View key={seccion.titulo} style={styles.section}>
            <FrenciaText role="subtitle" accessibilityRole="header">
              {seccion.titulo}
            </FrenciaText>
            {seccion.bloques.map((bloque, i) => (
              <Bloque key={i} bloque={bloque} />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Bloque({ bloque }: { bloque: BloqueLegal }) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  if (typeof bloque === 'string') {
    return (
      <FrenciaText role="bodySm" color={colors.textSecondary}>
        {bloque}
      </FrenciaText>
    );
  }

  return (
    <View style={styles.list}>
      {bloque.lista.map((item) => (
        <View key={item} style={styles.item}>
          <View style={styles.bullet} />
          <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.itemText}>
            {item}
          </FrenciaText>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgApp },
  // Envuelve el Button de Atras: da el margen de pantalla y el aire.
  backBtn: {
    flexDirection: 'row',
    paddingHorizontal: spacing.padScreen,
    paddingTop: space[8],
    paddingBottom: space[2],
  },
  scroll: {
    paddingHorizontal: spacing.padScreen,
    paddingTop: space[4],
    paddingBottom: space[12],
    gap: space[7],
  },
  header: { gap: space[2] },
  section: { gap: space[3] },
  list: { gap: space[2] },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  // Punto alineado con el centro de la primera linea (lineHeight 22).
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 9,
    backgroundColor: colors.accent,
  },
  itemText: { flex: 1 },
});
