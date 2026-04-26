let fcSt={deck:[],idx:0};
function initFCUI(){
  const sel=document.getElementById('fc-subj-sel');
  if(sel&&sel.children.length<=1)sel.innerHTML='<option value="">اختر المادة</option>'+SUBJECTS_DATA.map(s=>`<option value="${s.name}">${s.emoji} ${s.name}</option>`).join('');
  renderDecks();
}
function renderDecks(){
  const allCards=DB.get('flashcards')||[];const grid=document.getElementById('fc-deck-grid');if(!grid)return;
  grid.innerHTML=`<div class="deck-card" data-subj="all"><div class="deck-emoji">📚</div><div class="deck-name">الكل</div><div class="deck-count">${allCards.length} بطاقة</div></div>`+
    SUBJECTS_DATA.map(s=>{const cnt=allCards.filter(c=>c.subject===s.name).length;return `<div class="deck-card" data-subj="${s.name}"><div class="deck-emoji">${s.emoji}</div><div class="deck-name">${s.name}</div><div class="deck-count">${cnt} بطاقة</div></div>`;}).join('');
  grid.querySelectorAll('.deck-card').forEach(el=>el.onclick=()=>selectDeck(el.dataset.subj));
}
const toggleFCForm=()=>{const w=document.getElementById('fc-form-wrap');w.style.display=w.style.display==='none'?'block':'none';};
function addFlashcard(){
  const subj=document.getElementById('fc-subj-sel')?.value,q=document.getElementById('fc-q-inp')?.value?.trim(),a=document.getElementById('fc-a-inp')?.value?.trim();
  if(!subj||!q||!a){showToast('⚠️ أكمل جميع الحقول','red');return;}
  const cards=DB.get('flashcards')||[];cards.push({id:Date.now(),subject:subj,q,a});DB.set('flashcards',cards);
  queueCloudBackup();
  document.getElementById('fc-q-inp').value='';document.getElementById('fc-a-inp').value='';
  showToast('✅ تمت إضافة البطاقة');addXP(5,'بطاقة جديدة');tryUnlock('first_card');if(cards.length>=10)tryUnlock('ten_cards');renderDecks();
  queueCloudBackup();
}
function selectDeck(subj){
  const allCards=DB.get('flashcards')||[];fcSt.deck=subj==='all'?allCards:allCards.filter(c=>c.subject===subj);fcSt.idx=0;
  if(!fcSt.deck.length){showToast('⚠️ لا توجد بطاقات','red');return;}
  document.getElementById('deck-grid-wrapper').style.display='none';document.getElementById('fc-study-area').style.display='block';
  document.getElementById('fc-deck-title').textContent=subj==='all'?'كل البطاقات':subj;updateCardDisplay();
}
function exitDeck(){document.getElementById('deck-grid-wrapper').style.display='block';document.getElementById('fc-study-area').style.display='none';renderDecks();}
function updateCardDisplay(){
  const card=fcSt.deck[fcSt.idx];document.getElementById('fc-front').textContent=card?card.q:'';document.getElementById('fc-back').textContent=card?card.a:'';
  document.getElementById('fc-counter').textContent=`${fcSt.idx+1} / ${fcSt.deck.length}`;
  document.getElementById('fc-card').classList.remove('flipped');
  const n=document.getElementById('fc-nav'),e=document.getElementById('fc-eval');
  if(n)n.style.display='flex';if(e)e.style.display='none';
}
const flipCard=()=>{
  document.getElementById('fc-card').classList.toggle('flipped');
  const f=document.getElementById('fc-card').classList.contains('flipped');
  const n=document.getElementById('fc-nav'),e=document.getElementById('fc-eval');
  if(n)n.style.display=f?'none':'flex';if(e)e.style.display=f?'flex':'none';
};
const evalCard=(level)=>{
  const card=fcSt.deck[fcSt.idx];const all=DB.get('flashcards')||[];const idx=all.findIndex(c=>c.id===card.id);
  if(idx!==-1){
    const d=level==='easy'?3:level==='medium'?1:0;const dt=new Date();dt.setDate(dt.getDate()+d);
    all[idx].nextReview=dt.toISOString().split('T')[0];DB.set('flashcards',all);
    queueCloudBackup();
  }
  showToast(level==='easy'?'✨ ممتاز!':level==='medium'?'👍 جيد':'💪 تدرب أكثر');addXP(level==='easy'?5:level==='medium'?3:1);
  nextCard();
};
const nextCard=()=>{fcSt.idx=(fcSt.idx+1)%fcSt.deck.length;updateCardDisplay();};
const prevCard=()=>{fcSt.idx=(fcSt.idx-1+fcSt.deck.length)%fcSt.deck.length;updateCardDisplay();};

