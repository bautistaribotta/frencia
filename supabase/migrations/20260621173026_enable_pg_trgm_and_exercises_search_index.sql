-- Busqueda por nombre de ejercicio tolerante a typos y por substring.
-- pg_trgm + indice GIN trigram: el catalogo escala a miles de filas sin
-- escanear toda la tabla en cada tecla del buscador.
create extension if not exists pg_trgm;

create index if not exists exercises_name_trgm_idx
  on public.exercises using gin (name gin_trgm_ops);;
