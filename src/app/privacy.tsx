/* Frencia · Politica de Privacidad.
   Pantalla de solo lectura. Se llega desde Configuracion y desde el aviso de
   aceptacion en login y registro, por eso es accesible sin sesion. El texto
   vive en src/lib/privacidad.ts. */

import React from 'react';

import { LegalDocument } from '@/components/LegalDocument';
import { PRIVACIDAD, PRIVACIDAD_VIGENCIA } from '@/lib/privacidad';

export default function PrivacyScreen() {
  return (
    <LegalDocument
      titulo="Política de Privacidad"
      vigencia={PRIVACIDAD_VIGENCIA}
      secciones={PRIVACIDAD}
    />
  );
}
