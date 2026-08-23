import {supabase} from './supabase.js';
const app=document.getElementById('app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function page(){
 app.innerHTML=`<div class="topbar"><div class="brand">TAJER</div><button id="logout" class="btn secondary">خروج</button></div>
 <main class="container"><section id="view"></section></main>
 <nav class="bottom-nav">
 <button class="nav-item" data-view="home"><svg viewBox="0 0 24 24"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg><span>الرئيسية</span></button>
 <button class="nav-item" data-view="signals"><svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/></svg><span>الإشارات</span></button>
 <button class="nav-item" data-view="assets"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg><span>الأصول</span></button>
 <button class="nav-item" data-view="subscription"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg><span>الاشتراك</span></button>
 <button class="nav-item" data-view="notifications"><svg viewBox="0 0 24 24"><path d="M6 8a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 004 0"/></svg><span>الإشعارات</span></button>
 <button class="nav-item" data-view="profile"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg><span>الحساب</span></button>
 </nav>`;
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{render(b.dataset.view);document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));b.classList.add('active');});
 document.getElementById('logout').onclick=async()=>{await supabase.auth.signOut();location.reload()};
 render('home');
}
async function render(v){
 const out=document.getElementById('view');
 const {data:{user}}=await supabase.auth.getUser();
 if(!user){return login();}
 if(v==='home') out.innerHTML=`<h2>مرحباً بك في TAJER</h2><div class="grid"><div class="card"><div class="muted">حالة الاشتراك</div><h3 id="sub">جاري التحقق...</h3></div><div class="card"><div class="muted">كود المستخدم</div><h3 id="code">...</h3></div></div><div class="card"><h3>الأصول</h3><div class="grid" id="assets"></div></div>`;
 if(v==='signals') out.innerHTML=`<h2>الإشارات</h2><div id="signals"><div class="card">جاري التحميل...</div></div>`;
 if(v==='subscription') out.innerHTML=`<h2>تفعيل الاشتراك</h2><div class="card"><h3>5 USDT / 30 يوم</h3><p class="muted">حوّل المبلغ إلى عنوان المحفظة الذي يحدده الأدمن ثم ارفع إثبات الدفع.</p><input id="network" class="input" placeholder="الشبكة (مثال: TRC20)"><br><br><input id="wallet" class="input" placeholder="عنوان المحفظة"><br><br><input id="txid" class="input" placeholder="TXID اختياري"><br><br><input id="shot" type="file" accept="image/*" class="input"><br><br><button id="pay" class="btn">إرسال طلب التفعيل</button></div>`;
 if(v==='profile') out.innerHTML=`<h2>الحساب</h2><div class="card"><p>رقم الهاتف: ${esc(user.phone||'')}</p><p>معرف الحساب: ${esc(user.id)}</p></div>`;
 if(v==='home') await loadHome();
 if(v==='signals') await loadSignals();
 if(v==='subscription') document.getElementById('pay').onclick=submitPayment;
}
function login(){
 app.innerHTML=`<div class="auth-wrap"><div class="auth-card">
 <h1 class="auth-title">TAJER</h1>
 <p class="auth-sub" id="mode-label">أدخل بياناتك لمتابعة إشارات التداول</p>
 <div class="auth-tabs"><button id="tab-signin" class="active">تسجيل الدخول</button><button id="tab-signup">إنشاء حساب</button></div>
 <div class="field hidden" id="name-field"><label class="field-label">الاسم الكامل</label><input id="fullname" class="input" placeholder="أحمد محمد"></div>
 <div class="field"><label class="field-label">البريد الإلكتروني</label><div class="input-icon"><span>@</span><input id="email" class="input" type="email" placeholder="example@email.com"></div></div>
 <div class="field hidden" id="phone-field"><label class="field-label">رقم الهاتف</label><div class="phone-row"><select id="cc"><option value="+964">🇮🇶 +964</option><option value="+966">🇸🇦 +966</option><option value="+971">🇦🇪 +971</option></select><input id="phone" class="input" placeholder="770 123 4567"></div></div>
 <div class="field"><label class="field-label">كلمة المرور</label><div class="input-icon"><span>*</span><input id="password" class="input" type="password" placeholder="8 أحرف على الأقل"></div></div>
 <button id="submit" class="btn">دخول</button>
 </div></div>`;
 let mode='signin';
 const setMode=(m)=>{mode=m;document.getElementById('tab-signin').classList.toggle('active',m==='signin');document.getElementById('tab-signup').classList.toggle('active',m==='signup');document.getElementById('name-field').classList.toggle('hidden',m!=='signup');document.getElementById('phone-field').classList.toggle('hidden',m!=='signup');document.getElementById('mode-label').textContent=m==='signin'?'أدخل بياناتك لمتابعة إشارات التداول':'خطوة واحدة تفصلك عن حسابك';document.getElementById('submit').textContent=m==='signin'?'دخول':'إنشاء حساب';};
 document.getElementById('tab-signin').onclick=()=>setMode('signin');
 document.getElementById('tab-signup').onclick=()=>setMode('signup');
 document.getElementById('submit').onclick=async()=>{
  const email=document.getElementById('email').value.trim();
  const password=document.getElementById('password').value;
  if(!email||!password){alert('الرجاء إدخال البريد وكلمة المرور');return;}
  if(mode==='signup'){
   const fullname=document.getElementById('fullname').value.trim();
   const cc=document.getElementById('cc').value;
   const phoneRaw=document.getElementById('phone').value.trim();
   if(!fullname||!phoneRaw){alert('الرجاء إدخال الاسم ورقم الهاتف');return;}
   const phone=cc+phoneRaw.replace(/[^0-9]/g,'');
   const {data,error}=await supabase.auth.signUp({email,password});
   if(error){
    let msg=error.message;
    if(msg.includes('already registered')||msg.includes('User already'))msg='⚠️ هذا البريد الإلكتروني مسجل مسبقاً بتطبيق تاجر';
    else if(msg.includes('Password'))msg='⚠️ كلمة المرور ضعيفة، يجب أن تكون 8 أحرف على الأقل';
    else if(msg.includes('Invalid'))msg='⚠️ البريد الإلكتروني غير صالح';
    else msg='⚠️ '+msg;
    alert(msg);return;
   }
   const uid=data.user?.id;
   if(uid){await supabase.from('profiles').update({full_name:fullname,phone:phone}).eq('id',uid);}
   await supabase.auth.signOut();
   login();
   setMode('signin');
   document.getElementById('email').value=email;
   document.getElementById('password').value=password;
  }else{
   const {error}=await supabase.auth.signInWithPassword({email,password});
   if(error)alert(error.message);else render('home');
  }
 };
}
async function loadHome(){
 const {data:p}=await supabase.from('profiles').select('user_code').maybeSingle(); document.getElementById('code').textContent=p?.user_code||'سيُنشأ تلقائياً';
 const {data:s}=await supabase.from('subscriptions').select('status,expires_at').order('created_at',{ascending:false}).limit(1).maybeSingle();
 document.getElementById('sub').textContent=s?.status==='active'?`فعال حتى ${new Date(s.expires_at).toLocaleDateString('ar-IQ')}`:'غير فعال';
 const {data:a}=await supabase.from('assets').select('*').eq('enabled',true).order('sort_order');
 document.getElementById('assets').innerHTML=(a||[]).map(x=>`<div class="card"><b>${esc(x.symbol)}</b><p class="muted">${esc(x.name)}</p><button class="btn secondary" onclick="alert('سيتم فتح الشارت عند ربط Market Data API')">فتح الشارت</button></div>`).join('');
}
async function loadSignals(){
 const {data:s,error}=await supabase.from('market_signals').select('*,assets(symbol,name)').eq('status','ACTIVE').order('created_at',{ascending:false});
 document.getElementById('signals').innerHTML=error?`<div class="card">${esc(error.message)}</div>`:(s||[]).map(x=>`<div class="card signal ${x.direction?.toLowerCase()}"><h3>${esc(x.direction)} — ${esc(x.assets?.symbol)}</h3><p>الدخول: ${esc(x.entry_price)}</p><p>SL: ${esc(x.stop_loss)} | TP1: ${esc(x.take_profit_1)} | TP2: ${esc(x.take_profit_2)}</p><p>القوة: ${esc(x.strength)}% — المخاطرة: ${esc(x.risk_level)}</p><p>اللوت المقترح: ${esc(x.suggested_lot)}</p><p class="muted">${esc(x.analysis)}</p></div>`).join('')||'<div class="card">لا توجد إشارات حالياً.</div>';
}
async function submitPayment(){
 const file=document.getElementById('shot').files[0]; if(!file)return alert('ارفع صورة إثبات الدفع');
 const {data:{user}}=await supabase.auth.getUser(); const path=`${user.id}/${crypto.randomUUID()}-${file.name}`;
 const up=await supabase.storage.from('payment-screenshots').upload(path,file,{upsert:false}); if(up.error)return alert(up.error.message);
 const {data:p}=await supabase.from('profiles').select('user_code').maybeSingle();
 const {error}=await supabase.from('payment_requests').insert({user_id:user.id,user_code:p?.user_code,amount:5,currency:'USDT',network:document.getElementById('network').value,wallet_address:document.getElementById('wallet').value,screenshot_path:path,txid:document.getElementById('txid').value||null,status:'pending'});
 if(error)alert(error.message);else alert('تم إرسال طلب التفعيل للأدمن');
}
supabase.auth.onAuthStateChange((_e,session)=>{if(session)page()}); page();
setTimeout(()=>{const h=document.querySelector('[data-view="home"]');if(h)h.classList.add('active');},50);
