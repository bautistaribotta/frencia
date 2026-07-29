-- Un ejercicio puede tener varios grupos musculares. Se reemplaza la columna
-- de texto unico por un catalogo fijo de musculos y una tabla M:N.

-- 1. Catalogo fijo de musculos.
create table public.muscle_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  position smallint not null default 0
);
comment on table public.muscle_groups is 'Catalogo fijo de grupos musculares. Lectura para todos, escritura administrada.';

insert into public.muscle_groups (slug, name, position) values
  ('pecho', 'Pecho', 1),
  ('espalda', 'Espalda', 2),
  ('hombros', 'Hombros', 3),
  ('biceps', 'Bíceps', 4),
  ('triceps', 'Tríceps', 5),
  ('antebrazo', 'Antebrazo', 6),
  ('cuadriceps', 'Cuádriceps', 7),
  ('gluteos', 'Glúteos', 8),
  ('femoral', 'Femoral', 9),
  ('gemelos', 'Gemelos', 10),
  ('abdomen', 'Abdomen', 11);

-- 2. Relacion M:N ejercicio <-> musculo.
create table public.exercise_muscles (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  muscle_group_id uuid not null references public.muscle_groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (exercise_id, muscle_group_id)
);
comment on table public.exercise_muscles is 'Grupos musculares asociados a un ejercicio (M:N).';
create index exercise_muscles_exercise_id_idx on public.exercise_muscles(exercise_id);
create index exercise_muscles_muscle_group_id_idx on public.exercise_muscles(muscle_group_id);

-- 3. Migrar el dato actual (muscle_group de texto) al join. Los valores viejos
-- 'piernas' y 'core' no tienen equivalente exacto: se mapean a cuadriceps y
-- abdomen respectivamente.
insert into public.exercise_muscles (exercise_id, muscle_group_id)
select e.id, mg.id
from public.exercises e
join public.muscle_groups mg on mg.slug = case e.muscle_group
  when 'pecho' then 'pecho'
  when 'espalda' then 'espalda'
  when 'hombros' then 'hombros'
  when 'biceps' then 'biceps'
  when 'triceps' then 'triceps'
  when 'gluteos' then 'gluteos'
  when 'piernas' then 'cuadriceps'
  when 'core' then 'abdomen'
end
where e.muscle_group is not null;

-- 4. Eliminar la columna de texto unico.
alter table public.exercises drop column muscle_group;

-- 5. RLS: catalogo y relacion legibles por usuarios autenticados (igual que
-- exercises). La escritura queda para el service role (bypassa RLS).
alter table public.muscle_groups enable row level security;
alter table public.exercise_muscles enable row level security;

create policy muscle_groups_select_all on public.muscle_groups
  for select to authenticated using (true);
create policy exercise_muscles_select_all on public.exercise_muscles
  for select to authenticated using (true);;
