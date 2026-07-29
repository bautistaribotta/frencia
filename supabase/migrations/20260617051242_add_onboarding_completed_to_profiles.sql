alter table public.profiles
  add column onboarding_completed boolean not null default false;

comment on column public.profiles.onboarding_completed is
  'Marca si el usuario ya paso por el setup inicial. Evita repetir el wizard en cada login.';

-- Los usuarios existentes ya ingresaron antes: no deben volver a ver el setup.
update public.profiles set onboarding_completed = true;;
