/* Frencia · Sesion · La serie del paso actual: titulo, grilla comparativa
   y, en cardio e isometricos, sus campos. */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SerieComparativa, type ColumnaSerie } from '@/components/SerieComparativa';
import { DistanceField, DurationField, Icon, IsoTimer, NumberField } from '@/design';
import { LumeButton, LumeText, lumeLayout, lumeSpace, useLume } from '@/design/lume';
import type { UnidadDistancia } from '@/lib/distancia';
import type { UnidadPeso } from '@/lib/peso';
import { enumerar, parseNum, type ValoresSerie } from '@/lib/sesion-pasos';
import { haceCuanto, type EjercicioPlan, type SerieFantasma } from '@/lib/session';

export function PasoSerie({
  ejercicio,
  serie,
  totalSeries,
  columnas,
  fantasma,
  valor,
  claveActual,
  cardio,
  isometrico,
  serieVacia,
  midiendo,
  falta,
  textoSaltar,
  unidad,
  unidadDistancia,
  setCampo,
  onMidiendo,
  onSaltar,
}: {
  ejercicio: EjercicioPlan;
  serie: number;
  totalSeries: number;
  columnas: ColumnaSerie[];
  fantasma: SerieFantasma | undefined;
  valor: ValoresSerie;
  claveActual: string | null;
  cardio: boolean;
  isometrico: boolean;
  serieVacia: boolean;
  midiendo: boolean;
  falta: string[];
  textoSaltar: string;
  unidad: UnidadPeso;
  unidadDistancia: UnidadDistancia;
  setCampo: <K extends keyof ValoresSerie>(campo: K, valor: ValoresSerie[K]) => void;
  onMidiendo: (midiendo: boolean) => void;
  onSaltar: () => void;
}) {
  const conCampos = cardio || isometrico;
  const faltaTiempo = cardio && falta.includes('el tiempo');
  return (
    <View style={conCampos ? styles.serieCampos : styles.serieAnclada}>
      <View style={styles.serieCabeza}>
        <View style={styles.serieTitulo}>
          <LumeText rol="subtitle">
            {totalSeries === 1
              ? 'Serie única'
              : `Serie ${serie + 1} de ${totalSeries}`}
          </LumeText>
          {totalSeries > 1 ? (
            <PuntosSerie total={totalSeries} actual={serie} />
          ) : null}
        </View>
        {/* Saltar va en el titulo de la serie: queda a mano pero
           lejos de la barra que se toca de memoria. */}
        {serieVacia ? (
          <LumeButton variant="soft" size="sm" icon="skip-forward" onPress={onSaltar}>
            {textoSaltar}
          </LumeButton>
        ) : null}
      </View>

      {/* Las tres lecturas de la serie en una sola grilla. Los
         campos de hoy van vacios a proposito, para que la
         progresion sea una decision y no inercia: se ve lo anterior
         y se escribe igual. */}
      <SerieComparativa
        columnas={columnas}
        cuandoAnterior={fantasma ? haceCuanto(fantasma.hechaEl) : null}
        mostrarHoy={!conCampos}
        amplia={!conCampos}
      />
      {!conCampos && falta.length > 0 && !serieVacia ? (
        <Aviso>Falta cargar {enumerar(falta)}.</Aviso>
      ) : null}

      {/* En cardio la grilla queda como referencia (rutina y ultima)
         y lo de hoy se carga solo en sus campos, que saben escribir
         un reloj y una distancia con decimales. */}
      {cardio ? (
        <View style={styles.campos}>
          {ejercicio.tracks.duration ? (
            /* El aviso va pegado al campo: es lo que bloquea el
               avance y tiene que leerse como parte del campo. */
            <View style={styles.campoConAviso}>
              <DurationField
                label="Tiempo"
                value={valor.tiempo}
                onChange={(v) => setCampo('tiempo', v > 0 ? v : null)}
                step={60}
                allowHours
                size="lg"
                fullWidth
              />
              {faltaTiempo ? <Aviso>Cargá el tiempo para seguir.</Aviso> : null}
            </View>
          ) : null}
          {ejercicio.tracks.distance ? (
            <DistanceField
              label="Distancia"
              value={valor.distancia}
              onChange={(v) => setCampo('distancia', v !== null && v > 0 ? v : null)}
              unit={unidadDistancia}
              size="lg"
              fullWidth
            />
          ) : null}
          {/* Misma mecanica que tiempo y distancia, con la escala
             entera de 1 a 10 que se ofrece al planificar. Es
             opcional: borrar el numero deja la serie sin RPE. */}
          {ejercicio.intensityKind !== null ? (
            <NumberField
              label="RPE · qué tan duro fue"
              hint="1–10"
              value={parseNum(valor.intensidad)}
              onChange={(v) => setCampo('intensidad', v === null ? '' : String(v))}
              min={1}
              max={10}
              size="lg"
              fullWidth
            />
          ) : null}
        </View>
      ) : null}

      {/* Isometrico: el cronometro mide y completa el tiempo, que
         queda editable; peso y RPE van debajo, opcionales salvo el
         peso cuando el plan lo prescribe. La key reinicia el
         cronometro en cada serie. */}
      {isometrico ? (
        <View style={styles.campos}>
          <IsoTimer
            key={claveActual ?? ''}
            target={ejercicio.durationSeconds}
            value={valor.tiempo}
            onChange={(v) => setCampo('tiempo', v)}
            onMeasuringChange={onMidiendo}
          />
          {ejercicio.tracks.weight ? (
            <NumberField
              label={ejercicio.weightKg === null ? 'Peso · opcional' : 'Peso'}
              value={parseNum(valor.peso)}
              onChange={(v) => setCampo('peso', v !== null && v > 0 ? String(v) : '')}
              min={0}
              step={unidad === 'lb' ? 5 : 2.5}
              decimals={1}
              unit={unidad}
              size="lg"
              fullWidth
            />
          ) : null}
          {ejercicio.intensityKind !== null ? (
            <NumberField
              label="RPE · qué tan duro fue"
              hint="1–10"
              value={parseNum(valor.intensidad)}
              onChange={(v) => setCampo('intensidad', v === null ? '' : String(v))}
              min={1}
              max={10}
              size="lg"
              fullWidth
            />
          ) : null}
          {falta.length > 0 && !serieVacia && !midiendo ? (
            <Aviso>Falta cargar {enumerar(falta)}.</Aviso>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** Las marcas de las series del ejercicio: hechas en tinta, la actual en lume
 *  con su brillo, las que faltan en la pista. */
function PuntosSerie({ total, actual }: { total: number; actual: number }) {
  const { t, sombras } = useLume();
  return (
    <View style={styles.puntos} accessible={false}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.punto,
            i < actual
              ? { backgroundColor: t.textPrimary }
              : i === actual
                ? { backgroundColor: t.signal, boxShadow: sombras.haloSignal }
                : { backgroundColor: t.dataTrack },
          ]}
        />
      ))}
    </View>
  );
}

/** Lo que falta para avanzar: en tinta, con icono. No es un error, es lo que
 *  queda por cargar. */
function Aviso({ children }: { children: React.ReactNode }) {
  const { t } = useLume();
  return (
    <View style={styles.aviso}>
      <Icon name="alert-circle" size={16} strokeWidth={1.75} color={t.intensityText} />
      <LumeText rol="bodySm" color={t.intensityText} style={styles.flexTexto}>
        {children}
      </LumeText>
    </View>
  );
}

const styles = StyleSheet.create({
  serieAnclada: { gap: lumeSpace[5] },
  serieCampos: { gap: lumeSpace[7] },
  serieCabeza: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: lumeSpace[3],
    minHeight: lumeLayout.controlHSm,
  },
  serieTitulo: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  puntos: { flexDirection: 'row', gap: 4, marginLeft: lumeSpace[3] },
  punto: { width: 14, height: 3, borderRadius: 2 },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[3] },
  flexTexto: { flex: 1 },
  campos: { gap: lumeSpace[6] },
  campoConAviso: { gap: lumeSpace[4] },
});
