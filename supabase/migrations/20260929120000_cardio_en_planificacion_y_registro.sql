-- Planificacion y registro de ejercicios que no son de fuerza.
-- Ver docs/specs/catalogo-de-ejercicios.md, seccion 6.
--
-- El catalogo ya declara que registra cada ejercicio (kind y tracks_*). Aca se
-- extienden las dos tablas que lo usan:
--   training_day_exercises: lo que prescribe el plan del dia.
--   session_sets:           lo que se hizo en cada serie.
-- Las dos suman duracion y distancia, y dejan de exigir los datos de fuerza.
--
-- Que datos lleva cada fila depende del ejercicio, que vive en otra tabla, asi
-- que no alcanza un check: lo validan dos triggers. Van en triggers y no solo en
-- guardar_dia_entrenamiento porque el wizard de creacion inserta los ejercicios
-- directo y la sesion escribe las series con upsert: cualquier camino de
-- escritura pasa por la misma regla.

-- Plan del dia ---------------------------------------------------------------

alter table public.training_day_exercises
  add column duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  add column distance_m integer check (distance_m is null or distance_m > 0),
  alter column intensity_kind drop not null,
  alter column intensity_value drop not null,
  add constraint training_day_exercises_intensidad_completa check (
    (intensity_kind is null) = (intensity_value is null)
  );

comment on column public.training_day_exercises.duration_seconds is
  'Tiempo objetivo por serie, en segundos. Solo en ejercicios que registran duracion.';
comment on column public.training_day_exercises.distance_m is
  'Distancia objetivo por serie, en metros. Solo en ejercicios que registran distancia.';
comment on column public.training_day_exercises.intensity_kind is
  'rir o rpe. null = sin intensidad, que solo admite el cardio.';

-- Series realizadas ----------------------------------------------------------

alter table public.session_sets
  add column duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  add column distance_m integer check (distance_m is null or distance_m > 0),
  alter column weight_kg drop not null,
  alter column reps drop not null,
  alter column intensity_kind drop not null,
  alter column intensity_value drop not null,
  add constraint session_sets_intensidad_completa check (
    (intensity_kind is null) = (intensity_value is null)
  );

comment on column public.session_sets.duration_seconds is
  'Tiempo de la serie, en segundos.';
comment on column public.session_sets.distance_m is
  'Distancia de la serie, en metros. La unidad del usuario se aplica al mostrarla.';

-- Validacion contra el catalogo ----------------------------------------------

-- Plan: lo que el ejercicio no registra va en null; lo que prescribe el plan
-- depende del tipo. El peso nunca se planifica, asi que no hay columna.
create or replace function public.validar_plan_de_ejercicio()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v public.exercises%rowtype;
begin
  select * into v from public.exercises where id = new.exercise_id;
  if not found then
    raise exception 'El ejercicio % no existe', new.exercise_id
      using errcode = 'foreign_key_violation';
  end if;

  if (new.reps is not null and not v.tracks_reps)
     or (new.duration_seconds is not null and not v.tracks_duration)
     or (new.distance_m is not null and not v.tracks_distance) then
    raise exception '% no registra alguno de los datos del plan', v.name
      using errcode = 'check_violation';
  end if;

  if v.kind = 'cardio' then
    -- Una sola serie continua, sin descanso: ver seccion 6.5 de la spec.
    if coalesce(new.sets, 1) <> 1 or new.rest_seconds is not null then
      raise exception 'El cardio se planifica como una sola serie sin descanso'
        using errcode = 'check_violation';
    end if;
    if new.duration_seconds is null and new.distance_m is null then
      raise exception 'El cardio necesita tiempo o distancia'
        using errcode = 'check_violation';
    end if;
    if new.intensity_kind is not null and new.intensity_kind <> 'rpe' then
      raise exception 'El cardio solo admite RPE'
        using errcode = 'check_violation';
    end if;
  elsif new.intensity_kind is null then
    raise exception '% necesita intensidad', v.name
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

