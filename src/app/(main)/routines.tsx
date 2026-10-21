/* Frencia · Rutinas — todas las rutinas del usuario.
   El home responde "que entreno hoy" y por eso muestra dias, cada uno con su
   tira de semana y su boton Empezar. Aca la pregunta es otra: que planes tuve y
   cual esta corriendo. La fila es la rutina entera.

   Todas las rutinas ocupan la misma tarjeta: lo unico que separa a la que esta
   en curso es el vidrio fuerte, el filo de lume y el texto. Que la activa sea mas grande la convertiria en otra
   cosa, y son todas lo mismo vistas en momentos distintos. Se entra tocando
   la tarjeta.

   La activa va siempre arriba; las anteriores se traen de a RUTINAS_PAGINA,
   como el historial, y se pide la siguiente al llegar al final. Tirar hacia
   abajo desde el inicio recarga la lista. */

import React, { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
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
import { AvisoPie, CargaPestania, ErrorPestania, VacioPestania } from '@/components/EstadosPestania';
import { useVolverArribaAlRetocar } from '@/lib/volver-arriba';

import { Icon } from '@/design';
import {
  Cargando,
  Fondo,
  LumeButton,
  LumeText,
  Vidrio,
  lumeLayout,
  lumeRadius,
  lumeSpace,
  useLume,
} from '@/design/lume';

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
  const { t, sombras } = useLume();
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
      showToast({ message: 'No pudimos activar la rutina. Probá de nuevo.', type: 'error' });
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
      showToast({ message: 'No pudimos eliminar la rutina. Probá de nuevo.', type: 'error' });
    }
    setOcupada(false);
  }

  const vacia = loaded && !error && !cargando && !activa && anteriores.length === 0;

  const tarjeta = (rutina: RutinaResumen) => (
    // Arrastrar a la izquierda elimina (pide confirmacion); a la derecha pone
    // la rutina en curso, salvo que ya lo este.
    <SwipeableRow
      key={rutina.id}
      onPress={() => abrirRutina(rutina.id)}
      izquierda={{
        icon: 'trash-2',
        tono: 'danger',
        label: 'Eliminar rutina',
        onTrigger: () => pedirEliminar(rutina),
      }}
      derecha={
        rutina.activa
          ? undefined
          : { icon: 'play', tono: 'accent', label: 'Poner en curso', onTrigger: () => activar(rutina) }
      }
    >
      {/* Una sola tarjeta para todas: la en curso sube a vidrio fuerte con un
         filo de lume a la izquierda, y lo dice en texto. */}
      <Vidrio
        nivel={rutina.activa ? 'fuerte' : 'normal'}
        borde={rutina.activa ? t.surfaceSignalLine : undefined}
        style={styles.tarjeta}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${rutina.name}`}
      >
        {rutina.activa ? (
          <View style={[styles.filo, { backgroundColor: t.signal, boxShadow: sombras.haloSignal }]} />
        ) : null}
        <View style={styles.tarjetaTexto}>
          <LumeText rol="subtitle" numberOfLines={1}>
            {rutina.name}
          </LumeText>
          <LumeText rol="label" color={rutina.activa ? t.signalText : t.textTertiary}>
            {resumen(rutina)}
          </LumeText>
        </View>
        <Icon name="chevron-right" size={18} color={t.textTertiary} strokeWidth={1.75} />
      </Vidrio>
    </SwipeableRow>
  );

  // Primera lectura: la carga ocupa la pantalla, como en el detalle de un
  // entrenamiento. El titulo queda en el mismo lugar que tendra en la lista.
  if (!loaded && error !== 'inicio') {
    return (
      <View style={styles.pantalla}>
        <Fondo posicion="cumbre" />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <CargaPestania titulo="Rutinas" texto="Cargando rutinas…" />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" />
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
              tintColor={t.textPrimary}
              colors={[t.textPrimary]}
              progressBackgroundColor={t.surfaceRaisedOpaco}
            />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <LumeText rol="label" color={t.textTertiary}>
                Rutinas
              </LumeText>

              {error === 'inicio' && (
                <ErrorPestania
                  titulo={loaded ? 'No pudimos actualizar tus rutinas.' : 'No pudimos cargar tus rutinas.'}
                  texto="Revisá tu conexión y probá de nuevo."
                  onReintentar={() => { void lista.reintentar(); }}
                />
              )}

              {/* Hasta tener la primera lectura no decidimos que mostrar. */}
              {!loaded ? null : vacia ? (
                <VacioPestania
                  icono="layers"
                  titulo="Todavía no tenés rutinas"
                  texto="Cuando crees una, va a aparecer acá junto con las que archives más adelante."
                >
                  <LumeButton variant="primary" size="lg" icon="plus" onPress={crearRutina}>
                    Crear rutina
                  </LumeButton>
                </VacioPestania>
              ) : (
                <>
                  {activa ? (
                    tarjeta(activa)
                  ) : (
                    <View
                      style={[styles.sinActiva, { backgroundColor: t.surfaceInset, borderColor: t.borderStrong }]}
                    >
                      <LumeText rol="bodySm" color={t.textSecondary}>
                        No tenés ninguna rutina en curso.
                      </LumeText>
                      <LumeButton variant="secondary" size="md" icon="plus" onPress={crearRutina}>
                        Crear rutina
                      </LumeButton>
                    </View>
                  )}

                  {anteriores.length > 0 && (
                    <View style={styles.seccionHeader}>
                      <LumeText rol="label" color={t.textTertiary}>
                        Anteriores
                      </LumeText>
                      {/* El total solo se conoce cuando no quedan paginas por traer. */}
                      {!siguiente && (
                        <LumeText rol="label" color={t.textTertiary}>
                          {anteriores.length}
                        </LumeText>
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
            cargando === 'mas' ? (
              <View style={styles.footer}>
                <Cargando texto="Cargando más rutinas…" />
              </View>
            ) : error === 'mas' ? (
              <AvisoPie texto="No pudimos cargar más rutinas." onReintentar={() => { void lista.reintentar(); }} />
            ) : siguiente && !error && !cargando ? (
              <View style={styles.footer}>
                <LumeButton variant="ghost" onPress={() => { void lista.cargarMas(); }}>
                  Cargar más
                </LumeButton>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  safe: { flex: 1 },
  // flexGrow: el contenido ocupa toda la altura aunque la lista sea corta,
  // asi el gesto de tirar hacia abajo se toma desde cualquier punto.
  scroll: {
    flexGrow: 1,
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[6],
    paddingBottom: lumeSpace[12],
  },
  // El paddingBottom separa el titulo "Anteriores" de la primera tarjeta.
  header: { gap: lumeSpace[6], paddingBottom: lumeSpace[3] },
  footer: { alignItems: 'center', paddingVertical: lumeSpace[6] },

  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    padding: lumeLayout.padCard,
    overflow: 'hidden',
  },
  // El filo de la en curso: 3 px de lume pegados al borde izquierdo.
  filo: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  tarjetaTexto: { flex: 1, gap: lumeSpace[3] },

  sinActiva: {
    alignItems: 'flex-start',
    gap: lumeSpace[5],
    padding: lumeLayout.padCard,
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },

  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: lumeSpace[1],
  },
  separador: { height: lumeSpace[3] },
});
