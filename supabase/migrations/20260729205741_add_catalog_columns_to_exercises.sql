-- Columnas del catalogo de ejercicios.
-- Los GIFs y miniaturas del dataset son de Gym visual y necesitan licencia
-- propia, asi que image_url y gif_url se crean pero quedan vacios.
-- Ver docs/specs/catalogo-de-ejercicios.md

alter table public.exercises
  add column if not exists slug text,
  add column if not exists name_en text,
  add column if not exists source_id text,
  add column if not exists equipment text,
  add column if not exists instructions text,
  add column if not exists image_url text,
  add column if not exists gif_url text;

comment on column public.exercises.slug is
  'Identificador estable derivado del nombre, para reimportar sin duplicar.';
comment on column public.exercises.name_en is
  'Nombre original en ingles. La busqueda mira este campo ademas de name.';
comment on column public.exercises.gif_url is
  'Vacio: los medios son de Gym visual y necesitan licencia propia.';

-- Distingue el musculo objetivo de los que solo asisten.
alter table public.exercise_muscles
  add column if not exists is_primary boolean not null default false;

comment on column public.exercise_muscles.is_primary is
  'true para el musculo objetivo del ejercicio, false para los asistentes.';;
