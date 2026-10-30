/* Frencia · Ticket de un entrenamiento del historial. El mismo ticket que el
   resumen al terminar la sesion, armado con lo que quedo guardado, con
   Compartir abajo. Se abre desde el detalle del historial. */

import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type ViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { CargaCentrada } from '@/components/CargaCentrada';
import { MarcoTicket } from '@/components/MarcoTicket';
import { TicketSesion } from '@/components/TicketSesion';
import { AVISO_COMPARTIR, compartirTicket } from '@/lib/compartir-ticket';
import { useDetalleSesion } from '@/lib/detalle-sesion';
import { duracionEnSegundos, ejerciciosDelHistorial } from '@/lib/resumen-sesion';
import { Fondo, LumeButton, LumeText, lumeLayout, lumeSpace, useLume } from '@/design/lume';

export default function SessionTicketScreen() {
  const { t } = useLume();
  const router = useRouter();
  const { profile } = useProfile();
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = typeof id === 'string' && id.length > 0 ? id : null;
  const unidad = profile?.unidadPeso ?? 'kg';
  const unidadDistancia = profile?.unidadDistancia ?? 'km';

  const { resultado, noEncontrada, reintentar } = useDetalleSesion(sessionId);
  const sesion = resultado?.estado === 'ok' ? resultado.sesion : null;
  const ejercicios = useMemo(
    () => (sesion ? ejerciciosDelHistorial(sesion.ejercicios) : []),
    [sesion],
  );
  const capturaRef = useRef<ViewInstance>(null);
  const [compartiendo, setCompartiendo] = useState(false);

  function volver() {
    if (router.canGoBack()) router.back();
    else if (sessionId) router.replace({ pathname: '/session-history', params: { id: sessionId } });
    else router.replace('/history');
  }

  async function compartir() {
    if (compartiendo) return;
    setCompartiendo(true);
    const resultadoCompartir = await compartirTicket(capturaRef);
    setCompartiendo(false);
    if (resultadoCompartir !== 'ok') {
      showToast({ message: AVISO_COMPARTIR[resultadoCompartir], type: 'error' });
    }
  }

  const atras = (
    <LumeButton variant="ghost" size="sm" icon="chevron-left" onPress={volver}>
      Atrás
    </LumeButton>
  );

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="centro" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        {sesion ? (
          <MarcoTicket
            encabezado={atras}
            acciones={
              <LumeButton
                variant="primary"
                size="lg"
                icon="share"
                style={styles.accion}
                onPress={compartir}
                loading={compartiendo}
              >
                Compartir
              </LumeButton>
            }
          >
            <TicketSesion
              sessionId={sesion.id}
              nombreDia={sesion.dayName ?? 'Día eliminado'}
              inicio={sesion.startedAt}
              duracionSegundos={duracionEnSegundos(sesion.startedAt, sesion.finishedAt)}
              ejercicios={ejercicios}
              unidad={unidad}
              unidadDistancia={unidadDistancia}
              capturaRef={capturaRef}
            />
          </MarcoTicket>
        ) : (
          <>
            <View style={styles.header}>{atras}</View>
            {noEncontrada ? (
              <View style={styles.centro}>
                <LumeText rol="subtitle" style={styles.centrado}>
                  No encontramos este entrenamiento
                </LumeText>
                <LumeText rol="bodySm" color={t.textSecondary} style={styles.centrado}>
                  Puede que ya no esté disponible en tu historial.
                </LumeText>
              </View>
            ) : resultado?.estado === 'error' ? (
              <View style={styles.centro}>
                <LumeText rol="subtitle" style={styles.centrado}>
                  No pudimos cargar el entrenamiento
                </LumeText>
                <LumeText rol="bodySm" color={t.textSecondary} style={styles.centrado}>
                  Revisá tu conexión y probá de nuevo.
                </LumeText>
                <LumeButton variant="secondary" onPress={reintentar}>
                  Reintentar
                </LumeButton>
              </View>
            ) : (
              <CargaCentrada texto="Cargando ticket…" />
            )}
          </>
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
    paddingHorizontal: lumeLayout.padScreen - 10,
    paddingVertical: lumeSpace[3],
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: lumeSpace[4],
    padding: lumeLayout.padScreen,
  },
  centrado: { textAlign: 'center' },
  accion: { flex: 1 },
});
