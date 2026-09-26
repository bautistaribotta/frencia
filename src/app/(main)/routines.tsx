/* Frencia · Rutinas — todas las rutinas del usuario.
   El home responde "que entreno hoy" y por eso muestra dias, cada uno con su
   tira de semana y su boton Empezar. Aca la pregunta es otra: que planes tuve y
   cual esta corriendo. La fila es la rutina entera.

   Todas las rutinas ocupan la misma tarjeta: lo unico que separa a la que esta
   en curso es el color. Que la activa sea mas grande la convertiria en otra
   cosa, y son todas lo mismo vistas en momentos distintos. Se entra tocando
   la tarjeta.

   La activa va siempre arriba; las anteriores se traen de a RUTINAS_PAGINA,
   como el historial, y se pide la siguiente al llegar al final. Tirar hacia
   abajo desde el inicio recarga la lista. */

import React, { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import {
  activarRutina,
  eliminarRutina,
  fechaCorta,
  type RutinaResumen,
} from '@/lib/rutinas';
import { crearRutinas } from '@/lib/rutinas-store';
import { useSession } from '@/contexts/session';
import { useToast } from '@/contexts/toast';
import { alerta } from '@/lib/alerta';
import { SwipeableRow } from '@/components/SwipeableRow';
import { CargaCentrada } from '@/components/CargaCentrada';
import { useVolverArribaAlRetocar } from '@/lib/volver-arriba';

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

function contarDias(n: number): string {
  return `${n} ${n === 1 ? 'día' : 'días'}`;
}

/** "En curso · 3 días · 29 JUL 2026". El estado va en el texto y no solo en el
 *  color, para que se lea aunque el color pase desapercibido. */
function resumen(rutina: RutinaResumen): string {
  const datos = `${contarDias(rutina.dias)} · ${fechaCorta(rutina.creadaEl)}`;
  return rutina.activa ? `En curso · ${datos}` : datos;
}

export default function RoutinesScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user } = useSession();
  const scrollRef = useRef<FlatList<RutinaResumen>>(null);
  useVolverArribaAlRetocar(scrollRef);
  const { showToast } = useToast();

  const userId = user?.id ?? null;
  const lista = useMemo(() => crearRutinas(userId), [userId]);
  const estado = useSyncExternalStore(lista.subscribe, lista.getSnapshot, lista.getSnapshot);
  const { activa, anteriores, siguiente, loaded, cargando, error } = estado;
  // Evita disparar dos veces la misma accion mientras la fila vuelve a su lugar
  // y la lista se recarga.
  const [ocupada, setOcupada] = useState(false);
  // Como en el historial: el RefreshControl solo se muestra cuando la recarga
  // la inicio el gesto de tirar hacia abajo. Las recargas silenciosas (al
  // enfocar o tras activar una rutina) no lo activan: si lo hicieran, iOS lo
  // despliega solo y corre la lista 60pt.
  const [refrescandoPorGesto, setRefrescandoPorGesto] = useState(false);
  const refrescando = refrescandoPorGesto && cargando === 'inicio';
  if (refrescandoPorGesto && cargando !== 'inicio') setRefrescandoPorGesto(false);

  // Relee al enfocar: volver de crear o de editar tiene que verse reflejado.
  // Despues de la primera carga la relectura es silenciosa.
  useFocusEffect(
    useCallback(() => {
      void lista.activar();
      return lista.desactivar;
    }, [lista]),
  );

  const abrirRutina = (id: string) => router.push({ pathname: '/routine', params: { id } });
  const crearRutina = () => router.push('/create-routine');

  async function activar(rutina: RutinaResumen) {
    if (ocupada || rutina.activa) return;
    setOcupada(true);
    const ok = await activarRutina(rutina.id);
    if (ok) {
      showToast({ message: `${rutina.name} está en curso`, type: 'success' });
      await lista.recargar();
    } else {
      showToast({ message: 'No pudimos activar la rutina. Proba de nuevo.', type: 'error' });
    }
    setOcupada(false);
  }

  function pedirEliminar(rutina: RutinaResumen) {
    if (ocupada) return;
    const detalle =
      rutina.dias > 0
        ? ` con sus ${rutina.dias} ${rutina.dias === 1 ? 'día' : 'días'} y los ejercicios de cada uno`
        : '';
    alerta(
      `Eliminar ${rutina.name}`,
      `Se va a borrar la rutina${detalle}. No se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(rutina) },
      ],
    );
  }

  async function eliminar(rutina: RutinaResumen) {
    if (ocupada) return;
    setOcupada(true);
    const ok = await eliminarRutina(rutina.id);
    if (ok) {
      lista.quitar(rutina.id);
      showToast({ message: 'Rutina eliminada', type: 'success' });
    } else {
      showToast({ message: 'No pudimos eliminar la rutina. Proba de nuevo.', type: 'error' });
    }
    setOcupada(false);
  }

  const vacia = loaded && !error && !cargando && !activa && anteriores.length === 0;

  const tarjeta = (rutina: RutinaResumen) => (
    // Arrastrar a la derecha elimina (pide confirmacion); a la izquierda pone
    // la rutina en curso, salvo que ya lo este.
    <SwipeableRow
      key={rutina.id}
      onPress={() => abrirRutina(rutina.id)}
      derecha={{
        icon: 'trash-2',
        tono: 'danger',
        label: 'Eliminar rutina',
        onTrigger: () => pedirEliminar(rutina),
      }}
      izquierda={
        rutina.activa
          ? undefined
          : { icon: 'flame', tono: 'accent', label: 'Poner en curso', onTrigger: () => activar(rutina) }
      }
    >
      <View
        style={[styles.tarjeta, rutina.activa && styles.tarjetaActiva]}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${rutina.name}`}
      >
        <View style={styles.tarjetaTexto}>
          <FrenciaText role="subtitle" numberOfLines={1}>
            {rutina.name}
          </FrenciaText>
          <FrenciaText
            role="dataLabel"
            color={rutina.activa ? colors.accentText : colors.textTertiary}
          >
            {resumen(rutina)}
          </FrenciaText>
        </View>
        <Icon
          name="chevron-right"
          size={18}
          color={rutina.activa ? colors.accentText : colors.textTertiary}
        />
      </View>
    </SwipeableRow>
  );

  // Primera lectura: la carga ocupa la pantalla, como en el detalle de un
  // entrenamiento. El titulo queda en el mismo lugar que tendra en la lista.
  if (!loaded && error !== 'inicio') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.tituloCarga}>
          <FrenciaText role="dataLabel" color={colors.textTertiary}>
            Rutinas
          </FrenciaText>
        </View>
        <CargaCentrada texto="Cargando rutinas…" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        ref={scrollRef}
        key={userId ?? 'sin-sesion'}
        data={anteriores}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onEndReached={() => { void lista.cargarMas(); }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => {
              setRefrescandoPorGesto(true);
              void lista.recargar();
            }}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surfaceCard}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <FrenciaText role="dataLabel" color={colors.textTertiary}>
              Rutinas
            </FrenciaText>

            {error === 'inicio' && (
              <View style={styles.error} accessibilityLiveRegion="polite">
                <FrenciaText role="bodySm" style={styles.centerText}>
                  {loaded ? 'No pudimos actualizar tus rutinas.' : 'No pudimos cargar tus rutinas.'}
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.centerText}>
                  Revisá tu conexión y probá de nuevo.
                </FrenciaText>
                <Button variant="secondary" onPress={() => { void lista.reintentar(); }}>Reintentar</Button>
              </View>
            )}

            {/* Hasta tener la primera lectura no decidimos que mostrar. */}
            {!loaded ? null : vacia ? (
              <View style={styles.vacio}>
                <Icon name="layers" size={26} color={colors.textTertiary} />
                <FrenciaText role="subtitle" style={styles.centerText}>
                  Todavía no tenés rutinas
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.vacioPara}>
                  Cuando crees una, va a aparecer acá junto con las que archives más adelante.
                </FrenciaText>
                <Button variant="primary" size="lg" icon="plus" onPress={crearRutina}>
                  Crear rutina
                </Button>
              </View>
            ) : (
              <>
                {activa ? (
                  tarjeta(activa)
                ) : (
                  <View style={styles.sinActiva}>
                    <FrenciaText role="bodySm" color={colors.textSecondary}>
                      No tenés ninguna rutina en curso.
                    </FrenciaText>
                    <Button variant="secondary" size="md" icon="plus" onPress={crearRutina}>
                      Crear rutina
                    </Button>
                  </View>
                )}

                {anteriores.length > 0 && (
                  <View style={styles.seccionHeader}>
                    <FrenciaText role="dataLabel" color={colors.textTertiary}>
                      Anteriores
                    </FrenciaText>
                    {/* El total solo se conoce cuando no quedan paginas por traer. */}
                    {!siguiente && (
                      <FrenciaText role="dataLabel" color={colors.textTertiary}>
                        {anteriores.length}
                      </FrenciaText>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        }
        renderItem={({ item }) => tarjeta(item)}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        ListFooterComponent={
          <View style={styles.footer}>
            {cargando === 'mas' ? (
              <View style={styles.feedback} accessibilityLiveRegion="polite">
                <ActivityIndicator color={colors.accent} />
                <FrenciaText role="bodySm" color={colors.textSecondary}>
                  Cargando más rutinas…
                </FrenciaText>
              </View>
            ) : error === 'mas' ? (
              <View style={styles.feedback} accessibilityLiveRegion="polite">
                <FrenciaText role="bodySm" style={styles.centerText}>No pudimos cargar más rutinas.</FrenciaText>
                <Button variant="secondary" onPress={() => { void lista.reintentar(); }}>Reintentar</Button>
              </View>
            ) : siguiente && !error && !cargando ? (
              <Button variant="ghost" onPress={() => { void lista.cargarMas(); }}>Cargar más</Button>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    // flexGrow: el contenido ocupa toda la altura aunque la lista sea corta,
    // asi el gesto de tirar hacia abajo se toma desde cualquier punto.
    scroll: {
      flexGrow: 1,
      paddingHorizontal: spacing.padScreen,
      paddingTop: space[7],
      paddingBottom: space[12],
    },
    // Mismo aire que tenia el ScrollView entre bloques; el paddingBottom separa
    // el titulo "Anteriores" de la primera tarjeta.
    header: { gap: space[6], paddingBottom: space[3] },
    tituloCarga: { paddingHorizontal: spacing.padScreen, paddingTop: space[7] },
    centerText: { textAlign: 'center' },
    feedback: { alignItems: 'center', gap: space[4] },
    error: {
      alignItems: 'center', gap: space[4], padding: spacing.padCard,
      borderRadius: radius.xl,
      backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle, borderWidth: 1,
    },
    footer: { paddingVertical: space[6] },

    // Una sola tarjeta para todas. La activa cambia de color, no de tamanio.
    tarjeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      padding: spacing.padCard,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    tarjetaActiva: {
      backgroundColor: colors.surfaceGreenSoft,
      borderColor: colors.surfaceGreenLine,
    },
    tarjetaTexto: { flex: 1, gap: space[2] },

    sinActiva: {
      alignItems: 'flex-start',
      gap: space[4],
      padding: spacing.padCard,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderSubtle,
    },

    seccionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space[1],
    },
    separador: { height: space[3] },

    // Estado vacio
    vacio: {
      alignItems: 'center',
      gap: space[4],
      paddingVertical: space[10],
      paddingHorizontal: space[6],
      borderRadius: radius.xl,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.borderDefault,
    },
    vacioPara: { textAlign: 'center', maxWidth: 280 },
  });
