/* Frencia · Stack del flujo no autenticado (login / registro).
   Login va primero: es el destino del gate de auth al quedar sin sesion. */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
