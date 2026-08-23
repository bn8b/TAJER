insert into storage.buckets(id,name,public) values('payment-screenshots','payment-screenshots',false) on conflict(id) do nothing;
create policy "payment upload own folder" on storage.objects for insert to authenticated with check(bucket_id='payment-screenshots' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "payment read own or admin" on storage.objects for select to authenticated using(bucket_id='payment-screenshots' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
