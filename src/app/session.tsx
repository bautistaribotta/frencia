/* Frencia · Sesion de entrenamiento — wizard paso a paso.
   Ver docs/specs/registro-de-sesion.md, seccion 6.

   Un paso por pantalla, con Anterior y Siguiente. Los pasos se generan del plan
   del dia: una serie, su descanso, la siguiente serie, y asi. El telefono en el
   gimnasio se mira de a segundos entre serie y serie, muchas veces con una mano;
   una sola decision por pantalla se completa sin leer.

   Cada serie se escribe al pasar al paso siguiente, no al terminar la sesion:
   un entrenamiento dura una hora con la pantalla apagandose y salir de la app
   no puede perder nada.

   El estado y las acciones viven en useSesion (lib/use-sesion), la logica pura
   en lib/sesion-pasos y las piezas de la vista en components/sesion. Esta
   pantalla solo elige que mostrar segun la fase. */

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CargaCentrada } from '@/components/CargaCentrada';
import { ResumenSesion } from '@/components/ResumenSesion';
import { SesionEnConflicto, SesionSinEjercicios } from '@/components/sesion/EstadosSesion';
import { WizardSesion } from '@/components/sesion/WizardSesion';
import { Fondo, type PosicionFondo } from '@/design/lume';
import { useSesion } from '@/lib/use-sesion';

export default function SessionScreen() {
  const params = useLocalSearchParams<{ dia?: string; nombre?: string }>();
  const sesion = useSesion(params.dia ?? '', params.nombre);
  const { estado, fase, pasos, paso, ejercicioActual } = sesion;
  const { conflicto, resumen, sessionId } = estado;

  // Cada paso declara su fondo: la serie, velada (el texto chico va sobre
  // la grilla); el descanso y el resumen, centro (la luz detras de la esfera
  // y del ticket); los casos de borde, cumbre. Al cambiar de paso el Fondo
  // hace el fundido solo.
  let posicion: PosicionFondo = 'velada';
  let contenido: React.ReactNode;

  if (fase === 'cargando') {
    contenido = <CargaCentrada texto="Preparando la sesión…" />;
  } else if (fase === 'conflicto' && conflicto) {
    posicion = 'cumbre';
    contenido = (
      <SesionEnConflicto
        conflicto={conflicto}
        onRetomar={sesion.retomarConflicto}
        onDescartar={sesion.descartarConflicto}
        onVolver={sesion.salir}
      />
    );
  } else if (fase === 'resumen' && resumen && sessionId) {
    posicion = 'centro';
    contenido = (
      <ResumenSesion
        sessionId={sessionId}
        nombreDia={estado.nombreDia}
        inicio={resumen.inicio}
        duracionSegundos={resumen.duracionSegundos}
        ejercicios={resumen.ejercicios}
        unidad={sesion.unidad}
        unidadDistancia={sesion.unidadDistancia}
        guardando={estado.guardando}
        capturaRef={sesion.capturaRef}
        compartiendo={estado.compartiendo}
        onVolver={sesion.volverASesion}
        onCompartir={sesion.compartirResumen}
        onHecho={sesion.confirmarTerminar}
      />
    );
  } else if (fase === 'sinEjercicios' || pasos.length === 0 || !paso || !ejercicioActual) {
    posicion = 'cumbre';
    contenido = <SesionSinEjercicios nombreDia={estado.nombreDia} onVolver={sesion.descartarYSalir} />;
  } else {
    posicion = paso.tipo === 'descanso' ? 'centro' : 'velada';
    contenido = <WizardSesion sesion={sesion} paso={paso} ejercicioActual={ejercicioActual} />;
  }

  return (
    <View style={styles.pantalla}>
      <Fondo posicion={posicion} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
        {contenido}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  flex: { flex: 1 },
});
