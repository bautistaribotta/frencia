-- La migracion anterior no tuvo efecto: "Abductores en maquina" ya tenia una
-- fila con gluteos, pero marcada como secundaria, asi que el insert se salteo.
-- Lo que corresponde es promover esa fila a primaria.

update public.exercise_muscles em
set is_primary = true
from public.exercises e, public.muscle_groups g
where em.exercise_id = e.id
  and em.muscle_group_id = g.id
  and e.slug = 'abductores-en-maquina'
  and g.slug = 'gluteos';
