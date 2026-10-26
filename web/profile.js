/* StrydeUp desktop web app, Profile & Settings.
   The phone's Profile (Etape 5), laid out for a computer: the sections on the left, the chosen one on the right.
   Profile (identity, job, demo account type), Plan & billing (the plan card of each account and the client's v2 plans),
   Stables (the owner's team and owners, a professional's stables and Join a stable), Preferences (appearance, language,
   units), Notifications, Security, Help.
   Deep links: ?s=<section>, or #settings (Preferences), #notifications, #plans (the plans dialog), #security, #help.
   Language and appearance use the same keys as the phone ('sdLang', 'sdTheme'), so every page follows. */
(function(){
  const W=window.SDW, D=window.SD_DATA, T=W.T, esc=W.esc, I=W.I;
  const PLAN=W.PLAN, ACC=W.ACC, STAFF=PLAN==='vet', MULTI=!!window.SD_MULTI, OWNER=PLAN==='owner', RIDER=PLAN==='rider';
  const SOLO=['pro','premium','owner'].includes(PLAN);
  const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page=document.getElementById('wPage');
  const LS=(k,d)=>{ try{ const v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } };
  const LSW=(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
  const toast=m=>window.SD_TOAST&&SD_TOAST(T(m));
  const L=(d,sw)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw||1.6}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC={
    crown:L('<path d="M4 17.5h16M5 17.5 3.5 8l5 3.5L12 5l3.5 6.5 5-3.5-1.5 9.5"/>'),
    shield:L('<path d="M12 3.2 5 6v5.6c0 4.3 2.9 7.6 7 9.2 4.1-1.6 7-4.9 7-9.2V6z"/><rect x="9.3" y="10.6" width="5.4" height="4.4" rx="1"/><path d="M10.3 10.6V9.4a1.7 1.7 0 0 1 3.4 0v1.2"/>'),
    help:L('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6"/><circle cx="12" cy="16.9" r=".6" fill="currentColor" stroke="none"/>'),
    pen:L('<path d="M15.6 5.2l3.2 3.2M4.5 19.5l.8-4 10.3-10.3a2.26 2.26 0 0 1 3.2 3.2L8.5 18.7z"/>'),
    out:L('<path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14"/><path d="M10 16.5 5.5 12 10 7.5M5.5 12H15"/>'),
    trash:L('<path d="M4.5 7h15M9.5 7V5.2c0-.7.5-1.2 1.2-1.2h2.6c.7 0 1.2.5 1.2 1.2V7M6.5 7l.8 11.6c.1 1 .9 1.9 2 1.9h5.4c1.1 0 1.9-.8 2-1.9L17.5 7"/>'),
    card:L('<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 14.5h3"/>'),
    users:L('<circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.9-3.3 3.3-5.1 6.2-5.1s5.3 1.8 6.2 5.1"/><path d="M15.5 4.9a3.4 3.4 0 0 1 0 6.3M17.6 14.6c1.8.7 3.1 2.4 3.6 4.9"/>'),
    key:L('<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.7-8.7M16.5 6.5l2.5 2.5M14 9l2 2"/>'),
    face:L('<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 9.5v1M15 9.5v1M12 9.5v3.5h-1M9.5 15.5c1.4 1.2 3.6 1.2 5 0"/>'),
    lock:L('<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.5" r="1.2"/>'),
    laptop:L('<rect x="4.5" y="5" width="15" height="10.5" rx="1.6"/><path d="M2.5 19h19"/>'),
    phone:I.phone,
    tablet:L('<rect x="5" y="3" width="14" height="18" rx="2.4"/><path d="M11 18h2"/>'),
    download:L('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>'),
    eye:L('<path d="M2.8 12s3.3-6.2 9.2-6.2 9.2 6.2 9.2 6.2-3.3 6.2-9.2 6.2S2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.8"/>'),
    chat:L('<path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l.9-4.3A8 8 0 1 1 20 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" stroke-width="2.2"/>'),
    doc:L('<path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z"/><path d="M14 3.5V8h4.5M9 12.5h6M9 16h4"/>'),
    ext:L('<path d="M13.5 5H19v5.5M19 5l-8 8M17 14v4a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 18V8.5A1.5 1.5 0 0 1 6.5 7h4"/>',1.7),
    bulb:L('<path d="M9 17.5h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'),
    video:L('<rect x="3" y="6.5" width="13" height="11" rx="3"/><path d="m16 10.5 5-3v9l-5-3"/>'),
    ruler:L('<path d="M3.5 15.5 15.5 3.5l5 5-12 12z"/><path d="m7 12 1.8 1.8M10 9l1.8 1.8M13 6l1.8 1.8"/>'),
    wifi:L('<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.6 15.5a5 5 0 0 1 6.8 0"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>'),
    code:L('<rect x="3.5" y="6" width="17" height="12" rx="2.5"/><path d="M7.5 10.5h.01M10.5 10.5h.01M13.5 10.5h.01M16.5 10.5h.01M8 14h8" stroke-width="2"/>'),
    stable:I.stable, bell:I.bell, sliders:I.sliders, profile:I.profile, check:I.check, chevR:I.chevR};
  const chev=`<span class="ico chv">${I.chevR}</span>`;
  const tgl=(k,on,label)=>`<button class="tgl${on?' on':''}" role="switch" aria-checked="${!!on}" aria-label="${esc(label||'Toggle')}" data-t="${k}"></button>`;

  /* ---------- who is signed in (the same person as on the phone) ---------- */
  const PL=(window.SD_PLANS||{})[PLAN]||{};
  const full0=RIDER||STAFF?(PL.full||(RIDER?'John Doe':'')):(W.me.full||'Marie S.');
  const ME={first:full0.replace(/ [^ ]+$/,'')||full0, last:/ /.test(full0)?full0.split(' ').pop():'', email:(RIDER||STAFF?PL.email:null)||'marie@stable.com', fei:'10123456'};
  if(window.SD_ME&&SD_ME.email) ME.email=SD_ME.email;
  const fullName=()=>(ME.first+' '+ME.last).trim();
  const iniMe=()=>(ME.first.replace(/^Dr\.\s*/,'')[0]||'M').toUpperCase();
  const badge=()=>`<span class="wBadge" translate="no">${(window.SD_PLAN_ICO||{})[ACC]||''}${esc(T(W.me.badge))}</span>`;

  /* ---------- preferences, kept on this computer ---------- */
  const PREF=Object.assign({units:'Metric',notifReady:true,notifAlerts:true,wifi:true,faceid:true,twofa:false},LS('sdPrefs',{}));
  const savePref=()=>LSW('sdPrefs',PREF);
  const theme=()=>{ try{ return localStorage.getItem('sdTheme')||'dark'; }catch(e){ return 'dark'; } };
  const sysLight=matchMedia('(prefers-color-scheme: light)');
  function setTheme(t){ try{ localStorage.setItem('sdTheme',t); }catch(e){}
    const r=t==='system'?(sysLight.matches?'light':'dark'):t; document.documentElement.dataset.theme=r;
    const b=document.getElementById('wTheme'); if(b){ b.innerHTML=W.ic(r==='light'?I.moon:I.sun); b.dataset.tip=r==='light'?'Dark mode':'Light mode'; } }
  sysLight.addEventListener&&sysLight.addEventListener('change',()=>{ if(theme()==='system') setTheme('system'); });

  /* ---------- the sections ---------- */
  const hasStables=!['pro','premium'].includes(PLAN);
  const SECS=[['Account'],['profile','Profile',IC.profile],['plan','Plan & billing',IC.crown],...(hasStables?[['stables',MULTI?'Stables':'Your stable',IC.stable]]:[]),
    ['Settings'],['preferences','Preferences',IC.sliders],['notifications','Notifications',IC.bell],['security','Security',IC.shield],['Support'],['help','Help',IC.help]];
  const KEYS=SECS.filter(s=>s.length>1).map(s=>s[0]);
  const fromHash={settings:'preferences',plans:'plan',billing:'plan',team:'stables'};
  const pick=()=>{ const q=new URLSearchParams(location.search).get('s'), h=location.hash.slice(1).split('&')[0];
    const k=fromHash[h]||h; if(KEYS.includes(k)) return k; if(KEYS.includes(q)) return q; return 'profile'; };
  let cur=pick();
  const isSet=s=>['preferences','notifications'].includes(s);
  const STR={}; /* the drawers of each section */

  page.innerHTML=`<div class="acc"><nav class="accNav" aria-label="Profile and settings">
      <div class="accWho"><span class="wAv" id="aAv">${esc(iniMe())}</span><div class="t"><b id="aNm" translate="no">${esc(fullName())}</b><small>${esc(W.roleLine())}</small></div></div>
      ${SECS.map(s=>s.length===1?`<div class="grp">${s[0]}</div>`:`<button data-s="${s[0]}">${W.ic(s[2])}<span>${s[1]}</span></button>`).join('')}
    </nav><div class="accBody" id="accB" aria-live="polite"></div></div>`;
  const B=document.getElementById('accB');
  page.querySelectorAll('.accNav button').forEach(b=>b.onclick=()=>go(b.dataset.s));

  function go(s,o){ o=o||{}; if(!KEYS.includes(s)) s='profile'; cur=s;
    page.querySelectorAll('.accNav button').forEach(b=>{ const on=b.dataset.s===s; b.classList.toggle('on',on); if(on) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
    const u=new URL(location.href); u.searchParams.set('s',s); u.hash=''; try{ history.replaceState(null,'',u.toString()); }catch(e){}
    /* the sidebar and the top bar: Profile or Settings */
    const st=isSet(s), h1=document.querySelector('.wTop h1'); if(h1) h1.textContent=T(st?'Settings':'Profile');
    document.querySelectorAll('.wSide .wNav a').forEach(a=>{ const hr=a.getAttribute('href')||''; if(!/profile\.html/.test(hr)) return; a.classList.toggle('on',/#settings/.test(hr)===st); });
    document.title='StrydeUp · '+T(SECS.find(x=>x[0]===s)[1]);
    STR[s]();
    B.classList.remove('accIn'); void B.offsetWidth; B.classList.add('accIn');
    if(!o.keepScroll) scrollTo({top:0,behavior:'auto'}); }
  const head=(t,p,r)=>`<div class="secH" style="display:flex;align-items:flex-end;gap:16px"><div style="flex:1;min-width:0"><h2>${t}</h2>${p?`<p>${p}</p>`:''}</div>${r||''}</div>`;
  const wire=(sel,fn)=>B.querySelectorAll(sel).forEach(fn);
  const $=id=>document.getElementById(id);

  /* ====================== PROFILE ====================== */
  STR.profile=()=>{ const job=window.SD_JOB&&(window.SD_JOBS||[]).includes(SD_JOB);
    B.innerHTML=head('Profile','Your name and email, on your badge and for the people you work with.')+`
      <section class="set idC"><span class="idAv">${esc(iniMe())}</span><div class="t"><div class="n" translate="no">${esc(fullName())}</div><div class="e" translate="no">${esc(ME.email)}</div>
        <div class="bd">${badge()}<span>${esc(W.roleLine())}</span></div></div><button class="btn" id="edP">${W.ic(IC.pen)}<span>Edit profile</span></button></section>
      <section class="set"><div class="setH"><div class="t"><h3>Personal info</h3><p>Shown to the people you work with.</p></div><div class="r"><button class="btn sm" id="edP2">Edit</button></div></div>
        <div class="kv"><div><span>FIRST NAME</span><b translate="no">${esc(ME.first)}</b></div><div><span>LAST NAME</span><b translate="no">${esc(ME.last||'')}</b></div>
          <div><span>EMAIL</span><b translate="no">${esc(ME.email)}</b></div><div><span>FEI ID (OPTIONAL)</span>${ME.fei?`<b class="num">${esc(ME.fei)}</b>`:`<b class="none">Not added</b>`}</div></div></section>
      ${job?`<section class="set"><div class="setH"><div class="t"><h3>Your job</h3><p>On your badge and for the stables you work with</p></div></div>
        <div style="padding:0 20px 18px"><div class="seg" role="radiogroup" aria-label="Your job">${SD_JOBS.map(j=>`<button role="radio" aria-checked="${j===SD_JOB}" class="${j===SD_JOB?'on':''}" data-job="${j}">${j}</button>`).join('')}</div></div></section>`:''}
      <div class="setL">DEMO</div>
      <section class="set"><button class="row" id="acT"><span class="ri">${W.ic(I.swap)}</span><span class="t"><b>Account type</b><span>To preview each plan</span></span><span class="v">${esc(T((SD_PLANS[ACC]||{}).name||''))}</span>${chev}</button></section>
      <section class="set" style="margin-top:18px"><button class="row" id="sgO"><span class="ri">${W.ic(IC.out)}</span><span class="t"><b>Log out</b><span>On this computer</span></span></button>
        <button class="row red" id="dlA"><span class="ri">${W.ic(IC.trash)}</span><span class="t"><b>Delete my account</b><span>Your horses, sessions and scores are deleted for good.</span></span></button></section>
      <div class="foot"><span>StrydeUp 3.0 · build 412</span></div>`;
    $('edP').onclick=$('edP2').onclick=openEdit;
    wire('.seg [data-job]',b=>b.onclick=()=>{ if(b.dataset.job===SD_JOB) return; SD_SET_JOB(b.dataset.job); location.reload(); });
    $('acT').onclick=openAccount;
    $('sgO').onclick=()=>confirm('Log out of StrydeUp?','You can log in again with your email.','Log out',false,()=>{ location.href=W.href('signup',{login:1}); });   /* as the menu of the sidebar */
    $('dlA').onclick=()=>confirm('Delete your account?','Your horses, sessions and scores are deleted for good. This cannot be undone.','Delete my account',true,()=>toast('Demo: nothing was deleted.')); };
  function confirm(title,sub,ok,red,fn){ W.modal({title:T(title),sub:esc(T(sub)),
    icon:red?`<span class="ico" style="width:40px;height:40px;border-radius:11px;background:var(--bad-bg);color:var(--bad-ink);padding:9px">${IC.trash}</span>`:'',
    foot:`<button class="btn" id="cfX">Cancel</button><button class="btn ${red?'red':'pri'}" id="cfOk">${esc(ok)}</button>`,
    wire:m=>{ m.querySelector('#cfX').onclick=W.closeModal; m.querySelector('#cfOk').onclick=()=>{ W.closeModal(); fn&&fn(); }; } }); }
  function openEdit(){ W.modal({title:T('Edit profile'),
    body:`<div class="ivG"><div class="fld"><label for="fN">FIRST NAME</label><input class="inp" id="fN" autocomplete="given-name" value="${esc(ME.first)}" autofocus></div>
        <div class="fld"><label for="fL">LAST NAME</label><input class="inp" id="fL" autocomplete="family-name" value="${esc(ME.last)}"></div></div>
      <div class="fld" style="margin-top:14px"><label for="fE">EMAIL</label><input class="inp" id="fE" type="email" autocomplete="email" value="${esc(ME.email)}"></div>
      <div class="fld" style="margin-top:14px"><label for="fF">FEI ID (OPTIONAL)</label><input class="inp" id="fF" inputmode="numeric" value="${esc(ME.fei)}"></div>`,
    foot:`<button class="btn" id="edX">Cancel</button><button class="btn pri" id="edS">Save</button>`,
    wire:m=>{ m.querySelector('#edX').onclick=W.closeModal; const v=id=>m.querySelector(id).value.trim();
      const save=()=>{ ME.first=v('#fN')||ME.first; ME.last=v('#fL'); ME.email=v('#fE')||ME.email; ME.fei=v('#fF'); W.closeModal();
        $('aNm').textContent=fullName(); $('aAv').textContent=iniMe(); const sb=document.querySelector('#wMe b'), sa=document.querySelector('#wMe .wAv');
        if(sb) sb.textContent=fullName(); if(sa) sa.textContent=iniMe(); go('profile',{keepScroll:true}); toast('Saved'); };
      m.querySelector('#edS').onclick=save; m.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.tagName==='INPUT') save(); }); } }); }
  /* the demo's account types, same list and words as the account switch of the sidebar */
  function openAccount(){ W.modal({title:T('Account type'),sub:esc(T('To preview each plan')),
    body:`<div class="pk">${W.ACCOUNTS.map(g=>`<div class="gl">${g.g}</div>`+g.items.map(([k,n,price,who])=>`<button class="${k===ACC?'on':''}" data-k="${k}"><span class="t"><b>${n}${price?` <span class="mut" style="font-weight:500;font-size:12.5px">${esc(price)}</span>`:''}</b><small>${who}</small></span><span class="ico ck">${I.check}</span></button>`).join('')).join('')}</div>`,
    wire:m=>m.querySelectorAll('.pk button').forEach(b=>b.onclick=()=>{ W.closeModal(); if(b.dataset.k===ACC) return; const u=new URL(location.href); u.searchParams.set('plan',b.dataset.k); u.searchParams.delete('demo'); location.href=u.toString(); }) }); }

  /* ====================== PLAN & BILLING ====================== */
  const OFFERS=window.SD_OFFERS||[];
  const PRICING='https://www.strydeup.com/pricing';
  const offer=k=>OFFERS.find(o=>o.k===k)||{};
  const teamCount=()=>window.SDTeam?SDTeam.people().filter(p=>!p.me&&p.grp!=='owners'&&p.st!=='invited').length:5;
  STR.plan=()=>{ const all=D.ALL, vids=D.sessions(all).length, ICO=window.SD_PLAN_ICO||{};
    let ico=ICO[PLAN]||IC.stable, k='YOUR PLAN', name, sub='Renews 30 Oct 2026', desc, use, btns=SOLO;
    if(PLAN==='pro'){ name='StrydeUp Pro'; desc='One user. Unlimited horses.'; use=[['HORSES',all.length],['SESSIONS',vids],['MEMBER SINCE','Mar 2026']]; }
    if(PLAN==='premium'){ name='StrydeUp Premium'; desc='One user. One horse.'; use=[['HORSE',(all[0]||{}).n||'–'],['VIDEOS',vids],['MEMBER SINCE','Mar 2026']]; }
    if(OWNER){ name='StrydeUp Stable Account'; desc='You run the stable: every rider, every horse, every video.'; use=[['TEAM',teamCount()],['HORSES',all.length],['VIDEOS',vids]]; }
    if(STAFF){ k='YOUR ACCESS'; ico=IC.stable; name=MULTI?`${SD_STABLES.length} stables`:window.SD_STABLE; sub=PL.role||'';
      desc=MULTI?'Your access is given and paid by each stable.':'Your access is given and paid by the stable.';
      use=[['HORSES',SD_FOLLOW().length+(window.SD_XH||[]).length],['VIDEOS',vids],['SINCE',{vet:'Jun 2026',farrier:'Feb 2026',trainer:'Mar 2026'}[ACC]||'Jun 2026']]; }
    if(RIDER){ k='YOUR ACCESS'; ico=IC.stable; name=window.SD_STABLE; sub=window.SD_AS?SD_PLANS.rider.role:'Rider'; desc='Your access is given and paid by the stable.';
      use=[['HORSES',all.length],['VIDEOS',vids],['SINCE',{groom:'Apr 2026',horseowner:'May 2026'}[window.SD_AS]||'Apr 2026']]; }
    /* just signed up: the 30 days of the free trial, counted down */
    const tr=window.SD_ME&&SD_ME.trial; let trial=false;
    if(tr&&SOLO){ const left=Math.max(0,(tr.days||30)-Math.floor((Date.now()-tr.start)/864e5)); sub=`Free trial · ${left} ${left===1?'day':'days'} left`; trial=true; }
    B.innerHTML=head('Plan &amp; billing',SOLO?'Your plan, what it gives you and how it is billed.':'Your access to StrydeUp and who pays for it.')+`
      <section class="set plC"><div class="plTop"><span class="plIco">${ico}</span><div class="t"><div class="lbl">${k}</div><div class="n" translate="${STAFF||RIDER?'no':'yes'}">${esc(name)}</div>
          <div style="display:flex;gap:8px;align-items:center;margin-top:6px;flex-wrap:wrap"><span class="pill ${trial?'blue':''}">${esc(sub)}</span></div><div class="d">${desc}</div></div>
        ${btns?`<div class="r"><button class="btn" id="plCmp">Compare plans</button><button class="btn pri" id="plMan">Manage plan</button></div>`:''}</div>
        <div class="plUse">${use.map(([a,b])=>`<div><span class="lbl">${a}</span><b class="num" translate="no">${esc(b)}</b></div>`).join('')}</div></section>
      ${PLAN==='pro'||PLAN==='premium'?`<section class="set"><div class="setH"><div class="t"><h3>Billing</h3></div></div>
          <div class="row"><span class="ri">${W.ic(IC.card)}</span><span class="t"><b>Billed by the App Store</b><span>Your plan is managed by the App Store. Go to your iPhone Settings, your name, Subscriptions, StrydeUp.</span></span></div>
          <button class="row" id="plAll"><span class="ri">${W.ic(IC.crown)}</span><span class="t"><b>Compare plans</b><span>Premium, Pro and Stable Account, side by side</span></span>${chev}</button></section>`:''}
      ${OWNER?`<section class="set"><div class="setH"><div class="t"><h3>Billing</h3></div></div>
          <div class="row"><span class="ri">${W.ic(IC.users)}</span><span class="t"><b>Users</b><span>2 users included, then $109/month per additional user</span></span><span class="v num">${teamCount()+1}</span></div>
          <a class="row" href="${PRICING}" target="_blank" rel="noopener"><span class="ri">${W.ic(IC.card)}</span><span class="t"><b>Billed on strydeup.com</b><span>The Stable Account is managed on the StrydeUp website.</span></span><span class="ico ext">${IC.ext}</span></a></section>`:''}
      ${!SOLO?`<section class="set"><div class="row"><span class="ri lg">${MULTI?SD_STABLES.length:'É'}</span><span class="t"><b>${MULTI?'Paid by each stable':'Paid by the stable'}</b><span>Nothing to pay on your side. The stable gives you access to its horses.</span></span></div></section>`:''}`;
    if($('plCmp')){ $('plCmp').onclick=openPlans; $('plMan').onclick=openPlans; } if($('plAll')) $('plAll').onclick=openPlans; };
  /* the plans: one source in plan.js (SD_OFFERS), the client's v2 words, the plan of this account outlined */
  function openPlans(){ const cur0=OFFERS.some(o=>o.k===PLAN)?PLAN:'pro', ICO=window.SD_PLAN_ICO||{};
    const m=W.modal({title:T('Plans'),sub:esc(T('Pick the plan that fits how you ride.')),
      body:`<div class="plG">${OFFERS.map(p=>{ const cur=p.k===cur0;
        return `<div class="plX${cur?' cur':''}">${cur?'<span class="bdg">Your plan</span>':p.tag?`<span class="bdg">${p.tag}</span>`:''}
          <div class="h">${ICO[p.k]||''}<span>${p.n}</span></div><div class="pr"><span class="num">$${p.m}</span><small>/month</small></div>
          <div class="who">${p.who}</div>${cur?'':'<span class="pill trP">30 days free</span>'}
          <ul>${p.f.map(x=>`<li>${x}</li>`).join('')}</ul>
          ${p.ideal?`<div class="ideal"><b>Ideal for:</b> <span>${p.ideal}</span></div>`:''}
          ${cur?`<button class="btn" data-man="${p.k}">Manage ${p.n}</button><div class="then"></div>`
            :`<button class="btn pri" data-try="${p.k}">Start 30-day free trial</button><div class="then"><span>Then $${p.m}/month.</span> <span>Cancel anytime before the trial ends.</span></div>`}</div>`; }).join('')}</div>`,
      wire:m=>{ m.classList.add('plans');
        m.querySelectorAll('[data-try]').forEach(b=>b.onclick=()=>{ if(b.dataset.try==='owner'){ window.open(PRICING,'_blank','noopener'); return; } W.closeModal(); toast('Open StrydeUp on your iPhone to start the trial.'); });
        m.querySelectorAll('[data-man]').forEach(b=>b.onclick=()=>{ if(b.dataset.man==='owner'){ window.open(PRICING,'_blank','noopener'); return; } W.closeModal(); setTimeout(()=>W.modal({title:T('Manage your plan'),
          body:`<p style="font-size:14px;line-height:1.6;color:var(--txt2)">Your plan is managed by the App Store. Go to your iPhone Settings, your name, Subscriptions, StrydeUp.</p>`,
          foot:`<button class="btn pri" id="mpOk">Got it</button>`,wire:x=>{ x.querySelector('#mpOk').onclick=W.closeModal; }}),RM()?0:200); }); } });
    return m; }

  /* ====================== STABLES ====================== */
  STR.stables=()=>{
    if(OWNER){ const P=SDTeam.people(), team=P.filter(p=>p.grp!=='owners'), own=P.filter(p=>p.grp==='owners'), wk=D.sessions(D.ALL).filter(x=>(D.TODAY-x.date)/864e5<7).length;
      const row=p=>`<button class="row" data-p="${esc(p.id)}">${SDTeam.avatar(p)}<span class="t"><b translate="no">${esc(p.n)}</b><span><span>${esc(SDTeam.roleLabel(p))}</span> · ${SDTeam.horsesTxt(p.hs)}</span></span>${SDTeam.statusPill(p)}${chev}</button>`;
      B.innerHTML=head('Your stable','The stable you run, its team and the owners of its horses.',`<a class="btn" href="${W.href('team')}">${W.ic(I.team)}<span>Open the team</span></a>`)+`
        <section class="set"><div class="row" style="min-height:76px"><span class="hLogo">É</span><span class="t"><span class="lbl" style="display:block">YOUR STABLE</span><b translate="no" style="font-size:16px;margin-top:2px">${esc(window.SD_STABLE)}</b></span>
          <div class="hStats" style="border-left:1px solid var(--line)"><a href="${W.href('team')}"><span class="lbl">TEAM</span><b class="num">${team.length}</b><small>people</small></a><a href="${W.href('horses')}"><span class="lbl">HORSES</span><b class="num">${D.ALL.length}</b><small>in the stable</small></a><a href="${W.href('sessions')}"><span class="lbl">THIS WEEK</span><b class="num">${wk}</b><small>videos</small></a></div></div></section>
        <section class="set"><div class="setH"><div class="t"><h3><span>Team &amp; access</span> <em class="num">${team.length}</em></h3><p>Each person sees only the horses you give them.</p></div><div class="r"><button class="btn sm pri" id="stInv">${W.ic(IC.users)}<span>Invite someone</span></button></div></div>
          ${team.map(row).join('')}</section>
        <section class="set"><div class="setH"><div class="t"><h3><span>Owners</span> <em class="num">${own.length}</em></h3><p>The private owners of the horses. They see the horses they own: sessions and scores.</p></div></div>
          ${own.map(row).join('')}<button class="row" id="stOwn"><span class="hAv inv" style="color:var(--blue-ink);font-size:17px;font-weight:500">+</span><span class="t"><b>Add the owner of a horse</b><span>They get their own access, with their horses only.</span></span>${chev}</button></section>`;
      wire('.row[data-p]',b=>b.onclick=()=>SDTeam.openPerson(b.dataset.p));
      $('stInv').onclick=()=>SDTeam.openInvite(); $('stOwn').onclick=()=>SDTeam.openInvite(null,'Horse Owner');
      return; }
    const word=window.SD_JOB==='Trainer'?'you train here':'you are its '+(window.SD_JOB_WORD||'vet');
    const nH=n=>`${n} ${n===1?'horse':'horses'}`;
    const join=PLAN==='vet'?`<button class="row" id="stJoin"><span class="ri">${W.ic(IC.code)}</span><span class="t"><b>Join a stable</b><span>Enter the invite code the stable gave you</span></span>${chev}</button>`:'';
    if(MULTI){ B.innerHTML=head('Your stables','The stables you work with. Each one gives you access to the horses it shares with you.')+`
        <section class="set">${SD_STABLES.map(s=>{ const n=s.id==='ms'?SD_FOLLOW().filter(i=>!window.SD_MYIDS||SD_MYIDS.includes(i)).length:(window.SD_XH||[]).filter(h=>h.st===s.id).length;
          return `<div class="row"><span class="ri lg">${esc(s.ini)}</span><span class="t"><b translate="no">${esc(s.n)}</b><span>Managed by ${esc(s.mgr)} · ${word}</span></span><span class="v">${nH(n)}</span></div>`; }).join('')}${join}</section>`; }
    else { const line=STAFF?'Managed by Marie S. · '+(PLAN==='vet'?word:'you are its farrier'):'Managed by Marie S. · '+(({groom:'you are its groom',trainer:'you train here',horseowner:'2 of your horses live here'})[window.SD_AS]||'you ride 2 horses');
      B.innerHTML=head('Your stable','The stable that gives you access to its horses.')+`
        <section class="set"><div class="row" style="min-height:72px"><span class="ri lg" style="width:44px;height:44px;border-radius:12px;font-size:17px">É</span><span class="t"><b translate="no" style="font-size:15px">${esc(window.SD_STABLE)}</b><span>${esc(SD_OWNERIZE(line))}</span></span><span class="v">${nH(D.ALL.filter(h=>!h.st||h.st==='ms').length)}</span></div>${join}</section>`; }
    if($('stJoin')) $('stJoin').onclick=openJoin; };
  /* a professional joins one more stable with its invite code (the request is sent, the stable confirms) */
  function openJoin(){ const ok=v=>v.replace(/[^A-Z0-9]/gi,'').length>=6;
    W.modal({title:T('Join a stable'),sub:esc(T('Ask the stable for its invite code. Once they accept, you see the horses they share with you.')),
      icon:`<span class="ico" style="width:40px;height:40px;border-radius:11px;background:var(--blue-bg);color:var(--blue-ink);padding:9px">${IC.stable}</span>`,
      body:`<div class="fld"><label for="jsC">INVITE CODE</label><input class="inp code" id="jsC" autocomplete="off" spellcheck="false" maxlength="12" placeholder="STB-482915" autofocus></div>`,
      foot:`<button class="btn" id="jsX">Cancel</button><button class="btn pri" id="jsGo" disabled>Join</button>`,
      wire:m=>{ const c=m.querySelector('#jsC'), b=m.querySelector('#jsGo'); c.oninput=()=>{ c.value=c.value.toUpperCase(); b.disabled=!ok(c.value); };
        m.querySelector('#jsX').onclick=W.closeModal; const go=()=>{ if(!ok(c.value)) return; W.closeModal(); toast('Request sent. The stable will confirm.'); };
        b.onclick=go; c.onkeydown=e=>{ if(e.key==='Enter') go(); }; } }); }
  if(window.SDTeam) SDTeam.onChange=()=>{ if(cur==='stables') go('stables',{keepScroll:true}); };

  /* ====================== PREFERENCES ====================== */
  const THEMES=[['dark','Dark','pvD'],['light','Light','pvL'],['system','Same as my computer','pvS']];
  const pv=c=>c==='pvS'?`<div class="pv pvS"><div class="half pvD"><div class="s"><i class="b"></i><i></i><i></i></div><div class="m"><i style="width:60%"></i><div class="c"></div></div></div><div class="half pvL"><div class="m"><i style="width:40%"></i><div class="c"></div></div></div></div>`
    :`<div class="pv ${c}"><div class="s"><i class="b"></i><i></i><i></i><i></i></div><div class="m"><i style="width:55%"></i><div style="display:flex;gap:5px;flex:1"><div class="c"></div><div class="c"></div></div></div></div>`;
  const LANG_CODE={en:'EN',fr:'FR',it:'IT',es:'ES',de:'DE'};
  STR.preferences=()=>{ const t=theme();
    B.innerHTML=head('Preferences','How StrydeUp looks and reads.')+`
      <section class="set"><div class="setH"><div class="t"><h3>Appearance</h3><p>Dark is the default. Same as my computer follows the setting of your computer.</p></div></div>
        <div class="thG" role="radiogroup" aria-label="Appearance">${THEMES.map(([k,l,c])=>`<button class="thT${k===t?' on':''}" role="radio" aria-checked="${k===t}" data-th="${k}">${pv(c)}<span class="lb"><span>${l}</span><span class="ck">${I.check}</span></span></button>`).join('')}</div></section>
      <section class="set"><div class="setH"><div class="t"><h3>Language</h3><p>The whole app, in the language you pick.</p></div></div>
        <div class="lgL" role="radiogroup" aria-label="Language">${(window.SD_LANGS||[['en','English']]).map(([c,n])=>`<button class="lgB${c===(window.SD_LANG||'en')?' on':''}" role="radio" aria-checked="${c===(window.SD_LANG||'en')}" data-lg="${c}" translate="no"><b>${esc(n)}</b><small>${LANG_CODE[c]||c.toUpperCase()}</small></button>`).join('')}</div></section>
      <section class="set"><div class="row"><span class="ri">${W.ic(IC.ruler)}</span><span class="t"><b>Units</b><span>Distances, heights and speeds</span></span>
        <div class="seg" role="radiogroup" aria-label="Units">${['Metric','Imperial'].map(u=>`<button role="radio" aria-checked="${PREF.units===u}" class="${PREF.units===u?'on':''}" data-u="${u}">${u}</button>`).join('')}</div></div></section>
      <div class="setL">RECORDING</div>
      <section class="set"><div class="row"><span class="ri">${W.ic(IC.wifi)}</span><span class="t"><b>Upload on Wi-Fi only</b><span>Saves your mobile data. On the phone app.</span></span>${tgl('wifi',PREF.wifi,'Upload on Wi-Fi only')}</div>
        <button class="row" id="pfFilm"><span class="ri">${W.ic(IC.bulb)}</span><span class="t"><b>How to film a good session</b><span>Where to stand, the right camera settings</span></span>${chev}</button></section>`;
    wire('[data-th]',b=>b.onclick=()=>{ setTheme(b.dataset.th); STR.preferences(); });
    wire('[data-lg]',b=>b.onclick=()=>{ if(b.dataset.lg!==(window.SD_LANG||'en')&&window.setLang) setLang(b.dataset.lg); });
    wire('[data-u]',b=>b.onclick=()=>{ PREF.units=b.dataset.u; savePref(); STR.preferences(); });
    wireTgl(STR.preferences); $('pfFilm').onclick=openFilm; };
  function wireTgl(redraw){ wire('.tgl[data-t]',b=>b.onclick=()=>{ const k=b.dataset.t;
    if(k==='notifAll'){ const v=!(PREF.notifReady||PREF.notifAlerts); PREF.notifReady=v; PREF.notifAlerts=v; } else PREF[k]=!PREF[k];
    savePref(); b.classList.toggle('on'); setTimeout(redraw,RM()?0:180); }); }
  /* the shell's sun / moon button changes the appearance too: the tiles follow */
  W.onTheme=()=>{ if(cur==='preferences') STR.preferences(); };
  function openFilm(){ const tips=[['Film the whole arena','Film from a spot where you can see the whole arena, a corner or a raised place works best.'],
      ['Keep it steady','Keep the phone horizontal and follow the horse smoothly, without zooming.'],
      ['The whole horse','Make sure the whole horse, from ears to hooves, stays in the picture.'],
      ['The right settings','27 fps at least, 60 fps is best. Full HD is best. From 7 seconds to 3 minutes.']];
    W.modal({title:T('How to film a good session'),sub:esc(T('Where to stand, the right camera settings')),
      icon:`<span class="ico" style="width:40px;height:40px;border-radius:11px;background:var(--blue-bg);color:var(--blue-ink);padding:9px">${IC.video}</span>`,
      body:`<div class="tips">${tips.map(([a,b],i)=>`<div class="tip"><span class="n">${i+1}</span><div><b>${a}</b><span>${b}</span></div></div>`).join('')}</div>`,
      foot:`<button class="btn pri" id="fmOk">Got it</button>`,wire:m=>{ m.querySelector('#fmOk').onclick=W.closeModal; } }); }

  /* ====================== NOTIFICATIONS ====================== */
  STR.notifications=()=>{ const any=PREF.notifReady||PREF.notifAlerts;
    B.innerHTML=head('Notifications','What StrydeUp tells you about.')+`
      <section class="set"><div class="row"><span class="ri">${W.ic(IC.bell)}</span><span class="t"><b>All notifications</b><span>${any?'On':'Everything is off'}</span></span>${tgl('notifAll',any,'All notifications')}</div>
        <div class="row"><span class="ri">${W.ic((window.SDW_IC||{})['play-circle'])}</span><span class="t"><b>Analysis ready</b><span>When a video has been analysed</span></span>${tgl('notifReady',PREF.notifReady,'Analysis ready')}</div>
        <div class="row"><span class="ri">${W.ic((window.SDW_IC||{})['danger-triangle'])}</span><span class="t"><b>Alerts</b><span>When something needs a look on a horse</span></span>${tgl('notifAlerts',PREF.notifAlerts,'Alerts')}</div></section>
      <p class="fmNote" style="margin:14px 4px 0">On the computer, notifications show under the bell, at the top of every page.</p>`;
    wireTgl(STR.notifications); };

  /* ====================== SECURITY ====================== */
  let devs=[['Chrome on Mac','Geneva',true,IC.laptop],['iPhone 16 Pro','Last used today · Geneva',false,IC.phone],['iPad Air','Last used 2 days ago · Lyon',false,IC.tablet]];
  STR.security=()=>{
    B.innerHTML=head('Security','Your password, how you sign in, and where you are signed in.')+`
      <section class="set"><div class="setH"><div class="t"><h3>Change password</h3><p>At least 8 characters, with a number.</p></div></div>
        <form class="fm" id="pwF" autocomplete="on" onsubmit="return false"><input type="email" autocomplete="username" value="${esc(ME.email)}" hidden>
          <div class="fld full"><label for="pw0">CURRENT PASSWORD</label><input class="inp" id="pw0" type="password" autocomplete="current-password"></div>
          <div class="fld"><label for="pw1">NEW PASSWORD</label><input class="inp" id="pw1" type="password" autocomplete="new-password"></div>
          <div class="fld"><label for="pw2">CONFIRM NEW PASSWORD</label><input class="inp" id="pw2" type="password" autocomplete="new-password"></div>
          <div class="fmA full"><button class="btn pri" id="pwSave" type="submit">Update password</button><span class="fmMsg" id="pwMsg" role="status"></span></div></form></section>
      <section class="set"><div class="setH"><div class="t"><h3>Sign in</h3></div></div>
        <div class="row"><span class="ri">${W.ic(IC.face)}</span><span class="t"><b>Sign in with Face ID</b><span>No password on your iPhone</span></span>${tgl('faceid',PREF.faceid,'Sign in with Face ID')}</div>
        <div class="row"><span class="ri">${W.ic(IC.lock)}</span><span class="t"><b>Two-step verification</b><span>A code by email on new devices</span></span>${tgl('twofa',PREF.twofa,'Two-step verification')}</div></section>
      <section class="set"><div class="setH"><div class="t"><h3>Devices signed in</h3></div></div>
        ${devs.map((d,i)=>`<div class="row"><span class="ri">${W.ic(d[3])}</span><span class="t"><b translate="no">${d[0]}</b><span>${d[1]}</span></span>${d[2]?'<span class="stP you">This computer</span>':`<button class="btn sm" data-dev="${i}">Sign out</button>`}</div>`).join('')}</section>
      <div class="setL">DATA &amp; PRIVACY</div>
      <section class="set"><button class="row" id="exD"><span class="ri">${W.ic(IC.download)}</span><span class="t"><b>Export my data</b><span>All sessions and scores, as a file</span></span>${chev}</button>
        <button class="row" id="prv"><span class="ri">${W.ic(IC.eye)}</span><span class="t"><b>Privacy</b><span>Who can see your horses and sessions</span></span>${chev}</button></section>`;
    $('pwSave').onclick=()=>{ const a=$('pw0').value, b=$('pw1').value, c=$('pw2').value, m=$('pwMsg');
      let t=''; if(!a) t='Enter your current password.'; else if(b.length<8||!/\d/.test(b)) t='The new password needs 8 characters and a number.'; else if(b!==c) t='The two new passwords are not the same.';
      m.className='fmMsg '+(t?'bad':'ok'); m.textContent=T(t||'Password updated.'); if(!t) ['pw0','pw1','pw2'].forEach(i=>$(i).value=''); };
    wireTgl(STR.security);
    wire('[data-dev]',b=>b.onclick=()=>{ const d=devs[+b.dataset.dev]; devs=devs.filter(x=>x!==d); STR.security(); toast('Signed out of this device'); });
    $('exD').onclick=()=>toast('Your export is being prepared. It comes by email.');
    $('prv').onclick=openPrivacy; };
  function openPrivacy(){ const rows=[['Private by default','Your horses and sessions are seen only by you and the people you give access to.']];
    if(OWNER) rows.push(['Your team','Each person sees only the horses you give them. Horse owners see only their horses.']);
    else if(!SOLO) rows.push(['Your stable',SD_OWNERIZE('Marie S. sees the horses of the stable and their sessions. Horses you add to My Horses stay private and never count in its numbers.')]);
    rows.push(['Not a medical diagnosis','The scores and alerts come from the video analysis. They help you decide when to look closer.']);
    W.modal({title:T('Privacy'),sub:esc(T('Who can see your horses and sessions')),
      body:`<div class="set">${rows.map(([a,b])=>`<div class="row" style="align-items:flex-start"><span class="dot blue" style="margin-top:7px"></span><span class="t"><b>${a}</b><span>${b}</span></span></div>`).join('')}</div>`,
      foot:`<button class="btn pri" id="pvOk">Got it</button>`,wire:m=>{ m.querySelector('#pvOk').onclick=W.closeModal; } }); }

  /* ====================== HELP ====================== */
  const HELP=[
    {k:'start',n:'Getting started',d:'Your first session',ic:IC.bulb,q:[
      ['How does StrydeUp work?','Film a round with your phone, upload it, and StrydeUp measures every stride and every jump. A few minutes later you get the session with its scores, the heatmap and the jumps.'],
      ['What do I need to film?','Only your phone. Film horizontally, from a place where you can see the whole arena, and follow the horse without zooming.'],
      ['How long does the analysis take?','Usually 2 to 5 minutes. You get a notification when it is ready.']]},
    {k:'rec',n:'Recording & uploading',d:'Filming, errors',ic:IC.video,q:[
      ['Why did my analysis fail?','Most of the time the horse left the picture, the video was too dark or too short. Open the failed session to see the exact reason and how to fix it, then try again.'],
      ['Can I upload a video I filmed before?','Yes. Tap +, then Add a session, and pick the video from your phone.'],
      ['Does it use my mobile data?','If Upload on Wi-Fi only is on in your profile, videos wait for Wi-Fi before they are sent.']]},
    {k:'scores',n:'Understanding scores',d:'Performance, heatmap',ic:IC.ruler,q:[
      ['What is the performance score?','One number for the whole round: the jumps, the rhythm, the turns and the landings together. Tap it on the overview to see what it is made of.'],
      ['What do the colours on the heatmap mean?','Green is in the usual band for this horse, orange is worth keeping an eye on, red needs a look on the video.'],
      ['Why is my score different from last time?','Every round is different: the course, the ground, the pace. Use Trends and Compare to see what really changed.']]},
    {k:'horses',n:'Horses & sessions',d:'Add, edit, compare',ic:I.horse,q:[
      ['How do I add a horse?','Tap +, then Add a horse. On the Pro plan you can add as many horses as you want.'],
      ['Can I change a horse’s details?','Open the horse in My Horses, then Edit in the About card.'],
      ['How do I compare two sessions?','Open a session, then the Compare tab, and pick any other session of the same horse.']]},
    {k:'plan',n:'Account & plan',d:'Billing, plans',ic:IC.crown,q:[
      ['What is the difference between the plans?','Premium: one user, one horse. Pro: one user, unlimited horses. Stable Account: one stable, multiple users, unlimited horses.'],
      ['How do I cancel?','Your plan is managed by the App Store. Go to your iPhone Settings, your name, Subscriptions, StrydeUp.'],
      ['Can I export my data?','Yes, in Profile, Export my data. You get all your sessions and scores in one file.']]}];
  let hCat=null, hQ='';
  STR.help=()=>{
    B.innerHTML=head('Help','Guides and answers. Write to us if you do not find yours.')+`
      <label class="hSrch">${I.search}<input id="hq" type="search" placeholder="Search the help center" aria-label="Search the help center" autocomplete="off" value="${esc(hQ)}"></label>
      <div class="hCat" id="hCat"></div>
      <section class="set" style="margin-top:18px"><div class="setH"><div class="t"><h3 id="hT"></h3></div></div><div id="faq"></div></section>
      <section class="set"><button class="row" id="hSup"><span class="ri" style="color:var(--blue-ink);background:var(--blue-bg);border-color:var(--blue-line)">${W.ic(IC.chat)}</span><span class="t"><b>Contact support</b><span>We answer within a day</span></span>${chev}</button>
        <button class="row" id="hFilm"><span class="ri">${W.ic(IC.bulb)}</span><span class="t"><b>How to film a good session</b><span>Where to stand, the right camera settings</span></span>${chev}</button>
        <a class="row" href="https://www.strydeup.com" target="_blank" rel="noopener"><span class="ri">${W.ic(IC.doc)}</span><span class="t"><b>Terms &amp; privacy policy</b><span>On strydeup.com</span></span><span class="ico ext">${IC.ext}</span></a></section>
      <div class="foot"><span>StrydeUp 3.0 · build 412</span></div>`;
    drawHelp();
    $('hq').addEventListener('input',e=>{ hQ=e.target.value; drawHelp(); });
    $('hSup').onclick=openSupport; $('hFilm').onclick=openFilm; };
  function drawHelp(){ const q=hQ.trim().toLowerCase();
    $('hCat').innerHTML=HELP.map(c=>`<button class="${c.k===hCat?'on':''}" data-k="${c.k}" aria-pressed="${c.k===hCat}">${W.ic(c.ic)}<b>${c.n}</b><span>${c.d}</span></button>`).join('');
    $('hCat').querySelectorAll('button').forEach(b=>b.onclick=()=>{ hCat=hCat===b.dataset.k?null:b.dataset.k; drawHelp(); });
    /* the search looks in English and in the language on screen */
    const has=x=>!q||(x[0]+' '+x[1]+' '+T(x[0])+' '+T(x[1])).toLowerCase().includes(q);
    let items=HELP.flatMap(c=>c.q.map(x=>({c,x}))).filter(({c,x})=>(!hCat||c.k===hCat)&&has(x));
    if(!hCat&&!q) items=items.filter((_,i)=>i%3===0);
    $('hT').textContent=q?`${items.length} ${items.length===1?'result':'results'}`:hCat?T(HELP.find(c=>c.k===hCat).n):T('Popular questions');
    $('faq').innerHTML=items.length?items.map(({x},i)=>`<div class="faq"><button class="q" aria-expanded="false" aria-controls="fa${i}"><span>${x[0]}</span>${W.ic(I.chevR)}</button><div class="an" id="fa${i}"><div><p>${x[1]}</p></div></div></div>`).join('')
      :`<div class="empty2">No answer found. Try other words, or write to us below.</div>`;
    $('faq').querySelectorAll('.q').forEach(b=>b.onclick=()=>{ const f=b.parentNode, o=f.classList.toggle('open'); b.setAttribute('aria-expanded',o); }); }
  function openSupport(){ W.modal({title:T('Contact support'),sub:esc(T('Write to us, we answer within a day.')),
      icon:`<span class="ico" style="width:40px;height:40px;border-radius:11px;background:var(--blue-bg);color:var(--blue-ink);padding:9px">${IC.chat}</span>`,
      body:`<div class="fld"><label for="supM">YOUR MESSAGE</label><textarea class="inp" id="supM" placeholder="Tell us what happened, and on which horse or video." autofocus></textarea></div>
        <p class="fmNote" style="margin-top:10px"><span>We answer at</span> <span translate="no">${esc(ME.email)}</span></p>`,
      foot:`<button class="btn" id="supX">Cancel</button><button class="btn pri" id="supGo" disabled>Send</button>`,
      wire:m=>{ const t=m.querySelector('#supM'), g=m.querySelector('#supGo'); t.oninput=()=>{ g.disabled=t.value.trim().length<4; };
        m.querySelector('#supX').onclick=W.closeModal; g.onclick=()=>{ W.closeModal(); toast('Support will answer within a day.'); }; } }); }

  /* ---------- start ---------- */
  const startHash=location.hash||'';
  go(cur);
  addEventListener('hashchange',()=>{ const k=pick(); go(k); if(/^#plans/.test(location.hash)&&SOLO) openPlans(); });
  if(/^#plans/.test(startHash)&&SOLO) setTimeout(openPlans,RM()?0:250);
})();
