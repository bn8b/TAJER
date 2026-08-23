import {supabase} from './supabase.js';
const app=document.getElementById('app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function page(){
 app.innerHTML=`<div class="topbar"><div class="brand">TAJER</div><div class="topbar-actions"><button id="theme-toggle" class="icon-btn" title="الوضع الليلي/النهاري"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3a9 9 0 109 9 7 7 0 01-9-9z"/></svg></button><button id="topbar-avatar" class="topbar-avatar" title="الحساب"><svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg></button></div></div>
 <main class="container"><section id="view"></section></main>
 <nav class="bottom-nav">
 <button class="nav-item" data-view="home"><svg viewBox="0 0 24 24"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg><span>الرئيسية</span></button>
 <button class="nav-item" data-view="signals"><svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/></svg><span>الإشارات</span></button>
 <button class="nav-item" data-view="assets"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg><span>الأصول</span></button>
 <button class="nav-item" data-view="subscription"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg><span>الاشتراك</span></button>
 <button class="nav-item" data-view="notifications"><svg viewBox="0 0 24 24"><path d="M6 8a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 004 0"/></svg><span>الجوائز</span></button>
 <button class="nav-item" data-view="profile"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg><span>الحساب</span></button>
 </nav>`;
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{render(b.dataset.view);document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));b.classList.add('active');});
 document.getElementById('theme-toggle').onclick=toggleTheme;
 document.getElementById('topbar-avatar').onclick=()=>{render('profile');document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));document.querySelector('[data-view="profile"]').classList.add('active');};
 loadTopbarAvatar();
 render('home');
}
async function loadTopbarAvatar(){
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return;
 const {data:p}=await supabase.from('profiles').select('avatar_url').eq('id',user.id).maybeSingle();
 if(p?.avatar_url){const el=document.getElementById('topbar-avatar');if(el)el.innerHTML=`<img src="${esc(p.avatar_url)}" alt="avatar">`;}
}
function applyTheme(){
 const t=localStorage.getItem('tajer-theme')||'dark';
 document.documentElement.setAttribute('data-theme',t);
}
function toggleTheme(){
 const cur=localStorage.getItem('tajer-theme')||'dark';
 const next=cur==='dark'?'light':'dark';
 localStorage.setItem('tajer-theme',next);
 applyTheme();
}
applyTheme();
(function captureRef(){
 const ref=new URLSearchParams(location.search).get('ref');
 if(ref)localStorage.setItem('tajer-ref',ref);
})();
async function render(v){
 const out=document.getElementById('view');
 const {data:{user}}=await supabase.auth.getUser();
 if(!user){return login();}
 if(v==='home') out.innerHTML=`<div class="card"><h3>الأصول</h3><div class="grid" id="assets"></div></div>`;
 if(v==='signals') out.innerHTML=`<h2>الإشارات</h2><div id="signals"><div class="card">جاري التحميل...</div></div>`;
 if(v==='notifications') out.innerHTML=`<h2>الجوائز</h2>
 <div class="card profile-card">
  <div class="profile-label" style="margin-bottom:10px">رابط الدعوة</div>
  <p class="muted" style="margin:0 0 12px">شارك الرابط مع أصدقائك، وأي شخص يفتحه يوصله مباشرة لتطبيق TAJER.</p>
  <div class="code-row"><span class="user-code mono" id="p-reflink" style="font-size:12px">...</span></div>
  <div class="ref-actions"><button class="btn secondary" id="p-ref-copy">نسخ الرابط</button><button class="btn secondary" id="p-ref-share">مشاركة</button></div>
 </div>`;
 if(v==='subscription') out.innerHTML=`<h2>تفعيل الاشتراك</h2><div class="card"><h3>5 USDT / 30 يوم</h3><p class="muted">حوّل المبلغ إلى عنوان المحفظة الذي يحدده الأدمن ثم ارفع إثبات الدفع.</p><input id="network" class="input" placeholder="الشبكة (مثال: TRC20)"><br><br><input id="wallet" class="input" placeholder="عنوان المحفظة"><br><br><input id="txid" class="input" placeholder="TXID اختياري"><br><br><input id="shot" type="file" accept="image/*" class="input"><br><br><button id="pay" class="btn">إرسال طلب التفعيل</button></div>`;
 if(v==='profile') out.innerHTML=` <div class="card profile-card avatar-card">
  <div class="avatar-wrap">
   <div class="avatar-circle" id="p-avatar-circle"><svg viewBox="0 0 24 24" width="36" height="36"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg></div>
   <button class="avatar-edit-btn" id="p-avatar-btn" title="تغيير الصورة"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 20h4l10-10-4-4L4 16v4z"/></svg></button>
   <input type="file" accept="image/*" id="p-avatar-input" class="hidden">
  </div>
 </div>
 <div class="card profile-card">
  <div class="profile-row"><span class="profile-label">الاسم</span><span class="profile-editable"><span class="profile-value" id="p-name">...</span><button class="edit-btn" data-field="name" title="تعديل">✎</button></span></div>
  <div class="profile-row"><span class="profile-label">البريد الإلكتروني</span><span class="profile-value" id="p-email">...</span></div>
  <div class="profile-row"><span class="profile-label">رقم الهاتف</span><span class="profile-value" id="p-phone">...</span></div>
 </div>
 <div class="card profile-card">
  <div class="profile-row"><span class="profile-label">حالة الاشتراك</span><span class="sub-badge" id="p-sub"><span class="dot"></span><span id="p-sub-text">جاري التحقق...</span></span></div>
 </div>
 <div class="card profile-card">
  <div class="profile-label" style="margin-bottom:10px">كود المستخدم</div>
  <div class="code-row"><span class="user-code mono" id="p-code">................</span><button class="btn secondary copy-btn" id="p-copy">نسخ</button></div>
 </div>
 <div class="card profile-card">
  <div class="profile-label" style="margin-bottom:12px">اللغة</div>
  <div class="lang-row"><button class="lang-btn" data-lang="ar">🇮🇶 العربية</button><button class="lang-btn" data-lang="en">🇬🇧 English</button></div>
 </div>
 <button id="logout" class="btn danger">خروج</button>`;
 if(v==='home') await loadHome();
 if(v==='signals') await loadSignals();
 if(v==='notifications') await loadRewards(user);
 if(v==='subscription') document.getElementById('pay').onclick=submitPayment;
 if(v==='profile') await loadProfile(user);
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
   if(uid){await supabase.rpc('update_my_profile',{p_full_name:fullname,p_phone:phone});}
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
 const {data:a}=await supabase.from('assets').select('*').eq('enabled',true).order('sort_order');
 document.getElementById('assets').innerHTML=(a||[]).map(x=>`<div class="card"><b>${esc(x.symbol)}</b><p class="muted">${esc(x.name)}</p><button class="btn secondary" onclick="alert('سيتم فتح الشارت عند ربط Market Data API')">فتح الشارت</button></div>`).join('');
}
async function loadSignals(){
 const {data:s,error}=await supabase.from('market_signals').select('*,assets(symbol,name)').eq('status','ACTIVE').order('created_at',{ascending:false});
 document.getElementById('signals').innerHTML=error?`<div class="card">${esc(error.message)}</div>`:(s||[]).map(x=>`<div class="card signal ${x.direction?.toLowerCase()}"><h3>${esc(x.direction)} — ${esc(x.assets?.symbol)}</h3><p>الدخول: ${esc(x.entry_price)}</p><p>SL: ${esc(x.stop_loss)} | TP1: ${esc(x.take_profit_1)} | TP2: ${esc(x.take_profit_2)}</p><p>القوة: ${esc(x.strength)}% — المخاطرة: ${esc(x.risk_level)}</p><p>اللوت المقترح: ${esc(x.suggested_lot)}</p><p class="muted">${esc(x.analysis)}</p></div>`).join('')||'<div class="card">لا توجد إشارات حالياً.</div>';
}
async function loadRewards(user){
 const {data:p}=await supabase.from('profiles').select('user_code').eq('id',user.id).maybeSingle();
 const code=p?.user_code||'';
 const refLink=code?`${location.origin}${location.pathname}?ref=${code}`:'';
 document.getElementById('p-reflink').textContent=refLink||'سيتوفر الرابط بعد إنشاء الكود';
 document.getElementById('p-ref-copy').onclick=async()=>{
  if(!refLink)return;
  try{await navigator.clipboard.writeText(refLink);}catch(e){}
  const btn=document.getElementById('p-ref-copy');
  const old=btn.textContent; btn.textContent='تم النسخ ✓';
  setTimeout(()=>{btn.textContent=old;},1500);
 };
 document.getElementById('p-ref-share').onclick=async()=>{
  if(!refLink)return;
  if(navigator.share){try{await navigator.share({title:'TAJER',text:'انضم لتطبيق TAJER لمتابعة إشارات التداول',url:refLink});}catch(e){}}
  else{try{await navigator.clipboard.writeText(refLink);alert('تم نسخ الرابط');}catch(e){}}
 };
}
async function loadProfile(user){
 const {data:p}=await supabase.from('profiles').select('full_name,phone,user_code,avatar_url').eq('id',user.id).maybeSingle();
 document.getElementById('p-name').textContent=p?.full_name||'—';
 document.getElementById('p-email').textContent=user.email||'—';
 document.getElementById('p-phone').textContent=p?.phone||user.phone||'—';
 if(p?.avatar_url){document.getElementById('p-avatar-circle').innerHTML=`<img src="${esc(p.avatar_url)}" alt="avatar">`;}
 const {data:s}=await supabase.from('subscriptions').select('status,expires_at').order('created_at',{ascending:false}).limit(1).maybeSingle();
 const active=s?.status==='active';
 const badge=document.getElementById('p-sub');
 badge.classList.toggle('active',active);
 document.getElementById('p-sub-text').textContent=active?`مفعل حتى ${new Date(s.expires_at).toLocaleDateString('ar-IQ')}`:'غير مفعل';
 const code=p?.user_code||'';
 document.getElementById('p-code').textContent=code||'سيُنشأ تلقائياً';
 document.getElementById('p-copy').onclick=async()=>{
  if(!code)return;
  try{await navigator.clipboard.writeText(code);}catch(e){}
  const btn=document.getElementById('p-copy');
  const old=btn.textContent; btn.textContent='تم النسخ ✓';
  setTimeout(()=>{btn.textContent=old;},1500);
 };
 // Editable name/phone
 document.querySelectorAll('.edit-btn').forEach(btn=>btn.onclick=()=>{
  const field=btn.dataset.field;
  const target=field==='name'?document.getElementById('p-name'):document.getElementById('p-phone');
  const current=target.textContent==='—'?'':target.textContent;
  const wrap=target.parentElement;
  wrap.innerHTML=`<input class="edit-input" id="edit-input-${field}" value="${esc(current)}"><button class="btn secondary edit-save" id="edit-save-${field}">حفظ</button>`;
  document.getElementById(`edit-input-${field}`).focus();
  document.getElementById(`edit-save-${field}`).onclick=async()=>{
   const val=document.getElementById(`edit-input-${field}`).value.trim();
   const payload=field==='name'?{p_full_name:val}:{p_phone:val};
   const {error}=await supabase.rpc('update_my_profile',payload);
   if(error){alert(error.message);return;}
   await loadProfile(user);
  };
 });
 // Avatar upload
 document.getElementById('p-avatar-btn').onclick=()=>document.getElementById('p-avatar-input').click();
 document.getElementById('p-avatar-input').onchange=async(e)=>{
  const file=e.target.files[0]; if(!file)return;
  if(file.size>3*1024*1024){alert('حجم الصورة كبير، الحد الأقصى 3MB');return;}
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
  const path=`${user.id}/avatar.${ext}`;
  const up=await supabase.storage.from('avatars').upload(path,file,{upsert:true});
  if(up.error){alert(up.error.message);return;}
  const {data:pub}=supabase.storage.from('avatars').getPublicUrl(path);
  const url=pub.publicUrl+`?t=${Date.now()}`;
  const {error}=await supabase.rpc('update_my_profile',{p_avatar_url:url});
  if(error){alert(error.message);return;}
  document.getElementById('p-avatar-circle').innerHTML=`<img src="${esc(url)}" alt="avatar">`;
  const tb=document.getElementById('topbar-avatar'); if(tb)tb.innerHTML=`<img src="${esc(url)}" alt="avatar">`;
 };
 // Language buttons (UI only for now)
 const savedLang=localStorage.getItem('tajer-lang')||'ar';
 document.querySelectorAll('.lang-btn').forEach(b=>{
  b.classList.toggle('active',b.dataset.lang===savedLang);
  b.onclick=()=>{
   localStorage.setItem('tajer-lang',b.dataset.lang);
   document.querySelectorAll('.lang-btn').forEach(x=>x.classList.remove('active'));
   b.classList.add('active');
   if(b.dataset.lang==='en')alert('دعم اللغة الإنجليزية قيد التطوير، سيتم تفعيله قريباً');
  };
 });
 document.getElementById('logout').onclick=async()=>{await supabase.auth.signOut();location.reload()};
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
