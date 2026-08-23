alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets(id,name,public) values('avatars','avatars',true) on conflict(id) do nothing;

create policy "avatar upload own folder" on storage.objects for insert to authenticated with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatar update own folder" on storage.objects for update to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatar public read" on storage.objects for select to public using(bucket_id='avatars');

-- Self-service profile update, limited to safe columns only (name/phone/avatar/language).
-- Uses a security-definer function instead of a broad RLS UPDATE policy so users
-- can never touch role/status/user_code directly.
create or replace function public.update_my_profile(p_full_name text default null, p_phone text default null, p_avatar_url text default null)
returns void language plpgsql security definer set search_path=public as $$
begin
 update public.profiles
 set full_name=coalesce(p_full_name,full_name),
     phone=coalesce(p_phone,phone),
     avatar_url=coalesce(p_avatar_url,avatar_url),
     updated_at=now()
 where id=auth.uid();
end;
$$;
grant execute on function public.update_my_profile(text,text,text) to authenticated;

