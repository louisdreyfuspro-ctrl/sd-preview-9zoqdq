/* StrydeUp, account types.
   pro     : one rider, unlimited horses (the original screens, unchanged)
   premium : one rider, one horse, the app is built around that horse
   owner   : Stable Owner, the master admin: every rider, every horse, the team
   rider   : a rider inside a stable: only the horses the owner gave them, billing handled by the stable
   Chosen with ?plan= in the URL (boards) or kept in localStorage 'sdPlan' (Profile > Account type). */
(function(){
  /* motion shared by the charts: numbers count up, a chart wipes in from the left, only when what it shows changes */
  const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.SD_COUNT=(root,dur=650)=>{ if(!root||RM()) return; const w=document.createTreeWalker(root,4), L=[]; let n;
    while((n=w.nextNode())) if(/^\s*\d+(\.\d+)?\s*%?\s*$/.test(n.nodeValue)) L.push(n);
    L.forEach(t=>{ const s=t.nodeValue, num=parseFloat(s), dec=((s.match(/\.(\d+)/)||[,''])[1]).length, from=num*.82, t0=performance.now();
      const step=now=>{ const k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,4); t.nodeValue=s.replace(/\d+(\.\d+)?/,(from+(num-from)*e).toFixed(dec)); if(k<1) requestAnimationFrame(step); };
      requestAnimationFrame(step); }); };
  window.SD_WIPE=(el,delay=0)=>{ if(!el||RM()||!el.animate) return;
    el.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],{duration:850,delay,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'}); };
  window.SD_FADE=(el,delay=0)=>{ if(!el||RM()||!el.animate) return; el.animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:380,delay,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'}); };
  const P=['pro','premium','owner','rider','vet','farrier','groom'];
  let plan=null; try{ plan=new URLSearchParams(location.search).get('plan'); }catch(e){}
  /* a link with ?plan= also becomes the account type you stay in (not inside the TV boards' frames) */
  if(P.includes(plan)&&window.top===window){ try{ localStorage.setItem('sdPlan',plan); }catch(e){} }
  try{ if(new URLSearchParams(location.search).get('demo')==='1') localStorage.removeItem('sdMe'); }catch(e){}
  if(!P.includes(plan)){ try{ plan=localStorage.getItem('sdPlan'); }catch(e){} }
  if(!P.includes(plan)) plan='pro';
  window.SD_PLAN=plan;
  /* horse names offered when adding a video */
  if(['vet','farrier','groom'].includes(plan)){ const ids=(()=>{ let F={}; try{ F=JSON.parse(localStorage.getItem('sdStaffHorses'))||{}; }catch(e){} const ini={vet:'AK',farrier:'LB',groom:'PG'}[plan]; return F[ini]||({AK:['mb','sa']}[ini])||['mb','qz','bd','sa','nl']; })();
    const N={mb:'Midnight Bolt',qz:'Quintus Z',bd:'Bella Donna',sa:'Silver Arrow',nl:'Nova de Lys'}; window.SD_HN=ids.map(i=>N[i]); }
  if(plan==='premium') window.SD_HN=['Quintus Z']; if(plan==='rider') window.SD_HN=['Midnight Bolt','Silver Arrow','Kalinka'];
  /* a rider of a stable can follow their own horses too: kept apart, private, never in the stable's numbers */
  window.SD_PERSONAL=()=>{ if(plan!=='rider') return []; let L=[]; try{ L=JSON.parse(localStorage.getItem('sdPersonal'))||[]; }catch(e){}
    return [{id:'p_kal',n:'Kalinka',breed:'Selle Français',age:9,sex:'Mare',coat:'Bay',level:'1.20 m',r:'John Doe',perf:66,d:2,lastD:3,month:4,height:165,personal:true},...L]; };
  window.SD_ADD_PERSONAL=H=>{ let L=[]; try{ L=JSON.parse(localStorage.getItem('sdPersonal'))||[]; }catch(e){}
    const yr=+H.year; L.push({id:'p'+Date.now(),n:H.name,breed:H.breed||'—',age:yr?2026-yr:'—',sex:H.sex,coat:H.coat||'—',level:H.level||'—',height:+H.height||null,r:'John Doe',perf:null,d:0,lastD:999,month:0,personal:true});
    try{ localStorage.setItem('sdPersonal',JSON.stringify(L)); }catch(e){} };
  document.documentElement.dataset.plan=plan;
  window.SD_PLANS={pro:{name:'Pro',badge:'PRO',me:'Marie'},premium:{name:'Premium',badge:'PREMIUM',me:'Marie'},
    owner:{name:'Stable Owner',badge:'OWNER',me:'Marie'},rider:{name:'Rider',badge:'RIDER',me:'John'},
    vet:{name:'Vet',badge:'VET',me:'Anne',full:'Dr. Anne Keller',ini:'AK',role:'Vet',email:'anne@vet-keller.ch'},
    farrier:{name:'Farrier',badge:'FARRIER',me:'Lucas',full:'Lucas Bernard',ini:'LB',role:'Farrier',email:'lucas@bernard-farrier.ch'},
    groom:{name:'Groom',badge:'GROOM',me:'Paul',full:'Paul Girard',ini:'PG',role:'Groom',email:'paul@stable.com'}};
  /* professionals of the stable: vet, farrier, groom. They see only the horses they follow (chosen by them or the owner) */
  window.SD_STAFF=['vet','farrier','groom'].includes(plan);
  if(window.SD_STAFF) document.documentElement.classList.add('staff');
  window.SD_FOLLOW=()=>{ const me=SD_PLANS[plan]; let F={}; try{ F=JSON.parse(localStorage.getItem('sdStaffHorses'))||{}; }catch(e){}
    return F[me.ini]||({AK:['mb','sa'],LB:['mb','qz','bd','sa','nl'],PG:['mb','qz','bd','sa','nl']}[me.ini]); };
  window.SD_SHOES={mb:'All four',qz:'All four',bd:'Front only',sa:'All four',nl:'Barefoot'};
  window.SD_STABLE='Écurie Marie S.';
  window.setPlan=p=>{ try{ localStorage.setItem('sdPlan',p); }catch(e){}
    const u=new URL(location.href); u.searchParams.delete('plan'); location.href=u.toString(); };
  /* which horses this account sees */
  window.planHorses=list=>plan==='premium'?list.filter(h=>h.id==='qz')
    :plan==='rider'?list.filter(h=>(h.r||h.rider)==='John Doe'):SD_STAFF?list.filter(h=>SD_FOLLOW().includes(h.id))
    :(window.SD_MYIDS&&plan==='pro')?list.filter(h=>SD_MYIDS.includes(h.id)):list;
  /* keep ?plan= on internal links, so a board preview stays in its account type */
  if(new URLSearchParams(location.search).get('plan')) document.addEventListener('click',e=>{ const a=e.target.closest('a[href]'); if(!a) return;
    const h=a.getAttribute('href'); if(!h||!/^Etape/.test(h)) return; const u=new URL(h,location.href); u.searchParams.set('plan',plan); a.href=u.toString(); },true);
  /* the person who signed up: their first name everywhere, and their horse on Home */
  let ME=null; try{ ME=JSON.parse(localStorage.getItem('sdMe')); }catch(e){}
  window.SD_ME=ME;
  /* a new account sees ITS horses and ITS name: the sample data of the demo horses is shown under their names (test app, sample numbers) */
  const MYH=ME?(ME.horses&&ME.horses.length?ME.horses:ME.horse&&ME.horse.name?[ME.horse.name]:[]).map(n=>String(n).trim()).filter(Boolean):[];
  if(ME&&(MYH.length||ME.name)&&['pro','premium','owner'].includes(plan)){
    const DEMO=plan==='premium'?[['qz','Quintus Z','QZ']]:[['mb','Midnight Bolt','MB'],['qz','Quintus Z','QZ'],['bd','Bella Donna','BD'],['sa','Silver Arrow','SA'],['nl','Nova de Lys','NL']];
    const ini=n=>n.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const MAP=[], INI={};
    MYH.slice(0,DEMO.length).forEach((n,i)=>{ MAP.push([DEMO[i][1],n]); INI[DEMO[i][2]]=ini(n); });
    if(MYH.length&&plan==='premium'){ MAP.push(['Midnight Bolt',MYH[0]]); INI.MB=ini(MYH[0]); }
    if(MYH.length&&plan==='pro') window.SD_MYIDS=DEMO.slice(0,MYH.length).map(d=>d[0]);
    if(MYH.length&&plan!=='owner') window.SD_HN=MYH.slice(0,DEMO.length);
    const FN=(ME.name||'').trim(), FULL=(ME.full||FN).trim();
    if(FULL){ MAP.push(['Marie S.',FULL]); if(plan!=='owner') ['John Doe','Lea Martin'].forEach(r=>MAP.push([r,FULL])); }
    if(FN) MAP.push(['Marie',FN]);
    const fix=n=>{ let v=n.nodeValue, o=v; MAP.forEach(([a,b])=>{ if(v.includes(a)) v=v.split(a).join(b); }); const t=v.trim(); if(INI[t]) v=v.replace(t,INI[t]); if(v!==o) n.nodeValue=v; };
    const walk=r=>{ if(r.nodeType===3) return fix(r); if(r.nodeType!==1||/^(SCRIPT|STYLE)$/.test(r.nodeName)) return; const w=document.createTreeWalker(r,4); let n; while((n=w.nextNode())) fix(n); };
    new MutationObserver(L=>L.forEach(m=>{ if(m.type==='characterData') fix(m.target); else m.addedNodes.forEach(walk); })).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
    document.addEventListener('DOMContentLoaded',()=>walk(document.body)); }
  if(ME&&ME.name&&['pro','premium','owner'].includes(plan)){ SD_PLANS[plan].me=ME.name;
    document.addEventListener('DOMContentLoaded',()=>{ const T=x=>(window.SD_T||(y=>y))(x);
      const n=document.querySelector('.hi .n'); if(n) n.textContent=ME.name;
      const av=document.querySelector('.av'); if(av&&av.firstChild&&av.firstChild.nodeType===3) av.firstChild.nodeValue=ME.name[0].toUpperCase();
      const pN=document.getElementById('pN'), pE=document.getElementById('pE'); if(pN) pN.textContent=ME.full||ME.name; if(pE&&ME.email) pE.textContent=ME.email;
      const avp=document.getElementById('av'); if(avp&&avp.firstChild&&avp.firstChild.nodeType===3) avp.firstChild.nodeValue=ME.name[0].toUpperCase();
      const eb=document.getElementById('errBan'); if(eb&&window.SD_MYIDS&&!SD_MYIDS.includes('nl')) eb.style.display='none';
      if(ME.horse&&ME.sent&&document.getElementById('errBan')){ const w=document.querySelector('.wrap');
        w.insertAdjacentHTML('afterbegin',`<div class="sec in"><div class="card" style="display:flex;align-items:center;gap:12px"><span style="width:44px;height:44px;border-radius:50%;background:rgba(59,130,246,.14);display:grid;place-items:center;font-weight:800;color:#8DB8FF;flex:0 0 auto">${ME.horse.name.slice(0,2).toUpperCase()}</span>
          <div style="flex:1;min-width:0"><b style="display:block;font-size:15px">${ME.horse.name}</b><span style="display:block;font-size:12.5px;color:var(--mut);margin-top:2px">${T(ME.sent?'First video being analysed, about 3 minutes':'Add a first video to get the analysis')}</span>
          ${ME.sent?'<div style="height:4px;border-radius:2px;background:rgba(255,255,255,.08);margin-top:8px;overflow:hidden"><i style="display:block;height:100%;width:62%;background:#3B82F6;border-radius:2px"></i></div>':''}</div></div></div>`); } });
  }
  if(plan==='pro') return;

  const T=x=>(window.SD_T||(y=>y))(x);
  const css=`
  .plSheet{position:fixed;left:0;right:0;bottom:0;max-width:420px;margin:0 auto;z-index:191;background:#161B23;border-top-left-radius:22px;border-top-right-radius:22px;border:1px solid rgba(255,255,255,.07);
    padding:10px 18px 28px;transform:translateY(105%);transition:transform .34s cubic-bezier(.32,.72,0,1);max-height:92vh;overflow-y:auto;color:#F2F5F8}
  .plSheet.on{transform:none}
  .plVeil{position:fixed;inset:0;background:rgba(4,6,9,.62);z-index:190;opacity:0;pointer-events:none;transition:opacity .25s} .plVeil.on{opacity:1;pointer-events:auto}
  .plSheet .grab{width:38px;height:5px;border-radius:3px;background:rgba(255,255,255,.18);margin:0 auto 12px}
  .plSheet h3{font-size:19px;font-weight:800;letter-spacing:-.3px} .plSheet .sub{font-size:13px;color:#8A94A3;margin-top:5px;line-height:1.45}
  .plSheet .k{font-size:10px;font-weight:800;letter-spacing:.8px;color:#8A94A3;margin:16px 2px 8px}
  .plIn{width:100%;font:inherit;font-size:14.5px;color:#F2F5F8;background:#14181F;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:12px;outline:none} .plIn:focus{border-color:#3B82F6}
  .plChips{display:flex;flex-wrap:wrap;gap:7px} .plChips button{font:inherit;font-size:13px;font-weight:700;color:#C7CFDB;background:#14181F;border:1px solid rgba(255,255,255,.07);border-radius:999px;padding:8px 13px;cursor:pointer}
  .plChips button.on{background:#3B82F6;border-color:#3B82F6;color:#fff}
  .plBtn{width:100%;margin-top:18px;font:inherit;font-size:15.5px;font-weight:800;color:#fff;background:#3B82F6;border:0;border-radius:16px;padding:15px;cursor:pointer} .plBtn:disabled{opacity:.45}
  .plBtn.sec{background:rgba(255,255,255,.06);margin-top:10px}
  .plFeat{display:flex;gap:11px;align-items:center;padding:11px 0;border-top:1px solid rgba(255,255,255,.07)} .plFeat:first-of-type{border-top:0}
  .plFeat .i{width:34px;height:34px;border-radius:11px;background:rgba(59,130,246,.12);display:grid;place-items:center;flex:0 0 auto}
  .plFeat svg{width:18px;height:18px;stroke:#5B9BFF;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .plFeat b{display:block;font-size:13.5px} .plFeat span{font-size:12px;color:#8A94A3}
  #ahWhere{position:absolute;left:0;right:0;top:64px;bottom:0;z-index:5;background:var(--bg,#0A0C10);padding:18px 18px 30px;overflow-y:auto}
  #ahWhere h2{font-size:24px;font-weight:800;letter-spacing:-.5px} #ahWhere .sub{font-size:13.5px;color:#8A94A3;margin:6px 0 18px;line-height:1.45}
  .whO{width:100%;display:flex;gap:14px;align-items:center;text-align:left;font:inherit;color:#F2F5F8;padding:16px;border-radius:18px;background:linear-gradient(180deg,#1B212B,#161B23);border:1.5px solid rgba(255,255,255,.08);margin-top:10px;cursor:pointer}
  .whO:active{border-color:#3B82F6} .whO b{display:block;font-size:15.5px} .whO span:not(.whI){display:block;font-size:12.5px;color:#8A94A3;margin-top:3px;line-height:1.4}
  .whI{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;flex:0 0 auto} .whI svg{width:24px;height:24px;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  html[data-theme="light"] .plSheet{background:var(--card);color:var(--txt)} html[data-theme="light"] .plIn,html[data-theme="light"] .plChips button{background:var(--card2,#F2F4F7);color:var(--txt)}`;
  document.head.insertAdjacentHTML('beforeend',`<style id="planCss">${css}</style>`);

  function sheet(html,wire){
    let s=document.getElementById('plSheet');
    if(!s){ document.body.insertAdjacentHTML('beforeend','<div class="plVeil" id="plVeil"></div><div class="plSheet" id="plSheet" role="dialog"></div>'); s=document.getElementById('plSheet');
      document.getElementById('plVeil').onclick=()=>window.plClose(); }
    s.innerHTML='<div class="grab"></div>'+html; s.scrollTop=0; wire&&wire(s);
    document.getElementById('plVeil').classList.add('on'); s.classList.add('on');
  }
  window.plClose=()=>{ const s=document.getElementById('plSheet'); if(s){ s.classList.remove('on'); document.getElementById('plVeil').classList.remove('on'); } };
  const toast=t=>{ if(typeof window.sdToast==='function') return window.sdToast(t); let el=document.getElementById('plToast');
    if(!el){ document.body.insertAdjacentHTML('beforeend','<div id="plToast" style="position:fixed;left:50%;bottom:110px;transform:translateX(-50%);z-index:200;background:#1F2733;color:#fff;font-weight:700;font-size:13.5px;padding:11px 16px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.4);transition:opacity .3s;opacity:0;pointer-events:none"></div>'); el=document.getElementById('plToast'); }
    el.textContent=T(t); el.style.opacity=1; clearTimeout(el._t); el._t=setTimeout(()=>el.style.opacity=0,2400); };

  /* Premium: one horse. A second one is a Pro feature, said plainly. */
  window.openUpsellHorse=()=>sheet(`<h3>${T('One horse with Premium')}</h3><div class="sub">${T('Premium follows one horse in depth. To add a second horse, switch to Pro: unlimited horses, same analysis.')}</div>
    <div style="margin-top:14px">
      <div class="plFeat"><span class="i"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span><div><b>${T('Unlimited horses')}</b><span>${T('Every horse with its own page, trends and alerts')}</span></div></div>
      <div class="plFeat"><span class="i"><svg viewBox="0 0 24 24"><path d="M4 18V9M10 18V5M16 18v-7M22 18H2"/></svg></span><div><b>${T('Stable view')}</b><span>${T('Top performers and alerts across your horses')}</span></div></div></div>
    <button class="plBtn" id="plGo">${T('See the Pro plan')}</button><button class="plBtn sec" onclick="plClose()">${T('Not now')}</button>`,
    s=>{ s.querySelector('#plGo').onclick=()=>{ location.href='Etape%205%20-%20Profile.html?v=1001140120#plans'; }; });

  /* professionals: pick one of their horses, then log the care of their job */
  const JOBTYPE={vet:'vet',farrier:'farrier',groom:null};
  window.openStaffLog=(type)=>{ const ids=SD_FOLLOW(), N={mb:'Midnight Bolt',qz:'Quintus Z',bd:'Bella Donna',sa:'Silver Arrow',nl:'Nova de Lys'};
    sheet(`<h3>${T(plan==='farrier'?'Log a shoeing':plan==='vet'?'Add a visit':'Log a care')}</h3><div class="sub">${T('Which horse?')}</div><div class="plChips" style="margin-top:14px">${ids.map(i=>`<button data-h="${i}">${N[i]}</button>`).join('')}</div>`,
      s=>s.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{ plClose(); if(window.CARE) setTimeout(()=>CARE.openAdd({id:b.dataset.h,n:N[b.dataset.h]},{type:type===undefined?JOBTYPE[plan]:type},()=>{ if(typeof window.SD_onCare==='function') window.SD_onCare(); }),250); })); };
  /* Stable Owner: invite a rider and give them horses */
  window.openAddRider=()=>{ const H=window.SD_ALLH||[{n:'Midnight Bolt'},{n:'Quintus Z'},{n:'Bella Donna'},{n:'Silver Arrow'},{n:'Nova de Lys'}];
    const F={name:'',email:'',role:'Rider',horses:[]};
    const draw=s=>{ s.innerHTML=`<div class="grab"></div><h3>${T('Add a user')}</h3><div class="sub">${T('They get their own access, with only the horses you give them. You keep every video and every horse.')}</div>
      <div class="k">${T('NAME')}</div><input class="plIn" id="plN" placeholder="${T('First and last name')}" value="${F.name}">
      <div class="k">${T('EMAIL')}</div><input class="plIn" id="plE" type="email" placeholder="name@stable.com" value="${F.email}">
      <div class="k">${T('ROLE')}</div><div class="plChips" id="plR">${['Rider','Trainer','Groom','Vet'].map(r=>`<button class="${F.role===r?'on':''}" data-v="${r}">${T(r)}</button>`).join('')}</div>
      <div class="k">${T('HORSES THEY CAN SEE')}</div><div class="plChips" id="plH">${H.map(h=>`<button class="${F.horses.includes(h.n)?'on':''}" data-v="${h.n}">${h.n}</button>`).join('')}</div>
      <button class="plBtn" id="plGo" ${F.name.trim()&&/\S+@\S+\.\S+/.test(F.email)?'':'disabled'}>${T('Send the invitation')}</button>`;
      s.querySelector('#plN').oninput=e=>{ F.name=e.target.value; s.querySelector('#plGo').disabled=!(F.name.trim()&&/\S+@\S+\.\S+/.test(F.email)); };
      s.querySelector('#plE').oninput=e=>{ F.email=e.target.value; s.querySelector('#plGo').disabled=!(F.name.trim()&&/\S+@\S+\.\S+/.test(F.email)); };
      s.querySelectorAll('#plR button').forEach(b=>b.onclick=()=>{ F.role=b.dataset.v; draw(s); });
      s.querySelectorAll('#plH button').forEach(b=>b.onclick=()=>{ const v=b.dataset.v; F.horses.includes(v)?F.horses.splice(F.horses.indexOf(v),1):F.horses.push(v); draw(s); });
      s.querySelector('#plGo').onclick=()=>{ plClose(); toast('Invitation sent'); }; };
    sheet('',draw); };

  /* the + menu follows the account */
  document.addEventListener('DOMContentLoaded',()=>{
    /* rider: Add a horse starts with one question, for the stable or a horse of my own */
    if(plan==='rider'&&typeof window.openAddHorse==='function'){ const _o=window.openAddHorse, pageAdd=window.onHorseAdded; window.AH_SKIP_ASSIGN=true; let mode='own';
      const banner=()=>{ const b=document.getElementById('ahBody'); let el=document.getElementById('ahPers'); if(!el){ b.insertAdjacentHTML('beforebegin','<div id="ahPers" style="margin:4px 16px 0;padding:11px 13px;border-radius:14px;font-size:12.5px;line-height:1.45;color:#C7CFDB"></div>'); el=document.getElementById('ahPers'); }
        const own=mode==='own'; el.style.background=own?'rgba(59,130,246,.08)':'rgba(61,214,140,.07)'; el.style.border=own?'1px solid rgba(59,130,246,.25)':'1px solid rgba(61,214,140,.25)';
        el.innerHTML=own?`<b style="color:#fff">${T('Your own horse')}</b> · ${T('Only you see it. It is not part of the stable and does not count in its numbers.')}`
          :`<b style="color:#fff">${T('For')} ${window.SD_STABLE}</b> · ${T('Marie S. sees it. It joins the stable and counts in its numbers.')}`; };
      window.openAddHorse=(...a)=>{ _o(...a); const P=document.getElementById('ahP'); if(!P) return; const old=document.getElementById('ahWhere'); if(old) old.remove(); const pb=document.getElementById('ahPers'); if(pb) pb.style.display='none';
        P.insertAdjacentHTML('beforeend',`<div id="ahWhere"><h2>${T('Where does this horse go?')}</h2><div class="sub">${T('You can follow horses of the stable and horses of your own. They are never mixed.')}</div>
          <button class="whO" data-m="stable"><span class="whI" style="background:rgba(61,214,140,.12)"><svg viewBox="0 0 24 24" style="stroke:#5BE3A0;stroke-width:1.5"><path d="M8 21.5v-6c0-.943 0-1.414.293-1.707S9.057 13.5 10 13.5h4c.943 0 1.414 0 1.707.293S16 14.557 16 15.5v6M8.5 14l7.5 7.5m-.5-7.5L8 21.5m2.5-13h3"/><path d="M4.388 6.876L3.345 9.224c-.172.387-.258.58-.301.785c-.044.206-.044.417-.044.84V17.5c0 1.886 0 2.828.586 3.414S5.114 21.5 7 21.5h10c1.886 0 2.828 0 3.414-.586S21 19.386 21 17.5v-7.056c0-.47 0-.705-.053-.931c-.054-.227-.16-.437-.37-.857l-.95-1.9c-.31-.622-.466-.933-.71-1.17c-.245-.237-.56-.383-1.191-.674L12.954 2.71a2.28 2.28 0 0 0-1.908 0L6.367 4.869c-.676.312-1.014.468-1.27.727c-.255.26-.406.6-.709 1.28"/></svg></span>
            <div><b>${T('For')} ${window.SD_STABLE}</b><span>${T('Marie S. sees it. It joins the stable and counts in its numbers.')}</span></div></button>
          <button class="whO" data-m="own"><span class="whI" style="background:rgba(59,130,246,.12)"><svg viewBox="0 0 24 24" style="stroke:#8DB8FF"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg></span>
            <div><b>${T('My own horse')}</b><span>${T('Only you see it. It is not part of the stable and does not count in its numbers.')}</span></div></button></div>`);
        document.querySelectorAll('#ahWhere .whO').forEach(b=>b.onclick=()=>{ mode=b.dataset.m; document.getElementById('ahWhere').remove(); banner(); document.getElementById('ahPers').style.display=''; }); };
      window.onHorseAdded=H=>{ if(mode==='own'){ SD_ADD_PERSONAL(H); if(typeof window.SD_onPersonal==='function') window.SD_onPersonal(); }
        else { if(typeof pageAdd==='function') pageAdd({...H,rider:'John Doe'}); if(typeof window.SD_onStable==='function') window.SD_onStable(); } }; }
    document.querySelectorAll('.addMenu').forEach(m=>{
      const horseBtn=[...m.querySelectorAll('button')].find(b=>/Add a horse/i.test(b.textContent)||b.textContent.includes(T('Add a horse')));
      if(SD_STAFF){ if(horseBtn) horseBtn.remove();
        if(plan!=='groom') [...m.querySelectorAll('button')].filter(b=>b!==horseBtn&&!b.dataset.care).forEach(b=>b.remove());
        if(!m.querySelector('[data-care]')){ m.insertAdjacentHTML('afterbegin',`<button data-care="1"><svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v4M10 15h4"/></svg>${T(plan==='farrier'?'Log a shoeing':plan==='vet'?'Add a visit':'Log a care')}</button>`);
          m.querySelector('[data-care]').addEventListener('click',e=>{ e.stopPropagation(); m.classList.remove('on'); document.querySelectorAll('.plus.open').forEach(p=>p.classList.remove('open')); openStaffLog(); }); } }
      if(plan==='premium'&&horseBtn) horseBtn.addEventListener('click',e=>{ e.stopImmediatePropagation(); e.preventDefault(); m.classList.remove('on'); document.querySelectorAll('.plus.open').forEach(p=>p.classList.remove('open')); openUpsellHorse(); },true);
      if(plan==='owner'&&!m.querySelector('[data-rider]')){ m.insertAdjacentHTML('beforeend',`<button data-rider="1"><svg viewBox="0 0 24 24"><circle cx="10" cy="8.5" r="3.4"/><path d="M3.8 19.5c1.3-3.3 3.6-4.9 6.2-4.9s4.9 1.6 6.2 4.9"/><path d="M18.5 7.5v6M15.5 10.5h6"/></svg>${T('Add a user')}</button>`);
        m.querySelector('[data-rider]').addEventListener('click',e=>{ e.stopPropagation(); m.classList.remove('on'); document.querySelectorAll('.plus.open').forEach(p=>p.classList.remove('open')); openAddRider(); }); }
    });
    /* nav: the owner's second tab is the stable (icon: Hugeicons barns, MIT) */
    if(plan==='owner') document.querySelectorAll('.nav a').forEach(a=>{ if(!/My%20Horses/.test(a.getAttribute('href')||'')&&!a.querySelector('svg.horse')) return;
      const sv=a.querySelector('svg'); if(sv) sv.outerHTML='<svg class="stable" viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"><path d="M8 21.5v-6c0-.943 0-1.414.293-1.707S9.057 13.5 10 13.5h4c.943 0 1.414 0 1.707.293S16 14.557 16 15.5v6M8.5 14l7.5 7.5m-.5-7.5L8 21.5m2.5-13h3"/><path d="M4.388 6.876L3.345 9.224c-.172.387-.258.58-.301.785c-.044.206-.044.417-.044.84V17.5c0 1.886 0 2.828.586 3.414S5.114 21.5 7 21.5h10c1.886 0 2.828 0 3.414-.586S21 19.386 21 17.5v-7.056c0-.47 0-.705-.053-.931c-.054-.227-.16-.437-.37-.857l-.95-1.9c-.31-.622-.466-.933-.71-1.17c-.245-.237-.56-.383-1.191-.674L12.954 2.71a2.28 2.28 0 0 0-1.908 0L6.367 4.869c-.676.312-1.014.468-1.27.727c-.255.26-.406.6-.709 1.28"/></svg>';
      const t=[...a.childNodes].find(n=>n.nodeType===3&&n.nodeValue.trim()); if(t) t.nodeValue=T('My Stable'); });
    /* nav: professionals get a Care tab instead of the videos */
    if(SD_STAFF) document.querySelectorAll('.nav a').forEach(a=>{ if(!/Sessions/.test(a.getAttribute('href')||'')&&!/Sessions|Vidéos|Video|Vídeos|Videos/.test(a.textContent)) return;
      const sv=a.querySelector('svg'); if(sv) sv.outerHTML='<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8.5 14h2M13.5 14h2M8.5 17h2"/></svg>';
      const t=[...a.childNodes].find(n=>n.nodeType===3&&n.nodeValue.trim()); if(t) t.nodeValue=T('Care'); });
    /* nav: a Premium account has one horse */
    if(plan==='premium') document.querySelectorAll('.nav a').forEach(a=>{ const t=[...a.childNodes].find(n=>n.nodeType===3&&/My Horses|Mes chevaux|I miei cavalli|Mis caballos|Meine Pferde/.test(n.nodeValue)); if(t) t.nodeValue=T('My Horse'); });
  });
})();