comment on function public.validar_plan_de_ejercicio is
  'Valida una fila de training_day_exercises contra los datos que registra su ejercicio.';

create trigger training_day_exercises_validar
  before insert or update on public.training_day_exercises
  for each row execute function public.validar_plan_de_ejercicio();

-- Serie: se cargan todos los datos que el ejercicio registra y ninguno mas. La
-- intensidad es obligatoria salvo en cardio, donde es un RPE opcional.
create or replace function public.validar_serie_de_ejercicio()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v public.exercises%rowtype;
begin
  select * into v from public.exercises where id = new.exercise_id;
  if not found then
    raise exception 'El ejercicio % no existe', new.exercise_id
      using errcode = 'foreign_key_violation';
  end if;

  if (new.weight_kg is null) = v.tracks_weight
     or (new.reps is null) = v.tracks_reps
     or (new.duration_seconds is null) = v.tracks_duration
     or (new.distance_m is null) = v.tracks_distance then
    raise exception 'La serie no coincide con los datos que registra %', v.name
      using errcode = 'check_violation';
  end if;

  if v.kind = 'cardio' then
    if new.intensity_kind is not null and new.intensity_kind <> 'rpe' then
      raise exception 'El cardio solo admite RPE'
        using errcode = 'check_violation';
    end if;
  elsif new.intensity_kind is null then
    raise exception '% necesita intensidad', v.name
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

comment on function public.validar_serie_de_ejercicio is
  'Valida una fila de session_sets contra los datos que registra su ejercicio.';

create trigger session_sets_validar
  before insert or update on public.session_sets
  for each row execute function public.validar_serie_de_ejercicio();

-- Las funciones de trigger no se llaman sueltas. Los privilegios por defecto de
-- Supabase le dan execute a anon y authenticated sobre toda funcion nueva en
-- public; el trigger corre igual sin ese permiso.
revoke all on function public.validar_plan_de_ejercicio() from public, anon, authenticated;
revoke all on function public.validar_serie_de_ejercicio() from public, anon, authenticated;

-- Guardado del dia -----------------------------------------------------------

-- Misma funcion que 20260730160000_guardar_dia_entrenamiento, con duracion y
-- distancia. La validacion por ejercicio la hace el trigger de la tabla.
-- create or replace conserva los permisos que ya tenia.
create or replace function public.guardar_dia_entrenamiento(
  p_day_id uuid,
  p_name text,
  p_weekdays smallint[],
  p_exercises jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.training_days
    set name = p_name
    where id = p_day_id;

  -- Sin fila actualizada el dia no existe o es de otro usuario (RLS lo filtro).
  -- Cortamos antes de borrar nada.
  if not found then
    raise exception 'El dia de entrenamiento no existe o no es tuyo'
      using errcode = 'no_data_found';
  end if;

  delete from public.training_day_weekdays where training_day_id = p_day_id;

  insert into public.training_day_weekdays (training_day_id, weekday)
  select p_day_id, w
  from unnest(coalesce(p_weekdays, '{}'::smallint[])) as w;

  delete from public.training_day_exercises where training_day_id = p_day_id;

  insert into public.training_day_exercises (
    training_day_id, exercise_id, position, sets, reps,
    duration_seconds, distance_m,
    intensity_kind, intensity_value, rest_seconds
  )
  select
    p_day_id,
    (e->>'exercise_id')::uuid,
    (e->>'position')::smallint,
    (e->>'sets')::smallint,
    (e->>'reps')::smallint,
    (e->>'duration_seconds')::integer,
    (e->>'distance_m')::integer,
    e->>'intensity_kind',
    (e->>'intensity_value')::numeric,
    (e->>'rest_seconds')::smallint
  from jsonb_array_elements(coalesce(p_exercises, '[]'::jsonb)) as e;
end;
$$;
