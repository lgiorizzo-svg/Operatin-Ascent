(() => {
// DEV-START (testing tools, remove before release)
const RealDate=Date; let DEV_OFF=0, DEV_ON=false;
try{ DEV_ON=localStorage.getItem('ascent-dev-on')==='1'; if(DEV_ON) DEV_OFF=+localStorage.getItem('ascent-dev-offset')||0; }catch(e){}
if(DEV_ON) Date=class extends RealDate{ constructor(...a){ if(a.length) super(...a); else super(RealDate.now()+DEV_OFF); } static now(){ return RealDate.now()+DEV_OFF; } };
const DEV_HASH='8215cc03eeebdeb7bf30e7b4f47af852ee32f1ac1053072679e9c51ee323e8d6';
function devSet(ms){ try{ DEV_OFF=ms; localStorage.setItem('ascent-dev-offset',ms); }catch(e){} location.reload(); }
async function devUnlock(code){
  try{ const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code.trim().toUpperCase())), hx=[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
    if(hx===DEV_HASH){ localStorage.setItem('ascent-dev-on','1'); location.reload(); } else toast('Wrong code'); }catch(e){ toast('Could not check the code'); }
}
function devCard(){
  if(!DEV_ON) return `<div class="card"><div class="eyebrow">Developer access</div><div class="edit-row"><input id="dev-code" class="ed-in" style="width:180px" type="password" placeholder="Code" autocomplete="off"><button class="mini" data-dev="unlock">Unlock</button></div></div>`;
  const n=new Date(); return `<div class="card"><div class="eyebrow">🛠 Developer tools</div><p class="note">App date: <b>${DAYS[n.getDay()]} ${dk(n)}</b>${DEV_OFF?' (simulated)':''}</p><div class="edit-row"><input id="dev-date" class="ed-in" style="width:160px" type="date" value="${dk(n)}"><button class="mini" data-dev="set">Set date</button></div><div class="fix"><button class="mini" data-dev="minus">−1 day</button><button class="mini" data-dev="plus">+1 day</button><button class="mini" data-dev="reset">Real date</button><button class="mini" data-dev="lock">Lock tools</button></div></div>`;
}
// DEV-END
const $ = s => document.querySelector(s);
const KEY = 'op-ascent-v1';
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const isRest = d => S.set.rest.includes(d);
const RANKS = [[0,'Recruit','recruit'],[5,'Private','recruit'],[10,'Corporal','soldier'],[20,'Sergeant','soldier'],[30,'Lieutenant','elite'],[45,'Captain','elite'],[60,'Major','beast'],[80,'Colonel','beast'],[100,'General','beast']];
const VARS = {
  knee:['Knee Push-Up',1.4,'Knees on the floor, straight line from knees to head.'],
  incline:['Incline Push-Up',1.25,'Hands on a table or sofa edge, body straight.'],
  standard:['Standard Push-Up',1,'Hands under shoulders, chest nearly touches the floor, body straight.'],
  wide:['Wide Push-Up',.85,'Hands clearly wider than shoulders.'],
  diamond:['Diamond Push-Up',.7,'Hands together under your chest, thumbs and index fingers forming a diamond.'],
  decline:['Decline Push-Up',.75,'Feet on a chair or bed, hands on the floor.'],
  archer:['Archer Push-Up',.5,'Wide hands. Lower toward one hand while the other arm stays straight.']
};
const pool = m => m < 5 ? ['knee','incline'] : m < 15 ? ['incline','standard'] : m < 30 ? ['standard','wide','diamond'] : m < 45 ? ['standard','wide','diamond','decline'] : ['standard','diamond','decline','archer'];
const N=(s,f)=>s.log.filter(f).length;
const MEDALS = [
  ['Goal Getter','Reach your own goal',s=>!!s.goal&&s.max>=s.goal.target],
  ['First Mission','Finish your first mission',s=>s.log.length>=1],
  ['Regular','Finish 10 missions',s=>s.log.length>=10],
  ['Veteran','Finish 30 missions',s=>s.log.length>=30],
  ['Centurion','Finish 50 missions',s=>s.log.length>=50],
  ['Lifer','Finish 100 missions',s=>s.log.length>=100],
  ['Hundred Club','1,000 total reps',s=>reps(s)>=1000],
  ['Five Grand','5,000 total reps',s=>reps(s)>=5000],
  ['Ten Thousand','10,000 total reps',s=>reps(s)>=10000],
  ['Heavy Day','100+ reps in one mission',s=>s.log.some(x=>x.total>=100)],
  ['Marathon','200+ reps in one mission',s=>s.log.some(x=>x.total>=200)],
  ['Streak of 7','7 scheduled days in a row',s=>streak()>=7],
  ['Fortnight','14 scheduled days in a row',s=>streak()>=14],
  ['Unbreakable','30 scheduled days in a row',s=>streak()>=30],
  ['Rest Easy','Mark your first rest day',s=>s.rests.length>=1],
  ['Flow State','Mark 10 rest days',s=>s.rests.length>=10],
  ['Variety Pack','Try 6 different mission types',s=>new Set(s.log.map(x=>x.name)).size>=6],
  ['Jack of All Trades','Try 12 different mission types',s=>new Set(s.log.map(x=>x.name)).size>=12],
  ['Wide Load','Finish a Wide mission',s=>N(s,x=>x.v==='wide')>=1],
  ['Diamond Cutter','Finish a Diamond mission',s=>N(s,x=>x.v==='diamond')>=1],
  ['Downhill','Finish a Decline mission',s=>N(s,x=>x.v==='decline')>=1],
  ['Archer','Finish an Archer mission',s=>N(s,x=>x.v==='archer')>=1],
  ['No Pain, No Gain','Rate 5 missions "too hard"',s=>N(s,x=>x.rating==='hard')>=5],
  ['Easy Does It','Rate 5 missions "too easy"',s=>N(s,x=>x.rating==='easy')>=5],
  ['Test Pilot','Do 5 max tests',s=>s.tests.length>=5],
  ['Steady Climb','Raise your max 3 tests in a row',s=>{const t=s.tests.map(x=>x.max).slice(-4);return t.length===4&&t.every((v,i)=>!i||v>t[i-1]);}],
  ['Record Breaker','Beat your max in a test',s=>s.tests.some((t,i)=>i>0&&t.max>Math.max(...s.tests.slice(0,i).map(x=>x.max)))],
  ['Double Digits','Reach a max of 10',s=>s.max>=10],
  ['Fifteen','Reach a max of 15',s=>s.max>=15],
  ['Quarter Century','Reach a max of 25',s=>s.max>=25],
  ['Forty','Reach a max of 40',s=>s.max>=40],
  ['Half Century','Reach a max of 50',s=>s.max>=50],
  ['Seventy-Five','Reach a max of 75',s=>s.max>=75],
  ['The Century','Reach a max of 100',s=>s.max>=100],
  ['Non-Commissioned','Reach the rank of Sergeant',s=>rankIdx(s.max)>=3],
  ['Officer','Reach the rank of Lieutenant',s=>rankIdx(s.max)>=4],
  ['Top Brass','Reach the rank of Colonel',s=>rankIdx(s.max)>=7],
  ['First Blood','Win your first duel',s=>s.duels.some(d=>d.res==='W')],
  ['Duelist','Win 10 duels',s=>s.duels.filter(d=>d.res==='W').length>=10],
  ['Gladiator','Win 50 duels',s=>s.duels.filter(d=>d.res==='W').length>=50],
  ['Peer Pressure','Beat a bot from your own tier',s=>s.duels.some(d=>d.res==='W'&&d.tier>=d.mt)]
];
const TYPES = [
  ['Volume',[.5,.5,.5,.5,.5],90,'','Five even sets. Steady, honest work.'],
  ['Pyramid',[.4,.6,.8,.6,.4],90,'','Climb to the peak set, then back down.'],
  ['Density',[.4,.4,.4,.4,.4,.4],45,'','Short rests, more sets. Builds work capacity.'],
  ['Power',[.55,.55,.55,.7],120,'Push up fast and explosive.','Long rests, heavier last set.'],
  ['Ladder',[.2,.3,.4,.5,.6],75,'','Every set a bit bigger than the last.'],
  ['Countdown',[.8,.7,.6,.5,.4,.3],75,'','Start strong, finish fast.'],
  ['Cluster',[.25,.25,.25,.25,.25,.25,.25,.25],25,'','Many small sets with almost no rest.'],
  ['Burnout',[.5,.5,.5,.9],90,'Last set: go close to failure.','Three steady sets, then one big finisher.'],
  ['Endurance',[.65,.65,.65],60,'','Three long sets, short rests.'],
  ['Grease the Groove',[.2,.2,.2,.2,.2,.2,.2,.2,.2,.2],30,'Stop every set well before it burns.','Ten light sets with perfect form.'],
  ['Wave',[.4,.6,.8,.5,.7,.9],90,'','Two waves, the second one higher.'],
  ['Double Pyramid',[.25,.4,.55,.4,.25,.4,.55,.4,.25],45,'','Two small peaks with short rests.'],
  ['Tempo',[.4,.4,.4,.4],75,'3 seconds down, 1 second up. No bouncing.','Slow reps under tension.'],
  ['Pause',[.35,.35,.35,.35,.35],75,'Hold 2 seconds at the bottom of every rep.','Pauses remove momentum.'],
  ['Speed',[.4,.4,.4,.4,.4,.4],40,'Explosive tempo, as fast as form allows.','Quick reps, quick rests.']
];
const REST = [
  ['🌊','Pool & Stretch Flow','Easy swim or walk, then a full upper-body stretch.',['5 min easy walk or swim','Doorway chest stretch, 2 × 30 s','Cross-body shoulder stretch, 2 × 30 s','Child\'s pose, 60 s']],
  ['🧘','Structural Recovery','Zero hard training today. Give your chest, shoulders and wrists some care.',['Wrist circles & forearm stretch, 1 min','Cat-cow, 10 slow reps','Thread-the-needle, 5 per side','Light plank hold, 2 × 20 s']],
  ['💧','Hydrate & Reset','Recovery is where the adaptation happens. Eat well, drink water, sleep.',['Drink 2 litres of water','Eat a protein-rich meal','5 min of slow breathing','Aim for 8 hours of sleep']],
  ['🚶','Active Walk','Light movement flushes out soreness without taxing your muscles.',['20-30 min walk outside','Shoulder rolls, 20 reps','Hip flexor stretch, 2 × 30 s','Neck stretch, 30 s each side']],
  ['🛁','Deep Release','Loosen tight spots so the next session feels smoother.',['Massage or foam-roll chest & upper back, 3 min','Triceps stretch, 2 × 30 s per arm','Lat stretch on a doorframe, 2 × 30 s','Warm shower or bath']],
  ['🌙','Full Stand-Down','No high-effort training at all. Stretch, rest and get ready.',['Dynamic stretching, 5 min','Light shoulder mobility','Lay out tomorrow\'s plan','Early night']]
];
const QUOTES = ["Recovery days aren't optional. They're where the adaptation happens.","Muscles grow while you rest, not while you train.","Rest is part of the mission.","Discipline includes knowing when to stand down.","Strong today, stronger tomorrow, if you recover."];
const dayNum = d => Math.round(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);
const monday = d => { const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x; };
const weekIdx = d => { const s=S.start?new Date(S.start+'T00:00:00'):d; return Math.floor((dayNum(monday(d))-dayNum(monday(s)))/7); };
const isDeload = d => S.set.deload && weekIdx(d)>0 && (weekIdx(d)+1)%4===0;   // every 4th week
const lvl = x => Math.floor(Math.sqrt(x/50))+1;
function addXp(n){ const a=lvl(S.xp); S.xp+=n; const b=lvl(S.xp); if(b>a){ confetti(); setTimeout(()=>toast('⭐ Level '+b+' reached!'),1800); } }
function xpCard(){ const L=lvl(S.xp), a=50*(L-1)**2, b=50*L*L; return `<div class="xp-card"><div class="xp-top"><span class="xp-tag">LVL ${L}</span><span class="caption">${S.xp} XP</span></div><div class="progress-track" style="margin-top:8px"><div class="progress-fill" style="width:${Math.round((S.xp-a)/(b-a)*100)}%;background:var(--gold)"></div></div><div class="caption">${b-S.xp} XP to level ${L+1}</div></div>`; }

let S = load();
function fresh(){ return {max:0,int:1,log:[],rests:[],tests:[],mute:false,medals:[],xp:null,start:null,sumSeen:null,set:{testDay:0,rest:[3,6],restMul:1,deload:true,summary:true,strict:0,theme:'light',warmup:true,view:'side',cMode:'cam'},duels:[],skips:[],goal:null,backup:null,bkAsk:null}; }
function norm(d){ d=d||{}; const o=Object.assign(fresh(),d); o.set=Object.assign(fresh().set,d.set); return o; }
function load(){ try { return norm(JSON.parse(localStorage.getItem(KEY))); } catch(e){ return fresh(); } }
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }

