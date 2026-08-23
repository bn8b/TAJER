create or replace function public.random_user_code() returns char(16) language plpgsql as $$
declare c char(16);
begin loop c:=lpad((floor(random()*10000000000000000))::bigint::text,16,'0'); exit when not exists(select 1 from public.profiles where user_code=c); end loop; return c; end $$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,phone,user_code) values(new.id,new.phone,public.random_user_code()) on conflict(id) do nothing;
insert into public.user_settings(id) values(new.id) on conflict(id) do nothing; return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
