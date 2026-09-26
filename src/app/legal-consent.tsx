/* Frencia · Aceptacion de los textos legales.
   Primera pantalla de la app para quien no acepto las versiones vigentes de
   los Terminos y Condiciones y la Politica de Privacidad: cuentas nuevas antes
   del setup, y cualquier cuenta cuando cambia una version. La manda el gate
   del layout raiz y no se puede saltear.

   Cada documento tiene su checkbox, pero no se marca tocandolo: se marca al
   volver de abrir ese documento, para asegurar que al menos se abrio. Con los
   dos marcados se habilita Aceptar, que registra la aceptacion con las
   versiones vigentes y la fecha del servidor (public.aceptaciones_legales).
   Despues el gate sigue solo al setup o al inicio. La otra salida es cerrar
   sesion. */

import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { Checkbox } from '@/components/Checkbox';
import { supabase } from '@/lib/supabase';
import { TERMINOS_VIGENCIA } from '@/lib/terminos';
import { PRIVACIDAD_VIGENCIA } from '@/lib/privacidad';

import {
  Button,
  FrenciaText,
  Icon,
  radius,
  sans,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

type Documento = 'terminos' | 'privacidad';

const DOCUMENTOS: { id: Documento; titulo: string; vigencia: string; ruta: '/terms' | '/privacy' }[] = [
  { id: 'terminos', titulo: 'Términos y Condiciones', vigencia: TERMINOS_VIGENCIA, ruta: '/terms' },
  { id: 'privacidad', titulo: 'Política de Privacidad', vigencia: PRIVACIDAD_VIGENCIA, ruta: '/privacy' },
];

export default function LegalConsentScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { aceptarLegales } = useProfile();
  const { showToast } = useToast();

  const [leidos, setLeidos] = useState<Record<Documento, boolean>>({ terminos: false, privacidad: false });
  const [aceptando, setAceptando] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  // Documento que se abrio y todavia no se marco: se marca al volver a esta
  // pantalla, no al tocarlo.
  const abierto = useRef<Documento | null>(null);

  useFocusEffect(
    useCallback(() => {
      const doc = abierto.current;
      if (!doc) return;
      abierto.current = null;
      setLeidos((prev) => ({ ...prev, [doc]: true }));
    }, []),
  );

  const ambos = leidos.terminos && leidos.privacidad;
  const ocupada = aceptando || saliendo;

  function abrir(doc: (typeof DOCUMENTOS)[number]) {
    if (ocupada) return;
    abierto.current = doc.id;
    router.push(doc.ruta);
  }

  async function aceptar() {
    if (!ambos || ocupada) return;
    setAceptando(true);
    const ok = await aceptarLegales();
    setAceptando(false);
    // Si salio bien no hay nada mas que hacer: el gate ve la aceptacion y
    // sigue al setup o al inicio.
    if (!ok) showToast({ message: 'No pudimos guardar tu aceptación. Probá de nuevo.', type: 'error' });
  }

  // Cerrar la sesion devuelve al login: el gate lo detecta y redirige.
  async function cerrarSesion() {
    if (ocupada) return;
    setSaliendo(true);
    await supabase.auth.signOut();
    setSaliendo(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.encabezado}>
          <FrenciaText role="dataLabel" color={colors.textTertiary}>
            Antes de empezar
          </FrenciaText>
          <FrenciaText role="title">Términos y privacidad</FrenciaText>
          <FrenciaText role="bodySm" color={colors.textSecondary}>
            Para usar Frencia necesitás aceptar los Términos y Condiciones y la Política de
            Privacidad.
          </FrenciaText>
        </View>

        <View style={styles.lista}>
          {DOCUMENTOS.map((doc, i) => (
            <React.Fragment key={doc.id}>
              {i > 0 && <View style={styles.divisor} />}
              <Pressable
                onPress={() => abrir(doc)}
                disabled={ocupada}
                accessibilityRole="button"
                accessibilityLabel={`Leer ${doc.titulo}`}
                accessibilityHint="Al volver queda marcado como leído"
                accessibilityState={{ checked: leidos[doc.id], disabled: ocupada }}
              >
                <View style={styles.fila}>
                  <Checkbox marcado={leidos[doc.id]} />
                  <View style={styles.filaTexto}>
                    <FrenciaText role="bodySm" style={styles.filaTitulo}>
                      {doc.titulo}
                    </FrenciaText>
                    <FrenciaText role="dataLabel" color={leidos[doc.id] ? colors.accentText : colors.textTertiary}>
                      {leidos[doc.id] ? 'Leído' : `Vigente desde el ${doc.vigencia}`}
                    </FrenciaText>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.textTertiary} />
                </View>
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      <View style={styles.acciones}>
        {!ambos && (
          <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.aviso}>
            Abrí los dos documentos para poder continuar.
          </FrenciaText>
        )}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon="check"
          disabled={!ambos || saliendo}
          loading={aceptando}
          onPress={aceptar}
        >
          Aceptar y continuar
        </Button>
        <Button variant="ghost" size="md" fullWidth disabled={aceptando} loading={saliendo} onPress={cerrarSesion}>
          Cerrar sesión
        </Button>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.padScreen,
      paddingVertical: space[8],
      gap: space[8],
    },
    encabezado: { gap: space[3] },

    lista: {
      backgroundColor: colors.surfaceCard,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      overflow: 'hidden',
    },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      padding: space[5],
    },
    filaTexto: { flex: 1, gap: space[1] },
    filaTitulo: { fontFamily: sans.semibold },
    divisor: { height: 1, marginLeft: space[5], backgroundColor: colors.divider },

    acciones: { paddingHorizontal: spacing.padScreen, paddingBottom: space[4], gap: space[2] },
    aviso: { textAlign: 'center', marginBottom: space[2] },
  });
