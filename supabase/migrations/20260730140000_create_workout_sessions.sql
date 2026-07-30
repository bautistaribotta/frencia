-- Registro de sesiones de entrenamiento. Ver docs/specs/registro-de-sesion.md
--
-- Dos tablas, sin nivel intermedio de "ejercicio de la sesion": el orden y la
-- agrupacion por ejercicio se derivan de session_sets.

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Nullable con set null a proposito: el historial de lo que el usuario
  -- levanto tiene que sobrevivir al borrado del dia que lo origino.
  training_day_id uuid references public.training_days (id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.workout_sessions is
  'Una sesion de entrenamiento. finished_at null = en curso.';

-- Una sola sesion en curso por usuario, igual que la rutina activa.
create unique index workout_sessions_una_en_curso
  on public.workout_sessions (user_id)
  where finished_at is null;

-- Busqueda de las sesiones terminadas de un dia (serie fantasma e historial).
create index workout_sessions_dia_terminadas_idx
  on public.workout_sessions (training_day_id, finished_at desc)
  where finished_at is not null;

create table public.session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id),
  set_index smallint not null check (set_index > 0),
  weight_kg numeric not null check (weight_kg >= 0),
  reps smallint not null check (reps > 0),
  intensity_kind text not null check (intensity_kind in ('rir', 'rpe')),
  intensity_value numeric not null check (intensity_value >= -1),
  completed_at timestamptz not null default now()
);

comment on table public.session_sets is
  'Serie efectivamente realizada. El peso va siempre en kilos.';
comment on column public.session_sets.intensity_value is
  'RIR admite -1 como centinela de "al fallo". RPE va de 1 a 10.';

-- Unico, no solo de busqueda: dentro de una sesion, la serie 3 de un ejercicio
-- es una sola cosa. Habilita el upsert que necesita volver atras y corregir.
create unique index session_sets_unico
  on public.session_sets (session_id, exercise_id, set_index);

alter table public.workout_sessions enable row level security;
alter table public.session_sets enable row level security;

create policy "workout_sessions_select_propias" on public.workout_sessions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "workout_sessions_insert_propias" on public.workout_sessions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "workout_sessions_update_propias" on public.workout_sessions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "workout_sessions_delete_propias" on public.workout_sessions
  for delete to authenticated using (user_id = (select auth.uid()));

-- session_sets no tiene user_id: valida por join a la sesion. Son pocas filas
-- por sesion y el join va por la pk, asi que no justifica desnormalizar.
create policy "session_sets_select_propias" on public.session_sets
  for select to authenticated using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  );
create policy "session_sets_insert_propias" on public.session_sets
  for insert to authenticated with check (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  );
create policy "session_sets_update_propias" on public.session_sets
  for update to authenticated
  using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  );
create policy "session_sets_delete_propias" on public.session_sets
  for delete to authenticated using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  );
