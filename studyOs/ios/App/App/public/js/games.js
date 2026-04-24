function launchGameUI(name){
  document.querySelector('.games-grid').style.display='none';document.getElementById('game-container').style.display='block';
  const wrap=document.getElementById('game-canvas-wrap');wrap.innerHTML='';
  if(name==='snake')startSnake(wrap);else if(name==='mathrace')startMathRace(wrap);else if(name==='memory')startMemory(wrap);else if(name==='wordscramble')startWordScramble(wrap);
}
function exitGameUI(){
  if(window._gi)clearInterval(window._gi);if(window._gr)cancelAnimationFrame(window._gr);
  if(window._gameCleanup){window._gameCleanup();window._gameCleanup=null;}
  document.getElementById('game-canvas-wrap').innerHTML='';document.getElementById('game-container').style.display='none';document.querySelector('.games-grid').style.display='grid';document.getElementById('game-score').textContent='';
}
function startSnake(wrap){
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=320;canvas.style.cssText='background:var(--bg2);border-radius:12px;display:block;margin:0 auto';wrap.appendChild(canvas);
  const ctx=canvas.getContext('2d'),cs=20;let snake=[{x:10,y:10}],dir={x:1,y:0},food={x:5,y:5},score=0,alive=true;
  const rf=()=>{food={x:Math.floor(Math.random()*16),y:Math.floor(Math.random()*16)};};
  document.getElementById('game-score').textContent=`النقاط: ${score}`;
  
  const handleKey = (e) => {
    if(!alive && (e.key==='r'||e.key==='R')){snake=[{x:10,y:10}];dir={x:1,y:0};score=0;alive=true;rf();return;}
    if(e.key==='ArrowUp'&&dir.y!==1)dir={x:0,y:-1};else if(e.key==='ArrowDown'&&dir.y!==-1)dir={x:0,y:1};else if(e.key==='ArrowLeft'&&dir.x!==1)dir={x:-1,y:0};else if(e.key==='ArrowRight'&&dir.x!==-1)dir={x:1,y:0};
  };
  document.addEventListener('keydown', handleKey);
  window._gameCleanup = () => document.removeEventListener('keydown', handleKey);

  window._gi=setInterval(()=>{
    if(!alive)return;const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
    if(head.x<0||head.x>=16||head.y<0||head.y>=16||snake.some(s=>s.x===head.x&&s.y===head.y)){alive=false;ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,320,320);ctx.fillStyle='#f0c040';ctx.font='bold 20px Cairo';ctx.textAlign='center';ctx.fillText('انتهت اللعبة! 🐍',160,150);ctx.fillStyle='#94a3b8';ctx.font='14px Cairo';ctx.fillText(`النقاط: ${score}`,160,180);ctx.fillText('اضغط R للبدء',160,210);return;}
    snake.unshift(head);if(head.x===food.x&&head.y===food.y){score++;document.getElementById('game-score').textContent=`النقاط: ${score}`;rf();}else snake.pop();
    ctx.fillStyle='#060812';ctx.fillRect(0,0,320,320);ctx.fillStyle='#4ade80';snake.forEach(s=>ctx.fillRect(s.x*cs+1,s.y*cs+1,cs-2,cs-2));ctx.fillStyle='#f0c040';ctx.beginPath();ctx.arc(food.x*cs+cs/2,food.y*cs+cs/2,cs/2-2,0,Math.PI*2);ctx.fill();
  },150);

  let tx=0,ty=0;
  canvas.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;e.preventDefault();},{passive:false});
  canvas.addEventListener('touchmove',e=>{e.preventDefault();},{passive:false});
  canvas.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
    if(Math.abs(dx)>Math.abs(dy)){if(Math.abs(dx)>30){if(dx>0&&dir.x!==-1)dir={x:1,y:0};else if(dx<0&&dir.x!==1)dir={x:-1,y:0};}}
    else{if(Math.abs(dy)>30){if(dy>0&&dir.y!==-1)dir={x:0,y:1};else if(dy<0&&dir.y!==1)dir={x:0,y:-1};}}
    e.preventDefault();
  },{passive:false});
}
function startMathRace(wrap){
  let score=0,timeLeft=30;const genQ=()=>{const ops=['+','-','×'];const op=rand(ops);let a=Math.floor(Math.random()*20)+1,b=Math.floor(Math.random()*15)+1;if(op==='-'&&b>a)[a,b]=[b,a];const ans=op==='+'?a+b:op==='-'?a-b:a*b;return{q:`${a} ${op} ${b} = ?`,ans};};
  let q=genQ();
  wrap.innerHTML=`<div style="text-align:center;padding:20px"><div style="font-size:0.8rem;color:var(--text2);margin-bottom:8px">الوقت: <span id="mr-time">${timeLeft}</span>ث</div><div style="font-size:2.5rem;font-weight:900;margin-bottom:20px;color:var(--gold)" id="mr-q">${q.q}</div><input id="mr-ans" type="number" style="width:120px;padding:12px;font-size:1.2rem;text-align:center;background:var(--bg3);border:2px solid var(--border2);border-radius:12px;color:var(--text);outline:none;font-family:IBM Plex Mono" autofocus /><div style="margin-top:10px;font-size:0.8rem;color:var(--text2)">اضغط Enter للإجابة</div></div>`;
  document.getElementById('game-score').textContent=`النقاط: ${score}`;
  document.getElementById('mr-ans')?.addEventListener('keydown',e=>{if(e.key==='Enter'){const v=parseInt(e.target.value);if(v===q.ans){score++;addXP(2);showToast('✅ صح!','green');}else showToast(`❌ الجواب: ${q.ans}`,'red');e.target.value='';q=genQ();const qel=document.getElementById('mr-q');if(qel)qel.textContent=q.q;document.getElementById('game-score').textContent=`النقاط: ${score}`;}});
  window._gi=setInterval(()=>{timeLeft--;const te=document.getElementById('mr-time');if(te)te.textContent=timeLeft;if(timeLeft<=0){clearInterval(window._gi);wrap.innerHTML=`<div style="text-align:center;padding:30px"><div style="font-size:3rem;font-weight:900;color:var(--gold)">${score}</div><div style="font-size:0.9rem;color:var(--text2);margin:8px">نقطة في 30 ثانية!</div><button class="btn" onclick="launchGameUI('mathrace')">مرة أخرى</button></div>`;}},1000);
}
function startMemory(wrap){
  const emojis=['⚗️','⚡','🧬','📖','🌍','🥐','☪️','🌱'];let cards=[...emojis,...emojis].sort(()=>Math.random()-.5).map((e,i)=>({e,i,flipped:false,matched:false}));let first=null,second=null,moves=0,lock=false;
  const render=()=>{wrap.innerHTML=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:320px;margin:0 auto">${cards.map(c=>`<div class="mc" data-idx="${c.i}" style="aspect-ratio:1;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;background:${c.flipped||c.matched?'var(--bg3)':'var(--bg4)'};border:1px solid ${c.matched?'var(--green)':c.flipped?'var(--border2)':'var(--border)'};transition:all 0.2s">${c.flipped||c.matched?c.e:'❓'}</div>`).join('')}</div>`;document.getElementById('game-score').textContent=`خطوات: ${moves}`;
    wrap.querySelectorAll('.mc').forEach(el=>el.onclick=()=>{const i=parseInt(el.dataset.idx);if(lock||cards[i].flipped||cards[i].matched)return;cards[i].flipped=true;render();if(!first){first=i;}else{second=i;moves++;lock=true;if(cards[first].e===cards[second].e){cards[first].matched=cards[second].matched=true;first=second=null;lock=false;if(cards.every(c=>c.matched)){showToast(`🎉 فزت في ${moves} خطوة!`,'green');addXP(20,'لعبة الذاكرة');}}else setTimeout(()=>{cards[first].flipped=cards[second].flipped=false;first=second=null;lock=false;render();},900);}});};render();
}
function startWordScramble(wrap){
  const words=[{w:'كيمياء',h:'مادة علمية تدرس المواد'},{w:'فيزياء',h:'علم الطبيعة والمادة'},{w:'رياضيات',h:'علم الأعداد'},{w:'مذاكرة',h:'الدراسة والتحضير'},{w:'امتحان',h:'اختبار يقيس الطالب'}];
  let idx=0,score=0;
  const show=()=>{const sc=[...words[idx].w].sort(()=>Math.random()-.5).join('');wrap.innerHTML=`<div style="text-align:center;padding:20px"><div style="font-size:0.75rem;color:var(--text3);margin-bottom:6px">تلميح: ${words[idx].h}</div><div style="font-size:2rem;font-weight:900;letter-spacing:8px;color:var(--gold);margin-bottom:16px">${sc}</div><input id="ws-inp" placeholder="رتب الحروف..." style="width:200px;padding:10px;text-align:center;background:var(--bg3);border:1px solid var(--border2);border-radius:99px;color:var(--text);outline:none;font-family:Cairo" autofocus /><div style="margin-top:10px"><button class="btn btn-sm" onclick="checkWS()">تحقق</button></div><div style="margin-top:8px;font-size:0.8rem;color:var(--text2)">النقاط: ${score}</div></div>`;document.getElementById('ws-inp')?.addEventListener('keydown',e=>{if(e.key==='Enter')checkWS();});};
  window.checkWS=()=>{const v=document.getElementById('ws-inp')?.value?.trim();if(v===words[idx].w){score++;showToast('✅ صح!','green');addXP(5);}else showToast(`❌ الإجابة: ${words[idx].w}`,'red');idx++;if(idx>=words.length)wrap.innerHTML=`<div style="text-align:center;padding:30px"><div style="font-size:3rem;font-weight:900;color:var(--gold)">${score}/${words.length}</div><div style="font-size:0.9rem;color:var(--text2);margin:8px">كلمات صحيحة</div><button class="btn" onclick="startWordScramble(document.getElementById('game-canvas-wrap'))">مرة أخرى</button></div>`;else show();};show();
}
