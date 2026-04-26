const getWeekDates=offset=>{const now=new Date(),d=now.getDay(),sun=new Date(now);sun.setDate(now.getDate()-d+offset*7);return Array.from({length:7},(_,i)=>{const x=new Date(sun);x.setDate(sun.getDate()+i);return x.toISOString().split('T')[0];});};
const prevWeek=()=>{App.weekOffset--;renderSchedule();};const nextWeek=()=>{App.weekOffset++;renderSchedule();};
function renderSchedule(){
  const dates=getWeekDates(App.weekOffset);const sessions=DB.get('sessions')||[];const today=todayStr();
  const lbl=document.getElementById('week-label');if(lbl)lbl.textContent=`${dateLabel(dates[0])} — ${dateLabel(dates[6])}`;
  const grid=document.getElementById('week-grid');if(!grid)return;
  grid.innerHTML=dates.map(dt=>{const d=new Date(dt),isT=dt===today,daySess=sessions.filter(s=>s.date===dt),examDay=EXAMS.find(e=>e.date===dt);
    return `<div class="day-cell ${isT?'today':''} ${examDay?'has-exam':''}"><div class="day-hd">${DAYS_AR[d.getDay()]}<span class="date-n">${d.getDate()}</span></div>${examDay?'<div class="exam-marker">📅 امتحان</div>':''}${daySess.map(s=>{const gi=sessions.indexOf(s);return `<span class="session-chip ${s.done?'done':''}" data-idx="${gi}" style="border-right:3px solid ${subjColor(s.subject)}">${s.subject} ${s.hours}س</span>`;}).join('')}<button class="add-chip" data-date="${dt}">+ إضافة</button></div>`;}).join('');
  grid.querySelectorAll('.session-chip').forEach(el=>el.onclick=()=>toggleSession(parseInt(el.dataset.idx)));
  grid.querySelectorAll('.add-chip').forEach(el=>el.onclick=()=>openAddSessionModal(el.dataset.date));
  const asl=document.getElementById('all-sessions-list');
  if(asl){const sorted=[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,20);asl.innerHTML=sorted.length?sorted.map(s=>`<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--card);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;border-right:3px solid ${subjColor(s.subject)}"><span>${SUBJECTS_DATA.find(x=>x.name===s.subject)?.emoji||'📚'}</span><div style="flex:1"><div style="font-size:0.85rem;font-weight:700">${s.subject}</div><div style="font-size:0.7rem;color:var(--text2)">${s.date} • ${s.hours} ساعة${s.notes?' • '+s.notes:''}</div></div><span style="color:${s.done?'var(--green)':'var(--text3)'};font-size:0.8rem">${s.done?'✅':'⏳'}</span><button onclick="deleteSession(${sessions.indexOf(s)})" style="background:none;border:none;color:var(--text3);cursor:pointer;padding:4px 8px;font-size:0.8rem" onmouseenter="this.style.color='var(--red)'" onmouseleave="this.style.color='var(--text3)'">🗑</button></div>`).join(''):
    '<div class="empty"><div class="e-icon">📅</div>لا توجد جلسات بعد</div>';}
}
function openAddSessionModal(date){
  openModal('modal-session');
  const d=document.getElementById('ms-date');if(d)d.value=date||todayStr();
  const s=document.getElementById('ms-subject');
  if(s)s.innerHTML='<option value="">اختر المادة</option>'+SUBJECTS_DATA.map(x=>`<option value="${x.name}">${x.emoji} ${x.name}</option>`).join('');
}
function saveSessionModal(){
  const subj=document.getElementById('ms-subject')?.value,date=document.getElementById('ms-date')?.value,hours=parseFloat(document.getElementById('ms-hours')?.value)||1,notes=document.getElementById('ms-notes')?.value||'';
  if(!subj||!date){showToast('⚠️ اختر المادة والتاريخ','red');return;}
  const sessions=DB.get('sessions')||[];sessions.push({subject:subj,date,hours,notes,done:false,id:Date.now()});DB.set('sessions',sessions);
  queueCloudBackup();
  closeModal('modal-session');showToast('✅ تمت إضافة الجلسة');addXP(10,'جلسة جديدة');
  tryUnlock('first_session');const g=getGam();g.totalSessions=(g.totalSessions||0)+1;g.totalHours=(g.totalHours||0)+hours;saveGam(g);
  if(g.totalSessions>=5)tryUnlock('five_sessions');if(g.totalSessions>=10)tryUnlock('ten_sessions');if(g.totalHours>=10)tryUnlock('ten_hours');if(g.totalHours>=50)tryUnlock('fifty_hours');
  renderActivePage();
  queueCloudBackup();
}
function toggleSession(idx){const sessions=DB.get('sessions')||[];if(!sessions[idx])return;sessions[idx].done=!sessions[idx].done;DB.set('sessions',sessions);if(sessions[idx].done)addXP(15,'جلسة مكتملة');renderActivePage();queueCloudBackup();}
function deleteSession(idx){const sessions=DB.get('sessions')||[];sessions.splice(idx,1);DB.set('sessions',sessions);showToast('🗑️ تم الحذف');renderActivePage();queueCloudBackup();}

function renderSubjects(){
  const grid=document.getElementById('subj-grid');if(!grid)return;
  const sd=DB.get('subjects')||{};
  grid.innerHTML=SUBJECTS_DATA.map(s=>{const ch=sd[s.name]||s.chapters.map(c=>({name:c,done:false}));const done=ch.filter(c=>c.done).length,pct=Math.round(done/ch.length*100),days=daysUntil(s.exam);
    return `<div class="subj-card" style="--sc2:${s.color}"><div class="subj-hd"><div><div class="subj-name">${s.name}</div><div class="subj-exam-info">${days>=0?`الامتحان خلال ${days} يوم`:'انتهى الامتحان'}</div></div><div class="subj-emoji">${s.emoji}</div></div><div class="prog-wrap"><div class="prog-bar" style="width:${pct}%;background:${s.color}"></div></div><div class="prog-labels"><span>التقدم</span><span>${pct}%</span></div><div class="chapters">${ch.map((c,i)=>`<div class="chap-item ${c.done?'done':''}" data-subj="${s.name}" data-idx="${i}"><div class="chap-cb">${c.done?'✓':''}</div><div class="chap-txt">${c.name}</div></div>`).join('')}</div></div>`;}).join('');
  grid.querySelectorAll('.chap-item').forEach(el=>el.onclick=()=>toggleChap(el.dataset.subj,parseInt(el.dataset.idx)));
}
function toggleChap(subj,idx){
  const sd=DB.get('subjects')||{};if(!sd[subj]){const s=SUBJECTS_DATA.find(x=>x.name===subj);sd[subj]=s.chapters.map(c=>({name:c,done:false}));}
  sd[subj][idx].done=!sd[subj][idx].done;DB.set('subjects',sd);
  queueCloudBackup();addXP(5,'فصل مكتمل');
  if(sd[subj].every(c=>c.done)){tryUnlock('complete_subject');fireConfetti();}renderActivePage();queueCloudBackup();
}
