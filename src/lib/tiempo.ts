/* Formatos de tiempo del design system (tipos de ejercicio, seccion 04). El
   canonico es siempre el segundo: la duracion de una serie o de un descanso se
   guarda en segundos y el formato se aplica recien al mostrarla. */

/** Reloj para grillas y campos: m:ss por debajo de una hora y h:mm:ss desde
 *  una hora, sin cero inicial en la primera cifra ("0:45", "30:00", "1:05:00"). */
export function reloj(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
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
