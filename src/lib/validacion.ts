const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})$/;

/** Verifica si una cadena tiene formato UUID canonico. */
export function esUuid(valor: string): boolean {
  return UUID_REGEX.test(valor);
}

/** Valida los campos de un cursor (id UUID + timestamp ISO) antes de interpolarlos en PostgREST. */
export function esCursorValido(id: string, fechaIso: string): boolean {
  return (
    esUuid(id) &&
    ISO_TIMESTAMP_REGEX.test(fechaIso) &&
    Number.isFinite(Date.parse(fechaIso))
  );
}

/** Rechaza con `Error('timeout')` si la promesa tarda mas que `ms` milisegundos. */
export async function withTimeout<T>(promesa: PromiseLike<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  try {
    return await Promise.race([Promise.resolve(promesa), limite]);
  } finally {
    clearTimeout(timer);
  }
}

/** Resuelve con el resultado de la promesa, o con `null` si vence el limite o falla. */
export function conLimite<T>(promesa: PromiseLike<T>, ms: number): Promise<T | null> {
  return withTimeout(promesa, ms).catch(() => null);
}
