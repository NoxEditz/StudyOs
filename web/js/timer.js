let tSt={mode:'focus',secs:25*60,total:25*60,running:false,iv:null};
const TMODES={focus:{label:'وقت التركيز 🎯',def:25},short:{label:'راحة قصيرة ☕',def:5},long:{label:'راحة طويلة 🛋',def:15}};
function initTimerUI(){
  const s=DB.get('settings')||{};
  const me=document.getElementById('timer-modes');
  if(me)me.innerHTML=Object.entries(TMODES).map(([k,v])=>`<button class="timer-mode-btn ${tSt.mode===k?'active':''}" onclick="setTimerMode('${k}')">${v.label}</button>`).join('');
  renderPomoDots();
}
function setTimerMode(mode){
  if(tSt.running)return;tSt.mode=mode;const s=DB.get('settings')||{};
  const mins=mode==='focus'?(s.focusMins||25):mode==='short'?(s.shortMins||5):(s.longMins||15);
  tSt.secs=mins*60;tSt.total=tSt.secs;
  document.querySelectorAll('.timer-mode-btn').forEach(b=>b.classList.toggle('active',b.textContent.includes(TMODES[mode].label.split(' ')[0])));
  const lbl=document.getElementById('timer-mode-label');if(lbl)lbl.textContent=TMODES[mode].label;
  updateTimerDisplay();
}
function toggleTimerUI(){
  if(tSt.running){clearInterval(tSt.iv);tSt.running=false;document.getElementById('timer-start-btn').textContent='▶ استمرار';const fb=document.getElementById('focus-start-btn');if(fb)fb.textContent='▶ استمرار';}
  else{
    if(App.focusModeOn && tSt.secs===tSt.total && tSt.mode==='focus'){
      const ba=document.getElementById('breathe-anim'),bt=document.getElementById('breathe-text');
      if(ba){
        ba.style.display='flex';bt.textContent='خذ نفساً عميقاً...';
        setTimeout(()=>bt.textContent='استرخِ...',2500);
        setTimeout(()=>{ba.style.display='none';startTimerLoop();},5000);
        return;
      }
    }
    startTimerLoop();
  }
}
function startTimerLoop(){
  tSt.running=true;document.getElementById('timer-start-btn').textContent='⏸ إيقاف';const fb=document.getElementById('focus-start-btn');if(fb)fb.textContent='⏸ إيقاف';
  tSt.iv=setInterval(()=>{tSt.secs--;updateTimerDisplay();if(tSt.secs<=0){clearInterval(tSt.iv);tSt.running=false;document.getElementById('timer-start-btn').textContent='▶ ابدأ';if(fb)fb.textContent='▶ تشغيل';onTimerEnd();}},1000);
}
function resetTimerUI(){clearInterval(tSt.iv);tSt.running=false;setTimerMode(tSt.mode);document.getElementById('timer-start-btn').textContent='▶ ابدأ';const fb=document.getElementById('focus-start-btn');if(fb)fb.textContent='▶ تشغيل';}
function updateTimerDisplay(){
  const m=Math.floor(tSt.secs/60),s=tSt.secs%60,str=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const el=document.getElementById('timer-display');if(el)el.textContent=str;
  const fb=document.getElementById('focus-timer-big');if(fb)fb.textContent=str;
  const pct=((tSt.total-tSt.secs)/tSt.total)*100;const prog=document.getElementById('timer-progress');
  if(prog)prog.style.strokeDashoffset=753.98-(753.98*pct/100);
  document.title=tSt.running?`${str} - StudyOS`:'StudyOS';
}
function onTimerEnd(){
  if(tSt.mode==='focus'){
    const g=getGam();g.pomodoroCount=(g.pomodoroCount||0)+1;
    const today=todayStr();if(g.pomodoroDate!==today){g.pomodoroDate=today;g.pomodoroToday=0;}g.pomodoroToday=(g.pomodoroToday||0)+1;saveGam(g);
    addXP(25,'🍅 بومودورو مكتمل');
    tryUnlock('first_pomo');if(g.pomodoroCount>=10)tryUnlock('ten_pomo');if(g.pomodoroCount>=50)tryUnlock('fifty_pomo');
    fireConfetti();updateGamHUD();renderPomoDots();
    queueCloudBackup();
    setTimeout(()=>{setTimerMode('short');showToast('☕ وقت الراحة!');},1000);
  }else{showToast('✅ انتهت الراحة، جاهز للتركيز!');setTimeout(()=>setTimerMode('focus'),500);}
  const s=DB.get('settings')||{};if(s.sound!==false)playBeep();
}
function playBeep(){try{const ac=new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator();const g=ac.createGain();o.connect(g);g.connect(ac.destination);o.frequency.value=880;g.gain.setValueAtTime(0.3,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.5);o.start();o.stop(ac.currentTime+0.5);}catch(e){}}
function renderPomoDots(){
  const g=getGam();const today=todayStr();const cnt=g.pomodoroDate===today?(g.pomodoroToday||0):0;
  const el=document.getElementById('pomo-dots');const lbl=document.getElementById('pomo-label');
  if(el)el.innerHTML=Array.from({length:Math.max(cnt,4)},(_,i)=>`<span class="pomo-dot ${i<cnt?'done':''}"></span>`).join('');
  if(lbl)lbl.textContent=`جلسات اليوم: ${cnt}`;
}
const toggleFocusMode=()=>{App.focusModeOn=!App.focusModeOn;const ov=document.getElementById('focus-mode-overlay');ov.classList.toggle('active',App.focusModeOn);if(App.focusModeOn)document.getElementById('focus-quote').textContent=rand(MOTIV_QUOTES);};
let ambCtx=null,ambNodes=[];
function playAmbient(type){
  ambNodes.forEach(n=>{try{n.stop();}catch(e){}});ambNodes=[];
  document.querySelectorAll('.ambient-btn').forEach(b=>b.classList.remove('playing'));
  if(type==='off')return;
  const btn=document.querySelector(`.ambient-btn[onclick*="'${type}'"]`);if(btn)btn.classList.add('playing');
  try{if(!ambCtx)ambCtx=new(window.AudioContext||window.webkitAudioContext)();
    const mg=ambCtx.createGain();mg.gain.value=0.06;mg.connect(ambCtx.destination);
    for(let i=0;i<5;i++){const o=ambCtx.createOscillator(),g=ambCtx.createGain();o.type='sawtooth';o.frequency.value=type==='rain'?100+Math.random()*200:type==='cafe'?200+Math.random()*300:80+Math.random()*150;g.gain.value=Math.random()*0.1;o.connect(g);g.connect(mg);o.start();ambNodes.push(o);}
    showToast(`🎵 صوت ${type==='rain'?'المطر':type==='cafe'?'المقهى':'الغابة'}`);}catch(e){showToast('⚠️ لا يمكن تشغيل الصوت','red');}
}
