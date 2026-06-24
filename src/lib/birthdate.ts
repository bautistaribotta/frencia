/* Frencia · Utilidades de fecha de nacimiento.
   En la base guardamos la fecha en formato ISO corto (YYYY-MM-DD); la edad ya
   no se persiste, se calcula aca cuando hace falta (mostrarla en el perfil,
   calculos de nutricion a futuro, etc). Trabajamos siempre con los componentes
   locales de la fecha para no correr un dia por la zona horaria. */

// Rango seleccionable: desde hace 100 años hasta hoy (no se admite el futuro).
export const MAX_BIRTHDATE = new Date();
export const MIN_BIRTHDATE = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 100);
  return d;
})();

// Fecha por defecto cuando todavia no hay dato: 25 años atras, un punto de
// partida razonable para que la rueda no abra en el extremo.
export function defaultBirthdate(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 25);
  return d;
}

// Date -> 'YYYY-MM-DD' usando los componentes locales.
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 'YYYY-MM-DD' -> Date local (mediodia para evitar saltos por zona horaria).
export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

// Edad cumplida a partir de la fecha de nacimiento en ISO.
export function calcularEdad(iso: string): number {
  const nac = fromIsoDate(iso);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const cumpleEsteAnio =
    hoy.getMonth() > nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() >= nac.getDate());
  if (!cumpleEsteAnio) edad -= 1;
  return edad;
}

// Texto legible para mostrar, ej: "26 de julio de 2001".
export function formatearFecha(iso: string): string {
  return fromIsoDate(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
