const getGam=()=>DB.get('gam')||{xp:0,level:1,streak:0,lastLogin:'',totalSessions:0,totalHours:0,pomodoroCount:0,pomodoroToday:0,pomodoroDate:'',name:''};
const saveGam=g=>{DB.set('gam',g);queueCloudBackup();};
function getLevelInfo(xp){
  let lv=1,title='مبتدئ',avatar='🐣',nextXp=100;
  for(let i=LEVELS.length-1;i>=0;i--){if(xp>=LEVELS[i].min){lv=i+1;title=LEVELS[i].title;avatar=LEVELS[i].avatar;nextXp=LEVELS[i+1]?LEVELS[i+1].min:99999;break;}}
  const prevXp=LEVELS[lv-1]?LEVELS[lv-1].min:0;
  const pct=Math.min(100,Math.round((xp-prevXp)/Math.max(nextXp-prevXp,1)*100));
  return{level:lv,title,avatar,xp,nextXp,prevXp,pct};
}
const getUnlocked=()=>DB.get('achievements')||[];
function tryUnlock(id){
  const u=getUnlocked();if(u.includes(id))return;
  const a=ACHIEVEMENTS.find(x=>x.id===id);if(!a)return;
  u.push(id);DB.set('achievements',u);
  queueCloudBackup();
  const g=getGam();g.xp+=a.xp;saveGam(g);
  showToast(`🏆 إنجاز: ${a.name} +${a.xp} XP`,'green');updateGamHUD();
  queueCloudBackup();
}
function addXP(n,msg=''){
  const g=getGam();g.xp+=n;saveGam(g);
  if(msg)showToast(`✨ ${msg} +${n} XP`);
  updateGamHUD();showXpPop(n);
}
function updateGamHUD(){
  const g=getGam();const info=getLevelInfo(g.xp);
  
  // Dashboard / Achievement elements
  const elLevel = document.getElementById('sb-level') || document.getElementById('ach-level-text');
  const elXP = document.getElementById('sb-xp') || document.getElementById('ach-xp-text');
  const elBar = document.getElementById('sb-xp-fill') || document.getElementById('ach-prog-bar');
  
  if(elLevel) elLevel.textContent=`Lv. ${info.level}`;
  if(elXP) elXP.textContent=`${info.xp} XP`;
  if(elBar) elBar.style.width=info.pct+'%';
  
  // Titlebar / Topbar elements
  const tbLevel = document.getElementById('tb-level');
  const tbTitle = document.getElementById('tb-title');
  const tbStreak = document.getElementById('tb-streak');
  
  if(tbLevel) tbLevel.textContent=info.level;
  if(tbTitle) tbTitle.textContent=info.title;
  if(tbStreak) tbStreak.textContent=g.streak||0;
  
  document.querySelectorAll('.user-avatar').forEach(el=>el.textContent=info.avatar);
}
function checkLoginStreak(){
  const g=getGam();const today=todayStr();if(g.lastLogin===today)return;
  const yest=new Date();yest.setDate(yest.getDate()-1);const ys=yest.toISOString().split('T')[0];
  g.streak=g.lastLogin===ys?(g.streak||0)+1:1;g.lastLogin=today;saveGam(g);
  if(g.streak>=3)tryUnlock('streak_3');if(g.streak>=7)tryUnlock('streak_7');if(g.streak>=30)tryUnlock('streak_30');
}
function showXpPop(xp){
  const el=document.createElement('div');el.className='xp-popup';el.textContent=`+${xp} XP`;
  el.style.left=(window.innerWidth/2-30)+'px';el.style.top=(window.innerHeight/2)+'px';
  document.body.appendChild(el);setTimeout(()=>el.remove(),1500);
}
function fireConfetti(){
  let c=document.getElementById('cc');
  if(c) c.remove();
  c=document.createElement('canvas');c.id='cc';c.style.cssText='position:fixed;inset:0;z-index:9997;pointer-events:none';document.body.appendChild(c);
  const ctx=c.getContext('2d');c.width=window.innerWidth;c.height=window.innerHeight;
  const cols=['#f0c040','#22d3ee','#a855f7','#22c55e','#ef4444','#f97316'];
  let ps=Array.from({length:120},(_,i)=>({x:Math.random()*c.width,y:-20,r:Math.random()*5+2,dx:(Math.random()-.5)*6,dy:Math.random()*4+2,col:cols[i%6]}));
  let fr=0;
  function a(){
    if(!document.getElementById('cc')) return;
    ctx.clearRect(0,0,c.width,c.height);
    ps.forEach(p=>{p.x+=p.dx;p.y+=p.dy;ctx.fillStyle=p.col;ctx.fillRect(p.x-p.r,p.y-p.r/2,p.r*2,p.r);});
    fr++;if(fr<200)requestAnimationFrame(a);else c.remove();
  }
  a();
}
