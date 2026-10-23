/* Frencia · Selector de ejercicio · La cara de busqueda: titulo, buscador,
   filtros y el catalogo. */

import React, { useCallback } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ListRenderItemInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

import { Icon, Tag } from '@/design';
import {
  Cargando,
  LumeText,
  MASCARA_LLENA,
  MASCARA_VACIA,
  lumeFuente,
  lumeLayout,
  lumeRadius,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
} from '@/design/lume';
import { TIPOS, type Exercise } from '@/lib/exercises';
import type { BusquedaCatalogo } from '@/lib/use-busqueda-catalogo';

import { FilaCatalogo } from './FilaCatalogo';

export function CatalogoEjercicios({
  busqueda: b,
  catalog,
  catalogLoading,
  onAdd,
}: {
  busqueda: BusquedaCatalogo;
  catalog: Exercise[];
  catalogLoading: boolean;
  onAdd: (exercise: Exercise) => void;
}) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);
  const { abierta, toggleFila } = b;

  const keyExtractor = useCallback((hit: Exercise) => hit.id, []);

  const renderResult = useCallback(
    ({ item }: ListRenderItemInfo<Exercise>) => (
      <FilaCatalogo
        exercise={item}
        abierta={item.id === abierta}
        onToggle={toggleFila}
        onAdd={onAdd}
      />
    ),
    [abierta, toggleFila, onAdd],
  );

  return (
    <View style={styles.flex}>
      <View style={styles.searchHeader}>
        <LumeText rol="title">Agregar ejercicio</LumeText>

        <View style={styles.searchField}>
          <Icon name="search" size={18} strokeWidth={1.75} color={t.textTertiary} />
          <TextInput
            style={styles.input}
            placeholder="Buscá por nombre o músculo"
            placeholderTextColor={t.textTertiary}
            selectionColor={t.signal}
            cursorColor={t.signal}
            value={b.query}
            onChangeText={b.setQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {b.query !== '' && (
            <Pressable
              hitSlop={8}
              onPress={() => b.setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Borrar búsqueda"
            >
              <Icon name="x" size={18} strokeWidth={1.75} color={t.textTertiary} />
            </Pressable>
          )}
        </View>

        {/* Filtro por tipo o por grupo muscular: uno a la vez, como un
           radio. Tocar el activo lo suelta y vuelve a Todos. Los tipos
           llevan su icono, que al elegirlos pasa a ser una marca: asi la
           seleccion no depende solo del color. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsFiltro}
        >
          <Tag
            selectable
            selected={b.grupo === null && b.tipo === null}
            onPress={() => b.filtrarGrupo(null)}
            accessibilityLabel={`Todos, ${catalog.length} ejercicios`}
            style={styles.chipFiltro}
          >
            Todos <Text style={styles.chipConteo}>{catalog.length}</Text>
          </Tag>
          {b.tipos.map(({ kind, count }) => (
            <Tag
              key={kind}
              selectable
              selected={b.tipo === kind}
              icon={b.tipo === kind ? 'check' : TIPOS[kind].icon}
              onPress={() => b.filtrarTipo(kind)}
              accessibilityLabel={`${TIPOS[kind].label}, ${count} ejercicios`}
              style={styles.chipFiltro}
            >
              {TIPOS[kind].label} <Text style={styles.chipConteo}>{count}</Text>
            </Tag>
          ))}
          {b.grupos.map(({ group, count }) => (
            <Tag
              key={group.slug}
              selectable
              selected={b.grupo === group.slug}
              onPress={() => b.filtrarGrupo(group.slug)}
              accessibilityLabel={`${group.name}, ${count} ejercicios`}
              style={styles.chipFiltro}
            >
              {group.name} <Text style={styles.chipConteo}>{count}</Text>
            </Tag>
          ))}
        </ScrollView>

        {!catalogLoading && (
          <LumeText rol="label" color={t.textTertiary}>
            {b.results.length} {b.results.length === 1 ? 'ejercicio' : 'ejercicios'}
            {b.filtroActivo ? ` · ${b.filtroActivo}` : ''}
          </LumeText>
        )}
      </View>

      {/* Sin texto la lista trae el catalogo entero, asi que va
         virtualizada: montar 198 filas de una vez es caro. */}
      {catalogLoading ? (
        <View style={styles.resultsHint}>
          <Cargando />
        </View>
      ) : (
        /* Las filas se funden arriba con una mascara, no con un degradado
           al color de fondo: debajo hay luces, no un color plano. */
        <MaskedView
          style={styles.listWrap}
          maskElement={
            <View style={styles.flex}>
              <LinearGradient colors={[MASCARA_VACIA, MASCARA_LLENA]} style={styles.fundido} />
              <View style={styles.mascaraLlena} />
            </View>
          }
        >
          {/* Sin transicion de layout en las celdas: la de Reanimated
             (itemLayoutAnimation) choca con la virtualizacion y, al
             filtrar o al desplegar y plegar una fila, deja celdas en
             posiciones viejas, encimadas sobre sus vecinas. */}
          <FlatList
            data={b.results}
            keyExtractor={keyExtractor}
            renderItem={renderResult}
            extraData={b.abierta}
            contentContainerStyle={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.resultsHint}>
                <LumeText rol="bodySm" color={t.textTertiary} style={styles.centerText}>
                  No hay ejercicios que coincidan. Probá con otro nombre o sacá el filtro.
                </LumeText>
              </View>
            }
          />
        </MaskedView>
      )}
    </View>
  );
}

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    // Titulo e input separados del boton Cerrar, que queda solo arriba.
    searchHeader: { paddingTop: lumeSpace[5], gap: lumeSpace[5] },
    searchField: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: lumeSpace[4],
      paddingHorizontal: lumeSpace[4],
      height: lumeLayout.controlHMd,
      borderRadius: lumeRadius.lg,
      borderWidth: 1,
      backgroundColor: t.surfaceInset,
      borderColor: t.glassLine,
    },
    input: { flex: 1, fontFamily: lumeFuente.regular, fontSize: 16, padding: 0, color: t.textPrimary },
    // Los chips corren de borde a borde de la pantalla: el scroll anula el
    // padding del contenedor y lo repone adentro.
    chipsScroll: { marginHorizontal: -lumeLayout.padScreen, flexGrow: 0 },
    chipsFiltro: { paddingHorizontal: lumeLayout.padScreen, gap: lumeSpace[2] },
    chipFiltro: { height: lumeLayout.controlHSm },
    // Sin color propio: hereda el del chip (relleno si esta activo).
    chipConteo: { fontFamily: lumeFuente.medium, fontSize: 11, opacity: 0.6, fontVariant: ['tabular-nums'] },
    // La lista va de borde a borde y repone el margen en su contenido: si no,
    // el scroll recorta el fondo de la fila desplegada, que se sale del texto.
    listWrap: { flex: 1, marginHorizontal: -lumeLayout.padScreen },
    mascaraLlena: { flex: 1, backgroundColor: MASCARA_LLENA },
    fundido: { height: lumeSpace[7] },
    // El padding de arriba iguala la altura del fundido: en reposo la primera
    // fila se ve entera, y al scrollear las filas se funden ahi en vez de
    // cortarse pegadas al buscador.
    resultsList: {
      paddingTop: lumeSpace[7],
      paddingBottom: lumeSpace[6],
      paddingHorizontal: lumeLayout.padScreen,
    },
    resultsHint: { paddingVertical: lumeSpace[8], alignItems: 'center' },
    centerText: { textAlign: 'center' },
  });
