/* Frencia · Aceptacion de los textos legales (Lume).
   Primera pantalla de la app para quien no acepto las versiones vigentes de
   los Terminos y Condiciones y la Politica de Privacidad: cuentas nuevas antes
   del setup, y cualquier cuenta cuando cambia una version. La manda el gate
   del layout raiz y no se puede saltear. Es parte del onboarding: fondo
   cumbre con las luces derivando.

   Cada documento tiene su casilla, pero no se marca tocandola: se marca al
   volver de abrir ese documento, para asegurar que al menos se abrio. Con los
   dos marcados se habilita Aceptar, que registra la aceptacion con las
   versiones vigentes y la fecha del servidor (public.aceptaciones_legales).
   Despues el gate sigue solo al setup o al inicio. Quien no acepta puede
   cerrar sesion o pedir la eliminacion de la cuenta, con el mismo flujo de
   Configuracion (30 dias de gracia). Las cuentas nuevas que nunca aceptan se
   borran solas a los 30 dias, ver public.purgar_cuentas_sin_aceptacion(). */

import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { supabase } from '@/lib/supabase';
import { usePedirEliminarCuenta } from '@/lib/pedir-eliminar-cuenta';
import { TERMINOS_VIGENCIA } from '@/lib/terminos';
import { PRIVACIDAD_VIGENCIA } from '@/lib/privacidad';

import { Icon } from '@/design';
import { Casilla, Fondo, LumeButton, LumeText, Vidrio, lumeFuente, lumeLayout, lumeSpace, useLume, useLumeStyles, type LumePalette } from '@/design/lume';

type Documento = 'terminos' | 'privacidad';

const DOCUMENTOS: { id: Documento; titulo: string; vigencia: string; ruta: '/terms' | '/privacy' }[] = [
  { id: 'terminos', titulo: 'Términos y Condiciones', vigencia: TERMINOS_VIGENCIA, ruta: '/terms' },
  { id: 'privacidad', titulo: 'Política de Privacidad', vigencia: PRIVACIDAD_VIGENCIA, ruta: '/privacy' },
];

export default function LegalConsentScreen() {
  const { t } = useLume();
  const tema = useLumeStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { aceptarLegales } = useProfile();
  const { showToast } = useToast();

  const [leidos, setLeidos] = useState<Record<Documento, boolean>>({ terminos: false, privacidad: false });
  const [aceptando, setAceptando] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const { pedir: pedirEliminarCuenta, eliminando } = usePedirEliminarCuenta();
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
  const ocupada = aceptando || saliendo || eliminando;

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
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" animado />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + lumeSpace[8] }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.encabezado}>
          <LumeText rol="label" color={t.textTertiary}>
            Antes de empezar
          </LumeText>
          <LumeText rol="title" accessibilityRole="header">
            Términos y privacidad
          </LumeText>
          <LumeText rol="bodySm" color={t.textSecondary}>
            Para usar Frencia necesitás aceptar los Términos y Condiciones y la Política de Privacidad.
          </LumeText>
        </View>

        <Vidrio style={styles.lista}>
          {DOCUMENTOS.map((doc, i) => (
            <React.Fragment key={doc.id}>
              {i > 0 ? <View style={[styles.divisor, tema.divisor]} /> : null}
              <Pressable
                onPress={() => abrir(doc)}
                disabled={ocupada}
                accessibilityRole="button"
                accessibilityLabel={`Leer ${doc.titulo}`}
                accessibilityHint="Al volver queda marcado como leído"
                accessibilityState={{ checked: leidos[doc.id], disabled: ocupada }}
                style={({ pressed }) => [styles.fila, pressed && tema.presionada]}
              >
                <Casilla checked={leidos[doc.id]} />
                <View style={styles.filaTexto}>
                  <LumeText rol="bodySm" style={styles.semi}>
                    {doc.titulo}
                  </LumeText>
                  <LumeText rol="label" color={leidos[doc.id] ? t.signalText : t.textTertiary}>
                    {leidos[doc.id] ? 'Leído' : `Vigente desde el ${doc.vigencia}`}
                  </LumeText>
                </View>
                <Icon name="chevron-right" size={20} color={t.textTertiary} strokeWidth={1.75} />
              </Pressable>
            </React.Fragment>
          ))}
        </Vidrio>
      </ScrollView>

      <View style={[styles.acciones, { paddingBottom: insets.bottom + lumeSpace[4] }]}>
        {!ambos ? (
          <LumeText rol="bodySm" color={t.textTertiary} style={styles.aviso}>
            Abrí los dos documentos para poder continuar.
          </LumeText>
        ) : null}
        <LumeButton
          variant="primary"
          size="lg"
          fullWidth
          icon="check"
          disabled={!ambos || saliendo || eliminando}
          loading={aceptando}
          onPress={aceptar}
        >
          Aceptar y continuar
        </LumeButton>
        <LumeButton
          variant="ghost"
          size="md"
          fullWidth
          disabled={aceptando || eliminando}
          loading={saliendo}
          onPress={cerrarSesion}
        >
          Cerrar sesión
        </LumeButton>
        {/* Sin aceptar no se llega a Configuracion: la eliminacion tiene que
            estar a mano aca. La confirmacion la dan los dos modales. */}
        <LumeButton
          variant="ghost"
          size="md"
          fullWidth
          disabled={aceptando || saliendo}
          loading={eliminando}
          onPress={pedirEliminarCuenta}
        >
          Eliminar mi cuenta
        </LumeButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: lumeLayout.padScreen,
    paddingBottom: lumeSpace[8],
    gap: lumeSpace[8],
  },
  encabezado: { gap: lumeSpace[4] },
  lista: { overflow: 'hidden' },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    padding: lumeSpace[5],
    minHeight: 60,
  },
  filaTexto: { flex: 1, gap: lumeSpace[1] },
  semi: { fontFamily: lumeFuente.semibold },
  divisor: { height: 1, marginLeft: lumeSpace[5] },
  acciones: { gap: lumeSpace[2], paddingHorizontal: lumeLayout.padScreen },
  aviso: { textAlign: 'center', marginBottom: lumeSpace[2] },
});

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    presionada: { backgroundColor: t.surfaceChip },
    divisor: { backgroundColor: t.divider },
  });
