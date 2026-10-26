/* StrydeUp desktop web app, the session analysis (phase 2).
   The phone's session page (Etape 1 - Session Overview.html) laid out for a computer, with the SAME data and numbers
   (web/session-data.js is a copy of the phone's data and generators). Which session: ?v=<horse id>|<date> as on the phone
   (plan.js SD_THIS_VIDEO); its horse, rider, date, kind and venue come from the account's sessions (data.js), so a link
   from Home opens the right session. #watch=... (an alert from Home) opens Overview on Things to watch, the alert lit.
   Tabs: Overview, Heatmap, Jumps, Metrics, Trends, Compare; the URL hash keeps the tab (#jumps:5A keeps the jump too).
   Account rules (plan.js): every account sees the horses it is given, nothing else; the groom sees what the rider sees. */
(function(){
  const W=window.SDW, D=window.SD_DATA, C=window.SDC, S=window.SDS, T=W.T, esc=W.esc, I=W.I;
  const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page=document.getElementById('wPage');
  const NOSC=false;   /* every account sees the scores: the groom has exactly the rider's screens (client decision) */
  const $=id=>document.getElementById(id);
  const PCT=u=>window.SD_PCT?SD_PCT(u):/^%/.test(u||'');
  const MON=D.MON, DAY=D.DAY;
  const fDate=d=>`${DAY[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
  const fShort=d=>`${d.getDate()} ${MON[d.getMonth()]}`;
  const mmss=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
  const ini=n=>String(n).split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const decOf=m=>m.u==='per round'?0:(m.v<10?(m.sd<1?2:1):0);

  /* ---------- which session ---------- */
  const KEY=window.SD_THIS_VIDEO?SD_THIS_VIDEO():'mb|2026-09-30';
  const hasV=new URLSearchParams(location.search).has('v');
  let WATCH=null; { const m=location.hash.match(/^#watch=(.+)$/); if(m){ try{ WATCH=JSON.parse(decodeURIComponent(m[1])); }catch(e){} } }
  const ALLS=D.sessions(D.ALL.concat(D.personal()));
  let SES=hasV||!WATCH?ALLS.find(s=>s.key===KEY)||null:null;   /* an alert without ?v= opens its horse's latest session, below */
  /* a key that is not in this list (the Sessions page draws its dates with its own generator): read it as the phone does,
     horse id | date, the session of that horse on that day; kind and work from its closest session */
  if(!SES&&hasV){ const [hid,ds]=KEY.split('|'), p=(ds||'').split('-').map(Number), pool=D.ALL.concat(D.personal());
    const moved=window.SD_VIDEO_HORSE&&SD_VIDEO_HORSE(KEY), h=(moved&&pool.find(x=>(x.n0||x.n)===moved))||pool.find(x=>x.id===hid);
    if(h&&p.length===3&&!(window.SD_VIDEO_DELETED&&SD_VIDEO_DELETED(KEY))){ const date=new Date(p[0],p[1]-1,p[2]), mine=ALLS.filter(x=>x.h.id===h.id);
      const near=mine.reduce((a,x)=>!a||Math.abs(x.date-date)<Math.abs(a.date-date)?x:a,null)||{};
      SES={h,h0:pool.find(x=>x.id===hid)||h,date,key:KEY,show:!!near.show,what:near.what||'Course',ht:near.ht,ven:near.ven,sc:near.sc}; } }
  if(!SES&&WATCH) SES=ALLS.find(s=>s.h.n===WATCH.h)||null;      /* an alert: the horse's latest session */
  if(!SES&&!hasV) SES=ALLS.find(s=>s.key===KEY)||ALLS[0]||null;
  if(!SES) SES=ALLS[0]||null;
  if(SES) S.setEnd(SES.date);                                    /* Trends and Compare end on this session */

  /* ---------- the mobile numbers ---------- */
  const PERF=S.PERF, TD=S.TD, JDATA=S.JDATA, FIDS=TD.fences.map(f=>f.id), MICONS=S.MICONS;
  /* the score of the session opened (the score of its row, carried by the link): the ring, the verdict, the 3 session scores
     and the end of their trends move by the same delta, as on the phone (plan.js SD_SES_SHIFT) */
  { const want=SES&&SES.key===KEY?(window.SD_SES_SC?SD_SES_SC():null):(SES?SES.sc:null);   /* not the session of the link (an alert, a fallback): its own score */
    if(window.SD_SES_SHIFT&&want!=null) SD_SES_SHIFT({perf:PERF,scores:S.SCORES,trends:S.TR_ALL},want-PERF.v); }
  const VWORD=v=>window.SD_SES_WORD?SD_SES_WORD(v):'Good session';
  const TR_ALL=S.TR_ALL.filter(m=>!NOSC||(m.g!=='Session scores'&&m.id!=='j_score'));
  const trCache={}; const ser=id=>trCache[id]||(trCache[id]=S.trSeries(S.TR_ALL.find(x=>x.id===id)));
  const TRS=()=>S.TR_SESS;
  /* the round inside the 4:12 video: fence 1 at 0:24, the last fence near 3:36 (the phone's lead change and anomaly times) */
  const DUR=S.DUR, VT=rt=>24+(rt-.76)*2.85, RT=vt=>(vt-24)/2.85+.76;
  const FT=Object.fromEntries(TD.fences.map(f=>[f.id,VT(f.t)]));

  /* icons, as on the phone */
  const svgI=(inner,col)=>`<svg viewBox="0 0 24 24" style="stroke:${col||'currentColor'};color:${col||'currentColor'};fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round">${inner||''}</svg>`;
  const mic=(k,col)=>{ const v=MICONS[S.MALIAS[k]||k]||''; return /^<svg/.test(v)?v.replace('<svg ',`<svg style="color:${col||'currentColor'};stroke:none" `):svgI(v,col); };
  const wIcon=(name)=>(S.WICON[name]||(window.SD_TRM_ICON_OF?SD_TRM_ICON_OF(name):'')||'').replace('<svg ','<svg style="fill:currentColor;stroke:none" ');
  const icOf=m=>wIcon(m.l)||mic(m.ic);
  const TONE={green:'good',orange:'watch',red:'bad',g:'good',o:'watch',r:'bad',normal:'good',watch:'watch',attention:'bad'};
  const ric=(icon,tone,size)=>`<span class="sRic ${tone||'blue'}"${size?` style="width:${size}px;height:${size}px"`:''}>${mic(icon)}</span>`;
  const KIC=k=>window.SD_KIC?SD_KIC(k):'';

  /* ---------- state of a metric: good / watch / bad ----------
     a score in % (higher is better): its level; anything else: this session against the horse's last 12 sessions */
  function stateOf(id){ const m=S.TR_ALL.find(x=>x.id===id); if(!m) return {t:'',w:''};
    const v=ser(id), cur=v[v.length-1], prev=v.slice(-13,-1), mean=prev.reduce((a,x)=>a+x,0)/prev.length, z=(cur-mean)/(m.sd||1);
    if(m.better>0&&m.u==='%'){ const t=cur>=70?'good':cur>=55?'watch':'bad'; return {t,w:{good:'Good',watch:'Watch',bad:'Work on'}[t],mean,why:'level'}; }
    if(m.better!==0){ const s=z*m.better, t=s>=-.4?'good':s>=-1.1?'watch':'bad'; return {t,w:{good:'Good',watch:'Watch',bad:'Work on'}[t],mean,why:'trend'}; }
    const a=Math.abs(z), t=a<1.2?'good':a<2?'watch':'bad'; return {t,w:{good:'Usual',watch:'Watch',bad:'Unusual'}[t],mean,why:'band'}; }

  /* ---------- session facts ---------- */
  const H=SES?SES.h:{n:'Midnight Bolt',r:'John Doe',id:'mb'};
  const KIND=SES&&SES.show?'Competition':'Training';
  const CLS=SES?(SES.show?SES.ht:SES.what):'Course';
  const VEN=SES?(SES.show?SES.ven:(window.SD_STABLE_OF?SD_STABLE_OF(H).n:'')):'';
  if(WATCH){ S.ALERTS.splice(0,S.ALERTS.length,{c:WATCH.lv==='Attention'?'red':'orange',ic:WATCH.ic||'hind',a:WATCH.a,b:WATCH.b}); }

  /* ======================================================================
     HEADER and TABS
     ====================================================================== */
  const TABS=[['overview','Overview'],['heatmap','Heatmap'],['jumps','Jumps'],['metrics','Metrics'],['trends','Trends'],['compare','Compare']];
  function header(){
    const show=SES&&SES.show;
    const ring=NOSC?'':`<div class="sScore" id="sScore" data-tip="Performance score of the session">${C.ring(PERF.v,{size:68,stroke:6})}
        <div class="t"><span class="lbl">Performance</span><b>${esc(VWORD(PERF.v))}</b><span class="pill good">▲ ${esc(PERF.d)} session</span></div></div><span class="sVr"></span>`;
    return `<section class="sHd in" id="sHd">
      <div class="sHdL"><span class="sHAv">${esc(ini(H.n))}</span>
        <div class="t"><div class="sCr"><a href="${W.href('sessions')}">Sessions</a><span class="ico" style="width:12px;height:12px">${I.chevR}</span><span>Session analysis</span></div>
          <h1 class="sHT" id="sHT">${esc(H.n)}</h1>
          <div class="sMeta"><span>${esc(H.r||'')}</span><i></i><span>${esc(SES?fDate(SES.date):'Mon 4 May 2026')}</span><i></i>
            <span class="sKind ${show?'show':''}"><span class="ico">${KIC(KIND)}</span><span>${KIND}</span></span><i></i><span>${esc(CLS)}</span>${VEN?`<i></i><span>${esc(VEN)}</span>`:''}</div></div></div>
      <div class="sHdR">${ring}
        <button class="btn" id="sShare">${W.ic(SHARE,17)}<span>Share</span></button>
        <button class="btn" id="sMove">${W.ic(I.swap,17)}<span>Change horse</span></button>
        <button class="wIconB" id="sMore" aria-label="More" data-tip="More">${W.ic(I.dots,18)}</button></div></section>
    <nav class="sTabs" id="sTabs" aria-label="Session analysis"><div class="sSeg" role="tablist">${TABS.map(([k,l],i)=>`<button role="tab" data-t="${k}" aria-selected="false"><span class="ico">${S.TAB_IC[i]}</span><span>${l}</span></button>`).join('')}<i class="sInk" id="sInk"></i></div>
      <span class="sKeys" id="sKeys"></span></nav>
    <div id="sPanes">${TABS.map(([k])=>`<section class="sPane" id="p-${k}" role="tabpanel" hidden></section>`).join('')}</div>`; }
  const SHARE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M8 11H6.5A2.5 2.5 0 0 0 4 13.5v4A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5v-4a2.5 2.5 0 0 0-2.5-2.5H16"/></svg>';
  const LINK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/></svg>';
  const TRASH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 7h15M9.5 7V5.2c0-.7.5-1.2 1.2-1.2h2.6c.7 0 1.2.5 1.2 1.2V7M6.5 7l.8 11.6c.1 1 .9 1.9 2 1.9h5.4c1.1 0 1.9-.9 2-1.9L17.5 7M10.2 11v5.5M13.8 11v5.5"/></svg>';

  if(!SES){ page.innerHTML=`<div class="wSoon"><div class="ill">${W.ic(I.sessions)}</div><h2>No session yet</h2><p>Upload a video to get the analysis of the round.</p><div class="acts"><button class="btn pri" onclick="SDW.openUpload()">${W.ic(I.upload)}<span>Upload video</span></button></div></div>`; return; }
  page.classList.add('sPage'); page.innerHTML=header();

  /* actions: share, change horse, delete (plan.js keeps it on this computer, like the phone) */
  $('sShare').onclick=()=>{ const b=$('sShare'); const url=location.href.split('#')[0];
    const p=W.pop(b,`<div class="gl">Share this analysis</div><button class="mi" id="sCopy">${W.ic(LINK)}<span class="t">Copy the link<small>People of the stable open it with their own account</small></span></button>`,{w:320});
    if(p) p.querySelector('#sCopy').onclick=()=>{ W.closePop(); try{ navigator.clipboard.writeText(url); }catch(e){} window.SD_TOAST&&SD_TOAST(T('Link copied')); }; };
  const curName=()=>(window.SD_VIDEO_HORSE&&SD_VIDEO_HORSE(SES.key))||(SES.h0?(SES.h0.n0||SES.h0.n):H.n);
  const paintName=()=>{ const n=curName(), h=D.ALL.concat(D.personal()).find(x=>(x.n0||x.n)===n); $('sHT').textContent=h?h.n:n; };
  $('sMove').onclick=()=>window.SD_PICK_HORSE&&SD_PICK_HORSE({current:curName(),onSave:n=>{ const prev=SD_VIDEO_HORSE(SES.key); SD_SET_VIDEO_HORSE(SES.key,n); paintName();
    SD_UNDO&&SD_UNDO(T('Moved to')+' '+n,()=>{ SD_SET_VIDEO_HORSE(SES.key,prev); paintName(); }); }});
  $('sMore').onclick=()=>{ const b=$('sMore'); const p=W.pop(b,`<button class="mi" id="sMvM">${W.ic(I.swap)}<span class="t">Change horse</span></button><div class="sep"></div><button class="mi sRed" id="sDel">${W.ic(TRASH)}<span class="t">Delete video</span></button>`,{w:220});
    if(!p) return; p.querySelector('#sMvM').onclick=()=>{ W.closePop(); $('sMove').click(); };
    p.querySelector('#sDel').onclick=()=>{ W.closePop(); SD_CONFIRM_DELETE({onConfirm:()=>{ SD_DELETE_VIDEO(SES.key); SD_UNDO_LATER({type:'video',key:SES.key}); W.go('sessions'); }}); }; };

  /* ======================================================================
     THE VIDEO PLAYER: the round's timeline, fences and things to watch on it
     ====================================================================== */
  function player(el,o){ o=o||{}; const R=o.range||[0,DUR], len=R[1]-R[0], RID=TD.rid;
    const marks=TD.fences.map(f=>({t:FT[f.id],id:f.id}));
    const anoms=o.compact?[]:S.ANOMALIES;
    el.classList.add('vp'); if(o.compact) el.classList.add('cmp');
    el.innerHTML=`<div class="vpSt"><div class="vpBg"></div>${ARENA}
        <div class="vpId"><b>${esc(H.n)}</b><span>${esc(H.r||'')}</span></div>
        <svg class="vpMap" viewBox="${TD.OX-6} ${TD.OY-6} ${TD.W+12} ${TD.H+12}" aria-hidden="true"><rect x="${TD.OX}" y="${TD.OY}" width="${TD.W}" height="${TD.H}" rx="6" fill="none" stroke="rgba(255,255,255,.18)"/>
          <path d="M${RID.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')}" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="2" stroke-linejoin="round"/>
          <path class="vpDone" d="" fill="none" stroke="#5B9BFF" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
          ${TD.fences.map(f=>`<rect x="${f.x-5}" y="${f.y-1.6}" width="10" height="3.2" rx="1.2" fill="rgba(255,255,255,.7)" transform="rotate(${-f.ang} ${f.x} ${f.y})"/>`).join('')}
          <circle class="vpDot" r="5" fill="#fff" stroke="#3B82F6" stroke-width="2.5"/></svg>
        <div class="vpCap" id=""><span class="dot blue"></span><div><b class="a"></b><span class="b"></span></div></div>
        <button class="vpBig" aria-label="Play"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="#fff"/></svg></button>
        <div class="vpCtl"><div class="vpTl" role="slider" aria-label="Video timeline" tabindex="0">
            <div class="trk"><i class="buf"></i><i class="done"></i></div>
            ${marks.map((m,k)=>`<span class="mk" data-id="${m.id}" style="left:${((m.t-R[0])/len*100).toFixed(2)}%"><i></i><em>${m.id}</em></span>`).join('')}
            ${anoms.map(a=>`<span class="an ${TONE[a.c]}" data-t="${a.t}" style="left:${((a.t-R[0])/len*100).toFixed(2)}%"></span>`).join('')}
            <i class="hd"></i><div class="bub"></div></div>
          <div class="vpRow"><button class="vpPP" aria-label="Play">${PLAY}</button><span class="tm num"><span class="c">0:00</span> / ${mmss(DUR)}</span>
            <span class="vpLeg">${o.compact?'':`<span><i class="lg j"></i>Fences</span><span><i class="lg w"></i>Things to watch</span>`}</span>
            <button class="vpSp" data-tip="Playback speed">1×</button></div></div></div>`;
    const st=el.querySelector('.vpSt'), tl=el.querySelector('.vpTl'), done=el.querySelector('.done'), hd=el.querySelector('.hd'), bub=el.querySelector('.bub'), cur=el.querySelector('.tm .c');
    const big=el.querySelector('.vpBig'), pp=el.querySelector('.vpPP'), cap=el.querySelector('.vpCap'), dot=el.querySelector('.vpDot'), dn=el.querySelector('.vpDone');
    // hide fence labels that would overlap
    { let last=-99; el.querySelectorAll('.mk').forEach(m=>{ const x=parseFloat(m.style.left); m.classList.toggle('nolb',x-last<(o.compact?7:2.6)); if(!m.classList.contains('nolb')) last=x; }); }
    let t=o.start!=null?o.start:R[0], playing=false, raf=0, last=0, speed=1, hov=null;
    const ridAt=rt=>{ if(rt<=RID[0][2]) return RID[0]; for(let i=1;i<RID.length;i++) if(RID[i][2]>=rt){ const a=RID[i-1],b=RID[i],k=(rt-a[2])/(b[2]-a[2]||1); return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,rt]; } return RID[RID.length-1]; };
    const phase=vt=>{ const rt=RT(vt), an=anoms.find(a=>Math.abs(a.t-vt)<3.2);
      if(an) return {tone:TONE[an.c],a:an.a,b:an.b};
      const F=TD.fences, near=F.find(f=>Math.abs(f.t-rt)<.45);
      if(near) return {a:'Fence '+near.id,b:JDATA[near.id].type+' · in the air'};
      if(rt<F[0].t-.6) return {a:'Start of the round',b:'Fence 1 next'};
      const nx=F.find(f=>f.t>rt); if(!nx) return {a:'Finish',b:'Round complete'};
      const pv=[...F].reverse().find(f=>f.t<rt);
      return nx.t-rt<2.2?{a:'Approaching fence '+nx.id,b:JDATA[nx.id].type}:{a:pv?pv.id+' → '+nx.id:'Fence '+nx.id,b:'Between fences'}; };
    let capKey='';
    const paint=()=>{ const k=Math.max(0,Math.min(1,(t-R[0])/len)); done.style.width=(k*100)+'%'; cur.textContent=mmss(t);
      const rt=RT(t), p=ridAt(Math.max(RID[0][2],Math.min(RID[RID.length-1][2],rt))); dot.setAttribute('cx',p[0].toFixed(1)); dot.setAttribute('cy',p[1].toFixed(1));
      { const dp=RID.filter(q=>q[2]<=rt); dn.setAttribute('d',dp.length>1?'M'+dp.map(q=>q[0].toFixed(1)+' '+q[1].toFixed(1)).join('L'):'M0 0'); dn.style.opacity=dp.length>1?1:0; }
      el.querySelectorAll('.mk').forEach(m=>m.classList.toggle('hot',Math.abs(FT[m.dataset.id]-t)<2));
      const ph=phase(t), key=ph.a+ph.b; if(key!==capKey){ capKey=key; cap.querySelector('.a').textContent=T(ph.a); cap.querySelector('.b').textContent=T(ph.b);
        cap.querySelector('.dot').className='dot '+(ph.tone||'blue'); if(!RM()&&cap.animate) cap.animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'}); }
      o.onTime&&o.onTime(t); };
    const loop=now=>{ raf=0; if(!playing) return; const dt=last?Math.min(.1,(now-last)/1000):0; last=now; t+=dt*speed;
      if(t>=R[1]){ if(o.loop){ t=R[0]; } else { t=R[1]; set(false); } } paint(); if(playing) raf=requestAnimationFrame(loop); };
    const set=on=>{ playing=on; el.classList.toggle('on',on); pp.innerHTML=on?PAUSE:PLAY; pp.setAttribute('aria-label',on?'Pause':'Play'); last=0; if(on&&!raf){ if(t>=R[1]-.05) t=R[0]; raf=requestAnimationFrame(loop); } };
    big.onclick=pp.onclick=()=>set(!playing);
    st.addEventListener('click',e=>{ if(e.target===st||e.target.classList.contains('vpBg')) set(!playing); });
    el.querySelector('.vpSp').onclick=e=>{ speed=speed===1?2:speed===2?.5:1; e.currentTarget.textContent=speed===.5?'0.5×':speed+'×'; };
    const at=e=>{ const r=tl.getBoundingClientRect(); return R[0]+Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*len; };
    const bubble=(x,html)=>{ bub.innerHTML=html; const w=bub.offsetWidth, tw=tl.offsetWidth; bub.style.left=Math.max(w/2,Math.min(tw-w/2,x))+'px'; bub.classList.add('on'); };
    tl.addEventListener('pointermove',e=>{ const v=at(e), r=tl.getBoundingClientRect(), x=e.clientX-r.left; hd.style.left=x+'px'; hd.classList.add('on');
      const mk=e.target.closest('.mk'), an=e.target.closest('.an');
      if(an){ const a=anoms.find(z=>z.t===+an.dataset.t); bubble(x,`<b>${esc(T(a.a))}</b><span>${mmss(a.t)} · ${esc(T(a.b))}</span>`); }
      else if(mk){ const id=mk.dataset.id; bubble(x,`<b>${esc(T('Fence'))} <span translate="no">${esc(id)}</span></b><span>${mmss(FT[id])} · ${esc(T(JDATA[id].type))}</span>`); }
      else bubble(x,`<b class="num">${mmss(v)}</b>`); });
    tl.addEventListener('pointerleave',()=>{ hd.classList.remove('on'); bub.classList.remove('on'); });
    tl.addEventListener('pointerdown',e=>{ tl.setPointerCapture(e.pointerId); const an=e.target.closest('.an'), mk=e.target.closest('.mk');
      t=an?+an.dataset.t:mk?Math.max(R[0],FT[mk.dataset.id]-3):at(e); paint();
      const mv=ev=>{ t=at(ev); paint(); }; tl.addEventListener('pointermove',mv); tl.addEventListener('pointerup',()=>tl.removeEventListener('pointermove',mv),{once:true}); });
    tl.onkeydown=e=>{ if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ e.preventDefault(); e.stopPropagation(); t=Math.max(R[0],Math.min(R[1],t+(e.key==='ArrowRight'?5:-5))); paint(); } };
    paint();
    return {seek(v,play){ t=Math.max(R[0],Math.min(R[1],v)); paint(); if(play) set(true); }, play:()=>set(true), pause:()=>set(false), toggle:()=>set(!playing), get t(){ return t; }, get playing(){ return playing; },
      range(a,b){ R[0]=a; R[1]=b; }, el}; }
  /* a quiet arena behind the player controls: floor in perspective, the back wall, a few fences, out of focus (a still of the round) */
  const ARENA=(()=>{ const vx=800, vy=318, lines=[];
    for(let k=-9;k<=9;k++) lines.push(`<line x1="${vx+k*14}" y1="${vy+40}" x2="${vx+k*230}" y2="900"/>`);
    for(let k=0;k<9;k++){ const y=vy+40+Math.pow(k/8,1.9)*540; lines.push(`<line x1="0" y1="${y.toFixed(0)}" x2="1600" y2="${y.toFixed(0)}"/>`); }
    const fence=(x,y,s,w)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="0" y="-120" width="10" height="120" rx="3"/><rect x="${w}" y="-120" width="10" height="120" rx="3"/>${[0,1,2].map(i=>`<rect x="4" y="${-104+i*30}" width="${w}" height="9" rx="4.5" class="r${i%2}"/>`).join('')}</g>`;
    return `<svg class="vpArena" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="vpFl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9B48E" stop-opacity=".05"/><stop offset="1" stop-color="#C9B48E" stop-opacity=".16"/></linearGradient></defs>
      <rect x="0" y="${vy+40}" width="1600" height="${900-vy-40}" fill="url(#vpFl)"/><rect x="0" y="${vy-30}" width="1600" height="70" class="wall"/><g class="ln">${lines.join('')}</g>
      <g class="fn">${fence(300,520,1.1,190)}${fence(1040,470,.8,240)}${fence(640,420,.55,260)}${fence(1260,640,1.5,170)}</g></svg>`; })();
  const PLAY='<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>';
  const PAUSE='<svg viewBox="0 0 24 24"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>';

  /* ======================================================================
     OVERVIEW
     ====================================================================== */
  let VP=null;
  const WIDGETS=NOSC?['m_len','m_lat','m_tmp','m_spd']:['m_len','m_lat','m_tmp','j_score'];
  function wInfo(id){ const m=S.TR_ALL.find(x=>x.id===id), v=ser(id), cur=v[v.length-1], prev=v[v.length-2], dec=decOf(m), f=x=>(+x).toFixed(dec);
    let val=f(cur), unit=m.u==='%'?'%':m.u;
    if(id==='m_lat'||id==='m_lon'){ const a=Math.round(cur); val=id==='m_lat'?`${a} / ${100-a}`:`${100-a} / ${a}`; unit=''; }
    const d=cur-prev, same=Math.abs(d)<m.sd*.3, tone=same||m.better===0?'flat':((d>0)===(m.better>0)?'up':'down');
    const delta=same?'Same as last':`${d>0?'▲ +':'▼ −'}${f(Math.abs(d))} ${PCT(m.u)?'pts':(m.u||'')}`.trim();
    return {m,v,val,unit,tone,delta,name:m.l}; }
  function widget(id){ const I2=wInfo(id), st=stateOf(id), tn=I2.tone==='up'?'good':I2.tone==='down'?'bad':'';
    let vis; if(id==='m_lat'||id==='m_lon'){ const a=Math.round(I2.v[I2.v.length-1]), l=id==='m_lat'?a:100-a;
      vis=`<div class="lrB"><span>${id==='m_lat'?'L':'Back'}</span><div class="b"><i style="width:${l}%"></i><em></em></div><span>${id==='m_lat'?'R':'Fwd'}</span></div>`; }
    else vis=`<div class="spk">${C.spark(I2.v.slice(-8),'blue',100,30)}</div>`;
    return `<button class="sW" data-id="${id}"><span class="h"><span class="ico">${icOf(I2.m)}</span><span class="l">${esc(I2.name)}</span><span class="dot ${st.t}" data-tip="${esc(st.w)}"></span></span>
      <span class="v"><span class="num">${esc(I2.val)}</span><small>${esc(I2.unit)}</small></span><span class="pill ${tn}">${esc(I2.delta)}</span>${vis}</button>`; }
  function verdict(){ if(NOSC) return `<section class="card sVd in"><div class="cardB"><div class="lbl">The round in one look</div>
      <p class="vs">Regular rhythm and good jumps. The landings and the tight turns are where points were lost.</p>
      <div class="vf"><div><span class="lbl">BEST</span><b>Rhythm</b></div><div><span class="lbl">TO WORK ON</span><b>Landings</b></div><div><span class="lbl">FENCES</span><b class="num">${FIDS.length}</b></div></div></div></section>`;
    return `<section class="card sVd in" id="sVd"><div class="cardB"><div class="vt">${C.ring(PERF.v,{size:104,stroke:9,fs:30})}
        <div><div class="lbl">SESSION VERDICT</div><div class="vw">${esc(VWORD(PERF.v))}</div><span class="pill good">▲ ${esc(PERF.d)} session</span></div>
        <button class="wIconB vgo" id="vGo" data-tip="What it is made of" aria-label="What it is made of">${W.ic(I.chevR,16)}</button></div>
      <p class="vs">Regular rhythm and good jumps. The landings and the tight turns are where points were lost.</p>
      <div class="vf"><div><span class="lbl">BEST</span><b>Rhythm</b></div><div><span class="lbl">TO WORK ON</span><b>Landings</b></div><div><span class="lbl">FENCES</span><b class="num">${FIDS.length}</b></div></div></div></section>`; }
  const scoreTxt=/score|Consistency|performance/i;
  function renderOverview(){ const p=$('p-overview');
    const STR=S.STRENGTHS.filter(x=>!NOSC||!scoreTxt.test(x.a)), WK=S.WEAKNESSES.filter(x=>!NOSC||!scoreTxt.test(x.a));
    const row=(x,tone,tail)=>`<div class="sRow">${ric(x.ic,tone)}<div class="t"><b>${esc(x.a)}</b><span>${esc(x.b)}</span></div>${tail||''}</div>`;
    const watch=`<section class="card in" id="sWatch"><div class="cardH"><h2>Things to watch</h2><div class="r"><span class="mut sHint">Click a time to watch it</span></div></div>
          <div class="cardB" style="padding-top:10px"><div class="sSub"><span class="ico bad">${S.SEG_IC.al}</span><b>Alerts</b><em class="num">${S.ALERTS.length}</em></div>
            <div id="sAl">${S.ALERTS.map(x=>row(x,TONE[x.c])).join('')}</div>
            <div class="sSub" style="margin-top:14px"><span class="ico watch">${S.SEG_IC.an}</span><b>Anomalies</b><em class="num">${S.ANOMALIES.length}</em></div>
            <div class="sAn">${S.ANOMALIES.map(x=>row(x,TONE[x.c],`<button class="sGo num" data-t="${x.t}">${mmss(x.t)}${W.ic(PLAY,12)}</button>`)).join('')}</div></div></section>`;
    p.innerHTML=`<div class="sOv">
      <div class="sOvL"><section class="card sVid in"><div id="vp1"></div></section>${watch}</div>
      <div class="sOvR">${verdict()}
        <section class="card in sKm"><div class="cardH"><h2>Key metrics</h2><div class="r"><button class="btn link" data-go="metrics">All metrics</button></div></div>
          <div class="cardB sWg">${WIDGETS.map(widget).join('')}</div></section>
        <section class="card in sFelt" id="feltCard"></section></div></div>
      <section class="card in" id="sIns"><div class="cardH"><h2>Session insights</h2></div>
          <div class="cardB sIns"><div><div class="sSub"><span class="ico good">${S.SEG_IC.st}</span><b>Strengths</b><em class="num">${STR.length}</em></div>${STR.map(x=>row(x,'good')).join('')}</div>
            <div><div class="sSub"><span class="ico watch">${S.SEG_IC.wk}</span><b>Weak points</b><em class="num">${WK.length}</em></div>${WK.map(x=>row(x,TONE[x.t])).join('')}</div></div></section>`;
    VP=player($('vp1'),{});
    p.querySelectorAll('.sGo').forEach(b=>b.onclick=()=>{ VP.seek(+b.dataset.t-2,true); $('vp1').scrollIntoView({behavior:RM()?'auto':'smooth',block:'center'}); });
    p.querySelectorAll('.sW').forEach(b=>b.onclick=()=>openAny(b.dataset.id));
    p.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
    const vg=$('vGo'); if(vg) vg.onclick=()=>openScore(1);
    felt();
    if(window.SD_COUNT) SD_COUNT(p.querySelector('.sWg'));
    if(WATCH) setTimeout(()=>{ const c=$('sWatch'); c.scrollIntoView({behavior:RM()?'auto':'smooth',block:'center'}); const r=c.querySelector('#sAl .sRow'); if(r) r.classList.add('hl'); },500); }
  function felt(){ let x=null; try{ x=JSON.parse(localStorage.getItem('sdLastFeel')); }catch(e){} const mine=!!x;
    if(!x) x={feel:'Good',tags:['Forward','Listening'],gear:['Snaffle bit','Jumping saddle','Boots'],notes:'Rushed a little after the double, much better on the last line.',place:'Indoor',loc:'Geneva, Switzerland',ground:'Sand',quality:'Good'};
    const F=['Tough','Hard','OK','Good','Great'], fi=F.indexOf(x.feel), cond=[x.place,x.ground,x.quality,x.weather].filter(Boolean);
    const chips=(lab,arr)=>arr&&arr.length?`<div class="fr"><div class="lbl">${lab}</div><div class="chips">${arr.map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div></div>`:'';
    $('feltCard').innerHTML=`<div class="cardH"><h2>How it felt</h2><div class="r"><span class="pill">${mine?'Your notes':'Rider notes'}</span></div></div>
      <div class="cardB sFeltB"><div class="fs">${fi>=0?F.map((f,i)=>`<div class="${i===fi?'on':''}"><i style="--f:${(i+1)/5}"></i><span>${f}</span></div>`).join(''):'<span class="mut">No overall feeling given.</span>'}</div>
        <div class="fc">${chips('THE HORSE WAS',x.tags)}${chips('EQUIPMENT',x.gear)}${chips('CONDITIONS',cond)}</div>
        ${x.notes?`<blockquote class="fn">“${esc(T(x.notes))}”</blockquote>`:''}</div>`; }

  /* ======================================================================
     HEATMAP
     ====================================================================== */
  let H3=null, hmOpen=null, hmAll=false;
  const KP=()=>S.KPS.map(k=>({id:k.id,name:k.n,state:k.s==='g'?'normal':k.s==='o'?'watch':'attention'}));
  const LAB={normal:'Normal',watch:'Watch',attention:'Attention'}, HTX={normal:'In the usual band for this horse.',watch:'A little out of the usual band. Nothing urgent, keep an eye on it over the next sessions.',attention:'Clearly out of the usual band. Check it on the video, and with your vet if it lasts.'};
  function renderHeat(){ const p=$('p-heatmap'), P=KP(), n=s=>P.filter(x=>x.state===s).length;
    p.innerHTML=`<div class="sHm">
      <section class="card in sHmS"><div class="cardH"><h2>Horse heatmap</h2><div class="r"><span class="mut sHint">Drag to turn · click a point · double click to reset</span><button class="wIconB" id="hmInfo" data-tip="About the heatmap" aria-label="About the heatmap">${W.ic(I.info,18)}</button></div></div>
        <div class="cardB"><div class="hmStage"><div id="h3dBox"></div>
          <div class="hmCnt">${['attention','watch','normal'].map(s=>`<span class="${TONE[s]}"><span class="ico">${S.LIC[s]}</span><b class="num">${n(s)}</b><span>${LAB[s]}</span></span>`).join('')}</div></div></div></section>
      <div class="sHmR"><section class="card in"><div class="cardH"><h2>Body points</h2><div class="r"><span class="mut">12 points · this session</span></div></div><div class="cardB" id="hmList" style="padding-top:6px"></div></section>
        <section class="card in"><div class="cardH"><h2>Alerts</h2></div><div class="cardB" style="padding-top:8px">${S.ALERTS.map(x=>`<div class="sRow">${ric(x.ic,TONE[x.c])}<div class="t"><b>${esc(x.a)}</b><span>${esc(x.b)}</span></div></div>`).join('')}
          <div class="note" style="margin-top:12px">Built from the video analysis of the session: strides, landings and balance. It is not a medical diagnosis.</div></div></section></div></div>`;
    $('hmInfo').onclick=()=>window.SD_HEAT_INFO&&SD_HEAT_INFO();
    hmList();
    setTimeout(()=>{ if(!window.initHorse3D) return; const box=$('h3dBox'); box.style.opacity='0';
      H3=initHorse3D(box,{keypoints:P,side:'left'});
      H3.onKeypointTap=id=>{ hmOpen=id; hmList(); };
      box.style.transition='opacity .3s ease-out'; requestAnimationFrame(()=>box.style.opacity='1'); },RM()?0:120); }
  function hmList(){ const P=KP(), el=$('hmList'); if(!el) return;
    const row=x=>{ const h=S.hmHistory('session',x.id,x.state), op=hmOpen===x.id;
      return `<div class="hmR${op?' open':''}" data-id="${x.id}"><button class="hd"><span class="dot ${TONE[x.state]}"></span><b>${esc(x.name)}</b><span class="pill ${TONE[x.state]}">${LAB[x.state]}</span><span class="ico cv">${I.chevR}</span></button>
        <div class="bd"><div><p>${HTX[x.state]}</p><div class="hs"><span>Last 5 sessions</span>${h.map(s=>`<i class="${TONE[s]}"></i>`).join('')}</div></div></div></div>`; };
    const look=P.filter(x=>x.state!=='normal').sort((a,b)=>(a.state==='attention'?0:1)-(b.state==='attention'?0:1)), ok=P.filter(x=>x.state==='normal');
    const showOk=hmAll||ok.some(x=>x.id===hmOpen);
    el.innerHTML=`<div class="lbl hmG">NEEDS A LOOK</div>${look.map(row).join('')}`
      +(showOk?`<div class="lbl hmG" style="display:flex;justify-content:space-between;align-items:center">IN THE USUAL BAND<button class="btn link" id="hmLess">Hide</button></div>${ok.map(row).join('')}`
        :`<button class="hmMore" id="hmMore"><span>${ok.length} points in the usual band</span><span class="ico">${I.chev}</span></button>`);
    el.querySelectorAll('.hmR .hd').forEach(b=>b.onclick=()=>{ const id=+b.parentNode.dataset.id; hmOpen=hmOpen===id?null:id; if(H3&&H3.select) H3.select(hmOpen); hmList(); });
    const m=$('hmMore'); if(m) m.onclick=()=>{ hmAll=true; hmList(); };
    const l=$('hmLess'); if(l) l.onclick=()=>{ hmAll=false; if(ok.some(x=>x.id===hmOpen)){ hmOpen=null; H3&&H3.select&&H3.select(null); } hmList(); }; }

  /* ======================================================================
     JUMPS
     ====================================================================== */
  let selJ=FIDS[0], CM=null, VP2=null, jmAll=false, jLast=null;
  const STRIDE=+(S.METRICS.find(m=>m.id==='stride')||{}).v||null;
  function powerWord(v){ const all=Object.values(JDATA).map(x=>x.power).sort((a,b)=>a-b), med=all[Math.floor(all.length/2)];
    return v>=med+5?['Heavy','watch']:v<=med-5?['Light','blue']:['Normal','good']; }
  function legsLR(d){ const gap=Math.max(1,Math.round((100-d.sym)/4)); return [Math.min(99,d.legs+Math.ceil(gap/2)),Math.max(40,d.legs-Math.floor(gap/2))]; }
  function renderJumps(){ const p=$('p-jumps');
    p.innerHTML=`<div class="sJ">
      <div class="sJL"><section class="card in sCm"><div class="cardH"><h2>Course map</h2><div class="r"><span class="mut">Ridden line · ${FIDS.length} efforts</span></div></div><div class="cardB" id="cmSlot"></div></section></div>
      <div class="sJR">
        <section class="card in sJc" id="sJc"><div class="jNav"><button class="wIconB" id="jPrev" aria-label="Previous jump" data-tip="Previous jump (←)">${W.ic(CHEVL,18)}</button>
            <div class="jMid" id="jMid"></div><button class="wIconB" id="jNext" aria-label="Next jump" data-tip="Next jump (→)">${W.ic(I.chevR,18)}</button></div>
          <svg id="jProf" viewBox="0 0 330 178" class="jProf"></svg><div class="jSt" id="jSt"></div></section>
        <section class="card in sJv"><div class="cardH"><h2>This jump on the video</h2><div class="r"><button class="btn sm" id="jFull">${W.ic(PLAY,13)}<span>Full video</span></button></div></div><div class="cardB" style="padding-top:12px"><div id="vp2"></div></div></section>
      </div></div>
        <section class="card in sJm"><div class="cardH"><h2>Jump metrics</h2><div class="r"><div class="seg" id="jmSeg"><button data-a="0" class="on">This jump</button><button data-a="1">All ${FIDS.length} jumps</button></div></div></div><div class="cardB" id="jm" style="padding-top:8px"></div></section>`;
    CM=renderCourseMap($('cmSlot'),TD,JDATA,{selected:selJ,autoplay:false,stride:STRIDE,onSelect:id=>{ if(id!==selJ) selectJ(id); }});
    setTimeout(()=>CM&&CM.intro&&CM.intro(),80);
    const f0=FT[selJ]; VP2=player($('vp2'),{compact:true,range:[Math.max(0,f0-4),Math.min(DUR,f0+4)],loop:true,start:Math.max(0,f0-4)});
    $('jPrev').onclick=()=>stepJ(-1); $('jNext').onclick=()=>stepJ(1);
    $('jFull').onclick=()=>{ go('overview'); setTimeout(()=>VP&&VP.seek(FT[selJ]-3,true),RM()?0:260); };
    $('jmSeg').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; jmAll=b.dataset.a==='1'; $('jmSeg').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); renderJM(); };
    selectJ(selJ,true); }
  const CHEVL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 6 8.5 12l6 6"/></svg>';
  function stepJ(d){ const i=FIDS.indexOf(selJ), n=Math.max(0,Math.min(FIDS.length-1,i+d)); if(n!==i) selectJ(FIDS[n]); }
  function selectJ(id,first){ const dir=jLast?Math.sign(FIDS.indexOf(id)-FIDS.indexOf(jLast)):0; selJ=id; if(CM) CM.select(id);
    const i=FIDS.indexOf(id), d=JDATA[id];
    $('jPrev').disabled=i<=0; $('jNext').disabled=i>=FIDS.length-1;
    $('jMid').innerHTML=`${NOSC?`<span class="jNo" translate="no">${esc(id)}</span>`:C.ring(d.score,{size:58,stroke:5,tone:d.score>=60?'good':d.score>=30?'watch':'bad'})}
      <div><div class="jT"><span>Jump</span> <span translate="no">${esc(id)}</span><span class="pill num">${i+1} / ${FIDS.length}</span></div><div class="jS">${esc(d.type)}</div></div>`;
    profile(); renderJM();
    if(VP2){ const f=FT[id]; VP2.range(Math.max(0,f-4),Math.min(DUR,f+4)); VP2.seek(Math.max(0,f-4),!first&&VP2.playing); }
    if(!first&&dir&&!RM()) ['jMid','jProf','jSt'].forEach(k=>{ const e=$(k); e&&e.animate&&e.animate([{opacity:0,transform:`translateX(${dir*14}px)`},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.23,1,.32,1)'}); });
    jLast=id; if(curTab==='jumps') history.replaceState(null,'','#jumps:'+id); }
  function profile(){ const d=JDATA[selJ], G=122, SC=33, sp=d.spread||0, tot=d.toff+sp+d.land;
    const x0=165-tot*SC/2, fx1=x0+d.toff*SC, fx2=fx1+sp*SC, x1=x0+tot*SC, fm=(fx1+fx2)/2, fh=parseFloat((d.type.match(/([\d.]+) m/)||[0,1.6])[1]);
    const topY=G-fh*SC, apexY=G-d.apex*SC, ctrlY=2*apexY-G, clear=d.apex-fh;
    const q=t=>{ const u=1-t; return [u*u*x0+2*u*t*fm+t*t*x1,u*u*G+2*u*t*ctrlY+t*t*G]; };
    const arc='M'+Array.from({length:41},(_,i)=>q(i/40)).map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L');
    const el=x=>`<rect x="${x-2.4}" y="${topY-3}" width="4.8" height="${G-topY+3}" rx="2" class="fp"/>`+[1,.55].map(k=>`<circle cx="${x}" cy="${G-fh*SC*k}" r="4.3" class="fr2"/>`).join('');
    const dim=(xa,xb,y,l)=>`<g class="dm"><line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}"/><line x1="${xa}" y1="${y-3.5}" x2="${xa}" y2="${y+3.5}"/><line x1="${xb}" y1="${y-3.5}" x2="${xb}" y2="${y+3.5}"/>
      <rect x="${(xa+xb)/2-19}" y="${y-7}" width="38" height="14" rx="7"/><text x="${(xa+xb)/2}" y="${y+3.4}" text-anchor="middle">${l}</text></g>`;
    $('jProf').innerHTML=`<defs><linearGradient id="jpF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B82F6" stop-opacity=".22"/><stop offset="1" stop-color="#3B82F6" stop-opacity="0"/></linearGradient></defs>
      <line x1="10" y1="${G}" x2="320" y2="${G}" class="gl2"/><path d="${arc} L${x1} ${G} L${x0} ${G}Z" fill="url(#jpF)"/>${sp?el(fx1)+el(fx2):el(fm)}
      <path d="${arc}" fill="none" stroke="#3B82F6" stroke-width="2.8" stroke-linecap="round" class="arc"/>
      <line x1="${fm}" y1="${apexY+4}" x2="${fm}" y2="${topY-8}" class="gd2"/><circle cx="${fm}" cy="${apexY}" r="4.2" class="ap"/>
      <g><rect x="${fm-36}" y="${apexY-27}" width="72" height="17" rx="8.5" class="apB"/><text x="${fm}" y="${apexY-15.3}" text-anchor="middle" class="apT">APEX ${d.apex.toFixed(2)} m</text></g>
      <circle cx="${x0}" cy="${G}" r="5" class="ft"/><circle cx="${x1}" cy="${G}" r="5" class="ft"/>
      <text x="${x0}" y="${G+19}" text-anchor="middle" class="cap2">TAKEOFF</text><text x="${x1}" y="${G+19}" text-anchor="middle" class="cap2">LANDING</text>
      ${dim(x0,fx1,G+34,d.toff.toFixed(2)+' m')}${dim(fx2,x1,G+34,d.land.toFixed(2)+' m')}${dim(x0,x1,G+51,tot.toFixed(2)+' m')}`;
    if(!RM()){ const a=$('jProf').querySelector('.arc'), L=a.getTotalLength?a.getTotalLength():300; a.style.strokeDasharray=L; a.style.strokeDashoffset=L; a.getBoundingClientRect(); a.style.transition='stroke-dashoffset .5s cubic-bezier(.23,1,.32,1)'; a.style.strokeDashoffset=0; }
    $('jSt').innerHTML=`<div><span class="lbl"><i style="background:var(--mut)"></i>Takeoff</span><b><span class="num">${d.toff.toFixed(2)}</span><small>m</small></b><small>from the fence at takeoff</small></div>
      <div><span class="lbl"><i style="background:var(--blue)"></i>Apex</span><b><span class="num">${d.apex.toFixed(2)}</span><small>m</small></b><small>+${clear.toFixed(2)} m over the top rail</small></div>
      <div><span class="lbl"><i style="background:var(--mut)"></i>Landing</span><b><span class="num">${d.land.toFixed(2)}</span><small>m</small></b><small>from the fence at landing</small></div>`;
    if(window.SD_COUNT) SD_COUNT($('jSt'),420); }
  const JTR={toff:'j_toff',angle:'j_angle',power:'j_power',leadT:'j_leadT',apex:'j_apex',clear:'j_clear',peak:'j_peak',air:'j_air',legs:'j_legs',sym:'j_sym',change:'j_change',land:'j_land',impact:'j_impact',leadL:'j_leadL'};
  const jrow=(k,val,rg)=>`<div class="jr"><span class="sRic blue sm">${mic(S.JICON[k])}</span><span class="l">${esc(S.JINFO[k][0])}<button class="inf" data-j="${k}" aria-label="What it is">${I.info}</button></span><span class="v"><span class="vv">${val}</span>${rg?`<small class="rg">${rg}</small>`:''}</span></div>`;
  function renderJM(){ const el=$('jm'); if(!el) return; const m2=v=>`<span class="num">${v.toFixed(2)}</span><small>m</small>`;
    if(!jmAll){ const d=JDATA[selJ], pw=powerWord(d.power), lr=legsLR(d);
      el.innerHTML=`<div class="jG"><div><div class="lbl jH">Takeoff</div>${jrow('toff',m2(d.toff))+jrow('angle',`<span class="num">${d.angle}</span><small>°</small>`)+jrow('power',`<span class="pill ${pw[1]}">${pw[0]}</span>`)+jrow('leadT',esc(d.leadT))}
        </div>
        <div><div class="lbl jH">In the air</div>${jrow('apex',m2(d.apex))+jrow('clear',m2(d.clear))+jrow('peak',esc(d.peak))+jrow('air',`<span class="num">${d.air.toFixed(2)}</span><small>s</small>`)
          +jrow('legs',`<span class="jlr"><span>L <b class="num">${lr[0]}%</b></span><span>R <b class="num">${lr[1]}%</b></span></span>`)+jrow('sym',`<span class="num">${d.sym}</span><small>%</small>`)+jrow('change',esc(d.change))}</div>
        <div><div class="lbl jH">Landing</div>${jrow('land',m2(d.land))+jrow('impact',esc(d.impact))+jrow('leadL',esc(d.leadL))}</div></div>`; }
    else { const J=FIDS.map(id=>({id,...JDATA[id]})), n=J.length, avg=k=>J.reduce((a,x)=>a+x[k],0)/n;
      const ext=k=>[J.reduce((a,x)=>x[k]<a[k]?x:a),J.reduce((a,x)=>x[k]>a[k]?x:a)], f2=v=>v.toFixed(2)+' m', f0=u=>v=>Math.round(v)+u;
      const range=(k,f)=>{ const [lo,hi]=ext(k); return `${f(lo[k])} (${lo.id}) to ${f(hi[k])} (${hi.id})`; };
      const cnt=(k,v)=>J.filter(x=>x[k]===v).length, usual=k=>{ const c={}; J.forEach(x=>c[x[k]]=(c[x[k]]||0)+1); return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]; };
      const pw={}; J.forEach(x=>{ const w=powerWord(x.power)[0]; pw[w]=(pw[w]||0)+1; }); const pT=Object.entries(pw).sort((a,b)=>b[1]-a[1]);
      const nL=cnt('leadT','Left'), nLL=cnt('leadL','Left'), nCh=cnt('change','Yes'), sc=avg('score'), best=J.reduce((a,x)=>x.score>a.score?x:a), worst=J.reduce((a,x)=>x.score<a.score?x:a);
      const bars=NOSC?'':`<div class="jaH">${C.ring(Math.round(sc),{size:58,stroke:5})}<div class="t">Average jump score over <b>${n} jumps</b><br>Best <b>fence ${best.id}</b> (${best.score}%), weakest <b>fence ${worst.id}</b> (${worst.score}%)</div></div>
        <div class="jaB">${J.map(x=>`<button class="${x.id===selJ?'on':''} ${x.id===best.id?'best':''}" data-id="${x.id}" data-tip="${x.id} · ${x.score}%"><i style="height:${Math.max(6,(x.score-40)/60*100)}%"></i><em translate="no">${x.id}</em></button>`).join('')}<span class="avg" style="bottom:${(sc-40)/60*100}%"></span></div>`;
      const pu=usual('peak'), iu=usual('impact');
      el.innerHTML=bars+`<div class="jG"><div><div class="lbl jH">Takeoff</div>${jrow('toff',m2(avg('toff')),range('toff',f2))+jrow('angle',`<span class="num">${Math.round(avg('angle'))}</span><small>°</small>`,range('angle',f0('°')))
          +jrow('power',esc(pT[0][0]),pT.map(([w,c])=>c+' '+w.toLowerCase()).join(' · '))+jrow('leadT',nL>=n-nL?'Left':'Right',`Left ${nL} · Right ${n-nL}`)}
</div>
        <div><div class="lbl jH">In the air</div>${jrow('apex',m2(avg('apex')),range('apex',f2))+jrow('clear',m2(avg('clear')),range('clear',f2))+jrow('peak',esc(pu[0]),`${pu[1]} of ${n} jumps`)
          +jrow('air',`<span class="num">${avg('air').toFixed(2)}</span><small>s</small>`,range('air',v=>v.toFixed(2)+' s'))+jrow('legs',`<span class="num">${Math.round(avg('legs'))}</span><small>%</small>`,range('legs',f0('%')))
          +jrow('sym',`<span class="num">${Math.round(avg('sym'))}</span><small>%</small>`,range('sym',f0('%')))+jrow('change',`${nCh} of ${n}`,'jumps with a change in the air')}</div>
        <div><div class="lbl jH">Landing</div>${jrow('land',m2(avg('land')),range('land',f2))+jrow('impact',esc(iu[0]),`${iu[1]} of ${n} jumps`)+jrow('leadL',nLL>=n-nLL?'Left':'Right',`Left ${nLL} · Right ${n-nLL}`)}</div></div>`;
      el.querySelectorAll('.jaB button').forEach(b=>b.onclick=()=>selectJ(b.dataset.id)); }
    el.querySelectorAll('.inf').forEach(b=>b.onclick=e=>{ e.stopPropagation(); infoPop(b,JTR[b.dataset.j]); }); }

  /* the (i) of a metric: what it is, its value, how it is judged */
  function descOf(id){ const jk=Object.keys(JTR).find(k=>JTR[k]===id); if(jk) return [S.JINFO[jk][1],'Based on the tracked trajectory of each jump.'];
    for(const g of S.MGROUPS){ const x=g.items.find(y=>y.id===id); if(x) return [x.d,g.stride?'Measured stride by stride over the round.':'Measured over the whole round.']; }
    const sc={s_head:0,s_perf:1,s_cons:2}[id]; if(sc!=null) return [S.SCORES[sc].what,S.SCORES[sc].d];
    if(id==='j_score') return ['Quality of the jumping efforts, from takeoff to landing.','Based on the detected jump strides of the session.'];
    return ['',''];}
  function infoPop(anchor,id){ const m=S.TR_ALL.find(x=>x.id===id); if(!m) return; const [a,b]=descOf(id), st=stateOf(id), dec=decOf(m), f=x=>(+x).toFixed(dec);
    const why=st.why==='level'?'Judged on its level: 70% and more is good, under 55% needs work.':st.why==='trend'?"Compared with this horse's last 12 sessions.":"Neither good nor bad in itself: compared with this horse's usual band.";
    W.pop(anchor,`<div class="sInfo"><div class="h"><span class="ico">${icOf(m)}</span><b>${esc(m.l)}</b><span class="pill ${st.t}">${esc(st.w)}</span></div>
      <div class="lbl">What it is</div><p>${esc(a)}</p>${b?`<div class="lbl">How it is measured</div><p class="mut">${esc(b)}</p>`:''}<div class="lbl">How it is judged</div><p class="mut">${esc(why)}</p></div>`,{w:340,role:'dialog',align:'left'}); }

  /* ======================================================================
     METRICS: the 36, grouped like the phone
     ====================================================================== */
  function jAvgVal(k){ const J=FIDS.map(id=>JDATA[id]), n=J.length;
    if(['leadT','leadL'].includes(k)){ const l=J.filter(x=>x[k]==='Left').length; return [l>=n-l?'Left':'Right',`${Math.max(l,n-l)} of ${n}`]; }
    if(k==='change'){ const c=J.filter(x=>x.change==='Yes').length; return [`${c} of ${n}`,'jumps']; }
    if(k==='power'||k==='peak'||k==='impact'){ const c={}; J.forEach(x=>{ const w=k==='power'?powerWord(x.power)[0]:x[k]; c[w]=(c[w]||0)+1; }); const t=Object.entries(c).sort((a,b)=>b[1]-a[1])[0]; return [t[0],`${t[1]} of ${n}`]; }
    const a=J.reduce((s,x)=>s+x[k],0)/n; return [['legs','sym','score','angle'].includes(k)?String(Math.round(a)):a.toFixed(2),{legs:'%',sym:'%',score:'%',angle:'°',air:'s'}[k]||'m']; }
  function mCard(id,o){ const m=S.TR_ALL.find(x=>x.id===id), st=stateOf(id);
    const v=ser(id).slice(-10), lo=Math.min(...v), hi=Math.max(...v), r=hi-lo||1;
    const bars=`<span class="mb">${v.map((x,k)=>`<i class="${k===v.length-1?'on':''}" style="height:${(18+(x-lo)/r*82).toFixed(0)}%"></i>`).join('')}</span>`;
    return `<button class="mC" data-id="${id}"><span class="h"><span class="ico">${icOf(m)}</span><span class="l">${esc(o.l||m.l)}</span><span class="inf" data-i="${id}" role="button" aria-label="What it is">${I.info}</span></span>
      <span class="v">${o.v}</span><span class="f"><span class="pill ${st.t}"><i class="dot ${st.t}"></i>${esc(st.w)}</span>${bars}</span></button>`; }
  function renderMetrics(){ const p=$('p-metrics');
    const fmtM=m=>m.lr?`<span class="jlr big"><span>${(m.lab||['L','R'])[0][0]} <b class="num">${m.lr[0]}%</b></span><span>${(m.lab||['L','R'])[1][0]} <b class="num">${m.lr[1]}%</b></span></span>`:`<span class="num">${esc(m.v)}</span><small>${esc(m.u)}</small>`;
    const grp=(t,sub,cards)=>`<section class="mGrp in"><div class="mGh"><h2>${t}</h2>${sub?`<span class="mut">${sub}</span>`:''}<em class="num">${cards.length}</em></div><div class="mGrid">${cards.join('')}</div></section>`;
    let html='';
    if(!NOSC){ html+=`<section class="mGrp in"><div class="mGh"><h2>Session scores</h2><span class="mut">Click one to see what it is made of</span><em class="num">3</em></div><div class="mScG">${S.SCORES.map((s,i)=>{ const id=['s_head','s_perf','s_cons'][i], st=stateOf(id);
        return `<button class="mSc" data-s="${i}">${C.ring(s.v,{size:84,stroke:7})}<div class="t"><div class="h"><b>${s.l}</b><span class="inf" data-i="${id}" role="button" aria-label="What it is">${I.info}</span></div><p>${esc(s.what)}</p>
          <div class="pt">${s.parts.map(([l,v])=>`<div><span>${esc(l)}</span><i><b style="width:${v}%"></b></i><em class="num">${v}%</em></div>`).join('')}</div></div></button>`; }).join('')}</div></section>`; }
    const JK=['toff','angle','power','leadT','apex','clear','peak','air','legs','sym','change','land','impact','leadL'];
    const jc=(NOSC?[]:[mCard('j_score',{v:`<span class="num">${jAvgVal('score')[0]}</span><small>%</small>`,l:'Jump score'})])
      .concat(JK.map(k=>{ const [a,b]=jAvgVal(k), num=/^[\d.]+$/.test(a); return mCard(JTR[k],{v:num?`<span class="num">${a}</span><small>${b}</small>`:`${esc(a)}<small>${esc(b)}</small>`}); }));
    html+=grp('Jumps',`Over the ${FIDS.length} jumps of the round`,jc);
    S.MGROUPS.forEach(g=>{ html+=grp(g.t,'',g.items.map(m=>mCard(m.id,{v:fmtM(m),l:m.l}))); });
    p.innerHTML=`<div class="sMet">${html}</div>`;
    p.querySelectorAll('.mC').forEach(b=>b.onclick=e=>{ if(e.target.closest('.inf')) return; openAny(b.dataset.id); });
    p.querySelectorAll('.mSc').forEach(b=>b.onclick=e=>{ if(e.target.closest('.inf')) return; openScore(+b.dataset.s); });
    p.querySelectorAll('.inf').forEach(b=>b.onclick=e=>{ e.stopPropagation(); infoPop(b,b.dataset.i); });
    if(window.SD_COUNT) SD_COUNT(p); }

  /* a metric in depth (the phone's metric page), in a dialog */
  function openAny(id){ if(id.startsWith('s_')) return openScore({s_head:0,s_perf:1,s_cons:2}[id]);
    if(id.startsWith('j_')){ if(id==='j_score'){ jmAll=true; } go('jumps'); setTimeout(()=>{ if(jmAll&&$('jmSeg')) $('jmSeg').querySelectorAll('button')[1].click(); },60); return; }
    openMetric(id); }
  const MD=`<div class="mdTop"><span class="sRic blue lg" id="mdI"></span><div><div class="mdV" id="mdV"></div><div class="mut" id="mdS"></div></div></div>
    <div class="chips" id="mdC" style="margin-top:16px"></div><svg id="mdCh" viewBox="0 0 330 150" class="mdCh"></svg><div class="mdSt" id="mdSt"></div><div id="mdE"></div>
    <div class="lbl" style="margin-top:18px">What it tells you</div><p class="mdT" id="mdT"></p>`;
  function openScore(i){ if(NOSC) return; const s=S.SCORES[i], word=v=>v>=80?'Very good':(v>=65?'Good':(v>=50?'To work on':'Weak'));
    W.modal({title:T(s.l),sub:esc(T(s.what)),body:MD,foot:`<button class="btn" id="mdTr">${W.ic(W.I.arrowR,16)}<span>See it over time</span></button>`,wire:m=>{
      m.querySelector('#mdI').innerHTML=C.ring(s.v,{size:52,stroke:5}); m.querySelector('#mdI').className='';
      m.querySelector('#mdV').innerHTML=`<span class="num">${s.v}</span><small>%</small> <span class="w">${word(s.v)}</span>`; m.querySelector('#mdS').textContent=T('What it is made of');
      m.querySelector('#mdC').style.display='none'; const ch=m.querySelector('#mdCh'); ch.style.display='none';
      m.querySelector('#mdSt').innerHTML=`<div class="pt big">${s.parts.map(([l,v])=>`<div><span>${esc(l)}</span><i><b style="width:${v}%"></b></i><em><span>${word(v)}</span> · <span class="num">${v}%</span></em></div>`).join('')}</div>`;
      m.querySelector('#mdE').innerHTML=`<div class="lbl" style="margin-top:18px">WHERE TO LOOK</div>`+s.look.map(([a,b])=>`<div class="sRow">${ric('jump','blue')}<div class="t"><b>${esc(a)}</b><span>${esc(b)}</span></div></div>`).join('');
      m.querySelector('#mdT').textContent=T(s.d);
      m.querySelector('#mdTr').onclick=()=>{ W.closeModal(); trCur=['s_head','s_perf','s_cons'][i]; trSel=null; go('trends'); };
      if(!RM()) m.querySelectorAll('.pt b').forEach((b,k)=>b.animate&&b.animate([{width:'0%'},{width:b.style.width}],{duration:600,delay:60*k,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'})); }}); }
  function openMetric(id){ const g=S.MGROUPS.find(g=>g.items.some(x=>x.id===id)); if(!g) return; const m={...g.items.find(x=>x.id===id),stride:!!g.stride};
    W.modal({title:T(m.l),body:MD,foot:`<button class="btn" id="mdTr">${W.ic(W.I.arrowR,16)}<span>See it over time</span></button>`,wire:md=>{
      const q=s=>md.querySelector(s); q('#mdI').innerHTML=mic(m.ic); q('#mdT').textContent=T(m.d);
      q('#mdTr').onclick=()=>{ W.closeModal(); trCur=id; trSel=null; go('trends'); };
      q('#mdV').innerHTML=m.lr?`<span class="blue">${(m.lab||['L','R'])[0][0]} <span class="num">${m.lr[0]}</span>%</span> <span class="vs">vs</span> <span>${(m.lab||['L','R'])[1][0]} <span class="num">${m.lr[1]}</span>%</span>`:`<span class="num">${esc(m.v)}</span><small>${esc(m.u)}</small>`;
      q('#mdS').textContent=T(m.onePhase?m.onePhase+', 15 landings':'This session, all strides');
      if(m.turns||m.drift||m.leadOf||m.events){ q('#mdC').style.display='none'; (m.turns?mdTurns:m.drift?mdDrift:m.leadOf?mdLeads:mdEvents)(md,m); return; }
      const all=S.series(m); let cur='All strides';
      const draw=()=>{ const ch=q('#mdC'); ch.style.display=m.onePhase?'none':''; ch.innerHTML=S.PHASES.map(p=>`<button class="chip${p===cur?' on':''}" data-p="${p}">${p}</button>`).join('');
        ch.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{ cur=c.dataset.p; draw(); });
        const pts=cur==='All strides'?all:all.filter(x=>x.p===cur), vals=all.map(x=>x.v), lo=Math.min(...vals), hi=Math.max(...vals), pad=(hi-lo)*.15||1;
        const Y=v=>128-(v-(lo-pad))/((hi+pad)-(lo-pad))*112, bw=286/all.length, avg=pts.reduce((a,x)=>a+x.v,0)/pts.length, f=v=>v.toFixed(m.base<10?2:0);
        q('#mdCh').innerHTML=all.map((x,i)=>{ const on=cur==='All strides'||x.p===cur; return `<rect x="${26+i*bw+1}" y="${Y(x.v).toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${(128-Y(x.v)).toFixed(1)}" rx="1.5" class="${!on?'off':(m.lr&&x.side==='R'?'alt':'on')}"/>`; }).join('')
          +`<line x1="26" x2="312" y1="${Y(avg).toFixed(1)}" y2="${Y(avg).toFixed(1)}" class="avl"/><text x="312" y="${(Y(avg)-5).toFixed(1)}" text-anchor="end" class="avt">avg ${f(avg)} ${m.u}</text>
            <line x1="26" x2="312" y1="128" y2="128" class="ax"/><text x="26" y="143" class="axt">Start</text><text x="312" y="143" text-anchor="end" class="axt">Finish</text>`;
        const cell=(k,v,dot)=>`<div><span class="lbl">${dot?`<i style="background:${dot}"></i>`:''}${k}</span><b><span class="num">${v}</span><small>${m.u}</small></b></div>`;
        const sAv=k=>{ const a=pts.filter(x=>x.side===k); return a.length?f(a.reduce((s,x)=>s+x.v,0)/a.length):'n/a'; };
        q('#mdSt').innerHTML=m.lr?cell((m.lab||['Left','Right'])[0],sAv('L'),'var(--blue)')+cell((m.lab||['Left','Right'])[1],sAv('R'),'var(--mut)')
          :cell('Average',f(avg))+cell('Lowest',f(Math.min(...pts.map(x=>x.v))))+cell('Highest',f(Math.max(...pts.map(x=>x.v))))+(m.stride?cell('Average left',sAv('L'),'var(--blue)')+cell('Average right',sAv('R'),'var(--mut)'):''); };
      draw(); }}); }
  function mdTurns(md,m){ const q=s=>md.querySelector(s), F=TD.fences, FTm=Object.fromEntries(S.TEMPO_RUN.fences.map(([t,id])=>[id,t])), P=S.TEMPO_RUN.pts, avgAll=P.reduce((a,p)=>a+p[1],0)/P.length, turns=[];
    for(let i=1;i<F.length;i++){ const a=F[i-1], b=F[i], ang=((b.ang-a.ang+540)%360)-180; if(b.dPrev<15||Math.abs(ang)<40) continue;
      const pts=P.filter(p=>p[0]>=FTm[a.id]&&p[0]<FTm[b.id]).map(p=>p[1]), tempo=pts.length?pts.reduce((x,y)=>x+y,0)/pts.length:avgAll, score=Math.abs(ang)/b.dPrev*(tempo/400);
      turns.push({from:a.id,to:b.id,ang:Math.abs(ang),left:ang>0,room:b.dPrev,tempo,score,level:score>=3?'Hard':(score>=2?'Medium':'Easy')}); }
    const cnt=l=>turns.filter(t=>t.level===l).length, mean=turns.reduce((a,t)=>a+t.score,0)/turns.length, overall=mean>=3?'Hard':(mean>=2?'Medium':'Easy'), nH=cnt('Hard');
    const TN={Easy:'good',Medium:'watch',Hard:'bad'};
    q('#mdV').innerHTML=`${overall}<small>${nH} hard turn${nH>1?'s':''} out of ${turns.length}</small>`;
    q('#mdS').textContent=T('Each turn of the round, from easiest to hardest');
    const X0=52,X1=322,Y1=128,Y0=10,top=4.2,Y=v=>Y1-Math.min(v,top)/top*(Y1-Y0),bw=(X1-X0)/turns.length;
    const zone=(a,b,l)=>`<rect x="${X0}" y="${Y(b)}" width="${X1-X0}" height="${Y(a)-Y(b)}" class="z ${TN[l]}"/><text x="${X0-8}" y="${(Y(a)+Y(b))/2+3}" text-anchor="end" class="zt ${TN[l]}">${l}</text>`;
    q('#mdCh').setAttribute('viewBox','0 0 330 160');
    q('#mdCh').innerHTML=zone(0,2,'Easy')+zone(2,3,'Medium')+zone(3,top,'Hard')+turns.map((t,k)=>{ const x=X0+k*bw+bw*.22,w=bw*.56,y=Y(t.score);
      return `<rect x="${x}" y="${y}" width="${w}" height="${Y1-y}" rx="3" class="tb ${TN[t.level]}"/><text x="${x+w/2}" y="${Y1+13}" text-anchor="middle" class="axt" translate="no">${t.from}→${t.to}</text>`; }).join('')
      +`<line x1="${X0}" x2="${X1}" y1="${Y1}" y2="${Y1}" class="ax"/><text x="${(X0+X1)/2}" y="${Y1+28}" text-anchor="middle" class="axt">Turns in the order they were ridden</text>`;
    q('#mdSt').innerHTML=[['Easy',cnt('Easy')],['Medium',cnt('Medium')],['Hard',cnt('Hard')]].map(([k,v])=>`<div><span class="lbl"><i class="dot ${TN[k]}"></i>${k}</span><b><span class="num">${v}</span><small>${v>1?'turns':'turn'}</small></b></div>`).join('');
    const shape=a=>a>=130?'U-turn':(a>=75?'Sharp turn':'Gentle turn');
    q('#mdE').innerHTML=`<div class="lbl" style="margin-top:16px">WHAT MAKES A TURN HARD</div><div class="why3"><div><b>How sharp it is</b><span>A U-turn asks more than a gentle bend.</span></div><div><b>How much room there is</b><span>Less distance to the next fence means less time to set up.</span></div><div><b>How fast it is ridden</b><span>The same turn is harder at a quicker pace.</span></div></div>`
      +`<div class="mdL">${[...turns].sort((a,b)=>b.score-a.score).map(t=>`<div class="sRow"><span class="sRic ${TN[t.level]}"${t.left?' style="transform:scaleX(-1)"':''}>${mic('turn')}</span><div class="t"><b><span>Fence</span> <span translate="no">${t.from} → ${t.to}</span></b><span>${shape(t.ang)} to the ${t.left?'left':'right'}</span></div><span class="pill ${TN[t.level]}">${t.level}</span></div>`).join('')}</div>`; }
  function mdDrift(md,m){ const q=s=>md.querySelector(s), P=S.TEMPO_RUN.pts, FN=S.TEMPO_RUN.fences, n=P.length, mt=P.reduce((a,p)=>a+p[0],0)/n, mv=P.reduce((a,p)=>a+p[1],0)/n;
    const b=P.reduce((a,p)=>a+(p[0]-mt)*(p[1]-mv),0)/P.reduce((a,p)=>a+(p[0]-mt)**2,0), fit=t=>mv+b*(t-mt), T0=P[0][0], T1=P[n-1][0], v0=fit(T0), v1=fit(T1), dv=v1-v0, pct=dv/v0*100;
    const word=Math.abs(dv)<10?'Holding':(dv>0?'Building':'Fading');
    q('#mdV').innerHTML=`<span class="num">${pct>=0?'+':'−'}${Math.abs(pct).toFixed(1)}</span><small>%</small> <span class="w">${word}</span>`; q('#mdS').textContent=T('Tempo through the round, stride by stride');
    const X0=30,X1=318,Y0=14,Y1=138,tMax=Math.max(T1,FN[FN.length-1][0])+1,lo=200,hi=600,X=t=>X0+t/tMax*(X1-X0),Y=v=>Y1-(Math.min(hi,Math.max(lo,v))-lo)/(hi-lo)*(Y1-Y0);
    const sm=[]; for(let t=T0;t<=T1;t+=.35){ let w=0,a=0; for(const p of P){ const k=Math.exp(-((p[0]-t)**2)/(2*1.7*1.7)); w+=k; a+=k*p[1]; } sm.push([t,a/w]); }
    let curves='', seg=[sm[0]], up=sm[1][1]>=sm[0][1]; const flush=()=>{ if(seg.length>1) curves+=`<path d="M${seg.map(q2=>X(q2[0]).toFixed(1)+' '+Y(q2[1]).toFixed(1)).join(' L')}" class="dc ${up?'up':'dn'}"/>`; };
    for(let i=1;i<sm.length;i++){ const u=sm[i][1]>=sm[i-1][1]; if(u!==up){ flush(); seg=[sm[i-1]]; up=u; } seg.push(sm[i]); } flush();
    let grid=''; for(const v of [300,400,500]) grid+=`<line x1="${X0}" x2="${X1}" y1="${Y(v)}" y2="${Y(v)}" class="gr"/><text x="${X0-5}" y="${Y(v)+3}" text-anchor="end" class="axt">${v}</text>`;
    let ticks='', lastX=-99; for(const [t,id] of FN){ const x=X(t); ticks+=`<line x1="${x}" x2="${x}" y1="${Y1}" y2="${Y1+4}" class="ax"/>`; if(x-lastX>11){ ticks+=`<text x="${x}" y="${Y1+13}" text-anchor="middle" class="axt" translate="no">${id}</text>`; lastX=x; } }
    const ch=q('#mdCh'); ch.setAttribute('viewBox','0 0 330 176');
    ch.innerHTML=grid+P.map(p=>`<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="1.5" class="pt"/>`).join('')+curves
      +`<line x1="${X(T0)}" y1="${Y(v0)}" x2="${X(T1)}" y2="${Y(v1)}" class="fit"/><text x="${X(T1)}" y="${Y(v1)-7}" text-anchor="end" class="avt">trend ${dv>=0?'+':'−'}${Math.abs(dv).toFixed(0)} m/min</text><line x1="${X0}" x2="${X1}" y1="${Y1}" y2="${Y1}" class="ax"/>`+ticks
      +`<text x="${X0}" y="${Y1+27}" class="axt">Fence 1</text><text x="${X1}" y="${Y1+27}" text-anchor="end" class="axt">Finish · m/min</text>`;
    if(window.SD_WIPE) SD_WIPE(ch);
    q('#mdSt').innerHTML=[['Start of round',v0.toFixed(0)],['End of round',v1.toFixed(0)],['Change',(dv>=0?'+':'−')+Math.abs(dv).toFixed(0)]].map(([k,v])=>`<div><span class="lbl">${k}</span><b><span class="num">${v}</span><small>m/min</small></b></div>`).join('');
    const rows=[]; let i=0; while(i<FN.length-1){ let j=i+1, pts=P.filter(p=>p[0]>=FN[i][0]&&p[0]<FN[j][0]); while(pts.length<2&&j<FN.length-1){ j++; pts=P.filter(p=>p[0]>=FN[i][0]&&p[0]<FN[j][0]); }
      if(pts.length) rows.push({from:FN[i][1],to:FN[j][1],v:pts.reduce((a,p)=>a+p[1],0)/pts.length}); i=j; }
    q('#mdE').innerHTML=`<div class="dLeg"><span><i class="up"></i>Speeding up</span><span><i class="dn"></i>Slowing down</span></div><div class="mdL two">${rows.map((r,k)=>{ const d=k?r.v-rows[k-1].v:0, dir=!k?'first':(d>15?'up':(d<-15?'down':'flat'));
      return `<div class="sRow"><span class="sRic ${dir==='up'?'blue':''}">${svgI(dir==='up'?'<path d="M12 19V5M6 11l6-6 6 6"/>':dir==='down'?'<path d="M12 5v14M6 13l6 6 6-6"/>':'<path d="M5 12h14"/>')}</span><div class="t"><b><span>Fence</span> <span translate="no">${r.from} → ${r.to}</span></b><span>${{first:'First line',up:'Speeding up',down:'Slowing down',flat:'Steady'}[dir]}${k?` · ${d>=0?'+':'−'}${Math.abs(d).toFixed(0)} m/min`:''}</span></div><b class="num">${r.v.toFixed(0)}<small> m/min</small></b></div>`; }).join('')}</div>`; }
  function mdLeads(md,m){ const q=s=>md.querySelector(s), rows=TD.fences.map(f=>({id:f.id,lead:JDATA[f.id][m.leadOf],type:JDATA[f.id].type})), nL=rows.filter(r=>r.lead==='Left').length, nR=rows.length-nL;
    q('#mdV').innerHTML=`${nL>=nR?'Left':'Right'}<small>${Math.max(nL,nR)} of ${rows.length} fences</small>`;
    q('#mdS').textContent=T('Lead on the '+(m.when==='takeoff'?'last stride before':'first stride after')+' each fence');
    q('#mdCh').style.display='none';
    q('#mdSt').innerHTML=`<div class="lrBig"><div style="flex:${nL}"><b class="num">${nL}</b><span>Left lead</span></div><div style="flex:${nR}" class="r"><b class="num">${nR}</b><span>Right lead</span></div></div>`;
    q('#mdE').innerHTML=`<div class="mdL two">${rows.map(r=>`<button class="sRow click" data-j="${r.id}"><span class="sRic blue">${mic(m.when==='takeoff'?'bolt':'impact')}</span><div class="t"><b><span>Fence</span> <span translate="no">${r.id}</span></b><span>${esc(r.type)}</span></div><span class="pill ${r.lead==='Left'?'blue':''}">${r.lead}</span></button>`).join('')}</div>`;
    md.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{ W.closeModal(); go('jumps'); setTimeout(()=>selectJ(b.dataset.j),RM()?0:200); }); }
  function mdEvents(md,m){ const q=s=>md.querySelector(s), ev=m.events, counts=Object.keys(S.WHERE).map(k=>[k,ev.filter(e=>e.where===k).length]).filter(x=>x[1]), max=Math.max(...counts.map(x=>x[1]));
    q('#mdS').textContent=T(ev.length+' '+(m.evLabel||'lead changes')+' · where they happened');
    const ch=q('#mdCh'); ch.setAttribute('viewBox',`0 0 330 ${counts.length*26+6}`);
    ch.innerHTML=counts.map(([k,n],i)=>{ const y=i*26+4, w=Math.max(6,n/max*170); return `<text x="0" y="${y+14}" class="lt">${S.WHERE[k]}</text><rect x="112" y="${y+3}" width="${w}" height="14" rx="7" class="eb" style="opacity:${.45+.55*n/max}"/><text x="${112+w+8}" y="${y+14}" class="lv">${n}</text>`; }).join('');
    q('#mdSt').innerHTML='';
    q('#mdE').innerHTML=`<div class="mdL two">${ev.map(e=>`<div class="sRow">${ric(S.WHERE_IC[e.where],e.flag?'watch':'blue')}<div class="t"><b>${esc(e.at)}</b><span>${esc(S.WHERE[e.where])}${e.to?` · to the ${e.to==='L'?'left':'right'} lead`:''}${e.note?' · '+esc(e.note):''}${e.flag?` · <span class="watch">${esc(e.flag)}</span>`:''}</span></div><button class="sGo num" data-t="${e.t}">${mmss(e.t)}${W.ic(PLAY,12)}</button></div>`).join('')}</div>`;
    md.querySelectorAll('.sGo').forEach(b=>b.onclick=()=>{ W.closeModal(); go('overview'); setTimeout(()=>VP&&VP.seek(+b.dataset.t-2,true),RM()?0:260); }); }

  /* ======================================================================
     TRENDS: any of the 36 metrics across sessions
     ====================================================================== */
  let trRO=null, trCur=NOSC?'m_len':'s_perf', trMonths=3, trSel=null, trHov=null, trCk='';
  function trPoints(){ const m=TR_ALL.find(x=>x.id===trCur), vals=ser(trCur), TS=TRS(), since=new Date(TS[TS.length-1].date); since.setMonth(since.getMonth()-trMonths);
    return {m,P:TS.map((s,i)=>({i,s,v:vals[i]})).filter(p=>p.s.date>=since)}; }
  function renderTrends(){ const p=$('p-trends');
    p.innerHTML=`<div class="sTr"><section class="card in sTrC"><div class="cardH"><button class="trPick" id="trPick"><span class="sRic blue" id="trIc"></span><span class="t"><span class="lbl" id="trG"></span><b id="trN"></b></span><span class="ico">${I.chev}</span></button>
        <div class="r"><div class="seg" id="trP">${[1,3,6].map(m=>`<button data-m="${m}" class="${m===trMonths?'on':''}">${m===1?'1 month':m+' months'}</button>`).join('')}</div></div></div>
      <div class="cardB"><div class="trTop"><div class="trBig" id="trBig"></div><span id="trW"></span><span id="trBest"></span></div><div class="mut trSen" id="trSen"></div>
        <div class="trCh" id="trCh"><div class="trTt" id="trTt"></div></div>
        <div class="trLg"><span><i class="c"></i>Competition</span><span><i class="t"></i>Training</span><span><i class="a"></i>Average</span><span id="trCvL"><i class="v"></i>Care visit</span></div></div></section>
      <div class="sTrR"><section class="card in"><div class="cardB trSt" id="trSt"></div></section>
        <section class="card in sTrL"><div class="cardH"><h2>Sessions</h2><div class="r"><span class="mut" id="trCnt"></span></div></div><div class="trList" id="trList"></div></section></div></div>`;
    $('trPick').onclick=()=>trPicker($('trPick'));
    $('trP').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; trMonths=+b.dataset.m; trSel=null; $('trP').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); drawTrends(true); };
    drawTrends(true);
    if(window.ResizeObserver){ if(trRO) trRO.disconnect(); let w=$('trCh').clientWidth; trRO=new ResizeObserver(()=>{ const c=$('trCh'); if(c&&Math.abs(c.clientWidth-w)>2){ w=c.clientWidth; drawChart(false); } }); trRO.observe($('trCh')); } }
  function drawTrends(anim){ const {m,P}=trPoints(), n=P.length, dec=decOf(m), f=v=>(+v).toFixed(dec);
    if(trSel==null||!P.some(p=>p.i===trSel)) trSel=P[n-1].i;
    $('trIc').innerHTML=icOf(m); $('trN').textContent=T(m.l); $('trG').textContent=T(m.g);
    const mx=(n-1)/2, my=P.reduce((a,p)=>a+p.v,0)/n, b=P.reduce((a,p,k)=>a+(k-mx)*(p.v-my),0)/(P.reduce((a,p,k)=>a+(k-mx)**2,0)||1), change=b*(n-1);
    const flat=Math.abs(change)<m.sd*.5, up=change>0, word=flat?'Steady':(m.better===0?(up?'Going up':'Going down'):((up===(m.better>0))?'Improving':'Dropping'));
    const tone=flat||m.better===0?'blue':((up===(m.better>0))?'good':'bad'), last=P[n-1].v, isBest=m.better!==0&&P.every(p=>m.better>0?p.v<=last:p.v>=last);
    $('trBig').innerHTML=`<span class="num">${f(last)}</span><small>${esc(m.u)}</small>`;
    $('trW').innerHTML=`<span class="pill ${tone}">${W.ic((window.SDW_IC||{})['graph-up'],12)}${word}</span>`;
    $('trBest').innerHTML=isBest&&n>2?`<span class="pill good">★ ${trMonths===1?'Best in a month':'Best in '+trMonths+' months'}</span>`:'';
    const period={1:'the last month',3:'the last 3 months',6:'the last 6 months'}[trMonths], unitW=PCT(m.u)?'points':m.u;
    $('trSen').textContent=flat?`About the same over ${period}, ${n} sessions.`:`${up?'Up':'Down'} ${f(Math.abs(change))} ${unitW} over ${period}, ${n} sessions.`;
    const best=m.better<0?P.reduce((a,q)=>q.v<a.v?q:a):P.reduce((a,q)=>q.v>a.v?q:a), sh=P.filter(q=>q.s.kind==='Competition');
    const cell=(k,v,x)=>`<div><span class="lbl">${k}</span><b><span class="num">${v}</span><small>${esc(m.u)}</small></b><small>${x}</small></div>`;
    $('trSt').innerHTML=cell(m.better===0?'Highest':'Best',f(best.v),`<span>${fShort(best.s.date)}</span>`)+cell('Average',f(my),`${n} sessions`)+(sh.length?cell('Shows',f(sh.reduce((a,q)=>a+q.v,0)/sh.length),'average in competition'):'');
    $('trCnt').textContent=T(n+' '+(n>1?'sessions':'session'));
    $('trList').innerHTML=[...P].reverse().map(q=>`<button class="trR${q.i===trSel?' on':''}" data-i="${q.i}"><span class="kic ${q.s.kind==='Competition'?'show':''}">${KIC(q.s.kind)}</span>
      <span class="cell2"><b>${q.s.now?'This session':`<span>${fShort(q.s.date)}</span>`}</b><span>${q.s.kind} · ${esc(q.s.what)}</span></span><span class="v"><span class="num">${f(q.v)}</span><small>${esc(m.u)}</small></span></button>`).join('');
    $('trList').querySelectorAll('.trR').forEach(r=>{ r.onclick=()=>{ trSel=+r.dataset.i; markList(); drawChart(false); };
      r.onmouseenter=()=>{ trHov=+r.dataset.i; drawChart(false,true); }; r.onmouseleave=()=>{ trHov=null; drawChart(false,true); }; });
    const ck=trCur+'|'+trMonths; drawChart(anim&&ck!==trCk); trCk=ck;
    if(anim&&window.SD_COUNT){ SD_COUNT($('trBig')); SD_COUNT($('trSt')); } }
  function markList(){ $('trList').querySelectorAll('.trR').forEach(r=>r.classList.toggle('on',+r.dataset.i===trSel)); }
  function drawChart(anim,soft){ const box=$('trCh'); if(!box) return; const {m,P}=trPoints(), n=P.length, dec=decOf(m), f=v=>(+v).toFixed(dec);
    const Wd=Math.max(360,box.clientWidth), Hh=340, X0=44, X1=Wd-16, Y0=30, Y1=Hh-34;
    const lo=Math.min(...P.map(p=>p.v)), hi=Math.max(...P.map(p=>p.v)), pad=(hi-lo)*.25||m.sd;
    const X=k=>n>1?X0+k/(n-1)*(X1-X0):(X0+X1)/2, Y=v=>Y1-(v-(lo-pad))/((hi+pad)-(lo-pad))*(Y1-Y0);
    const my=P.reduce((a,p)=>a+p.v,0)/n, line=P.map((p,k)=>`${k?'L':'M'}${X(k).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' ');
    const flatT=(()=>{ const mx=(n-1)/2, b=P.reduce((a,p,k)=>a+(k-mx)*(p.v-my),0)/(P.reduce((a,p,k)=>a+(k-mx)**2,0)||1), ch=b*(n-1); if(Math.abs(ch)<m.sd*.5||m.better===0) return 'blue'; return (ch>0)===(m.better>0)?'good':'bad'; })();
    const col=`var(--${flatT})`;
    const ticks=[]; { const raw=(hi+pad-(lo-pad))/5.5, p10=Math.pow(10,Math.floor(Math.log10(raw))), st=[1,2,2.5,5,10].map(x=>x*p10).find(x=>x>=raw)||raw; for(let t=Math.ceil((lo-pad)/st)*st;t<=hi+pad+1e-9;t+=st) ticks.push(t); }
    let lab='', lastM=-1; P.forEach((p,k)=>{ const mo=p.s.date.getMonth(); if(trMonths===1){ if(k%Math.ceil(n/6)===0||k===n-1) lab+=`<text x="${X(k)}" y="${Hh-10}" text-anchor="middle" class="axt">${fShort(p.s.date)}</text>`; }
      else if(mo!==lastM){ lastM=mo; lab+=`<text x="${Math.max(X0+10,X(k))}" y="${Hh-10}" text-anchor="middle" class="axt">${MON[mo]}</text>`; } });
    const sk=P.findIndex(p=>p.i===trSel), hk=trHov!=null?P.findIndex(p=>p.i===trHov):-1;
    let care=''; const CV=window.CARE&&CARE.list?CARE.list(H.id):[];
    const xOfD=d=>{ if(!n||d<P[0].s.date||d>P[n-1].s.date) return null; for(let k=0;k<n-1;k++){ const a=P[k].s.date,b=P[k+1].s.date; if(d>=a&&d<=b) return X(k)+(X(k+1)-X(k))*((d-a)/((b-a)||1)); } return X(n-1); };
    CV.forEach(v=>{ const x=xOfD(v.d); if(x==null) return; care+=`<g class="cvM" data-v="${v.id}"><line x1="${x}" x2="${x}" y1="${Y0-4}" y2="${Y1}"/><circle cx="${x}" cy="${Y0-12}" r="9"/><g transform="translate(${x-6} ${Y0-18})">${CARE.ico(v.type,12,'var(--blue-ink)').replace('<svg ','<svg width="12" height="12" ')}</g><rect x="${x-11}" y="${Y0-22}" width="22" height="${Y1-Y0+22}" fill="transparent"/></g>`; });
    const cvL=$('trCvL'); if(cvL) cvL.style.display=care?'':'none';
    const gid='trg'+trCur;
    const svg=`<svg width="${Wd}" height="${Hh}" viewBox="0 0 ${Wd} ${Hh}"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${col}" stop-opacity=".22"/><stop offset="1" style="stop-color:${col}" stop-opacity="0"/></linearGradient></defs>
      ${ticks.map(t=>`<line x1="${X0}" x2="${X1}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" class="gr"/><text x="${X0-10}" y="${(Y(t)+3.5).toFixed(1)}" text-anchor="end" class="axt">${(+t.toFixed(3)).toString()}</text>`).join('')}
      <line x1="${X0}" x2="${X1}" y1="${Y(my)}" y2="${Y(my)}" class="avl"/>
      ${care}<g class="cv"><path d="${line} L${X(n-1)} ${Y1} L${X(0)} ${Y1}Z" fill="url(#${gid})"/><path d="${line}" fill="none" style="stroke:${col}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
      ${P.map((p,k)=>`<circle cx="${X(k)}" cy="${Y(p.v)}" r="${p.s.kind==='Competition'?4.6:3.6}" class="pt ${p.s.kind==='Competition'?'c':'t'}" style="stroke:${col}"/>`).join('')}</g>
      ${sk>=0?`<g class="sel"><line x1="${X(sk)}" x2="${X(sk)}" y1="${Y0}" y2="${Y1}"/><circle cx="${X(sk)}" cy="${Y(P[sk].v)}" r="12" style="fill:${col}" opacity=".18"/><circle cx="${X(sk)}" cy="${Y(P[sk].v)}" r="6.5" class="sd" style="stroke:${col}"/></g>`:''}
      ${hk>=0&&hk!==sk?`<circle cx="${X(hk)}" cy="${Y(P[hk].v)}" r="7" class="hv" style="stroke:${col}"/>`:''}
      <line x1="${X0}" x2="${X1}" y1="${Y1}" y2="${Y1}" class="ax"/>${lab}<rect class="hit" x="${X0-10}" y="0" width="${X1-X0+20}" height="${Hh}" fill="transparent"/></svg>`;
    const tt=$('trTt'); box.innerHTML=svg; box.appendChild(tt);
    if(anim&&window.SD_WIPE) SD_WIPE(box.querySelector('.cv'));
    const tip=k=>{ if(k<0){ tt.classList.remove('on'); return; } const q=P[k];
      tt.innerHTML=`<div class="h"><span class="kic sm ${q.s.kind==='Competition'?'show':''}">${KIC(q.s.kind)}</span><b>${q.s.now?T('This session'):`<span>${fDate(q.s.date)}</span>`}</b></div><span>${T(q.s.kind)} · ${esc(T(q.s.what))}</span><em><span class="num">${f(q.v)}</span> ${esc(m.u)}</em>`;
      tt.classList.add('on'); const w=tt.offsetWidth, x=X(k), y=Y(q.v); tt.style.left=Math.max(4,Math.min(Wd-w-4,x-w/2))+'px'; tt.style.top=Math.max(0,y-tt.offsetHeight-16)+'px'; };
    const hit=box.querySelector('.hit'), near=e=>{ const r=box.getBoundingClientRect(), x=e.clientX-r.left; let b=0; P.forEach((q,k)=>{ if(Math.abs(X(k)-x)<Math.abs(X(b)-x)) b=k; }); return b; };
    hit.onpointermove=e=>{ const k=near(e); tip(k); const c=box.querySelector('.hv2'); if(c) c.remove(); box.querySelector('svg').insertAdjacentHTML('beforeend',`<circle class="hv2 hv" cx="${X(k)}" cy="${Y(P[k].v)}" r="7" style="stroke:${col};pointer-events:none"/>`);
      $('trList').querySelectorAll('.trR').forEach(r=>r.classList.toggle('hov',+r.dataset.i===P[k].i)); };
    hit.onpointerleave=()=>{ tip(-1); const c=box.querySelector('.hv2'); if(c) c.remove(); $('trList').querySelectorAll('.trR.hov').forEach(r=>r.classList.remove('hov')); };
    hit.onclick=e=>{ trSel=P[near(e)].i; markList(); drawChart(false); const r=$('trList').querySelector('.trR.on'); r&&r.scrollIntoView({block:'nearest',behavior:RM()?'auto':'smooth'}); };
    box.querySelectorAll('.cvM').forEach(g=>{ const v=CV.find(x=>x.id===g.dataset.v); g.onmouseenter=()=>{ const im=impact(P,v.d);
        tt.innerHTML=`<div class="h"><span class="ico" style="width:16px;height:16px">${CARE.ico(v.type,16,'var(--blue-ink)')}</span><b>${esc(T(({vet:'Vet',osteo:'Osteopath',farrier:'Farrier',dentist:'Dentist',physio:'Physio',saddle:'Saddle fitter'})[v.type]||'Other'))}</b></div><span>${fDate(v.d)}${v.note?' · '+esc(v.note):''}</span>${im?`<em><span>Before</span> <span class="num">${f(im.b)}</span> → <span>after</span> <span class="num">${f(im.a)}</span></em>`:''}`;
        tt.classList.add('on'); const w=tt.offsetWidth, x=+g.querySelector('line').getAttribute('x1'); tt.style.left=Math.max(4,Math.min(Wd-w-4,x-w/2))+'px'; tt.style.top=(Y0+6)+'px'; };
      g.onmouseleave=()=>tt.classList.remove('on'); });
    if(!soft&&sk>=0) tip(-1); }
  const impact=(P,d)=>{ const bef=P.filter(p=>p.s.date<d).slice(-3), aft=P.filter(p=>p.s.date>d).slice(0,3); if(!bef.length||!aft.length) return null; const av=a=>a.reduce((s,p)=>s+p.v,0)/a.length; return {b:av(bef),a:av(aft)}; };
  function trPicker(btn){ let q='';
    const list=()=>{ const n=x=>T(x).toLowerCase(); const G=[...new Set(TR_ALL.map(m=>m.g))];
      return G.map(g=>{ const L=TR_ALL.filter(m=>m.g===g&&(!q||n(m.l).includes(q)||m.l.toLowerCase().includes(q))); return L.length?`<div class="gl">${esc(T(g))}</div>`+L.map(m=>`<button class="mi${m.id===trCur?' on':''}" data-id="${m.id}"><span class="ico" style="color:var(--blue-ink)">${icOf(m)}</span><span class="t">${esc(T(m.l))}</span><span class="ico ck">${I.check}</span></button>`).join(''):''; }).join('')||`<div class="gd" style="padding:14px 10px">${esc(T('No metric found'))}</div>`; };
    const p=W.pop(btn,`<div class="trSrch"><span class="ico">${I.search}</span><input id="trQ" type="search" placeholder="Search the ${TR_ALL.length} metrics" autocomplete="off"></div><div class="trML" id="trML">${list()}</div>`,{w:360,align:'left',role:'dialog'});
    if(!p) return; const inp=p.querySelector('#trQ'), ml=p.querySelector('#trML');
    const wire=()=>ml.querySelectorAll('.mi').forEach(b=>b.onclick=()=>{ trCur=b.dataset.id; trSel=null; W.closePop(); drawTrends(true); });
    inp.oninput=()=>{ q=inp.value.trim().toLowerCase(); ml.innerHTML=list(); wire(); }; wire(); setTimeout(()=>{ try{ inp.focus({preventScroll:true}); }catch(e){} const on=ml.querySelector('.mi.on'); on&&on.scrollIntoView({block:'center'}); },30); }

  /* ======================================================================
     COMPARE: two sessions, every metric
     ====================================================================== */
  let cA=null, cB=null, cDet=NOSC?'m_len':'s_perf';
  const sLab=i=>TRS()[i].now?'This session':fDate(TRS()[i].date);
  function cShort(){ const TS=TRS(), perf=ser('s_perf'), lastShow=[...TS.keys()].reverse().find(i=>i!==cA&&TS[i].kind==='Competition');
    const best=[...TS.keys()].filter(i=>i!==cA).reduce((a,i)=>perf[i]>perf[a]?i:a,cA?0:1);
    return [['Previous session',Math.max(0,cA-1)],['Last show',lastShow],['Best round',best]].filter((x,k,A)=>x[1]!=null&&x[1]!==cA&&A.findIndex(y=>y[1]===x[1])===k); }
  const judge=(m,x,y)=>{ const d=x-y; if(Math.abs(d)<m.sd*.3) return ['Same','same']; const up=d>0; if(m.better===0) return [up?'Higher':'Lower','hi']; const g=up===(m.better>0); return [g?'Better':'Worse',g?'good':'bad']; };
  function renderCompare(){ const p=$('p-compare'), TS=TRS(); if(cA==null){ cA=TS.length-1; cB=TS.length-2; }
    const selB=(i,k)=>`<button class="cSel ${k}" id="cSel${k}" data-k="${k}"><span class="cd"></span><span class="t"><span class="lbl">${k==='A'?'SESSION':'COMPARED WITH'}</span><b>${TS[i].now?'This session':`<span>${fDate(TS[i].date)}</span>`}</b><span class="w"><span class="ico">${KIC(TS[i].kind)}</span><span>${TS[i].kind} · ${esc(TS[i].what)}</span></span></span><span class="chg">Change${W.ic(I.chev,14)}</span></button>`;
    let nU=0,nD=0,nS=0; const rows=[]; let g0='';
    for(const m of TR_ALL){ const v=ser(m.id), a=v[cA], b=v[cB], dec=decOf(m), f=x=>(+x).toFixed(dec), [tag,cls]=judge(m,a,b);
      if(cls==='same') nS++; else if(cls==='good') nU++; else if(cls==='bad') nD++;
      if(m.g!==g0){ rows.push(`<div class="cG lbl">${esc(m.g)}</div>`); g0=m.g; }
      const w=Math.min(50,Math.max(6,Math.abs(a-b)/(m.sd*1.6)*50));
      rows.push(`<button class="cR${m.id===cDet?' on':''}" data-id="${m.id}"><span class="nm"><span class="ico">${icOf(m)}</span><span>${esc(m.l)}</span>${m.u&&m.u!=='%'?`<small>${esc(m.u)}</small>`:''}</span>
        <span class="c num">${f(b)}${m.u==='%'?'%':''}</span><span class="c a num">${f(a)}${m.u==='%'?'%':''}</span>
        <span class="dl"><i class="${cls}" style="${a>=b?'left:50%':'right:50%'};width:${cls==='same'?0:w}%"></i><em></em></span><span class="pill ${cls==='same'?'':cls==='hi'?'blue':cls}">${tag}</span></button>`); }
    const tot=nU+nD+nS, verdict=nU>nD?'a better session':(nD>nU?'a less good session':'a session of the same level');
    p.innerHTML=`<div class="sCp">
      <section class="card in cTop"><div class="cardB"><div class="cPick">${selB(cA,'A')}<button class="wIconB cSw" id="cSw" data-tip="Swap the two sessions" aria-label="Swap the two sessions">${W.ic(I.swap,18)}</button>${selB(cB,'B')}</div>
        <div class="cQ"><span class="lbl">Quick pick</span><div class="chips">${cShort().map(([l,i])=>`<button class="chip${i===cB?' on':''}" data-i="${i}">${l}</button>`).join('')}</div></div></div></section>
      <div class="cSum in"><div class="cN good"><b class="num">${nU}</b><span>Better</span></div><div class="cN"><b class="num">${nS}</b><span>Same</span></div><div class="cN bad"><b class="num">${nD}</b><span>Worse</span></div>
        <p class="cS"><span>Overall, <b>${TS[cA].now?'this session':fDate(TS[cA].date)}</b> was ${verdict} for ${esc(H.n)} than <b>${TS[cB].now?'this session':fDate(TS[cB].date)}</b>, on ${tot} things we can judge.</span></p></div>
      <div class="cBody"><section class="card in cTbl"><div class="cH"><span>METRIC</span><span class="c"><i class="b"></i><span>${TS[cB].now?'This':fShort(TS[cB].date)}</span></span><span class="c"><i class="a"></i><span>${TS[cA].now?'This':fShort(TS[cA].date)}</span></span><span>DIFFERENCE</span><span></span></div>${rows.join('')}</section>
        <aside class="cDet" id="cDet"></aside></div></div>`;
    p.querySelectorAll('.cSel').forEach(b=>b.onclick=()=>cPick(b));
    $('cSw').onclick=()=>{ [cA,cB]=[cB,cA]; renderCompare(); };
    p.querySelectorAll('.cQ .chip').forEach(c=>c.onclick=()=>{ cB=+c.dataset.i; renderCompare(); });
    p.querySelectorAll('.cR').forEach(r=>r.onclick=()=>{ cDet=r.dataset.id; p.querySelectorAll('.cR').forEach(x=>x.classList.toggle('on',x===r)); cDetail(true); });
    if(window.SD_COUNT) SD_COUNT(p.querySelector('.cSum'));
    cDetail(false); }
  function cPick(btn){ const k=btn.dataset.k, TS=TRS(), cur=k==='A'?cA:cB, other=k==='A'?cB:cA;
    const p=W.pop(btn,`<div class="gl">${k==='A'?'Session':'Compared with'}</div><div class="trML">${[...TS.keys()].reverse().filter(i=>i!==other).map(i=>`<button class="mi${i===cur?' on':''}" data-i="${i}"><span class="kic sm ${TS[i].kind==='Competition'?'show':''}">${KIC(TS[i].kind)}</span><span class="t">${TS[i].now?T('This session'):`<span>${fDate(TS[i].date)}</span>`}<small>${T(TS[i].kind)} · ${esc(T(TS[i].what))}</small></span><span class="ico ck">${I.check}</span></button>`).join('')}</div>`,{w:320,align:'left'});
    if(p){ p.querySelectorAll('.mi').forEach(b=>b.onclick=()=>{ const i=+b.dataset.i; if(k==='A') cA=i; else cB=i; W.closePop(); renderCompare(); }); const on=p.querySelector('.mi.on'); on&&on.scrollIntoView({block:'center'}); } }
  function cDetail(anim){ const el=$('cDet'), m=TR_ALL.find(x=>x.id===cDet)||TR_ALL[0], v=ser(m.id), a=v[cA], b=v[cB], dec=decOf(m), f=x=>(+x).toFixed(dec), U=m.u==='%'?'%':m.u, [tag,cls]=judge(m,a,b);
    const A=S.cdCurve(m,cA,a), B=S.cdCurve(m,cB,b), all=[...A,...B], lo=Math.min(...all), hi=Math.max(...all), pad=(hi-lo)*.15||m.sd;
    const X=k=>12+k/23*306, Y=y=>122-(y-(lo-pad))/((hi+pad)-(lo-pad))*108, path=arr=>arr.map((y,k)=>`${k?'L':'M'}${X(k).toFixed(1)} ${Y(y).toFixed(1)}`).join(' ');
    const th=[['Start of the round',0,8],['Middle of the round',8,16],['End of the round',16,24]], av=(arr,s0,s1)=>arr.slice(s0,s1).reduce((x,y)=>x+y,0)/(s1-s0);
    const rows=th.map(([l,s0,s1])=>{ const x=av(A,s0,s1), y=av(B,s0,s1), [t,c]=judge(m,x,y); return {l,x,y,t,c,gap:Math.abs(x-y)}; }), big=rows.reduce((p,q)=>q.gap>p.gap?q:p);
    const TS=TRS(), diff=Math.abs(a-b), unitW=PCT(m.u)?'points':(m.u||'');
    const lab=i=>TS[i].now?'this session':fDate(TS[i].date);
    el.innerHTML=`<section class="card in"><div class="cardH"><span class="ico" style="color:var(--blue-ink)">${icOf(m)}</span><h2>${esc(m.l)}</h2><div class="r"><span class="pill ${cls==='same'?'':cls==='hi'?'blue':cls}">${tag}</span></div></div>
      <div class="cardB"><div class="cVs"><div><span class="lbl"><i class="b"></i>${TS[cB].now?'This session':`<span>${fShort(TS[cB].date)}</span>`}</span><b><span class="num">${f(b)}</span><small>${esc(U)}</small></b></div><span class="ar">${W.ic(W.I.arrowR,18)}</span>
        <div><span class="lbl"><i class="a"></i>${TS[cA].now?'This session':`<span>${fShort(TS[cA].date)}</span>`}</span><b><span class="num">${f(a)}</span><small>${esc(U)}</small></b></div></div>
        <p class="cSen">${cls==='same'?`${esc(m.l)} was <b>about the same</b> in both sessions.`:`${esc(m.l)} was <b>${f(diff)} ${esc(unitW)} ${a>b?'higher':'lower'}</b> on ${lab(cA)} than on ${lab(cB)}${cls==='good'?', a step forward.':cls==='bad'?', worth a look.':'.'}`}</p>
        <div class="lbl" style="margin-top:16px">Through the round</div>
        <svg viewBox="0 0 330 146" class="cCh">${[8,16].map(k=>`<line x1="${X(k-.5)}" x2="${X(k-.5)}" y1="10" y2="122" class="gr"/>`).join('')}<path d="${path(B)}" class="lb"/><path d="${path(A)}" class="la"/><line x1="12" x2="318" y1="122" y2="122" class="ax"/>
          ${th.map(([l,s0,s1])=>`<text x="${(X(s0)+X(s1-1))/2}" y="138" text-anchor="middle" class="axt">${l.split(' ')[0]}</text>`).join('')}</svg>
        <div class="cL">${rows.map(r=>`<div><span class="t"><b>${r.l}</b>${r===big&&r.c!=='same'?'<span class="pill blue">Biggest gap</span>':''}<small><span class="num">${f(r.y)}</span> → <span class="num">${f(r.x)}</span> ${esc(U)}</small></span><span class="pill ${r.c==='same'?'':r.c==='hi'?'blue':r.c}">${r.t}</span></div>`).join('')}</div>
        <button class="btn" id="cTr" style="margin-top:16px;width:100%">${W.ic((window.SDW_IC||{})['graph-up'],16)}<span>See how it evolves over time</span></button></div></section>`;
    if(anim&&!RM()){ el.firstChild.animate([{opacity:.4,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:240,easing:'ease-out'}); }
    if(!RM()) el.querySelectorAll('.la,.lb').forEach((pth,k)=>{ const L=pth.getTotalLength(); pth.style.strokeDasharray=L; pth.style.strokeDashoffset=L; pth.getBoundingClientRect(); pth.style.transition=`stroke-dashoffset .8s cubic-bezier(.23,1,.32,1) ${k*.12}s`; pth.style.strokeDashoffset=0; });
    $('cTr').onclick=()=>{ trCur=m.id; trSel=cA; go('trends'); }; }

  /* ======================================================================
     TABS: the hash keeps the tab, keys 1 to 6 switch, arrows step the jumps
     ====================================================================== */
  const RENDER={overview:renderOverview,heatmap:renderHeat,jumps:renderJumps,metrics:renderMetrics,trends:renderTrends,compare:renderCompare};
  const done={}; let curTab=null;
  function go(k,opt){ if(!RENDER[k]) k='overview'; const prev=curTab; curTab=k;
    document.querySelectorAll('#sTabs button').forEach(b=>{ const on=b.dataset.t===k; b.classList.toggle('on',on); b.setAttribute('aria-selected',on); });
    ink();
    TABS.forEach(([t])=>{ const el=$('p-'+t); el.hidden=t!==k; });
    if(!done[k]||k==='trends'||k==='compare'){ RENDER[k](); done[k]=1; }
    else if(k==='jumps'&&CM&&CM.intro&&prev!==k) setTimeout(()=>CM.intro(),60);
    if(H3){ k==='heatmap'?H3.resume&&H3.resume():H3.pause&&H3.pause(); }
    if(prev&&prev!==k){ if(VP&&prev==='overview') VP.pause(); if(VP2&&prev==='jumps') VP2.pause();
      const el=$('p-'+k); if(!RM()&&el.animate) el.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.23,1,.32,1)'});
      const tb=$('sTabs'); if(tb.getBoundingClientRect().top<=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--top-h'))+2) window.scrollTo({top:$('sHd').offsetHeight+28,behavior:'auto'}); }
    $('sKeys').innerHTML=k==='jumps'?`<span class="kbd">←</span><span class="kbd">→</span><span>to step the jumps</span>`:k==='overview'?`<span class="kbd">Space</span><span>to play or pause</span>`:'';
    if(!(opt&&opt.noHash)) history.replaceState(null,'',location.pathname+location.search+'#'+k+(k==='jumps'?':'+selJ:'')); }
  function ink(){ const b=document.querySelector('#sTabs button.on'), i=$('sInk'); if(!b||!i) return; i.style.width=b.offsetWidth+'px'; i.style.transform=`translateX(${b.offsetLeft}px)`; }
  addEventListener('resize',ink);
  document.querySelectorAll('#sTabs button').forEach(b=>b.onclick=()=>go(b.dataset.t));
  document.addEventListener('keydown',e=>{ const tg=e.target, typing=/INPUT|TEXTAREA|SELECT/.test(tg.tagName)||tg.isContentEditable; if(typing||e.metaKey||e.ctrlKey||e.altKey) return;
    if(document.querySelector('.wModal.on,.sdxSheet.on')) return;
    if(/^[1-6]$/.test(e.key)){ go(TABS[+e.key-1][0]); return; }
    if(curTab==='jumps'&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){ if(tg.closest&&tg.closest('.vpTl,.h3d')) return; e.preventDefault(); stepJ(e.key==='ArrowRight'?1:-1); }
    if(curTab==='overview'&&e.key===' '&&!(tg.closest&&tg.closest('button,a'))){ e.preventDefault(); VP&&VP.toggle(); } });
  W.onTheme=()=>{ if(curTab==='trends') drawChart(false); };
  /* first tab: the hash (#jumps:5A), an alert (#watch=), else Overview; the phone's #trends and #compare work too */
  { const h=location.hash.replace(/^#/,''), [k,j]=h.split(':'); if(j&&JDATA[j]) selJ=j;
    if(WATCH){ go('overview',{noHash:true}); }
    else go(RENDER[k]?k:'overview',{noHash:!RENDER[k]}); }
  requestAnimationFrame(ink); setTimeout(ink,300);
  if(window.SD_COUNT&&$('sScore')) SD_COUNT($('sScore'));
  /* for check-parity.py: the numbers of this page */
  window.SDW_SESSION={score:NOSC?null:PERF.v,jumps:FIDS.length,metrics:{stride:S.METRICS[0].v,tempo:S.METRICS[2].v,jump1:JDATA[FIDS[0]].score,apex1:JDATA[FIDS[0]].apex},key:SES.key,horse:H.n};
})();
