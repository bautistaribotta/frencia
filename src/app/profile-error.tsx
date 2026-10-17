/* Frencia · No se pudo cargar la cuenta.
   El gate del layout raiz manda aca cuando hay sesion pero la lectura del
   perfil fallo o tardo mas que el limite (red caida, Supabase sin responder,
   consulta rota). Antes ese caso se confundia con una cuenta nueva y mandaba
   al setup, donde guardar pisaba los datos reales.

   Dos salidas: reintentar la lectura o volver al inicio de sesion. Si el
   reintento sale bien, el gate ve el perfil cargado y sigue solo a home. */

import React, { useState } from 'react';

import { EstadoCuenta } from '@/components/EstadoCuenta';
import { useProfile } from '@/contexts/profile';
import { useToast } from '@/contexts/toast';
import { supabase } from '@/lib/supabase';

export default function ProfileErrorScreen() {
  const { refresh } = useProfile();
  const { showToast } = useToast();
  const [reintentando, setReintentando] = useState(false);

  async function reintentar() {
    setReintentando(true);
    const ok = await refresh();
    setReintentando(false);
    if (!ok) showToast({ message: 'Seguimos sin poder cargar tu cuenta.', type: 'error' });
  }

  // Cerrar la sesion devuelve al login: el gate lo detecta y redirige.
  async function volverAlLogin() {
    await supabase.auth.signOut();
  }

  // Neutro y no carmin: los datos no corren peligro, solo no se pudieron leer.
  return (
    <EstadoCuenta
      icono="alert-triangle"
      rotulo="Sin respuesta del servidor"
      titulo="No pudimos cargar tu cuenta"
      parrafos={[
        'Tus datos están a salvo: falló la lectura, no se borró nada.',
        'Revisá tu conexión y probá de nuevo. Si sigue igual, el problema puede ser de nuestro lado.',
      ]}
      accion={{ texto: 'Reintentar', icono: 'repeat', cargando: reintentando, onPress: reintentar }}
      salida={{ texto: 'Volver al inicio de sesión', deshabilitada: reintentando, onPress: volverAlLogin }}
    />
  );
}
