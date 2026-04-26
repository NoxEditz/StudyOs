const HEMOJIS=['⭐','🏃','📖','💧','🧘','🎯','🌟','💪','🥗','😴','✍️'];let hEIdx=0;
const cycleHabitEmoji=()=>{hEIdx=(hEIdx+1)%HEMOJIS.length;document.getElementById('habit-emoji-pick').textContent=HEMOJIS[hEIdx];};
function addHabit(){
  const name=document.getElementById('habit-name-inp')?.value?.trim();if(!name){showToast('⚠️ أدخل اسم العادة','red');return;}
  const habits=DB.get('habits')||[];habits.push({id:Date.now(),name,icon:HEMOJIS[hEIdx]});DB.set('habits',habits);
  queueCloudBackup();
  document.getElementById('habit-name-inp').value='';showToast('⭐ تمت إضافة العادة');addXP(10,'عادة جديدة');tryUnlock('first_habit');renderHabits();
  queueCloudBackup();
}
function renderHabits(){
  const habits=DB.get('habits')||[];const logs=DB.get('habit_logs')||{};const grid=document.getElementById('habit-grid');if(!grid)return;
  const dates=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d.toISOString().split('T')[0];});
  if(!habits.length){grid.innerHTML='<div class="empty"><div class="e-icon">🔥</div>أضف عاداتك الدراسية اليومية</div>';return;}
  grid.innerHTML=habits.map(h=>{const streak=calcStreak(h.id,logs);const dots=dates.map(d=>`<div class="habit-dot ${logs[`${h.id}_${d}`]?'filled':''}" onclick="toggleHL(${h.id},'${d}')">${logs[`${h.id}_${d}`]?'✓':''}</div>`).join('');
    return `<div class="habit-item"><span style="font-size:1.4rem">${h.icon}</span><div><div class="habit-name">${h.name}</div><div class="habit-streak">🔥 سلسلة ${streak} يوم</div></div><div class="habit-dots">${dots}</div><button style="background:none;border:none;color:var(--text3);cursor:pointer;padding:4px;font-size:0.85rem" onmouseenter="this.style.color='var(--red)'" onmouseleave="this.style.color='var(--text3)'" onclick="delHabit(${h.id})">🗑</button></div>`;}).join('');
}
function toggleHL(id,date){const logs=DB.get('habit_logs')||{};const key=`${id}_${date}`;logs[key]=!logs[key];DB.set('habit_logs',logs);if(logs[key])addXP(5,'عادة مكتملة');renderHabits();queueCloudBackup();}
const delHabit=id=>{const h=(DB.get('habits')||[]).filter(x=>x.id!==id);DB.set('habits',h);showToast('🗑️ تم الحذف');renderHabits();queueCloudBackup();};
function calcStreak(id,logs){let s=0;const t=new Date();for(let i=0;i<365;i++){const d=new Date(t);d.setDate(t.getDate()-i);if(logs[`${id}_${d.toISOString().split('T')[0]}`])s++;else break;}return s;}

const calPrev=()=>{App.calOffset--;renderCalendar();};const calNext=()=>{App.calOffset++;renderCalendar();};
function renderCalendar(){
  const now=new Date();now.setMonth(now.getMonth()+App.calOffset);const year=now.getFullYear(),month=now.getMonth();
  const lbl=document.getElementById('cal-month');if(lbl)lbl.textContent=`${MONTHS_AR[month]} ${year}`;
  const first=new Date(year,month,1);const sessions=DB.get('sessions')||[];const today=todayStr();
  const grid=document.getElementById('cal-grid');if(!grid)return;
  const days=[];for(let i=0;i<first.getDay();i++)days.push(null);for(let i=1;i<=new Date(year,month+1,0).getDate();i++)days.push(new Date(year,month,i));
  grid.innerHTML=DAYS_AR.map(d=>`<div class="cal-day-name">${d.substring(0,2)}</div>`).join('')+days.map(d=>{if(!d)return'<div></div>';const ds=d.toISOString().split('T')[0];const hasSess=sessions.some(s=>s.date===ds);const hasExam=EXAMS.some(e=>e.date===ds);return `<div class="cal-day ${ds===today?'today':''} ${hasSess?'has-session':''} ${hasExam?'has-exam':''}">${d.getDate()}</div>`;}).join('');
}
