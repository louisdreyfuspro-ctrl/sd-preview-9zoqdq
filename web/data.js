/* StrydeUp desktop web app, the sample data.
   The SAME generators, seeds and lists as the mobile pages (Etape 2 - Home Pro.html), so a number on the
   computer is the number on the phone for the same account and horse. plan.js decides the account and which
   horses it sees (planHorses, SD_VFIX, SD_XALERTS...), exactly as on mobile. Do not change a seed or a list here
   without changing the mobile pages too: web/check-parity.py compares both. */
(function(){
  const D=window.SD_DATA={};
  const PLAN=window.SD_PLAN||'pro';
  D.TODAY=new Date(2026,8,30);
  D.MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  D.DAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  /* ---------- the demo stable: 5 horses, a performance score per session ---------- */
  const HORSES=[
    {id:'mb', n:'Midnight Bolt', r:'John Doe',     ini:'MB', perf:70, d:+4, level:'1.50 m', lastD:0},
    {id:'qz', n:'Quintus Z',     r:'Marie S.',     ini:'QZ', perf:76, d:+2, level:'1.45 m', lastD:1},
    {id:'bd', n:'Bella Donna',   r:'Lea Martin',   ini:'BD', perf:73, d:+6, level:'1.40 m', lastD:3},
    {id:'sa', n:'Silver Arrow',  r:'John Doe',     ini:'SA', perf:64, d:-3, level:'1.35 m', lastD:4},
    {id:'nl', n:'Nova de Lys',   r:'Marie S.',     ini:'NL', perf:61, d:-1, level:'1.30 m', lastD:6}];
  /* the account decides which horses are here (plan.js): Premium one horse, a rider only theirs, a vet their stables */
  window.SD_ALLH=HORSES.slice(); HORSES.splice(0,HORSES.length,...planHorses(window.SD_ALLH));
  D.ALL=HORSES.slice();          /* every horse of the account (all stables) */
  D.HORSES=HORSES;               /* the horses shown now (a vet's stable filter narrows it) */
  D.hist=function(h,n){ let seed=[...h.id].reduce((a,c)=>(a*31+c.charCodeAt(0))%233280,7); const rnd=()=>{seed=(seed*9301+49297)%233280; return seed/233280;};
    const out=[]; let v=h.perf-h.d*3-4+rnd()*4; for(let i=0;i<n;i++){ v+= (h.perf-v)/(n-i)+ (rnd()-.5)*5; out.push(i===n-1?h.perf:Math.round(v)); } return out; };
  const seedOf=x=>[...x].reduce((a,c)=>(a*31+c.charCodeAt(0))%233280,7);
  D.rng=function(x){ let seed=seedOf(x); return ()=>{seed=(seed*9301+49297)%233280; return seed/233280;}; };
  const WHAT_T=['Course','Grid work','Jumping','Flatwork'], WHAT_S=['1.30 m','1.35 m','1.40 m','1.45 m','1.50 m'], VEN=['Lier','Opglabbeek','Valkenswaard','Chantilly'];
  D.sessionsOf=function(h){ const rnd=D.rng(h.id+'s'), n=26, sc=D.hist(h,n), out=[]; let day=h.lastD;
    for(let i=n-1;i>=0;i--){ const d=new Date(D.TODAY); d.setDate(d.getDate()-day); const show=rnd()<.35;
      const ht=show?WHAT_S[Math.floor(rnd()*5)]:null, ven=show?VEN[Math.floor(rnd()*4)]:null;
      out.push({h, date:d, show, what:show?ht+', '+ven:WHAT_T[Math.floor(rnd()*4)], ht, ven, sc:sc[i]}); day+=3+Math.floor(rnd()*6); }
    return out; };
  D.when=d=>{ const a=Math.round((D.TODAY-d)/864e5); return a===0?'Today':a===1?'Yesterday':`${D.DAY[d.getDay()]} ${d.getDate()} ${D.MON[d.getMonth()]}`; };
  D.durOf=x=>{ const t=x.show?70+(x.sc*7)%40:200+(x.sc*13)%220; return Math.floor(t/60)+':'+String(t%60).padStart(2,'0'); };
  /* every session of the horses shown, newest first: deleted videos out, moved ones on their right horse (plan.js) */
  D.sessions=function(visible){ const V=visible||HORSES;
    return (window.SD_VFIX?SD_VFIX((window.SD_ALLH||V).flatMap(D.sessionsOf),V):V.flatMap(D.sessionsOf)).sort((a,b)=>b.date-a.date); };
  D.scoreTone=p=>p>=70?'good':p>=55?'watch':'bad';
  /* ---------- active alerts ---------- */
  const ALERTS=[
    {h:'Midnight Bolt', ini:'MB', lv:'Attention', ic:'hind', a:'Left hind under load', b:'Same pattern on the last 3 sessions. Worth a look before the next start.', when:'Today · session'},
    {h:'Silver Arrow', ini:'SA', lv:'Watch', ic:'latbal', a:'Landings getting heavier', b:'Balance on landing down 8 points over 2 weeks.', when:'Sat 26 Sep · show'},
    {h:'Nova de Lys', ini:'NL', lv:'Watch', ic:'tempo', a:'Tempo fading at the end', b:'Loses pace on the last line of the course, 3 sessions in a row.', when:'Thu 24 Sep · training'},
    {h:'Midnight Bolt', ini:'MB', lv:'Watch', ic:'swap', a:'Late lead change in turns', b:'Held the counter lead 4 strides before the change, turn 4.', when:'Today · session'},
    {h:'Quintus Z', ini:'QZ', lv:'Watch', ic:'swap', a:'Cross canter after combinations', b:'Twice in the last show, both after the double.', when:'Yesterday · show'},
    {h:'Silver Arrow', ini:'SA', lv:'Attention', ic:'stride', a:'Right fore short on landing', b:'Stride after landing shorter on the right, 4 jumps of 12.', when:'Sat 26 Sep · show'},
    {h:'Bella Donna', ini:'BD', lv:'Watch', ic:'tempo', a:'Rushing the last fences', b:'Tempo up 30 m/min on the final line.', when:'Sun 27 Sep · training'}];
  (window.SD_XALERTS||[]).forEach(x=>{ const h=HORSES.find(y=>y.id===x.id); if(h) ALERTS.push({h:h.n,ini:h.ini,lv:x.lv,ic:x.ic,a:x.a,b:x.b,when:x.when}); });
  ALERTS.splice(0,ALERTS.length,...ALERTS.filter(a=>HORSES.some(h=>h.n===a.h)&&(PLAN!=='farrier'||['hind','stride','latbal'].includes(a.ic))));
  D.ALL_ALERTS=ALERTS.slice();
  D.alerts=(visible)=>{ const V=visible||HORSES; return D.ALL_ALERTS.filter(a=>V.some(h=>h.n===a.h)).sort((a,b)=>(a.lv==='Attention'?0:1)-(b.lv==='Attention'?0:1)); };
  /* the alert opens its session on Things to watch, the alert highlighted (same hash as mobile) */
  D.alertHash=x=>'#watch='+encodeURIComponent(JSON.stringify({h:x.h,r:(D.ALL.find(h=>h.n===x.h)||{}).r,lv:x.lv,a:x.a,b:x.b,ic:x.ic}));
  /* ---------- the failed upload ---------- */
  D.ERR={horse:'Nova de Lys', when:'Today, 09:12', dur:'2:45', kind:'Training',
    reason:'The horse leaves the frame too often',
    plain:'We lost sight of the horse for about 40% of the round, mostly in the corners, so the strides and jumps could not be measured.',
    fix:['Film from a spot where you can see the whole arena, a corner or a raised place works best.','Keep the phone horizontal and follow the horse smoothly, without zooming.','Make sure the whole horse, from ears to hooves, stays in the picture.']};
  D.errShown=()=>HORSES.some(h=>h.n==='Nova de Lys')&&!(window.SD_MYIDS&&!SD_MYIDS.includes('nl'));
  /* ---------- the Stable Owner: team and activity ---------- */
  D.TEAM=[{n:'Marie S.',ini:'M',role:'You · owner',hs:['qz','nl']},{n:'John Doe',ini:'JD',role:'Rider',hs:['mb','sa']},{n:'Lea Martin',ini:'LM',role:'Rider',hs:['bd']},
    {n:'Paul Girard',ini:'PG',role:'Groom',hs:[]},{n:'Dr. Anne Keller',ini:'AK',role:'Vet',hs:['mb','sa']},{n:'Lucas Bernard',ini:'LB',role:'Farrier',hs:['mb','qz','bd','sa','nl']}];
  D.ACT=[['LM','Lea Martin','added a video','Bella Donna · Course','2 h ago','session'],['JD','John Doe','got an alert','Midnight Bolt · Left hind under load','3 h ago','session'],
    ['PG','Paul Girard','logged a farrier visit','Quintus Z','Yesterday','qz'],['AK','Dr. Anne Keller','left a note','Silver Arrow · Check-up','Sat 26 Sep','sa']];
  /* a rider in the trends and the chart filter = the average of the horses they ride */
  D.RIDERS=()=>D.TEAM.filter(p=>/Rider|owner/i.test(p.role)&&p.hs.length).map(p=>{ const hs=D.ALL.filter(h=>p.hs.includes(h.id));
    return {id:'r_'+p.ini, n:p.n, ini:p.ini, _rider:p, _hs:hs, perf:Math.round(hs.reduce((a,h)=>a+h.perf,0)/hs.length), d:Math.round(hs.reduce((a,h)=>a+h.d,0)/hs.length), level:''}; });
  /* ---------- notifications (the bell), read state shared with the phone ---------- */
  const NT=[
    {id:'n1', day:'Today', ic:'play-circle', tone:'blue', a:'Analysis ready', b:'Midnight Bolt · Course. Performance 70%, a good session.', m:'12 min ago', go:'session'},
    {id:'n2', day:'Today', ic:'danger-triangle', tone:'bad', a:'New alert · Attention', b:'Midnight Bolt. Left hind under load, same pattern on the last 3 sessions.', m:'12 min ago', alert:0},
    {id:'n3', day:'Today', ic:'danger-triangle', tone:'bad', a:"A video couldn't be analysed", b:'Nova de Lys. The horse leaves the frame too often. Tap to see how to fix it.', m:'1 h ago', err:true},
    {id:'n4', day:'Yesterday', ic:'play-circle', tone:'blue', a:'Analysis ready', b:'Quintus Z · Grid work. Performance 76%.', m:'Yesterday, 17:40', go:'session'},
    {id:'n5', day:'Yesterday', ic:'danger-triangle', tone:'watch', a:'New alert · Watch', b:'Quintus Z. Cross canter after combinations, twice in the last show.', m:'Yesterday, 17:41', alert:4},
    {id:'n6', day:'Earlier', ic:'graph-up', tone:'good', a:'On a good run', b:'Bella Donna is up 6 points this month.', m:'Sun 27 Sep', go:'trends:bd'},
    {id:'n7', day:'Earlier', ic:'danger-triangle', tone:'watch', a:'New alert · Watch', b:'Silver Arrow. Landings getting heavier, balance on landing down 8 points over 2 weeks.', m:'Sat 26 Sep', alert:1}];
  /* the alerts the notifications point to, in the mobile order (index in the base list) */
  D.NT_ALERTS=[ALERTS.find(a=>a.a==='Left hind under load'),ALERTS.find(a=>a.a==='Landings getting heavier'),null,null,ALERTS.find(a=>a.a==='Cross canter after combinations')];
  D.NT=NT.filter(x=>HORSES.some(h=>x.b.includes(h.n))).filter(x=>!window.SD_STAFF||(PLAN==='vet'&&/alert/i.test(x.a)));
  /* ---------- trend analysis: the metrics of the session page, the widgets of Home (shared with the phone) ---------- */
  const TRG=window.SD_TREND_GROUPS||[];
  D.TRG=TRG;
  D.TRM=Object.fromEntries(TRG.flatMap(g=>g.items.map(([id,l,v,u,sd,b])=>[id,{id,l,v,u,sd,b,g:g.g}])));
  D.TWMAX=8;
  D.TWKEY='sdHomeTrends'+(window.SD_STAFF?'_'+PLAN:'');
  D.twLoad=()=>{ let TW=({vet:['m_sym','m_hind','m_bal','m_rec'],farrier:['m_sym','m_len','m_lat','m_hind']})[PLAN]||['s_perf','j_score','s_cons','m_bal'];
    try{ const k=JSON.parse(localStorage.getItem(D.TWKEY)); if(Array.isArray(k)&&k.every(x=>D.TRM[x])) TW=k.slice(0,D.TWMAX); }catch(e){} return TW; };
  D.twSave=TW=>{ try{ localStorage.setItem(D.TWKEY,JSON.stringify(TW)); }catch(e){} };
  /* weekly points over 6 months, each horse's direction; the period keeps the last 1, 3 or 6 months. A rider: the average of their horses */
  D.twSeries=function(h,id,P){ const n=P*4+1;
    if(h&&h._hs){ const A=h._hs.map(x=>D.twSeries(x,id,P)); return A[0].map((_,i)=>A.reduce((a,v)=>a+v[i],0)/A.length); }
    if(id==='s_perf') return D.hist(h,25).slice(-n);
    const m=D.TRM[id], r=D.rng(h.id+id), out=[]; const dir=(m.b||1)*h.d/6*m.sd;
    let v=m.v+(r()-.5)*m.sd*2-dir*2.4; for(let i=0;i<25;i++){ v+=dir/12+(r()-.5)*m.sd*.5; out.push(SD_PCT(m.u)?Math.max(5,Math.min(98,v)):Math.max(0,v)); } return out.slice(-n); };
  D.twInfo=function(h,id,P){ const m=D.TRM[id], s=D.twSeries(h,id,P), cur=s[s.length-1], d=cur-s[0];
    const dec=SD_PCT(m.u)||m.u==='m/min'||m.u==='°'||m.u==='per round'?0:(m.v<1||m.sd<.2?2:1), f=x=>(+x).toFixed(dec);
    const same=Math.abs(d)<m.sd*.6, good=m.b===0?null:(d>0)===(m.b>0);
    const tone=same||good===null?'flat':good?'up':'down';
    const word=same?'Steady':m.b===0?(d>0?'Going up':'Going down'):good?'Improving':'Dropping';
    const delta=same?word:`${word} · ${d>0?'+':'−'}${f(Math.abs(d))}${SD_PCT(m.u)?' pts':m.u==='°'?'°':' '+m.u}`;
    return {m,s,val:f(cur),unit:m.u==='%'?'%':m.u==='°'?'°':m.u,tone,delta}; };
  /* the average performance score of a set of horses over P months (weekly points), as the Home chart */
  D.avgSeries=function(hs,P){ const n=P*4+1, series=hs.map(h=>D.hist(h,25).slice(-n));
    return {n,series,avg:Array.from({length:n},(_,k)=>series.reduce((a,s)=>a+s[k],0)/series.length)}; };
  D.MONTHS=['Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
  /* horses of their own (a rider's, a vet's clients), never in the stable's numbers */
  D.personal=()=>window.SD_PERSONAL?SD_PERSONAL():[];
})();