const dk = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const hash = s => [...s].reduce((a,c)=>a+c.charCodeAt(0),0);
const reps = s => s.log.reduce((a,x)=>a+x.total,0);
const isDone = k => S.log.some(x=>x.k===k) || S.tests.some(x=>x.k===k) || S.rests.includes(k);
const rankIdx = m => RANKS.reduce((a,r,i)=>m>=r[0]?i:a,0);

function streak(){
  let n=0, d=new Date();
  for(let i=0;i<400;i++){
    if(!isRest(d.getDay())&&!S.skips.includes(dk(d))){ if(isDone(dk(d))) n++; else if(i>0) break; }
    d.setDate(d.getDate()-1);
  }
  return n;
}

function mission(d){
  const m=S.max, dow=d.getDay(), k=dk(d), pl=pool(m);
  const t=TYPES[(dayNum(d)*4)%TYPES.length];   // step 4 on 15 types: never the same type two days in a row
  const v=(dow===1||dow===4)?(pl.includes('standard')?'standard':'incline'):pl[hash(k)%pl.length];
  const e=m*VARS[v][1]*S.int*(isDeload(d)?.6:1);
  return {k,v,name:t[0],reps:t[1].map(f=>Math.max(1,Math.round(e*f))),rest:Math.round(t[2]*S.set.restMul),tip:t[3]};
}

/* ---------- helpers ---------- */
let ac;
function beep(f=660,t=.15){ if(S.mute) return; try{ ac=ac||new AudioContext(); const o=ac.createOscillator(),g=ac.createGain(); o.frequency.value=f; g.gain.value=.15; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+t);}catch(e){} }
function vib(p){ if(!S.mute&&navigator.vibrate) navigator.vibrate(p); }
function applyTheme(){ const t=S.set.theme, dark=t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.dataset.theme=dark?'dark':'light'; const m=document.querySelector('meta[name=theme-color]'); if(m) m.content=dark?'#171a13':'#ece5d2'; }
function goalCard(){
  const g=S.goal; if(!g) return '';
  const wl=(new Date(g.date+'T23:59:59')-new Date())/6048e5, pct=Math.max(0,Math.min(100,Math.round((S.max-g.from)/((g.target-g.from)||1)*100)));
  let msg;
  if(S.max>=g.target) msg='🎉 Goal reached!';
  else if(wl<=0) msg='Deadline passed. Set a new goal in Settings.';
  else { const need=(g.target-S.max)/wl, we=Math.max(1,(new Date()-new Date((S.start||dk(new Date()))+'T00:00:00'))/6048e5), rate=(S.max-(S.tests[0]?S.tests[0].max:S.max))/we;
    msg=`Need about +${need.toFixed(1)} per week, you are gaining ${rate.toFixed(1)}: ${rate>=need?'on track ✅':'behind ⚠️'}`; }
  return `<div class="xp-card"><div class="xp-top"><span class="xp-tag">GOAL</span><span class="caption">Max ${g.target} by ${g.date}</span></div><div class="progress-track" style="margin-top:8px"><div class="progress-fill" style="width:${pct}%;background:var(--soldier)"></div></div><div class="caption">${msg}</div></div>`;
}
function bestStreak(){
  const ks=[...S.log,...S.tests,...S.rests].map(x=>x.k||x).sort(); if(!ks.length) return 0;
  let n=0,best=0; const end=dk(new Date());
  for(const d=new Date(ks[0]+'T00:00:00'); dk(d)<=end; d.setDate(d.getDate()+1)){ const k=dk(d);
    if(isRest(d.getDay())||S.skips.includes(k)) continue;
    if(isDone(k)){ n++; best=Math.max(best,n); } else if(k!==end) n=0; }
  return best;
}
function recordsHTML(){
  const dayR={}, weekR={};
  S.log.forEach(x=>{ dayR[x.k]=(dayR[x.k]||0)+x.total; const w=dk(monday(new Date(x.k+'T00:00:00'))); weekR[w]=(weekR[w]||0)+x.total; });
  const mx=o=>Math.max(0,...Object.values(o)), box=(n,l)=>`<div class="stat-box"><span class="stat-num">${n}</span><span class="stat-label">${l}</span></div>`;
  return `<h2 class="screen-heading">Personal records</h2><div class="stat-grid">${box(Math.max(0,...S.tests.map(t=>t.max)),'Best max')}${box(Math.max(0,...S.log.map(x=>x.total)),'Best mission')}${box(mx(dayR),'Best day')}${box(mx(weekR),'Best week')}${box(bestStreak(),'Longest streak')}${box(Math.max(0,...S.duels.map(d=>d.me)),'Best duel')}${box(S.duels.filter(d=>d.res==='W').length,'Duel wins')}${box(lvl(S.xp),'Level')}</div>`;
}
let cal=null;
function calHTML(){
  const now=new Date(); if(!cal) cal={y:now.getFullYear(),m:now.getMonth()};
  const first=new Date(cal.y,cal.m,1), days=new Date(cal.y,cal.m+1,0).getDate(), off=(first.getDay()+6)%7, tk=dk(now), st=S.start||tk;
  let cells=''; for(let i=0;i<off;i++) cells+='<i></i>';
  for(let d=1;d<=days;d++){ const dt=new Date(cal.y,cal.m,d), k=dk(dt); let c='';
    if(isDone(k)) c='done'; else if(S.skips.includes(k)) c='skip'; else if(k>tk||k<st) c='fut'; else if(isRest(dt.getDay())) c='rest'; else if(k<tk) c='miss';
    cells+=`<i class="${c} ${k===tk?'today':''}">${d}</i>`; }
  return `<h2 class="screen-heading">Streak calendar</h2><div class="card"><div class="cal-head"><button class="mini" data-cal="-1">‹</button><b>${first.toLocaleString('en',{month:'long'})} ${cal.y}</b><button class="mini" data-cal="1">›</button></div><div class="cal">${['M','T','W','T','F','S','S'].map(x=>`<b>${x}</b>`).join('')}${cells}</div><p class="caption">Green done · tan rest · blue skipped · red missed</p></div>`;
}
function recalcXp(){ S.xp=S.log.reduce((a,x)=>a+x.total+20,0)+S.tests.reduce((a,t)=>a+50+2*t.max,0)+S.rests.length*10+S.duels.reduce((a,d)=>a+(d.xp||0),0); }
function doBackup(){ S.backup=dk(new Date()); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'})); a.download='ascent-progress-'+dk(new Date())+'.json'; a.click(); save(); renderSettings(); toast('Progress saved to file'); }
const daysAgo=k=>Math.floor((new Date()-new Date(k+'T00:00:00'))/864e5);
function backupNudge(){
  const ref=S.backup||S.start; if(!S.max||!ref||S.bkAsk===dk(new Date())||daysAgo(ref)<14) return;
  S.bkAsk=dk(new Date()); save();
  modal(`<div class="eyebrow">Backup</div><div class="title">Save your progress</div><p class="note">${S.backup?'Your last backup is '+daysAgo(S.backup)+' days old.':'You have never saved a backup.'} Your data lives only in this browser. If you clear the browser data, it is gone.</p><button class="btn-primary btn-gold" id="bk-now">Save backup now</button><button class="btn-primary btn-alt" id="bk-later">Later</button>`);
}
const WARM=[['Arm circles',15,'Big slow circles, forwards then backwards.'],['Shoulder rolls',10,'Roll your shoulders back and down.'],['Wrist circles',10,'Rotate both wrists, then shake them out.'],['Cat-cow',15,'On all fours, slowly arch and round your back.'],['Plank hold',10,'Straight body, squeeze your glutes.'],['Easy push-ups',15,'A few slow, light reps. Knees or incline is fine.']];
let wu={};
function warmUp(cb){ if(!S.set.warmup) return cb(); wu={i:0,cb,go:false}; stepWarm(); }
function stepWarm(){
  clearInterval(wu.iv);
  if(wu.i>=WARM.length){ beep(784,.2); return wu.cb(); }
  const w=WARM[wu.i], rdy=!wu.go; let t=rdy?5:w[1];
  modal(`<div class="eyebrow">Warm-up · ${wu.i+1}/${WARM.length}${rdy?' · Get ready':''}</div><div class="title">${w[0]}</div><div class="target" id="wu-t">${t}</div><p class="note">${rdy?'Get into position. ':''}${w[2]}</p><button class="btn-primary" id="wu-next">Next</button><button class="btn-primary btn-alt" id="wu-skip">Skip warm-up</button>`);
  wu.iv=setInterval(()=>{ t--; const e=$('#wu-t'); if(e) e.textContent=t; if(t<=0) wuAdvance(); },1000);
}
function wuAdvance(){ beep(660,.2); vib(40); if(wu.go){ wu.i++; wu.go=false; } else wu.go=true; stepWarm(); }
let ed=null;   // entry currently being edited in the log
function fixEntry(t,i,act){
  if(act==='edit'){ ed={t,i}; return renderLog(); }
  if(act==='cancel'){ ed=null; return renderLog(); }
  const arr=t==='m'?S.log:t==='t'?S.tests:t==='r'?S.rests:S.skips;
  if(act==='del'){ if(!confirm('Delete this entry?')) return; arr.splice(i,1); ed=null; }
  else {   // save
    const v=[...document.querySelectorAll('#screen-log .ed-in')].map(e=>Math.round(+e.value));
    if(!v.length||v.some(n=>!(n>=0))||(t==='t'&&v[0]<1)) return toast('Enter valid numbers');
    if(t==='t') arr[i].max=v[0]; else { arr[i].reps=v; arr[i].total=v.reduce((a,b)=>a+b,0); }
    ed=null;
  }
  if(t==='t') S.max=S.tests.length?S.tests[S.tests.length-1].max:0;
  recalcXp(); renderAll(); if(!S.max) setup();
}
function buzz(){ if(!S.mute && navigator.vibrate) navigator.vibrate([200,100,200]); }
function toast(t){ const el=$('#toast'); el.textContent=t; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2600); }
function confetti(){ const L=$('#confetti-layer'), c=['#b8912b','#4b7f52','#2f5d8a','#a63d40','#6b4c93']; for(let i=0;i<60;i++){ const p=document.createElement('i'); p.className='confetti-piece'; p.style.cssText=`left:${Math.random()*100}%;background:${c[i%5]};animation-duration:${1.5+Math.random()*1.5}s;--drift:${Math.random()*160-80}px`; L.appendChild(p); setTimeout(()=>p.remove(),3200);} }
function modal(html, cls=''){ $('#modal-panel').className='modal-panel '+cls; $('#modal-panel').innerHTML=html; $('#modal').classList.remove('hidden'); }
function closeModal(){ clearInterval(run.timer); $('#modal').classList.add('hidden'); }
function checkMedals(){
  MEDALS.forEach(m=>{ if(!S.medals.includes(m[0]) && m[2](S)){ S.medals.push(m[0]); toast('🏅 Achievement: '+m[0]); } });
}

