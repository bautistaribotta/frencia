/* Frencia · Sesion · El wizard: cabecera, el paso actual y la barra de abajo.
   Un paso por pantalla, con Anterior y Siguiente. El telefono en el gimnasio
   se mira de a segundos entre serie y serie, muchas veces con una mano; una
   sola decision por pantalla se completa sin leer. */

import React, { useEffect, useRef } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { MarqueeText } from '@/components/MarqueeText';
import { LumeButton, LumeIconButton, LumeText, lumeLayout, lumeSpace, useLume } from '@/design/lume';
import { esSerieUnica } from '@/lib/dia';
import { claveDescanso, faltantes, seriesHechas, type Paso } from '@/lib/sesion-pasos';
import { claveSerie, type EjercicioPlan } from '@/lib/session';
import type { Sesion } from '@/lib/use-sesion';

import { CabezaSesion } from './CabezaSesion';
import { columnasCardio, columnasFuerza, columnasIsometrico } from './columnas';
import { MenuEjercicio } from './MenuEjercicio';
import { PasoDescanso } from './PasoDescanso';
import { PasoSerie } from './PasoSerie';

export function WizardSesion({
  sesion,
  paso,
  ejercicioActual,
}: {
  sesion: Sesion;
  paso: Paso;
  ejercicioActual: EjercicioPlan;
}) {
  const { t } = useLume();
  const { estado, pasos, index, valorActual, unidad, unidadDistancia, medidor, setCampo } = sesion;
  const { cantidades, fantasmas, plan, valores, midiendo, descansoTerminado, guardando } = estado;

  // Con el teclado abierto el alto se achica y la serie anclada abajo queda
  // fuera de vista: el scroll baja hasta el final para mostrar la fila de hoy.
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => sub.remove();
  }, []);

  const totalEjercicios = cantidades.filter((c) => c > 0).length;
  const nroEjercicio = cantidades.slice(0, paso.ejercicio).filter((c) => c > 0).length + 1;
  const seriesDelEjercicio = cantidades[paso.ejercicio];
  const fantasma =
    paso.tipo === 'serie'
      ? fantasmas.get(claveSerie(ejercicioActual.exerciseId, paso.serie + 1))
      : undefined;
  const cardio = esSerieUnica(ejercicioActual.kind);
  const isometrico = ejercicioActual.kind === 'isometrico';
  // Cardio e isometricos se cargan en sus campos, debajo de la grilla; la
  // fuerza, en la fila Hoy de la grilla.
  const conCampos = cardio || isometrico;
  const columnas = cardio
    ? columnasCardio(ejercicioActual, fantasma, unidadDistancia)
    : isometrico
      ? columnasIsometrico(ejercicioActual, fantasma, unidad)
      : columnasFuerza(ejercicioActual, fantasma, valorActual, unidad, medidor, setCampo);
  const esSerie = paso.tipo === 'serie';
  const ultimoPaso = index === pasos.length - 1;
  // El boton a la vista solo aparece con la serie vacia: apenas se carga un
  // dato, saltar deja de ser lo probable y el camino queda en el menu.
  const serieVacia =
    !midiendo &&
    valorActual.peso === '' &&
    valorActual.reps === '' &&
    valorActual.intensidad === '' &&
    valorActual.tiempo === null &&
    valorActual.distancia === null;
  // No se avanza con una serie incompleta: no se guardaria y se perderia sin
  // aviso. Para no hacerla esta Saltar serie.
  const falta = esSerie ? faltantes(ejercicioActual, valorActual, medidor) : [];
  const textoSaltar = ultimoPaso ? 'Saltar y terminar' : 'Saltar serie';

  // La escala lleva un corte entre ejercicio y ejercicio: se ve cuanto falta
  // del ejercicio actual y cuanto de la sesion.
  const cortes = pasos.flatMap((p, i) =>
    i < pasos.length - 1 && pasos[i + 1].ejercicio !== p.ejercicio ? [i] : [],
  );

  // Lo que viene despues del descanso, para llegar a la barra sabiendo que
  // cargar. Un descanso nunca es el ultimo paso: siempre le sigue una serie.
  const proximo = paso.tipo === 'descanso' ? pasos[index + 1] : undefined;
  const mismoEjercicio = proximo?.ejercicio === paso.ejercicio;

  const accion = ultimoPaso
    ? 'Terminar'
    : paso.tipo === 'descanso'
      ? !descansoTerminado
        ? 'Saltar descanso'
        : mismoEjercicio
          ? 'Siguiente serie'
          : 'Siguiente ejercicio'
      : conCampos
        ? 'Siguiente'
        : 'Registrar serie';

  return (
    <>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <CabezaSesion
          nombreDia={estado.nombreDia}
          nroEjercicio={nroEjercicio}
          totalEjercicios={totalEjercicios}
          totalPasos={pasos.length}
          actual={index}
          cortes={cortes}
          onSalir={sesion.salir}
          onMenu={sesion.abrirMenu}
        />

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[styles.scroll, esSerie && !conCampos && styles.scrollAnclado]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bloque}>
            <LumeText rol="label" color={t.textTertiary}>
              Ejercicio {nroEjercicio} de {totalEjercicios}
            </LumeText>
            <MarqueeText text={ejercicioActual.name} role="title" />
            {/* En el descanso, lo que importa es cuanto del ejercicio ya
               quedo atras. En la serie el objetivo ya no vive aca: es la
               primera fila de la grilla, al lado de lo que se hizo y de lo
               que se esta cargando. */}
            {paso.tipo === 'descanso' ? (
              <LumeText rol="bodySm" color={t.textSecondary}>
                {seriesHechas(paso.despuesDe + 1, seriesDelEjercicio)}
              </LumeText>
            ) : null}
          </View>

          {paso.tipo === 'descanso' ? (
            <PasoDescanso
              clave={claveDescanso(paso)}
              ejercicio={ejercicioActual}
              inicio={estado.iniciosDescanso[claveDescanso(paso)]}
              ajuste={estado.ajustesDescanso[claveDescanso(paso)] ?? 0}
              yaVibro={sesion.yaVibro}
              onAjustar={sesion.cambiarAjusteDescanso}
              onTerminadoChange={sesion.setDescansoTerminado}
              proximo={
                proximo && proximo.tipo === 'serie'
                  ? {
                      ejercicio: plan[proximo.ejercicio],
                      mismoEjercicio,
                      serie: proximo.serie,
                      totalSeries: cantidades[proximo.ejercicio],
                      cargado:
                        valores[claveSerie(plan[proximo.ejercicio].exerciseId, proximo.serie + 1)],
                      fantasma: fantasmas.get(
                        claveSerie(plan[proximo.ejercicio].exerciseId, proximo.serie + 1),
                      ),
                    }
                  : null
              }
              onSiguiente={sesion.siguiente}
              unidad={unidad}
              unidadDistancia={unidadDistancia}
              medidor={medidor}
            />
          ) : (
            /* En fuerza la serie baja a la zona del pulgar, pegada a la
               accion principal: el contexto queda arriba y lo que se
               completa, abajo. Cardio e isometricos siguen arriba, con sus
               campos. */
            <PasoSerie
              ejercicio={ejercicioActual}
              serie={paso.serie}
              totalSeries={seriesDelEjercicio}
              columnas={columnas}
              fantasma={fantasma}
              valor={valorActual}
              claveActual={sesion.claveActual}
              cardio={cardio}
              isometrico={isometrico}
              serieVacia={serieVacia}
              midiendo={midiendo}
              falta={falta}
              textoSaltar={textoSaltar}
              unidad={unidad}
              unidadDistancia={unidadDistancia}
              setCampo={setCampo}
              onMidiendo={sesion.setMidiendo}
              onSaltar={sesion.saltarSerie}
            />
          )}
        </ScrollView>

        {/* Anterior queda como icono: la accion ancha es la que avanza, y
           siempre esta en el mismo lugar. */}
        <View style={styles.nav}>
          <LumeIconButton
            icon="chevron-left"
            variant="surface"
            size="lg"
            disabled={index === 0}
            onPress={sesion.anterior}
            accessibilityLabel="Anterior"
          />
          <LumeButton
            variant="primary"
            size="lg"
            icon={ultimoPaso ? 'check' : undefined}
            iconRight={ultimoPaso ? undefined : 'arrow-right'}
            loading={guardando}
            disabled={falta.length > 0}
            onPress={sesion.siguiente}
            style={styles.flex}
          >
            {accion}
          </LumeButton>
        </View>
      </KeyboardAvoidingView>

      <MenuEjercicio
        visible={estado.menuAbierto}
        nombre={ejercicioActual.name}
        cardio={cardio}
        esSerie={esSerie}
        textoSaltar={textoSaltar}
        guardando={guardando}
        onCerrar={sesion.cerrarMenu}
        onSumarSerie={sesion.sumarSerie}
        onSaltarSerie={sesion.saltarSerie}
        onCortarEjercicio={sesion.cortarEjercicio}
        onTerminarSesion={sesion.finalizar}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // El scroll no lleva padding vertical propio: en iOS ese padding recorta el
  // contenido en vez de sumarle aire, y la fila de hoy quedaba cortada abajo.
  // El aire vertical vive en el contentContainerStyle.
  scroll: {
    flexGrow: 1,
    gap: lumeSpace[7],
    paddingTop: lumeSpace[8],
    paddingHorizontal: lumeLayout.padScreen,
    paddingBottom: lumeSpace[5],
  },
  // Fuerza: el bloque de arriba y la serie se separan hasta los bordes.
  scrollAnclado: { justifyContent: 'space-between' },
  bloque: { gap: lumeSpace[3] },
  // El aire de arriba es de la barra y no del scroll: con el teclado abierto
  // el scroll lleva la caja enfocada justo al borde y su padding no se ve.
  nav: {
    flexDirection: 'row',
    gap: lumeSpace[3],
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[4],
    paddingBottom: lumeSpace[5],
  },
});
