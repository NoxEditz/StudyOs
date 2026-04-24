function initBG(){
  const c=document.getElementById('bg-canvas');if(!c)return;
  const ctx=c.getContext('2d');let W,H,pts=[];
  const resize=()=>{W=c.width=innerWidth;H=c.height=innerHeight;};resize();
  addEventListener('resize',resize);
  for(let i=0;i<55;i++)pts.push({x:Math.random()*2000,y:Math.random()*2000,vx:(Math.random()-.5)*0.15,vy:(Math.random()-.5)*0.15,r:Math.random()*1.2+0.3,op:Math.random()*0.25+0.08});
  (function draw(){
    if(document.hidden){setTimeout(()=>requestAnimationFrame(draw),2000);return;}
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(240,192,64,${p.op})`;ctx.fill();});
    ctx.lineWidth=0.4;
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=dx*dx+dy*dy;if(d<9000){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(240,192,64,${0.02*(1-Math.sqrt(d)/95)})`;ctx.stroke();}}
    requestAnimationFrame(draw);
  })();
}

function runIntro(){
  const wrap=document.getElementById('intro-particles');
  for(let i=0;i<20;i++){const p=document.createElement('div');p.className='intro-particle';const s=Math.random()*4+1;p.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;--d:${4+Math.random()*8}s;--del:${Math.random()*4}s;`;wrap.appendChild(p);}
  const upcoming=EXAMS.filter(e=>daysUntil(e.date)>=0).sort((a,b)=>new Date(a.date)-new Date(b.date));
  if(upcoming.length)document.getElementById('is-days').textContent=daysUntil(upcoming[0].date);
  const bar=document.getElementById('intro-bar'),status=document.getElementById('intro-status');
  const steps=['جاري تحميل البيانات...','تهيئة لوحة التحكم...','تحميل المواد الدراسية...','تحضير الجدول الزمني...','StudyOS جاهز! 🚀'];
  let i=0;
  const iv=setInterval(()=>{bar.style.width=((i+1)/steps.length*100)+'%';status.textContent=steps[i];i++;
    if(i>=steps.length){clearInterval(iv);
      const st=document.getElementById('intro-stats');st.style.display='flex';
      const btn=document.getElementById('intro-enter-btn');btn.style.display='inline-block';}
  },500);
}

function enterApp(){
  document.getElementById('intro-page').classList.add('exit');
  setTimeout(()=>{document.getElementById('intro-page').style.display='none';document.getElementById('app').classList.add('visible');renderActivePage();},800);
}
