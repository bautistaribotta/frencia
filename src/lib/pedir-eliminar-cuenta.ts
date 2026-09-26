/* Frencia · Pedir la eliminacion de la cuenta.
   El flujo de la seccion 6.1 de docs/specs/eliminacion-de-cuenta.md, para
   usarlo igual desde Configuracion y desde la aceptacion de los textos
   legales (quien no acepta tiene que poder irse sin escribir un email).
   Dos pasos: confirmar, y despues informar la fecha de purga y cerrar sesion.
   Si la RPC falla no se cierra nada: la cuenta sigue intacta. */

import { useCallback, useState } from 'react';

import { useToast } from '@/contexts/toast';
import { alerta } from '@/lib/alerta';
import { supabase } from '@/lib/supabase';
import { DIAS_DE_GRACIA, fechaLarga, fechaPurga, solicitarEliminacionCuenta } from '@/lib/cuenta';

export function usePedirEliminarCuenta() {
  const { showToast } = useToast();
  const [eliminando, setEliminando] = useState(false);

  const confirmar = useCallback(async () => {
    setEliminando(true);
    const solicitadaEn = await solicitarEliminacionCuenta();
    setEliminando(false);
    if (!solicitadaEn) {
      showToast({ message: 'No pudimos procesar la solicitud. Proba de nuevo.', type: 'error' });
      return;
    }
    alerta(
      'Cuenta programada para eliminarse',
      `Tu cuenta se eliminará el ${fechaLarga(fechaPurga(solicitadaEn))}. Si cambiás de idea, iniciá sesión antes de esa fecha y vas a poder recuperarla con todos tus datos.`,
      [{ text: 'Entendido', onPress: () => supabase.auth.signOut() }],
      { cancelable: false },
    );
  }, [showToast]);

  const pedir = useCallback(() => {
    if (eliminando) return;
    alerta(
      'Eliminar cuenta',
      `Tu cuenta y todos tus datos (rutinas, sesiones e historial) se eliminarán en ${DIAS_DE_GRACIA} días. Hasta entonces podés recuperarla iniciando sesión. Después de esa fecha los datos no se pueden recuperar.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar cuenta', style: 'destructive', onPress: () => { void confirmar(); } },
      ],
    );
  }, [eliminando, confirmar]);

  return { pedir, eliminando };
}
