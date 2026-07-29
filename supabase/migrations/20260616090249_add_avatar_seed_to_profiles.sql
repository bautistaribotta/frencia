-- Semilla del avatar generado. Cuando el usuario genera un avatar nuevo,
-- se guarda esta semilla (y se limpia avatar_url). El avatar se renderiza
-- de forma determinista a partir de la semilla.
alter table public.profiles
  add column if not exists avatar_seed text;

comment on column public.profiles.avatar_seed is 'Semilla del avatar generado (boring-avatars). Si hay avatar_url, la foto tiene prioridad.';;
