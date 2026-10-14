/* Frencia · Documento legal (Lume).
   Presenta un texto legal de solo lectura (Terminos y Condiciones, Politica
   de Privacidad): boton de volver, titulo, fecha de vigencia y secciones.
   Se abre desde el acceso y desde la aceptacion de los textos, que son
   onboarding, asi que lleva el fondo cumbre con las luces derivando.
   Las pantallas se llegan con y sin sesion, asi que el fallback de volver
   depende de eso. */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useSession } from '@/contexts/session';
import type { BloqueLegal, SeccionLegal } from '@/lib/legal';
import { Fondo, LumeButton, LumeText, lumeLayout, lumeSpace, useLume } from '@/design/lume';

interface LegalDocumentProps {
  titulo: string;
  vigencia: string;
  secciones: SeccionLegal[];
}

export function LegalDocument({ titulo, vigencia, secciones }: LegalDocumentProps) {
  const { t } = useLume();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useSession();

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace(session ? '/settings' : '/login');
  }

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" animado />

      <View style={[styles.volver, { paddingTop: insets.top + lumeSpace[6] }]}>
        <LumeButton variant="ghost" size="sm" icon="chevron-left" onPress={goBack}>
          Atrás
        </LumeButton>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + lumeSpace[12] }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.encabezado}>
          <LumeText rol="title" accessibilityRole="header">
            {titulo}
          </LumeText>
          <LumeText rol="label" color={t.textTertiary}>
            Última actualización: {vigencia}
          </LumeText>
        </View>

        {secciones.map((seccion) => (
          <View key={seccion.titulo} style={styles.seccion}>
            <LumeText rol="subtitle" accessibilityRole="header">
              {seccion.titulo}
            </LumeText>
            {seccion.bloques.map((bloque, i) => (
              <Bloque key={i} bloque={bloque} />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Bloque({ bloque }: { bloque: BloqueLegal }) {
  const { t } = useLume();

  if (typeof bloque === 'string') {
    return (
      <LumeText rol="bodySm" color={t.textSecondary}>
        {bloque}
      </LumeText>
    );
  }

  return (
    <View style={styles.lista}>
      {bloque.lista.map((item) => (
        <View key={item} style={styles.item}>
          <View style={[styles.vineta, { backgroundColor: t.textTertiary }]} />
          <LumeText rol="bodySm" color={t.textSecondary} style={styles.itemTexto}>
            {item}
          </LumeText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  volver: {
    flexDirection: 'row',
    paddingHorizontal: lumeLayout.padScreen - 10,
    paddingBottom: lumeSpace[2],
  },
  scroll: {
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[4],
    gap: lumeSpace[7],
  },
  encabezado: { gap: lumeSpace[3] },
  seccion: { gap: lumeSpace[4] },
  lista: { gap: lumeSpace[3] },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: lumeSpace[3] },
  // Raya alineada con el centro de la primera linea (lineHeight 20).
  vineta: { width: 8, height: 1, marginTop: 10 },
  itemTexto: { flex: 1 },
});