/* ---------- screens ---------- */
function renderHome(){
  const i=rankIdx(S.max), rk=RANKS[i], nx=RANKS[i+1];
  const pct = nx ? Math.min(100,Math.round((S.max-rk[0])/(nx[0]-rk[0])*100)) : 100;
  const now=new Date(), dow=now.getDay(), todayK=dk(now);
  let h=`<div class="card rank-card rank-${rk[2]}"><div class="rank-top"><div><div class="eyebrow">Current rank</div><div class="rank-name">${rk[1]}</div></div><div style="text-align:right"><div class="eyebrow">Max in a row</div><div class="big-num">${S.max}</div></div></div>
  <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
  <div class="caption">${nx?`${nx[0]-S.max} more to ${nx[1]}`:'Highest rank reached'}</div></div>
  ${xpCard()}${goalCard()}${isDeload(now)?'<div class="intel"><strong>Deload week:</strong> volume is cut to about 60% this week so your body can recover and come back stronger. Intensity stays unchanged.</div>':''}
  <div class="stat-grid">
    <div class="stat-box"><span class="stat-num">${streak()}</span><span class="stat-label">Streak</span></div>
    <div class="stat-box"><span class="stat-num">${S.log.length}</span><span class="stat-label">Missions</span></div>
    <div class="stat-box"><span class="stat-num">${reps(S)}</span><span class="stat-label">Total reps</span></div>
    <div class="stat-box"><span class="stat-num">${Math.round(S.int*100)}%</span><span class="stat-label">Intensity</span></div>
  </div><div class="week">`;
  const mon=new Date(now); mon.setDate(now.getDate()-((dow+6)%7));
  for(let n=0;n<7;n++){ const d=new Date(mon); d.setDate(mon.getDate()+n); const k=dk(d), w=d.getDay();
    const cls=(k===todayK?'today ':'')+(isDone(k)?'done':(isRest(w)||S.skips.includes(k))?'rest':'');
    h+=`<div class="day-chip ${cls}">${DAYS[w]}<b>${isDone(k)?'✓':S.skips.includes(k)?'S':isRest(w)?'–':w===S.set.testDay?'T':'•'}</b></div>`; }
  h+='</div>';
  if(S.skips.includes(todayK)){
    h+=`<div class="card"><div class="eyebrow">Today · ${DAYS[dow]}</div><div class="mission-title">⏸ Day skipped</div><p class="note">No problem. Your streak is safe and the next missions ease back in.</p><button class="btn-primary btn-alt" id="undo-skip">Undo skip</button></div>`;
  } else if(dow===S.set.testDay){
    const t=S.tests.find(x=>x.k===todayK);
    h+=`<div class="card"><div class="eyebrow">Today · ${DAYS[dow]}</div><div class="mission-title">Max Test Day</div>`+
      (t?`<p class="note">Test logged: <b>${t.max}</b> push-ups. Rest up — training resumes tomorrow.</p>`:
      `<p class="note">Warm up with a few easy sets, then do ONE all-out set of standard push-ups with good form. Your result resets your training.</p><button class="btn-primary btn-gold" id="go-test">Start max test</button><button class="btn-primary btn-alt" id="go-skip">Skip today</button>`)+`</div>`;
  } else if(isRest(dow)){
    const n=dayNum(now), r=REST[n%REST.length], rested=S.rests.includes(todayK);
    h+=`<div class="card"><div class="eyebrow">Today · ${DAYS[dow]} · Rest day</div><div class="mission-title">${r[0]} ${r[1]}</div><p class="note">${r[2]}</p>
    <div class="check-list">${r[3].map(t=>`<label><input type="checkbox" ${rested?'checked disabled':''}> ${t}</label>`).join('')}</div>
    <div class="intel">${QUOTES[n%QUOTES.length]}${(dow+1)%7===S.set.testDay?' Tomorrow is Max Test Day.':''}</div>
    ${rested?'<div class="stamp">RESTED</div>':'<button class="btn-primary" id="go-rest">Mark rested</button>'}</div>`;
  } else {
    const m=mission(now), done=S.log.find(x=>x.k===todayK);
    h+=`<div class="card"><div class="eyebrow">Today · ${DAYS[dow]}</div><div class="mission-title">${m.name}: ${VARS[m.v][0]}</div>`+
      (done?`<p class="note">Mission complete — ${done.total} reps. Good work.</p>`:
      `<div class="sets">${m.reps.join(' · ')}</div><div class="caption">${m.reps.length} sets · ${m.reps.reduce((a,b)=>a+b,0)} reps · ${m.rest}s rest</div>
      <div class="intel"><strong>Form:</strong> ${VARS[m.v][2]}${m.tip?`<br><strong>Focus:</strong> ${m.tip}`:''}</div><button class="btn-primary" id="go-mission">Start mission</button><button class="btn-primary btn-alt" id="go-skip">Skip today</button>`)+`</div>`;
  }
  $('#screen-home').innerHTML=h;
  const gm=$('#go-mission'); if(gm) gm.onclick=()=>chooseMode('mission',mission(new Date()));
  const gr=$('#go-rest'); if(gr) gr.onclick=()=>{ S.rests.push(dk(new Date())); addXp(10); beep(520,.2); toast('Rest logged. Recovery counts.'); renderAll(); };
  const gt=$('#go-test'); if(gt) gt.onclick=()=>chooseMode('test');
}

