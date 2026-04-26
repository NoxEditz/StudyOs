const App={activePage:'dashboard',weekOffset:0,calOffset:0,focusModeOn:false};
function switchTab(pid, btn) {
  if (pid === 'more') {
    openMoreMenu();
    return;
  }
  if (App.activePage === pid) return;
  
  document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  const old = document.querySelector('.page.active'), nw = document.getElementById('page-' + pid);
  if (old) old.classList.remove('active');
  if (nw) {
    nw.classList.add('active');
    App.activePage = pid;
  }
  
  renderActivePage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSheet(contentHtml) {
  const overlay = document.getElementById('sheet-overlay');
  const content = document.getElementById('sheet-content');
  if (!overlay || !content) return;
  content.innerHTML = contentHtml;
  overlay.classList.add('open');
  document.body.classList.add('sheet-open');
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  const overlay = document.getElementById('sheet-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.classList.remove('sheet-open');
  document.body.style.overflow = '';
}

function openMoreMenu() {
  const menuItems = [
    { id: 'schedule', icon: '📅', label: 'الجدول' },
    { id: 'flashcards', icon: '🃏', label: 'بطاقات' },
    { id: 'quiz', icon: '🧠', label: 'اختبار' },
    { id: 'notes', icon: '📝', label: 'ملاحظات' },
    { id: 'habits', icon: '🔥', label: 'عادات' },
    { id: 'calendar', icon: '🗓', label: 'التقويم' },
    { id: 'games', icon: '🎮', label: 'ألعاب' },
    { id: 'tools', icon: '🧮', label: 'أدوات' },
    { id: 'mood', icon: '💭', label: 'المزاج' },
    { id: 'achievements', icon: '🏆', label: 'إنجازات' },
    { id: 'settings', icon: '⚙️', label: 'إعدادات' }
  ];

  const html = `
    <div class="sheet-header">
      <div class="sheet-title">المزيد</div>
      <button class="sheet-close" onclick="closeSheet()">✕</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;padding-top:10px">
      ${menuItems.map(item => `
        <div class="more-item" onclick="switchTab('${item.id}');closeSheet()" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:15px;background:var(--card);border-radius:15px;cursor:pointer">
          <div style="font-size:1.8rem">${item.icon}</div>
          <div style="font-size:0.75rem;font-weight:700">${item.label}</div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:25px;padding:15px;background:var(--card);border-radius:15px;display:flex;align-items:center;gap:15px">
      <div style="font-size:2.5rem">🐣</div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:5px">
          <span id="sheet-level">Lv. 1</span>
          <span id="sheet-xp">0 XP</span>
        </div>
        <div style="height:6px;background:var(--bg3);border-radius:99px;overflow:hidden">
          <div id="sheet-xp-fill" style="height:100%;background:var(--gold);width:0%;transition:width 0.5s"></div>
        </div>
      </div>
    </div>
  `;
  openSheet(html);
  updateSheetGam();
}

function updateSheetGam() {
  const g = getGam();
  const info = getLevelInfo(g.xp);
  const sl = document.getElementById('sheet-level');
  const sx = document.getElementById('sheet-xp');
  const sf = document.getElementById('sheet-xp-fill');
  if (sl) sl.textContent = `المستوى ${info.level}`;
  if (sx) sx.textContent = `${info.xp} XP`;
  if (sf) sf.style.width = info.pct + '%';
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  
  // For iOS, we extract title and content to wrap in a sheet
  const title = modal.querySelector('h2, h3')?.textContent || 'التفاصيل';
  
  // Clone the modal to not modify original, then remove the header from clone
  const clone = modal.cloneNode(true);
  const header = clone.querySelector('h2, h3');
  if (header) header.remove();
  
  // Remove original modal actions if we want to custom style them for iOS
  const actions = clone.querySelector('.modal-actions');
  if (actions) actions.style.marginTop = '20px';

  const html = `
    <div class="sheet-header">
      <div class="sheet-title">${title}</div>
      <button class="sheet-close" onclick="closeSheet()">✕</button>
    </div>
    <div class="sheet-body">
      ${clone.innerHTML}
    </div>
  `;
  openSheet(html);
}

function closeModal(id) {
  closeSheet();
}

function showPage(pid, btn) {
  switchTab(pid, btn);
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
