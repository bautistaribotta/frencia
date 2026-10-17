/* Frencia · ArchiveRoutineDialog — que hacer con la rutina activa al crear otra.
   Solo puede haber una rutina activa, asi que al finalizar una nueva el
   usuario decide: reemplazar la actual con la nueva, o seguir con la actual y
   guardar la nueva archivada. Aparece en Finalizar rutina y no al entrar al
   wizard: recien ahi la rutina nueva existe y la pregunta se entiende.
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
      mensaje="Solo podés tener una rutina activa. La nueva puede reemplazarla, o quedar guardada en tus rutinas para activarla cuando quieras."
      onDescartar={onCerrar}
    >
      <LumeButton variant="primary" size="lg" fullWidth onPress={onContinuar}>
        Reemplazarla con la nueva
      </LumeButton>
      <LumeButton variant="secondary" size="lg" fullWidth onPress={onMantener}>
        Seguir con esta, guardar la nueva
      </LumeButton>
    </Dialogo>
  );
}