function renderLog(){
  const all=[...S.log.map((x,i)=>({...x,t:'m',i})),...S.tests.map((x,i)=>({...x,t:'t',i})),...S.rests.map((k,i)=>({k,t:'r',i})),...S.skips.map((k,i)=>({k,t:'s',i}))].sort((a,b)=>b.k.localeCompare(a.k));
  const btn=(x,a,t)=>`<button class="mini" data-fix="${a}" data-t="${x.t}" data-i="${x.i}">${t}</button>`;
  const isEd=x=>ed&&ed.t===x.t&&ed.i===x.i;
  const fix=x=>isEd(x)?`<div class="fix">${btn(x,'save','Save')}${btn(x,'cancel','Cancel')}</div>`:`<div class="fix">${x.t==='m'||x.t==='t'?btn(x,'edit','Edit'):''}${btn(x,'del','Delete')}</div>`;
  const inp=v=>`<input type="number" inputmode="numeric" min="0" class="ed-in" value="${v}">`;
  const body=x=>x.t==='r'?`<b>${x.k} · Rest Day</b><br>Recovered.`:x.t==='s'?`<b>${x.k} · Skipped</b><br>Day skipped, streak protected.`:
    x.t==='t'?`<b>${x.k} · Max Test</b><br>${isEd(x)?`<div class="edit-row">${inp(x.max)}</div>`:x.max+' push-ups in a row'}`:
    `<b>${x.k} · ${x.name} (${VARS[x.v][0]})${x.cam?' 📷':''}</b><br>${isEd(x)?`<div class="edit-row">${x.reps.map(inp).join('')}</div><span class="caption">Reps per set</span>`:x.reps.join(' · ')+' = '+x.total+' reps · felt: '+x.rating}`;
  $('#screen-log').innerHTML='<h2 class="screen-heading">Mission Log</h2>'+(all.length?'<div class="list">'+all.map(x=>`<div class="item">${body(x)}${fix(x)}</div>`).join('')+'</div>':'<p class="note">No missions yet.</p>');
}

function renderStats(){
  const t=S.tests, best=t.length?Math.max(...t.map(x=>x.max)):0, first=t.length?t[0].max:0;
  let chart='<p class="note">Do your first max tests to see a graph.</p>';
  if(t.length>1){
    const W=360,H=170,p=28,mx=Math.max(...t.map(x=>x.max)),mn=Math.min(...t.map(x=>x.max)), rng=Math.max(1,mx-mn);
    const pts=t.map((x,i)=>[p+i*(W-2*p)/(t.length-1), H-p-(x.max-mn)/rng*(H-2*p)]);
    chart=`<svg class="chart" viewBox="0 0 ${W} ${H}"><polyline fill="none" style="stroke:var(--ink)" stroke-width="2" points="${pts.map(q=>q.join(',')).join(' ')}"/>`+
      pts.map((q,i)=>`<circle cx="${q[0]}" cy="${q[1]}" r="4" fill="#b8912b" style="stroke:var(--ink)"/><text x="${q[0]}" y="${q[1]-9}" text-anchor="middle">${t[i].max}</text>`).join('')+'</svg>';
  }
  $('#screen-stats').innerHTML=`<h2 class="screen-heading">Max over time</h2><div class="chart-wrap">${chart}</div>
  <div class="stat-grid"><div class="stat-box"><span class="stat-num">${best}</span><span class="stat-label">Best max</span></div>
  <div class="stat-box"><span class="stat-num">+${S.max-first}</span><span class="stat-label">Since start</span></div>
  <div class="stat-box"><span class="stat-num">${reps(S)}</span><span class="stat-label">Total reps</span></div>
  <div class="stat-box"><span class="stat-num">${t.length}</span><span class="stat-label">Max tests</span></div></div>`;
  $('#screen-stats').innerHTML+=recordsHTML()+calHTML();
}

function renderMedals(){
  $('#screen-medals').innerHTML='<h2 class="screen-heading">Achievements</h2><div class="list">'+MEDALS.map(m=>{ const u=S.medals.includes(m[0]); return `<div class="item ${u?'':'locked'}"><b>${u?'🏅':'🔒'} ${m[0]}</b><br>${m[1]}</div>`; }).join('')+'</div>';
}

function renderManual(){
  $('#screen-manual').innerHTML=`<h2 class="screen-heading">How it works</h2>
  <div class="list"><div class="item">Max test: ${DAYS[S.set.testDay]}. Rest days: ${S.set.rest.map(i=>DAYS[i]).join(', ')||'none'}. Every other day is a mission. You can change this in Settings.</div>
  <div class="item">Workout size is based on your max. After each mission, tell the app if it felt easy, right or hard — the next ones adapt. A new max test resets this.</div>
  <div class="item">As your max grows, harder variations unlock (wide, diamond, decline, archer) with lower rep targets. Easier ones (knee, incline) are used while your max is low.</div>
  <div class="item">Your max test always counts standard push-ups with full range of motion.</div>
  <div class="item">Every mission, rest day and max test earns XP and levels you up, separate from your rank. Every 4th week is a deload week with about 60% volume, so you recover and keep progressing.</div></div>
  <h2 class="screen-heading">Mission types</h2><div class="list">${TYPES.map(t=>`<div class="item"><b>${t[0]}</b><br>${t[4]}</div>`).join('')}</div>
  <h2 class="screen-heading">Ranks</h2><div class="list">${RANKS.map(r=>`<div class="item"><b>${r[1]}</b> — max of ${r[0]}+</div>`).join('')}</div>
  <h2 class="screen-heading">Variations</h2><div class="list">${Object.values(VARS).map(v=>`<div class="item"><b>${v[0]}</b><br>${v[2]}</div>`).join('')}</div>`;
}

function renderSettings(){
  const st=S.set, chip=(on,set,d,t)=>`<button class="chip ${on?'on':''}" data-set="${set}" data-d="${d}">${t}</button>`;
  $('#screen-settings').innerHTML=`<h2 class="screen-heading">Settings</h2><div class="card">
  <div class="eyebrow">Max test day</div><div class="chip-row">${DAYS.map((n,i)=>chip(st.testDay===i,'test',i,n)).join('')}</div>
  <div class="eyebrow" style="margin-top:14px">Rest days (tap to toggle, max 5)</div><div class="chip-row">${DAYS.map((n,i)=>chip(st.rest.includes(i),'rest',i,n)).join('')}</div>
  <div class="eyebrow" style="margin-top:14px">Rest timer length</div><div class="chip-row">${[['Shorter',.75],['Normal',1],['Longer',1.25]].map(r=>chip(st.restMul===r[1],'mul',r[1],r[0])).join('')}</div>
  <div class="eyebrow" style="margin-top:14px">Theme</div><div class="chip-row">${[['Light','light'],['Dark','dark'],['Auto','auto']].map(r=>chip(st.theme===r[1],'theme',r[1],r[0])).join('')}</div>
  <div class="eyebrow" style="margin-top:14px">Default camera view</div><div class="chip-row">${chip(st.view==='side','view','side','Side')}${chip(st.view==='front','view','front','Front')}</div>
  <div class="eyebrow" style="margin-top:14px">Camera counting</div><div class="chip-row">${[['Lenient',15],['Normal',0],['Strict',-10]].map(r=>chip(st.strict===r[1],'strict',r[1],r[0])).join('')}</div>
  <div class="eyebrow" style="margin-top:14px">Options</div><div class="chip-row">${chip(st.deload,'deload','','Deload weeks')}${chip(st.summary,'summary','','Weekly summary')}${chip(st.warmup,'warmup','','Warm-up')}</div></div>
  <div class="card"><div class="eyebrow">Goal: reach a max of</div><div class="edit-row"><input id="goal-t" class="ed-in" style="width:90px" type="number" inputmode="numeric" min="1" placeholder="50" value="${S.goal?S.goal.target:''}"><input id="goal-d" class="ed-in" style="width:160px" type="date" value="${S.goal?S.goal.date:''}"></div><div class="fix"><button class="mini" id="goal-save">Save goal</button><button class="mini" id="goal-clear">Clear goal</button></div></div>
  <p class="note" style="margin-top:14px">Last backup: ${S.backup?daysAgo(S.backup)+' day(s) ago':'never'}. Your data only lives in this browser.</p><button class="btn-primary btn-alt" id="bk-now">Back up now</button>
  <button class="btn-primary btn-alt" id="show-sum">Show last week's summary</button>${devCard()}<button class="btn-primary btn-alt" id="reset-all">Reset all progress</button>`;
}
function weekSummary(force){
  const cm=monday(new Date()), pm=new Date(cm), pe=new Date(cm); pm.setDate(cm.getDate()-7); pe.setDate(cm.getDate()-1);
  const a=dk(pm), z=dk(pe), inR=x=>x.k>=a&&x.k<=z;
  const ms=S.log.filter(inR), ts=S.tests.filter(inR), rs=S.rests.filter(k=>k>=a&&k<=z);
  if(!force && !ms.length && !ts.length && !rs.length) return;
  const lt=ts[ts.length-1], bf=S.tests.filter(t=>t.k<a).pop();
  const cr=ms.reduce((q,x)=>q+x.total,0), pa=new Date(pm), pz=new Date(pm); pa.setDate(pm.getDate()-7); pz.setDate(pm.getDate()-1);
  const pr=S.log.filter(x=>x.k>=dk(pa)&&x.k<=dk(pz)).reduce((q,x)=>q+x.total,0);
  const cmp=pr?` (${cr>=pr?'+':''}${Math.round((cr-pr)/pr*100)}% vs week before)`:'';
  const dr={}; ms.forEach(x=>dr[x.k]=(dr[x.k]||0)+x.total); const bestDay=Math.max(0,...Object.values(dr));
  const line=lt?`Max test: <b>${lt.max}</b>${bf?` (${lt.max>=bf.max?'+':''}${lt.max-bf.max})`:''}`:'No max test last week';
  modal(`<div class="eyebrow">Weekly report</div><div class="title">${a} to ${z}</div><p class="note" style="color:#cdd4de;line-height:1.9">Missions: <b>${ms.length}</b><br>Total reps: <b>${cr}</b>${cmp}<br>Best day: <b>${bestDay}</b> reps<br>Rest days logged: <b>${rs.length}</b><br>${line}<br>Streak: <b>${streak()}</b> · Level <b>${lvl(S.xp)}</b>${isDeload(new Date())?'<br>This week is a <b>deload week</b>: lighter volume, recover well.':''}</p><button class="btn-primary btn-gold" id="ok">Continue</button>`,'navy');
}
function renderAll(){ checkMedals(); save(); renderHome(); renderLog(); renderStats(); renderMedals(); renderManual(); renderSettings(); renderDuel(); applyTheme(); $('#btn-mute').textContent=S.mute?'🔇':'🔊'; }

