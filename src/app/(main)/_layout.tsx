/* Frencia · Pestanias de la app autenticada.
   La barra vive en el layout y no dentro de cada pantalla. Asi se monta una
   sola vez y cambiar de pestania no la desmonta ni la vuelve a animar: las
   pantallas se intercambian debajo de una barra que no se mueve.

   Solo son pestanias los destinos de primer nivel. El wizard, la sesion y las
   pantallas de edicion viven en el stack de arriba y tapan la barra a
   proposito: se entra a hacer una cosa y se sale. */

import React, { useCallback } from 'react';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';

import { LumeTabBar, type LumeTabItem } from '@/design/lume';

// El value de cada item es el nombre del archivo de la pantalla, que es como
// las identifica el navegador.
const TABS = [
  { value: 'home', label: 'Inicio', icon: 'home' },
  { value: 'routines', label: 'Rutinas', icon: 'layers' },
  { value: 'history', label: 'Historial', icon: 'history' },
  { value: 'profile', label: 'Perfil', icon: 'user' },
] satisfies LumeTabItem[];

function FrenciaTabBar({ state, navigation }: BottomTabBarProps) {
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

  return <LumeTabBar items={TABS} value={activa} onChange={cambiar} />;
}

export default function MainLayout() {
  return (
    /* No usar detachInactiveScreens={false}. Con false, la pestania que no se
       ve queda con display: 'none', y en la Nueva Arquitectura eso desmonta
       sus vistas nativas y las manda al pool de reciclaje aunque el componente
       siga montado. Gesture Handler deja sus reconocedores pegados a esas
       UIView: al reciclarlas para otra pantalla, un toque ahi disparaba el
       gesto de la pestania oculta (tocar Configuracion abria tambien la rutina
       activa). Con el default, react-native-screens desconecta la pestania
       entera y sus vistas no se reciclan.
       El hueco de 60pt del RefreshControl del historial al volver, que fue el
       motivo para dejarlas montadas, se resuelve en history.tsx: el control
       solo se activa cuando la recarga la inicio el gesto. */
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FrenciaTabBar {...props} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="routines" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
