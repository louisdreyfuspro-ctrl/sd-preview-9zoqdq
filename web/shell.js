/* StrydeUp desktop web app, the shell: the frame every desktop page sits in.
   LEFT: logo, navigation (follows the account), the demo account switch, who is signed in.
   TOP: page title, global search (horses, sessions, shows), a stable / horse switcher when the page wants one,
        language, theme, notifications, Upload video.
   It runs on top of the mobile app's shared files, loaded first by each page: i18n.js (languages), plan.js (account
   types, demo people and stables, motion helpers, sheets), care.js, then web/data.js (the sample data of the phone).

   A page:   <body><script>SDW.mount({page:'home', title:'Home'})</script> ... fill document.getElementById('wPage')
   Links:    SDW.href('horses',{},'#h=mb') gives the desktop page when it exists, else the "Coming next" page.
   Every page of the desktop app is built (ready:true); soon.html stays for a page that would not exist yet. */
(function(){
  const W=window.SDW={};
  const T=x=>(window.SD_T||(y=>y))(x);
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  W.T=T; W.esc=esc;
  const PLAN=window.SD_PLAN||'pro', ACC=window.SD_ACCOUNT||PLAN, PL=(window.SD_PLANS||{})[PLAN]||{};
  W.PLAN=PLAN; W.ACC=ACC;

  /* ---------- pages: the desktop file, and the mobile page that does the same job (used until the desktop one exists) ---------- */
  W.PAGES={
    home:    {f:'index.html',    ready:true,  m:'Etape%202%20-%20Home%20Pro.html?v=1026135841',        t:'Home'},
    horses:  {f:'horses.html',   ready:true,  m:'Etape%203%20-%20My%20Horses.html?v=1026135841',       t:'My Horses'},
    sessions:{f:'sessions.html', ready:true,  m:'Etape%204%20-%20Sessions.html?v=1026135841',          t:'Sessions'},
    session: {f:'session.html',  ready:true,  m:'Etape%201%20-%20Session%20Overview.html?v=1026135841',t:'Session analysis'},
    team:    {f:'team.html',     ready:true,  m:'Etape%203%20-%20My%20Horses.html?v=1026135841',       t:'Team'},
    profile: {f:'profile.html',  ready:true,  m:'Etape%205%20-%20Profile.html?v=1026135841',           t:'Profile'},
    settings:{f:'profile.html',  ready:true,  m:'Etape%205%20-%20Profile.html?v=1026135841',           t:'Settings'},
    signup:  {f:'signup.html',   ready:true,  m:'Etape%206%20-%20Onboarding.html?v=1026135841',        t:'Sign up'}};
  /* a board link (?plan=) keeps its account on every link, like the mobile pages */
  /* the publication sets W.V (publish.py), so a browser never shows a page of an older publication */
  W.V='1026135841';
  const urlPlan=new URLSearchParams(location.search).get('plan');
  const qs=q=>{ const p=new URLSearchParams(); if(W.V) p.set('v',W.V); Object.keys(q||{}).forEach(k=>{ if(q[k]!=null&&q[k]!=='') p.set(k,q[k]); }); if(urlPlan&&!p.has('plan')) p.set('plan',ACC); const s=p.toString(); return s?'?'+s:''; };
  W.href=(page,q,hash)=>{ const P=W.PAGES[page]||W.PAGES.home; hash=hash||'';
    return P.ready?P.f+qs(q)+hash:'soon.html'+qs(Object.assign({p:page},q))+hash; };
  W.mobileHref=(page,q,hash)=>{ const P=W.PAGES[page]||W.PAGES.home, u=new URL('../'+P.m,location.href);
    Object.keys(q||{}).forEach(k=>u.searchParams.set(k,q[k])); u.searchParams.set('plan',ACC); u.hash=hash||''; return u.toString(); };
  W.go=(page,q,hash)=>{ location.href=W.href(page,q,hash); };

  /* ---------- icons ---------- */
  const NAV=window.SDW_NAV||{}, IC=window.SDW_IC||{};
  const L=(d,sw)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw||1.6}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const STABLE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21.5v-6c0-.943 0-1.414.293-1.707S9.057 13.5 10 13.5h4c.943 0 1.414 0 1.707.293S16 14.557 16 15.5v6M8.5 14l7.5 7.5m-.5-7.5L8 21.5m2.5-13h3"/><path d="M4.388 6.876L3.345 9.224c-.172.387-.258.58-.301.785c-.044.206-.044.417-.044.84V17.5c0 1.886 0 2.828.586 3.414S5.114 21.5 7 21.5h10c1.886 0 2.828 0 3.414-.586S21 19.386 21 17.5v-7.056c0-.47 0-.705-.053-.931c-.054-.227-.16-.437-.37-.857l-.95-1.9c-.31-.622-.466-.933-.71-1.17c-.245-.237-.56-.383-1.191-.674L12.954 2.71a2.28 2.28 0 0 0-1.908 0L6.367 4.869c-.676.312-1.014.468-1.27.727c-.255.26-.406.6-.709 1.28"/></svg>';
  W.I={
    home:NAV.home, horse:NAV.horse, sessions:NAV.sessions, profile:NAV.profile, stable:STABLE, bell:NAV.bell, upload:NAV.upload,
    team:L('<circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.9-3.3 3.3-5.1 6.2-5.1s5.3 1.8 6.2 5.1"/><path d="M15.5 4.9a3.4 3.4 0 0 1 0 6.3M17.6 14.6c1.8.7 3.1 2.4 3.6 4.9"/>'),
    settings:L('<path d="M10.3 3.6a1.8 1.8 0 0 1 3.4 0l.3.9a1.8 1.8 0 0 0 2.5 1l.8-.4a1.8 1.8 0 0 1 2.4 2.4l-.4.8a1.8 1.8 0 0 0 1 2.5l.9.3a1.8 1.8 0 0 1 0 3.4l-.9.3a1.8 1.8 0 0 0-1 2.5l.4.8a1.8 1.8 0 0 1-2.4 2.4l-.8-.4a1.8 1.8 0 0 0-2.5 1l-.3.9a1.8 1.8 0 0 1-3.4 0l-.3-.9a1.8 1.8 0 0 0-2.5-1l-.8.4a1.8 1.8 0 0 1-2.4-2.4l.4-.8a1.8 1.8 0 0 0-1-2.5l-.9-.3a1.8 1.8 0 0 1 0-3.4l.9-.3a1.8 1.8 0 0 0 1-2.5l-.4-.8a1.8 1.8 0 0 1 2.4-2.4l.8.4a1.8 1.8 0 0 0 2.5-1z"/><circle cx="12" cy="12" r="3"/>',1.5),
    search:L('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',1.8),
    globe:L('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5S9.6 5.8 12 3.5z"/>',1.5),
    sun:L('<circle cx="12" cy="12" r="4"/><path d="M12 2.8v1.9M12 19.3v1.9M4.7 4.7l1.4 1.4M17.9 17.9l1.4 1.4M2.8 12h1.9M19.3 12h1.9M4.7 19.3l1.4-1.4M17.9 6.1l1.4-1.4"/>',1.6),
    moon:L('<path d="M20 14.3A8 8 0 0 1 9.7 4a8 8 0 1 0 10.3 10.3z"/>',1.6),
    chev:L('<path d="M7 10l5 5 5-5"/>',1.8), chevR:L('<path d="M9.5 6l6 6-6 6"/>',1.8), updown:L('<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>',1.7),
    check:L('<path d="M5 12.5l4.5 4.5L19 7.5"/>',2), x:L('<path d="M6 6l12 12M18 6 6 18"/>',1.8),
    swap:L('<path d="M4 8h15"/><path d="m15.5 4.5 3.5 3.5-3.5 3.5"/><path d="M20 16H5"/><path d="M8.5 12.5 5 16l3.5 3.5"/>',1.6),
    info:L('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.9" r=".7" fill="currentColor" stroke="none"/>',1.7),
    phone:L('<rect x="6.5" y="2.8" width="11" height="18.4" rx="2.6"/><path d="M10.5 18h3"/>',1.6),
    arrowR:L('<path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/>',1.8),
    dots:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/></svg>',
    logout:L('<path d="M14 4.5h3.5A2 2 0 0 1 19.5 6.5v11a2 2 0 0 1-2 2H14"/><path d="M10 8l-4 4 4 4M6 12h9.5"/>',1.7),
    record:L('<rect x="3" y="6.5" width="13" height="11" rx="3"/><path d="m16 10.5 5-3v9l-5-3"/>',1.6),
    sliders:L('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',1.6)};
  W.ic=(svg,px,cls)=>`<span class="ico${cls?' '+cls:''}" style="${px?`width:${px}px;height:${px}px`:''}">${svg||''}</span>`;
  W.kindIcon=show=>window.SD_KIC?SD_KIC(show?'Competition':'Training'):'';

  /* ---------- who is signed in ---------- */
  const ME=window.SD_ME;
  W.me={first:(ME&&ME.name)||PL.me||'Marie', full:PL.full||window.SD_MYNAME||'Marie S.', badge:PL.badge||'PRO'};
  W.me.ini=W.me.first.slice(0,1).toUpperCase();
  const STAFF=PLAN==='vet', MULTI=!!window.SD_MULTI;
  W.roleLine=()=>{ const st=window.SD_STABLE||'Écurie Marie S.';
    if(ACC==='pro') return T('Unlimited horses');
    if(ACC==='premium') return T('One horse');
    if(STAFF&&MULTI) return T(`${(window.SD_STABLES||[]).length} stables`);
    return st; };

  /* ---------- the accounts of the demo, same list and words as the preview page ---------- */
  const OFF=k=>(window.SD_OFFERS||[]).find(o=>o.k===k)||{};
  W.ACCOUNTS=[
    {g:'Individual plans',d:'One user, their own subscription.',items:[['premium','Premium',`$${OFF('premium').m||49}/month`,'One user. One horse.'],['pro','Pro',`$${OFF('pro').m||149}/month`,'One user. Unlimited horses.']]},
    {g:'Stable Account',d:'One subscription paid by the stable.',items:[['owner','Stable Owner',`$${OFF('owner').m||218}/month`,'The master account: team, horses and access'],['rider','Rider','','A rider of the stable, with their own horses too'],
      ['vet','Vet / Osteo','','Vet, osteo or dentist, in one stable or several'],['farrier','Farrier','','Same set-up as the vet'],['trainer','Trainer','','Trains in one stable or several'],
      ['horseowner','Horse Owner','','Sees the horses they own: sessions and scores'],['groom','Groom','','Looks after the horses of the stable']]}];
  const accName=k=>{ let n=k; W.ACCOUNTS.forEach(g=>g.items.forEach(i=>{ if(i[0]===k) n=i[1]; })); return n; };

  /* ---------- the frame ---------- */
  const navItems=()=>{ const L=[['home','Home',W.I.home]];
    L.push(['horses',ACC==='owner'?'My Stable':ACC==='premium'?'My Horse':'My Horses',ACC==='owner'?W.I.stable:W.I.horse]);
    L.push(['sessions','Sessions',W.I.sessions]);
    if(ACC==='owner') L.push(['team','Team',W.I.team]);
    return L; };
  const navA=(k,label,icon,cur,hash)=>`<a href="${W.href(k,{},hash)}" class="${cur===k?'on':''}" data-tip="${esc(label)}" data-tipr="1">${W.ic(icon)}<span class="lb">${esc(label)}</span></a>`;
  W.mount=function(o){
    W.page=o.page||'home';
    const pg=W.PAGES[W.page]||W.PAGES.home;
    const badgeIco=(window.SD_PLAN_ICO||{})[ACC]||'';
    document.body.insertAdjacentHTML('afterbegin',`<div class="wApp" id="wApp">
      <aside class="wSide" aria-label="Main">
        <a class="wLogo" href="${W.href('home')}" aria-label="StrydeUp" translate="no"><span class="mk">S</span><span class="wm">STRYDEUP</span></a>
        <nav class="wNav">${navItems().map(([k,l,i])=>navA(k,l,i,W.page)).join('')}</nav>
        <div class="wNavL">Account</div>
        <nav class="wNav">${navA('profile','Profile',W.I.profile,W.page)}${navA('settings','Settings',W.I.settings,W.page,'#settings')}</nav>
        <div class="wSideFoot">
          <button class="wAcct" id="wAcct" data-tip="Switch account" data-tipr="1" aria-haspopup="menu">${W.ic(W.I.swap)}<span class="l"><span>Demo</span> · <b>${esc(T(accName(ACC)))}</b></span><span class="ico chev" style="width:14px;height:14px">${W.I.updown}</span></button>
          <button class="wMe" id="wMe" data-tip="${esc(W.me.full)}" data-tipr="1" aria-haspopup="menu"><span class="wAv">${esc(W.me.ini)}</span><span class="t"><b>${esc(W.me.full)}</b><small><span class="wBadge" translate="no">${badgeIco}${esc(T(W.me.badge))}</span><span>${esc(W.roleLine())}</span></small></span><span class="ico chev">${W.I.updown}</span></button>
        </div>
      </aside>
      <div class="wMain">
        <div class="wNarrow" role="note"><span class="ico" style="width:22px;height:22px;color:var(--blue-ink)">${W.I.phone}</span><div class="t"><b>On a small screen, use the mobile app</b><span>This desktop version is made for a computer. The mobile version fits this screen.</span></div><a class="btn pri sm" href="${W.mobileHref(W.page)}">Open the mobile version</a></div>
        <header class="wTop">
          <h1>${esc(o.title||pg.t)}</h1>
          <div class="wSearch" id="wSearch"><label class="box">${W.I.search}<input id="wQ" type="search" autocomplete="off" spellcheck="false" placeholder="Search horses, sessions, shows" aria-label="Search horses, sessions, shows"><span class="kbd hideM">⌘K</span></label></div>
          <div class="wTopR">
            <span id="wSwitchSlot" style="display:flex;align-items:center;gap:8px"></span>
            <button class="wIconB wLangB" id="wLang" data-tip="Language" aria-haspopup="menu">${W.ic(W.I.globe,17)}<span translate="no">${esc((window.SD_LANG||'en').toUpperCase())}</span></button>
            <button class="wIconB" id="wTheme" data-tip="${document.documentElement.dataset.theme==='light'?'Dark mode':'Light mode'}" aria-label="Appearance">${W.ic(document.documentElement.dataset.theme==='light'?W.I.moon:W.I.sun)}</button>
            <button class="wIconB" id="wBell" data-tip="Notifications" aria-label="Notifications" aria-haspopup="dialog">${W.ic(W.I.bell)}<b class="cnt" id="wBellN"></b></button>
            <span class="wSep"></span>
            <button class="btn pri" id="wUpload">${W.ic(W.I.upload)}<span>Upload video</span></button>
          </div>
        </header>
        <main class="wPage" id="wPage"></main>
      </div></div>`);
    wire();
  };

  /* ---------- popovers ---------- */
  let popEl=null, popAnchor=null, popAt=0;
  W.closePop=()=>{ if(!popEl) return; const p=popEl; popEl=null; if(popAnchor) popAnchor.classList.remove('on'); popAnchor=null; p.classList.remove('on'); setTimeout(()=>p.remove(),RM()?0:200); };
  W.pop=function(anchor,html,o){ o=o||{}; const same=popAnchor===anchor; W.closePop(); if(same&&!o.keep) return null;
    document.body.insertAdjacentHTML('beforeend',`<div class="wPop" role="${o.role||'menu'}" style="${o.w?`width:${o.w}px`:''}">${html}</div>`);
    const p=document.body.lastElementChild, r=anchor.getBoundingClientRect(); popEl=p; popAnchor=anchor; popAt=performance.now(); anchor.classList.add('on');
    const w=p.offsetWidth, h=p.offsetHeight; let left=o.align==='left'?r.left:r.right-w; left=Math.max(12,Math.min(innerWidth-w-12,left));
    let top=r.bottom+8; if(top+h>innerHeight-12&&r.top-h-8>12){ top=r.top-h-8; p.style.transformOrigin='bottom right'; }
    p.style.left=left+'px'; p.style.top=top+'px'; if(o.align==='left') p.style.transformOrigin='top left';
    void p.offsetHeight; p.classList.add('on'); return p; };
  document.addEventListener('pointerdown',e=>{ if(popEl&&!popEl.contains(e.target)&&!(popAnchor&&popAnchor.contains(e.target))&&!e.target.closest('#wSearch')) W.closePop(); });
  addEventListener('resize',()=>W.closePop()); addEventListener('scroll',e=>{ if(popEl&&!popEl.contains(e.target)&&performance.now()-popAt>400) W.closePop(); },true);

  /* ---------- modals ---------- */
  let modalEl=null, modalLast=null;
  W.closeModal=()=>{ if(!modalEl) return; const m=modalEl, v=document.getElementById('wVeil'); modalEl=null; m.classList.remove('on'); if(v) v.classList.remove('on'); setTimeout(()=>m.remove(),RM()?0:260);
    if(modalLast&&modalLast.focus) try{ modalLast.focus({preventScroll:true}); }catch(e){} };
  W.modal=function(o){ W.closePop(); if(modalEl){ modalEl.remove(); modalEl=null; }
    let v=document.getElementById('wVeil'); if(!v){ document.body.insertAdjacentHTML('beforeend','<div class="wVeil" id="wVeil"></div>'); v=document.getElementById('wVeil'); v.onclick=()=>W.closeModal(); }
    modalLast=document.activeElement;
    document.body.insertAdjacentHTML('beforeend',`<div class="wModal${o.wide?' wide':''}" role="dialog" aria-modal="true" aria-label="${esc(o.title||'')}">
      <div class="mH">${o.icon||''}<div style="flex:1;min-width:0"><h3>${esc(o.title||'')}</h3>${o.sub?`<p>${o.sub}</p>`:''}</div><button class="mX" aria-label="Close">${W.I.x}</button></div>
      <div class="mB">${o.body||''}</div>${o.foot?`<div class="mF">${o.foot}</div>`:''}</div>`);
    const m=document.body.lastElementChild; modalEl=m; m.querySelector('.mX').onclick=W.closeModal;
    void m.offsetHeight; v.classList.add('on'); m.classList.add('on'); o.wire&&o.wire(m);
    setTimeout(()=>{ const f=m.querySelector('[autofocus]')||m.querySelector('.mX'); try{ f.focus({preventScroll:true}); }catch(e){} },40);
    return m; };
  document.addEventListener('keydown',e=>{ if(e.key!=='Escape') return; if(popEl){ W.closePop(); return; } if(modalEl) W.closeModal(); });

  /* ---------- tooltips: data-tip (translated), shown after a short hover; data-tipr shows it on the right (sidebar, only when it is narrow) ---------- */
  let tipEl=null, tipT=null;
  const tipHide=()=>{ clearTimeout(tipT); if(tipEl) tipEl.classList.remove('on'); };
  document.addEventListener('pointerover',e=>{ const a=e.target.closest&&e.target.closest('[data-tip]'); if(!a){ tipHide(); return; }
    if(a.dataset.tipr&&innerWidth>1180){ tipHide(); return; }
    clearTimeout(tipT); tipT=setTimeout(()=>{ if(!a.isConnected||a.classList.contains('on')) return; if(!tipEl){ document.body.insertAdjacentHTML('beforeend','<div class="wTip" role="tooltip"></div>'); tipEl=document.body.lastElementChild; }
      tipEl.textContent=T(a.dataset.tip); const r=a.getBoundingClientRect(), w=tipEl.offsetWidth, h=tipEl.offsetHeight;
      if(a.dataset.tipr){ tipEl.style.left=(r.right+10)+'px'; tipEl.style.top=(r.top+r.height/2-h/2)+'px'; }
      else { tipEl.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px'; tipEl.style.top=(r.bottom+8)+'px'; }
      tipEl.classList.add('on'); },380); });
  document.addEventListener('pointerdown',tipHide); addEventListener('scroll',tipHide,true);

  /* ---------- top bar: switcher slot (a page puts a stable or horse switcher there) ---------- */
  W.switcher=function(o){ const slot=document.getElementById('wSwitchSlot'); if(!slot) return;
    if(!o){ slot.innerHTML=''; return; }
    slot.innerHTML=`<button class="wSwitch hideM" id="wSw" aria-haspopup="menu"><span class="lg">${esc(o.ini)}</span><span class="t">${esc(o.label)}</span><svg class="ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 9 4-4 4 4M8 15l4 4 4-4"/></svg></button><span class="wSep hideM"></span>`;
    const b=document.getElementById('wSw');
    b.onclick=()=>{ const p=W.pop(b,(o.head?`<div class="gl">${esc(o.head)}</div>`:'')+o.items.map(i=>`<button class="mi${i.on?' on':''}" data-v="${esc(i.v)}"><span class="hAv sm" style="border-radius:7px">${esc(i.ini)}</span><span class="t">${esc(i.label)}${i.sub?`<small>${esc(i.sub)}</small>`:''}</span>${i.count!=null?`<em>${i.count}</em>`:''}<span class="ico ck">${W.I.check}</span></button>`).join(''),{w:280});
      if(p) p.querySelectorAll('.mi').forEach(m=>m.onclick=()=>{ W.closePop(); o.onPick(m.dataset.v); }); }; };

  /* ---------- notifications (the bell): same list and read state as the phone ---------- */
  const D=()=>window.SD_DATA||{};
  let ntRead=new Set(); try{ ntRead=new Set(JSON.parse(localStorage.getItem('sdNotifRead'))||[]); }catch(e){}
  const saveNt=()=>{ try{ localStorage.setItem('sdNotifRead',JSON.stringify([...ntRead])); }catch(e){} };
  const ntBadge=()=>{ const n=(D().NT||[]).filter(x=>!ntRead.has(x.id)).length, b=document.getElementById('wBellN'); if(b){ b.textContent=n; b.classList.toggle('zero',!n); } };
  W.ntHref=x=>{ const d=D(); if(x.alert!=null){ const a=(d.NT_ALERTS||[])[x.alert]; return W.href('session',{},a?d.alertHash(a):''); }
    if(x.go&&x.go.startsWith('trends:')) return W.href('horses',{},'#h='+x.go.split(':')[1]+'&v=trends'); return W.href('session'); };
  const ntIco={'play-circle':IC['play-circle'],'danger-triangle':IC['danger-triangle'],'graph-up':IC['graph-up']};
  const openBell=b=>{ const L=D().NT||[]; let last='';
    const html=`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px 6px"><b style="font-size:14px">Notifications</b><button class="btn link" id="wNtAll" style="font-size:12.5px">Mark all as read</button></div>
      <div style="max-height:min(520px,70vh);overflow-y:auto">${L.length?L.map(x=>{ const head=x.day!==last?`<div class="gl">${esc(x.day)}</div>`:''; last=x.day;
        return head+`<a class="mi wNt${ntRead.has(x.id)?'':' unread'}" data-id="${x.id}" href="${x.err?'#':W.ntHref(x)}" style="align-items:flex-start;padding:10px">
          <span class="ico" style="width:32px;height:32px;border-radius:9px;background:var(--${x.tone==='blue'?'blue':x.tone}-bg);color:var(--${x.tone==='blue'?'blue':x.tone}-ink);padding:7px">${ntIco[x.ic]||''}</span>
          <span class="t"><b style="display:block;font-size:13.5px;font-weight:650">${esc(x.a)}</b><small style="margin-top:2px;line-height:1.4;color:var(--txt2)">${esc(x.b)}</small><small style="margin-top:4px">${esc(x.m)}</small></span>
          ${ntRead.has(x.id)?'':'<span class="dot blue" style="margin-top:6px"></span>'}</a>`; }).join(''):`<div class="gd" style="padding:18px 10px">${esc(T('No notification.'))}</div>`}</div>
      <div class="sep"></div><a class="mi" href="${W.href('settings',{},'#notifications')}">${W.ic(W.I.settings)}<span class="t">Notification settings</span></a>`;
    const p=W.pop(b,html,{w:400,role:'dialog'}); if(!p) return;
    p.querySelector('#wNtAll').onclick=()=>{ L.forEach(x=>ntRead.add(x.id)); saveNt(); ntBadge(); W.closePop(); };
    p.querySelectorAll('.wNt').forEach(a=>a.onclick=e=>{ const x=L.find(n=>n.id===a.dataset.id); ntRead.add(x.id); saveNt(); ntBadge(); if(x.err){ e.preventDefault(); W.closePop(); W.openErr(); } }); };

  /* ---------- the failed upload, said in plain words ---------- */
  W.openErr=()=>{ const E=D().ERR; if(!E) return; const ER=window.SDW_ERRIC||{};
    W.modal({title:T('Why the analysis failed'),icon:`<span class="ico" style="width:40px;height:40px;border-radius:11px;background:var(--bad-bg);color:var(--bad-ink);padding:9px">${ER['danger-circle']||''}</span>`,
      sub:esc(T(E.reason)),
      body:`<p style="font-size:14px;line-height:1.55;color:var(--txt2)">${esc(E.plain)}</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px">${[['HORSE',E.horse],['UPLOADED',E.when],['VIDEO',`${E.kind} · ${E.dur}`]].map(([k,v])=>`<div style="padding:12px 14px;border-radius:10px;background:var(--card2);border:1px solid var(--line)"><div class="lbl" style="font-size:10.5px">${k}</div><b style="display:block;margin-top:3px;font-size:13.5px">${esc(v)}</b></div>`).join('')}</div>
        <div class="lbl" style="margin-top:22px">HOW TO FIX IT</div>
        <ol style="margin:10px 0 4px 18px;display:grid;gap:8px;font-size:14px;line-height:1.5;color:var(--txt2)">${E.fix.map(f=>`<li>${esc(f)}</li>`).join('')}</ol>`,
      foot:`<button class="btn ghost" id="wErrHelp">Contact support</button><button class="btn" id="wErrNew">${W.ic(W.I.upload)}Upload a new video</button><button class="btn pri" id="wErrRetry">${W.ic(ER.refresh,17)}Try the analysis again</button>`,
      wire:m=>{ m.querySelector('#wErrHelp').onclick=()=>{ W.closeModal(); window.SD_TOAST&&SD_TOAST(T('Support will answer within a day.')); };
        m.querySelector('#wErrNew').onclick=()=>{ W.closeModal(); setTimeout(()=>W.openUpload(),RM()?0:200); };
        m.querySelector('#wErrRetry').onclick=()=>{ W.closeModal(); W.onErrRetry&&W.onErrRetry(); window.SD_TOAST&&SD_TOAST(T('Analysing the round again')); }; } }); };

  /* ---------- Upload video: the whole flow of the phone (upload.js, loaded by every page). o: {kind, onDone} ---------- */
  W.openUpload=(horse,o)=>{ if(typeof window.SDW_UPLOAD_FULL==='function') return SDW_UPLOAD_FULL(Object.assign({horse:typeof horse==='string'?horse:undefined,onDone:W.uploadDone},o||{}));
    return uploadStep1(horse); };
  /* fallback when upload.js is missing: the first step only */
  const uploadStep1=(horse)=>{ const HN=window.SD_HN||(D().HORSES||[]).map(h=>h.n); const ER=window.SDW_ERRIC||{};
    const REQ=[['Frame rate','27 fps min','Best 60 fps'],['Resolution','832 × 464 min','Best 1920 × 1080'],['Length','7 s to 3 min',''],['File size','Up to 500 MB','']];
    let pick=horse||null, file=null;
    const body=()=>`<label class="wDrop" id="wDrop" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:190px;border-radius:14px;border:1.5px dashed var(--line3);background:var(--card2);cursor:pointer;text-align:center;padding:24px;transition:border-color .2s,background .2s">
        <input type="file" accept="video/*" id="wFile" hidden>
        <span class="ico" style="width:46px;height:46px;border-radius:13px;background:var(--blue-bg);color:var(--blue-ink);padding:11px">${ER['upload-minimalistic']||W.I.upload}</span>
        ${file?`<b style="font-size:15px">${esc(file.name)}</b><span class="mut" style="font-size:13px">${(file.size/1048576).toFixed(1)} MB · ${esc(T('Click to change'))}</span>`
          :`<b style="font-size:15px">Drop the video of the round here</b><span class="mut" style="font-size:13px">or click to choose a file · one horse, one round, 7 s to 3 min</span>`}</label>
      <div class="lbl" style="margin-top:20px">HORSE</div>
      <div class="chips" style="margin-top:10px">${HN.map(n=>`<button class="chip${n===pick?' on':''}" data-h="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      <div class="lbl" style="margin-top:20px">WHAT YOUR VIDEO NEEDS</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px">${REQ.map(([a,b,c])=>`<div style="padding:12px;border-radius:10px;border:1px solid var(--line);background:var(--card)"><div style="font-size:12px;color:var(--mut);font-weight:600">${esc(a)}</div><b style="display:block;font-size:13px;margin-top:4px">${esc(b)}</b>${c?`<div style="font-size:11.5px;color:var(--dim);margin-top:1px">${esc(c)}</div>`:''}</div>`).join('')}</div>`;
    const m=W.modal({title:T('Upload video'),sub:esc(T('We check it right away, before anything is sent.')),wide:true,body:body(),
      foot:`<span class="mut" style="font-size:12.5px;margin-right:auto;align-self:center">${esc(T('The next steps (basics, conditions, feeling) come to the computer in the next phase.'))}</span><button class="btn" id="wUpX">Cancel</button><button class="btn pri" id="wUpGo" disabled>Continue</button>`,
      wire:m=>wireUp(m)});
    function wireUp(m){ const B=m.querySelector('.mB');
      const ok=()=>{ m.querySelector('#wUpGo').disabled=!(file&&pick); };
      const rewire=()=>{ B.innerHTML=body(); bind(); ok(); };
      const bind=()=>{ const f=B.querySelector('#wFile'), d=B.querySelector('#wDrop');
        f.onchange=()=>{ if(f.files[0]){ file=f.files[0]; rewire(); } };
        d.ondragover=e=>{ e.preventDefault(); d.style.borderColor='var(--blue)'; d.style.background='var(--blue-bg)'; };
        d.ondragleave=()=>{ d.style.borderColor=''; d.style.background=''; };
        d.ondrop=e=>{ e.preventDefault(); const x=e.dataTransfer.files[0]; if(x){ file=x; rewire(); } };
        B.querySelectorAll('.chip[data-h]').forEach(c=>c.onclick=()=>{ pick=c.dataset.h; rewire(); }); };
      bind(); m.querySelector('#wUpX').onclick=W.closeModal;
      m.querySelector('#wUpGo').onclick=()=>{ W.closeModal(); setTimeout(()=>W.soonModal('Upload video',T('The rest of the upload, then the analysis, arrives with the next phase. On the phone it works today.'),W.mobileHref('home')),RM()?0:200); }; }
    return m; };
  /* a polite "coming next" for an action that is not on the computer yet */
  W.soonModal=(title,text,mobile)=>W.modal({title:T(title),body:`<div class="pill blue" style="margin-bottom:12px">${esc(T('Coming next'))}</div><p style="font-size:14px;line-height:1.55;color:var(--txt2)">${esc(text)}</p>`,
    foot:`<button class="btn" id="wSoX">Close</button>${mobile?`<a class="btn pri" href="${mobile}">${W.ic(W.I.phone)}Open on mobile</a>`:''}`,wire:m=>{ m.querySelector('#wSoX').onclick=W.closeModal; }});

  /* ---------- search: horses, sessions, shows ---------- */
  function searchIndex(){ const d=D(); if(!d.ALL) return {H:[],S:[],V:[]};
    const H=d.ALL.concat(d.personal?d.personal():[]);
    const S=d.sessions(d.ALL).slice(0,400);
    const V={}; S.filter(s=>s.show).forEach(s=>{ const k=s.ven; (V[k]=V[k]||{ven:s.ven,n:0,last:s}).n++; });
    return {H,S,V:Object.values(V)}; }
  const norm=x=>String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  function runSearch(q){ const I=searchIndex(), n=norm(q.trim()); const d=D();
    const H=(n?I.H.filter(h=>norm(h.n+' '+(h.r||'')+' '+(h.breed||'')).includes(n)):I.H).slice(0,5);
    const S=n?I.S.filter(s=>norm(s.h.n+' '+T(s.show?'Show':'Training')+' '+s.what+' '+d.when(s.date)).includes(n)).slice(0,5):I.S.slice(0,4);
    const V=(n?I.V.filter(v=>norm(v.ven).includes(n)):I.V).slice(0,4);
    return {H,S,V}; }
  let kbI=-1;
  function drawSearch(){ const box=document.getElementById('wSearch'), inp=document.getElementById('wQ'), q=inp.value, R=runSearch(q), d=D();
    const row=(href,ava,a,b,em)=>`<a class="mi" href="${href}">${ava}<span class="t"><b style="font-weight:620">${esc(a)}</b><small>${esc(b)}</small></span>${em?`<em>${esc(em)}</em>`:''}</a>`;
    const hRow=h=>row(W.href('horses',{},h.personal?'#v=own':'#h='+h.id),`<span class="hAv sm">${esc(h.ini||h.n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase())}</span>`,h.n,h.r||"",h.perf!=null?h.perf+'%':'');
    const sRow=s=>row(W.href('session',{v:s.key,sc:s.sc}),`<span class="hAv sm" style="border-radius:8px;padding:6px;color:var(--mut)">${W.kindIcon(s.show)}</span>`,s.h.n+' · '+T(s.show?'Show':'Training'),d.when(s.date)+' · '+s.what,s.sc+'%');
    const vRow=v=>`<a class="mi" href="${W.href('sessions',{q:v.ven})}"><span class="hAv sm" style="border-radius:8px;padding:6px;color:var(--mut)">${W.kindIcon(true)}</span><span class="t"><b style="font-weight:620">${esc(v.ven)}</b><small><span>${v.n} ${v.n>1?'shows':'show'}</span> · <span>${esc(d.when(v.last.date))}</span></small></span></a>`;
    const sec=(t,L,f)=>L.length?`<div class="gl">${t}</div>`+L.map(f).join(''):'';
    const html=sec(T('Horses'),R.H,hRow)+sec(T(q.trim()?'Sessions':'Latest sessions'),R.S,sRow)+sec(T('Shows'),R.V,vRow)||`<div class="gd" style="padding:16px 10px">${esc(T('Nothing found for'))} “${esc(q)}”</div>`;
    let p=popEl&&popAnchor===box?popEl:null;
    if(!p){ p=W.pop(box,html,{w:Math.max(box.offsetWidth,420),align:'left',role:'listbox',keep:true}); } else p.innerHTML=html;
    kbI=-1; }
  function wireSearch(){ const inp=document.getElementById('wQ'), box=document.getElementById('wSearch'); if(!inp) return;
    inp.onfocus=()=>{ box.classList.add('on'); drawSearch(); }; inp.onblur=()=>box.classList.remove('on');
    inp.oninput=drawSearch;
    inp.onkeydown=e=>{ if(!popEl) return; const L=[...popEl.querySelectorAll('a.mi')]; if(!L.length) return;
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); kbI=(kbI+(e.key==='ArrowDown'?1:-1)+L.length)%L.length; L.forEach((a,i)=>a.classList.toggle('kb',i===kbI)); L[kbI].scrollIntoView({block:'nearest'}); }
      if(e.key==='Enter'){ e.preventDefault(); location.href=(L[kbI]||L[0]).href; } if(e.key==='Escape'){ inp.blur(); W.closePop(); } };
    document.addEventListener('keydown',e=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'||(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName))){ e.preventDefault(); inp.focus(); inp.select(); } }); }

  /* ---------- wiring ---------- */
  function wire(){
    const $=id=>document.getElementById(id);
    $('wAcct').onclick=()=>{ const b=$('wAcct');
      const p=W.pop(b,W.ACCOUNTS.map(g=>`<div class="gl">${esc(T(g.g))}</div>`+g.items.map(([k,n,price,who])=>`<button class="mi${k===ACC?' on':''}" data-k="${k}"><span class="t">${esc(T(n))}${price?` <span class="mut" style="font-weight:500;font-size:12px">${esc(T(price))}</span>`:''}<small>${esc(T(who))}</small></span><span class="ico ck">${W.I.check}</span></button>`).join('')).join('')
        +`<div class="sep"></div><div class="gd" style="padding:4px 10px 6px">${esc(T('Demo with sample data. Switching keeps you on this page.'))}</div>`,{w:320,align:'left'});
      if(p) p.querySelectorAll('.mi[data-k]').forEach(m=>m.onclick=()=>{ W.closePop(); if(m.dataset.k===ACC) return; const u=new URL(location.href); u.searchParams.set('plan',m.dataset.k); u.searchParams.delete('demo'); location.href=u.toString(); }); };
    $('wLang').onclick=()=>{ const b=$('wLang'); const p=W.pop(b,(window.SD_LANGS||[['en','English']]).map(([c,n])=>`<button class="mi${c===(window.SD_LANG||'en')?' on':''}" data-c="${c}" translate="no"><span class="t">${esc(n)}</span><span class="ico ck">${W.I.check}</span></button>`).join(''),{w:200});
      if(p) p.querySelectorAll('.mi').forEach(m=>m.onclick=()=>{ W.closePop(); if(window.setLang) setLang(m.dataset.c); }); };
    $('wTheme').onclick=()=>{ const light=document.documentElement.dataset.theme!=='light'; try{ localStorage.setItem('sdTheme',light?'light':'dark'); }catch(e){}
      document.documentElement.dataset.theme=light?'light':'dark'; const b=$('wTheme'); b.innerHTML=W.ic(light?W.I.moon:W.I.sun); b.dataset.tip=light?'Dark mode':'Light mode'; tipHide(); W.onTheme&&W.onTheme(); };
    $('wBell').onclick=()=>openBell($('wBell')); ntBadge();
    /* who is signed in: profile, settings, log out (back to the Log in of the sign-up page) */
    $('wMe').onclick=()=>{ const b=$('wMe'); const p=W.pop(b,`<div class="gl" translate="no">${esc(W.me.full)}</div>${PL.email||(window.SD_ME&&SD_ME.email)?`<div class="gd" translate="no">${esc((window.SD_ME&&SD_ME.email)||PL.email)}</div>`:''}
        <a class="mi" href="${W.href('profile')}">${W.ic(W.I.profile)}<span class="t">Profile</span></a><a class="mi" href="${W.href('settings',{},'#settings')}">${W.ic(W.I.settings)}<span class="t">Settings</span></a>
        <div class="sep"></div><a class="mi red" id="wOut" href="${W.href('signup',{login:1})}">${W.ic(W.I.logout)}<span class="t">Log out</span></a>`,{w:224,align:'left'}); };
    $('wUpload').onclick=()=>W.openUpload();
    wireSearch();
  }
})();
