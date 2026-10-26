/* StrydeUp desktop web app, Sessions: every session of the account, as on the phone (Etape 4 - Sessions.html).
   On top the month at a glance, the three rings of the phone: average score, this month against last month, shows · training.
   Then one table: date, horse, rider, kind, class or work, course type, score, key metric, length, status.
   Filters: All / Shows / Training, the stable (vet, farrier), the rider (Stable Owner), the horse, a period, a search.
   Each row opens the session analysis (session.html?v=<key>); on hover: open, change horse, delete (plan.js, same as the phone).
   The failed analysis and the videos being analysed sit on top; a new upload (upload.js) joins them as Analysing.
   The sessions come from the SAME generator and seed as the mobile Sessions page, so every count and average is the phone's. */
(function(){
  const W=window.SDW, D=window.SD_DATA, C=window.SDC, T=W.T, esc=W.esc, I=W.I;
  const PLAN=W.PLAN, ACC=W.ACC, MULTI=!!window.SD_MULTI, OWNER=PLAN==='owner', GROOM=ACC==='groom';
  const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page=document.getElementById('wPage');
  const TODAY=D.TODAY, DAY=864e5, MON=D.MON;
  const ER=window.SDW_ERRIC||{};
  const L=(d,sw)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw||1.7}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IX={trash:L('<path d="M4.5 6.5h15M9.5 6.5V4.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7M6.5 6.5l.8 12.2c.1 1 .9 1.8 1.9 1.8h5.6c1 0 1.8-.8 1.9-1.8l.8-12.2M10 10.5v6M14 10.5v6"/>'),
    open:L('<path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/>'), cal:L('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
    x:L('<path d="M7 7l10 10M17 7 7 17"/>',1.9), sort:L('<path d="m8 10 4-4 4 4M8 14l4 4 4-4"/>',1.7), up:L('<path d="m7 14 5-5 5 5"/>',2), down:L('<path d="m7 10 5 5 5-5"/>',2)};
  const ini=h=>h.ini||String(h.n).split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();

  /* ---------- the sessions, the mobile Sessions generator (with its "to watch" draw, so the dates are the phone's) ---------- */
  const WHAT_T=['Course','Grid work','Jumping','Flatwork'], WHAT_S=['1.30 m','1.35 m','1.40 m','1.45 m','1.50 m'], VEN=['Lier','Opglabbeek','Valkenswaard','Chantilly'];
  function sessionsOf(h){ const rnd=D.rng(h.id+'s'), n=26, sc=D.hist(h,n), out=[]; let day=h.lastD;
    for(let i=n-1;i>=0;i--){ const d=new Date(TODAY); d.setDate(d.getDate()-day); const show=rnd()<.35;
      let ht=null, ven=null, what; if(show){ ht=WHAT_S[Math.floor(rnd()*5)]; ven=VEN[Math.floor(rnd()*4)]; what=ht+', '+ven; } else what=WHAT_T[Math.floor(rnd()*4)];
      out.push({h, date:d, show, what, ht, ven, sc:sc[i], issues:Math.floor(rnd()*3)}); day+=3+Math.floor(rnd()*6); }
    return out; }
  const HORSES=D.ALL;                                   /* every horse of the account (planHorses, as mobile) */
  const RAW=(window.SD_ALLH||HORSES).flatMap(sessionsOf);
  /* deleted videos out, moved ones on their right horse (plan.js) */
  const vfix=()=>(window.SD_VFIX?SD_VFIX(RAW,HORSES):RAW.filter(s=>HORSES.includes(s.h))).sort((a,b)=>b.date-a.date);
  /* what the phone does not draw: the course type of a show and the key metric, from their own seed (the phone's numbers stay untouched) */
  const CT=['Table A','Grand Prix','Jump-Off','Two-Phase','Two-Phase Special','Nations Cup / Team Competition','Accumulator / Joker','Derby'], CTW=[6,3,5,2,1,1,1,1];
  function extra(s){ if(s._x===s.key) return s; s._x=s.key; const r=D.rng((s.key||s.h.id)+'x');
    if(s.show){ let t=r()*CTW.reduce((a,b)=>a+b,0), k=0; while(t>CTW[k]){ t-=CTW[k]; k++; } s.ct=CT[k]; } else { r(); s.ct='Training'; }
    const flat=!s.show&&s.what==='Flatwork', v=Math.max(30,Math.min(96,Math.round(s.sc+(r()-.5)*16+(flat?-4:0))));
    s.km={l:flat?'Balance score':'Jump score',v}; s.len=D.durOf(s); s.lenS=(()=>{ const p=s.len.split(':'); return +p[0]*60+ +p[1]; })(); return s; }
  let ALL=vfix().map(extra);
  const STB=h=>window.SD_STABLE_OF?SD_STABLE_OF(h):{id:'ms',n:window.SD_STABLE||''};

  /* ---------- state ---------- */
  const qp=new URLSearchParams(location.search), hp=new URLSearchParams(location.hash.slice(1));
  let kind=['show','train'].includes(qp.get('kind'))?qp.get('kind'):'all', horse='all', rider='all', q=(qp.get('q')||'').trim(), range={k:'all'}, sort={k:'date',dir:-1}, shown=25;
  let stab=MULTI?SD_STABLE_SEL():'all';
  { const h=qp.get('h')||hp.get('h'); if(h&&HORSES.some(x=>x.id===h)) horse=h;
    const r=qp.get('r')||hp.get('r'); if(r&&HORSES.some(x=>x.r===r)) rider=r; }
  const RIDERS=[...new Set(HORSES.map(h=>h.r).filter(Boolean))];
  const ONE=HORSES.length===1, SHOWRIDER=RIDERS.length>1;
  const inSt=h=>stab==='all'||(h.st||'ms')===stab;
  let errState=null; try{ errState=sessionStorage.getItem('sdwErrRetry'); }catch(e){}   /* null, or the time the failed video went back to the analysis */
  const RANGES=[['all','Any time'],['7','Last 7 days'],['30','Last 30 days'],['month','This month'],['prev','Last month'],['90','Last 3 months'],['custom','Custom range']];
  const ymd=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const pDay=s=>{ const p=String(s||'').split('-'); return p.length===3?new Date(+p[0],+p[1]-1,+p[2]):null; };
  const dLine=d=>{ const a=Math.round((TODAY-d)/DAY); return a<2?fmtD(d):`${a} days ago`; };
  const fmtD=d=>`${D.DAY[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
  const inRange=d=>{ const a=Math.round((TODAY-d)/DAY);
    switch(range.k){ case '7': return a<=6; case '30': return a<=29; case '90': return a<=91;
      case 'month': return d.getFullYear()===TODAY.getFullYear()&&d.getMonth()===TODAY.getMonth();
      case 'prev': { const p=new Date(TODAY.getFullYear(),TODAY.getMonth()-1,1); return d.getFullYear()===p.getFullYear()&&d.getMonth()===p.getMonth(); }
      case 'custom': { const f=pDay(range.from), t=pDay(range.to); return (!f||d>=f)&&(!t||d<=t); }
      default: return true; } };
  const rangeLabel=()=>range.k==='custom'?`${range.from?fmtD(pDay(range.from)):'…'} – ${range.to?fmtD(pDay(range.to)):'…'}`:(RANGES.find(r=>r[0]===range.k)||RANGES[0])[1];
  const norm=x=>String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const matchQ=s=>!q||norm([s.h.n,s.what,s.h.r||'',T(s.ct||''),s.ct||'',MULTI?STB(s.h).n:'',T(s.show?'Show':'Training')].join(' ')).includes(norm(q));
  const isDefault=()=>kind==='all'&&horse==='all'&&rider==='all'&&!q&&range.k==='all'&&(stab==='all'||!MULTI);
  /* the list, every filter applied but the kind (the counts of the All / Shows / Training switch) */
  const base=()=>ALL.filter(s=>(horse==='all'||s.h.id===horse)&&(rider==='all'||s.h.r===rider)&&inSt(s.h)&&inRange(s.date)&&matchQ(s));
  const list=()=>{ let Lx=base().filter(s=>kind==='all'||(kind==='show')===s.show);
    const k=sort.k, d=sort.dir, cmp={date:(a,b)=>a.date-b.date,horse:(a,b)=>a.h.n.localeCompare(b.h.n),rider:(a,b)=>(a.h.r||'').localeCompare(b.h.r||''),
      what:(a,b)=>(a.show-b.show)||a.what.localeCompare(b.what),ct:(a,b)=>T(a.ct).localeCompare(T(b.ct)),score:(a,b)=>a.sc-b.sc,
      km:(a,b)=>a.km.v-b.km.v,len:(a,b)=>a.lenS-b.lenS,kind:(a,b)=>a.show-b.show}[k]||((a,b)=>a.date-b.date);
    if(!(k==='date'&&d<0)) Lx=[...Lx].sort((a,b)=>d*cmp(a,b)||b.date-a.date);
    return Lx; };

  /* ---------- the month at a glance: the three rings of the phone ---------- */
  const scope=()=>ALL.filter(s=>inSt(s.h));
  const ringSvg=(frac,col,S)=>{ const sw=S>=80?7:6, r=(S-sw)/2-1, c=2*Math.PI*r, len=Math.max(0,c*frac-(frac>0&&frac<1?3:0)), anim=!RM();
    return `<svg class="sRingS" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" aria-hidden="true"><circle cx="${S/2}" cy="${S/2}" r="${r}" fill="none" style="stroke:var(--ring-track)" stroke-width="${sw}"/>
      ${frac>0?`<circle cx="${S/2}" cy="${S/2}" r="${r}" fill="none" style="stroke:${col}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${len.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${S/2} ${S/2})">${anim?`<animate attributeName="stroke-dasharray" from="0 ${c.toFixed(1)}" to="${len.toFixed(1)} ${c.toFixed(1)}" dur=".3s" fill="freeze" calcMode="spline" keySplines=".23 1 .32 1" keyTimes="0;1"/>`:''}</circle>`:''}</svg>`; };
  const ring=(frac,col,big,unit,S)=>`<figure class="sRing" style="width:${S}px;height:${S}px">${ringSvg(frac,col,S)}<em class="v num${String(big).length>2?' sm':''}"><i>${big}${unit?`<sup>${unit}</sup>`:''}</i></em></figure>`;
  function kpis(){ const A=scope(), m=TODAY.getMonth(), mo=A.filter(s=>s.date.getMonth()===m), pv=A.filter(s=>s.date.getMonth()===(m+11)%12);
    const av=mo.length?Math.round(mo.reduce((a,s)=>a+s.sc,0)/mo.length):0, pav=pv.length?Math.round(pv.reduce((a,s)=>a+s.sc,0)/pv.length):0;
    const tone=C.toneOfScore(av), word=av>=70?'Good':av>=55?'Watch':'Low', top=Math.max(mo.length,pv.length,1), sh=mo.filter(s=>s.show).length, tr=mo.length-sh;
    const dm=av-pav, dn=mo.length-pv.length;
    const FULLM=['January','February','March','April','May','June','July','August','September','October','November','December'], monthName=FULLM[m], prevName=FULLM[(m+11)%12];
    const cAvg=GROOM?'':`<section class="card sK in" id="kAvg"><div class="sKr">${ring(mo.length?av/100:0,`var(--${tone})`,mo.length?av:'–',mo.length?'%':'',88)}
        <div class="kt"><div class="lbl">AVERAGE SCORE</div><div class="w">${mo.length?`<span class="pill ${tone==='good'?'good':tone==='watch'?'watch':'bad'}">${esc(word)}</span>`:`<span class="mut">No session yet</span>`}</div>
        <div class="s"><span>${esc(monthName)}</span> · <span>${esc(`${mo.length} ${mo.length===1?'session':'sessions'}`)}</span></div>
        ${pv.length?`<div class="s2"><span>Last month</span> <b class="num">${pav}%</b>${mo.length&&dm?` <span class="d ${dm>0?'good':'bad'} num">${dm>0?'+':'−'}${Math.abs(dm)}</span>`:''}</div>`:''}</div></div></section>`;
    const cMon=`<section class="card sK in" id="kMon"><div class="sKr">${ring(mo.length/top,'var(--blue)',mo.length,'',88)}
        <div class="kt"><div class="lbl">THIS MONTH</div><div class="w wr">${dn?`<span class="pill">${dn>0?'+':'−'}${Math.abs(dn)}</span><span class="mut vs">vs last month</span>`:`<span class="pill">Same as last month</span>`}</div>
        <div class="s2"><span>${esc(`${pv.length} last month`)}</span></div></div></div></section>`;
    const cSpl=`<section class="card sK sKs in" id="kSplit"><div class="lbl">SHOWS · TRAINING</div>
        <div class="sSN">${sh+tr?`<b class="num">${sh}</b><b class="num bT">${tr}</b>`:'<b class="z">–</b>'}</div>
        <div class="sBar">${sh?`<i class="bS" style="flex:${sh}"></i>`:''}${tr?`<i class="bT" style="flex:${tr}"></i>`:''}</div>
        <div class="sCap"><span><span class="ico" style="width:14px;height:14px">${W.kindIcon(true)}</span><span>shows</span></span><span><span>training</span><span class="ico" style="width:14px;height:14px">${W.kindIcon(false)}</span></span></div>
        <div class="s"><span>${esc(monthName)}</span>${sh+tr?` · <span>${esc(`${Math.round(sh/(sh+tr)*100)}% shows`)}</span>`:''}</div></section>`;
    return `<div class="sKpis${GROOM?' two':''}">${cAvg}${cMon}${cSpl}</div>`; }

  /* ---------- the columns: they follow the account and the room there is ---------- */
  const COLS=[
    {k:'date',l:'DATE',w:100,sort:1},
    {k:'horse',l:'HORSE',w:132,f:1.25,sort:1,on:()=>!ONE},
    {k:'rider',l:'RIDER',w:88,f:.85,sort:1,on:()=>SHOWRIDER,drop:3},
    {k:'kind',l:'',w:34,sort:1,tip:'Show or training'},
    {k:'what',l:'CLASS OR WORK',w:116,f:1.05,sort:1},
    {k:'ct',l:'COURSE TYPE',w:100,f:1,sort:1,drop:2},
    {k:'score',l:'SCORE',w:104,sort:1,on:()=>!GROOM},
    {k:'km',l:'KEY METRIC',w:104,f:.9,sort:1,drop:4},
    {k:'len',l:'LENGTH',w:62,sort:1,drop:1},
    {k:'status',l:'STATUS',w:112}];
  let cols=[];
  /* the columns that fit: the least useful ones leave first when the table is narrow */
  const fitCols=()=>{ const w=((document.getElementById('sTbl')||page).clientWidth||1100)-36;
    cols=COLS.filter(c=>!c.on||c.on()); const need=()=>cols.reduce((a,c)=>a+c.w,0)+(cols.length-1)*12;
    while(need()>w){ const d=cols.filter(c=>c.drop).sort((a,b)=>a.drop-b.drop)[0]; if(!d) break; cols=cols.filter(c=>c!==d); }
    return cols.map(c=>c.f?`minmax(${c.w}px,${c.f}fr)`:c.w+'px').join(' '); };

  /* ---------- the toolbar ---------- */
  const fb=(id,label,val,set)=>`<button type="button" class="sF${set?' set':''}" id="${id}" aria-haspopup="menu"><span class="k">${esc(label)}</span><span class="v">${esc(val)}</span>${set?`<span class="x" data-clear="${id}" role="button" aria-label="Clear" tabindex="0">${IX.x}</span>`:`<span class="ico ch" style="width:14px;height:14px">${I.chev}</span>`}</button>`;
  function toolbar(){ const B=base(), nS=B.filter(s=>s.show).length;
    const STN=MULTI&&stab!=='all'?SD_STABLES.find(s=>s.id===stab):null, HR=HORSES.filter(h=>(rider==='all'||h.r===rider)&&inSt(h)), hN=horse==='all'?'All horses':(HORSES.find(h=>h.id===horse)||{n:'All horses'}).n;
    const ph=ONE?'Search a show':OWNER?'Search a horse, a rider or a show':'Search a horse or a show';
    return `<div class="sBar0">
      <div class="seg sKind" id="sKind" role="tablist">${[['all','All',B.length],['show','Shows',nS],['train','Training',B.length-nS]].map(([k,l,n])=>`<button type="button" role="tab" aria-selected="${k===kind}" class="${k===kind?'on':''}" data-k="${k}">${k==='show'?`<span class="ico" style="width:15px;height:15px">${W.kindIcon(true)}</span>`:k==='train'?`<span class="ico" style="width:15px;height:15px">${W.kindIcon(false)}</span>`:''}<span>${esc(l)}</span><em class="num">${n}</em></button>`).join('')}</div>
      <span class="sDiv"></span>
      ${MULTI?fb('fSt','Stable',STN?STN.n:'All stables',!!STN):''}
      ${OWNER?fb('fR','Rider',rider==='all'?'All riders':rider,rider!=='all'):''}
      ${ONE?'':fb('fH','Horse',hN,horse!=='all')}
      ${fb('fD','Date',rangeLabel(),range.k!=='all')}
      ${isDefault()&&kind==='all'?'':`<button type="button" class="btn link sClr" id="sClr">Clear filters</button>`}
      <label class="sQ"><span class="ico" style="width:16px;height:16px">${I.search}</span><input id="sQ" type="search" placeholder="${esc(ph)}" aria-label="${esc(ph)}" value="${esc(q)}" autocomplete="off" spellcheck="false">${q?`<button type="button" class="x" id="sQx" aria-label="Clear the search">${IX.x}</button>`:''}</label></div>`; }

  /* ---------- rows ---------- */
  const scoreCell=sc=>{ const t=C.toneOfScore(sc); return `<span class="scB"><span class="bar"><i style="width:${sc}%;background:var(--${t})"></i></span><b class="num">${sc}<small>%</small></b></span>`; };
  const statusCell=(k,extra)=>k==='ok'?`<span class="sSt ok"><span class="ico" style="width:14px;height:14px">${I.check}</span><span>Analysed</span></span>`
    :k==='run'?`<span class="sSt run"><span class="pill blue"><i class="pulse"></i><span>Analysing</span></span>${extra||''}</span>`
    :`<span class="sSt"><span class="pill bad">${W.ic(ER['danger-circle'],12)}<span>Failed</span></span></span>`;
  const cellOf=(c,s)=>{ switch(c.k){
    case 'date': return `<span class="cDate"><b>${esc(D.when(s.date))}</b><span>${esc(dLine(s.date))}</span></span>`;
    case 'horse': return `<span class="cellH"><span class="hAv sm">${esc(ini(s.h))}</span><span class="cell2"><b>${esc(s.h.n)}</b>${MULTI?`<span>${esc(STB(s.h).n)}</span>`:s.moved?`<span>${esc(T('Moved here'))}</span>`:''}</span></span>`;
    case 'rider': return `<span class="mut ell">${esc(s.h.r||'')}</span>`;
    case 'kind': return `<span class="kic sm ${s.show?'show':''}" data-tip="${s.show?'Show':'Training'}">${W.kindIcon(s.show)}</span>`;
    case 'what': return `<span class="cell2"><b>${esc(s.show?s.ht:s.what)}</b><span>${esc(s.show?s.ven:s.what==='Flatwork'?'Training':'Show jumping')}</span></span>`;
    case 'ct': return `<span class="ell ct${s.ct==='Training'?' mut':''}">${esc(s.ct)}</span>`;
    case 'score': return scoreCell(s.sc);
    case 'km': return `<span class="cKm">${GROOM?'':`<span class="a"><b class="num">${s.km.v}%</b><span>${esc(s.km.l)}</span></span>`}<span class="b">${s.issues?`<i class="dot watch"></i><span>${esc(`${s.issues} to watch`)}</span>`:`<span class="dim">${esc('Nothing to watch')}</span>`}</span></span>`;
    case 'len': return `<span class="mut num">${s.len}</span>`;
    case 'status': return statusCell('ok');
    default: return '<span></span>'; } };
  const acts=s=>`<span class="sActs" role="group" aria-label="Actions"><button type="button" class="sA" data-a="open" data-tip="Open the analysis" aria-label="Open the analysis">${IX.open}</button>
    <button type="button" class="sA" data-a="move" data-tip="Change horse" aria-label="Change horse">${W.I.swap}</button><button type="button" class="sA del" data-a="del" data-tip="Delete video" aria-label="Delete video">${IX.trash}</button></span>`;
  const row=s=>`<a class="tr sR" href="${W.href('session',{v:s.key})}" data-vk="${esc(s.key||'')}" data-vh="${esc(s.h0?(s.h0.n0||s.h0.n):s.h.n)}">${cols.map(c=>cellOf(c,s)).join('')}${acts(s)}</a>`;
  /* a row of a video not analysed yet: being analysed, or failed */
  const pendRow=(p)=>{ const h=p.h, iW=cols.findIndex(c=>c.k==='what'), iS=cols.findIndex(c=>c.k==='status'), span=iS-iW;
    const cells=cols.map((c,i)=>{ if(p.fail&&i>iW&&i<iS) return '';
      if(p.fail&&i===iW) return `<span class="cFail" style="grid-column:span ${span}"><span class="why"><b>${esc(T(D.ERR.reason))}</b><span>${esc(`${D.ERR.kind} · ${D.ERR.dur}`)}</span></span>
        <span class="go"><button type="button" class="btn sm" data-a="why">See why</button><button type="button" class="btn sm pri" data-a="retry">${W.ic(ER.refresh,15)}<span>Try the analysis again</span></button></span></span>`;
      switch(c.k){
      case 'date': return `<span class="cDate"><b>${esc(p.when)}</b><span class="num">${esc(p.sub||'')}</span></span>`;
      case 'horse': return `<span class="cellH"><span class="hAv sm${p.fail?' bad':' run'}">${p.fail?W.ic(ER['danger-circle'],15):esc(ini(h))}</span><span class="cell2"><b>${esc(h.n)}</b>${MULTI?`<span>${esc(STB(h).n)}</span>`:''}</span></span>`;
      case 'rider': return `<span class="mut ell">${esc(h.r||'')}</span>`;
      case 'kind': return `<span class="kic sm ${p.show?'show':''}" data-tip="${p.show?'Show':'Training'}">${W.kindIcon(p.show)}</span>`;
      case 'what': return `<span class="cell2"><b>${esc(p.what)}</b><span>${esc(p.whatSub||'')}</span></span>`;
      case 'ct': return `<span class="ell ct${!p.ct||p.ct==='Training'?' mut':''}">${esc(p.ct||'–')}</span>`;
      case 'score': return `<span class="mut">–</span>`;
      case 'km': return `<span class="cKm"><span class="b"><span class="mut">${esc(p.note||'Analysing the round')}</span></span></span>`;
      case 'len': return `<span class="mut num">${esc(p.len||'–')}</span>`;
      case 'status': return p.fail?statusCell('fail'):statusCell('run',`<span class="mini"><i style="width:${p.pct}%" data-t0="${p.t0||''}"></i></span>`);
      default: return '<span></span>'; } }).join('');
    const a=!p.fail&&p.id?`<span class="sActs"><button type="button" class="sA" data-a="drop" data-tip="Cancel the analysis" aria-label="Cancel the analysis">${IX.x}</button></span>`:'';
    return `<div class="tr sR pend${p.fail?' fail':''}${p.fresh?' fresh':''}"${p.id?` data-pid="${esc(p.id)}"`:''}>${cells}${a}</div>`; };
  /* the phone's sample videos not analysed yet (Nova de Lys failed, Quintus Z analysing), and the uploads of this tab */
  function pending(){ const out=[], byName=n=>HORSES.find(h=>(h.n0||h.n)===n||h.n===n);
    const okKind=show=>kind==='all'||(kind==='show')===show, okH=h=>h&&(horse==='all'||h.id===horse)&&(rider==='all'||h.r===rider)&&inSt(h)&&(!q||norm(h.n+' '+(h.r||'')).includes(norm(q)));
    const todayIn=inRange(TODAY), now=Date.now();
    const pct=t0=>Math.min(94,Math.round(8+(now-t0)/1800)), left=t0=>{ const m=Math.ceil((180000-(now-t0))/60000); return m>1?`~${m} min`:'Almost done'; };
    (window.SDW_PENDING?SDW_PENDING():[]).forEach(p=>{ const h=byName(p.horse)||{n:p.horse,r:p.rider,id:'_'+p.horse}; const show=p.kind==='Show', d=new Date(p.date);
      if(!okKind(show)||!(h.id[0]==='_'?horse==='all':okH(h))||!inRange(d)) return;
      out.push({id:p.id,h,show,when:D.when(d),sub:T('Just now'),what:show?p.height:(p.disc==='Flatwork'?'Flatwork':'Training'),whatSub:show?String(p.loc||'').split(',')[0]:p.disc,ct:show?p.course:(p.course||'Training'),len:p.dur||'–',t0:p.t0,pct:pct(p.t0),note:left(p.t0),fresh:p.id===freshId}); });
    const sortDef=sort.k==='date'&&sort.dir<0;
    const qz=byName('Quintus Z');
    if(qz&&okKind(false)&&horse==='all'&&rider==='all'&&!q&&sortDef&&inSt(qz)&&todayIn) out.push({h:qz,show:false,when:'Today',sub:T('Just now'),what:'Course',whatSub:'Training',ct:'Training',len:'–',pct:64,note:'~3 min'});
    const nl=byName(D.ERR.horse);
    if(nl&&D.errShown()&&okKind(false)&&horse==='all'&&!q&&sortDef&&inSt(nl)&&(rider==='all'||nl.r===rider)&&todayIn){
      if(!errState) out.push({h:nl,fail:true,show:false,when:'Today',sub:'09:12',what:'Training',whatSub:'Show jumping',ct:'Training',len:D.ERR.dur});
      else out.push({h:nl,show:false,when:'Today',sub:T('Sent again'),what:'Training',whatSub:'Show jumping',ct:'Training',len:D.ERR.dur,t0:+errState,pct:pct(+errState),note:left(+errState)}); }
    return out; }
  const grp=s=>{ const a=Math.round((TODAY-s.date)/DAY); return a<=6?'THIS WEEK':a<=13?'LAST WEEK':(MON[s.date.getMonth()]==='Sep'&&s.date.getFullYear()===2026?'EARLIER IN SEPTEMBER':`${({Jan:'January',Feb:'February',Mar:'March',Apr:'April',May:'May',Jun:'June',Jul:'July',Aug:'August',Sep:'September',Oct:'October',Nov:'November',Dec:'December'})[MON[s.date.getMonth()]]} ${s.date.getFullYear()}`); };

  let freshId=null, tickT=null;
  function renderTable(o){ o=o||{}; const box=document.getElementById('sTbl'); if(!box) return;
    const tpl=fitCols(), Lx=list(), P=pending(), sortDef=sort.k==='date'&&sort.dir<0;
    box.style.setProperty('--cols',tpl);
    const th=`<div class="tr th" role="row">${cols.map(c=>{ const on=sort.k===c.k, ar=on?(sort.dir<0?'descending':'ascending'):'none';
      return c.sort&&!(GROOM&&(c.k==='score'||c.k==='km'))?`<button type="button" class="sH${on?' on':''}${c.k==='kind'?' c':''}" data-s="${c.k}" aria-sort="${ar}"${c.tip?` data-tip="${c.tip}"`:''}><span>${esc(c.l)}</span><span class="ico ar" style="width:13px;height:13px">${on?(sort.dir<0?IX.down:IX.up):IX.sort}</span></button>`:`<span>${esc(c.l)}</span>`; }).join('')}</div>`;
    let html='';
    if(P.length){ const f=P.filter(p=>p.fail), r=P.filter(p=>!p.fail);
      if(f.length) html+=`<div class="sG bad"><span>NEEDS YOUR ATTENTION</span><em class="num">${f.length}</em></div>`+f.map(pendRow).join('');
      if(r.length) html+=`<div class="sG"><span>PROCESSING</span><em class="num">${r.length}</em></div>`+r.map(pendRow).join(''); }
    let g0=''; Lx.slice(0,shown).forEach(s=>{ if(sortDef){ const g=grp(s); if(g!==g0){ g0=g; const n=Lx.filter(x=>grp(x)===g).length; html+=`<div class="sG"><span>${esc(g)}</span><em class="num">${n}</em></div>`; } } html+=row(s); });
    if(!Lx.length&&!P.length) html+=`<div class="sEmpty"><span class="ico" style="width:40px;height:40px;border-radius:12px;background:var(--card2);border:1px solid var(--line);color:var(--mut);padding:10px">${I.search}</span><b>No session matches.</b><span class="mut">Try another horse, period or word.</span>${isDefault()&&kind==='all'?'':`<button type="button" class="btn sm" id="sClr2">Clear filters</button>`}</div>`;
    box.innerHTML=th+`<div class="sBody" role="rowgroup">${html}</div>`;
    const ft=document.getElementById('sFoot'), left=Lx.length-shown;
    ft.innerHTML=Lx.length?`<span class="num">${esc(`Showing ${Math.min(shown,Lx.length)} of ${Lx.length} sessions`)}</span>${left>0?`<span style="display:flex;gap:8px"><button type="button" class="btn sm" id="sMore">${esc(`Show ${Math.min(25,left)} more · ${left} left`)}</button><button type="button" class="btn sm ghost" id="sAll">Show all</button></span>`:''}`:'';
    ft.style.display=Lx.length?'':'none';
    wireTable(box);
    if(o.flash){ const r=box.querySelector('.sR.fresh'); if(r){ r.classList.add('hl'); setTimeout(()=>r.classList.remove('hl'),1400); } }
    clearInterval(tickT); if(P.some(p=>p.t0)) tickT=setInterval(tick,1000); }
  /* the bars of the videos being analysed move with time */
  function tick(){ const now=Date.now(); let any=false; document.querySelectorAll('#sTbl .mini i[data-t0]').forEach(i=>{ const t0=+i.dataset.t0; if(!t0) return; any=true; i.style.width=Math.min(94,Math.round(8+(now-t0)/1800))+'%'; }); if(!any) clearInterval(tickT); }

  /* ---------- actions ---------- */
  const refresh=()=>{ ALL=vfix().map(extra); renderHead(); renderKpis(false); renderBar(); renderTable(); };
  const moveV=row=>{ if(!window.SD_PICK_HORSE) return; const k=row.dataset.vk, cur=row.dataset.vh;
    SD_PICK_HORSE({current:cur,onSave:n=>{ const prev=SD_VIDEO_HORSE(k); SD_SET_VIDEO_HORSE(k,n); refresh(); SD_UNDO('Moved to '+n,()=>{ SD_SET_VIDEO_HORSE(k,prev); refresh(); }); }}); };
  const delV=row=>{ if(!window.SD_CONFIRM_DELETE) return; const k=row.dataset.vk;
    SD_CONFIRM_DELETE({onConfirm:()=>{ SD_DELETE_VIDEO(k); const done=()=>refresh();
      if(window.SD_COLLAPSE) SD_COLLAPSE(row,'y',done); else done(); SD_UNDO('Video deleted',()=>{ SD_RESTORE_VIDEO(k); refresh(); }); }}); };
  function retry(){ errState=String(Date.now()); try{ sessionStorage.setItem('sdwErrRetry',errState); }catch(e){} renderTable(); }
  function wireTable(box){
    box.querySelectorAll('.sH').forEach(b=>b.onclick=()=>{ const k=b.dataset.s; if(sort.k===k) sort.dir=-sort.dir; else sort={k,dir:['date','score','km','len'].includes(k)?-1:1}; shown=Math.max(shown,25); renderTable(); });
    box.querySelectorAll('.sA,[data-a]').forEach(b=>b.onclick=e=>{ e.preventDefault(); e.stopPropagation(); const r=b.closest('.sR'), a=b.dataset.a;
      if(a==='open') location.href=r.getAttribute('href'); else if(a==='move') moveV(r); else if(a==='del') delV(r);
      else if(a==='why') W.openErr(); else if(a==='retry'){ retry(); window.SD_TOAST&&SD_TOAST(T('Analysing the round again')); }
      else if(a==='drop'){ SDW_PENDING_DROP(r.dataset.pid); renderTable(); } });
    const m=document.getElementById('sMore'), al=document.getElementById('sAll'), c2=document.getElementById('sClr2');
    if(m) m.onclick=()=>{ shown+=25; renderTable(); }; if(al) al.onclick=()=>{ shown=1e5; renderTable(); }; if(c2) c2.onclick=clearAll; }
  function clearAll(){ kind='all'; horse='all'; rider='all'; q=''; range={k:'all'}; if(MULTI){ stab='all'; SD_SET_STABLE_SEL('all'); switcher(); } shown=25; renderKpis(false); renderBar(); renderTable(); }

  /* ---------- popovers of the toolbar ---------- */
  const mi=(v,label,sub,on,lead)=>`<button type="button" class="mi${on?' on':''}" data-v="${esc(v)}">${lead||''}<span class="t">${esc(label)}${sub?`<small>${esc(sub)}</small>`:''}</span><span class="ico ck">${I.check}</span></button>`;
  const nS=n=>`${n} ${n===1?'session':'sessions'}`, nH=n=>`${n} ${n>1?'horses':'horse'}`;
  function openPick(btn,head,items,onPick,w){ const p=W.pop(btn,`<div class="gl">${esc(head)}</div>`+items,{w:w||300,align:'left'}); if(!p) return;
    p.querySelectorAll('.mi[data-v]').forEach(b=>b.onclick=()=>{ W.closePop(); onPick(b.dataset.v); shown=25; renderBar(); renderTable(); }); return p; }
  function wireBar(){ const $=id=>document.getElementById(id);
    $('sKind').querySelectorAll('button').forEach(b=>b.onclick=()=>{ kind=b.dataset.k; shown=25; renderBar(); renderTable(); });
    if($('fSt')) $('fSt').onclick=()=>openPick($('fSt'),'Stable',mi('all','All stables',nS(ALL.length),stab==='all',`<span class="hAv sm" style="border-radius:7px">${SD_STABLES.length}</span>`)
      +SD_STABLES.map(s=>mi(s.id,s.n,`${nH(HORSES.filter(h=>(h.st||'ms')===s.id).length)} · ${nS(ALL.filter(x=>(x.h.st||'ms')===s.id).length)}`,stab===s.id,`<span class="hAv sm" style="border-radius:7px">${esc(s.ini)}</span>`)).join(''),
      v=>{ stab=v; SD_SET_STABLE_SEL(v); if(horse!=='all'&&!inSt(HORSES.find(h=>h.id===horse))) horse='all'; renderKpis(false); switcher(); },320);
    if($('fR')) $('fR').onclick=()=>openPick($('fR'),'Rider',mi('all','All riders',nS(ALL.length),rider==='all')
      +RIDERS.map(r=>mi(r,r,`${nH(HORSES.filter(h=>h.r===r).length)} · ${nS(ALL.filter(s=>s.h.r===r).length)}`,rider===r,`<span class="hAv sm">${esc(r.split(/\s+/).map(w=>w[0]).join('').slice(0,2))}</span>`)).join(''),
      v=>{ rider=v; if(horse!=='all'&&v!=='all'&&HORSES.find(h=>h.id===horse).r!==v) horse='all'; });
    if($('fH')) $('fH').onclick=()=>{ const HR=HORSES.filter(h=>(rider==='all'||h.r===rider)&&inSt(h));
      openPick($('fH'),'Horse',mi('all','All horses',nS(ALL.filter(s=>(rider==='all'||s.h.r===rider)&&inSt(s.h)).length),horse==='all')
        +HR.map(h=>mi(h.id,h.n,(MULTI?STB(h).n+' · ':SHOWRIDER?(h.r||'')+' · ':'')+nS(ALL.filter(s=>s.h===h).length),horse===h.id,`<span class="hAv sm">${esc(ini(h))}</span>`)).join(''),v=>{ horse=v; },320); };
    if($('fD')) $('fD').onclick=()=>{ const b=$('fD');
      const p=W.pop(b,`<div class="gl">Period</div>${RANGES.filter(r=>r[0]!=='custom').map(([k,l])=>mi(k,l,'',range.k===k)).join('')}<div class="sep"></div>
        <div class="gl">Custom range</div><div class="sRng"><label><span>From</span><input type="date" id="rF" value="${esc(range.from||'')}" max="${ymd(TODAY)}"></label><label><span>To</span><input type="date" id="rT" value="${esc(range.to||'')}" max="${ymd(TODAY)}"></label></div>
        <div style="display:flex;justify-content:flex-end;padding:4px 6px 6px"><button type="button" class="btn sm pri" id="rOk">Apply</button></div>`,{w:300,align:'left'});
      if(!p) return;
      p.querySelectorAll('.mi[data-v]').forEach(x=>x.onclick=()=>{ W.closePop(); range={k:x.dataset.v}; shown=25; renderBar(); renderTable(); });
      p.querySelector('#rOk').onclick=()=>{ const f=p.querySelector('#rF').value, t=p.querySelector('#rT').value; W.closePop(); range=f||t?{k:'custom',from:f&&t&&f>t?t:f,to:f&&t&&f>t?f:t}:{k:'all'}; shown=25; renderBar(); renderTable(); }; };
    page.querySelectorAll('.sF .x[data-clear]').forEach(x=>{ const go=e=>{ e.preventDefault(); e.stopPropagation(); const id=x.dataset.clear;
        if(id==='fSt'){ stab='all'; SD_SET_STABLE_SEL('all'); renderKpis(false); switcher(); } if(id==='fR') rider='all'; if(id==='fH') horse='all'; if(id==='fD') range={k:'all'};
        shown=25; renderBar(); renderTable(); };
      x.onclick=go; x.onkeydown=e=>{ if(e.key==='Enter'||e.key===' ') go(e); }; });
    if($('sClr')) $('sClr').onclick=clearAll;
    const qi=$('sQ'); let qt=null;
    qi.oninput=()=>{ clearTimeout(qt); qt=setTimeout(()=>{ q=qi.value.trim(); shown=25; const pos=qi.selectionStart; renderBar(); renderTable(); const n=$('sQ'); n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} },140); };
    qi.onkeydown=e=>{ if(e.key==='Escape'&&qi.value){ e.stopPropagation(); qi.value=''; q=''; renderBar(); renderTable(); $('sQ').focus(); } };
    if($('sQx')) $('sQx').onclick=()=>{ q=''; renderBar(); renderTable(); $('sQ').focus(); }; }

  /* ---------- the page ---------- */
  const head=()=>{ const n=ALL.length;
    return `<div class="hHead in"><div><div class="hEy">${ONE?`<span>${esc(nS(n))}</span> · <span>${esc(HORSES[0].n)}</span>`:`<span>${esc(nS(n))}</span> · <span>${esc(nH(HORSES.length))}</span>`}</div><h1 class="hT">Sessions</h1></div>
      </div>`; };
  function renderHead(){ const h=document.getElementById('sHead'); if(h){ h.innerHTML=head(); } }
  function renderKpis(anim){ const k=document.getElementById('sK'); if(!k) return; k.innerHTML=kpis();
    if(anim!==false&&!RM()) k.querySelectorAll('.sBar').forEach(b=>b.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:300,delay:120,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'})); }
  function renderBar(){ const b=document.getElementById('sTool'); if(!b) return; b.innerHTML=toolbar(); wireBar(); }
  function render(){
    page.innerHTML=`<div id="sHead"></div><div id="sK"></div>
      <section class="card sCard in"><div id="sTool"></div><div class="tbl sTbl" id="sTbl" role="table" aria-label="Sessions"></div><div class="cardF sFoot" id="sFoot"></div></section>`;
    renderHead(); renderKpis(true); renderBar(); renderTable();
    if(!RM()) page.querySelectorAll('.in').forEach((el,k)=>el.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:260,delay:Math.min(k,8)*40,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'})); }
  /* the stable switcher of the top bar (a vet or a farrier with several stables): same choice as the Stable filter */
  function switcher(){ if(!MULTI) return W.switcher(null); const cur=SD_STABLE_SEL(), st=SD_STABLES.find(s=>s.id===cur), counts={}; HORSES.forEach(h=>{ const k=h.st||'ms'; counts[k]=(counts[k]||0)+1; });
    W.switcher({ini:st?st.ini:String(SD_STABLES.length),label:st?st.n:T('All stables'),head:T('Stable'),
      items:[{v:'all',ini:String(SD_STABLES.length),label:T('All stables'),count:HORSES.length,on:cur==='all'}].concat(SD_STABLES.map(s=>({v:s.id,ini:s.ini,label:s.n,sub:s.city,count:counts[s.id]||0,on:cur===s.id}))),
      onPick:v=>{ SD_SET_STABLE_SEL(v); stab=v; if(horse!=='all'&&!inSt(HORSES.find(h=>h.id===horse))) horse='all'; shown=25; renderKpis(false); renderBar(); renderTable(); switcher(); }}); }

  /* ---------- upload: the full flow (upload.js); the new session joins the list as Analysing ---------- */
  
  if(window.SDW_UPLOAD_FULL){ W.openUpload=h=>SDW_UPLOAD_FULL({horse:typeof h==='string'?h:undefined}); const ub=document.getElementById('wUpload'); if(ub) ub.onclick=()=>W.openUpload(); }
  window.SDW_ON_UPLOAD=rec=>{ freshId=rec.id; kind='all'; sort={k:'date',dir:-1}; renderTable({flash:true}); window.SD_TOAST&&SD_TOAST(T('Sent · analysing the round'));
    const r=document.querySelector('#sTbl .sR.fresh'); if(r) r.scrollIntoView({behavior:RM()?'auto':'smooth',block:'center'}); };
  W.onErrRetry=retry;
  /* after a video is deleted, moved or brought back elsewhere (undo after a page change) */
  window.SD_VIDEOS_CHANGED=refresh;
  let rw=0; addEventListener('resize',()=>{ cancelAnimationFrame(rw); rw=requestAnimationFrame(()=>renderTable()); });
  W.onTheme=()=>renderKpis(false);
  render(); switcher();
  /* arriving from an upload made on another page: show it */
  { const m=/new=([\w]+)/.exec(location.hash); if(m){ freshId=m[1]; renderTable({flash:true}); history.replaceState(null,'',location.pathname+location.search); } }
})();
