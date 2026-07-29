-- Preferencias del usuario que afectan la interpretacion de sus datos:
-- medidor de esfuerzo (RIR o RPE) y unidad de peso (kg o lb).
-- Se guardan en profiles para que sincronicen entre dispositivos.
alter table public.profiles
  add column if not exists medidor_esfuerzo text not null default 'rir'
    check (medidor_esfuerzo in ('rir', 'rpe')),
  add column if not exists unidad_peso text not null default 'kg'
    check (unidad_peso in ('kg', 'lb'));

comment on column public.profiles.medidor_esfuerzo is 'Medidor de esfuerzo preferido: rir o rpe.';
comment on column public.profiles.unidad_peso is 'Unidad de peso preferida: kg o lb.';;
