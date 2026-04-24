const DB={get(k){try{const v=localStorage.getItem('sos_'+k);return v?JSON.parse(v):null;}catch{return null;}},set(k,v){try{localStorage.setItem('sos_'+k,JSON.stringify(v));}catch(e){}},del(k){localStorage.removeItem('sos_'+k);}};

// Build YYYY-MM-DD in local time to avoid timezone shifts on iOS/Safari.
const todayStr=()=>{
  const now=new Date();
  const y=now.getFullYear();
  const m=String(now.getMonth()+1).padStart(2,'0');
  const d=String(now.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
};
const daysUntil=d=>{const n=new Date();n.setHours(0,0,0,0);const t=new Date(d);t.setHours(0,0,0,0);return Math.round((t-n)/86400000);};
const dateLabel=s=>{const d=new Date(s);return `${d.getDate()} ${MONTHS_AR[d.getMonth()]}`;};
const subjColor=n=>{const s=SUBJECTS_DATA.find(x=>x.name===n||n.includes(x.name));return s?s.color:'#f0c040';};
const rand=arr=>arr[Math.floor(Math.random()*arr.length)];
const closeModal=id=>document.getElementById(id)?.classList.remove('open');
const openModal=id=>document.getElementById(id)?.classList.add('open');
