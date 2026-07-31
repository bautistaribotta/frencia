/* Frencia · Editar rutina.
   Lo que es de la rutina y no de un dia: el nombre, que dias la componen y en
   que orden. El contenido de cada dia se edita en su propia pantalla.

   No es un wizard. El de creacion pregunta de a un paso porque esta armando
   algo que no existe todavia y el orden de las preguntas es la guia; aca se
   entra sabiendo que se quiere cambiar, casi siempre una sola cosa. Se recicla
   lo que corresponde: el campo de nombre del paso 1 y la lista arrastrable que
   ya usan los ejercicios de un dia.

   Nada se toca hasta Guardar. Ver docs/specs/rutinas-y-dias.md seccion 5.6 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/contexts/toast';
import { DraggableRowList } from '@/components/DraggableRowList';
import { SEMANA_CORTA } from '@/lib/dia';
import { cargarRutina, guardarRutina } from '@/lib/rutinas';

import {
  Button,
  FrenciaText,
  Icon,
  radius,
  sans,
  sizing,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

// El mismo tope que el wizard: mas dias que la semana no tienen donde caer.
const MAX_DIAS = 7;

/** Un dia en la pantalla. `id` null = todavia no existe en la base. */
interface DiaFila {
  /** Estable entre reordenamientos, que es lo que la lista necesita de key. */
  key: string;
  id: string | null;
  name: string;
  ejercicios: number;
  weekdays: number[];
}

function detalleDia(d: DiaFila): string {
  if (d.id === null) return 'Nuevo · se completa después';
  const cuenta = `${d.ejercicios} ${d.ejercicios === 1 ? 'ejercicio' : 'ejercicios'}`;
  if (d.weekdays.length === 0) return cuenta;
  return `${cuenta} · ${d.weekdays.map((w) => SEMANA_CORTA[w]).join(', ')}`;
}

// Firma para saber si hay cambios sin guardar. Toma solo lo que se persiste
// desde aca, en orden: el orden del arreglo es parte del dato.
function firma(nombre: string, dias: DiaFila[]): string {
  return JSON.stringify([nombre.trim(), dias.map((d) => [d.id, d.name.trim()])]);
}

