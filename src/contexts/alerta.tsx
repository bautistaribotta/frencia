/* Frencia · Modal de alerta.
   Montado una sola vez en la raiz; lo abre la funcion alerta() de
   src/lib/alerta.ts. Se dibuja con Dialogo, la misma base que
   ArchiveRoutineDialog. Las acciones van primero y Cancelar al final; una
   accion destructiva va en rojo y el resto en verde. Un alerta nuevo
   reemplaza al que este abierto. */

import React, { useEffect, useState } from 'react';
import type { AlertButton } from 'react-native';

import { Button } from '@/design';
import { Dialogo } from '@/components/Dialogo';
import { registrarAlerta, type AlertaSolicitud } from '@/lib/alerta';

export function AlertaProvider({ children }: { children: React.ReactNode }) {
  const [actual, setActual] = useState<AlertaSolicitud | null>(null);

  useEffect(() => registrarAlerta(setActual), []);

  // Se cierra antes de ejecutar la accion: si esa accion abre otro alerta
  // (ej. el segundo paso de eliminar cuenta), el nuevo queda visible.
  function elegir(boton: AlertButton) {
    setActual(null);
    boton.onPress?.();
  }

  const cancelar = actual?.botones.find((b) => b.style === 'cancel');
  const acciones = actual?.botones.filter((b) => b.style !== 'cancel') ?? [];
  const ordenados = cancelar ? [...acciones, cancelar] : acciones;

  // Tocar fuera o el boton atras de Android equivale a Cancelar, solo si
  // existe ese boton y el alerta no se declaro como no cancelable.
  function descartar() {
    if (cancelar && actual?.cancelable) elegir(cancelar);
  }

  return (
    <>
      {children}
      <Dialogo
        visible={actual != null}
        titulo={actual?.titulo}
        mensaje={actual?.mensaje}
        onDescartar={descartar}
      >
        {ordenados.map((boton, i) => (
          <Button
            key={`${boton.text}-${i}`}
            variant={
              boton.style === 'cancel'
                ? 'secondary'
                : boton.style === 'destructive'
                  ? 'danger'
                  : 'primary'
            }
            size="lg"
            fullWidth
            onPress={() => elegir(boton)}
          >
            {boton.text}
          </Button>
        ))}
      </Dialogo>
    </>
  );
}
