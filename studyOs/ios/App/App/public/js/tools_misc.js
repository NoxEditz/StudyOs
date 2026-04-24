function renderTools(){
  const ct=document.getElementById('countdown-tool');
  if(ct)ct.innerHTML=EXAMS.filter(e=>daysUntil(e.date)>=0).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,5).map(e=>`<div class="countdown-item"><div class="countdown-days" style="color:${e.color}">${daysUntil(e.date)}</div><div><div style="font-size:0.85rem;font-weight:700">${e.subjects.join(' + ')}</div><div style="font-size:0.7rem;color:var(--text2)">${e.day} ${dateLabel(e.date)}</div></div></div>`).join('')||'<div class="empty">انتهت جميع الامتحانات 🎉</div>';
}
function calcGrade(){const g=parseFloat(document.getElementById('grade-inp')?.value);const r=document.getElementById('grade-result');if(!r)return;if(isNaN(g)||g<0||g>100||document.getElementById('grade-inp').value.trim()===''){r.textContent='أدخل رقماً بين 0 و 100';return;}let gr='',gpa='';if(g>=90)gr='A ممتاز',gpa='4.0';else if(g>=80)gr='B جيد جداً',gpa='3.5';else if(g>=70)gr='C جيد',gpa='3.0';else if(g>=60)gr='D مقبول',gpa='2.0';else gr='F ضعيف',gpa='0.0';r.innerHTML=`<div style="color:var(--gold);font-size:1.1rem;font-weight:900">${gr}</div><div style="font-size:0.8rem;color:var(--text2)">GPA: ${gpa}</div>`;}
function calcPerc(){const part=parseFloat(document.getElementById('perc-part')?.value),whole=parseFloat(document.getElementById('perc-whole')?.value),r=document.getElementById('perc-result');if(!r)return;if(isNaN(part)||isNaN(whole)||whole===0||document.getElementById('perc-part').value.trim()===''||document.getElementById('perc-whole').value.trim()===''){r.textContent='أدخل أرقاماً صحيحة';return;}r.textContent=`${(part/whole*100).toFixed(2)}%`;}
function calcStudyTime(){const h=parseFloat(document.getElementById('hours-avail')?.value),r=document.getElementById('study-time-result');if(!r)return;if(isNaN(h)||h<=0||document.getElementById('hours-avail').value.trim()===''){r.textContent='أدخل عدد الساعات';return;}const upcoming=EXAMS.filter(e=>daysUntil(e.date)>=0).sort((a,b)=>new Date(a.date)-new Date(b.date));if(!upcoming.length){r.textContent='لا توجد امتحانات قادمة';return;}const perS=(h/upcoming.length).toFixed(1);r.innerHTML=upcoming.map(e=>`<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>${e.subjects[0]}</span><span style="color:var(--gold);font-weight:700">${perS}س</span></div>`).join('');}

function logMood(btn,mood){const today=todayStr();const logs=DB.get('mood_logs')||{};logs[today]=mood;DB.set('mood_logs',logs);document.querySelectorAll('.mood-btn').forEach(b=>b.classList.toggle('selected',b.dataset.mood===mood));showToast(`${mood} تم تسجيل مزاجك`);addXP(5,'تسجيل المزاج');tryUnlock('mood_tracker');renderMood();}
function renderMood(){
  const logs=DB.get('mood_logs')||{};const today=todayStr();document.querySelectorAll('.mood-btn').forEach(b=>b.classList.toggle('selected',b.dataset.mood===logs[today]));
  const grid=document.getElementById('mood-history-grid');if(!grid)return;
  const days=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);return d.toISOString().split('T')[0];});
  grid.innerHTML=days.map(d=>`<div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:var(--card);border-radius:10px"><span style="font-size:0.75rem;color:var(--text3);min-width:80px">${d}</span><span style="font-size:1.4rem">${logs[d]||'—'}</span></div>`).join('');
}

function renderAchievements(){
  const unlocked=getUnlocked();const g=getGam();const info=getLevelInfo(g.xp);
  const lt=document.getElementById('ach-level-text');if(lt)lt.textContent=`المستوى ${info.level} — ${info.title}`;
  const xt=document.getElementById('ach-xp-text');if(xt)xt.textContent=`${info.xp} / ${info.nextXp} XP`;
  const pb=document.getElementById('ach-prog-bar');if(pb)pb.style.width=info.pct+'%';
  const grid=document.getElementById('achievements-grid');if(!grid)return;
  grid.innerHTML=ACHIEVEMENTS.map(a=>{const u=unlocked.includes(a.id);return `<div class="ach-item ${u?'unlocked':'locked'}"><div class="ach-icon">${a.icon}</div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div><div class="ach-xp">+${a.xp} XP</div><div style="font-size:0.65rem;margin-top:4px;color:${u?'var(--green)':'var(--text3)'}">${u?'✅ محقق':'🔒 مقفل'}</div></div>`;}).join('');
}

