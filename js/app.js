import {supabase} from './supabase.js';
const app=document.getElementById('app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function page(){
 app.innerHTML=`<div class="topbar"><div class="brand">TAJER</div><button id="logout" class="btn secondary">خروج</button></div>
 <main class="container"><div class="nav">
 <button class="btn" data-view="home">الرئيسية</button><button class="btn secondary" data-view="signals">الإشارات</button>
 <button class="btn secondary" data-view="subscription">الاشتراك</button><button class="btn secondary" data-view="profile">الحساب</button>
 </div><section id="view"></section></main>`;
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>render(b.dataset.view));
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
 app.innerHTML=`<main class="container"><div class="card"><h1>TAJER</h1><p class="muted" id="mode-label">تسجيل الدخول</p>
 <input id="email" class="input" type="email" placeholder="البريد الإلكتروني"><br><br>
 <input id="password" class="input" type="password" placeholder="كلمة المرور"><br><br>
 <button id="submit" class="btn">دخول</button>
 <p class="muted" style="margin-top:12px"><a href="#" id="toggle">ليس لديك حساب؟ سجل الآن</a></p>
 </div></main>`;
 let mode='signin';
 document.getElementById('toggle').onclick=(e)=>{e.preventDefault();mode=mode==='signin'?'signup':'signin';document.getElementById('mode-label').textContent=mode==='signin'?'تسجيل الدخول':'إنشاء حساب جديد';document.getElementById('submit').textContent=mode==='signin'?'دخول':'إنشاء حساب';document.getElementById('toggle').textContent=mode==='signin'?'ليس لديك حساب؟ سجل الآن':'لديك حساب؟ سجل الدخول';};
 document.getElementById('submit').onclick=async()=>{
  const email=document.getElementById('email').value.trim();
  const password=document.getElementById('password').value;
  if(!email||!password){alert('الرجاء إدخال البريد وكلمة المرور');return;}
  if(mode==='signup'){
   const {error}=await supabase.auth.signUp({email,password});
   if(error)alert(error.message);else otp(email);
  }else{
   const {error}=await supabase.auth.signInWithPassword({email,password});
   if(error)alert(error.message);else render('home');
  }
 };
}
function otp(email){
 app.innerHTML=`<main class="container"><div class="card"><h2>رمز التحقق</h2><p class="muted">تم إرسال رمز إلى ${esc(email)}</p><input id="otp" class="input" inputmode="numeric" maxlength="6" placeholder="ادخل الرمز"><br><br><button id="verify" class="btn">تحقق</button></div></main>`;
 document.getElementById('verify').onclick=async()=>{const token=document.getElementById('otp').value.trim();const {error}=await supabase.auth.verifyOtp({email,token,type:'signup'});if(error)alert(error.message);else page()};
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
