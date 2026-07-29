-- Preferencia de unidad de altura del usuario (cm metrico / ft imperial).
-- El valor del dato se guarda siempre en metrico; esto es solo como se muestra.
alter table public.profiles
  add column unidad_altura text not null default 'cm'
  check (unidad_altura in ('cm', 'ft'));

comment on column public.profiles.unidad_altura is 'Unidad de altura preferida: cm o ft.';;
