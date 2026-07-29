-- Esquema de rutinas para Frencia.
-- Catalogo universal de ejercicios + rutinas del usuario compuestas por dias,
-- y cada dia por ejercicios con repeticiones e intensidad (RIR o RPE).

-- 1) Catalogo universal de ejercicios (administrado, lectura publica).
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text,
  created_at timestamptz not null default now()
);
comment on table public.exercises is 'Catalogo universal de ejercicios. Lectura para todos, escritura administrada.';

-- 2) Rutina: tabla principal, solo id y nombre (+ dueno para multiusuario).
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
comment on table public.routines is 'Rutina de entrenamiento del usuario. Se compone de dias.';

-- 3) Dia de la rutina: dia de la semana (0=domingo ... 6=sabado).
create table if not exists public.routine_days (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  weekday smallint not null check (weekday >= 0 and weekday <= 6),
  position smallint not null default 0,
  created_at timestamptz not null default now()
);
comment on table public.routine_days is 'Dia de una rutina, atado a un dia de la semana.';

-- 4) Ejercicio dentro de un dia: ejercicio + reps + intensidad (RIR o RPE).
create table if not exists public.routine_day_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_day_id uuid not null references public.routine_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  position smallint not null default 0,
  sets smallint check (sets is null or sets > 0),
  reps smallint not null check (reps > 0),
  intensity_kind text not null check (intensity_kind in ('rir', 'rpe')),
  intensity_value numeric not null check (intensity_value >= 0),
  created_at timestamptz not null default now()
);
comment on table public.routine_day_exercises is 'Ejercicio asignado a un dia: reps e intensidad (RIR o RPE).';

-- Indices para los caminos de consulta tipicos.
create index if not exists idx_routines_user on public.routines(user_id);
create index if not exists idx_routine_days_routine on public.routine_days(routine_id);
create index if not exists idx_rde_day on public.routine_day_exercises(routine_day_id);
create index if not exists idx_rde_exercise on public.routine_day_exercises(exercise_id);

-- RLS
alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.routine_days enable row level security;
alter table public.routine_day_exercises enable row level security;

-- Ejercicios: cualquiera autenticado puede leer el catalogo. Sin escritura de usuarios.
create policy "exercises_select_all" on public.exercises
  for select to authenticated using (true);

-- Rutinas: el dueno gestiona las suyas.
create policy "routines_select_own" on public.routines
  for select to authenticated using (user_id = (select auth.uid()));
create policy "routines_insert_own" on public.routines
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "routines_update_own" on public.routines
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "routines_delete_own" on public.routines
  for delete to authenticated using (user_id = (select auth.uid()));

-- Dias: acceso si el usuario es dueno de la rutina padre.
create policy "routine_days_select_own" on public.routine_days
  for select to authenticated using (
    exists (select 1 from public.routines r where r.id = routine_id and r.user_id = (select auth.uid()))
  );
create policy "routine_days_insert_own" on public.routine_days
  for insert to authenticated with check (
    exists (select 1 from public.routines r where r.id = routine_id and r.user_id = (select auth.uid()))
  );
create policy "routine_days_update_own" on public.routine_days
  for update to authenticated using (
    exists (select 1 from public.routines r where r.id = routine_id and r.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.routines r where r.id = routine_id and r.user_id = (select auth.uid()))
  );
create policy "routine_days_delete_own" on public.routine_days
  for delete to authenticated using (
    exists (select 1 from public.routines r where r.id = routine_id and r.user_id = (select auth.uid()))
  );

-- Ejercicios del dia: acceso si el usuario es dueno de la rutina (via dia -> rutina).
create policy "rde_select_own" on public.routine_day_exercises
  for select to authenticated using (
    exists (
      select 1 from public.routine_days d
      join public.routines r on r.id = d.routine_id
      where d.id = routine_day_id and r.user_id = (select auth.uid())
    )
  );
create policy "rde_insert_own" on public.routine_day_exercises
  for insert to authenticated with check (
    exists (
      select 1 from public.routine_days d
      join public.routines r on r.id = d.routine_id
      where d.id = routine_day_id and r.user_id = (select auth.uid())
    )
  );
create policy "rde_update_own" on public.routine_day_exercises
  for update to authenticated using (
    exists (
      select 1 from public.routine_days d
      join public.routines r on r.id = d.routine_id
      where d.id = routine_day_id and r.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.routine_days d
      join public.routines r on r.id = d.routine_id
      where d.id = routine_day_id and r.user_id = (select auth.uid())
    )
  );
create policy "rde_delete_own" on public.routine_day_exercises
  for delete to authenticated using (
    exists (
      select 1 from public.routine_days d
      join public.routines r on r.id = d.routine_id
      where d.id = routine_day_id and r.user_id = (select auth.uid())
    )
  );;