/* ---------- mission runner ---------- */
let run={};
function startRun(m){ run={m,i:0,done:[],timer:null}; beep(520); renderRun(); }
function renderRun(){
  const {m,i}=run, last=i>=m.reps.length;
  if(last){
    return modal(`<div class="eyebrow">Mission complete</div><div class="title">How did it feel?</div><p class="note">${run.done.join(' · ')} = ${run.done.reduce((a,b)=>a+b,0)} reps</p>
    <div class="rate-row"><button data-r="easy">Too easy</button><button data-r="just right">Just right</button><button data-r="hard">Too hard</button></div>`);
  }
  modal(`<div class="eyebrow">${m.name} · ${VARS[m.v][0]} · Set ${i+1}/${m.reps.length}</div><div class="target">${m.reps[i]}</div>
  <p class="note">${VARS[m.v][2]}${m.tip?' '+m.tip:''}</p>
  <div class="stepper"><button data-a="-1">−</button><input id="actual" type="number" inputmode="numeric" value="${m.reps[i]}"><button data-a="1">+</button></div>
  <button class="btn-primary" id="set-done">Set done</button><button class="btn-primary btn-alt" id="quit">Quit mission</button>`);
}
function startRest(){
  let t=run.m.rest;
  modal(`<div class="eyebrow">Rest</div><div class="target" id="clock">${t}</div><p class="note">Next: set ${run.i+1} of ${run.m.reps.length} — ${run.m.reps[run.i]} reps</p><button class="btn-primary" id="skip">Skip rest</button>`);
  run.timer=setInterval(()=>{ t--; const c=$('#clock'); if(c) c.textContent=t; if(t<=3&&t>0) beep(440,.08); if(t<=0){ clearInterval(run.timer); beep(880,.4); buzz(); renderRun(); } },1000);
}
function finishRun(rating){
  const total=run.done.reduce((a,b)=>a+b,0);
  S.log.push({k:run.m.k,name:run.m.name,v:run.m.v,reps:run.done,total,rating,cam:!!run.cam});
  if(!isDeload(new Date())) S.int=Math.min(1.4,Math.max(.7,+(S.int+(rating==='easy'?.07:rating==='hard'?-.07:0)).toFixed(2)));
  addXp(total+20);
  closeModal(); confetti(); beep(784,.3); vib([60,40,60]); toast('Mission complete: '+total+' reps'); renderAll();
}

/* ---------- max test / setup ---------- */
function startTest(){
  modal(`<div class="eyebrow">Max test</div><div class="title">All-out set</div><p class="note">Standard push-ups, full range, no resting on the floor. How many did you do?</p>
  <div class="stepper"><input id="test-val" type="number" inputmode="numeric" min="1" value="${S.max||''}"></div><button class="btn-primary btn-gold" id="test-save">Save result</button><button class="btn-primary btn-alt" id="test-cancel">Cancel</button>`);
}
function saveTest(n){
  if(!(n>=1)) return toast('Enter a number of 1 or more');
  const old=S.max, oldRank=rankIdx(old), pr=S.tests.length&&n>Math.max(...S.tests.map(x=>x.max));
  S.tests.push({k:dk(new Date()),max:n}); S.max=n; S.int=1; if(!S.start) S.start=dk(new Date()); addXp(50+2*n);
  closeModal(); renderAll();
  if(!old) return;
  if(rankIdx(n)>oldRank){ const r=RANKS[rankIdx(n)]; confetti(); beep(784,.4); modal(`<div style="font-size:3rem">🎖️</div><div class="eyebrow">Promotion</div><div class="title">${r[1]}</div><p class="note" style="color:#cdd4de">New max: ${n}. You have earned the rank of ${r[1]}.</p><button class="btn-primary btn-gold" id="ok">Continue</button>`,'navy'); }
  else if(pr){ confetti(); toast('New personal record: '+n); }
  else toast('Max updated: '+n);
}
function setup(){
  modal(`<div class="eyebrow">Welcome, recruit</div><div class="title">Report your max</div><p class="note">How many standard push-ups can you do in a row right now? Your best honest guess is fine — you test every Sunday.</p>
  <div class="stepper"><input id="test-val" type="number" inputmode="numeric" min="1" placeholder="0"></div><button class="btn-primary btn-gold" id="test-save">Begin</button>`,'');
}


