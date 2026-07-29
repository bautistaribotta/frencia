-- Corrige el mapeo lossy de 'piernas' (que se habia volcado todo a cuadriceps)
-- a su musculo real, y agrega gluteos a los compuestos de pierna ahora que un
-- ejercicio admite varios grupos musculares.

-- Curl femoral y Peso muerto rumano: cuadriceps -> femoral.
update public.exercise_muscles em
set muscle_group_id = (select id from public.muscle_groups where slug = 'femoral')
where em.muscle_group_id = (select id from public.muscle_groups where slug = 'cuadriceps')
  and em.exercise_id in (
    select id from public.exercises where name in ('Curl femoral', 'Peso muerto rumano')
  );

-- Elevacion de gemelos: cuadriceps -> gemelos.
update public.exercise_muscles em
set muscle_group_id = (select id from public.muscle_groups where slug = 'gemelos')
where em.muscle_group_id = (select id from public.muscle_groups where slug = 'cuadriceps')
  and em.exercise_id in (
    select id from public.exercises where name = 'Elevacion de gemelos'
  );

-- Gluteos como musculo secundario de los compuestos de pierna.
insert into public.exercise_muscles (exercise_id, muscle_group_id)
select e.id, (select id from public.muscle_groups where slug = 'gluteos')
from public.exercises e
where e.name in ('Peso muerto rumano', 'Prensa de piernas', 'Sentadilla con barra', 'Zancadas')
on conflict (exercise_id, muscle_group_id) do nothing;;
