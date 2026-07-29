-- Reemplaza la columna edad por fecha_nacimiento.
-- La edad pasa a calcularse en el front a partir de la fecha.
-- Las filas existentes quedan en null (no se puede reconstruir la fecha desde una edad).

ALTER TABLE public.profiles
  ADD COLUMN fecha_nacimiento date;

COMMENT ON COLUMN public.profiles.fecha_nacimiento IS
  'Fecha de nacimiento del usuario. Reemplaza a edad: la edad se calcula en el front cuando se necesita (mostrarla, calculos de nutricion, etc).';

-- CHECK de cordura con limites fijos (inmutables). El tope "no futuro" se valida
-- en la app con el rango del selector de fecha.
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_fecha_nacimiento_check
  CHECK (fecha_nacimiento >= DATE '1900-01-01' AND fecha_nacimiento <= DATE '2099-12-31');

ALTER TABLE public.profiles
  DROP COLUMN edad;;
