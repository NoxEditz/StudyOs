const App={activePage:'dashboard',weekOffset:0,calOffset:0,focusModeOn:false};
function showPage(pid,btn){
  if(App.activePage===pid)return;
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
  if(btn)btn.classList.add('active');else{const t=document.querySelector(`.nav-item[onclick*="'${pid}'"]`);if(t)t.classList.add('active');}
  const old=document.querySelector('.page.active'),nw=document.getElementById('page-'+pid);
  if(old)old.classList.remove('active');if(nw){nw.classList.add('active');App.activePage=pid;}
  const m=PAGE_META[pid]||{title:pid,sub:''};
  document.getElementById('page-title').textContent=m.title;document.getElementById('page-sub').textContent=m.sub;
  renderActivePage();
}
function renderActivePage(){
  switch(App.activePage){
    case'dashboard':renderDashboard();break;case'schedule':renderSchedule();break;case'subjects':renderSubjects();break;
    case'notes':renderNotes();break;case'habits':renderHabits();break;case'kanban':if(window.initKanbanUI)initKanbanUI();break;case'calendar':renderCalendar();break;
    case'flashcards':initFCUI();break;case'quiz':initQuizUI();break;case'timer':initTimerUI();break;
    case'tools':renderTools();break;case'achievements':renderAchievements();break;case'mood':renderMood();break;case'settings':renderSettings();break;
  }
}

const openSearch=()=>{document.getElementById('search-overlay').classList.add('open');document.getElementById('global-search-input').focus();};
const closeSearch=()=>{document.getElementById('search-overlay').classList.remove('open');document.getElementById('global-search-input').value='';document.getElementById('search-results').innerHTML='';};
function handleGlobalSearch(q){
  const res=document.getElementById('search-results');if(!q){res.innerHTML='';return;}
  const items=[];Object.entries(PAGE_META).forEach(([k,v])=>{if(v.title.includes(q)||k.includes(q))items.push({t:v.title,s:v.sub,i:'📄',cmd:k});});
  SUBJECTS_DATA.forEach(s=>{if(s.name.includes(q))items.push({t:s.name,s:'مادة دراسية',i:s.emoji,cmd:'subjects'});});
  const notes=DB.get('notes')||[];notes.forEach(n=>{if(n.title.includes(q))items.push({t:n.title,s:'ملاحظة',i:'📝',cmd:'notes'});});
  res.innerHTML=items.length?items.slice(0,8).map(x=>`<div class="search-item" data-cmd="${x.cmd}"><div class="search-item-icon">${x.i}</div><div><div class="search-item-title">${x.t}</div><div class="search-item-sub">${x.s}</div></div></div>`).join(''):'<div class="empty" style="padding:20px">لا توجد نتائج</div>';
  res.querySelectorAll('.search-item').forEach(el=>el.onclick=()=>{showPage(el.dataset.cmd,null);closeSearch();});
}

function showToast(msg,type='gold'){
  const c=document.getElementById('toast-container');if(!c)return;
  const t=document.createElement('div');t.className='toast2';t.textContent=msg;
  if(type==='red')t.style.cssText+='border-color:var(--red);color:var(--red)';else if(type==='green')t.style.cssText+='border-color:var(--green);color:var(--green)';
  c.appendChild(t);setTimeout(()=>{t.style.animation='toastOut 0.4s ease forwards';setTimeout(()=>t.remove(),400);},2500);
}
document.addEventListener('DOMContentLoaded',()=>{
  if(!window.electronAPI){
    document.body.classList.add('web-runtime');
  }
  initBG();runIntro();checkLoginStreak();updateGamHUD();
  if(window.initCloudSync)setTimeout(()=>window.initCloudSync(),1200);
  const ms=document.getElementById('ms-subject');if(ms)ms.innerHTML='<option value="">اختر المادة</option>'+SUBJECTS_DATA.map(s=>`<option value="${s.name}">${s.emoji} ${s.name}</option>`).join('');
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openSearch();}if(e.key==='Escape'){closeSearch();document.querySelectorAll('.modal-ov.open').forEach(m=>m.classList.remove('open'));}});
});

window.showPage=showPage;window.enterApp=enterApp;window.openAddSessionModal=openAddSessionModal;window.saveSessionModal=saveSessionModal;window.toggleSession=toggleSession;window.deleteSession=deleteSession;window.toggleChap=toggleChap;window.flipCard=flipCard;window.nextCard=nextCard;window.prevCard=prevCard;window.selectDeck=selectDeck;window.exitDeck=exitDeck;window.addFlashcard=addFlashcard;window.toggleFCForm=toggleFCForm;window.startQuizUI=startQuizUI;window.restartQuiz=restartQuiz;window.saveNoteUI=saveNoteUI;window.deleteNote=deleteNote;window.renderNotes=renderNotes;window.toggleTimerUI=toggleTimerUI;window.resetTimerUI=resetTimerUI;window.setTimerMode=setTimerMode;window.toggleFocusMode=toggleFocusMode;window.playAmbient=playAmbient;window.addHabit=addHabit;window.delHabit=delHabit;window.toggleHL=toggleHL;window.cycleHabitEmoji=cycleHabitEmoji;window.calPrev=calPrev;window.calNext=calNext;window.prevWeek=prevWeek;window.nextWeek=nextWeek;window.launchGameUI=launchGameUI;window.exitGameUI=exitGameUI;window.calcGrade=calcGrade;window.calcPerc=calcPerc;window.calcStudyTime=calcStudyTime;window.logMood=logMood;window.openSearch=openSearch;window.closeSearch=closeSearch;window.handleGlobalSearch=handleGlobalSearch;window.openModal=openModal;window.closeModal=closeModal;window.showToast=showToast;window.saveSettings=saveSettings;window.exportData=exportData;window.importData=importData;window.clearData=clearData;window.cloudBackup=cloudBackup;window.cloudRestore=cloudRestore;window.initCloudSync=initCloudSync;window.startWordScramble=startWordScramble;window.evalCard=evalCard;
