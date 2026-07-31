/* Frencia · Pestanias de la app autenticada.
   La barra vive en el layout y no dentro de cada pantalla. Asi se monta una
   sola vez y cambiar de pestania no la desmonta ni la vuelve a animar: las
   pantallas se intercambian debajo de una barra que no se mueve.

   Solo son pestanias los destinos de primer nivel. El wizard, la sesion y las
   pantallas de edicion viven en el stack de arriba y tapan la barra a
   proposito: se entra a hacer una cosa y se sale. */

import React, { useCallback } from 'react';
import { Tabs, useRouter } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { TabBar } from '@/design';

// El value de cada item es el nombre del archivo de la pantalla, que es como
// las identifica el navegador. Con cuatro tabs quedan dos de cada lado del
// boton central y la barra sale simetrica sola.
const TABS = [
  { value: 'home', label: 'Hoy', icon: 'home' },
  { value: 'routines', label: 'Rutinas', icon: 'layers' },
  { value: 'history', label: 'Historial', icon: 'history' },
  { value: 'profile', label: 'Perfil', icon: 'user' },
];

function FrenciaTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const activa = state.routes[state.index]?.name ?? '';

  const cambiar = useCallback(
    (value: string) => {
      const ruta = state.routes.find((r) => r.name === value);
      if (!ruta) return;

      // Emitir el evento es lo que deja que una pantalla cancele la navegacion,
      // por ejemplo para volver arriba cuando ya estas parado en ella.
      const evento = navigation.emit({
        type: 'tabPress',
        target: ruta.key,
        canPreventDefault: true,
      });
      if (!evento.defaultPrevented) navigation.navigate(ruta.name);
    },
    [state.routes, navigation],
  );

  return (
    <TabBar
      items={TABS}
      value={activa}
      onChange={cambiar}
      fab={{ icon: 'plus', label: 'Crear', onPress: () => router.push('/create-routine') }}
    />
  );
}

export default function MainLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FrenciaTabBar {...props} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="routines" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
