-- Reestructura: la rutina pasa a ser un "dia" (lista de ejercicios con nombre
-- libre). Se elimina el nivel intermedio routine_days. El doble turno se
-- resuelve creando rutinas separadas ("Martes manana" / "Martes tarde"). Una
-- rutina puede asignarse a varios dias de la semana via routine_weekdays y se
-- ordena manualmente en home con `position`.

-- 1. Sacar policies viejas que dependen de routine_days.
drop policy if exists rde_select_own on public.routine_day_exercises;
drop policy if exists rde_insert_own on public.routine_day_exercises;
drop policy if exists rde_update_own on public.routine_day_exercises;
drop policy if exists rde_delete_own on public.routine_day_exercises;

drop policy if exists routine_days_select_own on public.routine_days;
drop policy if exists routine_days_insert_own on public.routine_days;
drop policy if exists routine_days_update_own on public.routine_days;
drop policy if exists routine_days_delete_own on public.routine_days;

-- 2. routine_day_exercises -> routine_exercises, apuntando directo a routines.
alter table public.routine_day_exercises
  drop constraint routine_day_exercises_routine_day_id_fkey;
alter table public.routine_day_exercises
  rename column routine_day_id to routine_id;
alter table public.routine_day_exercises
  rename to routine_exercises;
alter index routine_day_exercises_pkey rename to routine_exercises_pkey;
alter table public.routine_exercises
  add constraint routine_exercises_routine_id_fkey
  foreign key (routine_id) references public.routines(id) on delete cascade;
comment on table public.routine_exercises is 'Ejercicio de una rutina: reps e intensidad (RIR o RPE).';

-- 3. Eliminar el nivel intermedio.
drop table public.routine_days;

-- 4. Orden manual de rutinas en home.
alter table public.routines add column position smallint not null default 0;
comment on column public.routines.position is 'Orden vertical manual en la vista principal.';

-- 5. Dias de la semana de una rutina (M:N libre).
create table public.routine_weekdays (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  weekday smallint not null check (weekday >= 0 and weekday <= 6),
  created_at timestamptz not null default now(),
  unique (routine_id, weekday)
);
comment on table public.routine_weekdays is 'Dias de la semana en que se entrena una rutina. Una rutina puede repetirse en varios dias.';
create index routine_weekdays_routine_id_idx on public.routine_weekdays(routine_id);

-- 6. RLS.
alter table public.routine_weekdays enable row level security;

create policy re_select_own on public.routine_exercises for select
  using (exists (select 1 from public.routines r where r.id = routine_exercises.routine_id and r.user_id = (select auth.uid())));
create policy re_insert_own on public.routine_exercises for insert
  with check (exists (select 1 from public.routines r where r.id = routine_exercises.routine_id and r.user_id = (select auth.uid())));
create policy re_update_own on public.routine_exercises for update
  using (exists (select 1 from public.routines r where r.id = routine_exercises.routine_id and r.user_id = (select auth.uid())))
  with check (exists (select 1 from public.routines r where r.id = routine_exercises.routine_id and r.user_id = (select auth.uid())));
create policy re_delete_own on public.routine_exercises for delete
  using (exists (select 1 from public.routines r where r.id = routine_exercises.routine_id and r.user_id = (select auth.uid())));

create policy rw_select_own on public.routine_weekdays for select
  using (exists (select 1 from public.routines r where r.id = routine_weekdays.routine_id and r.user_id = (select auth.uid())));
create policy rw_insert_own on public.routine_weekdays for insert
  with check (exists (select 1 from public.routines r where r.id = routine_weekdays.routine_id and r.user_id = (select auth.uid())));
create policy rw_update_own on public.routine_weekdays for update
  using (exists (select 1 from public.routines r where r.id = routine_weekdays.routine_id and r.user_id = (select auth.uid())))
  with check (exists (select 1 from public.routines r where r.id = routine_weekdays.routine_id and r.user_id = (select auth.uid())));
create policy rw_delete_own on public.routine_weekdays for delete
  using (exists (select 1 from public.routines r where r.id = routine_weekdays.routine_id and r.user_id = (select auth.uid())));;
