/* Frencia · Detalle de una rutina.
   Su nombre, si esta en curso o archivada, y los dias que la componen. Cada dia
   se toca para editarlo.

   Mantiene el idioma de la lista de rutinas —nombre grande en la sans, datos
   tabulares, dias como filas al hilo— y no el del home, donde un dia es una
   tarjeta con su tira de semana y su boton Empezar. Empezar el entrenamiento se
   hace desde el home; aca se mira y se corrige el plan. */

import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { SEMANA_CORTA } from '@/lib/dia';
import { cargarRutina, eliminarRutina, fechaCorta, type RutinaDetalle } from '@/lib/rutinas';
import { useToast } from '@/contexts/toast';
import { alerta } from '@/lib/alerta';
import { CargaCentrada } from '@/components/CargaCentrada';

import { Icon } from '@/design';
import {
  Fondo,
  LumeBadge,
  LumeButton,
  LumeText,
  lumeFuente,
  lumeLayout,
  lumeRadius,
  lumeSpace,
  useLume,
} from '@/design/lume';

function resumenDia(ejercicios: number, weekdays: number[]): string {
  const cuenta = `${ejercicios} ${ejercicios === 1 ? 'ejercicio' : 'ejercicios'}`;
  if (weekdays.length === 0) return cuenta;
  return `${cuenta} · ${weekdays.map((w) => SEMANA_CORTA[w]).join(', ')}`;
}

