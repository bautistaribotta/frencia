/* Frencia · ArchiveRoutineDialog — que hacer con la rutina activa al crear otra.
   Solo puede haber una rutina activa, asi que al finalizar una nueva el
   usuario decide: activar la nueva (la actual se archiva) o mantener la actual
   activa y guardar la nueva archivada. Aparece en Finalizar rutina y no al
   entrar al wizard: recien ahi la rutina nueva existe y la pregunta se
   entiende.
   No tiene Cancelar: cerrarlo (tocar afuera o volver) no crea nada y deja el
   wizard en el ultimo paso, con todo lo armado. Se dibuja con Dialogo, la
   misma base que el modal de alerta. */

import React from 'react';

import { LumeButton } from '@/design/lume';
import { Dialogo } from '@/components/Dialogo';

export interface ArchiveRoutineDialogProps {
  visible: boolean;
  /** Nombre de la rutina que hoy esta activa. */
  nombreActual: string;
  onContinuar: () => void;
  onMantener: () => void;
  /** Cerrar sin elegir. */
  onCerrar: () => void;
}

export function ArchiveRoutineDialog({
  visible,
  nombreActual,
  onContinuar,
  onMantener,
  onCerrar,
}: ArchiveRoutineDialogProps) {
  return (
    <Dialogo
      visible={visible}
      titulo={`¿Qué hacemos con "${nombreActual}"?`}
      mensaje="Solo podés tener una rutina activa. Si activás la nueva, esta queda archivada. Si la mantenés, la nueva se guarda en tus rutinas para activarla cuando quieras."
      onDescartar={onCerrar}
    >
      {/* Cada boton nombra la rutina que queda activa: la decision se lee en
         el boton mismo, sin tener que volver al mensaje. */}
      <LumeButton variant="primary" size="lg" fullWidth onPress={onContinuar}>
        Activar la nueva
      </LumeButton>
      <LumeButton variant="secondary" size="lg" fullWidth onPress={onMantener}>
        {`Mantener «${nombreActual}» activa`}
      </LumeButton>
    </Dialogo>
  );
}
