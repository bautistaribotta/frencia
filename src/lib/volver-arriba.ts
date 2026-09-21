/* Volver arriba al retocar la pestania activa.
   La barra de pestanias (src/app/(main)/_layout.tsx) emite `tabPress` con
   `canPreventDefault` antes de navegar. Si la pantalla ya esta enfocada,
   cancelamos la navegacion (no hay a donde ir) y llevamos su scroll al tope
   con la animacion nativa del ScrollView. Sirve para ScrollView, FlatList y
   SectionList: los tres exponen `getScrollResponder`. */

import { useEffect, type RefObject } from 'react';
import { useNavigation } from 'expo-router';

// Lo minimo que usamos del navigation prop de una pestania. Evita depender de
// los tipos internos de bottom-tabs que expo-router reexporta.
interface NavegacionPestania {
  isFocused(): boolean;
  addListener(tipo: 'tabPress', cb: (e: { preventDefault(): void }) => void): () => void;
}

interface ConScrollTo {
  scrollTo?: (opciones: { y: number; animated?: boolean }) => void;
}

interface Desplazable extends ConScrollTo {
  // En runtime devuelve el ScrollView interno; el tipo declarado por RN es un
  // mixin viejo sin scrollTo, por eso lo estrechamos a mano.
  getScrollResponder?: () => unknown;
}

export function useVolverArribaAlRetocar(ref: RefObject<Desplazable | null>) {
  const navigation = useNavigation<NavegacionPestania>();

  useEffect(
    () =>
      navigation.addListener('tabPress', (e) => {
        if (!navigation.isFocused()) return;
        e.preventDefault();
        const lista = ref.current;
        if (!lista) return;
        // ScrollView tiene scrollTo directo; FlatList y SectionList lo
        // alcanzan a traves de su responder.
        const scroll: ConScrollTo | undefined = lista.scrollTo
          ? lista
          : (lista.getScrollResponder?.() as ConScrollTo | undefined);
        scroll?.scrollTo?.({ y: 0, animated: true });
      }),
    [navigation, ref],
  );
}
