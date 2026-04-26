function renderDashboard(){
  const g=getGam();const name=g.name||'بطل الثانوية';
  const h=new Date().getHours();
  const greet=h<12?'صباح الخير':h<18?'مساء الخير':'مساء النور';
  document.getElementById('dash-greeting').innerHTML=`${greet},<br><span>${name}</span> 🎓`;
  const d=new Date();document.getElementById('dash-date-label').textContent=`${DAYS_AR[d.getDay()]} ${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`;
  const upcoming=EXAMS.filter(e=>daysUntil(e.date)>=0).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const nem=document.getElementById('next-exam-mini');
  if(upcoming.length){const ne=upcoming[0],days=daysUntil(ne.date);nem.style.display='block';nem.innerHTML=`<div class="days" style="color:${ne.color}">${days}</div><div class="label">يوم حتى</div><div class="subject">${ne.subjects.join(' + ')}</div>`;}
  else nem.style.display='none';
  const sessions=DB.get('sessions')||[];const totalH=sessions.reduce((a,s)=>a+(s.hours||0),0);const doneCount=sessions.filter(s=>s.done).length;
  const avgProg=()=>{const sd=DB.get('subjects')||{};const ps=SUBJECTS_DATA.map(s=>{const ch=sd[s.name]||s.chapters.map(c=>({name:c,done:false}));return ch.filter(c=>c.done).length/ch.length*100;});return Math.round(ps.reduce((a,b)=>a+b,0)/ps.length);};
  const se=document.getElementById('dash-stats');
  if(se)se.innerHTML=[{v:totalH.toFixed(1),l:'ساعة مذاكرة',i:'⏱',c:'#60a5fa'},{v:sessions.length,l:'جلسة مسجلة',i:'📋',c:'#a855f7'},{v:doneCount,l:'جلسة مكتملة',i:'✅',c:'#4ade80'},{v:avgProg()+'%',l:'متوسط التقدم',i:'📊',c:'#f0c040'},{v:g.pomodoroCount||0,l:'بومودورو كلي',i:'🍅',c:'#f97316'},{v:upcoming.length,l:'امتحان قادم',i:'📅',c:'#ec4899'}].map(x=>`<div class="stat-card" style="--sc:${x.c}"><div class="stat-icon">${x.i}</div><div class="stat-val">${x.v}</div><div class="stat-lbl">${x.l}</div></div>`).join('');
  const eg=document.getElementById('exams-grid');
  if(eg)eg.innerHTML=EXAMS.map(e=>{const days=daysUntil(e.date),d=new Date(e.date);let badge='';if(days===0)badge='<span class="etag urgent">اليوم!</span>';else if(days===1)badge='<span class="etag urgent">غداً!</span>';else if(days>0&&days<=7)badge=`<span class="etag soon">خلال ${days} أيام</span>`;else if(days<0)badge='<span class="etag" style="opacity:.4">انتهى</span>';
    return `<div class="exam-item" style="--ec:${e.color};${days<0?'opacity:.4':''}"><div class="exam-date"><div class="dn" style="color:${e.color}">${d.getDate()}</div><div class="dm">${MONTHS_AR[d.getMonth()]}</div></div><div class="exam-info"><h4>${e.subjects.join(' + ')}</h4><p>${e.day} • ${e.times.join(' | ')}</p><div>${badge}</div></div><div class="exam-dl">${days>=0?`<div class="dln" style="color:${e.color}">${days}</div><div class="dll">يوم</div>`:''}</div></div>`;}).join('');
  const today=todayStr();const tsd=document.getElementById('today-sessions-dash');
  const todaySess=sessions.filter(s=>s.date===today);
  if(tsd)tsd.innerHTML=todaySess.length?todaySess.map(s=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--card);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;border-right:3px solid ${subjColor(s.subject)}"><span>${SUBJECTS_DATA.find(x=>x.name===s.subject)?.emoji||'📚'}</span><div style="flex:1"><div style="font-size:0.85rem;font-weight:700">${s.subject}</div><div style="font-size:0.7rem;color:var(--text2)">${s.hours} ساعة</div></div><span style="font-size:0.8rem;color:${s.done?'var(--green)':'var(--text3)'}">${s.done?'✅':'⏳'}</span></div>`).join(''):
    '<div class="empty" style="padding:16px"><div class="e-icon">📅</div><div style="font-size:0.8rem">لا توجد جلسات اليوم</div></div>';
  const qp=document.getElementById('quick-progress');
  if(qp){const sd=DB.get('subjects')||{};qp.innerHTML=SUBJECTS_DATA.map(s=>{const ch=sd[s.name]||s.chapters.map(c=>({name:c,done:false}));const done=ch.filter(c=>c.done).length,pct=Math.round(done/ch.length*100);return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px"><span>${s.emoji} ${s.name}</span><span style="color:${s.color}">${pct}%</span></div><div class="prog-wrap"><div class="prog-bar" style="width:${pct}%;background:${s.color}"></div></div></div>`;}).join('');}
  const graph=document.getElementById('study-graph');
  if(graph){const data=[];const tod=new Date();for(let i=13;i>=0;i--){const d=new Date(tod);d.setDate(tod.getDate()-i);const ds=d.toISOString().split('T')[0];const h=sessions.filter(s=>s.date===ds).reduce((a,b)=>a+(b.hours||0),0);data.push({date:ds,hours:h});}const maxH=Math.max(...data.map(d=>d.hours),1);graph.innerHTML=data.map(d=>`<div class="graph-col" title="${d.date}: ${d.hours}h"><div class="graph-bar" style="height:${(d.hours/maxH)*100}%"></div><div class="graph-label">${d.date.split('-')[2]}</div></div>`).join('');}
  const hm=document.getElementById('heatmap-grid');
  if(hm){const tod=new Date();hm.innerHTML=Array.from({length:90},(_,i)=>{const dd=new Date(tod);dd.setDate(tod.getDate()-89+i);const ds=dd.toISOString().split('T')[0];const h=sessions.filter(s=>s.date===ds).reduce((a,b)=>a+(b.hours||0),0);let lv='';if(h>=4)lv='l4';else if(h>=2)lv='l3';else if(h>=1)lv='l2';else if(h>0)lv='l1';return `<div class="heatmap-cell ${lv}" title="${ds}: ${h}h"></div>`;}).join('');}
  const tipEl=document.getElementById('tip-text');
  if(tipEl){const td=todayStr();if(DB.get('tip_date')!==td){DB.set('tip_date',td);DB.set('tip_today',rand(TIPS));}tipEl.textContent=DB.get('tip_today')||rand(TIPS);}
}
