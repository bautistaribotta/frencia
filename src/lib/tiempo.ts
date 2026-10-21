/* Formatos de tiempo del design system (tipos de ejercicio, seccion 04). El
   canonico es siempre el segundo: la duracion de una serie o de un descanso se
   guarda en segundos y el formato se aplica recien al mostrarla. */

export const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const MESES_MAYUS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
export const MESES_LARGO = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Indice del dia de la semana con base lunes (0 = lunes ... 6 = domingo). */
export function indiceSemanaLunes(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** Reloj para grillas y campos: m:ss por debajo de una hora y h:mm:ss desde
 *  una hora, sin cero inicial en la primera cifra ("0:45", "30:00", "1:05:00"). */
export function reloj(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** Compacto para resumenes: "45 s", "2 min", "1 h", "1 h 15 min"; lo que no
 *  cae en minutos exactos va como reloj, "1:30". */
export function duracionCompacta(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  if (seconds % 60 !== 0) return reloj(seconds);
  const h = Math.floor(seconds / 3600);
  const m = (seconds % 3600) / 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** "48 min" o "1 h 12 min". Menos de un minuto se redondea a "1 min". */
export function duracionSesion(startedAt: number, finishedAt: number): string {
  const minutos = Math.max(1, Math.round((finishedAt - startedAt) / 60000));
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}