let qSt={subject:'',questions:[],current:0,correct:0,wrong:0};
function initQuizUI(){
  const opts=document.getElementById('quiz-opts');if(!opts)return;
  opts.innerHTML=Object.keys(QUIZ_QS).map(s=>{const subj=SUBJECTS_DATA.find(x=>x.name===s);return `<div class="quiz-opt" data-subject="${s}"><div class="quiz-opt-emoji">${subj?.emoji||'📑'}</div><div class="quiz-opt-name">${s}</div><div style="font-size:0.7rem;color:var(--text2)">${QUIZ_QS[s].length} سؤال</div></div>`;}).join('');
  opts.querySelectorAll('.quiz-opt').forEach(opt=>opt.onclick=()=>{opts.querySelectorAll('.quiz-opt').forEach(x=>x.classList.remove('sel'));opt.classList.add('sel');qSt.subject=opt.dataset.subject;});
}
function startQuizUI(){
  if(!qSt.subject){showToast('⚠️ اختر مادة أولاً','red');return;}
  const pool=QUIZ_QS[qSt.subject]||[];if(!pool.length){showToast('⚠️ لا توجد أسئلة لهذه المادة','red');return;}qSt.questions=[...pool].sort(()=>Math.random()-.5);qSt.current=0;qSt.correct=0;qSt.wrong=0;
  document.getElementById('quiz-setup-area').style.display='none';document.getElementById('quiz-play-area').style.display='block';showQ();
}
function showQ(){
  if(qSt.current>=qSt.questions.length){endQuiz();return;}
  const q=qSt.questions[qSt.current];document.getElementById('quiz-prog-bar').style.width=(qSt.current/qSt.questions.length*100)+'%';
  document.getElementById('quiz-q-num').textContent=`سؤال ${qSt.current+1} من ${qSt.questions.length}`;
  document.getElementById('quiz-q-text').textContent=q.q;
  document.getElementById('quiz-choices').innerHTML=q.c.map((ch,i)=>`<button class="quiz-choice" data-idx="${i}">${ch}</button>`).join('');
  document.querySelectorAll('.quiz-choice').forEach(b=>b.onclick=()=>answerQ(parseInt(b.dataset.idx)));
}
function answerQ(idx){
  const q=qSt.questions[qSt.current];document.querySelectorAll('.quiz-choice').forEach(b=>{b.onclick=null;b.style.pointerEvents='none';});
  document.querySelectorAll('.quiz-choice')[q.a].classList.add('correct');
  if(idx!==q.a){document.querySelectorAll('.quiz-choice')[idx].classList.add('wrong');qSt.wrong++;}else{qSt.correct++;addXP(10);}
  qSt.current++;setTimeout(()=>showQ(),900);
}
function endQuiz(){
  const score=qSt.questions.length?Math.round(qSt.correct/qSt.questions.length*100):0;if(score===100)tryUnlock('quiz_perfect');
  document.getElementById('quiz-play-area').innerHTML=`<div style="text-align:center;padding:40px;background:var(--card);border:1px solid var(--border);border-radius:20px"><div style="font-size:4rem;font-weight:900;color:${score>=80?'var(--green)':score>=50?'var(--gold)':'var(--red)'}">${score}%</div><div style="font-size:1rem;font-weight:700;margin:8px 0">نتيجتك في ${qSt.subject}</div><div style="font-size:0.85rem;color:var(--text2);margin-bottom:20px">✅ صحيح: ${qSt.correct} | ❌ خطأ: ${qSt.wrong}</div>${score>=80?'<div style="font-size:1.5rem;margin-bottom:12px">🎉 ممتاز!</div>':''}<div style="display:flex;gap:10px;justify-content:center"><button class="btn" onclick="restartQuiz()">🔄 مرة أخرى</button><button class="btn-outline" onclick="showPage('quiz',null)">اختر مادة</button></div></div>`;
  if(score>=80)fireConfetti();
}
function restartQuiz(){
  document.getElementById('quiz-play-area').innerHTML='<div class="quiz-progress"><div class="quiz-progress-bar" id="quiz-prog-bar" style="width:0%"></div></div><div id="quiz-q-num" style="font-size:0.75rem;color:var(--text2);margin-bottom:8px;text-align:center"></div><div id="quiz-q-text"></div><div id="quiz-choices"></div>';
  startQuizUI();
}

