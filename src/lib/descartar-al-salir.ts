/* Frencia · Descartar al salir — confirmacion antes de perder una edicion.
   Las pantallas de edicion trabajan en memoria y recien escriben al guardar.
   Mientras haya cambios sin guardar, cualquier salida pasa por aca: el boton
   Atras, el de Cancelar, el gesto de deslizar desde el borde y el boton atras
   de Android. En lugar de salir, se pregunta si se descartan los cambios.

   Si la salida es porque ya se guardo (o se borro), se llama salir con
   sinPreguntar y se deja pasar sin el modal. */

import { useCallback, useRef } from 'react';
import { useNavigation, useRouter, type Href } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';

import { alerta } from '@/lib/alerta';

interface Opciones {
  /** Hay cambios sin guardar: salir los pierde. */
  sucio: boolean;
  /** Se esta guardando o borrando: no se sale hasta que termine. */
  ocupado: boolean;
  /** Cuerpo del modal de confirmacion. */
  mensaje: string;
  /** A donde ir si la pantalla se abrio sin nada debajo en el stack. */
  respaldo: Href;
}

export function useDescartarAlSalir({ sucio, ocupado, mensaje, respaldo }: Opciones) {
  const navigation = useNavigation();
  const router = useRouter();
  // La salida ya esta decidida (se guardo o se borro): no se pregunta.
  const libre = useRef(false);

  usePreventRemove(sucio || ocupado, ({ data }) => {
    if (libre.current) {
      navigation.dispatch(data.action);
      return;
    }
    if (ocupado) return;
    alerta('Descartar cambios', mensaje, [
      { text: 'Seguir editando', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  return useCallback(
    (opciones?: { sinPreguntar?: boolean }) => {
      if (opciones?.sinPreguntar) libre.current = true;
      if (router.canGoBack()) router.back();
      else router.replace(respaldo);
    },
    [router, respaldo],
  );
}