/* ---------- duels ---------- */
const BASE60=[8,14,22,30,38,48,58,68,80];
const TRAITS={sprinter:['⚡','Sprinter','Explodes at the start, fades late'],diesel:['🐢','Diesel','Slow start, strong finish'],burst:['🌊','Burster','Pushes in waves'],steady:['⚖️','Steady','Even pace all the way']};
const FIRST=['Rex','Vex','Kira','Bolt','Nova','Axel','Zed','Mira','Titan','Blitz','Echo','Jinx','Ryder','Onyx','Sable','Dash','Ghost','Hawk','Luna','Pike','Orion','Fang','Juno','Karma'];
const LAST=['Mk2','-9','Prime','Zero','X','Alpha','7','Unit','Omega','Rogue'];
const AVS=['🤖','🦾','👾','🦿','💀','🐺','🦍','🔥','🗿','🦖','🥷','🐻'];
const pick=a=>a[Math.floor(Math.random()*a.length)];
let D=null, offer=[], dsel={T:60,tier:null,bot:null,mode:'cam',view:S.set.view||'side'}, pose=null, vid=null, C=null, cp=null;
function genOffer(tier){   // same 3 bots per tier for the whole day, new ones tomorrow
  let a=hash(dk(new Date())+'-'+tier)*2654435761>>>0;
  const rnd=()=>{ a=(a+0x6D2B79F5)>>>0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  const pk=arr=>arr[Math.floor(rnd()*arr.length)], o=[];
  while(o.length<3){ const name=pk(FIRST)+' '+pk(LAST); if(o.some(b=>b.name===name)) continue; o.push({name,av:pk(AVS),tier,trait:pk(Object.keys(TRAITS)),skill:+(0.85+rnd()*0.3).toFixed(2)}); }
  return o;
}
function botCurve(tr,p){ p=Math.min(1,Math.max(0,p)); return tr==='sprinter'?1-(1-p)**1.8:tr==='diesel'?p**1.5:tr==='burst'?p**.92+.025*Math.sin(8*Math.PI*p):p**.9; }

function renderDuel(){
  const el=$('#screen-duel'); if(!S.max){ el.innerHTML=''; return; }
  const now=new Date(), tk=dk(now), n=S.duels.filter(d=>d.k===tk).length, mt=rankIdx(S.max);
  if(dsel.tier==null||dsel.tier>mt) dsel.tier=mt;
  offer=genOffer(dsel.tier);
  const fought=b=>S.duels.some(d=>d.k===tk&&d.bot===b.name&&d.tier===b.tier);
  if(dsel.bot!=null&&fought(offer[dsel.bot])) dsel.bot=null;
  const chip=(on,k,v,t,dis)=>`<button class="chip ${on?'on':''}" data-dk="${k}" data-dv="${v}" ${dis?'disabled style="opacity:.4"':''}>${t}</button>`;
  const W=S.duels.filter(d=>d.res==='W').length, L=S.duels.filter(d=>d.res==='L').length, Dr=S.duels.filter(d=>d.res==='D').length;
  let h='<h2 class="screen-heading">Duel Arena</h2>';
  if(isRest(now.getDay())) h+='<div class="card"><div class="mission-title">🔒 Rest day</div><p class="note">Duels are locked on rest days. Recover.</p></div>';
  else if(n>=3) h+='<div class="card"><div class="mission-title">Daily limit reached</div><p class="note">3 of 3 duels used today. Come back tomorrow.</p></div>';
  else h+=`<div class="card"><div class="eyebrow">Duels left today: ${3-n}/3</div>
  <div class="eyebrow" style="margin-top:12px">Time</div><div class="chip-row">${[30,45,60,90].map(t=>chip(dsel.T===t,'T',t,t+'s')).join('')}</div>
  <div class="eyebrow" style="margin-top:12px">Bot tier</div><div class="chip-row">${RANKS.map((r,i)=>chip(dsel.tier===i,'tier',i,(i>mt?'🔒 ':'')+r[1],i>mt)).join('')}</div>
  <div class="eyebrow" style="margin-top:12px">Choose your opponent</div><div class="list" style="margin-top:8px">${offer.map((b,i)=>`<button class="item botcard ${dsel.bot===i?'sel':''} ${fought(b)?'locked':''}" data-dk="bot" data-dv="${i}" ${fought(b)?'disabled':''}><b>${b.av} ${b.name}</b> · ${RANKS[b.tier][1]}<br>${TRAITS[b.trait][0]} ${TRAITS[b.trait][1]}: ${TRAITS[b.trait][2]}<br><span class="caption">${fought(b)?'✓ Already fought today. Back tomorrow.':b.skill<.95?'Weaker than usual':b.skill>1.05?'Stronger than usual':'Average for the tier'}</span></button>`).join('')}</div>
  <div class="eyebrow" style="margin-top:12px">Counting</div><div class="chip-row">${chip(dsel.mode==='cam','mode','cam','📷 Camera')}${chip(dsel.mode==='man','mode','man','✍️ Manual entry')}</div>
  ${dsel.mode==='cam'?`<div class="eyebrow" style="margin-top:12px">Camera position</div><div class="chip-row">${chip(dsel.view==='side','view','side','Side view')}${chip(dsel.view==='front','view','front','Front view')}</div><p class="note">Side: phone on the floor, you in profile. Front: phone on the floor in front of you, facing your head and arms.</p>`:''}
  <button class="btn-primary" id="d-start">Start duel</button></div>`;
  h+=`<h2 class="screen-heading">History</h2><div class="stat-grid"><div class="stat-box"><span class="stat-num">${W}</span><span class="stat-label">Wins</span></div><div class="stat-box"><span class="stat-num">${L}</span><span class="stat-label">Losses</span></div><div class="stat-box"><span class="stat-num">${Dr}</span><span class="stat-label">Draws</span></div><div class="stat-box"><span class="stat-num">${S.duels.length}</span><span class="stat-label">Duels</span></div></div>`;
  h+='<div class="list" style="margin-top:12px">'+S.duels.slice(-10).reverse().map(d=>`<div class="item"><b>${d.k} · ${d.res==='W'?'WIN':d.res==='L'?'LOSS':'DRAW'}</b> vs ${d.av} ${d.bot} (${RANKS[d.tier][1]})<br>${d.me} : ${d.bs} in ${d.T}s${d.xp?` · +${d.xp} XP`:''}</div>`).join('')+'</div>';
  el.innerHTML=h;
}

let posePromise=null;
const loadPose=()=>posePromise||(posePromise=_loadPose().catch(e=>{ posePromise=null; throw e; }));
async function _loadPose(){
  if(pose) return pose;
  const V='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
  const M=await import(V+'/vision_bundle.mjs'), fs=await M.FilesetResolver.forVisionTasks(V+'/wasm');
  const o=g=>({baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',delegate:g},runningMode:'VIDEO',numPoses:1});
  try{ pose=await M.PoseLandmarker.createFromOptions(fs,o('GPU')); }catch(e){ pose=await M.PoseLandmarker.createFromOptions(fs,o('CPU')); }
  return pose;
}
async function startCam(){
  const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
  const Q=C||D; if(!Q){ st.getTracks().forEach(t=>t.stop()); return; }
  Q.stream=st; st.getVideoTracks()[0].onended=()=>{ const q=C||D; if(q&&q.failover) q.failover(); };
  vid=$('#d-video'); vid.srcObject=st; await vid.play(); Q.cam=true; camFrame();
}
function stopCam(){ const Q=C||D; if(!Q) return; cancelAnimationFrame(Q.raf); Q.cam=false; if(Q.stream) Q.stream.getTracks().forEach(t=>t.stop()); if(Q.wl) Q.wl.release().catch(()=>{}); }
const ang3=(a,b,c)=>{ const u=[a.x-b.x,a.y-b.y,a.z-b.z], v=[c.x-b.x,c.y-b.y,c.z-b.z], m=Math.hypot(...u)*Math.hypot(...v); return m?Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1]+u[2]*v[2])/m)))*180/Math.PI:null; };
function qsay(Q,t){ Q.hint=t; clearTimeout(Q.ht); Q.ht=setTimeout(()=>{ Q.hint=''; setMsg(''); },2500); setMsg(t); }
function setMsg(t){ const m=$('#d-msg'); if(m&&m.textContent!==t) m.textContent=t; }
function camFrame(){
  const Q=C||D; if(!Q||!Q.cam) return;
  if(!Q.paused && vid.readyState>=2 && vid.currentTime!==Q.lt){
    Q.lt=vid.currentTime; let r=null;
    try{ r=pose.detectForVideo(vid,performance.now()); Q.err=0; }catch(e){ Q.err=(Q.err||0)+1; if(Q.err>=20&&Q.failover) return Q.failover(); }
    handlePose(r);
  }
  Q.raf=requestAnimationFrame(camFrame);
}
function handlePose(r){
  const Q=C||D, cv=$('#d-canvas'); if(!cv||!Q) return; const cx=cv.getContext('2d'); cv.width=vid.videoWidth; cv.height=vid.videoHeight;
  const L=r&&r.landmarks&&r.landmarks[0], W=r&&r.worldLandmarks&&r.worldLandmarks[0];
  if(!L||!W) return setMsg('No body found. Step back so your head and arms are in frame.');
  const ARMS=[[11,13,15],[12,14,16]];
  cx.strokeStyle='#b8912b'; cx.lineWidth=5;
  ARMS.forEach(a=>{ cx.beginPath(); a.forEach((i,j)=>{ const x=L[i].x*cv.width, y=L[i].y*cv.height; j?cx.lineTo(x,y):cx.moveTo(x,y); }); cx.stroke(); });
  const vis=ARMS.filter(a=>a.every(i=>L[i].visibility>.5));
  if(!vis.length) return setMsg('Arms not visible. Adjust the camera.');
  setMsg(Q.running?(Q.hint||''):'Body detected ✓ Ready when you are');
  const an=vis.map(t=>ang3(W[t[0]],W[t[1]],W[t[2]])).filter(x=>x!=null); if(!an.length) return;
  // shoulder height (px) and body scale: a real push-up moves the whole body, bending only the arms does not
  const sm=[(L[11].x+L[12].x)/2*cv.width,(L[11].y+L[12].y)/2*cv.height];
  const sw=Math.hypot((L[11].x-L[12].x)*cv.width,(L[11].y-L[12].y)*cv.height);
  const hipsOk=L[23].visibility>.5&&L[24].visibility>.5;
  const tl=hipsOk?Math.hypot((L[23].x+L[24].x)/2*cv.width-sm[0],(L[23].y+L[24].y)/2*cv.height-sm[1]):0;
  const scale=Math.max(sw,tl,1);
  Q.sy=Q.sy==null?sm[1]:Q.sy*.5+sm[1]*.5;
  const cur=Q.v==='archer'?Math.min(...an):an.reduce((p,q)=>p+q,0)/an.length;   // archer: the arm that bends most
  Q.ang=Q.ang==null?cur:Q.ang*.5+cur*.5;
  const down=(Q.view==='front'?115:100)+S.set.strict, up=150;
  if(!Q.dip&&Q.st==='up'&&Q.ang>=150) Q.sUp=Q.sy;   // shoulder height with arms straight
  if(Q.ang<135&&!Q.dip){ Q.dip=true; Q.sMin=Q.sMax=Q.sUp==null?Q.sy:Q.sUp; if(Q.running&&Q.st==='up'&&Q.onDescent) Q.onDescent(); }
  if(Q.dip){ Q.sMin=Math.min(Q.sMin,Q.sy); Q.sMax=Math.max(Q.sMax,Q.sy); Q.sc=scale; }
  if(Q.st==='up'&&Q.ang<down){ Q.st='down'; if(Q.running&&Q.onBottom) Q.onBottom(); }
  else if(Q.ang>up){
    if(Q.st==='down'){
      Q.st='up'; Q.dip=false;
      const moved=(Q.sMax-Q.sMin)/(Q.sc||1)>=0.22-S.set.strict*0.004;   // shoulders must travel; Lenient is less demanding
      if(Q.running){ if(moved){ if(Q===D) onRep(); else Q.onRep(); } else { qsay(Q,'Move your whole body, not just your arms.'); beep(300,.15); } }
    }
    else if(Q.dip){ Q.dip=false; if(Q.running&&Q.shallow) Q.shallow(); }   // went down a bit but not low enough
  }
}
function onRep(){
  const t=performance.now(); if(D.lastRep&&t-D.lastRep>3000) D.cur=0;
  D.cur++; D.best=Math.max(D.best,D.cur); D.lastRep=t; D.reps++; beep(1568,.06); vib(12); updScores();
}
function updScores(){
  const me=$('#d-me'); if(!me) return;
  me.textContent=D.mode==='cam'?D.reps:'–'; $('#d-bot').textContent=D.bs;
  const sc=Math.max(D.botFinal,D.reps,1);
  $('#bar-me').style.width=(D.reps/sc*100)+'%'; $('#bar-bot').style.width=(D.bs/sc*100)+'%';
}
function buildDuelUI(){
  modal(`<div class="duel-top"><div class="eyebrow" id="d-state">Get ready</div><div class="big-num" id="d-time">${D.T}</div></div>
  <div class="cam-wrap ${D.mode==='cam'?'':'hidden'}" id="d-cam"><video id="d-video" playsinline muted></video><canvas id="d-canvas"></canvas><div class="cam-msg" id="d-msg"></div><div class="count-over hidden" id="d-count"></div></div>
  ${D.mode==='cam'?'':'<div class="count-over hidden" id="d-count" style="position:static;height:120px;background:none;color:var(--ink)"></div><p class="note">Count your push-ups yourself. You will enter the number at the end.</p>'}
  <div class="duel-score"><div>YOU<b id="d-me">0</b></div><div>${D.bot.av} ${D.bot.name}<b id="d-bot">0</b></div></div>
  <div class="vs-bar"><i id="bar-me" style="background:var(--recruit);width:0"></i><i id="bar-bot" style="background:var(--beast);width:0"></i></div>
  <div id="d-actions"></div>`,'duel');
  updScores();
}
async function startDuel(){
  const bot=offer[dsel.bot]; if(!bot) return toast('Pick an opponent first');
  if(S.duels.some(d=>d.k===dk(new Date())&&d.bot===bot.name&&d.tier===bot.tier)) return toast('You already fought this bot today');
  D={T:dsel.T,bot,mode:dsel.mode,view:dsel.view,total:BASE60[bot.tier]*bot.skill*(dsel.T/60)**.85,reps:0,bs:0,best:0,cur:0,lastRep:0,ang:null,st:'up',lt:-1,lb:0};
  D.botFinal=Math.floor(D.total);
  buildDuelUI();
  if(D.mode==='cam'){
    setMsg('Loading camera and model…');
    try{ await loadPose(); await startCam(); }catch(e){ if(!D) return; toast('Camera unavailable. Switched to manual entry.'); D.mode='man'; buildDuelUI(); }
  }
  if(!D) return;
  $('#d-state').textContent=D.mode==='cam'?'Frame yourself':'Get ready';
  $('#d-actions').innerHTML='<button class="btn-primary btn-gold" id="d-ready">Start countdown</button><button class="btn-primary btn-alt" id="d-cancel">Cancel</button>';
}
function beginCountdown(){
  $('#d-actions').innerHTML=''; const c=$('#d-count'); c.classList.remove('hidden'); let n=3;
  const tick=()=>{ if(!D) return;
    if(n>0){ c.textContent=n; beep(520,.15); n--; D.cd=setTimeout(tick,1000); }
    else { c.textContent='GO!'; beep(880,.4); buzz(); setTimeout(()=>c.classList.add('hidden'),700); runDuel(); } };
  tick();
}
function runDuel(){
  D.running=true; D.t0=performance.now(); $('#d-state').textContent='GO!';
  try{ if(navigator.wakeLock) navigator.wakeLock.request('screen').then(w=>D.wl=w).catch(()=>{}); }catch(e){}
  $('#d-actions').innerHTML='<button class="btn-primary btn-alt" id="d-quit">Quit duel</button>';
  D.iv=setInterval(()=>{
    const e=(performance.now()-D.t0)/1000, left=Math.max(0,D.T-e);
    $('#d-time').textContent=Math.ceil(left);
    D.bs=Math.min(D.botFinal,Math.floor(D.total*botCurve(D.bot.trait,e/D.T))); updScores();
    if(left>0&&left<=5&&Math.ceil(left)!==D.lb){ D.lb=Math.ceil(left); beep(700,.08); }
    if(left<=0) endDuel();
  },100);
}
function endDuel(){
  clearInterval(D.iv); D.running=false; const cam=D.mode==='cam'; stopCam(); beep(400,.5); buzz();
  D.bs=D.botFinal; updScores(); $('#d-state').textContent="Time's up";
  $('#d-actions').innerHTML=`<p class="note">${cam?'Camera counted '+D.reps+'. Adjust if it was wrong.':'How many push-ups did you do?'}</p>
  <div class="stepper"><button data-a="-1">−</button><input id="actual" type="number" inputmode="numeric" min="0" value="${cam?D.reps:''}"><button data-a="1">+</button></div>
  ${cam?'':'<div class="check-list"><label style="text-align:left"><input type="checkbox" id="nopause"> I never paused longer than 3 s (needed to update my max)</label></div>'}
  <button class="btn-primary" id="d-confirm">Confirm result</button>`;
}
function abortDuel(){ if(D){ clearInterval(D.iv); clearTimeout(D.cd); stopCam(); } D=null; closeModal(); renderAll(); }
function confirmDuel(){
  const me=Math.max(0,+$('#actual').value||0), cam=D.mode==='cam';
  const best=cam?Math.min(D.best,me):($('#nopause').checked?me:0);
  const bf=D.botFinal, win=me>bf, draw=me===bf, mt=rankIdx(S.max);
  const xp=win?Math.max(8,60+25*(D.bot.tier-mt)):0;
  D.newMax=best>S.max?best:0;
  S.duels.push({k:dk(new Date()),T:D.T,bot:D.bot.name,av:D.bot.av,tier:D.bot.tier,mt,me,bs:bf,res:win?'W':draw?'D':'L',xp});
  if(xp) addXp(xp);
  save();
  modal(`<div class="eyebrow">Duel vs ${D.bot.av} ${D.bot.name}</div><div class="stamp ${win?'win':'lose'}" style="margin:12px 0">${win?'VICTORY':draw?'DRAW':'DEFEAT'}</div>
  <div class="big-num" style="margin:14px 0">${me} : ${bf}</div>
  <p class="note">${win?`+${xp} XP for beating a ${RANKS[D.bot.tier][1]} bot`:draw?'A tie is not a win.':'No penalty. Come back stronger.'}${D.newMax?`<br><b>New max: ${D.newMax}!</b>`:''}</p>
  <button class="btn-primary btn-gold" id="duel-done">Continue</button>`);
  if(win){ confetti(); beep(784,.4); }
}


