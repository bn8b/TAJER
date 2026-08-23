import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
Deno.serve(async()=>{const c=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!);return new Response(JSON.stringify({ok:true}),{headers:{'content-type':'application/json'}})});
