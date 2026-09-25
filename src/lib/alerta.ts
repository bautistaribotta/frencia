/* Frencia · alerta — reemplazo de Alert.alert con el diseno de la app.
   Misma firma que Alert.alert, pero en lugar del dialogo del sistema abre el
   modal propio que monta AlertaProvider (src/contexts/alerta.tsx) en la raiz.
   Asi se ve igual en iOS, Android y web (donde Alert.alert de
   react-native-web es una funcion vacia y no mostraba nada). */

import type { AlertButton, AlertOptions } from 'react-native';

export interface AlertaSolicitud {
  titulo: string;
  mensaje?: string;
  botones: AlertButton[];
  /** Si es false, tocar fuera del modal o el boton atras no lo cierran. */
  cancelable: boolean;
}

type Mostrar = (solicitud: AlertaSolicitud) => void;

let mostrar: Mostrar | null = null;

/** Lo llama AlertaProvider al montarse. Devuelve la funcion de limpieza. */
export function registrarAlerta(fn: Mostrar) {
  mostrar = fn;
  return () => {
    if (mostrar === fn) mostrar = null;
  };
}

export function alerta(
  titulo: string,
  mensaje?: string,
  botones?: AlertButton[],
  opciones?: AlertOptions,
) {
  mostrar?.({
    titulo,
    mensaje,
    botones: botones?.length ? botones : [{ text: 'OK' }],
    cancelable: opciones?.cancelable !== false,
  });
}
