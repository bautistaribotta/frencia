-- Purga de cuentas que nunca aceptaron los textos legales.
-- Sin aceptar no se puede usar la app (el gate manda a /legal-consent), asi
-- que una cuenta que no acepto a los 30 de creada solo guarda los datos del
-- alta: se borra para no conservarlos sin consentimiento expreso.
--
-- Solo cuenta a partir del 26/09/2026, cuando se sumo la aceptacion explicita:
-- las cuentas anteriores nunca tuvieron la pantalla y no tienen filas en
-- aceptaciones_legales, pero ya usaban la app. Tampoco toca a quien acepto
-- alguna version y no la vigente: esa cuenta tiene que volver a aceptar, no
-- desaparecer.

create or replace function public.purgar_cuentas_sin_aceptacion()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  borradas integer;
begin
  -- Sin avatar que limpiar en Storage: subir la foto requiere entrar a la
  -- app, y sin aceptar no se entra. Todo lo de public cascadea desde aca.
  delete from auth.users u
   using public.profiles p
   where p.id = u.id
     and p.created_at >= timestamptz '2026-09-26 00:00:00-03'
     and p.created_at < now() - interval '30 days'
     and not exists (
       select 1 from public.aceptaciones_legales a where a.user_id = p.id
     );
  get diagnostics borradas = row_count;
  return borradas;
end;
$$;

revoke execute on function public.purgar_cuentas_sin_aceptacion() from public, anon, authenticated;

-- Job diario a las 03:30 UTC, despues de la purga de cuentas eliminadas.
select cron.schedule(
  'purgar-cuentas-sin-aceptacion',
  '30 3 * * *',
  $$select public.purgar_cuentas_sin_aceptacion()$$
);
