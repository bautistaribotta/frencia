/* Frencia · Recuperar cuenta.
   Unica pantalla visible mientras la cuenta esta en periodo de gracia: el
   gate del layout raiz manda aca a cualquier sesion con
   `deletion_requested_at` marcado. Ofrece dos salidas: cancelar la solicitud
   (la cuenta queda como estaba) o cerrar sesion. Ver seccion 6.2 de
   docs/specs/eliminacion-de-cuenta.md. */

import React, { useState } from 'react';
import { useRouter } from 'expo-router';

import { EstadoCuenta } from '@/components/EstadoCuenta';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { supabase } from '@/lib/supabase';
import { cancelarEliminacionCuenta, fechaPurga } from '@/lib/cuenta';
import { fechaLarga } from '@/lib/tiempo';

export default function AccountRecoveryScreen() {
  const router = useRouter();
  const { profile, refresh } = useProfile();
  const { showToast } = useToast();
  const [recuperando, setRecuperando] = useState(false);

  // El gate solo trae aca con la fecha cargada; el fallback es por tipado.
  const purga = profile?.deletionRequestedAt ? fechaLarga(fechaPurga(profile.deletionRequestedAt)) : '';

  // Cancela la solicitud y relee el perfil. Con `deletionRequestedAt` de vuelta
  // en null el gate deja de forzar esta ruta; navegamos a mano a la raiz para
  // que decida entre setup y home como en un ingreso normal.
  async function recuperar() {
    setRecuperando(true);
    const ok = await cancelarEliminacionCuenta();
    if (!ok) {
      setRecuperando(false);
      showToast({ message: 'No pudimos recuperar la cuenta. Proba de nuevo.', type: 'error' });
      return;
    }
    await refresh();
    showToast({ message: 'Cuenta recuperada', type: 'success' });
    router.replace('/');
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return (
    <EstadoCuenta
      icono="clock"
      peligro
      rotulo="Eliminación programada"
      titulo={`Tu cuenta se elimina el ${purga}`}
      parrafos={[
        'Pediste eliminar tu cuenta y la solicitud sigue vigente. Si la recuperás ahora, todo queda como lo dejaste: rutinas, sesiones e historial.',
        'Pasada esa fecha, los datos se borran y no se pueden recuperar.',
      ]}
      accion={{ texto: 'Recuperar cuenta', cargando: recuperando, onPress: recuperar }}
      salida={{ texto: 'Cerrar sesión', deshabilitada: recuperando, onPress: cerrarSesion }}
    />
  );
}