export default function EditRoutineScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { showToast } = useToast();

  const { id: routineId } = useLocalSearchParams<{ id?: string }>();

  const [nombre, setNombre] = useState('');
  const [dias, setDias] = useState<DiaFila[]>([]);
  const [original, setOriginal] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  // Contador para las keys de los dias nuevos, que todavia no tienen id.
  const [proximaKey, setProximaKey] = useState(0);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      if (!routineId) {
        if (!cancelado) setCargando(false);
        return;
      }
      const rutina = await cargarRutina(routineId);
      if (cancelado) return;
      if (rutina) {
        const filas: DiaFila[] = rutina.dias.map((d) => ({
          key: d.id,
          id: d.id,
          name: d.name,
          ejercicios: d.ejercicios,
          weekdays: d.weekdays,
        }));
        setNombre(rutina.name);
        setDias(filas);
        setOriginal(firma(rutina.name, filas));
      }
      setCargando(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [routineId]);

  const sucio = useMemo(
    () => (original === null ? false : firma(nombre, dias) !== original),
    [nombre, dias, original],
  );
  const nombreValido = nombre.trim() !== '';
  const cargada = original !== null;

  const salir = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/routines');
  }, [router]);

  function volver() {
    if (guardando) return;
    if (!sucio) {
      salir();
      return;
    }
    Alert.alert('Descartar cambios', 'Lo que editaste en esta rutina se va a perder.', [
      { text: 'Seguir editando', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: salir },
    ]);
  }

  // --- Dias ------------------------------------------------------------------

  const mover = useCallback((from: number, to: number) => {
    setDias((prev) => {
      const copia = prev.slice();
      const [fila] = copia.splice(from, 1);
      copia.splice(to, 0, fila);
      return copia;
    });
  }, []);

  const quitarFila = useCallback((i: number) => {
    setDias((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const quitar = useCallback(
    (i: number) => {
      const d = dias[i];
      if (!d) return;
      // Una rutina sin dias no sirve para nada.
      if (dias.length === 1) {
        showToast({ message: 'La rutina necesita al menos un día', type: 'info' });
        return;
      }
      // Sacar un dia con ejercicios se los lleva puestos, y no hay deshacer.
      if (d.ejercicios > 0) {
        Alert.alert(
          `Quitar ${d.name}`,
          `Se van a borrar sus ${d.ejercicios} ${d.ejercicios === 1 ? 'ejercicio' : 'ejercicios'} cuando guardes.`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Quitar', style: 'destructive', onPress: () => quitarFila(i) },
          ],
        );
        return;
      }
      quitarFila(i);
    },
    [dias, quitarFila, showToast],
  );

  function agregarDia() {
    if (dias.length >= MAX_DIAS) return;
    setDias((prev) => [
      ...prev,
      {
        key: `nuevo-${proximaKey}`,
        id: null,
        name: `Día ${prev.length + 1}`,
        ejercicios: 0,
        weekdays: [],
      },
    ]);
    setProximaKey((n) => n + 1);
  }

  // --- Guardado --------------------------------------------------------------

  async function guardar() {
    if (!routineId || !nombreValido || guardando) return;
    setGuardando(true);

    const ok = await guardarRutina(routineId, nombre, dias);

    if (!ok) {
      setGuardando(false);
      showToast({ message: 'No pudimos guardar la rutina. Proba de nuevo.', type: 'error' });
      return;
    }

    setGuardando(false);
    const nuevos = dias.filter((d) => d.id === null).length;
    showToast({
      message: nuevos > 0 ? 'Rutina guardada. Entrá a los días nuevos para cargarlos' : 'Rutina guardada',
      type: 'success',
    });
    salir();
  }

  const items = dias.map((d) => ({ key: d.key, title: d.name, detail: detalleDia(d) }));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Button variant="ghost" size="sm" icon="chevron-left" onPress={volver} disabled={guardando}>
            Atrás
          </Button>
        </View>

        {cargando ? (
          <View style={styles.centro}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !cargada ? (
          <View style={styles.centro}>
            <FrenciaText role="subtitle" style={styles.centerText}>
              No encontramos esta rutina
            </FrenciaText>
            <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.centerText}>
              Puede que la hayas borrado desde otro dispositivo.
            </FrenciaText>
          </View>
        ) : (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.bloque}>
              <FrenciaText role="dataLabel" color={colors.accentText}>
                Editar rutina
              </FrenciaText>
              <FrenciaText role="subtitle">{nombre.trim() || 'Rutina sin nombre'}</FrenciaText>
              <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.hint}>
                Cambiá el nombre y qué días la componen. Los ejercicios de cada día se editan
                entrando al día.
              </FrenciaText>

              {/* Mismo campo que el paso 1 del wizard */}
              <View style={styles.field}>
                <Icon name="list" size={20} color={colors.accent} />
                <TextInput
                  style={styles.input}
                  placeholder="Push Pull Legs"
                  placeholderTextColor={colors.textTertiary}
                  value={nombre}
                  onChangeText={setNombre}
                  maxLength={40}
                  returnKeyType="done"
                />
              </View>
            </View>

            <View style={styles.bloque}>
              <View style={styles.seccionHeader}>
                <FrenciaText role="dataLabel" color={colors.textTertiary}>
                  Días de entrenamiento
                </FrenciaText>
                <FrenciaText role="dataLabel" color={colors.textTertiary}>
                  {dias.length} de {MAX_DIAS}
                </FrenciaText>
              </View>

              <FrenciaText role="dataLabel" color={colors.textTertiary}>
                {dias.length > 1
                  ? 'Mantené un día apretado para cambiarlo de orden'
                  : 'Agregá los días que tenga la rutina'}
              </FrenciaText>

              {/* Sin onPress a proposito: entrar al dia desde aca perderia lo
                 que todavia no se guardo. Se entra desde el detalle. */}
              <DraggableRowList items={items} onReorder={mover} onRemove={quitar} />

              <Button
                variant="secondary"
                size="md"
                icon="plus"
                fullWidth
                disabled={dias.length >= MAX_DIAS}
                onPress={agregarDia}
              >
                Agregar día
              </Button>
            </View>
          </ScrollView>
        )}

        {cargada && (
          <View style={styles.nav}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon="check"
              disabled={!sucio || !nombreValido}
              loading={guardando}
              onPress={guardar}
            >
              Guardar cambios
            </Button>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    flex: { flex: 1, paddingHorizontal: spacing.padScreen, paddingVertical: space[5] },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[3] },
    centerText: { textAlign: 'center' },

    header: { flexDirection: 'row', alignItems: 'center' },

    scroll: { flexGrow: 1, paddingTop: space[6], paddingBottom: space[6], gap: space[8] },
    bloque: { gap: space[3] },
    hint: { marginBottom: space[2], maxWidth: 320 },

    seccionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      paddingHorizontal: space[5],
      height: sizing.controlHLg,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    input: { flex: 1, fontFamily: sans.regular, fontSize: 16, color: colors.textPrimary },

    nav: { paddingHorizontal: spacing.padScreen, paddingBottom: space[5] },
  });
