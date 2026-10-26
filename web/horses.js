/* StrydeUp desktop web app, My Horses: the list of horses and the page of one horse.
   The phone's My Horses (Etape 3 - My Horses.html) laid out for a computer, with the same rules per account (plan.js):
   Pro sees every horse, Premium goes straight to its one horse, the Stable Owner sees the stable with its riders
   (and the owner of each horse), a rider / groom / horse owner gets the stable's horses and "My Horses" kept apart,
   a vet / farrier / trainer gets the horses they follow, grouped by stable when they work for several.
   Same generators and seeds as the phone, so a number here is the number on the phone for the same horse.
   Routes: horses.html (list), #v=own (My Horses tab), #h=<id> (a horse), &v=sessions|trends|compare|care, &m=<metric>. */
(function(){
  const W=window.SDW, D=window.SD_DATA, C=window.SDC, T=W.T, esc=W.esc, I=W.I;
  const PLAN=W.PLAN, ACC=W.ACC;
  const OWNER=PLAN==='owner', PREM=PLAN==='premium', SOLO=PLAN==='pro'||PREM;
  const TABS=PLAN==='rider'||PLAN==='vet';                 /* the stable's horses and My Horses, two tabs */
  const MULTI=!!window.SD_MULTI, STAFF=!!window.SD_STAFF;   /* vet, farrier, trainer */
  const GROOM=ACC==='groom', NOSC=GROOM;                    /* a groom does not see the scores */
  const FARR=ACC==='farrier', VF=ACC==='vet'||ACC==='farrier';
  const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page=document.getElementById('wPage');
  const TODAY=D.TODAY, DAY=864e5;
  const WI=window.SDW_WI||{}, ICS=window.SDW_IC||{};
  const urlPlan=new URLSearchParams(location.search).get('plan');
  const HREF=hash=>'horses.html'+(urlPlan?'?plan='+encodeURIComponent(ACC):'')+(hash||'');
  const L=(d,sw)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw||1.6}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IK={
    grid:L('<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>'),
    rows:L('<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1.1"/><circle cx="4.8" cy="12" r="1.1"/><circle cx="4.8" cy="17.5" r="1.1"/>'),
    sort:L('<path d="M7 5v14M4 16l3 3 3-3"/><path d="M14 7h7M14 12h5M14 17h3"/>'),
    cam:L('<path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.2" r="3.4"/>'),
    pen:L('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
    plus:L('<path d="M12 5v14M5 12h14"/>',1.8),
    overview:L('<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>'),
    trends:L('<path d="M4 17l5-5 3 3 7-8"/><path d="M15 7h4v4"/>'),
    compare:L('<path d="M8 4v16M4 16l4 4 4-4"/><path d="M16 20V4M12 8l4-4 4 4"/>'),
    lock:L('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
    eye:L('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>'),
    check:L('<path d="M5 12.5l4.5 4.5L19 7.5"/>',2)};
  const ic=(svg,px,cls)=>W.ic(svg,px,cls);
  const ini=h=>h.ini||String(h.n||'').split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const av=(h,cls)=>`<span class="hzAv${cls?' '+cls:''}">${h.photo?`<img src="${esc(h.photo)}" alt="">`:esc(ini(h))}</span>`;
  const fmt=d=>`${D.DAY[d.getDay()]} ${d.getDate()} ${D.MON[d.getMonth()]}`;
  const fmtD=d=>`${d.getDate()} ${D.MON[d.getMonth()]}`;
  const kic=show=>`<span class="kic ${show?'show':''}">${window.SD_KIC?SD_KIC(show?'Competition':'Training'):''}</span>`;
  const ring=(p,s)=>C.ring(p,{size:s});
  const toast=(msg,act,fn)=>{ let t=document.getElementById('hzToast'); if(!t){ document.body.insertAdjacentHTML('beforeend','<div class="hzToast" id="hzToast" role="status" aria-live="polite"></div>'); t=document.getElementById('hzToast'); }
    t.innerHTML=`<span style="padding-right:10px">${esc(msg)}</span>${act?`<button>${esc(T(act))}</button>`:''}`; if(act) t.querySelector('button').onclick=()=>{ t.classList.remove('on'); fn&&fn(); };
    clearTimeout(t._t); void t.offsetHeight; t.classList.add('on'); t._t=setTimeout(()=>t.classList.remove('on'),act?5200:2800); };

  /* ---------- the horses (same details as the phone's list) ---------- */
  const DET={mb:{breed:'Holsteiner',age:12,sex:'Gelding',coat:'Black',month:8,height:172,weight:610,shoes:'All four'},
    qz:{breed:'Zangersheide',age:10,sex:'Gelding',coat:'Bay',month:6,height:170,weight:590,shoes:'All four'},
    bd:{breed:'KWPN',age:9,sex:'Mare',coat:'Chestnut',month:5,height:165,weight:545,shoes:'Front only'},
    sa:{breed:'Selle Français',age:8,sex:'Stallion',coat:'Grey',month:4,height:168,weight:575,shoes:'All four'},
    nl:{breed:'BWP',age:7,sex:'Mare',coat:'Dark bay',month:4,height:163,weight:530,shoes:'Barefoot'}};
  const fill=h=>{ const d=DET[h.id]; if(d) Object.keys(d).forEach(k=>{ if(h[k]==null) h[k]=d[k]; }); return h; };
  const ALLH=D.ALL; ALLH.forEach(fill);
  let PERS=D.personal().map(fill);
  const stH=()=>MULTI?ALLH.filter(h=>{ const s=SD_STABLE_SEL(); return s==='all'||(h.st||'ms')===s; }):ALLH;
  const findH=id=>ALLH.find(h=>h.id===id)||PERS.find(h=>h.id===id);

  /* alerts: the list of the phone's My Horses (same words, same order) */
  const AL0=[
    {h:'mb',lv:'Attention',ic:'hind',a:'Left hind under load',b:'Same pattern on the last 3 sessions. Worth a look before the next start.',when:'Today'},
    {h:'sa',lv:'Watch',ic:'latbal',a:'Landings getting heavier',b:'Balance on landing down 8 points over 2 weeks.',when:'Sat 26 Sep'},
    {h:'nl',lv:'Watch',ic:'tempo',a:'Tempo fading at the end',b:'Loses pace on the last line, 3 sessions in a row.',when:'Thu 24 Sep'},
    {h:'mb',lv:'Watch',ic:'swap',a:'Late lead change in turns',b:'Held the counter lead 4 strides before the change.',when:'Today'},
    {h:'qz',lv:'Watch',ic:'swap',a:'Cross canter after combinations',b:'Twice in the last show, both after the double.',when:'Yesterday'},
    {h:'sa',lv:'Attention',ic:'stride',a:'Right fore short on landing',b:'Stride after landing shorter on the right, 4 jumps of 12.',when:'Sat 26 Sep'},
    {h:'bd',lv:'Watch',ic:'tempo',a:'Rushing the last fences',b:'Tempo up 30 m/min on the final line.',when:'Sun 27 Sep'}];
  (window.SD_XALERTS||[]).forEach(x=>AL0.push({h:x.id,lv:x.lv,ic:x.ic,a:x.a,b:x.b,when:x.when.split(' · ')[0]}));
  const ALERTS=AL0.filter(a=>ALLH.some(h=>h.id===a.h));
  const alertsOf=id=>ALERTS.filter(a=>a.h===id).sort((a,b)=>(a.lv==='Attention'?0:1)-(b.lv==='Attention'?0:1));
  const alHref=(a,h)=>W.href('session',{},'#watch='+encodeURIComponent(JSON.stringify({h:h.n,r:h.r,lv:a.lv,a:a.a,b:a.b,ic:a.ic})));

  /* sessions of a horse as the user left them (deleted videos out, moved ones on their right horse), newest first */
  const SC=new Map();
  const sessFor=h=>{ if(!h||h.perf==null) return []; if(SC.has(h)) return SC.get(h);
    let Ls; if(!window.SD_VFIX) Ls=D.sessionsOf(h);
    else { const pool=(window.SD_ALLH||ALLH).slice(); if(!pool.includes(h)) pool.push(h);
      Ls=SD_VFIX(pool.flatMap(x=>D.sessionsOf(x)),pool).filter(s=>s.h===h).sort((a,b)=>b.date-a.date); }
    Ls.forEach((s,i)=>{ s.latest=i===0; if(!s.key&&window.SD_VKEY) s.key=SD_VKEY(h.id,s.date); }); SC.set(h,Ls); return Ls; };
  window.SD_VIDEOS_CHANGED=()=>{ SC.clear(); route(true); };
  const trendOf=h=>h.d>1?['good','Improving','▲']:h.d<-1?['bad','Dropping','▼']:['','Steady',''];
  const trendPill=h=>{ const t=trendOf(h); return `<span class="pill ${t[0]}">${t[2]?`<span>${t[2]}</span> `:''}<span>${t[1]}</span></span>`; };
  const alPill=al=>al.length?`<span class="pill"><i class="dot ${al.some(a=>a.lv==='Attention')?'bad':'watch'}"></i><span>${al.length} ${al.length>1?'alerts':'alert'}</span></span>`:'';
  const dTxt=d=>`${d>=0?'+':'−'}${Math.abs(d)} pts this month`;
  const dArrow=d=>d>=0?'▲':'▼';

  /* ---------- strengths, weaknesses, anomalies (the phone's sample pools, picked per horse) ---------- */
  const POOL_S=[['clock','Quick recovery','Back to rhythm in under 2 strides after most fences'],['tempo','Regular rhythm','The canter keeps the same tempo from start to finish'],['jump','Clean bascule','Round jump over most fences'],['sym','Even on both sides','Left and right push are well matched'],['stride','Adjustable stride','Shortens and lengthens easily in the lines'],['latbal','Balanced landings','Back on the canter quickly after the fence']];
  const POOL_W=[['stride','Short stride on approach','Stride gets short 3 strides before the bigger oxers'],['turn','Tight turns','Loses the hind end in the tightest turns'],['latbal','Forehand after landing','Weight stays on the front 2 to 3 strides'],['drift','Tempo fading','Pace drops on the last line'],['swap','Late lead changes','Changes after the turn instead of before']];
  const POOL_A=[['clock','Long recovery','4 strides before the canter settles after the combination'],['swap','Abnormal lead change','Swaps behind mid turn'],['latbal','Off balance on landing','Forehand loaded 3 strides'],['swap','Cross canter','2 strides before correction'],['tempo','Rhythm break','Tempo drops entering the turn']];
  const MI={clock:'<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',tempo:'<path d="M3 13h4l3-7 4 12 3-7h4"/>',jump:'<path d="M4 18Q12 4 20 18"/><path d="M12 13v5"/>',sym:'<path d="M12 4v16" stroke-dasharray="2 3"/><path d="M9 6C5 8 4 12 4 16"/><path d="M15 6c4 2 5 6 5 10"/>',stride:'<path d="M4 5.5v13"/><path d="M20 5.5v13"/><path d="M4 12h16"/>',latbal:'<path d="M5 7h14"/><path d="M12 7v12"/><path d="M9 19h6"/><path d="M2.8 10.5a2.4 2.4 0 0 0 4.8 0"/><path d="M16.4 10.5a2.4 2.4 0 0 0 4.8 0"/><path d="M5.2 7v3.5"/><path d="M18.8 7v3.5"/>',turn:'<path d="M5 18v-6a7 7 0 0 1 14 0v6"/><path d="M16.2 15.2 19 18l2.8-2.8"/>',drift:'<path d="M4 17c5 0 8-9 16-9"/><path d="M17 5.5 20 8l-3 2.5"/>',swap:'<path d="M4 8.5h12l-2.8-2.8"/><path d="M20 15.5H8l2.8 2.8"/>',hind:'<path d="M6 18c4 0 8-4 10-10"/><path d="M13 8.5 16 8l.5 3"/>'};
  const mic=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${MI[k]||MI.tempo}</svg>`;
  const pick=(pool,h,n,tag)=>{ const r=D.rng(h.id+tag); return [...pool].sort(()=>r()-.5).slice(0,n); };

  /* ---------- heatmap: the 12 points of the phone, their state per horse ---------- */
  const KPN=['Poll','Neck base','Withers','Shoulder','Elbow','Front knee','Front fetlock','Back','Croup','Stifle','Hock','Hind fetlock'];
  const kpStates=h=>{ const r=D.rng(h.id+'k'), st={}; KPN.forEach((n,i)=>st[i+1]='normal');
    const nW=1+Math.floor(r()*3); for(let i=0;i<nW;i++) st[1+Math.floor(r()*12)]='watch';
    if(alertsOf(h.id).some(a=>a.lv==='Attention')) st[h.id==='mb'?11:7]='attention'; return st; };
  const HMCOL={normal:'good',watch:'watch',attention:'bad'}, HMLAB={normal:'Normal',watch:'Watch',attention:'Attention'};
  const HMTXT={normal:'In the usual band for this horse.',watch:'A little out of the usual band. Nothing urgent, keep an eye on it over the next sessions.',attention:'Clearly out of the usual band. Check it on the video, and with your vet if it lasts.'};
  const LIC={attention:'<svg viewBox="0 0 24 24"><g fill="currentColor"><path d="M12 3C9.68925 3 8.23007 5.58716 5.31171 10.7615L4.94805 11.4063C2.52291 15.7061 1.31034 17.856 2.40626 19.428C3.50217 21 6.21356 21 11.6363 21H12.3637C17.7864 21 20.4978 21 21.5937 19.428C22.6897 17.856 21.4771 15.7061 19.0519 11.4063L18.6883 10.7615C15.7699 5.58716 14.3107 3 12 3Z" opacity=".5"/><path d="M12 7.25C12.4142 7.25 12.75 7.58579 12.75 8V13C12.75 13.4142 12.4142 13.75 12 13.75C11.5858 13.75 11.25 13.4142 11.25 13V8C11.25 7.58579 11.5858 7.25 12 7.25Z"/><path d="M12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z"/></g></svg>',
    watch:'<svg viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21.544 11.045c.304.426.456.64.456.955c0 .316-.152.529-.456.955C20.178 14.871 16.689 19 12 19c-4.69 0-8.178-4.13-9.544-6.045C2.152 12.529 2 12.315 2 12c0-.316.152-.529.456-.955C3.822 9.129 7.311 5 12 5c4.69 0 8.178 4.13 9.544 6.045Z"/><path d="M15 12a3 3 0 1 0-6 0a3 3 0 0 0 6 0Z"/></g></svg>',
    normal:'<svg viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10s10-4.477 10-10Z"/><path stroke-linecap="round" stroke-linejoin="round" d="m8 12.5l2.5 2.5L16 9"/></g></svg>'};
  const hmHist=(key,id,state)=>{ let s=[...(key+id)].reduce((a,c)=>(a*31+c.charCodeAt(0))%233280,11); const r=()=>{s=(s*9301+49297)%233280;return s/233280;};
    const o=[]; for(let i=0;i<5;i++){ const x=r(); o.push(i===4?state:(state==='attention'?(x<.45?'attention':x<.8?'watch':'normal'):state==='watch'?(x<.4?'watch':'normal'):(x<.12?'watch':'normal'))); } return o; };

  /* ---------- trends and compare: the phone's horse trends (TR_SESS, trSeries), every metric of the session page ---------- */
  const TR_ALL=(window.SD_TREND_GROUPS||[]).flatMap(g=>g.items.map(([id,l,v,u,sd,better,icn])=>({id,l,v,u,sd,better,ic:icn,g:g.g})));
  const horseSess=h=>{ const S=D.sessionsOf(h); return S.slice().reverse().map((x,i,A)=>({date:x.date,kind:x.show?'Competition':'Training',what:x.what,sc:x.sc,now:i===A.length-1,key:window.SD_VKEY?SD_VKEY(h.id,x.date):''})); };
  function trSeries(m,h,TS){
    const sh=h&&m.u==='%'&&!['m_lat','m_lon'].includes(m.id)?(h.perf-70)*.8:0;
    m={...m,v:+(m.v+sh).toFixed(m.v<10?2:0)};
    let seed=(m.id+(h?h.id:'')).split('').reduce((a,c)=>a+c.charCodeAt(0)*7,3);
    const rnd=()=>{seed=(seed*9301+49297)%233280; return seed/233280;};
    const bestNow=['j_score','m_hind','m_sym'].includes(m.id);
    const n=TS.length, r0=rnd(), slope=bestNow?(1.2+r0)*m.sd*2.4/n:(r0-.4)*m.sd*4/n, dec=m.u==='per round'?0:(m.v<10?2:(m.sd<1?2:0));
    return TS.map((s,i)=>{ const back=n-1-i, noise=i===n-1?0:(rnd()-.5)*m.sd*1.2;
      let v=m.v-slope*back+noise; if(bestNow&&i<n-1) v=Math.min(v,m.v-m.sd*.15-rnd()*m.sd*.2); if(m.id==='s_perf'&&h&&i===n-2) v=m.v-h.d; return +v.toFixed(dec); }); }
  const decOf=m=>m.u==='per round'?0:(m.v<10?(m.sd<1?2:1):0);
  const unitOf=m=>m.u==='%'?'%':m.u==='°'?'°':m.u;
  function trInfo(m,h,TS,months){
    const vals=trSeries(m,h,TS), f=v=>(+v).toFixed(decOf(m));
    const since=new Date(TS[TS.length-1].date); since.setMonth(since.getMonth()-months);
    const P=TS.map((s,i)=>({i,s,v:vals[i]})).filter(p=>p.s.date>=since), n=P.length, mx=(n-1)/2, my=P.reduce((a,p)=>a+p.v,0)/n;
    const den=P.reduce((a,p,k)=>a+(k-mx)**2,0), b=den?P.reduce((a,p,k)=>a+(k-mx)*(p.v-my),0)/den:0, change=b*(n-1);
    const flat=Math.abs(change)<m.sd*.5, up=change>0, good=m.better!==0&&up===(m.better>0);
    const word=flat?'Steady':(m.better===0?(up?'Going up':'Going down'):(good?'Improving':'Dropping'));
    const tone=flat||m.better===0?'blue':(good?'good':'bad');
    const last=vals[vals.length-1], isBest=m.better!==0&&n>2&&P.every(p=>m.better>0?p.v<=last:p.v>=last);
    const best=m.better<0?P.reduce((a,p)=>p.v<a.v?p:a):P.reduce((a,p)=>p.v>a.v?p:a);
    const shows=P.filter(p=>p.s.kind==='Competition');
    return {m,vals,f,P,n,my,change,flat,up,word,tone,last,isBest,best,shows,showAvg:shows.length?shows.reduce((a,p)=>a+p.v,0)/shows.length:null}; }
  const metIcon=(m,px)=>{ const s=WI[m.l]||(window.SD_TRM_ICON&&SD_TRM_ICON(m.ic))||(MI[m.ic]?mic(m.ic):'')||WI.Performance||''; return `<span class="hzMi" style="width:${px||18}px;height:${px||18}px">${s}</span>`; };

  /* ---------- care visits ---------- */
  const PNAME={vet:'Vet',osteo:'Osteopath',farrier:'Farrier',dentist:'Dentist',physio:'Physio',chiro:'Chiropractor',saddle:'Saddle fitter',nutri:'Nutritionist',other:'Other'};
  const careOf=h=>window.CARE?CARE.list(h.id):[];
  const ago=d=>{ const n=Math.round((TODAY-d)/DAY); return n===0?'Today':n===1?'Yesterday':n<0?(n===-1?'Tomorrow':`In ${-n} days`):n<60?`${n} days ago`:`${Math.round(n/30)} months ago`; };
  const effOf=(h,d)=>{ const S=sessFor(h); if(!S.length) return null; const b=S.filter(x=>x.date<d).slice(0,3), a=S.filter(x=>x.date>d).slice(-3);
    if(!b.length||!a.length) return null; const avg=L=>Math.round(L.reduce((s,x)=>s+x.sc,0)/L.length); return {b:avg(b),a:avg(a)}; };

  /* =====================================================================
     THE LIST
     ===================================================================== */
  let view='stable', q='', filt='all', riderF='all', sortBy=NOSC?'name':'perf';
  let layout='grid'; try{ layout=localStorage.getItem('sdwHorsesLayout')||'grid'; }catch(e){}
  const SORTS=NOSC?{name:'Name',last:'Last session',alerts:'Alerts'}:{perf:'Performance',last:'Last session',name:'Name',alerts:'Alerts'};
  const SORTS_OWN=NOSC?{name:'Name'}:{perf:'Performance',name:'Name'};

  function listPage(){
    W.switcher(null);
    const own=TABS&&view==='own', H=own?PERS:stH();
    const title=OWNER?'My Stable':TABS?'Horses':'My Horses';
    const eyebrow=OWNER?window.SD_STABLE:TABS?(MULTI?`${SD_STABLES.length} stables`:window.SD_STABLE):`${stH().length} ${stH().length===1?'horse':'horses'}`;
    page.innerHTML=`<div class="hzHead in"><div><div class="hEy"><span>${esc(T(eyebrow))}</span></div><h1 class="hT">${esc(T(title))}</h1></div>
        <div class="r"><button class="btn pri" id="hzAdd">${ic(IK.plus)}<span>Add a horse</span></button></div></div>
      ${TABS?`<div class="hzTabsTop in" role="tablist"><button role="tab" data-v="stable" class="${own?'':'on'}">${esc(T(MULTI?'Stable horses':window.SD_STABLE))} <em class="num">${stH().length}</em></button><button role="tab" data-v="own" class="${own?'on':''}">${esc(T(window.SD_OWN_LABEL||'My Horses'))} <em class="num">${PERS.length}</em></button></div>`:''}
      ${MULTI&&!own?`<div class="sdStC hChips hzChips in" id="hzStC"></div>`:''}
      <div id="hzSumBox"></div>
      ${OWNER?`<div class="hzRidF in" id="hzRF"></div>`:''}
      <div class="hzBar in">
        <label class="hzSearch">${I.search}<input id="hzQ" type="search" placeholder="Search a horse" aria-label="Search a horse" value="${esc(q)}" autocomplete="off" spellcheck="false"></label>
        <div class="seg" id="hzF">${[['all','All'],['up','Improving'],['look','Needs a look']].filter(x=>!NOSC||x[0]!=='up').map(([k,l])=>`<button data-k="${k}" class="${filt===k?'on':''}">${l}</button>`).join('')}</div>
        <span class="sp"></span>
        <button class="btn sm" id="hzSort">${ic(IK.sort,15)}<span>Sort</span><span class="mut">·</span><span id="hzSortL"></span>${ic(I.chev,14)}</button>
        <div class="hzView" role="group" aria-label="Layout"><button data-l="grid" class="${layout==='grid'?'on':''}" data-tip="Cards" aria-label="Cards">${ic(IK.grid)}</button><button data-l="table" class="${layout==='table'?'on':''}" data-tip="Table" aria-label="Table">${ic(IK.rows)}</button></div>
      </div>
      <div id="hzList"></div>`;
    const $=id=>document.getElementById(id);
    $('hzAdd').onclick=()=>openAddHorse();
    document.querySelectorAll('.hzTabsTop button').forEach(b=>b.onclick=()=>{ view=b.dataset.v; filt='all'; if(view==='own'&&!SORTS_OWN[sortBy]) sortBy=Object.keys(SORTS_OWN)[0];
      history.replaceState(null,'',view==='own'?'#v=own':location.pathname+location.search); listPage(); });
    $('hzQ').oninput=e=>{ q=e.target.value; drawList(); };
    $('hzF').querySelectorAll('button').forEach(b=>b.onclick=()=>{ filt=b.dataset.k; $('hzF').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); drawList(); });
    $('hzSort').onclick=()=>{ const S=own?SORTS_OWN:SORTS; const p=W.pop($('hzSort'),`<div class="gl">${esc(T('Sort horses by'))}</div>`+Object.entries(S).map(([k,l])=>`<button class="mi${k===sortBy?' on':''}" data-s="${k}"><span class="t">${esc(T(l))}</span><span class="ico ck">${I.check}</span></button>`).join(''),{w:220});
      if(p) p.querySelectorAll('.mi').forEach(m=>m.onclick=()=>{ sortBy=m.dataset.s; W.closePop(); drawList(); }); };
    document.querySelectorAll('.hzView button').forEach(b=>b.onclick=()=>{ layout=b.dataset.l; try{ localStorage.setItem('sdwHorsesLayout',layout); }catch(e){} document.querySelectorAll('.hzView button').forEach(x=>x.classList.toggle('on',x===b)); drawList(true); });
    if(MULTI&&$('hzStC')){ const counts={}; ALLH.forEach(h=>{ const k=h.st||'ms'; counts[k]=(counts[k]||0)+1; }); SD_STABLE_CHIPS($('hzStC'),counts,()=>{ listPage(); }); stSwitcher(); }
    drawSum(); drawRF(); drawList(true);
    if(!RM()) page.querySelectorAll('.in').forEach((el,k)=>el.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:260,delay:k*35,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'}));
  }
  /* a vet or a farrier with several stables: the same stable switch in the top bar as Home */
  function stSwitcher(){ if(!MULTI) return; const cur=SD_STABLE_SEL(), st=SD_STABLES.find(s=>s.id===cur), counts={}; ALLH.forEach(h=>{ const k=h.st||'ms'; counts[k]=(counts[k]||0)+1; });
    W.switcher({ini:st?st.ini:String(SD_STABLES.length),label:st?st.n:T('All stables'),head:T('Stable'),
      items:[{v:'all',ini:String(SD_STABLES.length),label:T('All stables'),count:ALLH.length,on:cur==='all'}].concat(SD_STABLES.map(s=>({v:s.id,ini:s.ini,label:s.n,sub:s.city,count:counts[s.id]||0,on:cur===s.id}))),
      onPick:v=>{ SD_SET_STABLE_SEL(v); listPage(); }}); }
  /* the Stable Owner: the horses of each rider */
  function drawRF(){ const box=document.getElementById('hzRF'); if(!box) return; const H=stH(), RS=[...new Set(H.map(h=>h.r).filter(Boolean))];
    box.innerHTML='<span class="lbl">Riders</span>'+[['all','All riders'],...RS.map(r=>[r,r])].map(([v,l])=>`<button class="chip${riderF===v?' on':''}" data-v="${esc(v)}">${v==='all'?'':`<span class="lg">${esc(v.split(' ').map(x=>x[0]).join('').replace('.','').slice(0,2))}</span>`}<span>${esc(T(l))}</span> <em class="num">${v==='all'?H.length:H.filter(h=>h.r===v).length}</em></button>`).join('');
    box.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{ riderF=b.dataset.v; drawRF(); drawSum(); drawList(); }); }

  /* summary of the horses shown: average score, horses, sessions this month, open alerts */
  function drawSum(){ const box=document.getElementById('hzSumBox'); if(!box) return; const own=TABS&&view==='own';
    const H=own?PERS:stH().filter(h=>riderF==='all'||h.r===riderF), SCd=H.filter(h=>h.perf!=null);
    const avg=SCd.length?Math.round(SCd.reduce((a,h)=>a+h.perf,0)/SCd.length):null, dA=SCd.length?SCd.reduce((a,h)=>a+h.d,0)/SCd.length:0;
    const tot=H.reduce((a,h)=>a+(h.month||0),0), AL=own?[]:ALERTS.filter(a=>H.some(h=>h.id===a.h)), att=AL.filter(a=>a.lv==='Attention').length;
    const best=[...SCd].sort((a,b)=>b.perf-a.perf)[0], low=[...SCd].sort((a,b)=>a.perf-b.perf)[0];
    const w=dA>.5?['good','Improving']:dA<-.5?['bad','Dropping']:['','Steady'];
    let main='';
    if(own){ main=`<div class="hzNote">${ic(IK.lock)}<div><b>${esc(T(GROOM?'Your own horses':'Only you see them'))}</b><span>${esc(T(STAFF?'Only you see them. They are not part of the stable and never count in its numbers.':'Only you see them. They are not part of the stable and never count in its numbers, nor in your average there.'))}</span></div></div>`;
      if(avg!=null&&!NOSC) main=`<div class="main">${ring(avg,76)}<div class="t"><div class="lbl">Average performance score</div><div class="w"><span class="pill ${w[0]}">${w[1]}</span><span class="pill ${dA<0?'bad':dA>0?'good':''}"><span>${dArrow(dA)}</span> <span>${dA>=0?'+':'−'}${Math.abs(dA).toFixed(1)} pts this month</span></span></div><p>${esc(T(STAFF?'Only you see them. They are not part of the stable and never count in its numbers.':'Only you see them. They are not part of the stable and never count in its numbers, nor in your average there.'))}</p></div></div>`; }
    else if(NOSC) main=`<div class="hzNote">${ic(I.horse)}<div><b>${esc(window.SD_STABLE)}</b><span>${esc(T('Every horse of the stable you look after. Click a horse for its sessions, heatmap and care.'))}</span></div></div>`;
    else if(avg!=null) main=`<div class="main">${ring(avg,76)}<div class="t"><div class="lbl">Average performance score</div><div class="w"><span class="pill ${w[0]}">${w[1]}</span><span class="pill ${dA<0?'bad':dA>0?'good':''}"><span>${dArrow(dA)}</span> <span>${dA>=0?'+':'−'}${Math.abs(dA).toFixed(1)} pts this month</span></span></div>
        ${best&&low&&best!==low?`<p><b>${esc(best.n)}</b> <span>leads the way.</span> <b>${esc(low.n)}</b> <span>needs the most attention right now.</span></p>`:''}</div></div>`;
    else main=`<div class="hzNote">${ic(I.horse)}<div><b>${esc(T('No horse yet'))}</b><span>${esc(T('Add a horse, then its first video to get the analysis.'))}</span></div></div>`;
    box.innerHTML=`<section class="card hzSum in">${main}
      <div class="st"><span class="lbl">Horses</span><b class="num">${H.length}</b><small>${esc(T(own?(window.SD_OWN_LABEL||'My Horses'):OWNER&&riderF!=='all'?riderF:'in the list'))}</small></div>
      <div class="st"><span class="lbl">Sessions</span><b class="num">${tot}</b><small>this month</small></div>
      ${own?'':`<button class="st" id="hzSumAl"><span class="lbl">Open alerts</span><b class="num">${AL.length}</b><small>${AL.length?`<i class="dot bad"></i><span>${att} Attention</span><i class="dot watch"></i><span>${AL.length-att} Watch</span>`:'<span>No open alert.</span>'}</small></button>`}</section>`;
    const a=document.getElementById('hzSumAl'); if(a) a.onclick=()=>{ sortBy='alerts'; drawList(); document.getElementById('hzList').scrollIntoView({behavior:RM()?'auto':'smooth',block:'start'}); }; }

  function drawList(anim){ const box=document.getElementById('hzList'); if(!box) return; const own=TABS&&view==='own';
    const S=own?SORTS_OWN:SORTS; if(!S[sortBy]) sortBy=Object.keys(S)[0]; document.getElementById('hzSortL').textContent=T(S[sortBy]);
    const qq=q.trim().toLowerCase();
    let H=(own?PERS:stH()).filter(h=>(riderF==='all'||own||h.r===riderF)&&(!qq||(h.n+' '+(h.r||'')+' '+(h.breed||'')).toLowerCase().includes(qq)));
    H=H.filter(h=>filt==='all'||(filt==='up'?h.d>1:own?h.d<-1:alertsOf(h.id).length>0&&(h.d<0||alertsOf(h.id).some(a=>a.lv==='Attention'))));
    const lastOf=h=>{ const s=sessFor(h)[0]; return s?(TODAY-s.date):1e12; };
    H.sort((a,b)=>sortBy==='perf'?(b.perf??-1)-(a.perf??-1):sortBy==='last'?lastOf(a)-lastOf(b):sortBy==='alerts'?alertsOf(b.id).length-alertsOf(a.id).length:a.n.localeCompare(b.n));
    if(!H.length){ box.innerHTML=`<div class="card hzEmpty">${qq?`<b>${esc(T('No horse matches'))} “${esc(q.trim())}”</b>`:`<b>${esc(T(own?'No horse of your own yet':'No horse here'))}</b><span>${esc(T(own?'Add one with Add a horse. Only you see it.':'Change the filter to see more horses.'))}</span>`}</div>`; return; }
    const groups=MULTI&&!own&&SD_STABLE_SEL()==='all'?SD_STABLES.map(s=>({s,L:H.filter(h=>(h.st||'ms')===s.id)})).filter(g=>g.L.length):[{L:H}];
    const block=L=>layout==='table'?table(L,own):`<div class="hzGrid">${L.map(h=>card(h,own)).join('')}</div>`;
    box.innerHTML=groups.map(g=>(g.s?`<div class="hzGH"><span class="lg">${esc(g.s.ini)}</span><b>${esc(g.s.n)}</b><em class="num">${g.L.length}</em>${g.s.city?`<small>${esc(g.s.city)}</small>`:''}</div>`:'')+block(g.L)).join('');
    box.querySelectorAll('[data-new]').forEach(a=>a.onclick=e=>{ e.preventDefault(); W.openUpload(a.dataset.new); });
    if(anim&&!RM()){ box.querySelectorAll('.hzCard,.hzTbl .tr:not(.th)').forEach((el,k)=>el.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:240,delay:Math.min(k,12)*28,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'})); } }
  const hHref=h=>HREF('#h='+h.id);
  const sub=(h,own)=>[h.r,h.breed&&h.breed!=='–'?h.breed:null].filter(Boolean).join(' · ');
  function card(h,own){
    if(h.perf==null) return `<a class="hzCard new" href="#" data-new="${esc(h.n)}"><div class="top">${av(h)}<div class="t"><b>${esc(h.n)}</b><span>${esc(sub(h,own))}</span></div><span class="hzRingNew">–</span></div>
      <div class="tags"><span class="pill blue">New · no session yet</span>${own&&window.SD_OWN_TAG?`<span class="pill blue">${esc(T(SD_OWN_TAG))}</span>`:''}</div><div class="spk">${esc(T('Add its first video to get the analysis'))}</div>
      <div class="ft">${ic(I.upload,15)}<b>Add a session</b><span class="go">${I.chevR}</span></div></a>`;
    const al=alertsOf(h.id), s=sessFor(h)[0], tone=h.d>1?'good':h.d<-1?'bad':'blue';
    return `<a class="hzCard" href="${hHref(h)}"><div class="top">${av(h)}<div class="t"><b>${esc(h.n)}</b><span>${esc(sub(h,own))}</span></div>${NOSC?'':ring(h.perf,56)}</div>
      <div class="tags">${NOSC?'':trendPill(h)}${own?'':alPill(al)}${own&&window.SD_OWN_TAG?`<span class="pill blue">${esc(T(SD_OWN_TAG))}</span>`:''}${!NOSC&&!al.length&&!own?`<span class="pill">${esc(h.level||'')}</span>`:''}</div>
      ${NOSC?'':`<div class="spk">${C.spark(D.hist(h,25).slice(-13),tone,240,40)}</div>`}
      <div class="ft">${s?`${kic(s.show)}<span>Last session</span><span>·</span><b>${esc(D.when(s.date))}</b>${NOSC?'':`<span>·</span><b class="num">${s.sc}%</b>`}`:`<span>${esc(T('No session yet'))}</span>`}<span class="go">${I.chevR}</span></div></a>`; }
  function table(L,own){
    return `<div class="card"><div class="tbl hzTbl${NOSC?' nosc':''}"><div class="tr th"><span>Horse</span><span>Rider</span><span>Last session</span>${NOSC?'':'<span>Trend</span>'}<span>Alerts</span>${NOSC?'':'<span>Score</span>'}<span></span></div>
      ${L.map(h=>{ const al=alertsOf(h.id), s=sessFor(h)[0];
        return `<a class="tr" href="${h.perf==null?'#':hHref(h)}" ${h.perf==null?`data-new="${esc(h.n)}"`:''}><span class="cellH">${av(h)}<span class="cell2"><b>${esc(h.n)}</b><span>${esc([h.breed&&h.breed!=='–'?h.breed:null,h.age&&h.age!=='–'?h.age+' years':null].filter(Boolean).join(' · ')||'')}</span></span></span>
          <span class="cell2"><b style="font-weight:560">${esc(h.r||'')}</b><span>${esc(own?T(window.SD_OWN_LABEL||'My Horses'):(window.SD_STABLE_OF?SD_STABLE_OF(h).n:''))}</span></span>
          <span class="cellH">${s?`${kic(s.show)}<span class="cell2"><b style="font-weight:560">${esc(D.when(s.date))}</b><span>${esc(s.show?'Show':'Training')} · ${esc(s.what)}</span></span>`:`<span class="pill blue">New · no session yet</span>`}</span>
          ${NOSC?'':`<span>${h.perf==null?'':trendPill(h)}</span>`}<span>${own?'<span class="mut">–</span>':(al.length?alPill(al):'<span class="mut">None</span>')}</span>
          ${NOSC?'':`<span class="sc">${h.perf==null?'<span class="mut">–</span>':ring(h.perf,44)}</span>`}<span class="chv">${I.chevR}</span></a>`; }).join('')}</div></div>`; }

  /* =====================================================================
     THE HORSE PAGE
     ===================================================================== */
  let H=null, TS=[], tab='overview', trM='s_perf', trP=3, trSel=null, trVisit=null, ovP=3, cmpA=0, cmpB=0, h3=null, careM=null, careDay=null, careAll=false;
  const TABL=()=>H&&H.perf==null?[['overview','Overview',IK.overview]]:NOSC?[['overview','Overview',IK.overview],['sessions','Sessions',I.sessions]]:[['overview','Overview',IK.overview],['sessions','Sessions',I.sessions],['trends','Trends',IK.trends],['compare','Compare',IK.compare]];
  function useHorse(h){ if(H===h&&TS.length) return; H=h; TS=h.perf==null?[]:horseSess(h); cmpA=TS.length-1; cmpB=TS.length-2; trSel=null; trVisit=null; careM=null; careDay=null; careAll=false; }
  function horsePage(h,v,m){
    const same=H===h&&document.getElementById('hzTab');
    useHorse(h);
    if(m&&TR_ALL.some(x=>x.id===m)){ trM=m; trSel=null; }
    tab=TABL().some(t=>t[0]===v)?v:(v==='care'?'overview':'overview');
    if(same){ drawTabs(); drawTab(true); if(v==='care') scrollCare(); return; }
    if(h3){ try{ h3.destroy(); }catch(e){} h3=null; }
    const S=sessFor(h), st=window.SD_STABLE_OF?SD_STABLE_OF(h):null, w=trendOf(h);
    const meta=[h.breed&&h.breed!=='–'?h.breed:null,h.age!=null&&h.age!=='–'?h.age+' years':null,h.sex].filter(Boolean);
    const about=[['Breed',h.breed],['Age',h.age!=null&&h.age!=='–'?h.age+' years':null],['Sex',h.sex],['Coat',h.coat],['Height',h.height?h.height+' cm':null],['Weight',h.weight?h.weight+' kg':null],['Shoes',h.shoes],['Competing at',h.level],['Rider',h.r],['Stable',h.personal?T(window.SD_OWN_LABEL||'My Horses'):st?st.n:null]];
    page.innerHTML=`<div class="hzCrumb in">${PREM?`<b>${esc(T('Your horse'))}</b>`:`<a class="bk" href="${HREF(h.personal?'#v=own':'')}">${ic(I.chevR)}<span>${esc(T(OWNER?'My Stable':TABS?'Horses':'My Horses'))}</span></a><span class="sl">/</span><b>${esc(h.n)}</b>`}
        <div class="r"><button class="btn" id="hzUp">${ic(I.upload)}<span>Add a session</span></button><button class="btn" id="hzMore" aria-label="More" aria-haspopup="menu" style="padding:0 10px">${ic(I.dots,18)}</button></div></div>
      <div class="hzHP">
        <aside class="card hzSide in">
          <div class="hzPh">${h.photo?`<img src="${esc(h.photo)}" alt="">`:`<span class="ini">${esc(ini(h))}</span>`}<button class="cam" id="hzPhB">${ic(IK.cam)}<span>${h.photo?'Change photo':'Add a photo'}</span></button><input type="file" id="hzPhIn" accept="image/*" hidden></div>
          <div class="pad"><h2>${esc(h.n)}</h2><div class="meta">${meta.map(x=>`<span>${esc(T(x))}</span>`).join(' · ')}</div>
            ${h.personal?`<div class="hzTagS"><span>${ic(IK.lock,12)}</span>${esc(T(window.SD_OWN_LABEL||'My Horses'))}</div>`:st&&(MULTI||OWNER||TABS)?`<div class="hzTagS"><span>${esc(st.ini)}</span>${esc(st.n)}</div>`:''}
            <div class="hzAboutH"><span class="lbl">About</span><button class="btn link" id="hzEd2" style="font-size:12.5px">${ic(IK.pen,14)}<span>Edit</span></button></div>
            <div class="hzAbout">${about.filter(x=>x[1]!=null&&x[1]!==''&&x[1]!=='–').map(([k,v])=>`<div><span>${esc(T(k))}</span><b>${esc(T(String(v)))}</b></div>`).join('')}</div>
            <div id="hzOwnBox"></div>
            <div class="hzSideAct"><button class="btn" id="hzEd">${ic(IK.pen,16)}<span>Edit details</span></button></div></div>
        </aside>
        <div class="hzMain"><div class="hzTabs in" role="tablist" id="hzTabs"></div><div id="hzTab"></div></div></div>`;
    const $=id=>document.getElementById(id);
    $('hzUp').onclick=()=>W.openUpload(h.n);
    $('hzMore').onclick=()=>horseMenu(h,$('hzMore'));
    $('hzEd').onclick=$('hzEd2').onclick=()=>openEdit(h);
    $('hzPhB').onclick=()=>$('hzPhIn').click();
    $('hzPhIn').onchange=e=>{ const f=e.target.files[0]; if(!f) return; h.photo=URL.createObjectURL(f); H=null; horsePage(h,tab); };
    drawOwner(h);
    horseSwitcher(h);
    drawTabs(); drawTab(true);
    if(v==='care') setTimeout(scrollCare,300);
    if(!RM()) page.querySelectorAll('.in').forEach((el,k)=>el.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:260,delay:k*40,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'}));
  }
  const scrollCare=()=>{ const c=document.getElementById('hzCare'); if(c) c.scrollIntoView({behavior:RM()?'auto':'smooth',block:'start'}); };
  function horseSwitcher(h){ if(PREM) return W.switcher(null); const L=(h.personal?PERS:stH()).filter(x=>x.perf!=null||x===h);
    W.switcher({ini:ini(h),label:h.n,head:T(h.personal?(window.SD_OWN_LABEL||'My Horses'):'Horses'),items:L.map(x=>({v:x.id,ini:ini(x),label:x.n,sub:x.r||'',count:NOSC||x.perf==null?null:x.perf+'%',on:x===h})),
      onPick:id=>{ location.hash='h='+id+(tab!=='overview'?'&v='+tab:''); }}); }
  function drawTabs(){ const b=document.getElementById('hzTabs'); if(!b) return;
    b.innerHTML=TABL().map(([k,l,icn])=>`<button role="tab" data-t="${k}" class="${tab===k?'on':''}" aria-selected="${tab===k}">${ic(icn)}<span>${l}</span>${k==='sessions'?`<em class="num mut" style="font-style:normal;font-size:12px">${sessFor(H).length}</em>`:''}</button>`).join('');
    b.querySelectorAll('button').forEach(x=>x.onclick=()=>{ if(tab===x.dataset.t) return; tab=x.dataset.t; history.replaceState(null,'','#h='+H.id+(tab!=='overview'?'&v='+tab:'')); drawTabs(); drawTab(true); }); }
  function drawTab(anim){ const box=document.getElementById('hzTab'); if(!box) return;
    if(h3&&tab!=='overview'){ try{ h3.destroy(); }catch(e){} h3=null; }
    if(H.perf==null&&tab!=='overview'){ tab='overview'; }
    ({overview,sessions:sessionsTab,trends:trendsTab,compare:compareTab})[tab](box,anim);
    if(anim&&!RM()) box.querySelectorAll(':scope > *').forEach((el,k)=>el.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:240,delay:k*40,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'})); }

  /* ⋯ of the horse: fix its details, or delete it with all its videos (undo on the list), as on the phone */
  function horseMenu(h,btn){ const items=[{t:T('Edit horse'),ic:'pen',fn:()=>openEdit(h)}];
    if(h.personal||ALLH.length>1) items.push({t:T('Delete horse'),ic:'trash',red:1,fn:()=>SD_CONFIRM_DELETE({title:T('Delete this horse?'),ok:T('Delete horse'),
      sub:`${window.SD_HNAME?SD_HNAME(h):h.n} and all its videos will be removed, with their analysis and numbers.`,
      onConfirm:()=>{ SD_DELETE_HORSE(h.id); SD_UNDO_LATER({type:'horse',id:h.id}); location.replace(HREF(h.personal?'#v=own':'')); location.reload(); }})});
    SD_MENU(btn,items); }

  /* the Stable Owner: the owner of the horse (add, invited / active, replace, remove) */
  function drawOwner(h){ const box=document.getElementById('hzOwnBox'); if(!box) return; if(!OWNER||h.personal||!window.SD_HOWNER){ box.innerHTML=''; return; }
    const o=SD_HOWNER(h.id), oi=n=>n.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
    box.innerHTML=o?`<div class="hzOwn"><span class="av">${esc(oi(o.n))}</span><div class="t"><span>OWNER</span><b>${esc(o.n)}</b></div><span class="hoPill${o.st==='invited'?' inv':''}">${esc(T(o.st==='invited'?'Invited':'Active'))}</span><button class="more" id="hzOwnM" aria-label="Owner options" aria-haspopup="menu">${ic(I.dots,17)}</button></div>`
      :`<button class="hzOwn add" id="hzOwnA"><span class="av">+</span><div class="t"><span>OWNER</span><b>${esc(T('Add the owner'))}</b></div><span class="ico" style="width:15px;height:15px;color:var(--blue-ink)">${I.chevR}</span></button>`;
    const invite=cur=>SD_HO_INVITE({hid:h.id,horse:h.n,current:cur,onSent:x=>{ const prev=SD_HO_RAW(h.id); SD_SET_HOWNER(h.id,x); drawOwner(h); SD_UNDO(T('Invite sent to')+' '+x.n,()=>{ SD_HO_PUT(h.id,prev); drawOwner(h); }); }});
    const a=document.getElementById('hzOwnA'); if(a) a.onclick=()=>invite(null);
    const m=document.getElementById('hzOwnM'); if(m) m.onclick=()=>SD_MENU(m,[{t:T('Replace the owner'),ic:'swap',fn:()=>invite(o)},
      {t:T('Remove the owner'),ic:'trash',red:1,fn:()=>SD_CONFIRM_DELETE({title:T('Remove the owner?'),sub:`${o.n} · ${T('They will no longer see this horse, its sessions and its scores.')}`,ok:T('Remove'),
        onConfirm:()=>{ const prev=SD_HO_RAW(h.id); SD_SET_HOWNER(h.id,null); drawOwner(h); SD_UNDO(T('Owner removed'),()=>{ SD_HO_PUT(h.id,prev); drawOwner(h); }); }})}]); }

  /* ---------------- Overview ---------------- */
  function overview(box){
    const h=H, S=sessFor(h), al=alertsOf(h.id), last=S[0], newH=h.perf==null;
    const avgS=S.length?Math.round(S.reduce((a,s)=>a+s.sc,0)/S.length):0, best=S.length?S.reduce((a,s)=>s.sc>a.sc?s:a):null;
    const w0=trendOf(h), att=al.filter(a=>a.lv==='Attention').length, past=careOf(h).filter(v=>v.d<=TODAY).reverse();
    const kp=(k,icn,v,s,href)=>`<${href?`a href="${href}"`:'div'} class="card kpi"><div class="k">${ic(icn,16)}<span>${k}</span></div><div class="v">${v}</div><div class="s">${s}</div></${href?'a':'div'}>`;
    let kpis;
    if(newH) kpis='';
    else if(NOSC) kpis=kp('Sessions',I.sessions,`<span class="num">${S.length}</span><small>videos</small>`,`<span>${h.month||0} this month</span>`,'#sessions')
      +kp('Last session',W.kindIcon(last&&last.show),`<span style="font-size:24px">${last?esc(D.when(last.date)):'–'}</span>`,last?`<span>${esc(last.show?'Show':'Training')} · ${esc(last.what)}</span>`:'',last?W.href('session',{v:last.key}):null)
      +kp('Last care visit',window.CARE?CARE.ico('vet',16,'currentColor'):'',`<span style="font-size:24px">${past[0]?esc(T(PNAME[past[0].type]||'Other')):'–'}</span>`,past[0]?`<span>${esc(ago(past[0].d))}</span>`:`<span>${esc(T('No visit on record'))}</span>`,'#care')
      +kp('Heatmap',ICS['danger-triangle'],`<span class="num">${Object.values(kpStates(h)).filter(x=>x!=='normal').length}</span><small>points to watch</small>`,`<span>last 3 sessions</span>`,'#heat');
    else kpis=kp('Performance score',WI.Performance,`<span class="num">${h.perf}</span><small>%</small><span class="pill ${w0[0]}" style="margin-left:8px;align-self:center;letter-spacing:0">${w0[1]}</span>`,`<span class="pill ${h.d<0?'bad':h.d>0?'good':''}"><span>${dArrow(h.d)}</span> <span>${dTxt(h.d)}</span></span>`)
      +kp('Sessions',I.sessions,`<span class="num">${S.length}</span><small>videos</small>`,`<span>${h.month||0} this month</span>`,'#sessions')
      +`<div class="card kpi"><div class="k">${ic(ICS['graph-up'],16)}<span>Average and best</span></div><div class="kv2"><div><b class="num">${avgS}<small style="font-size:15px;color:var(--mut);font-weight:650">%</small></b><span>average</span></div><div><b class="num">${best?best.sc:0}<small style="font-size:15px;color:var(--mut);font-weight:650">%</small></b><span>best</span></div></div><div class="s"><span>${esc(T('Best on'))} ${best?esc(fmt(best.date)):''}</span></div></div>`
      +(FARR?kp('Last session',W.kindIcon(last&&last.show),`<span style="font-size:24px">${last?esc(D.when(last.date)):'–'}</span>`,last?`<span>${esc(last.show?'Show':'Training')} · ${esc(last.what)}</span>`:'',last?W.href('session',{v:last.key}):null)
        :kp('Open alerts',ICS['danger-triangle'],`<span class="num">${al.length}</span>`,al.length?`<span class="lg"><i class="dot bad"></i><b class="num">${att}</b> <span>Attention</span></span><span class="lg"><i class="dot watch"></i><b class="num">${al.length-att}</b> <span>Watch</span></span>`:'<span>No open alert.</span>','#alerts'));
    const showSW=!STAFF&&!NOSC&&!newH, showAA=!FARR&&!NOSC&&!newH;
    box.innerHTML=(newH?`<section class="card" style="margin-bottom:20px"><div class="cardB hUp" style="padding:28px"><span class="ico" style="width:44px;height:44px;border-radius:12px;background:var(--blue-bg);color:var(--blue-ink);padding:10px">${I.upload}</span><b style="font-size:17px;margin-top:8px">${esc(T('No session yet'))}</b><p class="mut">${esc(T('Add its first video to get the analysis: scores, heatmap, trends and alerts.'))}</p><button class="btn pri" id="hzFirst">${ic(I.upload)}<span>Add a session</span></button></div></section>`:'')
      +(kpis?`<div class="hzKpis">${kpis}</div>`:'')
      +(newH?'':`<div class="hzRow">${NOSC?'':`<section class="card c7" id="hzPerfC"></section>`}<section class="card ${NOSC?'c12':'c5'}" id="hzLastS"></section></div>
      <section class="card" id="hzHeatC" style="margin-bottom:20px"></section>`)
      +(showSW||showAA?`<div class="hzRow">${showSW?`<section class="card ${showAA?'c6':'c12'}" id="hzSW"></section>`:''}${showAA?`<section class="card ${showSW?'c6':'c12'}" id="hzAA"></section>`:''}</div>`:'')
      +`<section class="card" id="hzCare"></section>`;
    box.querySelectorAll('a.kpi[href^="#"]').forEach(a=>a.onclick=e=>{ e.preventDefault(); const t=a.getAttribute('href').slice(1);
      if(t==='sessions'){ tab='sessions'; history.replaceState(null,'','#h='+H.id+'&v=sessions'); drawTabs(); drawTab(true); }
      else { const el=document.getElementById({care:'hzCare',heat:'hzHeatC',alerts:'hzAA'}[t]); if(el) el.scrollIntoView({behavior:RM()?'auto':'smooth',block:'center'}); } });
    if(document.getElementById('hzFirst')) document.getElementById('hzFirst').onclick=()=>W.openUpload(h.n);
    if(!newH){ if(!NOSC) perfCard(); lastSessCard(); heatCard(); }
    if(showSW) swCard(); if(showAA) aaCard();
    careCard();
    if(window.SD_COUNT&&!RM()) box.querySelectorAll('.kpi .v').forEach(v=>SD_COUNT(v));
  }
  function perfCard(){ const el=document.getElementById('hzPerfC'); if(!el) return; const m=TR_ALL.find(x=>x.id==='s_perf'), X=trInfo(m,H,TS,ovP);
    el.innerHTML=`<div class="cardH"><h2>Performance score</h2><div class="r"><div class="seg" id="hzOvP">${[1,3,6].map(p=>`<button data-p="${p}" class="${p===ovP?'on':''}">${p===1?'1 month':p+' months'}</button>`).join('')}</div></div></div>
      <div class="cardB"><div class="avTop"><div class="avV"><span class="num">${X.f(X.last)}</span><small>%</small></div><span class="pill ${X.tone}">${esc(X.word)}</span>${X.isBest?`<span class="pill good">★ <span>${esc(T(`Best in ${ovP===1?'a month':ovP+' months'}`))}</span></span>`:''}</div>
        <div class="mut avS">${esc(trSentence(X,ovP))}</div><div class="hzCh" id="hzOvCh"></div><div class="hzTrTip" id="hzOvTip"></div></div>
      <div class="cardF"><span>${esc(T(`${X.n} sessions`))}</span><span style="display:flex;gap:18px"><a class="btn link" href="#" id="hzGoCmp">${ic(IK.compare,14)}<span>Compare sessions</span></a><a class="btn link" href="#" id="hzGoTr"><span>Open trends</span>${ic(I.chevR,14)}</a></span></div>`;
    const sel={k:X.n-1};
    trChart(document.getElementById('hzOvCh'),{X,height:200,sel:X.n-1,anim:true,care:false,onPick:k=>{ const p=X.P[k], tp=document.getElementById('hzOvTip'); if(tp) tp.innerHTML=`<b>${esc(p.s.now?T('Latest session'):fmtD(p.s.date))}</b> · <span>${esc(p.s.kind==='Competition'?'Show':'Training')}</span> · <span>${esc(p.s.what)}</span> · <b>${X.f(p.v)}%</b>`; }});
    el.querySelectorAll('#hzOvP button').forEach(b=>b.onclick=()=>{ ovP=+b.dataset.p; perfCard(); });
    document.getElementById('hzGoTr').onclick=e=>{ e.preventDefault(); trM='s_perf'; trP=ovP; trSel=null; tab='trends'; history.replaceState(null,'','#h='+H.id+'&v=trends'); drawTabs(); drawTab(true); window.scrollTo({top:0,behavior:RM()?'auto':'smooth'}); };
    document.getElementById('hzGoCmp').onclick=e=>{ e.preventDefault(); tab='compare'; history.replaceState(null,'','#h='+H.id+'&v=compare'); drawTabs(); drawTab(true); window.scrollTo({top:0,behavior:RM()?'auto':'smooth'}); }; }
  const trSentence=(X,P)=>{ const period={1:'the last month',3:'the last 3 months',6:'the last 6 months'}[P], uw=SD_PCT(X.m.u)?'points':X.m.u;
    return X.flat?`About the same over ${period}, ${X.n} sessions.`:`${X.up?'Up':'Down'} ${X.f(Math.abs(X.change))} ${uw} over ${period}, ${X.n} sessions.`; };
  function lastSessCard(){ const el=document.getElementById('hzLastS'); if(!el) return; const S=sessFor(H).slice(0,NOSC?6:5);
    el.innerHTML=`<div class="cardH"><h2>Latest sessions</h2><div class="r"><a class="btn link" href="#" id="hzAllS">See all</a></div></div>
      <div class="tbl hzSes mini${NOSC?' wide':''}" style="margin-top:8px">${S.map(s=>`<a class="tr" href="${W.href('session',{v:s.key})}"><span class="cellH">${kic(s.show)}<span class="cell2"><b>${esc(D.when(s.date))}${s.latest?`<span class="new">${esc(T('Latest'))}</span>`:''}</b><span>${esc((s.show?'Show':'Training')+' · '+s.what)}</span></span></span>${NOSC?`<span class="mut num">${D.durOf(s)}</span>`:`<span class="scB"><span class="bar"><i style="width:${s.sc}%;background:var(--${C.toneOfScore(s.sc)})"></i></span><b class="num">${s.sc}<small>%</small></b></span>`}</a>`).join('')||`<div class="hEmpty">${esc(T('No session yet.'))}</div>`}</div>`;
    document.getElementById('hzAllS').onclick=e=>{ e.preventDefault(); tab='sessions'; history.replaceState(null,'','#h='+H.id+'&v=sessions'); drawTabs(); drawTab(true); }; }

  /* heatmap: the 3D horse and the points in plain words, kept in sync */
  function heatCard(){ const el=document.getElementById('hzHeatC'); if(!el) return; const h=H, st=kpStates(h), P=KPN.map((n,i)=>({id:i+1,name:n,state:st[i+1]}));
    let open=null, showAll=false;
    el.innerHTML=`<div class="cardH"><h2>Heatmap</h2><span class="mut" style="font-size:12.5px">${esc(T('This horse, last 3 sessions'))}</span><div class="r"><button class="wIconB" id="hzHmI" data-tip="About the heatmap" aria-label="About the heatmap">${ic(I.info,18)}</button></div></div>
      <div class="hzHeat" style="margin-top:14px"><div class="hzStage" id="hzStage"><span class="cap">${esc(T('Drag to rotate · click a point'))}</span></div><div><div class="hmCnt" id="hmCnt"></div><div class="hmList" id="hmList"></div></div></div>`;
    document.getElementById('hzHmI').onclick=()=>window.SD_HEAT_INFO&&SD_HEAT_INFO();
    const n=s=>P.filter(p=>p.state===s).length;
    document.getElementById('hmCnt').innerHTML=['attention','watch','normal'].map(s=>`<div><span class="ico ${HMCOL[s]}" style="color:var(--${HMCOL[s]})">${LIC[s]}</span><b class="num">${n(s)}</b><span>${HMLAB[s]}</span></div>`).join('');
    const draw=()=>{ const row=p=>{ const hs=hmHist(h.id,p.id,p.state), op=open===p.id;
        return `<div class="hmR${op?' open':''}" data-id="${p.id}"><button class="hd"><i class="dot ${HMCOL[p.state]}"></i><b>${esc(T(p.name))}</b><span class="pill ${HMCOL[p.state]}">${HMLAB[p.state]}</span><span class="ico cv">${I.chevR}</span></button>
          <div class="bd"><div><div class="tx">${esc(T(HMTXT[p.state]))}</div><div class="hs"><span>Last 5 sessions</span> ${hs.map(x=>`<em style="background:var(--${HMCOL[x]})"></em>`).join('')}</div></div></div></div>`; };
      const look=P.filter(p=>p.state!=='normal').sort((a,b)=>(a.state==='attention'?0:1)-(b.state==='attention'?0:1)), ok=P.filter(p=>p.state==='normal');
      const openOk=showAll||ok.some(p=>p.id===open), L=document.getElementById('hmList'); if(!L) return;
      L.innerHTML=(look.length?`<div class="hmG"><span>Needs a look</span></div>${look.map(row).join('')}`:`<div class="hmG"><span>Nothing to watch</span></div>`)
        +(openOk?`<div class="hmG"><span>In the usual band</span><button class="hmLess" id="hmLess">Hide</button></div>${ok.map(row).join('')}`:`<button class="hmMore" id="hmMore"><span>${ok.length} points in the usual band</span><span class="ico">${I.chevR}</span></button>`);
      L.querySelectorAll('.hmR .hd').forEach(b=>b.onclick=()=>{ const id=+b.parentNode.dataset.id; if(h3&&h3.select){ h3.select(open===id?null:id); setOpen(open===id?null:id); } else setOpen(open===id?null:id); });
      const m=document.getElementById('hmMore'); if(m) m.onclick=()=>{ showAll=true; draw(); };
      const l=document.getElementById('hmLess'); if(l) l.onclick=()=>{ showAll=false; if(open!=null&&ok.some(p=>p.id===open)){ if(h3&&h3.select) h3.select(null); open=null; } draw(); }; };
    const setOpen=id=>{ open=id; draw(); };
    draw();
    const stage=document.getElementById('hzStage');
    if(window.initHorse3D){ try{ h3=initHorse3D(stage,{keypoints:P.map(p=>({id:p.id,name:T(p.name),state:p.state})),side:'left'});
      h3.onKeypointTap=id=>{ open=id; draw(); if(id!=null){ const r=document.querySelector(`.hmR[data-id="${id}"]`); if(r) setTimeout(()=>r.scrollIntoView({behavior:RM()?'auto':'smooth',block:'nearest'}),60); } }; }catch(e){ console.warn(e); } } }

  /* strengths & weaknesses, anomalies & alerts: the three first, See all in a dialog */
  const swRow=(i,tone,a,b,href)=>`<${href?`a href="${href}"`:'div'} class="hzR"><span class="ri ${tone}">${mic(i)}</span><span class="t"><b class="a">${esc(T(a))}</b><span class="b">${b}</span></span>${href?`<span class="ico go">${I.chevR}</span>`:''}</${href?'a':'div'}>`;
  const swData=h=>({ST:pick(POOL_S,h,5,'s'),WK:pick(POOL_W,h,h.d<0?4:3,'w'),AN:pick(POOL_A,h,h.d<0?4:3,'a')});
  const swL=(h,k,n)=>{ const {ST,WK}=swData(h); return (k?WK:ST).slice(0,n).map(([i,a,b])=>swRow(i,k?'watch':'good',a,esc(T(b)))).join(''); };
  const aaL=(h,k,n)=>{ const {AN}=swData(h), S=sessFor(h), al=alertsOf(h.id);
    if(k) return al.length?al.slice(0,n).map(x=>swRow(x.ic||'latbal',x.lv==='Attention'?'bad':'watch',x.a,`<span>${esc(T(x.b))}</span> · <span>${esc(T(x.when))}</span>`,alHref(x,h))).join(''):`<div class="hEmpty">${esc(T('No open alert.'))}</div>`;
    return AN.slice(0,n).map(([i,a,b],j)=>swRow(i,'watch',a,`<span>${esc(T(b))}</span> · <span>${esc(S[j]?fmt(S[j].date):'')}</span>`,S[j]?W.href('session',{v:S[j].key}):null)).join(''); };
  function segCard(id,title,tabs,list,info){ const el=document.getElementById(id); if(!el) return; let k=0;
    const draw=()=>{ el.innerHTML=`<div class="cardH"><h2>${title}</h2><div class="r">${info?`<button class="wIconB" data-i="1" data-tip="What is an active alert?" aria-label="What is an active alert?">${ic(I.info,18)}</button>`:''}<button class="btn link" data-all="1">See all</button></div></div>
        <div style="padding:12px 20px 0"><div class="seg" style="width:100%">${tabs.map((t,i)=>`<button data-k="${i}" class="${i===k?'on':''}" style="flex:1;justify-content:center">${t}</button>`).join('')}</div></div>
        <div class="hzRows" style="margin-top:10px">${list(k,3)}</div>`;
      el.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{ k=+b.dataset.k; draw(); });
      const ib=el.querySelector('[data-i]'); if(ib) ib.onclick=alInfo;
      el.querySelector('[data-all]').onclick=()=>{ let j=k; const body=m=>{ m.querySelector('.mB').innerHTML=`<div class="seg" style="width:100%;margin-bottom:8px">${tabs.map((t,i)=>`<button data-k="${i}" class="${i===j?'on':''}" style="flex:1;justify-content:center">${t}</button>`).join('')}</div><div class="hzRows" style="margin:0 -24px">${list(j,99)}</div>`;
          m.querySelectorAll('.mB .seg button').forEach(b=>b.onclick=()=>{ j=+b.dataset.k; body(m); }); };
        W.modal({title:H.n+' · '+T(title),wide:true,wire:body}); }; };
    draw(); }
  function swCard(){ const {ST,WK}=swData(H); segCard('hzSW','Strengths & weaknesses',[`<span>Strengths</span> <em class="num">${ST.length}</em>`,`<span>Weaknesses</span> <em class="num">${WK.length}</em>`],(k,n)=>swL(H,k,n)); }
  function aaCard(){ const {AN}=swData(H), al=alertsOf(H.id); segCard('hzAA','Anomalies & alerts',[`<span>Anomalies</span> <em class="num">${AN.length}</em>`,`<span>Alerts</span> <em class="num">${al.length}</em>`],(k,n)=>aaL(H,k,n),true); }
  const alInfo=()=>W.modal({title:T('What is an active alert?'),body:[
      ['What opens an alert','After each video, StrydeUp compares the horse with its own recent sessions. An alert opens when a measure moves away from its usual level, or when the same pattern comes back over several sessions.'],
      ['Attention','A clear change, or a pattern seen on 3 sessions or more. Worth a look before the next start.','bad'],
      ['Watch','A first sign to keep an eye on. Nothing urgent.','watch'],
      ['When it goes away','It closes by itself once the next sessions are back to the horse\'s usual level, usually after 2 or 3 normal videos.']]
    .map(([a,b,c])=>`<div class="infoR">${c?`<i class="dot ${c}"></i>`:'<i class="dot" style="visibility:hidden"></i>'}<div><b>${esc(a)}</b><p>${esc(b)}</p></div></div>`).join(''),
    foot:`<button class="btn pri" id="hzOk">Got it</button>`,wire:m=>{ m.querySelector('#hzOk').onclick=W.closeModal; }});

  /* care & visits: what happened, read-only (no add, no edit), at the bottom of the horse */
  function careCard(){ const el=document.getElementById('hzCare'); if(!el||!window.CARE) return; const h=H, Lv=careOf(h), up=Lv.filter(v=>v.d>TODAY), past=Lv.filter(v=>v.d<=TODAY).reverse();
    const RHY=['farrier','osteo','vet','dentist'];
    const tiles=RHY.map(k=>{ const v=past.find(x=>x.type===k), pl=up.find(x=>x.type===k);
      return `<button class="hcvT${v?'':' none'}" ${v?`data-v="${v.id}"`:'disabled'} style="text-align:left"><span class="h">${CARE.ico(k,18)}<span>${esc(T(PNAME[k]))}</span></span><b>${v?esc(ago(v.d)):esc(T('Not logged yet'))}</b><small>${v?(pl&&!VF?`<span>Planned</span> <span>${esc(fmt(pl.d))}</span>`:`<span>Last</span> <span>${esc(fmt(v.d))}</span>`):esc(T('No visit on record'))}</small></button>`; }).join('')
      +(VF?'':`<div class="hcvT plan"><span class="h"><span>Planned</span></span>${up.length?up.slice(0,2).map(v=>`<b>${esc(T(PNAME[v.type]||'Other'))}</b><small>${esc(fmt(v.d))}</small>`).join(''):`<b class="mut" style="font-weight:600">${esc(T('Nothing planned'))}</b>`}</div>`);
    if(!careM) careM=new Date(TODAY.getFullYear(),TODAY.getMonth(),1);
    const y=careM.getFullYear(), mo=careM.getMonth(), first=(new Date(y,mo,1).getDay()+6)%7, nd=new Date(y,mo+1,0).getDate(), iso=d=>d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    let cells=''; for(let i=0;i<first;i++) cells+='<span></span>';
    for(let d=1;d<=nd;d++){ const dt=new Date(y,mo,d), vs=Lv.filter(v=>iso(v.d)===iso(dt)), td=iso(dt)===iso(TODAY);
      cells+=`<button class="${vs.length?'has':''}${td?' td':''}${careDay===iso(dt)?' on':''}${dt>TODAY?' fut':''}" data-d="${d}">${d}${vs.length?`<i>${vs.slice(0,2).map(v=>CARE.ico(v.type,10,'currentColor')).join('')}</i>`:''}</button>`; }
    const MONL=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const cal=`<div class="hzCal"><div class="h"><button data-c="-1" aria-label="Previous month">${ic(I.chevR)}</button><b>${MONL[mo]} ${y}</b><button data-c="1" aria-label="Next month">${ic(I.chevR)}</button></div>
      <div class="wk">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=>`<span>${x}</span>`).join('')}</div><div class="gd">${cells}</div></div>`;
    const vis=(v,planned)=>{ const e=planned||NOSC?null:effOf(h,v.d);
      return `<button class="hzVis${planned?' plan':''}" data-v="${v.id}"><span class="nd">${CARE.ico(v.type,17,planned?'var(--blue-ink)':'var(--blue-ink)')}</span><span class="t"><b class="a">${esc(T(PNAME[v.type]||'Other'))}${v.who?` <span>· ${esc(v.who)}</span>`:''}</b><span class="b">${esc(fmt(v.d))} · ${esc(T(ago(v.d)))}${v.note?' · '+esc(T(v.note)):''}</span></span>${planned?`<span class="pill blue">Planned</span>`:e?`<span class="pill ${Math.abs(e.a-e.b)<2?'blue':e.a>e.b?'good':'bad'}">${e.b} → ${e.a}%</span>`:''}</button>`; };
    let right='';
    if(careDay){ const dl=Lv.filter(v=>iso(v.d)===careDay), dd=new Date(careDay.split('-')[0],careDay.split('-')[1]-1,careDay.split('-')[2]);
      right=`<div class="hzMo" style="display:flex;justify-content:space-between"><span>${esc(fmt(dd))}</span>${VF?'':`<button class="btn link" id="hzCvBack" style="font-size:12px;letter-spacing:0">${esc(T('Latest visits'))}</button>`}</div>${dl.length?dl.map(v=>vis(v,v.d>TODAY)).join(''):`<div class="hEmpty" style="padding:12px 6px">${esc(T('No visit this day.'))}</div>`}`; }
    else if(VF) right=`<div class="hEmpty" style="padding:18px 6px">${esc(T('Click a day to see its visits.'))}</div>`;
    else { if(up.length) right+=`<div class="hzMo">Upcoming</div>`+up.map(v=>vis(v,true)).join('');
      const show=careAll?past:past.slice(0,4); right+=`<div class="hzMo">${esc(T('Latest visits'))}</div>`+(show.map(v=>vis(v,false)).join('')||`<div class="hEmpty" style="padding:12px 6px">${esc(T('No visit on record yet.'))}</div>`);
      if(!careAll&&past.length>4) right+=`<button class="btn link" id="hzCvAll" style="margin:8px 6px 0">${esc(T(`See all ${past.length} visits`))}</button>`; }
    el.innerHTML=`<div class="cardH"><h2>Care &amp; visits</h2><span class="mut" style="font-size:12.5px">${past[0]?`<span>${esc(`Last visit ${ago(past[0].d).toLowerCase()}`)}</span> · <span>${Lv.length} logged</span>`:esc(T('Vet, osteopath, farrier and more'))}</span><div class="r"><span class="hzRO">${ic(IK.eye)}<span>Read only</span></span></div></div>
      <div class="cardB"><div class="hcvG" style="grid-template-columns:repeat(${VF?4:5},minmax(0,1fr))">${tiles}</div>
        <div class="hzCareG${VF?' one':''}">${cal}<div>${right}</div></div></div>
      <div class="cardF"><span class="hzCareF">${CARE.ico('other',14,'var(--dim)')}<span>${esc(T(NOSC?'The care log of the stable, kept by the owner and the team.':'Visits show on the Trends, with the performance before and after.'))}</span></span>${NOSC?'':`<a class="btn link" href="#" id="hzCvTr"><span>See on the Trends</span>${ic(I.chevR,14)}</a>`}</div>`;
    const prevB=el.querySelector('.hzCal .h button[data-c="-1"] .ico'); if(prevB) prevB.style.transform='rotate(180deg)';
    el.querySelectorAll('.hzCal .h button').forEach(b=>b.onclick=()=>{ careM=new Date(y,mo+ +b.dataset.c,1); careDay=null; careCard(); });
    el.querySelectorAll('.hzCal .gd button').forEach(b=>b.onclick=()=>{ const k=iso(new Date(y,mo,+b.dataset.d)); careDay=careDay===k?null:k; careCard(); });
    el.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>visitDetail(h,b.dataset.v));
    const bk=document.getElementById('hzCvBack'); if(bk) bk.onclick=()=>{ careDay=null; careCard(); };
    const al=document.getElementById('hzCvAll'); if(al) al.onclick=()=>{ careAll=true; careCard(); };
    const tr=document.getElementById('hzCvTr'); if(tr) tr.onclick=e=>{ e.preventDefault(); trM='s_perf'; trP=6; tab='trends'; history.replaceState(null,'','#h='+H.id+'&v=trends'); drawTabs(); drawTab(true); window.scrollTo({top:0,behavior:RM()?'auto':'smooth'}); }; }
  function visitDetail(h,id){ const v=careOf(h).find(x=>x.id===id); if(!v) return; const e=v.d<=TODAY&&!NOSC?effOf(h,v.d):null, d=e?e.a-e.b:0;
    const verdict=NOSC?'':!e?(v.d>TODAY?'Planned visit. We will show the performance after it once there are videos.':'Not enough videos around this visit yet to compare.')
      :Math.abs(d)<2?'About the same performance after this visit.':d>0?`Performance up ${d} points in the 3 videos after.`:`Performance down ${-d} points in the 3 videos after.`;
    W.modal({title:T(PNAME[v.type]||'Other'),sub:`<span>${esc(fmt(v.d))}</span> · <span>${esc(T(ago(v.d)))}</span>`,icon:`<span class="ico" style="width:44px;height:44px;border-radius:12px;background:var(--blue-bg);padding:10px">${CARE.ico(v.type,24)}</span>`,
      body:`${v.who||v.note?`<div class="hz2">${v.who?`<div class="hzStat"><span class="lbl">Who</span><b style="font-size:15px">${esc(v.who)}</b></div>`:''}${v.note?`<div class="hzStat"><span class="lbl">Note</span><b style="font-size:15px">${esc(T(v.note))}</b></div>`:''}</div>`:''}
        ${NOSC?'':`<div class="hzStat" style="margin-top:12px;background:var(--${!e?'blue':Math.abs(d)<2?'blue':d>0?'good':'bad'}-bg)">${e?`<div style="display:flex;align-items:center;gap:18px"><div><span class="lbl">Before</span><b>${e.b}%</b></div><span class="ico" style="width:20px;height:20px;color:var(--mut)">${I.arrowR}</span><div><span class="lbl">After</span><b>${e.a}%</b></div></div>`:''}<p style="font-size:13.5px;margin-top:${e?8:0}px;color:var(--txt2)">${esc(verdict)}</p></div>`}
        <div class="hzCareF" style="margin:14px 0 4px"><span class="hzRO">${ic(IK.eye)}<span>Read only</span></span><span>${esc(T('Average performance, 3 videos before and after'))}</span></div>`,
      foot:`<button class="btn pri" id="hzVOk">Close</button>`,wire:m=>{ m.querySelector('#hzVOk').onclick=W.closeModal; }}); }

  /* ---------------- Sessions ---------------- */
  let sesK='all';
  function sessionsTab(box){ const h=H, S=sessFor(h), avg=S.length?Math.round(S.reduce((a,s)=>a+s.sc,0)/S.length):0, best=S.length?S.reduce((a,s)=>s.sc>a.sc?s:a):{sc:0};
    const Ls=S.filter(s=>sesK==='all'||(sesK==='show')===s.show);
    box.innerHTML=`${NOSC?'':`<div class="hzStats3" style="margin-bottom:20px"><div class="hzStat"><span class="lbl">Sessions</span><b class="num">${S.length}</b><small>${h.month||0} this month</small></div><div class="hzStat"><span class="lbl">Average</span><b class="num ${C.toneOfScore(avg)}">${avg}%</b><small>every session</small></div><div class="hzStat"><span class="lbl">Best</span><b class="num ${C.toneOfScore(best.sc)}">${best.sc}%</b><small>${best.date?esc(fmt(best.date)):''}</small></div></div>`}
      <section class="card"><div class="cardH"><h2>Sessions <em class="num">${Ls.length}</em></h2><div class="r"><div class="seg" id="hzSK">${[['all','All'],['show','Shows'],['train','Training']].map(([k,l])=>`<button data-k="${k}" class="${sesK===k?'on':''}">${l}</button>`).join('')}</div><button class="btn sm" id="hzSUp">${ic(I.upload,15)}<span>Add a session</span></button></div></div>
      <div class="tbl hzSes${NOSC?' nosc':''}" id="hzSL" style="margin-top:10px"><div class="tr th"><span>Session</span><span>Date</span><span>Length</span>${NOSC?'':'<span>Score</span>'}<span></span></div>
      ${Ls.map(s=>`<a class="tr" href="${W.href('session',{v:s.key})}" data-vk="${esc(s.key||'')}" data-vh="${esc(s.h0?(s.h0.n0||s.h0.n):(h.n0||h.n))}"><span class="cellH">${kic(s.show)}<span class="cell2"><b>${esc(s.show?'Show':'Training')}${s.latest?`<span class="new">${esc(T('Latest'))}</span>`:''}${s.moved?`<span class="new">${esc(T('Moved here'))}</span>`:''}</b><span>${esc(s.what)}</span></span></span>
        <span class="mut">${esc(D.when(s.date))}</span><span class="mut num">${D.durOf(s)}</span>${NOSC?'':`<span class="scB"><span class="bar"><i style="width:${s.sc}%;background:var(--${C.toneOfScore(s.sc)})"></i></span><b class="num">${s.sc}<small>%</small></b></span>`}
        <button class="wIconB more" aria-label="More" data-tip="More">${ic(I.dots,18)}</button></a>`).join('')||`<div class="hEmpty">${esc(T('No session yet.'))}</div>`}</div></section>`;
    box.querySelectorAll('#hzSK button').forEach(b=>b.onclick=()=>{ sesK=b.dataset.k; sessionsTab(box); });
    document.getElementById('hzSUp').onclick=()=>W.openUpload(h.n);
    box.querySelectorAll('.more').forEach(b=>b.onclick=e=>{ e.preventDefault(); e.stopPropagation(); const row=b.closest('[data-vk]');
      if(window.SD_VIDEO_MENU&&row.dataset.vk) SD_VIDEO_MENU(b,row,{axis:'y',refresh:()=>{ SC.clear(); drawTabs(); sessionsTab(box); }}); }); }

  /* ---------------- Trends ---------------- */
  function trendsTab(box,anim){ const m=TR_ALL.find(x=>x.id===trM)||TR_ALL.find(x=>x.id==='s_perf'), X=trInfo(m,H,TS,trP);
    if(trSel==null||!X.P.some(p=>p.i===trSel)) trSel=X.P[X.n-1].i;
    const U=unitOf(m), sp=u=>u==='%'||u==='°'?u:' '+u;
    box.innerHTML=`<section class="card" style="margin-bottom:20px"><div class="cardH" style="min-height:64px"><button class="hzMetB" id="hzMetB" aria-haspopup="listbox"><span class="mi">${metIcon(m,18)}</span><span>${esc(m.l)}</span><span class="ico ch">${I.chev}</span></button>
        <div class="r"><div class="seg" id="hzTrP">${[1,3,6].map(p=>`<button data-p="${p}" class="${p===trP?'on':''}">${p===1?'1 month':p+' months'}</button>`).join('')}</div></div></div>
      <div class="cardB" style="padding-top:4px"><div class="hzTrTop"><div class="hzTrBig" id="hzTrBig"><span class="num">${X.f(X.last)}</span><small>${esc(U)}</small></div><div class="pills"><span class="pill ${X.tone}">${esc(X.word)}</span>${X.isBest?`<span class="pill good">★ <span>${esc(T(`Best in ${trP===1?'a month':trP+' months'}`))}</span></span>`:''}</div></div>
        <div class="hzTrS">${esc(trSentence(X,trP))}</div><div class="hzTrTip" id="hzTrTip"></div><div class="hzCh" id="hzTrCh"></div>
        <div class="hzLeg"><span><i style="background:var(--${X.tone==='blue'?'blue':X.tone})"></i>Show</span><span><i style="border:1.5px solid var(--${X.tone==='blue'?'blue':X.tone});background:var(--card)"></i>Training</span><span><i style="border:1px dashed var(--blue-line);border-radius:3px;width:9px;background:none"></i>Care visit</span><span style="margin-left:auto">${esc(T('Hover the chart to read any session'))}</span></div>
        <div class="hzStats3" style="margin-top:18px"><div class="hzStat"><span class="lbl">${m.better===0?'Highest':'Best'}</span><b class="num">${X.f(X.best.v)}<small>${esc(sp(U))}</small></b><small>${esc(fmtD(X.best.s.date))}</small></div>
          <div class="hzStat"><span class="lbl">Average</span><b class="num">${X.f(X.my)}<small>${esc(sp(U))}</small></b><small>${X.n} sessions</small></div>
          <div class="hzStat"><span class="lbl">Shows</span><b class="num">${X.showAvg==null?'–':X.f(X.showAvg)}<small>${X.showAvg==null?'':esc(sp(U))}</small></b><small>${esc(T(X.showAvg==null?'No show in this period':'average in competition'))}</small></div></div></div></section>
      <div class="hzRow"><section class="card c7"><div class="cardH"><h2>Sessions <em class="num">${X.n}</em></h2><span class="mut" style="font-size:12.5px">${esc(T('Click one to read it on the chart.'))}</span></div><div class="tbl hzSes trl" id="hzTrL" style="margin-top:8px"></div></section>
        <section class="card c5"><div class="cardH"><h2>Care visits on this chart</h2></div><div class="cardB" style="padding-top:6px" id="hzTrCare"></div></section></div>
      <section class="card"><div class="cardH"><h2>Every metric</h2><span class="mut" style="font-size:12.5px">${esc(T(`Over ${trP===1?'the last month':'the last '+trP+' months'}. Click one to open it above.`))}</span></div><div class="cardB" style="padding-top:4px" id="hzMG"></div></section>`;
    const pick=k=>{ const p=X.P[k], tp=document.getElementById('hzTrTip'); trSel=p.i; if(tp) tp.innerHTML=`<b>${esc(p.s.now?T('Latest session'):fmtD(p.s.date))}</b> · <span>${esc(p.s.kind==='Competition'?'Show':'Training')}</span> · <span>${esc(p.s.what)}</span> · <b>${X.f(p.v)}${esc(sp(U))}</b>`;
      document.querySelectorAll('#hzTrL .tr').forEach(r=>r.classList.toggle('sel',+r.dataset.i===trSel)); };
    const ch=trChart(document.getElementById('hzTrCh'),{X,height:300,sel:X.P.findIndex(p=>p.i===trSel),anim,care:true,visit:trVisit,onPick:pick,onVisit:id=>{ trVisit=trVisit===id?null:id; drawCare(); ch.redraw({visit:trVisit}); }});
    document.getElementById('hzTrL').innerHTML=[...X.P].reverse().map(p=>`<a class="tr click${p.i===trSel?' sel':''}" href="#" data-i="${p.i}"><span class="cellH">${kic(p.s.kind==='Competition')}<span class="cell2"><b>${esc(p.s.now?T('Latest session'):fmtD(p.s.date))}</b><span>${esc(p.s.kind==='Competition'?'Show':'Training')} · ${esc(p.s.what)}</span></span></span><span class="mut">${esc(D.when(p.s.date))}</span><b class="num" style="text-align:right">${X.f(p.v)}<small class="mut" style="font-weight:600">${esc(sp(U))}</small></b></a>`).join('');
    document.querySelectorAll('#hzTrL .tr').forEach(r=>r.onclick=e=>{ e.preventDefault(); const k=X.P.findIndex(p=>p.i===+r.dataset.i); ch.select(k); document.getElementById('hzTrCh').scrollIntoView({behavior:RM()?'auto':'smooth',block:'center'}); });
    const drawCare=()=>{ const el=document.getElementById('hzTrCare'), P=X.P, Lv=careOf(H).filter(v=>P.length&&v.d>=P[0].s.date&&v.d<=P[P.length-1].s.date).reverse();
      el.innerHTML=Lv.length?`<div class="mut" style="font-size:12px;margin-bottom:6px">${esc(T('Average of the videos before and after'))}</div>`+Lv.map(v=>{ const bef=P.filter(p=>p.s.date<v.d).slice(-3), aft=P.filter(p=>p.s.date>v.d).slice(0,3);
        let tail=`<span class="pill">${esc(T('Not enough videos yet'))}</span>`;
        if(bef.length&&aft.length){ const a=aft.reduce((s,p)=>s+p.v,0)/aft.length, b=bef.reduce((s,p)=>s+p.v,0)/bef.length, d=a-b, same=Math.abs(d)<(m.sd||1)*.3, good=m.better===0?null:(d>0)===(m.better>0);
          tail=`<span class="pill ${same||good===null?'blue':good?'good':'bad'}">${X.f(b)} → ${X.f(a)}${esc(sp(U))}</span>`; }
        return `<button class="hzCareR${trVisit===v.id?' sel':''}" data-cv="${v.id}"><span class="ci">${CARE.ico(v.type,18)}</span><span class="t"><b class="a">${esc(T(PNAME[v.type]||'Other'))}${v.who?' · '+esc(v.who):''}</b><span class="b">${esc(fmt(v.d))}${v.note?' · '+esc(T(v.note)):''}</span></span>${tail}</button>`; }).join('')
        :`<div class="hEmpty" style="padding:8px 0">${esc(T('No care visit in this period.'))}</div>`;
      el.querySelectorAll('[data-cv]').forEach(b=>b.onclick=()=>{ trVisit=trVisit===b.dataset.cv?null:b.dataset.cv; drawCare(); ch.redraw({visit:trVisit}); }); };
    drawCare();
    /* every metric, by group */
    let g0='', html=''; TR_ALL.forEach(mm=>{ const Y=trInfo(mm,H,TS,trP); if(mm.g!==g0){ html+=(g0?'</div>':'')+`<div class="hzMGl">${esc(T(mm.g))}</div><div class="hzMG">`; g0=mm.g; }
      html+=`<button class="hzMt${mm.id===m.id?' on':''}" data-m="${mm.id}"><span class="h">${metIcon(mm,15)}<span>${esc(mm.l)}</span></span><span class="v"><span class="num">${Y.f(Y.last)}</span><small>${esc(unitOf(mm))}</small></span><span class="wd ${Y.tone}">${esc(Y.word)}</span><span class="sp">${C.spark(Y.P.map(p=>p.v),Y.tone,180,28)}</span></button>`; });
    document.getElementById('hzMG').innerHTML=html+'</div>';
    document.querySelectorAll('#hzMG .hzMt').forEach(b=>b.onclick=()=>{ trM=b.dataset.m; trSel=null; history.replaceState(null,'','#h='+H.id+'&v=trends&m='+trM); trendsTab(box,true); window.scrollTo({top:0,behavior:RM()?'auto':'smooth'}); });
    document.querySelectorAll('#hzTrP button').forEach(b=>b.onclick=()=>{ trP=+b.dataset.p; trSel=null; trendsTab(box,true); });
    document.getElementById('hzMetB').onclick=()=>metricPicker(document.getElementById('hzMetB'),id=>{ trM=id; trSel=null; history.replaceState(null,'','#h='+H.id+'&v=trends&m='+trM); trendsTab(box,true); });
    if(anim&&window.SD_COUNT) SD_COUNT(document.getElementById('hzTrBig')); }
  function metricPicker(btn,onPick){ const list=qq=>{ let g0='', o=''; TR_ALL.filter(m=>!qq||m.l.toLowerCase().includes(qq)||T(m.l).toLowerCase().includes(qq)).forEach(m=>{ if(m.g!==g0){ o+=`<div class="gl">${esc(T(m.g))}</div>`; g0=m.g; }
        o+=`<button class="mi${m.id===trM?' on':''}" data-m="${m.id}">${metIcon(m,17)}<span class="t">${esc(m.l)}</span><span class="ico ck">${I.check}</span></button>`; }); return o||`<div class="gd" style="padding:12px 10px">${esc(T('No metric matches.'))}</div>`; };
    const p=W.pop(btn,`<label class="hzMetS">${I.search}<input id="hzMetQ" placeholder="Search a metric" autocomplete="off"></label><div class="hzMetL" id="hzMetL">${list('')}</div>`,{w:340,align:'left',role:'listbox'}); if(!p) return;
    const wire=()=>p.querySelectorAll('.mi[data-m]').forEach(b=>b.onclick=()=>{ W.closePop(); onPick(b.dataset.m); });
    const qi=p.querySelector('#hzMetQ'); qi.oninput=()=>{ p.querySelector('#hzMetL').innerHTML=list(qi.value.trim().toLowerCase()); wire(); }; wire();
    setTimeout(()=>{ try{ qi.focus({preventScroll:true}); }catch(e){} const on=p.querySelector('.mi.on'); if(on) on.scrollIntoView({block:'center'}); },30); }

  /* the trend chart: points (shows filled, training hollow), the average, care visits, a crosshair that follows the mouse */
  function trChart(el,o){
    const draw=anim=>{ const X=o.X, P=X.P, n=P.length, Wd=Math.max(300,el.clientWidth), Ht=o.height, PL=46, PR=84, PT=o.care?34:14, PB=26;
      const vs=P.map(p=>p.v), lo0=Math.min(...vs), hi0=Math.max(...vs), pad=(hi0-lo0)*.25||X.m.sd, lo=lo0-pad, hi=hi0+pad;
      const Xk=k=>n>1?PL+k/(n-1)*(Wd-PL-PR):(PL+Wd-PR)/2, Y=v=>PT+(1-(v-lo)/(hi-lo))*(Ht-PT-PB), col=`var(--${X.tone})`;
      const raw=(hi-lo)/4, p10=Math.pow(10,Math.floor(Math.log10(raw||1))), step=[1,2,2.5,5,10].map(x=>x*p10).find(x=>raw/x<=1)||10*p10, dec=Math.max(0,-Math.floor(Math.log10(step)+1e-9));
      const ticks=[]; for(let t=Math.ceil(lo/step)*step;t<=hi+1e-9;t+=step) ticks.push(t);
      let months='', lastM=-1;
      P.forEach((p,k)=>{ const mo=p.s.date.getMonth(); if(n<=6){ months+=`<text x="${Math.min(Wd-PR-14,Math.max(PL+14,Xk(k))).toFixed(1)}" y="${Ht-6}" text-anchor="middle" style="fill:var(--axis)" font-size="11" font-weight="600">${esc(fmtD(p.s.date))}</text>`; }
        else if(mo!==lastM){ lastM=mo; months+=`<text x="${Math.min(Wd-PR-12,Math.max(PL+10,Xk(k))).toFixed(1)}" y="${Ht-6}" text-anchor="middle" style="fill:var(--axis)" font-size="11" font-weight="600">${D.MON[mo]}</text>`; } });
      const path=P.map((p,k)=>`${k?'L':'M'}${Xk(k).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' '), ay=Y(X.my), gid='hzg'+Math.random().toString(36).slice(2,7);
      let care='';
      if(o.care&&window.CARE&&n>1){ careOf(H).forEach(v=>{ const d=v.d; if(d<P[0].s.date||d>P[n-1].s.date) return; let x=Xk(n-1);
          for(let k=0;k<n-1;k++){ const a=P[k].s.date, b=P[k+1].s.date; if(d>=a&&d<=b){ x=Xk(k)+(Xk(k+1)-Xk(k))*((d-a)/((b-a)||1)); break; } }
          const on=o.visit===v.id;
          care+=`<g class="cvM" data-v="${v.id}" style="cursor:pointer"><line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${PT-4}" y2="${Ht-PB}" style="stroke:var(--blue)" stroke-opacity="${on?.9:.4}" stroke-width="${on?1.5:1}" stroke-dasharray="3 3"/>
            <circle cx="${x.toFixed(1)}" cy="${PT-14}" r="${on?11:10}" style="fill:${on?'var(--blue)':'var(--card)'};stroke:var(--blue-line)" stroke-width="1.2"/>
            <g transform="translate(${(x-6.5).toFixed(1)} ${PT-20.5})" style="color:${on?'#fff':'var(--blue-ink)'}">${CARE.ico(v.type,13,'currentColor').replace('style="width:13px;height:13px;','width="13" height="13" style="')}</g><title>${esc(T(PNAME[v.type]||'Other'))} · ${esc(fmt(v.d))}</title>
            <rect x="${(x-12).toFixed(1)}" y="${PT-26}" width="24" height="${Ht-PB-PT+26}" fill="transparent"/></g>`; }); }
      el.style.height=Ht+'px';
      el.innerHTML=`<svg width="${Wd}" height="${Ht}" viewBox="0 0 ${Wd} ${Ht}" style="position:absolute;left:0;top:0">
        <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${col}" stop-opacity=".2"/><stop offset="1" style="stop-color:${col}" stop-opacity="0"/></linearGradient></defs>
        ${ticks.map(t=>`<line x1="${PL}" x2="${Wd-PR}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" style="stroke:var(--grid)"/><text x="${PL-10}" y="${(Y(t)+3.5).toFixed(1)}" text-anchor="end" style="fill:var(--axis)" font-size="11">${(+t).toFixed(dec)}</text>`).join('')}
        <line x1="${PL}" x2="${Wd-PR}" y1="${ay.toFixed(1)}" y2="${ay.toFixed(1)}" style="stroke:var(--line3)" stroke-dasharray="4 4"/>
        <text x="${Wd-PR+8}" y="${(ay+4).toFixed(1)}" style="fill:var(--mut)" font-size="11" font-weight="650">${esc(T('Average'))} ${X.f(X.my)}</text>
        ${care}
        <g class="cv"><path d="${path} L${Xk(n-1).toFixed(1)} ${Ht-PB} L${Xk(0).toFixed(1)} ${Ht-PB}Z" fill="url(#${gid})"/><path d="${path}" fill="none" style="stroke:${col}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
          ${P.map((p,k)=>p.s.kind==='Competition'?`<circle cx="${Xk(k).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="4" style="fill:${col};stroke:var(--card)" stroke-width="1.5"/>`:`<circle cx="${Xk(k).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="3" style="fill:var(--card);stroke:${col}" stroke-width="1.6"/>`).join('')}</g>
        <g class="xh" style="pointer-events:none"><line class="xl" y1="${PT}" y2="${Ht-PB}" style="stroke:var(--line3)" stroke-dasharray="3 3"/><circle class="xg" r="10" style="fill:${col}" opacity=".18"/><circle class="xd" r="5.5" style="fill:var(--card);stroke:${col}" stroke-width="2.5"/></g>
        <rect class="hit" x="${PL}" y="${PT}" width="${Wd-PL-PR}" height="${Ht-PT-PB}" fill="transparent" style="cursor:crosshair"/></svg>`;
      const svg=el.firstChild, xl=svg.querySelector('.xl'), xg=svg.querySelector('.xg'), xd=svg.querySelector('.xd');
      const put=k=>{ const x=Xk(k), y=Y(P[k].v); xl.setAttribute('x1',x); xl.setAttribute('x2',x); [xg,xd].forEach(c=>{ c.setAttribute('cx',x); c.setAttribute('cy',y); }); o.sel=k; o.onPick&&o.onPick(k); };
      put(o.sel==null||o.sel<0||o.sel>=n?n-1:o.sel);
      const hit=svg.querySelector('.hit'), near=e=>{ const r=svg.getBoundingClientRect(); return Math.max(0,Math.min(n-1,Math.round((e.clientX-r.left-PL)/(Wd-PL-PR)*(n-1)))); };
      hit.onpointermove=e=>{ const k=near(e); if(k!==o.sel) put(k); }; hit.onclick=e=>put(near(e));
      svg.querySelectorAll('.cvM').forEach(g=>g.onclick=()=>o.onVisit&&o.onVisit(g.dataset.v));
      if(anim&&window.SD_WIPE) SD_WIPE(svg.querySelector('.cv')); };
    draw(o.anim);
    if(window.ResizeObserver){ if(el._ro) el._ro.disconnect(); let w=el.clientWidth; el._ro=new ResizeObserver(()=>{ if(!el.isConnected){ el._ro.disconnect(); return; } if(Math.abs(el.clientWidth-w)>2){ w=el.clientWidth; draw(false); } }); el._ro.observe(el); }
    return {redraw:x=>{ Object.assign(o,x||{}); draw(false); },select:k=>{ o.sel=k; draw(false); }}; }

  /* ---------------- Compare ---------------- */
  const sessLabel=i=>TS[i].now?'Latest session':fmtD(TS[i].date);
  const judge=(m,a,b)=>{ const d=a-b; if(Math.abs(d)<m.sd*.3) return ['Same','same']; const up=d>0; if(m.better===0) return [up?'Higher':'Lower',up?'hi':'lo']; const g=up===(m.better>0); return [g?'Better':'Worse',g?'up':'down']; };
  function cmpShortcut(){ const perf=trSeries(TR_ALL.find(x=>x.id==='s_perf'),H,TS);
    const lastShow=[...TS.keys()].reverse().find(i=>i!==cmpA&&TS[i].kind==='Competition');
    const best=[...TS.keys()].filter(i=>i!==cmpA).reduce((a,i)=>perf[i]>perf[a]?i:a,cmpA?0:1);
    return [['Previous session',Math.max(0,cmpA-1)],['Last show',lastShow],['Best round',best]].filter((x,k,A)=>x[1]!=null&&x[1]!==cmpA&&A.findIndex(y=>y[1]===x[1])===k); }
  function compareTab(box){
    const selB=(i,k,col)=>`<button class="hzSelB" data-k="${k}"><span class="d" style="background:${col}"></span><span class="t"><span class="k">${k==='A'?'Session':'Compared with'}</span><b>${esc(T(sessLabel(i)))}</b><small>${esc(TS[i].kind==='Competition'?'Show':'Training')} · ${esc(TS[i].what)}</small></span><span class="ico ch">${I.chev}</span></button>`;
    let nUp=0,nDown=0,nSame=0,g0='',rows='';
    TR_ALL.forEach(m=>{ const v=trSeries(m,H,TS), a=v[cmpA], b=v[cmpB], f=x=>(+x).toFixed(decOf(m)), [tag,cls]=judge(m,a,b);
      if(cls==='same') nSame++; else if(cls==='up') nUp++; else if(cls==='down') nDown++;
      if(m.g!==g0){ rows+=`<div class="gl">${esc(T(m.g))}</div>`; g0=m.g; }
      rows+=`<a class="tr" href="#" data-m="${m.id}"><span class="cellH" style="gap:10px">${metIcon(m,16)}<span class="nm">${esc(m.l)}${m.u&&m.u!=='%'?`<small>${esc(m.u)}</small>`:''}</span></span><span class="c bb num">${f(b)}${m.u==='%'?'%':''}</span><span class="c a num">${f(a)}${m.u==='%'?'%':''}</span><span style="text-align:right"><span class="hzTag ${cls}">${tag}</span></span><span class="ico" style="width:15px;height:15px;color:var(--dim)">${I.chevR}</span></a>`; });
    const tot=nUp+nDown+nSame, verdict=nUp>nDown?'a better session':(nDown>nUp?'a less good session':'a session of the same level');
    const short=i=>TS[i].now?T('Latest'):fmtD(TS[i].date);
    box.innerHTML=`<div class="hzRow"><section class="card c7"><div class="cardH"><h2>Compare two sessions</h2></div><div class="cardB">
        <div class="hzCmpSel">${selB(cmpA,'A','var(--blue)')}<button class="hzSwap" id="hzSwap" aria-label="Swap the two sessions" data-tip="Swap">${ic(I.swap)}</button>${selB(cmpB,'B','var(--mut)')}</div>
        <div class="hzQuick"><span class="lbl">Quick pick</span>${cmpShortcut().map(([l,i])=>`<button class="chip${i===cmpB?' on':''}" data-i="${i}">${l}</button>`).join('')}</div></div></section>
      <section class="card c5"><div class="cardH"><h2>Result</h2><div class="r"><span class="mut num" style="font-size:12.5px">${tot} ${esc(T('measures we can judge'))}</span></div></div><div class="cardB">
        <div class="hzRes"><div class="tg"><b class="num">${nUp}</b><span>Better</span></div><div class="ts"><b class="num">${nSame}</b><span>Same</span></div><div class="tb"><b class="num">${nDown}</b><span>Worse</span></div></div>
        <p class="hzSum2"><span>Overall,</span> <b>${esc(T(sessLabel(cmpA)==='Latest session'?'the latest session':sessLabel(cmpA)))}</b> <span>was ${verdict} for ${esc(H.n)} than</span> <b>${esc(T(sessLabel(cmpB)))}</b><span>.</span></p></div></section></div>
      <section class="card"><div class="tbl hzCmpT"><div class="tr th"><span>Metric</span><span class="c"><i style="background:var(--mut)"></i>${esc(short(cmpB))}</span><span class="c"><i style="background:var(--blue)"></i>${esc(short(cmpA))}</span><span></span><span></span></div>${rows}</div>
        <div class="cardF"><span>${esc(T('Click a metric to see it through the round, and how it evolves.'))}</span></div></section>`;
    box.querySelectorAll('.hzSelB').forEach(b=>b.onclick=()=>sessPicker(b,b.dataset.k,box));
    document.getElementById('hzSwap').onclick=()=>{ [cmpA,cmpB]=[cmpB,cmpA]; compareTab(box); };
    box.querySelectorAll('.hzQuick .chip').forEach(c=>c.onclick=()=>{ cmpB=+c.dataset.i; compareTab(box); });
    box.querySelectorAll('.hzCmpT a.tr').forEach(r=>r.onclick=e=>{ e.preventDefault(); cmpDetail(r.dataset.m); }); }
  function sessPicker(btn,k,box){ const cur=k==='A'?cmpA:cmpB, other=k==='A'?cmpB:cmpA;
    const p=W.pop(btn,`<div class="gl">${esc(T(k==='A'?'Session':'Compared with'))}</div><div style="max-height:min(420px,60vh);overflow-y:auto">`+[...TS.keys()].reverse().filter(i=>i!==other).map(i=>`<button class="mi${i===cur?' on':''}" data-i="${i}"><span class="kic ${TS[i].kind==='Competition'?'show':''}" style="width:30px;height:30px;border-radius:9px">${SD_KIC(TS[i].kind)}</span><span class="t">${esc(T(sessLabel(i)))}<small>${esc(TS[i].kind==='Competition'?'Show':'Training')} · ${esc(TS[i].what)}</small></span><span class="ico ck">${I.check}</span></button>`).join('')+'</div>',{w:Math.max(300,btn.offsetWidth),align:'left'});
    if(p) p.querySelectorAll('.mi').forEach(b=>b.onclick=()=>{ const i=+b.dataset.i; if(k==='A') cmpA=i; else cmpB=i; W.closePop(); compareTab(box); }); }
  function cdCurve(m,i,mean){ let seed=(m.id+'#'+i).split('').reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7)%233280; const rnd=()=>{seed=(seed*9301+49297)%233280; return seed/233280;};
    const ph=rnd()*6, f1=.6+rnd()*.5, f2=1.4+rnd()*.8, tilt=(rnd()-.5)*1.2, raw=Array.from({length:24},(_,k)=>Math.sin(k*f1/3+ph)*.6+Math.sin(k*f2/3+ph*2)*.3+tilt*(k/23-.5)), av0=raw.reduce((a,x)=>a+x,0)/raw.length;
    return raw.map(x=>mean+(x-av0)*m.sd*.9); }
  function cmpDetail(id){ const m=TR_ALL.find(x=>x.id===id), v=trSeries(m,H,TS), a=v[cmpA], b=v[cmpB], f=x=>(+x).toFixed(decOf(m)), U=unitOf(m), [tag,cls]=judge(m,a,b);
    const unitW=SD_PCT(m.u)?'points':(m.u||''), la=sessLabel(cmpA), lb=sessLabel(cmpB);
    const sent=cls==='same'?`${m.l} was about the same in both sessions.`:`${m.l} was ${f(Math.abs(a-b))} ${unitW} ${a>b?'higher':'lower'} on ${la==='Latest session'?'the latest session':la} than on ${lb}${cls==='up'?', a step forward.':(cls==='down'?', worth a look.':'.')}`;
    const A=cdCurve(m,cmpA,a), B=cdCurve(m,cmpB,b), all=[...A,...B], lo=Math.min(...all), hi=Math.max(...all), pad=(hi-lo)*.15||m.sd, Wd=740, Ht=200;
    const X=k=>40+k/23*(Wd-56), Y=y=>Ht-30-(y-(lo-pad))/((hi+pad)-(lo-pad))*(Ht-46), path=arr=>arr.map((y,k)=>`${k?'L':'M'}${X(k).toFixed(1)} ${Y(y).toFixed(1)}`).join(' ');
    const thirds=[['Start of the round',0,8],['Middle of the round',8,16],['End of the round',16,24]], avg=(arr,s0,s1)=>arr.slice(s0,s1).reduce((x,y)=>x+y,0)/(s1-s0);
    const parts=thirds.map(([l,s0,s1])=>{ const x=avg(A,s0,s1), y=avg(B,s0,s1), [t,c]=judge(m,x,y); return {l,x,y,t,c,gap:Math.abs(x-y)}; }), big=parts.reduce((p,q)=>q.gap>p.gap?q:p);
    const rm=RM(), line=(d,col,w,delay)=>`<path d="${d}" fill="none" style="stroke:${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${rm?0:1}">${rm?'':`<animate attributeName="stroke-dashoffset" from="1" to="0" dur=".9s" begin="${delay}s" fill="freeze" calcMode="spline" keySplines=".23 1 .32 1" keyTimes="0;1"/>`}</path>`;
    const box=(i,val,col)=>`<div class="s"><div class="k"><i style="background:${col}"></i>${esc(T(sessLabel(i)))}</div><div class="v num">${f(val)}<small>${esc(U)}</small></div><div class="w">${esc(TS[i].kind==='Competition'?'Show':'Training')} · ${esc(TS[i].what)}</div></div>`;
    W.modal({title:m.l,wide:true,icon:`<span class="ico" style="width:42px;height:42px;border-radius:12px;background:var(--blue-bg);color:var(--blue-ink);padding:10px">${metIcon(m,22)}</span>`,sub:esc(T(m.g)),
      body:`<div class="hzVs">${box(cmpB,b,'var(--mut)')}<div class="mid"><span class="ico" style="width:20px;height:20px">${I.arrowR}</span><span class="hzTag ${cls}">${tag}</span></div>${box(cmpA,a,'var(--blue)')}</div>
        <p class="hzSum2">${esc(sent)}</p>
        <div class="lbl" style="margin-top:20px">Through the round</div>
        <svg viewBox="0 0 ${Wd} ${Ht}" style="width:100%;height:auto;margin-top:8px;overflow:visible">${[8,16].map(k=>`<line x1="${X(k-.5)}" x2="${X(k-.5)}" y1="10" y2="${Ht-30}" style="stroke:var(--grid)" stroke-dasharray="3 4"/>`).join('')}
          ${line(path(B),'var(--mut)',2,0)}${line(path(A),'var(--blue)',2.6,.15)}<line x1="40" x2="${Wd-16}" y1="${Ht-30}" y2="${Ht-30}" style="stroke:var(--line2)"/>
          ${thirds.map(([l,s0,s1])=>`<text x="${(X(s0)+X(s1-1))/2}" y="${Ht-10}" text-anchor="middle" style="fill:var(--axis)" font-size="11.5" font-weight="600">${esc(T(l.split(' ')[0]))}</text>`).join('')}</svg>
        <div class="hzLeg"><span><i style="background:var(--mut)"></i>${esc(T(lb))}</span><span><i style="background:var(--blue)"></i>${esc(T(la))}</span></div>
        <div class="lbl" style="margin-top:20px">Where the difference is</div>
        <div class="tbl hzParts" style="margin-top:4px">${parts.map(r=>`<div class="tr"><span class="cell2"><b>${esc(T(r.l))}${r===big&&r.c!=='same'?`<span class="hzBig">${esc(T('Biggest gap'))}</span>`:''}</b></span><span class="mut num">${f(r.y)} → ${f(r.x)}${esc(U==='%'||U==='°'?U:' '+U)}</span><span style="text-align:right"><span class="hzTag ${r.c}">${r.t}</span></span></div>`).join('')}</div>`,
      foot:`<button class="btn" id="hzCdX">Close</button><button class="btn pri" id="hzCdTr">${ic(IK.trends)}<span>See how it evolves over time</span></button>`,
      wire:md=>{ md.querySelector('#hzCdX').onclick=W.closeModal; md.querySelector('#hzCdTr').onclick=()=>{ W.closeModal(); trM=id; trSel=cmpA; tab='trends'; history.replaceState(null,'','#h='+H.id+'&v=trends&m='+id); drawTabs(); drawTab(true); window.scrollTo({top:0,behavior:RM()?'auto':'smooth'}); }; }}); }

  /* =====================================================================
     EDIT A HORSE, ADD A HORSE
     ===================================================================== */
  const BREEDS=['KWPN','Holsteiner','Hanoverian','Oldenburg','Westphalian','Trakehner','Selle Français','BWP','SBS','Zangersheide','Irish Sport Horse','Irish Draught','Swedish Warmblood','Danish Warmblood','Dutch Harness Horse','Thoroughbred','Anglo-Arab','Arabian','AES','CH (Swiss Warmblood)','Polish Warmblood','Czech Warmblood','Rheinlander','Mecklenburg','Brandenburg','Württemberger','Bavarian Warmblood','Hessian Warmblood','Austrian Warmblood','Belgian Warmblood (other)','Anglo-Norman','Lusitano','PRE (Pura Raza Española)','Connemara','Welsh pony','German Riding Pony','New Forest pony','Other pony','Other'];
  const COATS=['Bay','Dark bay','Chestnut','Liver chestnut','Grey','Dapple grey','Flea-bitten grey','Black','Brown','Palomino','Buckskin','Dun','Roan','Bay roan','Strawberry roan','Pinto / Skewbald','Piebald','Appaloosa','Cremello','Perlino','Champagne','Other'];
  const SHOES=['All four','Front only','Hind only','Barefoot'];
  const HSHOE='<path d="M19 4h1V1h-4v3s2 4 2 8s-2 7-6 7s-6-3-6-7s2-8 2-8V1H4v3h1S2 8 2 14c0 5 5 9 10 9s10-4 10-9c0-6-3-10-3-10M4 13c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m2 6c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m6 3c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m6-3c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m2-6c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1"/>';
  const shoeSvg=k=>{ const f=k==='All four'||k==='Front only', h=k==='All four'||k==='Hind only';
    const foot=(x,y,on)=>on?`<g transform="translate(${x} ${y}) scale(.72)" style="fill:var(--blue)">${HSHOE}</g>`:`<ellipse cx="${x+8.6}" cy="${y+9}" rx="6.4" ry="7.2" fill="none" style="stroke:var(--line3)" stroke-width="1.4" stroke-dasharray="2.4 2.2"/>`;
    return `<svg viewBox="0 0 44 40">${foot(2,1,f)}${foot(24,1,f)}${foot(2,21,h)}${foot(24,21,h)}</svg>`; };
  const norm=x=>String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  /* a searchable list: the field shows the choice, a click opens the list with a search */
  function picker(o){ /* o: {k, list, ph, sph, get, set, open, onToggle} */
    const v=o.get();
    return `<div class="hzPick" data-pk="${o.k}"><button type="button" class="dd${o.open?' on':''}"><span class="t">${v?esc(T(v)):`<span class="ph">${esc(T(o.ph))}</span>`}</span><span class="ico">${I.chev}</span></button>
      ${o.open?`<div class="hzPickL"><label class="s">${I.search}<input placeholder="${esc(T(o.sph))}" autocomplete="off"></label><div class="rs"></div></div>`:''}</div>`; }
  function wirePicker(root,o){ const w=root.querySelector(`.hzPick[data-pk="${o.k}"]`); if(!w) return;
    w.querySelector('.dd').onclick=()=>o.onToggle();
    const rs=w.querySelector('.rs'); if(!rs) return; const inp=w.querySelector('input');
    const draw=()=>{ const qq=norm(inp.value.trim()), Ls=o.list.filter(x=>!qq||norm(x).includes(qq)||norm(T(x)).includes(qq)), cur=o.get();
      rs.innerHTML=Ls.length?Ls.map(x=>`<button type="button" class="${cur===x?'on':''}" data-v="${esc(x)}"><span>${esc(T(x))}</span>${cur===x?`<span class="ico">${I.check}</span>`:''}</button>`).join(''):`<div class="e">${esc(T('No match. Pick Other.'))}</div>`;
      rs.querySelectorAll('button').forEach(b=>b.onclick=()=>o.set(b.dataset.v)); };
    inp.oninput=draw; draw(); setTimeout(()=>{ try{ inp.focus({preventScroll:true}); }catch(e){} },30); }

  function openEdit(h){ const F={n:window.SD_HNAME?SD_HNAME(h):h.n,breed:h.breed&&h.breed!=='–'?h.breed:'',age:h.age&&h.age!=='–'?h.age:'',sex:h.sex||'Mare',coat:h.coat&&h.coat!=='–'?h.coat:'',height:h.height||'',weight:h.weight||'',shoes:h.shoes||'All four'};
    let pk=null;
    const body=m=>{ const B=m.querySelector('.mB');
      B.innerHTML=`<div class="hzL" style="margin-top:0">Name</div><input class="hzIn" id="edN" value="${esc(F.n)}" autocomplete="off">
        <div class="hz2"><div><div class="hzL">Breed</div>${picker({k:'breed',ph:'Pick a breed or studbook',sph:'Search a breed or studbook',get:()=>F.breed,open:pk==='breed'})}</div><div><div class="hzL">Age</div><div class="hzIU"><input class="hzIn" id="edA" type="number" inputmode="numeric" value="${esc(F.age)}"><span>years</span></div></div></div>
        <div class="hz2"><div><div class="hzL">Sex</div><select class="hzIn" id="edS">${['Mare','Gelding','Stallion'].map(o=>`<option${o===F.sex?' selected':''} value="${o}">${esc(T(o))}</option>`).join('')}</select></div><div><div class="hzL">Coat</div>${picker({k:'coat',ph:'Pick a coat',sph:'Search a coat',get:()=>F.coat,open:pk==='coat'})}</div></div>
        <div class="hz2"><div><div class="hzL">Height</div><div class="hzIU"><input class="hzIn" id="edH" type="number" inputmode="numeric" value="${esc(F.height)}"><span>cm</span></div></div><div><div class="hzL">Weight</div><div class="hzIU"><input class="hzIn" id="edW" type="number" inputmode="numeric" value="${esc(F.weight)}"><span>kg</span></div></div></div>
        <div class="hzL">Shoes</div><div class="hzOpt c4">${SHOES.map(s=>`<button type="button" class="${F.shoes===s?'on':''}" data-sh="${s}">${shoeSvg(s)}<span style="color:inherit;font-weight:650;font-size:12.5px">${esc(T(s))}</span></button>`).join('')}</div>`;
      const v=id=>B.querySelector('#'+id);
      v('edN').oninput=e=>F.n=e.target.value; v('edA').oninput=e=>F.age=e.target.value; v('edS').onchange=e=>F.sex=e.target.value; v('edH').oninput=e=>F.height=e.target.value; v('edW').oninput=e=>F.weight=e.target.value;
      B.querySelectorAll('[data-sh]').forEach(b=>b.onclick=()=>{ F.shoes=b.dataset.sh; body(m); });
      [['breed',BREEDS],['coat',COATS]].forEach(([k,list])=>wirePicker(B,{k,list,get:()=>F[k],set:x=>{ F[k]=x; pk=null; body(m); },onToggle:()=>{ pk=pk===k?null:k; body(m); }})); };
    W.modal({title:T('Edit horse details'),sub:esc(h.n),body:'',foot:`<button class="btn" id="edX">Cancel</button><button class="btn pri" id="edOk">Save</button>`,wire:m=>{ body(m);
      m.querySelector('#edX').onclick=W.closeModal;
      m.querySelector('#edOk').onclick=()=>{ if(!h.n0) h.n0=h.n; h.breed=F.breed||h.breed; h.age=+F.age||h.age; h.sex=F.sex; h.coat=F.coat||h.coat; h.height=+F.height||h.height; h.weight=+F.weight||h.weight; h.shoes=F.shoes;
        if(window.SD_EDIT_HORSE) SD_EDIT_HORSE(h.id,{n0:h.n0,n:F.n.trim()||(window.SD_HNAME?SD_HNAME(h):h.n),breed:h.breed,age:h.age,sex:h.sex,coat:h.coat,height:h.height,weight:h.weight,shoes:h.shoes}); else h.n=F.n.trim()||h.n;
        W.closeModal(); H=null; horsePage(h,tab); toast(T('Saved')); }; }}); }

  /* add a horse: the phone's steps, as a dialog. Premium: one horse, so the step up to Pro.
     Pro: the horse is yours (Assign to shows you only). Stable Owner: assign it to a person of the team, or invite one.
     Rider, vet, farrier, trainer, horse owner: first, for the stable or for My Horses; a groom adds for the stable. */
  function openAddHorse(){
    if(PREM){ window.openUpsellHorse&&openUpsellHorse(); return; }
    const ASSIGN=!TABS, LAST=ASSIGN?4:3;
    const ME=window.SD_MYNAME||'Marie S.', USERS=[{n:ME,r:'You · account owner',ini:ME.replace('Dr. ','').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()},{n:'John Doe',r:'Rider',ini:'JD'},{n:'Lea Martin',r:'Rider',ini:'LM'},{n:'Paul Girard',r:'Groom',ini:'PG'},{n:'Dr. Anne Keller',r:'Vet',ini:'AK'}];
    const SN=['Name & photo','About · sex, age, breed','Body & feet','Sport · optional','Who is it for'];
    const F={name:'',breed:'',year:'',sex:null,coat:null,level:null,photo:null,height:'',weight:'',shoes:null,rider:USERS[0].n,email:''};
    let st=0, mode=TABS?(GROOM?'stable':null):'stable', pk=null, ddOpen=false, inv=false, lastSt=-1;
    const NM=()=>F.name.trim()||T('your horse');
    const draw=m=>{ const B=m.querySelector('.mB'), anim=st!==lastSt?' hzStepIn':''; lastSt=st;
      if(!mode){ B.innerHTML=`<div class="hzStepIn"><div class="hzQ">${esc(T('Where does this horse go?'))}</div><div class="hzQs">${esc(T('You can follow horses of the stable and horses of your own. They are never mixed.'))}</div>
          <div class="hzWhere" style="margin-top:18px"><button data-m="stable"><span class="i st">${ic(W.I.stable)}</span><span><b>${esc(T('For'))} ${esc(window.SD_STABLE)}</b><span>${esc(SD_OWNERIZE(T('Marie S. sees it. It joins the stable and counts in its numbers.')))}</span></span></button>
          <button data-m="own"><span class="i own">${ic(IK.lock)}</span><span><b>${esc(T('For My Horses'))}</b><span>${esc(T('Only you see it. It is not part of the stable and does not count in its numbers.'))}</span></span></button></div></div>`;
        B.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ mode=b.dataset.m; lastSt=-1; draw(m); }); foot(m); return; }
      const ban=TABS?`<div class="hzBan ${mode==='own'?'own':'st'}">${mode==='own'?`<b>${esc(T('For My Horses'))}</b> · <span>${esc(T('Only you see it. It is not part of the stable and does not count in its numbers.'))}</span>`:`<b>${esc(T('For'))} ${esc(window.SD_STABLE)}</b> · <span>${esc(SD_OWNERIZE(T('Marie S. sees it. It joins the stable and counts in its numbers.')))}</span>`}</div>`:'';
      const bar=`<div class="hzStepBar">${Array.from({length:LAST+1},(_,i)=>`<i class="${i<=st?'on':''}"></i>`).join('')}</div><div class="hzStepN"><span>Step ${st+1} of ${LAST+1}</span> · <span>${esc(T(SN[st]))}</span></div>`;
      let c='';
      if(st===0) c=`<div class="hzQ">${esc(T("What's your horse called?"))}</div><div class="hzQs">${esc(T('A name and, if you like, a photo so you spot it at a glance.'))}</div>
        <div class="hzPhA"><button type="button" class="box" id="ahPh">${F.photo?`<img src="${esc(F.photo)}" alt="">`:ic(IK.cam)}</button><div><b>${esc(T(F.photo?'Change the photo':'Add a photo'))}</b><small>${esc(T('Optional'))}</small></div><input type="file" id="ahPhIn" accept="image/*" hidden></div>
        <div class="hzL">Name</div><input class="hzIn big" id="ahN" placeholder="Horse name" value="${esc(F.name)}" autocomplete="off" autofocus>`;
      if(st===1){ const age=+F.year?2026-(+F.year):null;
        c=`<div class="hzQ">${esc(`About ${NM()}`)}</div><div class="hzQs">${esc(T('Sex is needed, the rest helps us read the results.'))}</div>
        <div class="hzL">Sex</div><div class="hzOpt c3">${[['Mare','Female'],['Gelding','Castrated male'],['Stallion','Entire male']].map(([v,s])=>`<button type="button" class="${F.sex===v?'on':''}" data-sex="${v}">${esc(T(v))}<span>${esc(T(s))}</span></button>`).join('')}</div>
        <div class="hzL">Born in <em>optional</em></div><div class="hzYr"><button type="button" data-y="-1" aria-label="Earlier">−</button><input class="hzIn" id="ahY" inputmode="numeric" maxlength="4" placeholder="2016" value="${esc(F.year)}"><button type="button" data-y="1" aria-label="Later">+</button><span class="age" id="ahAge">${age&&age>0&&age<40?`${age} years old`:esc(T('Use − and + or type the year'))}</span></div>
        <div class="hzL">Breed <em>optional</em></div>${picker({k:'breed',ph:'Pick a breed or studbook',sph:'Search a breed or studbook',get:()=>F.breed,open:pk==='breed'})}`; }
      if(st===2) c=`<div class="hzQ">${esc(T('Body & feet'))}</div><div class="hzQs">${esc(`We use them to read stride length and jump height for ${NM()}.`)}</div>
        <div class="hz2"><div><div class="hzL">Height</div><div class="hzIU"><input class="hzIn" id="ahH" inputmode="numeric" maxlength="3" placeholder="168" value="${esc(F.height)}"><span>cm</span></div></div><div><div class="hzL">Weight <em>optional</em></div><div class="hzIU"><input class="hzIn" id="ahW" inputmode="numeric" maxlength="4" placeholder="580" value="${esc(F.weight)}"><span>kg</span></div></div></div>
        <div class="hzHelp">${esc(T('Height measured at the withers, in centimetres. StrydeUp needs it to measure strides and jumps.'))}</div>
        <div class="hzL">Shoes <em>optional</em></div><div class="hzOpt c4">${SHOES.map(s=>`<button type="button" class="${F.shoes===s?'on':''}" data-sh="${s}">${shoeSvg(s)}<span style="color:inherit;font-weight:650;font-size:12.5px">${esc(T(s))}</span></button>`).join('')}</div>`;
      if(st===3) c=`<div class="hzQ">${esc(`${NM()} in sport`)}</div><div class="hzQs">${esc(T('Skip it if your horse does not compete yet.'))}</div>
        <div class="hzL">Competing at <em>optional</em></div><div class="chips">${['Young horse','1.10 m','1.20 m','1.30 m','1.40 m','1.50 m','1.60 m'].map(v=>`<button type="button" class="chip${F.level===v?' on':''}" data-lv="${v}">${esc(T(v))}</button>`).join('')}</div>
        <div class="hzL">Coat <em>optional</em></div>${picker({k:'coat',ph:'Pick a coat',sph:'Search a coat',get:()=>F.coat,open:pk==='coat'})}`;
      if(st===4){ const u=USERS.find(x=>x.n===F.rider)||USERS[0], age=+F.year?2026-(+F.year):null;
        c=`<div class="hzQ">${esc(`Who is ${NM()} for?`)}</div><div class="hzQs">${esc(T(SOLO?'You see its sessions and get its alerts.':'They see its sessions and get its alerts.'))}</div>
        <div class="hzL">Assign to</div>${SOLO?`<div class="hzUsr on" style="cursor:default"><span class="av">${esc(USERS[0].ini)}</span><span class="t"><b>${esc(USERS[0].n)}</b><small>${esc(T(USERS[0].r))}</small></span><span class="ico ck">${I.check}</span></div>
          <div class="hzHelp">${esc(T('Pro and Premium are for one person: the horse is yours. Giving a horse to someone else comes with the Stable Account.'))}</div>`
          :`<div class="hzUsrs">${USERS.map(x=>`<button type="button" class="hzUsr${x.n===u.n&&!inv?' on':''}" data-u="${esc(x.n)}"><span class="av">${esc(x.ini)}</span><span class="t"><b>${esc(x.n)}</b><small>${esc(T(x.r))}</small></span>${x.n===u.n&&!inv?`<span class="ico ck">${I.check}</span>`:''}</button>`).join('')}
            <button type="button" class="hzUsr${inv?' on':''}" id="ahInv"><span class="av" style="color:var(--blue-ink)">+</span><span class="t"><b>${esc(T('Invite someone'))}</b><small>${esc(T('By email'))}</small></span></button></div>
            ${inv?`<div class="hzL">Invite by email</div><input class="hzIn" id="ahEm" type="email" placeholder="name@stable.com" value="${esc(F.email)}" autocomplete="off">`:''}`}
        <div class="hzRecap"><span class="hzAv">${F.photo?`<img src="${esc(F.photo)}" alt="">`:esc(ini({n:F.name||'?'}))}</span><span><b>${esc(F.name.trim())}</b><small>${esc([F.sex?T(F.sex):null,age?`${age} years`:null,F.breed?T(F.breed):null,+F.height?F.height+' cm':null,F.shoes?T(F.shoes):null,F.level?T(F.level):null].filter(Boolean).join(' · '))}</small></span></div>`; }
      B.innerHTML=ban+bar+`<div class="${anim.trim()}">${c}</div>`;
      const $=id=>B.querySelector('#'+id), bind=(id,k,after)=>{ const e=$(id); if(e) e.oninput=()=>{ F[k]=e.value; after&&after(); foot(m); }; };
      bind('ahN','name'); bind('ahH','height'); bind('ahW','weight'); bind('ahEm','email');
      bind('ahY','year',()=>{ const a=+F.year?2026-(+F.year):null; $('ahAge').textContent=a&&a>0&&a<40?`${a} years old`:T('Use − and + or type the year'); });
      if($('ahPh')) $('ahPh').onclick=()=>$('ahPhIn').click(); if($('ahPhIn')) $('ahPhIn').onchange=e=>{ const f=e.target.files[0]; if(f){ F.photo=URL.createObjectURL(f); draw(m); } };
      B.querySelectorAll('[data-sex]').forEach(b=>b.onclick=()=>{ F.sex=b.dataset.sex; draw(m); });
      B.querySelectorAll('[data-sh]').forEach(b=>b.onclick=()=>{ F.shoes=F.shoes===b.dataset.sh?null:b.dataset.sh; draw(m); });
      B.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{ F.level=F.level===b.dataset.lv?null:b.dataset.lv; draw(m); });
      B.querySelectorAll('.hzYr > button').forEach(b=>b.onclick=()=>{ const y=(+F.year||2016)+ +b.dataset.y; if(y>=1996&&y<=2025){ F.year=String(y); draw(m); } });
      B.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{ F.rider=b.dataset.u; inv=false; draw(m); });
      if($('ahInv')) $('ahInv').onclick=()=>{ inv=true; draw(m); setTimeout(()=>{ const e=B.querySelector('#ahEm'); if(e) e.focus(); },40); };
      [['breed',BREEDS],['coat',COATS]].forEach(([k,list])=>wirePicker(B,{k,list,get:()=>F[k],set:x=>{ F[k]=F[k]===x?(k==='breed'?'':null):x; pk=null; draw(m); },onToggle:()=>{ pk=pk===k?null:k; draw(m); }}));
      if(st===0&&$('ahN')) setTimeout(()=>{ try{ $('ahN').focus({preventScroll:true}); }catch(e){} },40);
      foot(m); };
    const foot=m=>{ const f=m.querySelector('.mF'); if(!mode){ f.innerHTML=`<button class="btn" id="ahX">Cancel</button>`; f.querySelector('#ahX').onclick=W.closeModal; return; }
      let ok=true, hint=''; if(st===0){ ok=!!F.name.trim(); hint=ok?'':'Give the horse a name'; } if(st===1){ ok=!!F.sex; hint=ok?'':'Pick mare, gelding or stallion'; }
      if(st===2){ const hh=+F.height; ok=hh>=120&&hh<=200; hint=ok?'':(F.height?'Height between 120 and 200 cm':'Add the height at the withers'); }
      if(st===4&&inv){ ok=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(F.email.trim()); hint=ok?'':'Add their email'; }
      f.innerHTML=`<span class="hzHint">${esc(T(hint))}</span>${st||(TABS&&!GROOM)?`<button class="btn ghost" id="ahBk">Back</button>`:''}${st===3?`<button class="btn" id="ahSk">Skip</button>`:''}<button class="btn pri" id="ahGo" ${ok?'':'disabled'}>${st===LAST?`<span>${esc(`Add ${F.name.trim()}`)}</span>`:'<span>Continue</span>'}</button>`;
      const bk=f.querySelector('#ahBk'); if(bk) bk.onclick=()=>{ if(st===0){ mode=null; } else st--; pk=null; draw(m); };
      const sk=f.querySelector('#ahSk'); if(sk) sk.onclick=()=>{ st++; pk=null; draw(m); };
      f.querySelector('#ahGo').onclick=()=>{ if(f.querySelector('#ahGo').disabled) return; if(st<LAST){ st++; pk=null; draw(m); } else finish(); }; };
    const finish=()=>{ const n=F.name.trim(), who=inv&&F.email.trim()?F.email.trim():F.rider, yr=+F.year;
      if(mode==='own'){ SD_ADD_PERSONAL({...F,name:n}); PERS=D.personal().map(fill); view='own'; }
      else { const nh={id:'n'+Date.now(),n,breed:F.breed||'–',age:yr?2026-yr:'–',sex:F.sex,coat:F.coat||'–',level:F.level||'–',height:+F.height||null,weight:+F.weight||null,shoes:F.shoes||null,photo:F.photo||null,
          r:TABS?(PLAN==='rider'?(window.SD_MYNAME||'John Doe'):window.SD_OWNER):who,perf:null,d:0,lastD:999,month:0};
        if(MULTI) nh.st=SD_STABLE_SEL()==='all'?'ms':SD_STABLE_SEL(); ALLH.push(nh); (window.SD_HN=window.SD_HN||[]).push(n); view='stable'; }
      W.closeModal(); history.replaceState(null,'',view==='own'?'#v=own':location.pathname+location.search); listPage();
      setTimeout(()=>toast(!SOLO&&!TABS&&who!==USERS[0].n?`${n} added for ${who}`:`${n} added`,'Add its first session',()=>W.openUpload(n)),RM()?0:240); };
    W.modal({title:T('Add a horse'),sub:'',body:'',foot:' ',wire:m=>{ m.style.width='min(620px,calc(100vw - 32px))'; draw(m); }}); }

  /* =====================================================================
     ROUTING
     ===================================================================== */
  function route(force){ const q0=new URLSearchParams(location.hash.slice(1)); let id=q0.get('h');
    if(PREM&&(!id||!findH(id))) id=(ALLH[0]||{}).id;
    const h=id?findH(id):null;
    if(h){ if(force) H=null; horsePage(h,q0.get('v')||'overview',q0.get('m')); if(!force&&!q0.get('v')) window.scrollTo(0,0); return; }
    if(h3){ try{ h3.destroy(); }catch(e){} h3=null; } H=null;
    if(TABS) view=q0.get('v')==='own'?'own':'stable';
    listPage(); window.scrollTo(0,0); }
  /* for the parity check with the phone (web/check-parity.py style): the generators of this page */
  W.HZ={findH,sessFor,horseSess,trSeries,trInfo,kpStates,alertsOf,TR_ALL,swData};
  addEventListener('hashchange',()=>route(false));
  W.onTheme=()=>{ if(H&&document.getElementById('hzTab')) drawTab(false); };
  route(false);
})();
