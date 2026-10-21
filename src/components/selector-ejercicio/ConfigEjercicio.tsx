/* Frencia · Selector de ejercicio · La cara de configuracion: lo que
   prescribe el plan segun el tipo. Series, reps, esfuerzo y descanso en
   fuerza; tiempo, distancia y RPE en cardio; series, tiempo, peso opcional,
   RPE y descanso en isometricos. */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { MarqueeText } from '@/components/MarqueeText';
import { DistanceField, DurationField, ExerciseTypeTag, Icon, NumberField, Stepper } from '@/design';
import { LumeText, Segmentado, Vidrio, lumeRadius, lumeSpace, useLume } from '@/design/lume';
import type { ConfigEjercicio as Config } from '@/lib/config-ejercicio';
import { esSerieUnica, intensityRange, intensityValueLabel, restLabel, type Medidor } from '@/lib/dia';
import type { UnidadDistancia } from '@/lib/distancia';
import { TIPOS, datosAbreviados } from '@/lib/exercises';
import type { UnidadPeso } from '@/lib/peso';

type Campo = Exclude<keyof Config, 'selected'>;

export function ConfigEjercicio({
  config,
  editMode,
  medidorActivo,
  tiempoValido,
  unidadDistancia,
  unidadPeso,
  set,
  onAbrirDescanso,
}: {
  config: Config & { selected: NonNullable<Config['selected']> };
  editMode: boolean;
  medidorActivo: Medidor;
  tiempoValido: boolean;
  unidadDistancia: UnidadDistancia;
  unidadPeso: UnidadPeso;
  set: <K extends Campo>(campo: K, valor: Config[K]) => void;
  onAbrirDescanso: () => void;
}) {
  const { t, sombras } = useLume();
  const { selected, sets, reps, intensityValue, restSeconds, tiempo, distancia, pesoPlan, conRpe } = config;
  const setSets = (v: number) => set('sets', v);
  const setReps = (v: number) => set('reps', v);
  const setIntensityValue = (v: number) => set('intensityValue', v);
  const setTiempo = (v: number | null) => set('tiempo', v);
  const setDistancia = (v: number | null) => set('distancia', v);
  const setPesoPlan = (v: number | null) => set('pesoPlan', v);
  const setConRpe = (v: boolean) => set('conRpe', v);
  const abrirDescanso = onAbrirDescanso;

  const esCardio = esSerieUnica(selected.kind);
  const esIsometrico = selected.kind === 'isometrico';
  const rango = intensityRange(medidorActivo);

  // RPE opcional de cardio e isometricos: "Sin RPE" o un objetivo de 1 a 10.
  const bloqueRpeOpcional = (
    <View style={styles.campoBloque}>
      <View style={styles.captionFila}>
        <LumeText rol="label" color={t.textTertiary}>
          Intensidad
        </LumeText>
        <LumeText rol="label" color={t.textDisabled}>
          opcional
        </LumeText>
      </View>
      <Segmentado
        value={conRpe ? 'rpe' : 'none'}
        onChange={(v) => setConRpe(v === 'rpe')}
        opciones={[
          { value: 'none', label: 'Sin RPE' },
          { value: 'rpe', label: 'RPE' },
        ]}
      />
      {conRpe ? (
        <Stepper
          label="RPE objetivo"
          value={intensityValue}
          onChange={setIntensityValue}
          min={rango.min}
          max={rango.max}
          size="lg"
          fullWidth
          style={styles.campoSeparado}
        />
      ) : null}
    </View>
  );

  // Descanso libre: el campo muestra el valor y abre las ruedas, igual que la
  // edad o el peso en el perfil.
  const bloqueDescanso = (
    <View style={styles.campoBloque}>
      <LumeText rol="label" color={t.textTertiary}>
        Descanso entre series
      </LumeText>
      <Pressable
        onPress={abrirDescanso}
        accessibilityRole="button"
        accessibilityLabel={`Descanso entre series: ${restLabel(restSeconds)}`}
        accessibilityHint="Abre las ruedas para elegir minutos y segundos"
        style={({ pressed }) => [
          styles.campoToque,
          {
            backgroundColor: pressed ? t.surfaceCardElevated : t.surfaceCard,
            borderColor: t.glassLine,
            borderTopColor: t.glassHighlight,
            boxShadow: sombras.glass,
          },
        ]}
      >
        <Icon name="timer" size={20} strokeWidth={1.75} color={t.textTertiary} />
        {restSeconds === null ? (
          <LumeText rol="body" color={t.textSecondary} style={styles.campoTexto}>
            Sin descanso
          </LumeText>
        ) : (
          <LumeText rol="hero" style={[styles.campoValor, styles.campoTexto]}>
            {restLabel(restSeconds)}
          </LumeText>
        )}
        <Icon name="chevron-right" size={18} strokeWidth={1.75} color={t.textTertiary} />
      </Pressable>
    </View>
  );

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.modalBody}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <LumeText rol="title">{editMode ? 'Editar ejercicio' : 'Configurar'}</LumeText>

      <Vidrio nivel="fuerte" style={styles.elegido}>
        <Icon name={TIPOS[selected.kind].icon} size={20} strokeWidth={1.75} color={t.textPrimary} />
        <View style={styles.nombre}>
          <MarqueeText text={selected.name} role="subtitle" color={t.textPrimary} />
          {selected.kind !== 'fuerza' ? (
            <ExerciseTypeTag
              label={TIPOS[selected.kind].label}
              icon={TIPOS[selected.kind].icon}
              metrics={datosAbreviados(selected.tracks)}
            />
          ) : null}
        </View>
      </Vidrio>

      {esCardio ? (
        <>
          {/* Una sola serie continua: sin series ni descanso. El plan
             prescribe tiempo, distancia o las dos cosas. */}
          <View style={styles.cardioCampos}>
            {selected.tracks.duration ? (
              <DurationField
                label="Tiempo"
                value={tiempo}
                onChange={(v) => setTiempo(v > 0 ? v : null)}
                step={60}
                allowHours
                size="lg"
                fullWidth
              />
            ) : null}
            {selected.tracks.distance ? (
              <DistanceField
                label="Distancia"
                value={distancia}
                onChange={(v) => setDistancia(v !== null && v > 0 ? v : null)}
                unit={unidadDistancia}
                size="lg"
                fullWidth
              />
            ) : null}
            {!tiempoValido ? (
              <LumeText rol="bodySm" color={t.textTertiary}>
                Cargá el tiempo para seguir.
              </LumeText>
            ) : null}
          </View>

          {bloqueRpeOpcional}
        </>
      ) : esIsometrico ? (
        <>
          {/* Series con descanso, como la fuerza, pero el volumen es el
             tiempo sostenido. Las series van solas y a todo el ancho,
             igual que el tiempo de abajo: el campo de tiempo no entra a
             media anchura. */}
          <Stepper label="Series" value={sets} onChange={setSets} min={1} max={20} size="lg" fullWidth />
          <View style={styles.cardioCampos}>
            {selected.tracks.duration ? (
              <DurationField
                label={sets > 1 ? 'Tiempo por serie' : 'Tiempo'}
                value={tiempo}
                onChange={(v) => setTiempo(v > 0 ? v : null)}
                step={5}
                size="lg"
                fullWidth
              />
            ) : null}
            {!tiempoValido ? (
              <LumeText rol="bodySm" color={t.textTertiary}>
                Cargá el tiempo para seguir.
              </LumeText>
            ) : null}
          </View>

          {/* El peso es opcional: la plancha suele ir sin carga. Si el
             plan lo prescribe, la sesion lo pide en cada serie. */}
          {selected.tracks.weight ? (
            <View style={styles.campoBloque}>
              <View style={styles.captionFila}>
                <LumeText rol="label" color={t.textTertiary}>
                  {sets > 1 ? 'Peso por serie' : 'Peso'}
                </LumeText>
                <LumeText rol="label" color={t.textDisabled}>
                  opcional
                </LumeText>
              </View>
              <NumberField
                value={pesoPlan}
                onChange={(v) => setPesoPlan(v !== null && v > 0 ? v : null)}
                min={0}
                step={unidadPeso === 'lb' ? 5 : 2.5}
                decimals={1}
                unit={unidadPeso}
                size="lg"
                fullWidth
              />
              <LumeText rol="bodySm" color={t.textTertiary}>
                {pesoPlan
                  ? 'Con peso en el plan, la sesión lo pide en cada serie.'
                  : 'Sin peso en el plan, en la sesión es opcional.'}
              </LumeText>
            </View>
          ) : null}

          {bloqueRpeOpcional}
          {bloqueDescanso}
        </>
      ) : (
        <>
          {/* Series y repeticiones van juntas: son el volumen y se leen
             de a par ("3 x 10"). */}
          <View style={styles.par}>
            <Stepper
              label="Series"
              value={sets}
              onChange={setSets}
              min={1}
              max={20}
              size="lg"
              fullWidth
              style={styles.parItem}
            />
            <Stepper
              label="Repeticiones"
              value={reps}
              onChange={setReps}
              min={1}
              max={50}
              size="lg"
              fullWidth
              style={styles.parItem}
            />
          </View>

          <Stepper
            label={`Esfuerzo · ${medidorActivo === 'rir' ? 'RIR' : 'RPE'}`}
            value={intensityValue}
            onChange={setIntensityValue}
            min={rango.min}
            max={rango.max}
            format={(v) => intensityValueLabel(medidorActivo, v)}
            size="lg"
            fullWidth
          />

          {bloqueDescanso}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  modalBody: { paddingTop: lumeSpace[6], paddingBottom: lumeSpace[6], gap: lumeSpace[8] },
  elegido: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4], padding: lumeSpace[5] },
  // Caja del nombre dentro de una fila: ocupa lo que dejan los iconos.
  nombre: { flex: 1, minWidth: 0, gap: lumeSpace[3] },
  par: { flexDirection: 'row', gap: lumeSpace[3] },
  parItem: { flex: 1, minWidth: 0 },
  campoBloque: { gap: lumeSpace[3] },
  cardioCampos: { gap: lumeSpace[5] },
  captionFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  campoSeparado: { marginTop: lumeSpace[4] },
  campoToque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    height: 60,
    paddingHorizontal: lumeSpace[5],
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
  },
  campoTexto: { flex: 1 },
  campoValor: { fontSize: 30, lineHeight: 34, letterSpacing: -0.6 },
});