function renderNotes(filter=''){
  const tb=document.getElementById('notes-toolbar');const subjs=['عام',...SUBJECTS_DATA.map(s=>s.name)];
  if(tb)tb.innerHTML=`<button class="note-filter-btn ${!filter?'active':''}" onclick="renderNotes('')">الكل</button>`+subjs.map(s=>`<button class="note-filter-btn ${filter===s?'active':''}" onclick="renderNotes('${s}')">${s}</button>`).join('');
  const ns=document.getElementById('note-subj-inp');if(ns)ns.innerHTML=subjs.map(s=>`<option value="${s}">${s}</option>`).join('');
  let notes=DB.get('notes')||[];if(filter)notes=notes.filter(n=>n.subject===filter);
  const list=document.getElementById('notes-list');if(!list)return;
  if(!notes.length){list.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="e-icon">📝</div>لا توجد ملاحظات بعد</div>';return;}
  list.innerHTML=notes.slice().reverse().map(n=>{const c=SUBJECTS_DATA.find(x=>x.name===n.subject)?.color||'#f0c040';return `<div class="note-card2" style="--nc:${c}"><div class="note-card2-hd"><span class="note-subj-tag" style="background:${c}22;color:${c}">${n.subject}</span><span class="note-date2">${n.date}</span></div><div class="note-title2">${n.title}</div><div class="note-body2">${parseMD(n.body)}</div><div style="display:flex;justify-content:flex-end;margin-top:8px"><button class="btn-del" onclick="deleteNote(${n.id})">🗑 حذف</button></div></div>`;}).join('');
}
const parseMD=t=>(t||'').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/^- (.*?)$/gm,'• $1').replace(/\\n/g,'<br>').replace(/\n/g,'<br>');
function saveNoteUI(){
  const title=document.getElementById('note-title-inp')?.value?.trim(),subj=document.getElementById('note-subj-inp')?.value,body=document.getElementById('note-body-inp')?.value?.trim();
  if(!title||!body){showToast('⚠️ أكمل الحقول','red');return;}
  const notes=DB.get('notes')||[];notes.push({id:Date.now(),title,subject:subj,body,date:new Date().toLocaleDateString('ar-EG')});DB.set('notes',notes);
  queueCloudBackup();
  document.getElementById('note-title-inp').value='';document.getElementById('note-body-inp').value='';
  showToast('✅ تمت الملاحظة');addXP(8,'ملاحظة جديدة');tryUnlock('first_note');renderNotes();
  queueCloudBackup();
}
const deleteNote=id=>{const notes=(DB.get('notes')||[]).filter(n=>n.id!==id);DB.set('notes',notes);showToast('🗑️ تم الحذف');renderNotes();queueCloudBackup();};
