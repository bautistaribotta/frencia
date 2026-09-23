/* Frencia · Terminos y Condiciones.
   Pantalla de solo lectura. Se llega desde Configuracion y desde el aviso de
   aceptacion en login y registro, por eso es accesible sin sesion. El texto
   vive en src/lib/terminos.ts. */

import React from 'react';

import { LegalDocument } from '@/components/LegalDocument';
import { TERMINOS, TERMINOS_VIGENCIA } from '@/lib/terminos';

export default function TermsScreen() {
  return (
    <LegalDocument
      titulo="Términos y Condiciones"
      vigencia={TERMINOS_VIGENCIA}
      secciones={TERMINOS}
    />
  );
}
