-- La busqueda de ejercicios paso a ser client-side (filtro en memoria), asi
-- que el indice trigram quedo sin uso.
drop index if exists public.exercises_name_trgm_idx;;
