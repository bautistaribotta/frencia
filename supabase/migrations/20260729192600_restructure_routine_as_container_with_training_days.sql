-- Reestructuracion de la jerarquia de entrenamiento.
-- Antes: `routines` era el dia de entrenamiento, colgado directo del usuario.
-- Ahora: `routines` es el contenedor (la rutina) y `training_days` es el dia.
--   routines > training_days > training_day_exercises
--                            > training_day_weekdays

drop table if exists public.routine_exercises cascade;
drop table if exists public.routine_weekdays cascade;
drop table if exists public.routines cascade;

-- Rutina: conjunto de dias de entrenamiento.
create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.routines is
  'Rutina: conjunto de dias de entrenamiento. Solo una activa por usuario.';
comment on column public.routines.archived_at is
  'null = rutina activa. Activar una rutina nueva archiva la anterior.';

-- Fuerza a nivel base que no haya dos rutinas activas del mismo usuario.
create unique index routines_una_activa_por_usuario
  on public.routines (user_id)
  where archived_at is null;

create index routines_user_id_idx on public.routines (user_id);

-- Dia de entrenamiento dentro de una rutina.
create table public.training_days (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.training_days is
  'Dia de entrenamiento de una rutina. Nombre libre, arranca como "Dia 1".';
comment on column public.training_days.user_id is
  'Desnormalizado desde routines para que las politicas RLS no necesiten join.';
comment on column public.training_days.position is
  'Orden manual del dia dentro de la rutina.';

create index training_days_routine_idx on public.training_days (routine_id, position);
create index training_days_user_id_idx on public.training_days (user_id);

-- Dias de la semana en que se entrena ese dia de la rutina.
create table public.training_day_weekdays (
  id uuid primary key default gen_random_uuid(),
  training_day_id uuid not null references public.training_days (id) on delete cascade,
  weekday smallint not null check (weekday >= 0 and weekday <= 6),
  created_at timestamptz not null default now(),
  unique (training_day_id, weekday)
);

comment on table public.training_day_weekdays is
  'Dias de la semana asignados a un dia de entrenamiento. 0 = lunes, 6 = domingo.';

create index training_day_weekdays_day_idx on public.training_day_weekdays (training_day_id);

-- Ejercicio de un dia de entrenamiento.
create table public.training_day_exercises (
  id uuid primary key default gen_random_uuid(),
  training_day_id uuid not null references public.training_days (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id),
  position smallint not null default 0,
  sets smallint check (sets is null or sets > 0),
  reps smallint check (reps is null or reps > 0),
  intensity_kind text not null check (intensity_kind in ('rir', 'rpe')),
  intensity_value numeric not null check (intensity_value >= -1),
  rest_seconds smallint check (rest_seconds is null or rest_seconds > 0),
  created_at timestamptz not null default now()
);

comment on table public.training_day_exercises is
  'Ejercicio de un dia de entrenamiento: series, reps, intensidad y descanso.';
comment on column public.training_day_exercises.intensity_value is
  'RIR admite -1 como centinela de "al fallo". RPE va de 1 a 10.';
comment on column public.training_day_exercises.rest_seconds is
  'Descanso fijo entre series, en segundos. null = sin temporizador.';

create index training_day_exercises_day_idx
  on public.training_day_exercises (training_day_id, position);

-- Row level security -------------------------------------------------------

alter table public.routines enable row level security;
alter table public.training_days enable row level security;
alter table public.training_day_weekdays enable row level security;
alter table public.training_day_exercises enable row level security;

create policy "routines_select_propias" on public.routines
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "routines_insert_propias" on public.routines
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "routines_update_propias" on public.routines
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "routines_delete_propias" on public.routines
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "training_days_select_propios" on public.training_days
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "training_days_insert_propios" on public.training_days
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "training_days_update_propios" on public.training_days
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "training_days_delete_propios" on public.training_days
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Las dos tablas hoja validan por el dueño del dia al que pertenecen.
create policy "training_day_weekdays_select_propios" on public.training_day_weekdays
  for select to authenticated using (
    exists (
      select 1 from public.training_days d
      where d.id = training_day_id and d.user_id = (select auth.uid())
    )
  );
create policy "training_day_weekdays_insert_propios" on public.training_day_weekdays
  for insert to authenticated with check (
    exists (
      select 1 from public.training_days d
      where d.id = training_day_id and d.user_id = (select auth.uid())
    )
  );
create policy "training_day_weekdays_delete_propios" on public.training_day_weekdays
  for delete to authenticated using (
    exists (
      select 1 from public.training_days d
      where d.id = training_day_id and d.user_id = (select auth.uid())
    )
  );

create policy "training_day_exercises_select_propios" on public.training_day_exercises
  for select to authenticated using (
    exists (
      select 1 from public.training_days d
      where d.id = training_day_id and d.user_id = (select auth.uid())
    )
  );
create policy "training_day_exercises_insert_propios" on public.training_day_exercises
  for insert to authenticated with check (
    exists (
      select 1 from public.training_days d
      where d.id = training_day_id and d.user_id = (select auth.uid())
    )
  );
create policy "training_day_exercises_update_propios" on public.training_day_exercises
  for update to authenticated using (
    exists (
      select 1 from public.training_days d
      where d.id = training_day_id and d.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.training_days d
      where d.id = training_day_id and d.user_id = (select auth.uid())
    )
  );
create policy "training_day_exercises_delete_propios" on public.training_day_exercises
  for delete to authenticated using (
    exists (
      select 1 from public.training_days d
      where d.id = training_day_id and d.user_id = (select auth.uid())
    )
  );;
