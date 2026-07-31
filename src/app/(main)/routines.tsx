/* Frencia · Rutinas — todas las rutinas del usuario.
   El home responde "que entreno hoy" y por eso muestra dias, cada uno con su
   tira de semana y su boton Empezar. Aca la pregunta es otra: que planes tuve,
   cual esta corriendo y cuanto duro cada uno. La fila es la rutina entera.

   Por eso las dos vistas no comparten forma. Aca no hay tira de semana ni
   Empezar, la rutina activa es un bloque solo y las anteriores son un registro
   de filas con fechas en monoespaciada. Se entra tocando la fila. */

import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { cargarRutinas, periodo, type RutinaResumen } from '@/lib/rutinas';

import {
  Badge,
  Button,
  FrenciaText,
  Icon,
  TabBar,
  display,
  radius,
  sans,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

const TABS = [
  { value: 'hoy', label: 'Hoy', icon: 'home' },
  { value: 'rutinas', label: 'Rutinas', icon: 'layers' },
  { value: 'perfil', label: 'Perfil', icon: 'user' },
];

function contarDias(n: number): string {
  return `${n} ${n === 1 ? 'día' : 'días'}`;
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
            {/* La rutina activa es el unico plan que esta corriendo, asi que se
               lleva el nombre en display y todo el peso visual de la pantalla. */}
            {activa ? (
              <Pressable
                onPress={() => abrirRutina(activa.id)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${activa.name}`}
                style={({ pressed }) => [styles.activa, pressed && styles.pressed]}
              >
                <Badge tone="green">En curso</Badge>
                <FrenciaText role="display" style={styles.activaNombre} numberOfLines={2}>
                  {activa.name}
                </FrenciaText>
                <View style={styles.metaRow}>
                  <FrenciaText role="data" color={colors.textSecondary}>
                    {contarDias(activa.dias)} · {periodo(activa)}
                  </FrenciaText>
                  <Icon name="chevron-right" size={18} color={colors.accentText} />
                </View>
              </Pressable>
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

                {/* Filas al hilo, sin tarjeta: son historial, no cosas que se
                   accionan. La linea fina las separa sin darles volumen. */}
                <View>
                  {anteriores.map((r, i) => (
                    <Pressable
                      key={r.id}
                      onPress={() => abrirRutina(r.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Abrir ${r.name}`}
                      style={({ pressed }) => [
                        styles.fila,
                        i > 0 && styles.filaDivisor,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.filaTexto}>
                        <FrenciaText role="bodySm" style={styles.filaNombre} numberOfLines={1}>
                          {r.name}
                        </FrenciaText>
                        <FrenciaText role="dataLabel" color={colors.textTertiary}>
                          {contarDias(r.dias)} · {periodo(r)}
                        </FrenciaText>
                      </View>
                      <Icon name="chevron-right" size={17} color={colors.textTertiary} />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <TabBar
        items={TABS}
        value="rutinas"
        onChange={(value) => {
          // Volver en vez de apilar otro home: el home queda debajo porque se
          // llego aca desde su tab. Sin historial (entrada directa) se reemplaza.
          if (value === 'hoy') {
            if (router.canGoBack()) router.back();
            else router.replace('/home');
          }
          if (value === 'perfil') router.push('/profile');
        }}
        fab={{ icon: 'plus', label: 'Crear', onPress: crearRutina }}
      />
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

    // Rutina activa
    activa: {
      gap: space[3],
      padding: spacing.padCard,
      borderRadius: radius.xl,
      backgroundColor: colors.surfaceOrangeSoft,
      borderWidth: 1,
      borderColor: colors.surfaceOrangeLine,
    },
    // Anton no es de ancho fijo y el nombre lo pone el usuario, asi que se
    // achica respecto del display por defecto para que entre en dos lineas.
    activaNombre: {
      fontFamily: display,
      fontSize: 32,
      lineHeight: 36,
      textTransform: 'uppercase',
      includeFontPadding: false,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },

    sinActiva: {
      alignItems: 'flex-start',
      gap: space[4],
      padding: spacing.padCard,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderSubtle,
    },

    // Registro de rutinas anteriores
    anteriores: { gap: space[3] },
    seccionHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingHorizontal: space[1],
    },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      paddingVertical: space[4],
      paddingHorizontal: space[1],
    },
    filaDivisor: { borderTopWidth: 1, borderTopColor: colors.divider },
    filaTexto: { flex: 1, gap: space[1] },
    filaNombre: { fontFamily: sans.semibold, color: colors.textPrimary },

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
