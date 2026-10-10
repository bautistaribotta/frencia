/* Comparte el ticket de una sesion como imagen PNG, tal como se ve en
   pantalla. Lo usan el resumen al terminar la sesion y el historial. */

import type { RefObject } from 'react';
import type { View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

export type ResultadoCompartir = 'ok' | 'no-disponible' | 'error';

export async function compartirTicket(ref: RefObject<View | null>): Promise<ResultadoCompartir> {
  try {
    if (!ref.current) return 'error';
    if (!(await Sharing.isAvailableAsync())) return 'no-disponible';
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      UTI: 'public.png',
      dialogTitle: 'Compartir sesión',
    });
    return 'ok';
  } catch {
    return 'error';
  }
}

/** El aviso para cada resultado que no salio bien. */
export const AVISO_COMPARTIR: Record<Exclude<ResultadoCompartir, 'ok'>, string> = {
  'no-disponible': 'Este dispositivo no permite compartir imágenes.',
  error: 'No pudimos compartir la sesión.',
};
