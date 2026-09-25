/* Frencia · ArchiveRoutineDialog — que hacer con la rutina activa al crear otra.
   Solo puede haber una rutina activa, asi que antes de armar una nueva el
   usuario decide: reemplazar la actual con la nueva, seguir con la actual y
   guardar la nueva archivada, o no crear nada (Cancelar). Se dibuja con
   Dialogo, la misma base que el modal de alerta, para respetar el diseno de
   la app: verde en el camino principal, rojo en el que aborta. */

import React from 'react';

import { Button } from '@/design';
import { Dialogo } from '@/components/Dialogo';

export interface ArchiveRoutineDialogProps {
  visible: boolean;
  /** Nombre de la rutina que hoy esta activa. */
  nombreActual: string;
  onContinuar: () => void;
  onMantener: () => void;
  onCancelar: () => void;
}

export function ArchiveRoutineDialog({
  visible,
  nombreActual,
  onContinuar,
  onMantener,
  onCancelar,
}: ArchiveRoutineDialogProps) {
  return (
    // Tocar fuera de la tarjeta cuenta como cancelar.
    <Dialogo
      visible={visible}
      titulo={`¿Qué hacemos con "${nombreActual}"?`}
      mensaje="Solo podés tener una rutina activa. La nueva puede reemplazarla, o quedar guardada en tus rutinas para activarla cuando quieras."
      onDescartar={onCancelar}
    >
      <Button variant="primary" size="lg" fullWidth onPress={onContinuar}>
        Reemplazarla con la nueva
      </Button>
      <Button variant="secondary" size="lg" fullWidth onPress={onMantener}>
        Seguir con esta, guardar la nueva
      </Button>
      <Button variant="danger" size="lg" fullWidth onPress={onCancelar}>
        Cancelar
      </Button>
    </Dialogo>
  );
}
