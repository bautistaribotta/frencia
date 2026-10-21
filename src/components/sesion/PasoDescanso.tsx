/* Frencia · Sesion · El paso de descanso: la esfera con el reloj y, debajo,
   lo que viene despues. */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/design';
import { LumeText, Vidrio, lumeRadius, lumeSpace, useLume } from '@/design/lume';
import type { UnidadDistancia } from '@/lib/distancia';
import type { UnidadPeso } from '@/lib/peso';
import { datosProximos, type ValoresSerie } from '@/lib/sesion-pasos';
import type { EjercicioPlan, Medidor, SerieFantasma } from '@/lib/session';

import { RelojDescanso } from './RelojDescanso';

export function PasoDescanso({
  clave,
  ejercicio,
  inicio,
  ajuste,
  yaVibro,
  onAjustar,
  onTerminadoChange,
  proximo,
  onSiguiente,
  unidad,
  unidadDistancia,
  medidor,
}: {
  clave: string;
  ejercicio: EjercicioPlan;
  inicio: number | undefined;
  ajuste: number;
  yaVibro: React.RefObject<Set<string>>;
  onAjustar: (clave: string, nuevoAjuste: number) => void;
  onTerminadoChange: (terminado: boolean) => void;
  /** La serie que sigue al descanso, si la hay. */
  proximo: {
    ejercicio: EjercicioPlan;
    mismoEjercicio: boolean;
    serie: number;
    totalSeries: number;
    cargado: ValoresSerie | undefined;
    fantasma: SerieFantasma | undefined;
  } | null;
  onSiguiente: () => void;
  unidad: UnidadPeso;
  unidadDistancia: UnidadDistancia;
  medidor: Medidor;
}) {
  return (
    <View style={styles.descanso}>
      <RelojDescanso
        key={clave}
        clave={clave}
        base={ejercicio.restSeconds ?? 0}
        inicio={inicio}
        ajuste={ajuste}
        yaVibro={yaVibro}
        onAjustar={onAjustar}
        onTerminadoChange={onTerminadoChange}
      />

      {proximo ? (
        <LoQueViene
          {...proximo}
          unidad={unidad}
          unidadDistancia={unidadDistancia}
          medidor={medidor}
          onPress={onSiguiente}
        />
      ) : null}
    </View>
  );
}

/** Lo que viene despues del descanso: la proxima serie y con que cargarla.
 *  Sale de lo ya escrito para esa serie (al volver atras), si no de la vez
 *  anterior, y si no del plan; el esfuerzo, del plan. Tocarla avanza, como la
 *  accion de abajo. */
function LoQueViene({
  ejercicio,
  mismoEjercicio,
  serie,
  totalSeries,
  cargado,
  fantasma,
  unidad,
  unidadDistancia,
  medidor,
  onPress,
}: {
  ejercicio: EjercicioPlan;
  mismoEjercicio: boolean;
  serie: number;
  totalSeries: number;
  cargado: ValoresSerie | undefined;
  fantasma: SerieFantasma | undefined;
  unidad: UnidadPeso;
  unidadDistancia: UnidadDistancia;
  medidor: Medidor;
  onPress: () => void;
}) {
  const { t } = useLume();
  const { grupos, esfuerzo } = datosProximos(
    ejercicio,
    cargado,
    fantasma,
    unidad,
    unidadDistancia,
    medidor,
  );
  const cualSerie = totalSeries === 1 ? 'Serie única' : `Serie ${serie + 1} de ${totalSeries}`;
  const titulo = mismoEjercicio
    ? `A continuación · ${cualSerie}`
    : `A continuación · ${ejercicio.name}`;

  // Los grupos se separan con un punto; dentro de un grupo (peso y reps), con
  // una cruz. Los signos van en terciario para que manden los numeros.
  const piezas: React.ReactNode[] = [];
  grupos.forEach((grupo, g) => {
    if (g > 0) piezas.push(<Text key={`p${g}`} style={{ color: t.textTertiary }}> · </Text>);
    grupo.forEach((dato, d) => {
      if (d > 0) piezas.push(<Text key={`x${g}${d}`} style={{ color: t.textTertiary }}> × </Text>);
      piezas.push(dato);
    });
  });
  if (esfuerzo) {
    if (piezas.length > 0) piezas.push(<Text key="pe" style={{ color: t.textTertiary }}> · </Text>);
    piezas.push(
      <Text key="e" style={{ color: t.intensityText }}>
        {esfuerzo}
      </Text>,
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.siguiente, pressed && { transform: [{ scale: 0.985 }] }]}
    >
      <Vidrio radio={lumeRadius.lg} style={styles.siguienteVidrio}>
        <View style={styles.siguienteTexto}>
          <LumeText rol="label" color={t.textTertiary} numberOfLines={1}>
            {titulo}
          </LumeText>
          <LumeText rol="data" numberOfLines={1}>
            {piezas.length > 0 ? piezas : mismoEjercicio ? 'Sin registro previo' : cualSerie}
          </LumeText>
        </View>
        <Icon name="chevron-right" size={18} strokeWidth={1.75} color={t.textTertiary} />
      </Vidrio>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Descanso: la esfera manda, todo lo demas es contexto.
  descanso: { alignItems: 'center', gap: lumeSpace[6], paddingVertical: lumeSpace[3] },
  siguiente: { alignSelf: 'stretch' },
  siguienteVidrio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    paddingVertical: lumeSpace[4],
    paddingHorizontal: lumeSpace[5],
  },
  siguienteTexto: { flex: 1, gap: 2 },
});
