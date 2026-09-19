/* Racha de entrenamientos: sesiones planificadas cumplidas sin interrupcion.
   Ver docs/specs/racha-de-entrenamientos.md. Este modulo es puro (sin red ni
   React) para poder probarlo con node --test; la consulta vive en history.ts. */

/** Hasta donde se mira hacia atras. Una racha mas larga se muestra como este tope. */
export const RACHA_TOPE_DIAS = 366;

export interface Racha {
  /** Sesiones planificadas cumplidas seguidas. 0 = sin racha. */
  racha: number;
  /** Hoy es dia planificado y todavia no se entreno: la racha sigue viva pero en gris. */
  pendienteHoy: boolean;
}

/** Fecha local del dispositivo como "YYYY-MM-DD", la unidad con la que se compara. */
export function fechaLocal(epochMs: number): string {
  const d = new Date(epochMs);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Weekday de una fecha "YYYY-MM-DD" con la convencion de training_day_weekdays
// (0 = lunes ... 6 = domingo). Se construye en hora local para que no haya
// corrimientos por zona horaria.
function weekdayDe(fecha: string): number {
  const [a, m, d] = fecha.split('-').map(Number);
  return (new Date(a, m - 1, d).getDay() + 6) % 7;
}

function restarDias(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split('-').map(Number);
  return fechaLocal(new Date(a, m - 1, d - dias).getTime());
}

/**
 * Recorre desde `hoy` hacia atras, dia por dia. Un dia no planificado se
 * saltea; uno planificado y cumplido suma; hoy pendiente no suma ni corta;
 * cualquier otro dia planificado sin sesion corta la racha.
 *
 * @param weekdays dias planificados de la rutina activa (0 = lunes).
 * @param fechasEntrenadas fechas locales "YYYY-MM-DD" con alguna sesion terminada.
 * @param hoy fecha local de hoy, "YYYY-MM-DD".
 */
export function calcularRacha(
  weekdays: Iterable<number>,
  fechasEntrenadas: Iterable<string>,
  hoy: string,
): Racha {
  const planificados = new Set(weekdays);
  const entrenadas = new Set(fechasEntrenadas);
  if (planificados.size === 0) return { racha: 0, pendienteHoy: false };

  let racha = 0;
  let pendienteHoy = false;
  for (let i = 0; i < RACHA_TOPE_DIAS; i++) {
    const fecha = restarDias(hoy, i);
    if (!planificados.has(weekdayDe(fecha))) continue;
    if (entrenadas.has(fecha)) {
      racha += 1;
      continue;
    }
    if (i === 0) {
      pendienteHoy = true;
      continue;
    }
    break;
  }
  // Sin racha no hay nada pendiente que mostrar: el badge se oculta.
  return { racha, pendienteHoy: racha > 0 && pendienteHoy };
}