function renderSettings(){const s=DB.get('settings')||{};const g=getGam();const ni=document.getElementById('setting-name');if(ni)ni.value=g.name||'';if(s.focusMins)document.getElementById('set-focus').value=s.focusMins;if(s.shortMins)document.getElementById('set-short').value=s.shortMins;if(s.longMins)document.getElementById('set-long').value=s.longMins;const ts=document.getElementById('toggle-sound');if(ts){if(s.sound===false)ts.classList.remove('on');else ts.classList.add('on');}const tn=document.getElementById('toggle-notif');if(tn){if(s.notif===false)tn.classList.remove('on');else tn.classList.add('on');}}
function saveSettings(){const g=getGam();g.name=document.getElementById('setting-name')?.value||'';saveGam(g);const s={focusMins:parseInt(document.getElementById('set-focus')?.value)||25,shortMins:parseInt(document.getElementById('set-short')?.value)||5,longMins:parseInt(document.getElementById('set-long')?.value)||15,sound:document.getElementById('toggle-sound')?.classList.contains('on'),notif:document.getElementById('toggle-notif')?.classList.contains('on')};DB.set('settings',s);showToast('✅ تم الحفظ','green');if(App.activePage==='dashboard')renderDashboard();queueCloudBackup();}
function exportData(){const data={};['sessions','subjects','flashcards','notes','habits','habit_logs','gam','achievements','settings','mood_logs','kanban_tasks'].forEach(k=>data[k]=DB.get(k));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='studyos_backup.json';a.click();showToast('📤 تم التصدير');}
function importData(){const inp=document.createElement('input');inp.type='file';inp.accept='.json';inp.onchange=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=r=>{try{const data=JSON.parse(r.result);if(typeof data!=='object'||!data)throw new Error();Object.entries(data).forEach(([k,v])=>DB.set(k,v));showToast('📥 تم الاستيراد','green');renderActivePage();}catch{showToast('⚠️ ملف غير صالح','red');}};reader.readAsText(file);};inp.click();}
function clearData(){if(!confirm('هل أنت متأكد من حذف كل البيانات؟'))return;['sessions','subjects','flashcards','notes','habits','habit_logs','gam','achievements','settings','mood_logs','kanban_tasks','tip_today','tip_date'].forEach(k=>DB.del(k));showToast('🗑️ تم الحذف');location.reload();}

const CLOUD_KEYS=['sessions','subjects','flashcards','notes','habits','habit_logs','gam','achievements','settings','mood_logs','kanban_tasks','tip_today','tip_date'];
const CLOUD_CFG={
  url:'https://ysbpjzwzsvlozcxeapcf.supabase.co',
  anonKey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYnBqend6c3Zsb3pjeGVhcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNDE2MjIsImV4cCI6MjA5MjYxNzYyMn0.TBprcCFoKKeqEyAU-Hd6O-OGW09iBTuDavpjqZcjKOw',
  syncKey:'studyos-single-owner-main-backup'
};
let _cloudBackupTimer=null,_cloudRestoreDone=false,_cloudBusy=false;

function cloudClient(){
  if(!window.supabase?.createClient)return null;
  return window.supabase.createClient(CLOUD_CFG.url,CLOUD_CFG.anonKey);
}

async function cloudBackup(silent=false){
  const client=cloudClient();if(!client)return;
  const payload={};
  CLOUD_KEYS.forEach(k=>payload[k]=DB.get(k));
  const {error}=await client.from('studyos_backups').upsert({sync_key:CLOUD_CFG.syncKey,payload,updated_at:new Date().toISOString()},{onConflict:'sync_key'});
  if(error){if(!silent)showToast('❌ فشل النسخ السحابي','red');return;}
  if(!silent)showToast('☁️ تم حفظ النسخة السحابية','green');
}

async function cloudRestore(silent=false){
  const client=cloudClient();if(!client)return;
  const {data,error}=await client.from('studyos_backups').select('payload').eq('sync_key',CLOUD_CFG.syncKey).maybeSingle();
  if(error){if(!silent)showToast('⚠️ تعذر قراءة النسخة السحابية','red');return;}
  if(!data?.payload){if(!silent)showToast('⚠️ لا توجد نسخة محفوظة');return;}
  Object.entries(data.payload).forEach(([k,v])=>DB.set(k,v));
  if(!silent)showToast('✅ تم استرجاع بياناتك من السحابة','green');
  renderActivePage();
}

async function queueCloudBackup(){
  if(_cloudBusy)return;
  _cloudBusy=true;
  try{await cloudBackup(true);}catch(e){}finally{_cloudBusy=false;}
}

async function initCloudSync(){
  if(_cloudRestoreDone)return;
  _cloudRestoreDone=true;
  try{await cloudRestore(true);}catch(e){}
  _cloudBackupTimer=setInterval(queueCloudBackup,120000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')queueCloudBackup();});
  window.addEventListener('beforeunload',()=>{queueCloudBackup();});
}
