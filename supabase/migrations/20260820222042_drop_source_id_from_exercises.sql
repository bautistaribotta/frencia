-- Se aplico en la base remota sin pasar por el repo; se incorpora aca para que
-- el historial de migraciones local coincida con el remoto.
-- source_id era el identificador del catalogo externo del que se importaron
-- los ejercicios. El catalogo ya es propio y nada lo lee.

alter table public.exercises
  drop column if exists source_id;
