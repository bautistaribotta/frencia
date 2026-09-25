-- Preferencia de unidad de distancia del usuario (km metrico / mi imperial),
-- para los ejercicios de cardio e hibridos que registran distancia.
-- El valor del dato se guarda siempre en metros; esto es solo como se muestra.
alter table public.profiles
  add column unidad_distancia text not null default 'km'
  check (unidad_distancia in ('km', 'mi'));

comment on column public.profiles.unidad_distancia is 'Unidad de distancia preferida: km o mi.';
