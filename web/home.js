/* StrydeUp desktop web app, Home.
   The phone's Home, laid out for a computer: a KPI row, the average score chart next to the top performers,
   the latest sessions next to the active alerts, then the trend analysis. Each account gets its own Home,
   exactly as on the phone (plan.js): Premium is built around its one horse, the Stable Owner sees the stable and
   the team, a rider (groom, horse owner) their horses and the stable they ride for, a vet / farrier / trainer
   the horses they follow, with the stable chips when they work for several stables. */
(function(){
  const W=window.SDW, D=window.SD_DATA, C=window.SDC, T=W.T, esc=W.esc, I=W.I;
  const PLAN=W.PLAN, ACC=W.ACC, STAFF=PLAN==='vet', MULTI=!!window.SD_MULTI, OWNER=PLAN==='owner', PREM=PLAN==='premium', RIDER=PLAN==='rider';
  const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page=document.getElementById('wPage');
  const TODAY=D.TODAY, DAY=864e5;
  const WI=window.SDW_WI||{}, ICS=window.SDW_IC||{};
  const ini=h=>h.ini||h.n.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const toneW=d=>d>1.5?['good','Improving']:d<-1.5?['bad','Dropping']:['blue','Steady'];
  const arrow=d=>d>0?'▲ +':d<0?'▼ ':'';

  /* ---------- state ---------- */
  let fP=3, fH=null, riderSel=null, avgSel=null, twP=3, th=null, trRider=null, yTab='stable', errHidden=false;
  let TW=D.twLoad();
  const RIDERS=OWNER?D.RIDERS():[];
  const vis=()=>D.HORSES;
  /* a vet or a farrier with several stables: All stables or one, and Home follows */
  const applyStable=()=>{ if(!MULTI) return; const s=SD_STABLE_SEL(); D.HORSES.splice(0,D.HORSES.length,...D.ALL.filter(h=>s==='all'||(h.st||'ms')===s)); };

  /* ---------- the professional and the rider: their stable said in one line ---------- */
  const BAN=STAFF?(window.SD_JOB==='Trainer'?'You train at this stable · Marie S. manages it':`You work with this stable as its ${window.SD_JOB_WORD||'vet'} · Marie S. manages it`)
    :({groom:'You work with this stable as its groom · Marie S. manages it',trainer:'You train at this stable · Marie S. manages it',horseowner:'Your horses live at this stable · Marie S. manages it'})[window.SD_AS]||'You ride for this stable · Marie S. manages it';
  const stableLine=()=>{ if(!MULTI) return {ini:'É',n:window.SD_STABLE,s:SD_OWNERIZE(T(BAN))};
    const st=SD_STABLES.find(x=>x.id===SD_STABLE_SEL());
    return st?{ini:st.ini,n:st.n,s:T(BAN).split('Marie S.').join(st.mgr)}
      :{ini:String(SD_STABLES.length),n:T('All your stables'),s:T(window.SD_JOB==='Trainer'?`You train at ${SD_STABLES.length} stables`:`You work with ${SD_STABLES.length} stables as their ${window.SD_JOB_WORD||'vet'}`)}; };

  /* ---------- blocks ---------- */
  const head=()=>{ const d=TODAY, date=`${D.DAY[d.getDay()]} ${d.getDate()} ${D.MON[d.getMonth()]} ${d.getFullYear()}`;
    return `<div class="hHead in"><div><div class="hEy"><span>${esc(date)}</span></div><h1 class="hT"><span>Welcome back,</span> <span>${esc(W.me.first)}</span></h1></div>
      <div class="r"><a class="btn" href="${W.href('sessions')}">${W.ic(I.sessions)}<span>All sessions</span></a></div></div>`; };
  const errBar=()=>D.errShown()&&!errHidden?`<button class="hErr in" id="hErr"><span class="ico" style="width:20px;height:20px;color:var(--bad-ink)">${(window.SDW_ERRIC||{})['danger-circle']||''}</span>
      <b>1 video couldn't be analysed</b><span class="mut">${esc(D.ERR.horse)}</span><span class="mut">·</span><span class="mut">Today, 09:12</span><span class="go">See why ${W.ic(I.chevR,14)}</span></button>`:'';
  const ctx=()=>{
    if(OWNER){ const week=D.sessions(vis()).filter(x=>(TODAY-x.date)/DAY<7).length;
      return `<section class="card hCtx in"><span class="hLogo">É</span><div class="t"><div class="lbl">YOUR STABLE</div><b>${esc(window.SD_STABLE)}</b></div>
        <div class="hStats"><a href="${W.href('team')}"><span class="lbl">TEAM</span><b class="num">${D.TEAM.length}</b><small>people</small></a><a href="${W.href('horses')}"><span class="lbl">HORSES</span><b class="num">${vis().length}</b><small>in the stable</small></a><a href="${W.href('sessions')}"><span class="lbl">THIS WEEK</span><b class="num">${week}</b><small>videos</small></a></div>
        <button class="btn" id="hAddUser">${W.ic(I.team)}<span>Add a user</span></button></section>`; }
    if(RIDER||STAFF){ const L=stableLine();
      return `<section class="card hCtx in"><span class="hLogo">${esc(L.ini)}</span><div class="t"><b>${esc(L.n)}</b><span class="mut">${esc(L.s)}</span></div>
        ${MULTI?`<div class="sdStC hChips" id="stChips"></div>`:''}</section>`; }
    return ''; };

  /* KPI row */
  const kpis=()=>{ const hs=vis(), S=D.sessions(hs), A=D.alerts(hs);
    const av=D.avgSeries(hs,3), last=av.avg[av.n-1], dd=last-av.avg[0], tw=toneW(dd);
    const inMon=(x,m)=>x.date.getFullYear()===2026&&x.date.getMonth()===m;
    const mon=S.filter(x=>inMon(x,8)).length, prev=S.filter(x=>inMon(x,7)).length, months=[3,4,5,6,7,8].map(m=>S.filter(x=>inMon(x,m)).length);
    const m3=S.filter(x=>(TODAY-x.date)/DAY<=92), sh=m3.filter(x=>x.show).length, tr=m3.length-sh, shP=m3.length?Math.round(sh/m3.length*100):0;
    const att=A.filter(a=>a.lv==='Attention').length, wat=A.length-att, dm=mon-prev;
    return `<div class="grid hKpis">
      <a class="card kpi c3 in" href="#hAvgC" id="kAvg"><div class="k">${W.ic(WI.Performance,16)}<span>${PREM?'Performance score':'Average performance score'}</span></div>
        <div class="v"><span class="num">${Math.round(last)}</span><small>%</small></div>
        <div class="s"><span class="pill ${tw[0]}">${arrow(Math.round(dd))}${Math.abs(Math.round(dd))} pts</span><span>3 months</span></div><div class="spark">${C.spark(av.avg,tw[0],96,38)}</div></a>
      <a class="card kpi c3 in" href="${W.href('sessions')}"><div class="k">${W.ic(I.sessions,16)}<span>Sessions this month</span></div>
        <div class="v"><span class="num">${mon}</span><small>videos</small></div>
        <div class="s">${dm?`<span class="pill">${dm>0?'+':'−'}${Math.abs(dm)}</span><span>vs last month</span>`:'<span>Same as last month</span>'}</div><div class="spark">${C.bars(months,96,38)}</div></a>
      <a class="card kpi c3 in" href="${W.href('sessions')}"><div class="k">${W.ic(W.kindIcon(true),16)}<span>Shows and training</span></div>
        <div class="kv2"><div><b class="num">${sh}</b><span><span class="ico" style="width:14px;height:14px">${W.kindIcon(true)}</span><span>shows</span></span></div><div><b class="num">${tr}</b><span><span class="ico" style="width:14px;height:14px">${W.kindIcon(false)}</span><span>training</span></span></div></div>
        <div class="split" aria-hidden="true"><i style="width:${shP}%;background:var(--blue)"></i><i style="flex:1;background:var(--line3)"></i></div>
        <div class="s"><span>last 3 months</span></div></a>
      <button class="card kpi c3 in" id="kAl"><div class="k">${W.ic(ICS['danger-triangle'],16)}<span>Active alerts</span></div>
        <div class="v"><span class="num">${A.length}</span></div>
        <div class="s">${A.length?`<span class="lg"><i class="dot bad"></i><b class="num">${att}</b><span>Attention</span></span><span class="lg"><i class="dot watch"></i><b class="num">${wat}</b><span>Watch</span></span>`:'<span>No open alert.</span>'}</div></button>
    </div>`; };

  /* horse row: rank, ring, name, a line, a pill */
  const hRow=(h,o)=>`<a class="hRow${o.rich?' rich':''}" href="${o.href}">${o.rank?`<span class="rk num">${o.rank}</span>`:''}${h.perf!=null&&!o.noScore?C.ring(h.perf,{size:46}):`<span class="hAv" style="width:46px;height:46px">${esc(ini(h))}</span>`}
    <span class="t"><b>${esc(h.n)}</b><span>${esc(o.sub||'')}</span>${o.rich&&h.perf!=null?richLine(h):''}</span>${o.pill||''}${o.rich&&h.perf!=null&&!h.personal?`<span class="rsp">${C.spark(D.hist(h,25).slice(-13),h.d>1?'good':h.d<-1?'bad':'blue',120,34)}</span>`:''}</a>`;
  const richLine=h=>{ const L=D.sessions(D.ALL).filter(x=>x.h.id===h.id), l=L[0]; return l?`<span class="rl"><span>Last video</span> · <span>${esc(D.when(l.date))}</span> · <b class="num">${l.sc}%</b></span>`:''; };
  const dPill=h=>h.perf==null?`<span class="pill">New</span>`:`<span class="pill ${h.d>0?'good':h.d<0?'bad':''}">${arrow(h.d)}${h.d} pts</span>`;
  /* the right column next to the chart */
  const side=()=>{
    if(PREM){ const h=vis()[0], mine=D.sessions(vis()), m3=mine.filter(x=>(TODAY-x.date)/DAY<=92), best=Math.max(...m3.map(x=>x.sc)), last=mine[0], w=h.d>1?['good','Improving']:h.d<-1?['bad','Dropping']:['blue','Steady'];
      return `<section class="card c4 hHero in"><div class="cardH"><h2>Your horse</h2><div class="r"><a class="btn sm" href="${W.href('horses',{},'#h='+h.id)}">Open ${W.ic(I.chevR,14)}</a></div></div>
        <div class="cardB"><div class="hHeroTop">${C.ring(h.perf,{size:96})}<div><b class="nm">${esc(h.n)}</b><div class="mut">Zangersheide · ${esc(T('10 years'))} · ${esc(h.level)}</div>
          <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap"><span class="pill ${w[0]}">${w[1]}</span><span class="pill ${h.d>0?'good':h.d<0?'bad':''}">${arrow(h.d)}${h.d} pts this month</span></div></div></div>
          <div class="hMini"><div><span class="lbl">BEST</span><b class="num">${best}%</b><small>3 months</small></div><div><span class="lbl">LAST VIDEO</span><b>${esc(D.when(last.date))}</b><small>${last.sc}%</small></div>
          <div><span class="lbl">SHOWS</span><b class="num">${m3.filter(x=>x.show).length}</b><small>3 months</small></div>${careLast(h)}</div></div></section>`; }
    if(RIDER||STAFF){ const P=D.personal(), alOf=h=>D.ALL_ALERTS.filter(a=>a.h===h.n);
      const order=L=>STAFF?[...L].sort((a,b)=>alOf(b).length-alOf(a).length):[...L].sort((a,b)=>(b.perf||0)-(a.perf||0));
      const pillOf=h=>{ if(STAFF){ const a=alOf(h); if(a.length) return `<span class="pill ${a.some(x=>x.lv==='Attention')?'bad':'watch'}">${a.length} ${a.length>1?'alerts':'alert'}</span>`; } return dPill(h); };
      const L=yTab==='own'?order(P):order(vis()), href=(h,own)=>own?W.href('horses',{},'#v=own'):W.href('horses',{},'#h='+h.id);
      return `<section class="card c4 hSide in" id="hSide"><div class="cardH"><h2>Your horses</h2><div class="r"><a class="btn link" href="${W.href('horses')}">See all</a></div></div>
        <div class="cardB" style="padding-top:12px"><div class="seg" id="yTabs" style="width:100%"><button class="${yTab==='stable'?'on':''}" data-t="stable" style="flex:1;justify-content:center">Stable horses <em class="num">${vis().length}</em></button><button class="${yTab==='own'?'on':''}" data-t="own" style="flex:1;justify-content:center">${esc(T(window.SD_OWN_LABEL||'My Horses'))} <em class="num">${P.length}</em></button></div>
        <div class="hList">${L.slice(0,5).map(h=>hRow(h,{href:href(h,yTab==='own'),sub:h.r||"",pill:pillOf(h),rich:L.length<=3})).join('')}
          ${yTab==='own'?`<button class="hRow add" id="hAddOwn"><span class="hAv" style="width:46px;height:46px;font-size:20px;font-weight:500;color:var(--blue-ink);border-style:dashed">+</span><span class="t"><b>Add a horse</b><span>Only you see it. It is not part of the stable and does not count in its numbers.</span></span></button>`:''}</div></div></section>`; }
    const top=[...vis()].sort((a,b)=>b.perf-a.perf).slice(0,5);
    return `<section class="card c4 hSide in"><div class="cardH"><h2>Top performers</h2><div class="r"><a class="btn link" href="${W.href('horses')}">All horses</a></div></div>
      <div class="cardB" style="padding-top:8px"><div class="hList">${top.map((h,k)=>hRow(h,{rank:'#'+(k+1),href:W.href('horses',{},'#h='+h.id),sub:h.r||"",pill:dPill(h)})).join('')}</div></div></section>`; };

  /* the average score chart */
  const avgCard=()=>`<section class="card c8 in" id="hAvgC"><div class="cardH"><h2>${PREM?'Performance score':'Average performance score'}</h2><div class="r">
      ${PREM?'':`<button class="btn sm" id="avgF">${W.ic(I.sliders,15)}<span id="avgFL"></span>${W.ic(I.chev,14)}</button>`}
      <div class="seg" id="avgP">${[1,3,6].map(p=>`<button data-p="${p}" class="${p===fP?'on':''}">${p===1?'1 month':p+' months'}</button>`).join('')}</div></div></div>
    <div class="cardB"><div class="avTop"><div class="avV" id="avgV"></div><span id="avgW"></span></div><div class="mut avS" id="avgS"></div>
      <div class="avCh" id="avgCh"></div><div class="avTip" id="avgTip"></div><div id="avgNote"></div></div></section>`;
  function renderAvg(anim){ const hs0=vis(), hs=hs0.filter(h=>!fH||fH.has(h.id)), A=D.avgSeries(hs.length?hs:hs0,fP), n=A.n, avg=A.avg;
    const last=avg[n-1], d=last-avg[0], up=d>1.5, down=d<-1.5, $=id=>document.getElementById(id);
    $('avgV').innerHTML=`<span class="num">${Math.round(last)}</span><small>%</small>`;
    $('avgW').className='pill '+(up?'good':down?'bad':'blue'); $('avgW').innerHTML=`${W.ic(ICS['graph-up'],12)}${up?'Improving':down?'Dropping':'Steady'}`;
    $('avgS').textContent=`${up?'Up '+Math.abs(Math.round(d))+' points':down?'Down '+Math.abs(Math.round(d))+' points':'About the same'} over ${fP===1?'the last month':'the last '+fP+' months'}, ${hs0.length===1?hs0[0].n:hs.length===hs0.length?'all horses':hs.map(h=>h.n).join(', ')}.`;
    if($('avgFL')) $('avgFL').textContent=riderSel?riderSel.split(' ')[0]:(hs.length===hs0.length?'All horses':`${hs.length} ${hs.length>1?'horses':'horse'}`);
    const labels=Array.from({length:fP+1},(_,k)=>[k*4,D.MONTHS[D.MONTHS.length-1-fP+k]]);
    const tip=k=>{ const wk=n-1-k, best=hs.map((h,i)=>[h,A.series[i][k]]).sort((a,b)=>b[1]-a[1])[0];
      $('avgTip').innerHTML=`<b>${wk===0?'This week':wk===1?'Last week':wk+' weeks ago'}</b> · average <b>${Math.round(avg[k])}%</b> · best ${esc(best?best[0].n:'')}`; };
    C.line($('avgCh'),{values:avg,labels,tone:up?'good':down?'bad':'blue',minH:220,onPick:tip,anim});
    if(anim&&window.SD_COUNT){ SD_COUNT($('avgV')); }
    $('avgNote').innerHTML=riderSel?`<div class="note"><b>${esc(riderSel)}</b> · ${esc(T('average of the horses they ride'))}: ${esc(hs.map(h=>h.n).join(', '))}. ${esc(T('Their own progress over time, not a ranking between riders.'))}</div>`:''; }
  function openAvgFilter(btn){ const hs=vis(), all=!fH||fH.size===hs.length;
    const html=(OWNER?`<div class="gl">Riders</div>${RIDERS.map(R=>`<button class="mi${riderSel===R.n?' on':''}" data-r="${esc(R.n)}"><span class="hAv sm">${esc(R.ini)}</span><span class="t">${esc(R.n)}<small>${esc(R._hs.map(h=>h.n).join(', '))}</small></span><span class="ico ck">${I.check}</span></button>`).join('')}
        <div class="gd" style="padding-top:4px">${esc(T('Each rider is the average of the horses they ride. Horses, heights and goals differ, so compare a rider with themselves over time, not with each other.'))}</div><div class="sep"></div>`:'')
      +`<div class="gl">Horses</div><button class="mi${all&&!riderSel?' on':''}" data-h="all"><span class="t">All horses</span><span class="ico ck">${I.check}</span></button>`
      +hs.map(h=>`<button class="mi${!all&&fH.has(h.id)&&!riderSel?' on':''}" data-h="${h.id}"><span class="hAv sm">${esc(ini(h))}</span><span class="t">${esc(h.n)}</span><em class="num">${h.perf}%</em><span class="ico ck" style="margin-left:10px">${I.check}</span></button>`).join('');
    const p=W.pop(btn,html,{w:320}); if(!p) return;
    p.querySelectorAll('.mi[data-h]').forEach(b=>b.onclick=()=>{ const id=b.dataset.h; riderSel=null;
      if(id==='all') fH=null; else { if(!fH||fH.size===hs.length) fH=new Set(); fH.has(id)?fH.delete(id):fH.add(id); if(!fH.size||fH.size===hs.length) fH=null; }
      W.closePop(); avgSel=null; renderAvg(true); openAvgFilter(btn); });
    p.querySelectorAll('.mi[data-r]').forEach(b=>b.onclick=()=>{ const R=RIDERS.find(x=>x.n===b.dataset.r); if(riderSel===R.n){ riderSel=null; fH=null; } else { riderSel=R.n; fH=new Set(R._rider.hs); } W.closePop(); renderAvg(true); openAvgFilter(btn); }); }

  /* latest sessions */
  const sesCard=()=>`<section class="card c8 in" id="hSes"><div class="cardH"><h2>Latest sessions</h2><div class="r"><a class="btn link" href="${W.href('sessions')}">See all</a></div></div>
    <div class="tbl hSesT" id="sesT" style="margin-top:10px"></div></section>`;
  function renderSessions(){ const box=document.getElementById('sesT'); if(!box) return; const S=D.sessions(vis()).slice(0,7);
    box.innerHTML=`<div class="tr th"><span>HORSE</span><span>SESSION</span><span>DATE</span><span>LENGTH</span><span>SCORE</span><span></span></div>`
      +(S.length?S.map(x=>{ const t=C.toneOfScore(x.sc);
        return `<a class="tr" href="${W.href('session',{v:x.key,sc:x.sc})}" data-vk="${esc(x.key||'')}" data-vh="${esc(x.h0?(x.h0.n0||x.h0.n):x.h.n)}">
          <span class="cellH"><span class="hAv sm">${esc(ini(x.h))}</span><span class="cell2"><b>${esc(x.h.n)}</b><span>${esc(x.h.r||'')}</span></span></span>
          <span class="cellH"><span class="kic ${x.show?'show':''}">${W.kindIcon(x.show)}</span><span class="cell2"><b>${x.show?'Show':'Training'}</b><span>${esc(x.what)}</span></span></span>
          <span class="mut">${esc(D.when(x.date))}</span><span class="mut num">${D.durOf(x)}</span>
          <span class="scB"><span class="bar"><i style="width:${x.sc}%;background:var(--${t})"></i></span><b class="num">${x.sc}<small>%</small></b></span>
          <button class="wIconB more" aria-label="More" data-tip="More">${W.ic(I.dots,18)}</button></a>`; }).join(''):`<div class="tr"><span class="mut">No session yet.</span></div>`);
    box.querySelectorAll('.more').forEach(b=>b.onclick=e=>{ e.preventDefault(); e.stopPropagation(); const row=b.closest('[data-vk]');
      if(window.SD_VIDEO_MENU&&row.dataset.vk) SD_VIDEO_MENU(b,row,{axis:'y',refresh:()=>{ renderSessions(); renderKpis(false); }}); }); }

  /* active alerts */
  const LVT={Attention:'bad',Watch:'watch'};
  const alItem=x=>`<a class="alI" href="${W.href('session',{},D.alertHash(x))}"><span class="sv ${LVT[x.lv]}"></span><span class="hAv sm">${esc(x.ini)}</span>
      <span class="t"><b class="a">${esc(x.a)}</b><span class="b"><span class="hn">${esc(x.h)}</span> · <span>${esc(x.b)}</span></span>
      <span class="m"><span class="pill ${LVT[x.lv]}">${x.lv}</span><span>${esc(x.when)}</span></span></span></a>`;
  const alCard=()=>{ const A=D.alerts(vis());
    return `<section class="card c4 in" id="hAl"><div class="cardH"><h2>${STAFF&&window.SD_JOB==='Farrier'?'Gait alerts':'Active alerts'} <em class="num">${A.length}</em></h2><div class="r"><button class="wIconB" id="alInfo" data-tip="What is an active alert?" aria-label="What is an active alert?">${W.ic(I.info,18)}</button>${A.length?`<button class="btn link" id="alAll">See all</button>`:''}</div></div>
      <div class="alL">${A.length?A.slice(0,4).map(alItem).join(''):`<div class="hEmpty">No open alert.</div>`}</div></section>`; };
  function openAlerts(){ let f='all'; const A=D.alerts(vis());
    const draw=m=>{ const hs=vis().filter(h=>A.some(a=>a.h===h.n));
      m.querySelector('.mB').innerHTML=`<div class="chips" style="margin-bottom:14px"><button class="chip${f==='all'?' on':''}" data-h="all">All horses <em class="num">${A.length}</em></button>${hs.map(h=>`<button class="chip${f===h.n?' on':''}" data-h="${esc(h.n)}">${esc(h.n)} <em class="num">${A.filter(a=>a.h===h.n).length}</em></button>`).join('')}</div>
        <div class="alL" style="margin:0 -24px">${A.filter(a=>f==='all'||a.h===f).map(alItem).join('')}</div>`;
      m.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{ f=c.dataset.h; draw(m); }); };
    W.modal({title:T('Active alerts'),sub:esc(T('Click an alert to open the video at the right moment.')),wide:true,wire:draw}); }
  const alInfo=()=>W.modal({title:T('What is an active alert?'),body:[
      ['What opens an alert','After each video, StrydeUp compares the horse with its own recent sessions. An alert opens when a measure moves away from its usual level, or when the same pattern comes back over several sessions.'],
      ['Attention','A clear change, or a pattern seen on 3 sessions or more. Worth a look before the next start.','bad'],
      ['Watch','A first sign to keep an eye on. Nothing urgent.','watch'],
      ['When it goes away','It closes by itself once the next sessions are back to the horse\'s usual level, usually after 2 or 3 normal videos.']]
    .map(([a,b,c])=>`<div class="infoR">${c?`<i class="dot ${c}"></i>`:'<i class="dot" style="visibility:hidden"></i>'}<div><b>${esc(a)}</b><p>${esc(b)}</p></div></div>`).join(''),
    foot:`<button class="btn pri" id="alOk">Got it</button>`,wire:m=>{ m.querySelector('#alOk').onclick=W.closeModal; }});

  /* trend analysis */
  const trCard=()=>`<section class="card c12 in" id="hTr"><div class="cardH"><h2>Trend analysis</h2><div class="r">
      <div class="seg" id="twPer">${[1,3,6].map(p=>`<button data-p="${p}" class="${p===twP?'on':''}">${p===1?'1 month':p+' months'}</button>`).join('')}</div>
      <button class="btn sm" id="trEdit">${W.ic(I.sliders,15)}<span>Customize</span></button></div></div>
    <div class="cardB"><div id="trSel"></div><div class="twG" id="trk"></div><div id="trNote"></div></div>
    <div class="cardF"><span id="trCount" class="num"></span><a class="btn link" id="trFull" href="#"></a></div></section>`;
  const twIcon=(id,px)=>W.ic(WI[D.TRM[id].l]||(window.SD_TRM_ICON_OF&&SD_TRM_ICON_OF(D.TRM[id].l))||WI.Performance,px);
  function renderTrend(anim){ const hs=vis(); if(!hs.length) return; if(!th||(!hs.some(h=>h.id===th)&&!(trRider&&th===trRider.id))) th=(hs.find(h=>h.id==='mb')||hs[0]).id;
    const sub=trRider?hs.filter(h=>trRider._rider.hs.includes(h.id)):hs, cur=trRider&&th===trRider.id?trRider:hs.find(h=>h.id===th);
    const pills=(L,on)=>L.map(h=>`<button class="hp${on(h)?' on':''}" data-h="${h.id}"><span class="hAv sm">${esc(ini(h))}</span>${esc(h.n)}</button>`).join('');
    document.getElementById('trSel').innerHTML=PREM?'':(OWNER?`<div class="trRow"><span class="lbl">RIDER</span><div class="hps"><button class="hp${trRider?'':' on'}" data-r=""><span class="hAv sm">${esc(T('All'))}</span>All riders</button>${RIDERS.map(R=>`<button class="hp${trRider===R?' on':''}" data-r="${R.id}"><span class="hAv sm">${esc(R.ini)}</span>${esc(R.n)}</button>`).join('')}</div></div>`:'')
      +`<div class="trRow">${OWNER?'<span class="lbl">HORSES</span>':''}<div class="hps">${pills(trRider?[trRider].concat(sub):sub,h=>h.id===th)}</div></div>`;
    document.querySelectorAll('#trSel .hp[data-h]').forEach(b=>b.onclick=()=>{ th=b.dataset.h; renderTrend(true); });
    document.querySelectorAll('#trSel .hp[data-r]').forEach(b=>b.onclick=()=>{ trRider=RIDERS.find(x=>x.id===b.dataset.r)||null; th=trRider?trRider.id:'mb'; renderTrend(true); });
    const g=document.getElementById('trk');
    g.innerHTML=TW.map(id=>{ const X=D.twInfo(cur,id,twP), tone=C.toneOfTrend(X.tone);
      return `<a class="tw" href="${cur._hs?W.href('horses',{},'#p='+cur.ini):W.href('horses',{},'#h='+cur.id+'&v=trends&m='+id)}"><span class="h">${twIcon(id,16)}<span>${esc(X.m.l)}</span></span>
        <span class="v"><span class="num">${X.val}</span><small>${esc(X.unit)}</small></span><span class="pill ${tone}">${esc(X.delta)}</span><span class="sp">${C.spark(X.s,tone,200,44)}</span></a>`; }).join('')
      +(!TW.length?`<button class="tw add" id="twAdd"><span class="pl">+</span><span>Add widgets</span></button>`:'');
    const add=document.getElementById('twAdd'); if(add) add.onclick=openCustomize;
    document.getElementById('trCount').textContent=`${TW.length} / ${D.TWMAX} widgets`;
    const full=document.getElementById('trFull');
    if(cur._hs){ full.innerHTML=`${esc(T('See'))} ${esc(cur.n)} ${W.ic(I.chevR,14)}`; full.href=W.href('horses',{},'#p='+cur.ini); }
    else { full.innerHTML=`<span>${esc(`See ${cur.n}'s full analysis`)}</span>${W.ic(I.chevR,14)}`; full.href=W.href('horses',{},'#h='+cur.id+'&v=trends'); }
    document.getElementById('trNote').innerHTML=cur._hs?`<div class="note"><b>${esc(cur.n)}</b> · ${esc(T('average of the horses they ride'))}: ${esc(cur._hs.map(h=>h.n).join(', '))}. ${esc(T('Heights and goals differ: read it as their own progress, not a ranking.'))} ${esc(T('Pick a horse below for its own trends.'))}</div>`:'';
    if(anim&&!RM()) g.querySelectorAll('.tw:not(.add)').forEach((t,k)=>{ window.SD_WIPE&&SD_WIPE(t.querySelector('.sp svg'),60+k*50); window.SD_COUNT&&SD_COUNT(t.querySelector('.v')); }); }
  function openCustomize(){ const hs=vis(), cur=trRider&&th===trRider.id?trRider:hs.find(h=>h.id===th)||hs[0];
    const draw=m=>{ const full=TW.length>=D.TWMAX;
      m.querySelector('.mB').innerHTML=`<div class="cuTop"><div class="cuDots">${Array.from({length:D.TWMAX},(_,k)=>`<i class="${k<TW.length?'on':''}"></i>`).join('')}</div><span class="mut num">${TW.length} / ${D.TWMAX} widgets</span>${full?`<span class="pill watch">${esc(T('8 widgets max. Remove one to add another.'))}</span>`:''}</div>`
        +D.TRG.map(gp=>`<div class="cuG"><div class="lbl">${esc(gp.g)}</div><div class="cuL">${gp.items.map(([id])=>{ const X=D.twInfo(cur,id,twP), on=TW.includes(id), tone=C.toneOfTrend(X.tone);
          return `<button class="cuR${on?' on':''}" data-id="${id}" ${!on&&full?'disabled':''}><span class="sp">${C.spark(X.s,tone,72,28)}</span>${twIcon(id,16)}<span class="t"><b>${esc(X.m.l)}</b><span class="num">${X.val}${X.unit==='%'||X.unit==='°'?X.unit:' '+esc(X.unit)}</span></span><span class="ck">${on?I.check:'+'}</span></button>`; }).join('')}</div></div>`).join('');
      m.querySelectorAll('.cuR').forEach(b=>b.onclick=()=>{ const id=b.dataset.id, i=TW.indexOf(id); if(i>=0) TW.splice(i,1); else if(TW.length<D.TWMAX) TW.push(id); else return; D.twSave(TW); const st=m.querySelector('.mB').scrollTop; draw(m); m.querySelector('.mB').scrollTop=st; renderTrend(false); }); };
    W.modal({title:T('Customize your trends'),sub:esc(T('Pick up to 8 measures. They are the same on the phone.')),wide:true,wire:draw,foot:`<button class="btn pri" id="cuOk">Done</button>`});
    document.getElementById('cuOk').onclick=W.closeModal; }

  /* the Stable Owner: team and activity */
  const teamCard=()=>{ const hsOf=p=>D.ALL.filter(h=>p.hs.includes(h.id));
    return `<section class="card c8 in"><div class="cardH"><h2>Your team <em class="num">${D.TEAM.length}</em></h2><div class="r"><button class="btn sm" id="hAddUser2">${W.ic(I.team,15)}<span>Add a user</span></button></div></div>
      <div class="tbl hTeamT" style="margin-top:10px"><div class="tr th"><span>PERSON</span><span>ROLE</span><span>HORSES</span><span></span></div>
      ${D.TEAM.map(p=>`<a class="tr" href="${W.href('team',{},'#p='+p.ini)}"><span class="cellH"><span class="hAv${p.role.startsWith('You')?' me':''}">${esc(p.ini)}</span><span class="cell2"><b>${esc(p.n)}</b><span>${hsOf(p).length?`${hsOf(p).length} ${hsOf(p).length>1?'horses':'horse'}`:'Every horse, as groom'}</span></span></span>
        <span><span class="pill">${esc(T(p.role))}</span></span>
        <span class="stackA">${(hsOf(p).length?hsOf(p):D.ALL).map(h=>`<span class="hAv sm" data-tip="${esc(h.n)}">${esc(h.ini)}</span>`).join('')}</span>
        <span class="ico" style="width:16px;height:16px;color:var(--dim)">${I.chevR}</span></a>`).join('')}</div></section>`; };
  const actCard=()=>`<section class="card c4 in" style="display:flex;flex-direction:column"><div class="cardH"><h2>Team activity</h2></div><div class="actL">${D.ACT.map(([i,n,v,w,t,go])=>`<a class="actR" href="${go==='session'?W.href('session'):W.href('horses',{},'#h='+go)}"><span class="hAv sm">${esc(i)}</span><span class="t"><span class="a"><b>${esc(n)}</b> <span>${esc(v)}</span></span><span class="b"><span>${esc(w)}</span> · <span>${esc(t)}</span></span></span></a>`).join('')}</div><div class="cardF" style="margin-top:auto"><span>${esc(T('What your team did lately'))}</span><a class="btn link" href="${W.href('team')}">Open the team</a></div></section>`;

  /* Premium: care and the step up to Pro */
  /* the regular cares of the horse (care.js, the same visits as the horse page): how long since each one, what is planned */
  const RHY=['farrier','osteo','vet','dentist'], PNAME={vet:'Vet',osteo:'Osteopath',farrier:'Farrier',dentist:'Dentist',physio:'Physio',chiro:'Chiropractor',saddle:'Saddle fitter',nutri:'Nutritionist',other:'Other'};
  const since=d=>{ const n=Math.round((TODAY-d)/DAY); return n===0?'Today':n===1?'Yesterday':n<45?`${n} days ago`:`${Math.round(n/30)} months ago`; };
  const fmtD=d=>`${D.DAY[d.getDay()]} ${d.getDate()} ${D.MON[d.getMonth()]}`;
  const careOf=h=>window.CARE?CARE.list(h.id):[];
  const careLast=h=>{ const p=careOf(h).filter(v=>v.d<=TODAY).pop(); return p?`<div><span class="lbl">LAST VISIT</span><b>${esc(T(PNAME[p.type]||p.type))}</b><small>${esc(since(p.d))}</small></div>`:''; };
  const careCard=()=>{ const h=vis()[0], L=careOf(h), past=L.filter(v=>v.d<=TODAY).reverse(), up=L.filter(v=>v.d>TODAY);
    return `<section class="card c12 in"><div class="cardH"><h2>Care & visits</h2><div class="r"><span class="mut" style="font-size:12.5px">${past.length} ${esc(T('logged'))}</span><a class="btn link" href="${W.href('horses',{},'#h='+h.id+'&v=care')}">See all</a></div></div>
      <div class="cardB"><div class="hcvG">${RHY.map(k=>{ const v=past.find(x=>x.type===k);
        return `<a class="hcvT${v?'':' none'}" href="${W.href('horses',{},'#h='+h.id+'&v=care')}"><span class="h">${window.CARE?CARE.ico(k,18):''}<span>${esc(T(PNAME[k]))}</span></span><b>${v?esc(since(v.d)):esc(T('Not logged yet'))}</b><small>${v?`<span>Last</span> <span>${esc(fmtD(v.d))}</span>`:esc(T('No visit on record'))}</small></a>`; }).join('')}
        <div class="hcvT plan"><span class="h"><span>Planned</span></span>${up.length?up.slice(0,2).map(v=>`<b>${esc(T(PNAME[v.type]||v.type))}</b><small>${esc(fmtD(v.d))}</small>`).join(''):`<b class="mut" style="font-weight:600">${esc(T('Nothing planned'))}</b><small>${esc(T('Visits show on the Trends, with the performance before and after.'))}</small>`}</div></div></div></section>`; };
  const upCard=()=>`<section class="card hUp in"><div class="cardB"><span class="ico" style="width:40px;height:40px;border-radius:11px;background:var(--blue-bg);color:var(--blue-ink);padding:9px">${(window.SD_PLAN_ICO||{}).pro||''}</span>
      <b>Riding more than one horse?</b><p class="mut">Pro follows as many horses as you want, with the stable view.</p><button class="btn pri" id="hSeePro">See Pro</button></div></section>`;

  /* ---------- the page ---------- */
  let kpiBox=null;
  function renderKpis(anim){ if(!kpiBox) return; kpiBox.innerHTML=kpis(); wireKpis(); if(anim&&window.SD_COUNT) kpiBox.querySelectorAll('.kpi .v').forEach(v=>SD_COUNT(v)); if(anim&&window.SD_WIPE) kpiBox.querySelectorAll('.kpi .spark svg').forEach((s,k)=>SD_WIPE(s,120+k*60)); }
  function wireKpis(){ const a=document.getElementById('kAl'); if(a) a.onclick=openAlerts;
    const v=document.getElementById('kAvg'); if(v) v.onclick=e=>{ e.preventDefault(); document.getElementById('hAvgC').scrollIntoView({behavior:RM()?'auto':'smooth',block:'center'}); }; }
  function render(first){
    applyStable();
    const rows=[];
    if(PREM) rows.push(side()+avgCard());
    else if(OWNER) rows.push(teamCard()+actCard(), avgCard()+side());
    else rows.push(avgCard()+side());
    rows.push(sesCard()+(PREM?`<div class="c4 stack">${alCard()}${upCard()}</div>`:alCard()), trCard());
    if(PREM) rows.push(careCard());
    page.innerHTML=head()+errBar()+ctx()+`<div id="kpiBox"></div>`+rows.map(r=>`<div class="grid hRowG">${r}</div>`).join('');
    kpiBox=document.getElementById('kpiBox'); renderKpis(true);
    renderAvg(true); renderSessions(); renderTrend(true); wire();
    if(!RM()) page.querySelectorAll('.in').forEach((el,k)=>el.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:260,delay:Math.min(k,10)*35,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'}));
  }
  function wire(){ const $=id=>document.getElementById(id);
    if($('hErr')) $('hErr').onclick=W.openErr;
    W.onErrRetry=()=>{ errHidden=true; const b=$('hErr'); if(b) b.remove(); };
    [$('hAddUser'),$('hAddUser2')].forEach(b=>{ if(b) b.onclick=()=>W.go('team',{},'#invite'); });
    /* a video sent from Home: Sessions opens with it on top, Analysing (as on the phone) */
    W.uploadDone=rec=>W.go('sessions',{},'#new='+rec.id);
    if($('avgF')) $('avgF').onclick=()=>openAvgFilter($('avgF'));
    $('avgP').querySelectorAll('button').forEach(b=>b.onclick=()=>{ fP=+b.dataset.p; $('avgP').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); renderAvg(true); });
    $('twPer').querySelectorAll('button').forEach(b=>b.onclick=()=>{ twP=+b.dataset.p; $('twPer').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); renderTrend(true); });
    $('trEdit').onclick=openCustomize;
    if($('alAll')) $('alAll').onclick=openAlerts; $('alInfo').onclick=alInfo;
    if($('yTabs')) $('yTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{ yTab=b.dataset.t; const s=$('hSide'); s.outerHTML=side(); wire(); });
    if($('hAddOwn')) $('hAddOwn').onclick=()=>W.go('horses',{},'#v=own&add=own');
    if($('hSeePro')) $('hSeePro').onclick=()=>window.openUpsellHorse?openUpsellHorse():null;
    if(MULTI&&$('stChips')){ const counts={}; D.ALL.forEach(h=>{ const k=h.st||'ms'; counts[k]=(counts[k]||0)+1; }); SD_STABLE_CHIPS($('stChips'),counts,()=>{ render(false); switcher(); }); }
  }
  /* the stable switcher of the top bar: same choice as the chips */
  function switcher(){ if(!MULTI) return W.switcher(null); const cur=SD_STABLE_SEL(), st=SD_STABLES.find(s=>s.id===cur), counts={}; D.ALL.forEach(h=>{ const k=h.st||'ms'; counts[k]=(counts[k]||0)+1; });
    W.switcher({ini:st?st.ini:String(SD_STABLES.length),label:st?st.n:T('All stables'),head:T('Stable'),
      items:[{v:'all',ini:String(SD_STABLES.length),label:T('All stables'),count:D.ALL.length,on:cur==='all'}].concat(SD_STABLES.map(s=>({v:s.id,ini:s.ini,label:s.n,sub:s.city,count:counts[s.id]||0,on:cur===s.id}))),
      onPick:v=>{ SD_SET_STABLE_SEL(v); render(false); switcher(); }}); }
  render(true); switcher();
})();
