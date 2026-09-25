-- Tipos de ejercicio y datos que registra cada uno.
-- kind es la categoria (filtros y agrupacion en la interfaz); los tracks_* son
-- la fuente de verdad de que campos se piden al planificar y al registrar una
-- serie. En fuerza, isometrico y cardio los tracks_* quedan fijados por el tipo;
-- en hibrido (paseo de granjero, colgado con lastre) los declara cada ejercicio.
-- Todo el catalogo actual es de fuerza, que es lo que dan los defaults.
-- Ver docs/specs/catalogo-de-ejercicios.md, seccion 6.

alter table public.exercises
  add column kind text not null default 'fuerza',
  add column tracks_weight boolean not null default true,
  add column tracks_reps boolean not null default true,
  add column tracks_duration boolean not null default false,
  add column tracks_distance boolean not null default false;

alter table public.exercises
  add constraint exercises_kind_check
    check (kind in ('fuerza', 'isometrico', 'cardio', 'hibrido')),
  add constraint exercises_tracks_by_kind_check check (
    case kind
      -- Peso y repeticiones, nada mas.
      when 'fuerza' then
        tracks_weight and tracks_reps and not tracks_duration and not tracks_distance
      -- Tiempo por serie; el peso depende del ejercicio (plancha contra
      -- isometrico de sentadilla con barra).
      when 'isometrico' then
        tracks_duration and not tracks_reps and not tracks_distance
      -- Tiempo; la distancia depende del ejercicio (cinta contra soga).
      when 'cardio' then
        tracks_duration and not tracks_weight and not tracks_reps
      -- Combinacion libre, pero de al menos dos datos: con uno solo seria
      -- alguno de los otros tipos.
      when 'hibrido' then
        (tracks_weight::int + tracks_reps::int
          + tracks_duration::int + tracks_distance::int) >= 2
      else false
    end
  );

comment on column public.exercises.kind is
  'Categoria del ejercicio: fuerza, isometrico, cardio o hibrido.';
comment on column public.exercises.tracks_weight is
  'La serie registra peso (weight_kg).';
comment on column public.exercises.tracks_reps is
  'La serie registra repeticiones.';
comment on column public.exercises.tracks_duration is
  'La serie registra duracion en segundos.';
comment on column public.exercises.tracks_distance is
  'La serie registra distancia en metros.';
