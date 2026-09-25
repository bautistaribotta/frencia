-- Se borro en la base remota sin pasar por el repo; se incorpora aca para que
-- el esquema local coincida con el remoto.
-- gif_url estaba reservada para los GIFs de Gym visual, que necesitan licencia
-- propia y nunca se cargaron. Nada la lee.

alter table public.exercises
  drop column if exists gif_url;
