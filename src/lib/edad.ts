/* Frencia · Conversion entre edad (anios) y fecha_nacimiento.
   La tabla profiles guarda fecha_nacimiento (date); el front trabaja con la
   edad en anios (ruedas del setup y del perfil). Convertimos en el borde con
   la DB: al guardar pasamos edad -> fecha aproximada (1 de enero del anio de
   nacimiento), al leer calculamos la edad cumplida desde esa fecha. */

// Edad en anios -> fecha_nacimiento (formato YYYY-MM-DD) para persistir.
// Usamos el 1 de enero porque solo conocemos el anio; basta para recuperar la
// edad y respeta el rango permitido por la tabla (1900-2099).
export function edadAFechaNacimiento(edad: number): string | null {
  if (!Number.isInteger(edad) || edad < 0 || edad > 150) return null;
  const anio = new Date().getFullYear() - edad;
  if (anio < 1900 || anio > 2099) return null;
  return `${anio}-01-01`;
}

// fecha_nacimiento (YYYY-MM-DD) -> edad cumplida en anios.
// Se construye en hora local, como en streak.ts: `new Date('YYYY-MM-DD')` la
// lee en UTC y al oeste de Greenwich cae el dia anterior (el 1 de enero pasa a
// ser el 31 de diciembre y la edad sale un anio mas alta).
export function fechaNacimientoAEdad(fecha: string | null): number | null {
  if (!fecha) return null;
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!partes) return null;
  const nacimiento = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
  if (Number.isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const cumpleEsteAnio =
    hoy.getMonth() > nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
  if (!cumpleEsteAnio) edad -= 1;
  return edad >= 0 ? edad : null;
}
