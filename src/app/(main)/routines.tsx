/* Frencia · Rutinas — todas las rutinas del usuario.
   El home responde "que entreno hoy" y por eso muestra dias, cada uno con su
   tira de semana y su boton Empezar. Aca la pregunta es otra: que planes tuve y
   cual esta corriendo. La fila es la rutina entera.

   Todas las rutinas ocupan la misma tarjeta: lo unico que separa a la que esta
   en curso es el color. Que la activa sea mas grande la convertiria en otra
   cosa, y son todas lo mismo vistas en momentos distintos. Se entra tocando
   la tarjeta. */

import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { cargarRutinas, fechaCorta, type RutinaResumen } from '@/lib/rutinas';

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
 *  color, que es lo unico que lo hace legible en el modo para daltonicos. */
function resumen(rutina: RutinaResumen): string {
  const datos = `${contarDias(rutina.dias)} · ${fechaCorta(rutina.creadaEl)}`;
  return rutina.activa ? `En curso · ${datos}` : datos;
}

export default function RoutinesScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  const [rutinas, setRutinas] = useState<RutinaResumen[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Relee al enfocar: volver de crear o de editar tiene que verse reflejado.
  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      (async () => {
        const data = await cargarRutinas();
        if (cancelado) return;
        setRutinas(data);
        setLoaded(true);
      })();
      return () => {
        cancelado = true;
      };
    }, []),
  );

  const abrirRutina = (id: string) => router.push({ pathname: '/routine', params: { id } });
  const crearRutina = () => router.push('/create-routine');

  const activa = rutinas.find((r) => r.activa) ?? null;
  const anteriores = rutinas.filter((r) => !r.activa);

  const tarjeta = (rutina: RutinaResumen) => (
    <Pressable
      key={rutina.id}
      onPress={() => abrirRutina(rutina.id)}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${rutina.name}`}
      style={({ pressed }) => [
        styles.tarjeta,
        rutina.activa && styles.tarjetaActiva,
        pressed && styles.pressed,
      ]}
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
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FrenciaText role="dataLabel" color={colors.textTertiary}>
          Rutinas
        </FrenciaText>

        {!loaded ? null : rutinas.length === 0 ? (
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
              <View style={styles.anteriores}>
                <View style={styles.seccionHeader}>
                  <FrenciaText role="dataLabel" color={colors.textTertiary}>
                    Anteriores
                  </FrenciaText>
                  <FrenciaText role="dataLabel" color={colors.textTertiary}>
                    {anteriores.length}
                  </FrenciaText>
                </View>
                <View style={styles.pila}>{anteriores.map(tarjeta)}</View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    scroll: {
      paddingHorizontal: spacing.padScreen,
      paddingTop: space[7],
      paddingBottom: space[12],
      gap: space[6],
    },
    centerText: { textAlign: 'center' },
    pressed: { opacity: 0.75 },

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
      backgroundColor: colors.surfaceOrangeSoft,
      borderColor: colors.surfaceOrangeLine,
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

    anteriores: { gap: space[3] },
    seccionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space[1],
    },
    pila: { gap: space[3] },

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
