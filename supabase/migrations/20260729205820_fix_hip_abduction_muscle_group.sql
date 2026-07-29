-- "Abductores en maquina" quedo sin musculo primario: en el dataset su target
-- es "abductors", que no tiene equivalente entre los 11 grupos de la app.
-- La abduccion de cadera trabaja sobre todo el gluteo medio, asi que se le
-- asigna gluteos.

insert into public.exercise_muscles (exercise_id, muscle_group_id, is_primary)
select e.id, g.id, true
from public.exercises e
join public.muscle_groups g on g.slug = 'gluteos'
where e.slug = 'abductores-en-maquina'
  and not exists (
    select 1 from public.exercise_muscles em
    where em.exercise_id = e.id and em.muscle_group_id = g.id
  );