/* ---------- camera counting for missions and max test ---------- */
let mc={};
function chooseMode(kind,m){ mc={kind,m,mode:S.set.cMode||'cam',view:S.set.view||'side'}; renderChoose(); }
function renderChoose(){
  const ch=(on,k,v,t)=>`<button class="chip ${on?'on':''}" data-mc="${k}" data-mv="${v}">${t}</button>`;
  modal(`<div class="eyebrow">${mc.kind==='test'?'Max test':'Mission'}</div><div class="title">How do you want to count?</div>
  <div class="chip-row" style="justify-content:center">${ch(mc.mode==='cam','mode','cam','📷 Camera')}${ch(mc.mode==='man','mode','man','✍️ Manual')}</div>
  ${mc.mode==='cam'?`<div class="eyebrow" style="margin-top:14px">Camera position</div><div class="chip-row" style="justify-content:center">${ch(mc.view==='side','view','side','Side view')}${ch(mc.view==='front','view','front','Front view')}</div><p class="note">Side: phone on the floor, you in profile. Front: phone on the floor facing your head and arms.${mc.m&&mc.m.v==='archer'?' Archer counting may be less reliable.':''}</p>`:''}
  <button class="btn-primary btn-gold" id="mc-go">Continue</button><button class="btn-primary btn-alt" id="mc-cancel">Cancel</button>`);
}
function mcGo(){
  S.set.cMode=mc.mode; save(); const {kind,m,mode,view}=mc;
  if(mode==='cam'){ cp=loadPose().catch(()=>null); warmUp(()=>beginC(kind,m,view)); }   // model loads during the warm-up
  else warmUp(kind==='test'?startTest:()=>startRun(m));
}
const hint=t=>{ C.hint=t; clearTimeout(C.ht); C.ht=setTimeout(()=>{ if(C){ C.hint=''; setMsg(''); } },2500); setMsg(t); };
const metro=l=>{ if(!C) return; (C.mt||[]).forEach(clearTimeout); C.mt=l.map(([d,f])=>setTimeout(()=>beep(f,.08),d)); };
function buildCUI(){
  modal(`<div class="duel-top"><div class="eyebrow" id="c-state"></div></div>
  <div class="cam-wrap" id="d-cam"><video id="d-video" playsinline muted></video><canvas id="d-canvas"></canvas><div class="cam-msg" id="d-msg"></div></div>
  <div class="duel-score"><div><span id="c-lbl">COUNT</span><b id="c-count">0</b></div><div><span id="c-tl">TARGET</span><b id="c-tgt">–</b></div></div>
  <div id="c-actions"></div>`,'duel');
}
async function beginC(kind,m,view){
  C={kind,m,view,v:m&&m.v,mode:'cam',phase:'frame',i:0,done:[],reps:0,hit:0,lastRep:0,st:'up',dip:false,ang:null,lt:-1,cam:false};
  C.onRep=cRep; C.shallow=()=>{ hint('Too shallow. Go lower.'); beep(300,.15); }; C.failover=cFail;
  if(m&&m.name==='Tempo') C.onDescent=()=>metro([[1000,700],[2000,700],[3000,1100]]);
  if(m&&m.name==='Pause') C.onBottom=()=>metro([[1000,700],[2000,1100]]);
  buildCUI(); cUI(); setMsg('Loading camera and model…');
  try{ await loadPose(); await startCam(); }catch(e){ if(!C) return; toast('Camera unavailable. Switched to manual entry.'); cFail(); }
}
function cFail(){
  if(!C||C.mode==='man') return;
  stopCam(); C.mode='man'; C.running=false; const w=$('#d-cam'); if(w) w.classList.add('hidden'); toast('Camera lost. Continuing with manual entry.'); cUI();
}
function cUI(){
  const el=$('#c-actions'); if(!el||!C) return; const m=C.m, test=C.kind==='test', ph=C.phase, man=C.mode==='man';
  $('#c-state').textContent=ph==='frame'?'Frame yourself':ph==='rest'?'Rest':test?'Max test':`Set ${C.i+1}/${m.reps.length} · ${VARS[m.v][0]}`;
  $('#c-lbl').textContent=ph==='rest'?'REST':'COUNT';
  $('#c-count').textContent=ph==='rest'?C.left:C.reps;
  $('#c-tl').textContent=test?'MAX TEST':ph==='rest'?'NEXT SET':'TARGET';
  $('#c-tgt').textContent=test?'–':m.reps[ph==='rest'?C.i+1:C.i];
  const quit='<button class="btn-primary btn-alt" id="c-quit">Quit</button>';
  el.innerHTML=ph==='frame'?`<button class="btn-primary btn-gold" id="c-start">${test?'Start max test':'Start set 1'}</button>${quit}`:
    ph==='rest'?`<button class="btn-primary" id="c-skiprest">Skip rest</button>${quit}`:
    test?`<button class="btn-primary btn-gold" id="c-stop" style="padding:28px;font-size:1.2rem">STOP</button>${quit}`:
    man?`<div class="stepper"><button data-a="-1">−</button><input id="actual" type="number" inputmode="numeric" min="0" value="${C.reps||m.reps[C.i]}"><button data-a="1">+</button></div><button class="btn-primary" id="c-setdone-man">Set done</button>${quit}`:
    `<button class="btn-primary btn-alt" id="c-setdone">Set done</button>${quit}`;
}
function cStart(){
  C.phase='set'; C.running=true; C.paused=false; C.reps=0; C.hit=0; C.lastRep=performance.now(); beep(520,.2);
  try{ if(navigator.wakeLock) navigator.wakeLock.request('screen').then(w=>C.wl=w).catch(()=>{}); }catch(e){}
  clearInterval(C.iv); C.iv=setInterval(cTick,250); cUI(); if(C.kind==='mission') hint('Start when you are ready');
}
function cRep(){
  const t=performance.now(); C.reps++; C.lastRep=t; beep(1568,.06); vib(12); $('#c-count').textContent=C.reps;
  if(C.kind==='mission'&&C.reps===C.m.reps[C.i]){ C.hit=t; beep(880,.3); hint('Target reached! Keep going or rest.'); }
}
function cTick(){
  if(!C||C.phase!=='set'||C.mode!=='cam'||C.kind==='test') return;
  const now=performance.now(), tg=C.m.reps[C.i];
  if(C.reps>=tg&&now-Math.max(C.lastRep,C.hit)>5000) endSet();            // target reached, 5 s without another rep
  else if(C.reps>=1&&C.reps<tg&&now-C.lastRep>15000) endSet();            // fell short, 15 s without a rep
}
function endSet(n){
  if(!C||C.phase!=='set') return;
  const cam=C.mode==='cam'; if(cam) C.cam=true;
  C.done.push(cam?C.reps:Math.max(0,Math.round(+n||0))); C.running=false; beep(600,.15); vib(25);
  if(C.i+1>=C.m.reps.length) return cReview();
  C.phase='rest'; C.paused=true; C.left=C.m.rest; cUI();
  clearInterval(C.rt); C.rt=setInterval(()=>{ C.left--; const e=$('#c-count'); if(e) e.textContent=C.left; if(C.left<=3&&C.left>0) beep(440,.08); if(C.left<=0) cNext(); },1000);
}
function cNext(){
  clearInterval(C.rt); C.i++; C.reps=0; C.hit=0; C.lastRep=performance.now(); C.st='up'; C.dip=false; C.hint='';
  C.phase='set'; C.paused=false; C.running=C.mode==='cam'; beep(880,.4); buzz(); cUI();
}
function cReview(){
  stopCam(); clearInterval(C.iv); clearInterval(C.rt);
  modal(`<div class="eyebrow">Review</div><div class="title">Your sets</div><p class="note">${C.cam?'Counted by camera. ':''}Correct any set if needed.</p><div class="edit-row" style="justify-content:center">${C.done.map(v=>`<input type="number" inputmode="numeric" min="0" class="ed-in" value="${v}">`).join('')}</div><button class="btn-primary btn-gold" id="c-confirm">Confirm</button>`);
}
function cConfirm(){
  const v=[...document.querySelectorAll('#modal-panel .ed-in')].map(e=>Math.max(0,Math.round(+e.value)||0));
  run={m:C.m,i:C.m.reps.length,done:v,timer:null,cam:C.cam}; C=null; renderRun();
}
function endTestC(){
  const n=C.reps; stopCam(); clearInterval(C.iv); C=null;
  modal(`<div class="eyebrow">Max test</div><div class="title">Result</div><p class="note">Camera counted ${n}. Correct it if needed.</p><div class="stepper"><input id="test-val" type="number" inputmode="numeric" min="1" value="${n||''}"></div><button class="btn-primary btn-gold" id="test-save">Save result</button><button class="btn-primary btn-alt" id="test-cancel">Cancel</button>`);
}
function abortC(){ if(C){ stopCam(); clearInterval(C.iv); clearInterval(C.rt); (C.mt||[]).forEach(clearTimeout); } C=null; closeModal(); renderAll(); }

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.screen){ document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===b)); document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id==='screen-'+b.dataset.screen)); return; }
  if(b.dataset.dev){ const v=b.dataset.dev;   // DEV
    if(v==='unlock') return devUnlock($('#dev-code').value);
    if(v==='lock'){ try{ localStorage.removeItem('ascent-dev-on'); localStorage.removeItem('ascent-dev-offset'); }catch(e){} return location.reload(); }
    if(v==='reset') return devSet(0); if(v==='plus') return devSet(DEV_OFF+864e5); if(v==='minus') return devSet(DEV_OFF-864e5);
    const val=$('#dev-date').value; if(!val) return; const n=new Date(), p=x=>String(x).padStart(2,'0');
    return devSet(new RealDate(val+'T'+p(n.getHours())+':'+p(n.getMinutes())+':00')-RealDate.now()); }
  if(b.dataset.mc){ mc[b.dataset.mc]=b.dataset.mv; return renderChoose(); }
  if(b.dataset.cal){ cal.m+=+b.dataset.cal; if(cal.m<0){ cal.m=11; cal.y--; } if(cal.m>11){ cal.m=0; cal.y++; } return renderStats(); }
  if(b.dataset.fix) return fixEntry(b.dataset.t,+b.dataset.i,b.dataset.fix);
  if(b.dataset.dk){ const k=b.dataset.dk, v=b.dataset.dv; dsel[k]=(k==='mode'||k==='view')?v:+v; if(k==='tier'){ dsel.bot=null; offer=genOffer(dsel.tier); } return renderDuel(); }
  if(b.dataset.set){ const k=b.dataset.set, d=+b.dataset.d, r=S.set.rest;
    if(k==='test'){ if(r.includes(d)) return toast('Pick a day that is not a rest day'); S.set.testDay=d; }
    else if(k==='rest'){ if(d===S.set.testDay) return toast('That is your test day'); if(r.includes(d)) r.splice(r.indexOf(d),1); else if(r.length<5) r.push(d); else return toast('Max 5 rest days'); }
    else if(k==='mul') S.set.restMul=d; else if(k==='strict') S.set.strict=d; else if(k==='theme') S.set.theme=b.dataset.d; else if(k==='view'){ S.set.view=b.dataset.d; dsel.view=b.dataset.d; } else S.set[k]=!S.set[k];
    return renderAll(); }
  if(b.dataset.a){ const i=$('#actual'); i.value=Math.max(0,(+i.value||0)+ +b.dataset.a); return; }
  if(b.dataset.r) return finishRun(b.dataset.r);
  switch(b.id){
    case 'set-done': run.done.push(Math.max(0,+$('#actual').value||0)); run.i++; beep(600,.1); vib(25); run.i>=run.m.reps.length?renderRun():startRest(); break;
    case 'skip': clearInterval(run.timer); renderRun(); break;
    case 'quit': if(confirm('Quit this mission? Progress for today will not be saved.')) closeModal(); break;
    case 'test-save': saveTest(+$('#test-val').value); break;
    case 'test-cancel': case 'ok': closeModal(); break;
    case 'd-start': startDuel(); break;
    case 'd-ready': beginCountdown(); break;
    case 'd-cancel': abortDuel(); break;
    case 'd-quit': if(confirm('Quit this duel? It will not count.')) abortDuel(); break;
    case 'd-confirm': confirmDuel(); break;
    case 'duel-done': { const n=D&&D.newMax; D=null; if(n) saveTest(n); else { closeModal(); renderAll(); } break; }
    case 'show-sum': weekSummary(true); break;
    case 'reset-all': if(confirm('Delete ALL progress? Save a backup first if unsure.')){ S=fresh(); S.xp=0; renderAll(); setup(); } break;
    case 'btn-mute': S.mute=!S.mute; renderAll(); break;
    case 'btn-save': doBackup(); break;
    case 'bk-now': doBackup(); closeModal(); break;
    case 'wu-next': wuAdvance(); break;
    case 'wu-skip': clearInterval(wu.iv); wu.cb(); break;
    case 'goal-save': { const n=Math.round(+$('#goal-t').value), d=$('#goal-d').value; if(!(n>S.max)||!d||d<dk(new Date())) return toast('Pick a target above your max and a date in the future'); S.goal={target:n,date:d,from:S.max}; renderAll(); toast('Goal saved'); break; }
    case 'goal-clear': S.goal=null; renderAll(); break;
    case 'mc-go': mcGo(); break;
    case 'mc-cancel': closeModal(); break;
    case 'c-start': cStart(); break;
    case 'c-setdone': endSet(); break;
    case 'c-setdone-man': endSet(+$('#actual').value); break;
    case 'c-skiprest': cNext(); break;
    case 'c-stop': endTestC(); break;
    case 'c-confirm': cConfirm(); break;
    case 'c-quit': if(confirm('Quit? Progress for this session will not be saved.')) abortC(); break;
    case 'bk-later': closeModal(); break;
    case 'go-skip': if(confirm('Skip today? Your streak stays safe and the next missions ease back in.')){ S.skips.push(dk(new Date())); S.int=Math.max(.7,+(S.int*.95).toFixed(2)); vib(40); renderAll(); toast('Day skipped. Rest up.'); } break;
    case 'undo-skip': S.skips=S.skips.filter(k=>k!==dk(new Date())); renderAll(); break;
    case 'btn-load': $('#file-load').click(); break;
  }
});
$('#file-load').addEventListener('change',e=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ try{ const d=JSON.parse(r.result); if(!d.tests||!d.log) throw 0; S=norm(d); renderAll(); toast('Progress loaded'); }catch(x){ toast('Not a valid progress file'); } };
  r.readAsText(f); e.target.value='';
});

/* ---------- start ---------- */
(function init(){
  const last=[...S.log,...S.tests].map(x=>x.k).sort().pop();
  if(last && (new Date()-new Date(last))/864e5>7) S.int=Math.min(S.int,.9);   // ease back in after a long break
  if(S.xp==null) S.xp=S.log.reduce((a,x)=>a+x.total+20,0)+S.tests.reduce((a,t)=>a+50+2*t.max,0)+S.rests.length*10;
  if(!S.start) S.start=[...S.log,...S.tests].map(x=>x.k).sort()[0]||null;
  renderAll();
  if(!S.max) setup();
  else { const cm=dk(monday(new Date())); if(S.sumSeen!==cm){ if(S.set.summary) weekSummary(); S.sumSeen=cm; save(); } }
  if(S.max&&$('#modal').classList.contains('hidden')) backupNudge();
})();

if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
})();