export default function RoutineScreen() {
  const { t } = useLume();
  const router = useRouter();
  const { showToast } = useToast();

  const { id } = useLocalSearchParams<{ id?: string }>();

  const [rutina, setRutina] = useState<RutinaDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [borrando, setBorrando] = useState(false);

  // Relee al enfocar: se vuelve aca despues de editar un dia.
  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      (async () => {
        if (!id) {
          if (!cancelado) setCargando(false);
          return;
        }
        const data = await cargarRutina(id);
        if (cancelado) return;
        setRutina(data);
        setCargando(false);
      })();
      return () => {
        cancelado = true;
      };
    }, [id]),
  );

  function volver() {
    if (router.canGoBack()) router.back();
    else router.replace('/routines');
  }

  function editar() {
    if (!rutina) return;
    router.push({ pathname: '/edit-routine', params: { id: rutina.id } });
  }

  // El peso destructivo va al modal de alerta, no al color del boton.
  function pedirEliminar() {
    if (!rutina || borrando) return;
    const n = rutina.dias.length;
    const detalle =
      n > 0 ? ` con sus ${n} ${n === 1 ? 'día' : 'días'} y los ejercicios de cada uno` : '';
    alerta(
      `Eliminar ${rutina.name}`,
      `Se va a borrar la rutina${detalle}. No se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: confirmarEliminar },
      ],
    );
  }

  async function confirmarEliminar() {
    if (!rutina) return;
    setBorrando(true);
    const ok = await eliminarRutina(rutina.id);
    if (ok) {
      showToast({ message: 'Rutina eliminada', type: 'success' });
      // replace y no back: volver no tiene que aterrizar en la rutina borrada.
      router.replace('/routines');
    } else {
      setBorrando(false);
      showToast({ message: 'No pudimos eliminar la rutina. Probá de nuevo.', type: 'error' });
    }
  }

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <LumeButton variant="ghost" size="sm" icon="chevron-left" onPress={volver}>
            Atrás
          </LumeButton>
        </View>

        {cargando ? (
          <CargaCentrada texto="Cargando rutina…" />
        ) : !rutina ? (
          <View style={styles.centro}>
            <LumeText rol="subtitle" style={styles.centrado}>
              No encontramos esta rutina
            </LumeText>
            <LumeText rol="bodySm" color={t.textSecondary} style={styles.centrado}>
              Puede que la hayas borrado desde otro dispositivo.
            </LumeText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.titulo}>
              <LumeBadge tone={rutina.activa ? 'signal' : 'neutral'}>
                {rutina.activa ? 'En curso' : 'Archivada'}
              </LumeBadge>
              <LumeText rol="display" style={styles.nombre} numberOfLines={3}>
                {rutina.name}
              </LumeText>
              <LumeText rol="data" color={t.textSecondary}>
                {rutina.dias.length} {rutina.dias.length === 1 ? 'día' : 'días'} · {fechaCorta(rutina.creadaEl)}
              </LumeText>
            </View>

            {rutina.dias.length === 0 ? (
              <View style={[styles.vacio, { backgroundColor: t.surfaceInset, borderColor: t.borderStrong }]}>
                <Icon name="calendar-off" size={22} strokeWidth={1.75} color={t.textTertiary} />
                <LumeText rol="bodySm" color={t.textTertiary} style={styles.centrado}>
                  Esta rutina no tiene días.
                </LumeText>
              </View>
            ) : (
              <View style={styles.seccion}>
                <LumeText rol="label" color={t.textTertiary}>
                  Días de entrenamiento
                </LumeText>

                <View>
                  {rutina.dias.map((d, i) => (
                    <Pressable
                      key={d.id}
                      onPress={() => router.push({ pathname: '/edit-day', params: { dia: d.id } })}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar ${d.name}`}
                      style={({ pressed }) => [
                        styles.fila,
                        i > 0 && { borderTopWidth: 1, borderTopColor: t.divider },
                        pressed && styles.presionada,
                      ]}
                    >
                      <View style={styles.filaTexto}>
                        <LumeText rol="bodySm" style={styles.filaNombre} numberOfLines={1}>
                          {d.name}
                        </LumeText>
                        <LumeText rol="label" color={t.textTertiary}>
                          {resumenDia(d.ejercicios, d.weekdays)}
                        </LumeText>
                      </View>
                      {/* Lapiz y no chevron: la fila no lleva a ver el dia, lo
                         abre para editarlo. Es el mismo icono que en el home. */}
                      <Icon name="pencil" size={17} strokeWidth={1.75} color={t.textTertiary} />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Acciones de la rutina: al pie, a todo el ancho. Editar arriba y
           Eliminar al fondo, la accion irreversible mas lejos del pulgar. */}
        {!cargando && rutina && (
          <View style={styles.acciones}>
            <LumeButton variant="secondary" size="lg" icon="pencil" fullWidth disabled={borrando} onPress={editar}>
              Editar rutina
            </LumeButton>
            <LumeButton
              variant="danger"
              size="lg"
              icon="trash-2"
              fullWidth
              loading={borrando}
              onPress={pedirEliminar}
            >
              Eliminar rutina
            </LumeButton>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  safe: { flex: 1 },

  // El boton ghost trae su propio padding: el margen lo corre 10 px a la
  // izquierda para que el chevron quede alineado con el borde del contenido.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: lumeLayout.padScreen - 10,
    paddingVertical: lumeSpace[4],
    minHeight: 44,
  },

  scroll: {
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[4],
    paddingBottom: lumeSpace[10],
    gap: lumeSpace[7],
  },

  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: lumeSpace[3] },
  centrado: { textAlign: 'center' },
  presionada: { opacity: 0.6 },

  titulo: { gap: lumeSpace[4], alignItems: 'flex-start' },
  // El nombre lo pone el usuario: en la sans de display, ajustado para que
  // entre en pocas lineas.
  nombre: { fontSize: 34, lineHeight: 36, letterSpacing: -1 },

  seccion: { gap: lumeSpace[4] },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    paddingVertical: lumeSpace[4],
    paddingHorizontal: lumeSpace[1],
    minHeight: 60,
  },
  filaTexto: { flex: 1, gap: lumeSpace[1] },
  filaNombre: { fontFamily: lumeFuente.semibold },

  vacio: {
    alignItems: 'center',
    gap: lumeSpace[3],
    paddingVertical: lumeSpace[8],
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },

  // Pie fijo con las acciones de la rutina.
  acciones: {
    gap: lumeSpace[3],
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[4],
    paddingBottom: lumeSpace[2],
  },
});
