/* StrydeUp desktop web app, sign-up (and log in).
   The phone's sign-up (Etape 6 - Onboarding.html), laid out for a computer, with the same rules and the same storage:
   welcome, your roles, the plan (30 days free), your account, the 6-digit code, your horses, then the web dashboard.
   - roles, in the client's order: Stable Owner, Rider, Vet / Osteo, Farrier, Trainer, Horse Owner, Groom, Others.
     The first role picked (in that order) decides the account you land in, exactly as on the phone:
     Stable Owner > owner, Rider and Others > the plan picked (premium, pro or owner), Vet / Osteo > vet (job Vet, Osteo or Dentist),
     Farrier > farrier, Trainer > trainer, Horse Owner > horseowner, Groom > groom.
   - the plans come from plan.js (SD_OFFERS, SD_PLAN_ICO), one source with Profile and the phone.
   - at the end: localStorage sdPlan and sdMe (name, full, email, roles, horse, horses, sent, trial), the same keys as the phone,
     so plan.js gives index.html the typed name and horses ("Welcome back, Louis", United Touch S...).
   - the code: any 6 digits work, 000000 shows the error (the prototype rule, not said on screen here).
   - ?demo=1 starts clean, ?login=1 opens Log in. Enter continues on every step. */
(function(){
  const T=x=>(window.SD_T||(y=>y))(x);
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $=id=>document.getElementById(id);
  const LG=window.SD_LANG||'en';
  const LSget=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
  const LSset=(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
  const LSdel=k=>{ try{ localStorage.removeItem(k); }catch(e){} };

  /* ---------- icons: the line style of the app ---------- */
  const L=(d,sw)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw||1.6}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const NAV=window.SDW_NAV||{}, PLI=window.SD_PLAN_ICO||{}, WIC=window.SDW_IC||{};
  const HSHOE='M19 4h1V1h-4v3s2 4 2 8s-2 7-6 7s-6-3-6-7s2-8 2-8V1H4v3h1S2 8 2 14c0 5 5 9 10 9s10-4 10-9c0-6-3-10-3-10M4 13c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m2 6c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m6 3c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m6-3c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m2-6c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1';   /* horseshoe: Material Design Icons (Apache 2.0), as on the phone */
  const I={
    back:L('<path d="M14.5 6 8.5 12l6 6"/>',1.9), check:L('<path d="M5 12.5l4.5 4.5L19 7.5"/>',2.2), x:L('<path d="M6 6l12 12M18 6 6 18"/>',1.8),
    globe:L('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5S9.6 5.8 12 3.5z"/>',1.5),
    sun:L('<circle cx="12" cy="12" r="4"/><path d="M12 2.8v1.9M12 19.3v1.9M4.7 4.7l1.4 1.4M17.9 17.9l1.4 1.4M2.8 12h1.9M19.3 12h1.9M4.7 19.3l1.4-1.4M17.9 6.1l1.4-1.4"/>'),
    moon:L('<path d="M20 14.3A8 8 0 0 1 9.7 4a8 8 0 1 0 10.3 10.3z"/>'),
    mail:L('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3.6 7.2 7 4.9a2.4 2.4 0 0 0 2.8 0l7-4.9"/>',1.5),
    user:L('<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20c.9-3.6 3.8-5.6 7.2-5.6s6.3 2 7.2 5.6"/>',1.5),
    lock:L('<rect x="4.5" y="10.5" width="15" height="10" rx="2.6"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>',1.5),
    info:L('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.9" r=".7" fill="currentColor" stroke="none"/>',1.6),
    gift:'<svg viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="round" d="M4 11v4c0 3.3 0 4.95 1.025 5.975S7.7 22 11 22h2c3.3 0 4.95 0 5.975-1.025S20 18.3 20 15v-4"/><path d="M3 9c0-.748 0-1.122.201-1.4a1.4 1.4 0 0 1 .549-.44C4.098 7 4.565 7 5.5 7h13c.935 0 1.402 0 1.75.16c.228.106.417.258.549.44C21 7.878 21 8.252 21 9s0 1.121-.201 1.4a1.4 1.4 0 0 1-.549.44c-.348.16-.815.16-1.75.16h-13c-.935 0-1.402 0-1.75-.16a1.4 1.4 0 0 1-.549-.44C3 10.121 3 9.748 3 9Zm3-5.214C6 2.799 6.8 2 7.786 2h.357A3.857 3.857 0 0 1 12 5.857V7H9.214A3.214 3.214 0 0 1 6 3.786Zm12 0C18 2.799 17.2 2 16.214 2h-.357A3.857 3.857 0 0 0 12 5.857V7h2.786A3.214 3.214 0 0 0 18 3.786Z"/><path stroke-linecap="round" d="M12 11v11"/></g></svg>',
    plus:L('<path d="M12 5v14M5 12h14"/>',1.9),
    eye:L('<path d="M2.8 12.3C4.6 8.3 8 6 12 6s7.4 2.3 9.2 6.3c-1.8 4-5.2 6.2-9.2 6.2s-7.4-2.2-9.2-6.2z"/><circle cx="12" cy="12.2" r="3"/>',1.5),
    eyeOff:L('<path d="M4 4l16 16"/><path d="M9.9 6.3A9.6 9.6 0 0 1 12 6c4 0 7.4 2.3 9.2 6.3a11.8 11.8 0 0 1-2.6 3.6M6.4 7.9a11.6 11.6 0 0 0-3.6 4.4c1.8 4 5.2 6.2 9.2 6.2a9.4 9.4 0 0 0 4.3-1"/><path d="M10 10.3a3 3 0 0 0 4 4"/>',1.5),
    stable:PLI.owner||'', horse:NAV.horse||'', home:NAV.home||'', sessions:NAV.sessions||'', profile:NAV.profile||'', upload:NAV.upload||'',
    team:L('<circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.9-3.3 3.3-5.1 6.2-5.1s5.3 1.8 6.2 5.1"/><path d="M15.5 4.9a3.4 3.4 0 0 1 0 6.3M17.6 14.6c1.8.7 3.1 2.4 3.6 4.9"/>'),
    settings:L('<path d="M10.3 3.6a1.8 1.8 0 0 1 3.4 0l.3.9a1.8 1.8 0 0 0 2.5 1l.8-.4a1.8 1.8 0 0 1 2.4 2.4l-.4.8a1.8 1.8 0 0 0 1 2.5l.9.3a1.8 1.8 0 0 1 0 3.4l-.9.3a1.8 1.8 0 0 0-1 2.5l.4.8a1.8 1.8 0 0 1-2.4 2.4l-.8-.4a1.8 1.8 0 0 0-2.5 1l-.3.9a1.8 1.8 0 0 1-3.4 0l-.3-.9a1.8 1.8 0 0 0-2.5-1l-.8.4a1.8 1.8 0 0 1-2.4-2.4l.4-.8a1.8 1.8 0 0 0-1-2.5l-.9-.3a1.8 1.8 0 0 1 0-3.4l.9-.3a1.8 1.8 0 0 0 1-2.5l-.4-.8a1.8 1.8 0 0 1 2.4-2.4l.8.4a1.8 1.8 0 0 0 2.5-1z"/><circle cx="12" cy="12" r="3"/>',1.5),
    steth:L('<path d="M6.5 3.5H5.2a1 1 0 0 0-1 1V9a4.8 4.8 0 0 0 9.6 0V4.5a1 1 0 0 0-1-1h-1.3"/><path d="M9 13.8v1.7a5.2 5.2 0 0 0 10.4 0v-2.2"/><circle cx="19.4" cy="11.3" r="2"/>',1.5),
    shoe:`<svg viewBox="-2 -2 28 28" fill="currentColor"><path d="${HSHOE}"/></svg>`,
    watch:L('<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.5l2.4 1.6M9.5 3h5M12 3v3.5M18.2 6.8l1.3-1.3"/>',1.5),
    key:L('<circle cx="8" cy="15.5" r="4.2"/><path d="m11 12.5 8.6-8.6M16.6 6.9l2.6 2.6M14.3 9.2l1.9 1.9"/>',1.5),
    brush:L('<path d="M4.5 12.5h15l-1.2 6.1a2 2 0 0 1-2 1.7H7.7a2 2 0 0 1-2-1.7z"/><path d="M8 12.5V8.3a4 4 0 0 1 8 0v4.2"/><path d="M9 16v1.6M12 16v1.6M15 16v1.6"/>',1.5),
    more:L('<circle cx="12" cy="12" r="9"/><circle cx="8" cy="12" r=".9" fill="currentColor"/><circle cx="12" cy="12" r=".9" fill="currentColor"/><circle cx="16" cy="12" r=".9" fill="currentColor"/>',1.5),
    apple:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.37 12.6c.02 2.4 2.1 3.2 2.13 3.21-.02.06-.33 1.14-1.1 2.26-.66.97-1.35 1.94-2.43 1.96-1.06.02-1.4-.63-2.62-.63-1.21 0-1.6.61-2.6.65-1.05.04-1.84-1.05-2.51-2.02-1.37-1.98-2.42-5.6-1.01-8.04.7-1.21 1.95-1.98 3.3-2 1.03-.02 2.01.7 2.64.7.63 0 1.81-.86 3.06-.73.52.02 1.98.21 2.92 1.59-.08.05-1.74 1.02-1.72 3.04M14.35 5.14c.56-.68.93-1.62.83-2.56-.8.03-1.77.53-2.35 1.21-.51.59-.97 1.55-.85 2.46.9.07 1.81-.46 2.37-1.11"/></svg>',
    google:'<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.71h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.74 2.98-4.3 2.98-7.27"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.81-1.76-5.6-4.12H3.07v2.59A10 10 0 0 0 12 22"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.51H3.07a10 10 0 0 0 0 8.98z"/><path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.86-2.87A9.6 9.6 0 0 0 12 2 10 10 0 0 0 3.07 7.51L6.4 10.1C7.19 7.74 9.4 5.98 12 5.98"/></svg>'};
  const ic=(svg,px,st)=>`<span class="ico"${px||st?` style="${px?`width:${px}px;height:${px}px;`:''}${st||''}"`:''}>${svg||''}</span>`;

  /* ---------- what you can be, in the client's order (same keys as the phone) ---------- */
  const ROLES=[['Owner','Stable Owner',I.stable,'The master account: team, horses and access'],
    ['Rider','Rider',I.horse,'Rides and follows their own horses'],
    ['Vet','Vet / Osteo',I.steth,'Follows horses of several stables'],
    ['Farrier','Farrier',I.shoe,'Shoes horses of several stables'],
    ['Trainer','Trainer',I.watch,'Trains in one stable or several'],
    ['HorseOwner','Horse Owner',I.key,'Owns horses kept at the stable'],
    ['Groom','Groom',I.brush,'Looks after the horses of the stable'],
    ['Other','Others',I.more,'Any other role around the horses']];
  /* the role picked decides the account you land in (the first one, in the order of the list), as on the phone */
  const ROLE_ACC=[['Owner','owner'],['Rider','rider'],['Vet','vet'],['Farrier','farrier'],['Trainer','trainer'],['HorseOwner','horseowner'],['Groom','groom'],['Other','rider']];
  const ROLE_NAME={'Owner+Rider':'Owner-rider','Rider+Trainer':'Rider-trainer','Owner+Trainer':'Owner-trainer'};
  const ACC_LINE={owner:'Stable Account: your team, your horses and who sees what.',rider:'You pick Premium or Pro at the next step.',
    vet:'The professional profile: the stables and the horses you follow.',farrier:'The professional profile: the stables and the horses you shoe.',
    trainer:'The trainer profile: the stables you train at and their horses.',horseowner:'The horses you own: their sessions and their scores.',groom:'The horses you look after: their care and their visits.'};
  const JOBS=['Vet','Osteo','Dentist'];
  const OFFERS=window.SD_OFFERS||[];
  const offer=k=>OFFERS.find(o=>o.k===k)||OFFERS[1]||{};
  const STEPS=['role','plan','account','code','horses'], STEP_L=['Role','Plan','Account','Verify','Horses'];
  const BREEDS=['KWPN','Holsteiner','Hanoverian','Oldenburg','Westphalian','Trakehner','Selle Français','BWP','SBS','Zangersheide','Irish Sport Horse','Irish Draught','Swedish Warmblood','Danish Warmblood','Thoroughbred','Anglo-Arab','Arabian','AES','CH (Swiss Warmblood)','Polish Warmblood','Rheinlander','Lusitano','PRE (Pura Raza Española)','Connemara','Welsh pony','German Riding Pony','Other pony','Other'];

  /* ---------- the state of the flow ---------- */
  const S={step:'welcome', roles:[], job:'Vet', plan:'pro', planTouched:false, per:'m', name:'', email:'', pw:'', terms:false, news:false, social:false,
    horses:[], hfOpen:false, hf:{name:'',sex:null,year:'',height:'',breed:''}, login:{email:'',stage:0}, touched:{}};
  const Q=new URLSearchParams(location.search);
  /* the demo reset of the phone (?demo=1): nothing left over from accounts tried before */
  const CLEAN=['sdVisits','sdPersonal','sdStaffHorses','sdGear','sdGearLast','sdLastFeel','sdHomeTrends','sdNotifRead','sdMe','sdDeletedVideos','sdVideoHorse','sdHorseEdits','sdDeletedHorses','sdClientsVet','sdClientsFarrier','sdPersonalGroom','sdPersonalTrainer','sdPersonalHowner','sdHorseOwners','sdStableSel_vet','sdStableSel_farrier','sdStableSel_trainer','sdJob_vet','sdJob_farrier'];
  if(Q.get('demo')==='1') CLEAN.forEach(LSdel);
  /* a change of language reloads the page: come back to the same step with what was typed (never the password) */
  try{ const k=sessionStorage.getItem('sdSignupKeep'); if(k){ sessionStorage.removeItem('sdSignupKeep'); Object.assign(S,JSON.parse(k)); if(S.step==='code') S.step='account'; if(S.step==='login'&&S.login.stage) S.login.stage=0; } }catch(e){}
  if(Q.get('login')==='1'&&S.step==='welcome') S.step='login';
  const keep=()=>{ try{ const c=Object.assign({},S,{pw:''}); sessionStorage.setItem('sdSignupKeep',JSON.stringify(c)); }catch(e){} };

  const roleSet=()=>new Set(S.roles);
  const accountOf=()=>{ const R=ROLE_ACC.find(([r])=>S.roles.includes(r)), P0={premium:'premium',pro:'pro',owner:'owner'}[S.plan]||'pro';
    return !R||R[1]==='rider'?P0:R[1]; };
  const firstName=()=>(S.name.trim().split(/\s+/)[0])||'Marie';
  const mailOk=x=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x);
  const pwScore=pw=>(pw.length>=8)+(/\d/.test(pw))+(/[A-Z]/.test(pw))+(pw.length>=12);
  const ini=n=>String(n||'').trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const money=(p,per)=>per==='h'&&p.h?{v:p.h,u:'/6 months'}:{v:p.m,u:'/month'};

  /* ======================================================================
     LEFT: the welcome stories, then the live preview of the dashboard
     ====================================================================== */
  const art=$('suArt');
  const STORY=[['See every stride, every jump.','Film a round with your phone, StrydeUp measures the rest with AI.'],
    ['Read the whole round.','The line you rode, the lead at every fence, the strides in between.'],
    ['Watch them progress.','Trends across videos and shows, so you see what really changes.'],
    ['Everything, on the big screen.','Every horse, every session and every alert, with room to read them.']];
  const DUR=6;
  const theme=()=>document.documentElement.dataset.theme==='light'?'light':'dark';
  const shotSrc=()=>`../_captures%20web%20app/home-1440-${theme()}-pro.png`;
  function drawStories(){
    const sp=[31.5,525,3.85], sd=[1,0,2];
    $('suStories').innerHTML=`
      <section class="suSt vid" data-i="0"><div class="stage">
        <video id="stVid" src="../accueil/brash-geneve.mp4" poster="../accueil/brash-geneve.jpg" muted playsinline preload="auto" loop></video></div>
        <div class="hud glass" id="stHud"><div class="cap"><i></i><span>Live analysis</span> · <span translate="no">S. Brash, Hello Chadora Lady</span></div>
          <div class="row">${[['Speed','km/h'],['Tempo','m/min'],['Stride','m']].map(([k,u],i)=>`<div><div class="k">${esc(T(k))}</div><div class="v"><span data-n="${sp[i]}" data-d="${sd[i]}">0</span><small>${u}</small></div></div>`).join('')}</div></div>
        <div class="strip" id="stStrip"><span class="lb">${esc(T('STRIDES'))}</span><div class="base"></div>${Array.from({length:9},(_,i)=>`<i class="tk" style="left:${3+i*10.6}%"></i>`).join('')}<span class="jp" style="left:62%">${esc(T('JUMP'))}</span></div>
        <div class="credit" translate="no">CHI de Genève · Rolex IJRC Top 10 Final</div></section>
      <section class="suSt map" data-i="1"><div class="stage"><div class="mapBox" id="stMap"></div></div>
        <div class="mapHud cardGlass"><div><div class="k">${esc(T('Fence'))}</div><div class="v" id="stF">1</div></div><div><div class="k">${esc(T('Time'))}</div><div class="v" id="stT">0.00<small>s</small></div></div><div><div class="k">${esc(T('Lead'))}</div><div class="v" id="stL" style="min-width:90px">${esc(T('Left'))}</div></div></div></section>
      <section class="suSt trd" data-i="2"><div class="stage"><div class="tStage">
        <div class="tCard"><div class="hd"><div><h4>${esc(T('Performance'))}</h4><div class="big">70<small>%</small></div></div><span class="pill good">▲ ${esc(T('Improving'))} · +4 pts</span></div>
          <svg class="tc" id="stTc" viewBox="0 0 270 100" preserveAspectRatio="none"></svg><div class="ax"><span>Jul</span><span>Aug</span><span>Sep</span></div></div>
        <div class="tCard w2"><h4>${esc(T('Things to watch'))}</h4>
          <div class="rw"><span class="ri" style="background:var(--watch-bg)"><svg viewBox="0 0 24 24" style="stroke:var(--watch)"><path d="M4 8.5h12l-2.8-2.8"/><path d="M20 15.5H8l2.8 2.8"/></svg></span><b>${esc(T('Late lead change, turn 4'))}</b></div>
          <div class="rw"><span class="ri" style="background:var(--good-bg)"><svg viewBox="0 0 24 24" style="stroke:var(--good)"><path d="M3 13h4l3-7 4 12 3-7h4"/></svg></span><b>${esc(T('Regular rhythm'))}</b></div></div></div></div></section>
      <section class="suSt dash" data-i="3"><div class="stage"><div class="shot"><div class="bar"><i></i><i></i><i></i><span translate="no">StrydeUp</span></div><img id="stShot" alt="" src="${shotSrc()}"></div></div></section>`;
    $('stShot').onerror=function(){ this.parentNode.style.display='none'; };
    /* the progress curve */
    const s4=[58,60,59,63,62,64,66,65,67,68,67,70], X=i=>i/(s4.length-1)*270, Y=v=>92-(v-54)/(72-54)*84, d=s4.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
    $('stTc').innerHTML=`<path d="${d} L270 100 L0 100Z" fill="rgba(92,196,140,.13)"/><path id="stTp" d="${d}" fill="none" stroke="#5CC48C" stroke-width="2.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
    loadMap(); }
  /* the course map: the round draws itself, each fence lights up as it is jumped (the real round of the welcome, cmap.json) */
  let CM=null, mapRaf=0;
  function loadMap(){ fetch('../accueil/cmap.json').then(r=>r.json()).then(j=>{ CM=j; drawMap(); }).catch(()=>{}); }
  function drawMap(){ if(!CM||!$('stMap')) return;
    const P=CM.rid, xs=P.map(p=>p[0]).concat(CM.fences.map(f=>f.x)), ys=P.map(p=>p[1]).concat(CM.fences.map(f=>f.y));
    const x0=Math.min(...xs)-16, x1=Math.max(...xs)+16, y0=Math.min(...ys)-16, y1=Math.max(...ys)+16;
    const d=P.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    const fence=f=>{ const a=f.ang*Math.PI/180, two=f.type==='O'||f.type==='T', ox=Math.sin(a)*12, oy=-Math.cos(a)*12;
      return `<g class="fe" data-t="${f.t}"><g transform="translate(${f.x} ${f.y}) rotate(${f.ang})">${f.type==='L'?'<rect x="-3" y="-7" width="6" height="14" rx="1.5" fill="var(--blue-bg)"/>':''}
        ${two?'<line class="bar" x1="-1.8" y1="-6.5" x2="-1.8" y2="6.5" stroke-width="1.8" stroke-linecap="round"/><line class="bar" x1="1.8" y1="-6.5" x2="1.8" y2="6.5" stroke-width="1.8" stroke-linecap="round"/>'
          :'<line class="bar" x1="0" y1="-6.5" x2="0" y2="6.5" stroke-width="2" stroke-linecap="round"/>'}
        <circle class="ld" cx="0" cy="0" r="2.6" fill="var(--blue)"/></g>
        <text class="num" x="${(f.x+ox).toFixed(1)}" y="${(f.y+oy+3).toFixed(1)}" text-anchor="middle" font-size="7.5" font-weight="700">${esc(f.id)}</text></g>`; };
    $('stMap').innerHTML=`<svg viewBox="${x0} ${y0} ${x1-x0} ${y1-y0}">
      <rect x="${x0+4}" y="${y0+4}" width="${x1-x0-8}" height="${y1-y0-8}" rx="10" fill="none" stroke="var(--line2)" stroke-width="1"/>
      <path d="${d}" fill="none" stroke="var(--line3)" stroke-width="1.2" stroke-dasharray="1.5 3" stroke-linecap="round"/>
      <path id="stRide" d="${d}" fill="none" stroke="var(--blue)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      ${CM.fences.map(fence).join('')}
      <circle cx="${CM.start[0]}" cy="${CM.start[1]}" r="3.4" fill="var(--bg)" stroke="var(--good)" stroke-width="1.6"/>
      <circle id="stHead" r="4.2" fill="#fff" stroke="var(--blue)" stroke-width="2"/></svg>`; }
  function playMap(){ if(!CM||!$('stRide')) return; cancelAnimationFrame(mapRaf);
    const P=CM.rid, path=$('stRide'), head=$('stHead'), TL=path.getTotalLength(), cum=[0];
    for(let i=1;i<P.length;i++) cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
    const tot=cum[cum.length-1], T0=Math.max(0,P[0][2]), T1=P[P.length-1][2], D=Math.min(DUR*1000-700,5600), t0=performance.now();
    path.style.strokeDasharray=TL; const FE=[...document.querySelectorAll('#stMap .fe')];
    const step=now=>{ const p=RM()?1:Math.min(1,(now-t0)/D), t=T0+(T1-T0)*p;
      let i=P.findIndex(q=>q[2]>=t); if(i<0) i=P.length-1; const len=cum[i]/tot*TL;
      path.style.strokeDashoffset=TL-len; const pt=path.getPointAtLength(len); head.setAttribute('cx',pt.x); head.setAttribute('cy',pt.y);
      let last=null; FE.forEach((g,j)=>{ const on=+g.dataset.t<=t; g.classList.toggle('on',on); if(on) last=CM.fences[j]; });
      const f=$('stF'), tt=$('stT'), l=$('stL'); if(f) f.textContent=last?last.id:'1';
      if(tt) tt.innerHTML=`${fmtN(Math.max(0,t),2)}<small>s</small>`; if(l) l.textContent=T(last&&last.lead?last.lead:'Left');
      if(p<1) mapRaf=requestAnimationFrame(step); };
    mapRaf=requestAnimationFrame(step); }
  const fmtN=(n,d)=>{ const s=n.toFixed(d); return LG==='en'?s:s.replace('.',','); };
  /* the stories take turns, the words on the right follow */
  let sk=-1, sTimer=null, sTM=[], storiesOn=false;
  function story(n){ const SS=[...document.querySelectorAll('.suSt')]; if(!SS.length) return;
    sk=((n%4)+4)%4; sTM.forEach(clearTimeout); sTM=[]; cancelAnimationFrame(mapRaf);
    SS.forEach((s,i)=>s.classList.toggle('on',i===sk)); art.classList.toggle('video',sk===0);
    const LN=[...document.querySelectorAll('.wlLine')]; LN.forEach((l,i)=>{ if(l.classList.contains('on')&&i!==sk){ l.classList.remove('on'); l.classList.add('out'); setTimeout(()=>l.classList.remove('out'),400); } });
    sTM.push(setTimeout(()=>{ const l=document.querySelectorAll('.wlLine')[sk]; if(l) l.classList.add('on'); },90));
    const BR=[...document.querySelectorAll('.wlBars button')]; BR.forEach((b,i)=>b.className=i<sk?'done':''); if(BR[sk]){ void BR[sk].offsetWidth; BR[sk].className='run'; }
    const vid=$('stVid');
    if(sk===0){ try{ vid.currentTime=0; const p=vid.play(); if(p&&p.catch) p.catch(()=>{}); }catch(e){}
      document.querySelectorAll('#stHud [data-n]').forEach(el=>{ const N=+el.dataset.n, dd=+el.dataset.d, t0=performance.now();
        const f=now=>{ const p=RM()?1:Math.min(1,(now-t0)/900), e=1-Math.pow(1-p,3); el.textContent=fmtN(N*e,dd); if(p<1&&storiesOn) requestAnimationFrame(f); }; requestAnimationFrame(f); });
      const tks=[...document.querySelectorAll('#stStrip .tk')], jp=document.querySelector('#stStrip .jp'); tks.forEach(t=>t.classList.remove('on')); jp.classList.remove('on');
      tks.forEach((t,i)=>sTM.push(setTimeout(()=>t.classList.add('on'),i<6?i*420:i*420+360))); sTM.push(setTimeout(()=>jp.classList.add('on'),2420)); }
    else if(vid){ try{ vid.pause(); }catch(e){} }
    if(sk===1) playMap();
    if(sk===2){ const tp=$('stTp'); if(tp){ const TL=tp.getTotalLength(); tp.style.transition='none'; tp.style.strokeDasharray=TL; tp.style.strokeDashoffset=RM()?0:TL; void tp.getBoundingClientRect(); tp.style.transition='stroke-dashoffset 1.6s cubic-bezier(.23,1,.32,1) .3s'; tp.style.strokeDashoffset=0; } }
    clearTimeout(sTimer); sTimer=setTimeout(()=>story(sk+1),DUR*1000); }
  function storiesStart(){ if(storiesOn) return; storiesOn=true; art.classList.remove('prev'); story(sk<0?0:sk); }
  function storiesStop(){ storiesOn=false; clearTimeout(sTimer); sTM.forEach(clearTimeout); cancelAnimationFrame(mapRaf); art.classList.remove('video'); const v=$('stVid'); if(v) try{ v.pause(); }catch(e){} }
  art.addEventListener('click',()=>{ if(storiesOn) story(sk+1); });

  /* the live preview: the web dashboard, filled in as you answer (role, plan, name, horses) */
  let pvLast={horses:[],acc:null};
  const BADGE={pro:'PRO',premium:'PREMIUM',owner:'OWNER',rider:'RIDER',farrier:'FARRIER',groom:'GROOM',trainer:'TRAINER',horseowner:'HORSE OWNER'};
  const SCORE=[76,73,70,64,61], DELTA=[2,6,4,-3,-1];
  const tone=p=>p>=70?'good':p>=55?'watch':'bad';
  const ring=(v,r)=>{ const c=2*Math.PI*11, col={good:'var(--good)',watch:'var(--watch)',bad:'var(--bad)'}[tone(v)];
    return `<svg class="ring" viewBox="0 0 30 30"><circle cx="15" cy="15" r="11" fill="none" stroke="var(--ring-track)" stroke-width="3"/><circle cx="15" cy="15" r="11" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round" stroke-dasharray="${(c*v/100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 15 15)"/><text x="15" y="18" text-anchor="middle" font-size="8.5" font-weight="750" fill="var(--txt)">${v}</text></svg>`; };
  function drawPrev(){
    const A=S.roles.length?accountOf():(S.step==='role'?null:accountOf()), acc=A||'pro', P=offer(S.plan);
    const full=S.name.trim(), first=S.name.trim().split(/\s+/)[0];
    const navH=acc==='owner'?['My Stable',I.stable]:acc==='premium'?['My Horse',I.horse]:['My Horses',I.horse];
    const nav=[['Home',I.home,1],[navH[0],navH[1]],['Sessions',I.sessions]].concat(acc==='owner'?[['Team',I.team,0,1]]:[]);
    const badge=acc==='vet'?S.job.toUpperCase():BADGE[acc]||'PRO';
    const line=acc==='pro'?T('Unlimited horses'):acc==='premium'?T('One horse'):acc==='owner'?'Écurie '+(full||'Marie S.'):'Écurie Marie S.';
    const H=S.horses.map(h=>h.name), max=acc==='premium'?1:4;
    const rows=H.slice(0,max).map((n,i)=>{ const nw=!pvLast.horses.includes(n);
      return `<div class="pvH${nw?' nw':''}"><span class="rk">#${i+1}</span>${ring(SCORE[i])}<span class="t"><b>${esc(n)}</b><span>${esc(full||T('You'))}</span></span><span class="pill ${DELTA[i]>0?'good':'bad'}">${DELTA[i]>0?'▲ +':'▼ '}${Math.abs(DELTA[i])} pts</span></div>`; }).join('')
      ||`<div class="pvH ph"><span class="rk">#1</span><span class="ringPh"></span><span class="t"><b>${esc(T('Your horse'))}</b><span>${esc(T('Added in the last step'))}</span></span></div>`;
    const tag=A?(['pro','premium','owner'].includes(A)?`${PLI[A]||''}<span>${esc(T(offer(A).n||''))}</span><span class="mut" style="font-weight:550">· ${esc(T('30 days free'))}</span>`
      :`${(ROLES.find(r=>S.roles.includes(r[0]))||[])[2]||''}<span>${esc(T((ROLES.find(r=>S.roles.includes(r[0]))||[])[1]||''))}</span>`):'';
    $('suPrev').innerHTML=`<div class="pvHead"><span class="lbl"><i></i><span>${esc(T('LIVE PREVIEW'))}</span></span><h2>${esc(T('Your StrydeUp, as you set it up.'))}</h2><p>${esc(T('Every answer on the right shows here first: your account, your plan, your name and your horses.'))}</p></div>
      <div class="pvWrap">${tag?`<span class="pvTag">${tag}</span>`:''}<div class="pvWin">
        <div class="pvSide"><span class="wm" translate="no">STRYDEUP</span>
          <div class="pvNav">${nav.map(([l,i,on,nw])=>`<span class="${on?'on':''}${nw&&pvLast.acc!=='owner'?' nw':''}">${ic(i)}<span>${esc(T(l))}</span></span>`).join('')}</div>
          <div class="pvNav" style="margin-top:14px">${[['Profile',I.profile],['Settings',I.settings]].map(([l,i])=>`<span>${ic(i)}<span>${esc(T(l))}</span></span>`).join('')}</div>
          <div class="pvMe"><span class="wAv">${esc((first||'?').slice(0,1).toUpperCase())}</span><span class="t"><b>${esc(full||T('Your name'))}</b><small><span class="wBadge" translate="no">${PLI[acc]||''}${esc(T(badge))}</span><span>${esc(line)}</span></small></span></div></div>
        <div class="pvMain"><div class="pvTop"><span class="s"></span><span class="up">${ic(I.upload)}<span>${esc(T('Upload video'))}</span></span></div>
          <div class="pvHi"><div class="e">Wed 30 Sep 2026</div><h3><span>${esc(T('Welcome back,'))}</span> <span class="nm${first?'':' ph'}">${esc(first||T('Your name'))}</span></h3></div>
          <div class="pvKpis"><div class="pvK"><div class="k">${esc(T(acc==='premium'?'Performance score':'Average performance score'))}</div><div class="v">69<small>%</small></div>
              <svg viewBox="0 0 56 22"><path d="M1 17 L9 15 L17 16 L25 11 L33 12 L41 7 L47 9 L55 4" fill="none" stroke="var(--good)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
            <div class="pvK"><div class="k">${esc(T('Sessions this month'))}</div><div class="v">27<small>${esc(T('videos'))}</small></div></div>
            <div class="pvK"><div class="k">${esc(T('Active alerts'))}</div><div class="v">7</div><div class="dots"><span><i class="dot bad"></i>2</span><span><i class="dot watch"></i>5</span></div></div></div>
          <div class="pvRow"><div class="pvCh"><div class="h">${esc(T(acc==='premium'?'Performance score':'Average performance score'))}</div><div class="v">69<small>%</small><span class="pill good">${esc(T('Improving'))}</span></div>
              <svg viewBox="0 0 200 90" preserveAspectRatio="none"><path d="M0 30H200M0 60H200" stroke="var(--grid)" stroke-width="1" vector-effect="non-scaling-stroke"/><path d="M0 70 L18 66 L36 64 L54 62 L72 58 L90 58 L108 50 L126 56 L144 55 L162 42 L180 36 L200 40 L200 90 L0 90Z" fill="rgba(92,196,140,.12)"/><path d="M0 70 L18 66 L36 64 L54 62 L72 58 L90 58 L108 50 L126 56 L144 55 L162 42 L180 36 L200 40" fill="none" stroke="var(--good)" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg></div>
            <div class="pvList"><div class="h"><span>${esc(T(acc==='premium'?'Your horse':acc==='owner'||acc==='pro'?'Top performers':'Your horses'))}</span><em>${esc(T('All horses'))}</em></div>${rows}</div></div></div></div></div>`;
    pvLast={horses:H.slice(),acc}; }
  function artMode(){ const welcome=S.step==='welcome'||S.step==='login';
    if(welcome){ storiesStart(); } else { storiesStop(); art.classList.add('prev'); drawPrev(); } }

  /* ======================================================================
     RIGHT: the steps
     ====================================================================== */
  const IN=$('suIn'), FOOT=$('suFoot');
  const stepper=()=>{ const i=STEPS.indexOf(S.step); if(i<0) return '';
    return `<div class="stp"><div class="lbl"><span>${esc(T(`Step ${i+1} of ${STEPS.length}`))}</span><b>${esc(T(STEP_L[i]))}</b></div>
      <div class="stpBar" role="list">${STEP_L.map((l,j)=>`<span role="listitem" class="${j<i?'done':j===i?'cur':''}"${j===i?' aria-current="step"':''}><i></i><em>${j<i?I.check:''}${esc(T(l))}</em></span>`).join('')}</div></div>`; };
  const cta=(id,label,dis,extra)=>`<button class="cta" id="${id}"${dis?' disabled':''}>${esc(T(label))}<span class="kbd" aria-hidden="true">↵</span></button>${extra||''}`;

  /* ---------- welcome ---------- */
  function vWelcome(){
    IN.innerHTML=`<div class="wl sx"><span class="eyb">${I.gift}<span>${esc(T('30 days free'))}</span></span>
      <div class="wlLines">${STORY.map(([h,p])=>`<div class="wlLine"><h1>${T(h).split(' ').map((w,i)=>`<span class="w" style="transition-delay:${i*45}ms">${esc(w)}</span>`).join(' ')}</h1><p>${esc(T(p))}</p></div>`).join('')}</div>
      <div class="wlBars" style="--d:${DUR}s">${STORY.map((_,i)=>`<button aria-label="${esc(T(STORY[i][0]))}" data-s="${i}"><i><b></b></i></button>`).join('')}</div>
      <div class="wlFacts">${[[I.sessions,'Every session analysed'],[L('<path d="M5 20v-7M10 20V5M15 20v-9M20 20V8"/>',1.7),'Overview, heatmap, jumps & performance metrics'],[L('<path d="M4 4.5v15h16"/><path d="m7.5 14.5 3.6-4 3 2.6 5-6"/>',1.7),'Track trends and progress over time']].map(([s,t])=>`<div><span class="fi2">${s}</span><span>${esc(T(t))}</span></div>`).join('')}</div></div>`;
    FOOT.innerHTML=`${cta('goNew','Create an account',false)}<button class="cta sec" id="goLogin" style="margin-top:10px">${esc(T('I already have an account'))}</button>
      <div class="ctaNote">${esc(T('Nothing to pay today. We remind you 2 days before the trial ends, cancel in one tap.'))}</div>`;
    IN.querySelectorAll('.wlBars button').forEach(b=>b.onclick=()=>story(+b.dataset.s));
    $('goNew').onclick=()=>go('role'); $('goLogin').onclick=()=>go('login');
    if(storiesOn) setTimeout(()=>story(sk<0?0:sk),0); }

  /* ---------- 1 roles ---------- */
  function vRole(){
    IN.innerHTML=`<div class="sx${dirB?' bk':''}">${stepper()}<h1 class="sH">${esc(T('What do you do?'))}</h1><p class="sS">${esc(T('Pick all that apply. StrydeUp opens on the account made for you.'))}</p>
      <div class="sL"><span class="lbl">${esc(T('YOUR ROLES'))}</span><em>${esc(T('Pick all that apply'))}</em></div>
      <div class="roles" role="group" aria-label="${esc(T('YOUR ROLES'))}">${ROLES.map(([k,n,svg,d],i)=>`<button class="role" data-r="${k}" aria-pressed="false"><span class="ri">${svg}</span><span class="t"><b>${esc(T(n))}</b><span>${esc(T(d))}</span></span><span class="ck">${I.check}</span><span class="kn" aria-hidden="true">${i+1}</span></button>`).join('')}</div>
      <div id="roleX"></div></div>`;
    FOOT.innerHTML=cta('goNext','Continue',true);
    IN.querySelectorAll('.role').forEach(b=>b.onclick=()=>toggleRole(b.dataset.r));
    $('goNext').onclick=next; syncRole(); }
  function toggleRole(r){ const i=S.roles.indexOf(r); if(i>=0) S.roles.splice(i,1); else S.roles.push(r);
    S.roles.sort((a,b)=>ROLES.findIndex(x=>x[0]===a)-ROLES.findIndex(x=>x[0]===b));
    if(!S.planTouched) S.plan=S.roles[0]==='Owner'?'owner':'pro';
    syncRole(); drawPrev(); }
  function syncRole(){ const R=roleSet();
    IN.querySelectorAll('.role').forEach(b=>{ const on=R.has(b.dataset.r); b.classList.toggle('on',on); b.setAttribute('aria-pressed',on); });
    const x=$('roleX'); if(!x) return; const A=accountOf(), k=[...S.roles].sort().join('+');
    let h='';
    if(!S.roles.length) h=`<div class="roleSum mut">${ic(I.info)}<span>${esc(T('Pick at least one role to continue.'))}</span></div>`;
    else { const R0=ROLES.find(r=>r[0]===S.roles[0]);
      h=`<div class="roleSum">${ic(I.check)}<span>${S.roles.length>1?`<b>${esc(T(ROLE_NAME[k]||'All-rounder'))}</b> · <span>${esc(T(S.roles.length>2?'all your roles on your profile':'both roles on your profile'))}</span>. `:`<b>${esc(T(R0[1]))}</b>. `}<span>${esc(T(ACC_LINE[A]||ACC_LINE.rider))}</span></span></div>`; }
    if(R.has('Vet')) h+=`<div class="job"><span>${esc(T('Your job'))}</span><div class="seg" role="radiogroup">${JOBS.map(j=>`<button role="radio" aria-checked="${S.job===j}" class="${S.job===j?'on':''}" data-j="${j}">${esc(T(j))}</button>`).join('')}</div></div>`;
    x.innerHTML=h; x.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{ S.job=b.dataset.j; syncRole(); drawPrev(); });
    const g=$('goNext'); if(g) g.disabled=!S.roles.length; }

  /* ---------- 2 plan ---------- */
  function vPlan(){
    IN.innerHTML=`<div class="sx${dirB?' bk':''}">${stepper()}<h1 class="sH">${esc(T('Choose your plan'))}</h1><p class="sS">${esc(T('30 days free. You can change plan at any time.'))}</p>
      <div class="per"><div class="seg" role="radiogroup" aria-label="${esc(T('Billing'))}"><button data-p="m" role="radio">${esc(T('Monthly'))}</button><button data-p="h" role="radio">${esc(T('6 months'))} <em>−15%</em></button></div></div>
      <div class="plans" id="plans" role="radiogroup" aria-label="${esc(T('Choose your plan'))}"></div>
      <div class="trial">${ic(I.gift)}<span>${esc(T('Nothing to pay today. We remind you 2 days before the trial ends, cancel in one tap.'))}</span></div></div>`;
    FOOT.innerHTML=`${cta('goNext','Start 30-day free trial',false)}<div class="ctaNote" id="planThen"></div>`;
    IN.querySelectorAll('.per button').forEach(b=>b.onclick=()=>{ S.per=b.dataset.p; drawPlans(); });
    $('goNext').onclick=next; drawPlans(); }
  function drawPlans(focus){ IN.querySelectorAll('.per button').forEach(b=>{ b.classList.toggle('on',b.dataset.p===S.per); b.setAttribute('aria-checked',b.dataset.p===S.per); });
    $('plans').innerHTML=OFFERS.map(p=>{ const m=money(p,S.per), on=p.k===S.plan;
      return `<div class="pc${on?' on':''}" role="radio" aria-checked="${on}" tabindex="${on?0:-1}" data-k="${p.k}">
        <div class="h"><span class="rad"></span>${PLI[p.k]||''}<b>${esc(T(p.n))}</b>${p.tag?`<span class="tag">${esc(T(p.tag))}</span>`:''}<span class="pr">$${m.v}<small>${esc(T(m.u))}</small></span></div>
        <div class="who"><span>${esc(T(p.who))}</span><span class="trP">${esc(T('30 days free'))}</span>${S.per==='h'&&!p.h?`<span class="mut" style="font-size:12px">${esc(T('Monthly only.'))}</span>`:''}</div>
        <ul>${p.f.map(x=>`<li>${I.check}<span>${esc(T(x))}</span></li>`).join('')}</ul>
        ${p.ideal?`<div class="ideal"><b>${esc(T('Ideal for:'))}</b> <span>${esc(T(p.ideal))}</span></div>`:''}</div>`; }).join('');
    $('plans').querySelectorAll('.pc').forEach(c=>{ c.onclick=()=>pickPlan(c.dataset.k,true); c.onkeydown=e=>{ if(e.key===' '){ e.preventDefault(); pickPlan(c.dataset.k,true); } }; });
    const p=offer(S.plan), six=S.per==='h'&&p.h;
    $('planThen').innerHTML=`<span>${esc(T(six?`Then $${p.h} every 6 months.`:`Then $${p.m}/month.`))}</span> <span>${esc(T('Cancel anytime before the trial ends.'))}</span>`;
    if(focus){ const c=$('plans').querySelector('.pc.on'); if(c){ c.focus({preventScroll:true}); if(focus==='kb') c.scrollIntoView({block:'nearest',behavior:RM()?'auto':'smooth'}); } } }
  function pickPlan(k,focus){ S.plan=k; S.planTouched=true; drawPlans(focus); drawPrev(); }

  /* ---------- 3 account ---------- */
  function vAccount(){ const p=offer(S.plan), six=S.per==='h'&&p.h;
    const recap=six?`${T(p.n)} · 30 days free, then $${p.h} every 6 months.`:`${T(p.n)} · 30 days free, then $${p.m} a month.`;
    IN.innerHTML=`<div class="sx${dirB?' bk':''}">${stepper()}<h1 class="sH">${esc(T('Create your account'))}</h1><p class="sS">${esc(T(recap))}</p>
      <div class="socs"><button class="cta soc" data-social>${I.apple}<span>${esc(T('Continue with Apple'))}</span></button><button class="cta soc" data-social>${I.google}<span>${esc(T('Continue with Google'))}</span></button></div>
      <div class="or">${esc(T('or with your email'))}</div>
      <label class="fl" for="aN">${esc(T('FULL NAME'))}</label><div class="fi" id="fN">${ic(I.user)}<input id="aN" placeholder="Marie Scharapan" autocomplete="name" value="${esc(S.name)}"></div><div class="err" id="eN"></div>
      <label class="fl" for="aE">${esc(T('EMAIL'))}</label><div class="fi" id="fE">${ic(I.mail)}<input id="aE" type="email" inputmode="email" placeholder="you@stable.com" autocomplete="email" value="${esc(S.email)}"></div><div class="err" id="eE"></div>
      <label class="fl" for="aP">${esc(T('PASSWORD'))}</label><div class="fi" id="fP">${ic(I.lock)}<input id="aP" type="password" placeholder="${esc(T('8 characters or more'))}" autocomplete="new-password" value="${esc(S.pw)}"><button class="sh" id="aShow" type="button" aria-label="${esc(T('Show password'))}" title="${esc(T('Show password'))}">${ic(I.eye,19)}</button></div>
      <div class="pw" id="pw"><i></i><i></i><i></i><i></i></div><div class="pwT" id="pwT"></div>
      <button class="ck${S.terms?' on':''}" id="ckT" type="button" role="checkbox" aria-checked="${S.terms}"><i>${I.check}</i><span><span>${esc(T('I am 18 or older and I agree to the'))}</span> <a href="#" onclick="event.stopPropagation();return false">${esc(T('Terms'))}</a> <span>${esc(T('and the'))}</span> <a href="#" onclick="event.stopPropagation();return false">${esc(T('Privacy policy'))}</a>.</span></button>
      <button class="ck${S.news?' on':''}" id="ckM" type="button" role="checkbox" aria-checked="${S.news}"><i>${I.check}</i><span><span>${esc(T('Send me tips and news from StrydeUp.'))}</span> <span class="o">${esc(T('Optional'))}</span></span></button></div>`;
    FOOT.innerHTML=cta('goNext','Continue',true);
    const nE=$('aN'), eE=$('aE'), pE=$('aP');
    nE.oninput=()=>{ S.name=nE.value; accCheck(); drawPrev(); }; eE.oninput=()=>{ S.email=eE.value; accCheck(); }; pE.oninput=()=>{ S.pw=pE.value; accCheck(); };
    [nE,eE,pE].forEach(x=>x.onblur=()=>{ S.touched[x.id]=true; accCheck(); });
    $('aShow').onclick=()=>{ pE.type=pE.type==='password'?'text':'password'; const sh=pE.type==='password', b=$('aShow'); b.innerHTML=ic(sh?I.eye:I.eyeOff,19); b.setAttribute('aria-label',T(sh?'Show password':'Hide password')); b.title=T(sh?'Show password':'Hide password'); };
    $('ckT').onclick=()=>{ S.terms=!S.terms; $('ckT').classList.toggle('on',S.terms); $('ckT').setAttribute('aria-checked',S.terms); accCheck(); };
    $('ckM').onclick=()=>{ S.news=!S.news; $('ckM').classList.toggle('on',S.news); $('ckM').setAttribute('aria-checked',S.news); };
    IN.querySelectorAll('[data-social]').forEach(b=>b.onclick=()=>{ if(!S.name.trim()) S.name='Marie Scharapan'; if(!mailOk(S.email.trim())) S.email='marie@stable.com'; S.social=true; go('horses'); });
    $('goNext').onclick=next; accCheck();
    setTimeout(()=>{ try{ (S.name?(S.email?pE:eE):nE).focus({preventScroll:true}); }catch(e){} },380); }
  const accOk=()=>S.name.trim()&&mailOk(S.email.trim())&&S.pw.length>=8&&/\d/.test(S.pw)&&S.terms;
  function accCheck(all){ if(all) ['aN','aE','aP','ckT'].forEach(k=>S.touched[k]=true);
    const pw=S.pw, sc=pwScore(pw), col=['var(--bad)','var(--watch)','var(--watch)','var(--good)'][Math.max(0,sc-1)];
    document.querySelectorAll('#pw i').forEach((x,i)=>x.style.background=i<sc?col:'');
    const pt=$('pwT'); if(pt) pt.textContent=T(!pw?'Use 8 characters, with a number.':sc<2||!(pw.length>=8&&/\d/.test(pw))?'Too weak: 8 characters and a number':sc<3?'OK':sc<4?'Strong':'Very strong');
    const act=document.activeElement, tch=S.touched;
    const nBad=tch.aN&&!S.name.trim()&&act!==$('aN'), eBad=!!S.email&&!mailOk(S.email.trim())&&act!==$('aE')||tch.aE&&!S.email&&act!==$('aE'), pBad=tch.aP&&!(pw.length>=8&&/\d/.test(pw))&&act!==$('aP');
    const set=(f,e,bad,msg)=>{ const F=$(f), E=$(e); if(F) F.classList.toggle('bad',!!bad); if(E) E.textContent=bad?T(msg):''; };
    set('fN','eN',nBad,'Your full name, as on your profile');
    set('fE','eE',eBad,S.email?'This email looks incomplete':'Your email, we send the code there');
    const fP=$('fP'); if(fP) fP.classList.toggle('bad',!!pBad);
    const ck=$('ckT'); if(ck) ck.classList.toggle('bad',!!tch.ckT&&!S.terms);
    const g=$('goNext'); if(g) g.disabled=!accOk(); }

  /* ---------- 4 the code, and the code of Log in ---------- */
  let tm=null, left=600, rcool=30, tries=5, verifying=false;
  const otpHTML=id=>`<div class="otp sp" id="${id}">${[0,1,2,3,4,5].map(i=>`${i===3?'<span class="gap" aria-hidden="true"></span>':''}<input inputmode="numeric" maxlength="1" autocomplete="${i?'off':'one-time-code'}" aria-label="${esc(T(`Digit ${i+1}`))}">`).join('')}</div>
    <div class="otpE" id="otpE" role="status"></div>
    <div class="otpM"><span id="otpT"></span><button id="otpR" type="button" disabled></button></div>
    <div class="otpN">${ic(I.info)}<span>${esc(T("Can't find it? Look in spam or junk. The code is valid 10 minutes, the same time as in the email."))}</span></div>`;
  function startT(){ clearInterval(tm); left=600; rcool=30; tick(); tm=setInterval(tick,1000); }
  function tick(){ left=Math.max(0,left-1); rcool=Math.max(0,rcool-1);
    const t=$('otpT'), r=$('otpR'); if(!t||!r){ clearInterval(tm); return; }
    t.textContent=left?T(`Code valid for ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`):T('Code expired, send a new one');
    r.disabled=rcool>0; r.textContent=rcool>0?T(`Resend in ${rcool}s`):T('Resend code'); }
  const boxes=()=>[...document.querySelectorAll('.otp input')];
  const code=()=>boxes().map(x=>x.value).join('');
  function wireOtp(onDone){ const B=boxes(), o=document.querySelector('.otp'); tries=5; verifying=false;
    const state=()=>{ const g=$('goNext'); if(g) g.disabled=code().length<6; if(code().length===6) setTimeout(()=>verify(onDone),220); };
    B.forEach((b,i)=>{ b.oninput=()=>{ const v=b.value.replace(/\D/g,''); if(v.length>1){ fill(v,i); return; } b.value=v.slice(-1); o.className='otp sp'; const e=$('otpE'); e.textContent=''; e.className='otpE'; if(b.value&&i<5) B[i+1].focus(); state(); };
      b.onkeydown=e=>{ if(e.key==='Backspace'&&!b.value&&i>0){ e.preventDefault(); B[i-1].focus(); B[i-1].value=''; state(); }
        if(e.key==='ArrowLeft'&&i>0){ e.preventDefault(); B[i-1].focus(); } if(e.key==='ArrowRight'&&i<5){ e.preventDefault(); B[i+1].focus(); } };
      b.onfocus=()=>{ try{ b.select(); }catch(e){} };
      b.onpaste=e=>{ const t=((e.clipboardData||window.clipboardData).getData('text')||'').replace(/\D/g,''); if(!t) return; e.preventDefault(); fill(t,0); }; });
    const fill=(t,from)=>{ t.slice(0,6-from).split('').forEach((c,j)=>{ if(B[from+j]) B[from+j].value=c; }); B[Math.min(5,from+t.length)].focus(); state(); };
    $('otpR').onclick=()=>{ if(rcool>0) return; startT(); B.forEach(x=>x.value=''); B[0].focus(); const e=$('otpE'); e.className='otpE info'; e.textContent=T('A new code is on its way.'); state(); };
    startT(); setTimeout(()=>{ try{ B[0].focus({preventScroll:true}); }catch(e){} },400); }
  function verify(onDone){ const o=document.querySelector('.otp'); if(!o||code().length<6||o.classList.contains('ok')||verifying) return;
    if(code()==='000000'||!left){ tries=Math.max(0,tries-1); o.className='otp sp'; void o.offsetWidth; o.className='otp sp bad'; const e=$('otpE'); e.className='otpE';
      e.textContent=!left?T('This code has expired. Send a new one.'):T(`That code is not right. ${tries} attempt${tries>1?'s':''} left.`); return; }
    verifying=true; o.className='otp sp ok'; clearInterval(tm); setTimeout(onDone,650); }
  function vCode(){
    IN.innerHTML=`<div class="sx${dirB?' bk':''}">${stepper()}<div class="mailI">${ic(I.mail)}</div><h1 class="sH">${esc(T('Check your email'))}</h1>
      <p class="sS"><span>${esc(T('We sent a 6-digit code to'))}</span> <b translate="no">${esc(S.email.trim())}</b></p>${otpHTML('otp')}</div>`;
    FOOT.innerHTML=`${cta('goNext','Verify',true)}<div class="ctaLink"><span>${esc(T('Wrong email?'))}</span> <button id="chMail" type="button">${esc(T('Change it'))}</button></div>`;
    $('chMail').onclick=back; $('goNext').onclick=()=>verify(()=>go('horses')); wireOtp(()=>go('horses')); }

  /* ---------- 5 horses ---------- */
  function vHorses(){ const one=S.plan==='premium', full=one&&S.horses.length>=1;
    const n=S.horses.length, h0=S.horses[0], open=!n||S.hfOpen;
    const sub=n?T(`${h0.name} is added. One step left.`):T('Two steps and you get your first analysis.');
    const row=(h,i)=>`<div class="ci done hI"><span class="hAv">${esc(ini(h.name))}</span><span class="t"><b>${esc(h.name)}</b><span>${esc(hDesc(h))}</span></span><span class="okS">${ic(I.check,14)}</span><button class="x" data-del="${i}" aria-label="${esc(T('Remove'))} ${esc(h.name)}" title="${esc(T('Remove'))}">${ic(I.x)}</button></div>`;
    IN.innerHTML=`<div class="sx${dirB?' bk':''}">${stepper()}<div class="yay"><span class="ok">${ic(I.check)}</span></div><h1 class="sH">${esc(T(`You're in, ${firstName()}.`))}</h1><p class="sS" id="hSub">${esc(sub)}</p>
      <div class="cl">
        ${S.horses.map(row).join('')}
        ${full?`<div class="prem">${ic(I.info)}<span><b>${esc(T('One horse with Premium'))}</b><br><span>${esc(T('Premium follows one horse in depth. To add a second horse, switch to Pro: unlimited horses, same analysis.'))}</span></span></div>`
          :open?hForm(n):`<button class="ci addH" id="hOpen" type="button"><span class="n">${ic(I.plus)}</span><span class="t"><b>${esc(T('Add another horse'))}</b><span>${esc(T('Name, age, height. About a minute.'))}</span></span></button>`}
        <div class="ci ${n?'cur':'lock'}"><span class="n">2</span><span class="t"><b>${esc(T('Add your first session'))}</b><span>${esc(T('From your dashboard, with Upload video.'))}</span></span>${n?`<span class="pill blue">${esc(T('Up next'))}</span>`:''}</div></div></div>`;
    FOOT.innerHTML=cta('goNext','Open my dashboard',!n&&!hfOk());
    $('goNext').onclick=next;
    IN.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{ S.horses.splice(+b.dataset.del,1); render(true); drawPrev(); });
    const o=$('hOpen'); if(o) o.onclick=()=>{ S.hfOpen=true; render(true); setTimeout(()=>{ const x=$('hN'); if(x) x.focus(); },40); };
    wireHForm(); }
  const hDesc=h=>[h.sex?T(h.sex):null,+h.year?T(`${2026-(+h.year)} years`):null,h.breed?T(h.breed):null,+h.height?h.height+' cm':null].filter(Boolean).join(' · ')||T('Details can wait');
  const hfOk=()=>!!(S.hf.name.trim()&&S.hf.sex);
  function hForm(n){ const H=S.hf;
    return `<div class="hf" id="hf"><div class="hfH"><span class="n">${n?ic(I.plus):'1'}</span><span class="t"><b>${esc(T(n?'Add another horse':'Add your horse'))}</b><span>${esc(T('Name, age, height. About a minute.'))}</span></span></div><label class="fl" for="hN">${esc(T("What's your horse called?"))}</label>
      <div class="fi">${ic(I.horse)}<input id="hN" placeholder="${esc(T('Horse name'))}" autocomplete="off" value="${esc(H.name)}"></div>
      <div class="fl" id="hSexL">${esc(T('SEX'))}</div><div class="seg" role="radiogroup" aria-labelledby="hSexL">${[['Mare','Female'],['Gelding','Castrated male'],['Stallion','Entire male']].map(([v,s])=>`<button type="button" role="radio" aria-checked="${H.sex===v}" class="${H.sex===v?'on':''}" data-sex="${v}" title="${esc(T(s))}">${esc(T(v))}</button>`).join('')}</div>
      <div class="hfRow"><div><label class="fl" for="hB">${esc(T('BREED'))} <span style="text-transform:none;letter-spacing:0;font-weight:500;color:var(--dim)">${esc(T('optional'))}</span></label><div class="fi"><select id="hB"><option value="">${esc(T('Pick a breed or studbook'))}</option>${BREEDS.map(b=>`<option value="${esc(b)}"${H.breed===b?' selected':''}>${esc(T(b))}</option>`).join('')}</select><span class="ico" style="width:16px;height:16px">${L('<path d="M7 10l5 5 5-5"/>',1.8)}</span></div></div>
        <div><label class="fl" for="hY">${esc(T('BORN IN'))}</label><div class="fi"><input id="hY" inputmode="numeric" maxlength="4" placeholder="2016" value="${esc(H.year)}"></div></div>
        <div><label class="fl" for="hH">${esc(T('HEIGHT'))}</label><div class="fi"><input id="hH" inputmode="numeric" maxlength="3" placeholder="168" value="${esc(H.height)}"><span class="u">cm</span></div></div></div>
      <div class="hfAdd"><span class="mut" id="hHint">${esc(T(H.sex||!H.name?'Height measured at the withers, in centimetres.':'Sex is needed, the rest helps us read the results.'))}</span><button class="btn pri" id="hAdd" type="button"${hfOk()?'':' disabled'}>${ic(I.plus)}<span>${esc(T(n?'Add this horse':'Add my horse'))}</span></button></div></div>`; }
  function wireHForm(){ const f=$('hf'); if(!f) return; const H=S.hf;
    const ok=()=>{ $('hAdd').disabled=!hfOk(); const g=$('goNext'); if(g) g.disabled=!S.horses.length&&!hfOk(); $('hHint').textContent=T(H.sex||!H.name.trim()?'Height measured at the withers, in centimetres.':'Sex is needed, the rest helps us read the results.'); };
    $('hN').oninput=e=>{ H.name=e.target.value; ok(); }; $('hY').oninput=e=>{ H.year=e.target.value.replace(/\D/g,''); e.target.value=H.year; };
    $('hH').oninput=e=>{ H.height=e.target.value.replace(/\D/g,''); e.target.value=H.height; }; $('hB').onchange=e=>{ H.breed=e.target.value; };
    f.querySelectorAll('[data-sex]').forEach(b=>b.onclick=()=>{ H.sex=b.dataset.sex; f.querySelectorAll('[data-sex]').forEach(x=>{ x.classList.toggle('on',x===b); x.setAttribute('aria-checked',x===b); }); ok(); });
    $('hAdd').onclick=addHorse;
    if(!S.horses.length) setTimeout(()=>{ try{ $('hN').focus({preventScroll:true}); }catch(e){} },420); }
  function addHorse(){ const H=S.hf; if(!hfOk()) return false; const name=H.name.trim().replace(/\s+/g,' ');
    if(!S.horses.some(x=>x.name.toLowerCase()===name.toLowerCase())) S.horses.push({name,sex:H.sex,year:H.year,height:H.height,breed:H.breed});
    S.hf={name:'',sex:null,year:'',height:'',breed:''}; S.hfOpen=false; render(true); drawPrev(); setTimeout(()=>{ const g=$('goNext'); if(g) g.focus({preventScroll:true}); },60); return true; }

  /* ---------- log in: email, then the code, then the dashboard ---------- */
  function vLogin(){ const Lg=S.login;
    if(!Lg.stage){
      IN.innerHTML=`<div class="sx mid${dirB?' bk':''}"><div class="mailI">${ic(I.user)}</div><h1 class="sH">${esc(T('Welcome back'))}</h1><p class="sS">${esc(T('Log in with your email. We send you a 6-digit code, no password needed.'))}</p>
        <label class="fl" for="lE">${esc(T('EMAIL'))}</label><div class="fi" id="fLE">${ic(I.mail)}<input id="lE" type="email" inputmode="email" placeholder="you@stable.com" autocomplete="email" value="${esc(Lg.email)}"></div><div class="err" id="eLE"></div></div>`;
      FOOT.innerHTML=`${cta('goNext','Send me a code',!mailOk(Lg.email.trim()))}<div class="ctaLink"><span>${esc(T('New to StrydeUp?'))}</span> <button id="goNew" type="button">${esc(T('Create an account'))}</button></div>`;
      const e=$('lE'); e.oninput=()=>{ Lg.email=e.value; $('goNext').disabled=!mailOk(Lg.email.trim()); $('fLE').classList.remove('bad'); $('eLE').textContent=''; };
      $('goNext').onclick=next; $('goNew').onclick=()=>go('role'); setTimeout(()=>{ try{ e.focus({preventScroll:true}); }catch(x){} },380); return; }
    IN.innerHTML=`<div class="sx mid"><div class="mailI">${ic(I.mail)}</div><h1 class="sH">${esc(T('Check your email'))}</h1>
      <p class="sS"><span>${esc(T('We sent a 6-digit code to'))}</span> <b translate="no">${esc(Lg.email.trim())}</b></p>${otpHTML('otp')}</div>`;
    FOOT.innerHTML=`${cta('goNext','Log in',true)}<div class="ctaLink"><span>${esc(T('Wrong email?'))}</span> <button id="chMail" type="button">${esc(T('Change it'))}</button></div>`;
    $('chMail').onclick=()=>{ Lg.stage=0; render(true); }; $('goNext').onclick=()=>verify(loginDone); wireOtp(loginDone); }
  /* the account created on this computer opens as it is; any other email opens the demo dashboard */
  function loginDone(){ let me=null; try{ me=JSON.parse(LSget('sdMe')); }catch(e){}
    const mine=me&&me.email&&me.email.toLowerCase()===S.login.email.trim().toLowerCase();
    if(mine){ const p=LSget('sdPlan')||'pro'; leave('Opening your dashboard','index.html?plan='+encodeURIComponent(p)); }
    else leave('Opening your dashboard','index.html?demo=1&plan=pro'); }

  /* ---------- the end: the account you just created is the one you land in (same keys as the phone) ---------- */
  function finish(){ const P=accountOf();
    try{ CLEAN.forEach(k=>localStorage.removeItem(k)); Object.keys(localStorage).filter(k=>/^sdHomeTrends_/.test(k)).forEach(k=>localStorage.removeItem(k)); }catch(e){}
    LSset('sdPlan',P);
    if(P==='vet') LSset('sdJob_vet',S.job);
    LSset('sdMe',JSON.stringify({name:firstName(),full:S.name.trim(),email:S.email.trim(),roles:S.roles.slice(),
      horse:S.horses[0]?{name:S.horses[0].name}:null,horses:S.horses.map(h=>h.name),sent:false,trial:{plan:S.plan,start:Date.now(),days:30}}));
    leave('Setting up your dashboard','index.html?plan='+P); }
  function leave(msg,href){ clearInterval(tm); storiesStop(); const l=$('suLeave'); $('suLeaveT').textContent=T(msg); l.classList.add('on');
    setTimeout(()=>{ location.href=href; },RM()?60:900); }

  /* ---------- moving between steps ---------- */
  let dirB=false;
  const ORDER=['welcome','role','plan','account','code','horses'];
  function go(step,isBack){ dirB=!!isBack; S.step=step; if(step!=='code'&&step!=='login') clearInterval(tm); render(); scrollTo({top:0,behavior:RM()?'auto':'smooth'}); }
  function back(){ if(S.step==='login'){ if(S.login.stage){ S.login.stage=0; render(true); return; } go('welcome',true); return; }
    if(S.step==='horses'){ go(S.social?'account':'code',true); return; }
    const i=ORDER.indexOf(S.step); go(ORDER[Math.max(0,i-1)],true); }
  function next(){ const s=S.step;
    if(s==='welcome') return go('role');
    if(s==='role'){ if(S.roles.length) go('plan'); return; }
    if(s==='plan') return go('account');
    if(s==='account'){ if(accOk()){ S.social=false; go('code'); } else { accCheck(true); const f=[['aN',!S.name.trim()],['aE',!mailOk(S.email.trim())],['aP',!(S.pw.length>=8&&/\d/.test(S.pw))],['ckT',!S.terms]].find(x=>x[1]); if(f) $(f[0]).focus(); } return; }
    if(s==='code') return verify(()=>go('horses'));
    if(s==='horses'){ if(hfOk()){ const H=S.hf; const name=H.name.trim().replace(/\s+/g,' '); if(!S.horses.some(x=>x.name.toLowerCase()===name.toLowerCase())) S.horses.push({name,sex:H.sex,year:H.year,height:H.height,breed:H.breed}); S.hf={name:'',sex:null,year:'',height:'',breed:''}; }
      if(S.horses.length) finish(); else { const n=$('hN'); if(n) n.focus(); } return; }
    if(s==='login'){ const Lg=S.login; if(!Lg.stage){ if(mailOk(Lg.email.trim())){ Lg.stage=1; render(); } else { $('fLE').classList.add('bad'); $('eLE').textContent=T('This email looks incomplete'); } } else verify(loginDone); } }
  function render(noAnim){
    const V={welcome:vWelcome,role:vRole,plan:vPlan,account:vAccount,code:vCode,horses:vHorses,login:vLogin}[S.step]||vWelcome;
    V(); if(noAnim===true){ const x=IN.querySelector('.sx'); if(x) x.classList.remove('sx','bk'); }
    const bk=$('suBack'); bk.hidden=S.step==='welcome';
    document.title=`StrydeUp · ${T(S.step==='login'?'Log in':'Sign up')}`;
    artMode(); }

  /* ---------- keyboard: Enter continues, 1 to 8 pick the roles, the arrows move between plans ---------- */
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){ if(popEl){ closePop(); return; } }
    const t=e.target, tag=t&&t.tagName, typing=/INPUT|TEXTAREA|SELECT/.test(tag||'');
    if(e.key==='Enter'&&!e.isComposing&&!e.metaKey&&!e.ctrlKey&&!e.altKey){
      if(popEl) return;
      /* a choice (role, plan, job, terms) is picked with a click or Space: Enter on it continues */
      if(tag==='BUTTON'||tag==='A'){ if(t.closest('#hf')){ if(t.dataset.sex){ e.preventDefault(); if(!addHorse()) $('hN').focus(); } return; }
        if(t.id==='goNext'||t.closest('.wlBars,.ctaLink,.hI,.socs')||t.id==='suBack'||t.id==='suLang'||t.id==='suTheme'||t.id==='goLogin'||t.id==='hOpen'||(tag==='A'&&!t.closest('.ck'))) return; }
      if(S.step==='horses'&&t&&t.id==='hN'&&S.hf.name.trim()){ e.preventDefault(); if(!addHorse()){ const s=document.querySelector('#hf [data-sex]'); if(s) s.focus(); } return; }
      if(tag==='SELECT') return;
      e.preventDefault(); next(); return; }
    if(typing||e.metaKey||e.ctrlKey||e.altKey) return;
    if(S.step==='role'&&/^[1-8]$/.test(e.key)){ const r=ROLES[+e.key-1]; if(r){ e.preventDefault(); toggleRole(r[0]); const b=IN.querySelector(`.role[data-r="${r[0]}"]`); if(b) b.focus({preventScroll:true}); } }
    if(S.step==='plan'&&(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='ArrowRight'||e.key==='ArrowLeft')&&(!t.closest||!t.closest('.per'))){ e.preventDefault();
      const i=OFFERS.findIndex(o=>o.k===S.plan), d=e.key==='ArrowDown'||e.key==='ArrowRight'?1:-1; pickPlan(OFFERS[(i+d+OFFERS.length)%OFFERS.length].k,'kb'); }
  });

  /* ---------- top bar: back, language, theme ---------- */
  $('suBack').innerHTML=ic(I.back); $('suBack').onclick=back;
  $('suLang').innerHTML=`${ic(I.globe,17)}<span translate="no">${esc(LG.toUpperCase())}</span>`;
  const LG_SUB={en:'Continue in English',fr:'Continuer en français',it:'Continua in italiano',es:'Continuar en español',de:'Auf Deutsch weiter'};
  let popEl=null;
  function closePop(){ if(!popEl) return; const p=popEl; popEl=null; p.classList.remove('on'); $('suLang').classList.remove('on'); setTimeout(()=>p.remove(),200); }
  $('suLang').onclick=e=>{ e.stopPropagation(); if(popEl){ closePop(); return; } const b=$('suLang');
    document.body.insertAdjacentHTML('beforeend',`<div class="wPop" role="menu" style="width:240px"><div class="gl">${esc(T('Choose your language'))}</div>${(window.SD_LANGS||[['en','English']]).map(([c,n])=>`<button class="mi${c===LG?' on':''}" data-c="${c}" role="menuitemradio" aria-checked="${c===LG}" translate="no"><span class="t">${esc(n)}<span class="sub">${esc(LG_SUB[c]||'')}</span></span><span class="ico ck">${I.check}</span></button>`).join('')}</div>`);
    const p=document.body.lastElementChild, r=b.getBoundingClientRect(); popEl=p; b.classList.add('on');
    p.style.left=Math.max(12,Math.min(innerWidth-p.offsetWidth-12,r.right-p.offsetWidth))+'px'; p.style.top=(r.bottom+8)+'px'; void p.offsetHeight; p.classList.add('on');
    p.querySelectorAll('.mi').forEach(m=>m.onclick=()=>{ const c=m.dataset.c; closePop(); if(c===LG) return; LSset('sdLangAsked','1'); keep(); if(window.setLang) setLang(c); });
    const f=p.querySelector('.mi.on')||p.querySelector('.mi'); if(f) f.focus(); };
  document.addEventListener('pointerdown',e=>{ if(popEl&&!popEl.contains(e.target)&&e.target!==$('suLang')&&!$('suLang').contains(e.target)) closePop(); });
  const themeBtn=()=>{ const l=theme()==='light', b=$('suTheme'); b.innerHTML=ic(l?I.moon:I.sun); b.setAttribute('aria-label',T(l?'Dark mode':'Light mode')); b.title=T(l?'Dark mode':'Light mode'); };
  $('suTheme').onclick=()=>{ const light=theme()!=='light'; LSset('sdTheme',light?'light':'dark'); document.documentElement.dataset.theme=light?'light':'dark'; themeBtn();
    const s=$('stShot'); if(s){ s.parentNode.style.display=''; s.src=shotSrc(); } };
  themeBtn();

  /* ---------- go ---------- */
  drawStories();
  render(true);
  /* once the dictionary of another language is ready, draw again so every T() above is translated */
  addEventListener('sds-i18n',()=>{ if(S.step==='welcome'||S.step==='login'){ drawStories(); sk=-1; storiesOn=false; } render(true); });
  window.SDS={state:S,go,next,accountOf};   /* for the checks (web/signup tests) */
})();
