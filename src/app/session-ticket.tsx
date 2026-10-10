/* Frencia · Ticket de un entrenamiento del historial. El mismo ticket que el
   resumen al terminar la sesion, armado con lo que quedo guardado, con
   Compartir abajo. Se abre desde el detalle del historial. */

import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import {
  Button,
  FrenciaText,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

export default function SessionTicketScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
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
  const capturaRef = useRef<View>(null);
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
    <Button variant="ghost" size="sm" icon="chevron-left" onPress={volver}>
      Atrás
    </Button>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      {sesion ? (
        <MarcoTicket
          encabezado={atras}
          acciones={
            <Button
              variant="primary"
              size="lg"
              icon="share"
              style={styles.accion}
              onPress={compartir}
              loading={compartiendo}
            >
              Compartir
            </Button>
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
              <FrenciaText role="subtitle" style={styles.centerText}>
                No encontramos este entrenamiento
              </FrenciaText>
              <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.centerText}>
                Puede que ya no esté disponible en tu historial.
              </FrenciaText>
            </View>
          ) : resultado?.estado === 'error' ? (
            <View style={styles.centro}>
              <FrenciaText role="subtitle" style={styles.centerText}>
                No pudimos cargar el entrenamiento
              </FrenciaText>
              <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.centerText}>
                Comprueba tu conexión y vuelve a intentarlo.
              </FrenciaText>
              <Button variant="secondary" onPress={reintentar}>
                Reintentar
              </Button>
            </View>
          ) : (
            <CargaCentrada texto="Cargando ticket…" />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    header: {
      flexDirection: 'row',
      paddingHorizontal: spacing.padScreen,
      paddingVertical: space[5],
    },
    centro: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[4],
      padding: spacing.padScreen,
    },
    centerText: { textAlign: 'center' },
    accion: { flex: 1 },
  });
