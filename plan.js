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
  try{ if(new URLSearchParams(location.search).get('demo')==='1') ['sdMe','sdDeletedVideos','sdVideoHorse','sdHorseEdits','sdDeletedHorses'].forEach(k=>localStorage.removeItem(k)); }catch(e){}
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
  /* ---------- videos and horses the user removes or fixes: kept on this phone, cleared with the demo reset ----------
     a video is known by its first horse and its day (every page draws the same sample sessions): "mb|2026-09-30" */
  const LS=(k,d)=>{ try{ const v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } };
  const LSW=(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
  window.SD_H0={mb:['Midnight Bolt','John Doe'],qz:['Quintus Z','Marie S.'],bd:['Bella Donna','Lea Martin'],sa:['Silver Arrow','John Doe'],nl:['Nova de Lys','Marie S.']};
  const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  window.SD_VKEY=(hid,date)=>hid+'|'+ymd(date);
  window.SD_VIDEO_DELETED=k=>LS('sdDeletedVideos',[]).includes(k);
  window.SD_DELETE_VIDEO=k=>{ const L=LS('sdDeletedVideos',[]); if(!L.includes(k)){ L.push(k); LSW('sdDeletedVideos',L); } };
  window.SD_RESTORE_VIDEO=k=>LSW('sdDeletedVideos',LS('sdDeletedVideos',[]).filter(x=>x!==k));
  /* a video put on the wrong horse: video key -> the horse it really belongs to (its first name, edits aside) */
  window.SD_VIDEO_HORSE=k=>LS('sdVideoHorse',{})[k]||null;
  window.SD_SET_VIDEO_HORSE=(k,name)=>{ const M=LS('sdVideoHorse',{}), id=k.split('|')[0];
    if(!name||(SD_H0[id]&&SD_H0[id][0]===name)) delete M[k]; else M[k]=name; LSW('sdVideoHorse',M); };
  window.SD_HORSE_DELETED=id=>LS('sdDeletedHorses',[]).includes(id);
  window.SD_DELETE_HORSE=id=>{ const L=LS('sdDeletedHorses',[]); if(!L.includes(id)){ L.push(id); LSW('sdDeletedHorses',L); } };
  window.SD_RESTORE_HORSE=id=>LSW('sdDeletedHorses',LS('sdDeletedHorses',[]).filter(x=>x!==id));
  window.SD_HORSE_EDITS=()=>LS('sdHorseEdits',{});
  window.SD_HNAME=h=>(SD_HORSE_EDITS()[h.id]||{}).n||h.n0||h.n;
  /* the name the user gave, for a horse known by its first name */
  const shown=n=>{ const E=SD_HORSE_EDITS(); const id=Object.keys(E).find(i=>(E[i].n0||(SD_H0[i]||[])[0])===n); return id&&E[id].n||n; };
  const edits=list=>{ const E=SD_HORSE_EDITS(); list.forEach(h=>{ if(!h.n0) h.n0=h.n; const e=E[h.id]; if(e) Object.keys(e).forEach(k=>{ if(k!=='n'&&k!=='n0') h[k]=e[k]; }); }); return list; };
  /* deleted horses leave every list, their details follow the edits */
  const _ph=window.planHorses; window.planHorses=list=>_ph(edits(list)).filter(h=>!SD_HORSE_DELETED(h.id));
  const _pp=window.SD_PERSONAL; window.SD_PERSONAL=()=>edits(_pp()).filter(h=>!SD_HORSE_DELETED(h.id));
  { const del=LS('sdDeletedHorses',[]); if(del.length){ const ids={'Midnight Bolt':'mb','Quintus Z':'qz','Bella Donna':'bd','Silver Arrow':'sa','Nova de Lys':'nl'};
    const L=(window.SD_HN||Object.keys(ids)).filter(n=>!del.includes(ids[n])); if(L.length) window.SD_HN=L; } }
  /* the sessions of a page, as the user left them: deleted ones out, moved ones on their right horse, only the horses shown here */
  window.SD_VFIX=(list,visible)=>{ const V=visible||window.SD_ALLH||[], pool=(window.SD_ALLH||[]).concat(V);
    const byName=n=>pool.find(h=>(h.n0||h.n)===n);
    return list.filter(s=>{ const h0=s.h0||s.h; if(!h0) return true; s.h0=h0; s.key=SD_VKEY(h0.id,s.date); if(SD_VIDEO_DELETED(s.key)) return false;
      const t=SD_VIDEO_HORSE(s.key), h=(t&&byName(t))||h0; s.h=h; s.moved=h!==h0; return V.some(x=>x.id===h.id); }); };
  /* renamed horses: the new name everywhere it is written */
  let NMAP=[], nObs=null;
  const nameMap=()=>{ const E=SD_HORSE_EDITS(); NMAP=Object.keys(E).map(id=>[E[id].n0||(SD_H0[id]||[])[0],E[id].n]).filter(([a,b])=>a&&b&&a!==b); };
  const fixN=n=>{ let v=n.nodeValue; const o=v; NMAP.forEach(([a,b])=>{ if(v.includes(a)&&!(b.includes(a)&&v.includes(b))) v=v.split(a).join(b); }); if(v!==o) n.nodeValue=v; };
  const walkN=r=>{ if(!r||!NMAP.length) return; if(r.nodeType===3) return fixN(r); if(r.nodeType!==1||/^(SCRIPT|STYLE|TEXTAREA)$/.test(r.nodeName)) return;
    const w=document.createTreeWalker(r,4); let n; while((n=w.nextNode())) if(!/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) fixN(n); };
  const watchN=()=>{ if(nObs||!NMAP.length) return; nObs=new MutationObserver(L=>L.forEach(m=>{ if(m.type==='characterData') fixN(m.target); else m.addedNodes.forEach(walkN); }));
    nObs.observe(document.documentElement,{childList:true,subtree:true,characterData:true}); };
  nameMap(); watchN(); document.addEventListener('DOMContentLoaded',()=>walkN(document.body));
  window.SD_EDIT_HORSE=(id,o)=>{ const E=SD_HORSE_EDITS(); E[id]=Object.assign(E[id]||{},o); LSW('sdHorseEdits',E); nameMap(); watchN(); walkN(document.body); };

  /* ---------- the shared pieces: menu, confirmation, horse picker, undo toast ---------- */
  const TX=x=>(window.SD_T||(y=>y))(x), RMo=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const ICO={
    dots:'<svg viewBox="0 0 24 24" class="dots"><circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/></svg>',
    trash:'<svg viewBox="0 0 24 24"><path d="M20.5 6h-17"/><path d="m18.83 8.5-.46 6.9c-.18 2.65-.27 3.98-1.13 4.79-.87.81-2.2.81-4.86.81h-.77c-2.66 0-3.99 0-4.86-.81-.86-.81-.95-2.14-1.13-4.79l-.46-6.9"/><path d="m9.5 11 .5 5m4.5-5-.5 5"/><path d="M6.5 6h.11a2 2 0 0 0 1.83-1.32l.03-.1.1-.29c.08-.25.12-.37.18-.48a1.5 1.5 0 0 1 1.09-.79c.12-.02.25-.02.51-.02h3.29c.26 0 .39 0 .51.02a1.5 1.5 0 0 1 1.09.79c.06.11.1.23.18.48l.1.29.03.1A2 2 0 0 0 17.5 6"/></svg>',
    swap:'<svg viewBox="0 0 24 24"><path d="M4 8h15"/><path d="m15.5 4.5 3.5 3.5-3.5 3.5"/><path d="M20 16H5"/><path d="M8.5 12.5 5 16l3.5 3.5"/></svg>',
    pen:'<svg viewBox="0 0 24 24"><path d="M4 21h16"/><path d="m13.9 4.66.74-.74a3.15 3.15 0 1 1 4.45 4.45l-.74.74m-4.45-4.45s.09 1.58 1.48 2.97 2.97 1.48 2.97 1.48m-4.45-4.45-6.82 6.82c-.46.46-.69.69-.89.95a5.2 5.2 0 0 0-.6.97c-.14.29-.24.6-.45 1.22l-.87 2.63m14.08-8.14-6.82 6.82c-.46.46-.69.69-.95.89a5.2 5.2 0 0 1-.97.6c-.29.14-.6.24-1.22.45l-2.63.87m0 0-.64.21a.85.85 0 0 1-1.07-1.07l.21-.64m1.5 1.5-1.5-1.5"/></svg>',
    check:'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'};
  window.SD_ICO=ICO;
  const xcss=`
  .sdxVeil{position:fixed;inset:0;background:rgba(4,6,9,.62);z-index:190;opacity:0;pointer-events:none;transition:opacity .25s}.sdxVeil.on{opacity:1;pointer-events:auto}
  .sdxSheet{position:fixed;left:0;right:0;bottom:0;max-width:420px;margin:0 auto;z-index:191;background:#161B23;color:#F2F5F8;border:1px solid rgba(255,255,255,.07);border-bottom:0;
    border-radius:22px 22px 0 0;padding:10px 18px calc(26px + env(safe-area-inset-bottom));transform:translateY(105%);transition:transform .34s cubic-bezier(.32,.72,0,1);max-height:88vh;max-height:88dvh;overflow-y:auto;overscroll-behavior:contain}
  .sdxSheet.on{transform:none}
  .sdxSheet .grab{width:38px;height:5px;border-radius:3px;background:rgba(255,255,255,.18);margin:0 auto 14px}
  .sdxSheet h3{font-size:19px;font-weight:800;letter-spacing:-.3px} .sdxSheet .sub{font-size:13.5px;color:#8A94A3;margin-top:6px;line-height:1.45}
  .sdxSheet .dIco{width:46px;height:46px;border-radius:14px;background:rgba(229,72,77,.12);display:grid;place-items:center;margin:2px 0 14px}
  .sdxSheet .dIco svg{width:23px;height:23px;stroke:#FF6B70;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
  .sdxBtn{display:flex;align-items:center;justify-content:center;width:100%;min-height:52px;margin-top:20px;font:inherit;font-size:15.5px;font-weight:800;color:#fff;background:#3B82F6;border:0;border-radius:16px;padding:0 16px;cursor:pointer;transition:opacity .2s}
  .sdxBtn.red{background:#E5484D} .sdxBtn.sec{background:rgba(255,255,255,.06);color:#E4E8EE;margin-top:10px} .sdxBtn:disabled{opacity:.38;cursor:default}
  .sdxRows{margin-top:14px;border-radius:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);overflow:hidden}
  .sdxRow{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:8px 14px;font:inherit;color:#F2F5F8;background:none;border:0;border-top:1px solid rgba(255,255,255,.06);cursor:pointer;text-align:left}
  .sdxRow:first-child{border-top:0} .sdxRow .av{width:34px;height:34px;border-radius:50%;flex:0 0 auto;display:grid;place-items:center;font-size:11.5px;font-weight:800;color:#C7CFDB;background:rgba(255,255,255,.06)}
  .sdxRow .nm{flex:1;min-width:0;font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sdxRow .nm small{display:block;font-size:11.5px;font-weight:600;color:#8A94A3;margin-top:1px}
  .sdxRow .ck{width:22px;height:22px;border-radius:50%;flex:0 0 auto;border:1.5px solid rgba(255,255,255,.18);display:grid;place-items:center;transition:all .15s}
  .sdxRow .ck svg{width:13px;height:13px;stroke:#fff;fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;opacity:0}
  .sdxRow.on .ck{background:#3B82F6;border-color:#3B82F6} .sdxRow.on .ck svg{opacity:1} .sdxRow.on .av{background:rgba(59,130,246,.16);color:#8DB8FF}
  .sdxMenuVeil{position:fixed;inset:0;z-index:192}
  .sdxMenu{position:fixed;z-index:193;min-width:216px;padding:6px;border-radius:16px;background:#1E242E;border:1px solid rgba(255,255,255,.09);
    box-shadow:0 18px 48px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.3);
    opacity:0;transform:scale(.94);transform-origin:top right;transition:opacity .16s ease,transform .22s cubic-bezier(.23,1,.32,1)}
  .sdxMenu.sdxUp{transform-origin:bottom right} .sdxMenu.sdxIn{opacity:1;transform:none}
  .sdxMenu button{display:flex;align-items:center;gap:12px;width:100%;min-height:46px;padding:0 12px;font:inherit;font-size:14.5px;font-weight:600;color:#E9EDF2;background:none;border:0;border-radius:11px;cursor:pointer;text-align:left;white-space:nowrap}
  .sdxMenu button:hover,.sdxMenu button:focus-visible{background:rgba(255,255,255,.06);outline:0}
  .sdxMenu button svg{width:19px;height:19px;flex:0 0 auto;stroke:#8DB8FF;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
  .sdxMenu button.red{color:#FF6B70} .sdxMenu button.red svg{stroke:#FF6B70}
  .sdxMenu .sep{height:1px;background:rgba(255,255,255,.07);margin:4px 10px}
  .sdxMore{position:relative;flex:0 0 auto;width:30px;height:44px;margin:-10px -6px -10px -6px;display:grid;place-items:center;color:#8A94A3;cursor:pointer;border-radius:12px;-webkit-tap-highlight-color:transparent}
  .sdxMore::before{content:"";position:absolute;inset:0 -7px}
  .sdxMore svg.dots{width:18px;height:18px;fill:currentColor;stroke:none} .sdxMore:hover,.sdxMore.on{color:#E9EDF2}
  .sdxTop{position:relative;width:36px;height:36px;flex:0 0 auto;border-radius:50%;background:var(--card,#14181F);border:1px solid var(--line,rgba(255,255,255,.07));display:grid;place-items:center;color:var(--txt,#F2F5F8);cursor:pointer;padding:0}
  .sdxTop::before{content:"";position:absolute;inset:-5px} .sdxTop svg.dots{width:18px;height:18px;fill:currentColor}
  .top:has(> .sdxTop) h1,.ptop:has(> .sdxTop) h1{margin-right:0!important}
  .sdxSw{position:relative;margin-top:8px;border-radius:16px;overflow:hidden}
  .sdxSw>[data-vk]{margin-top:0!important;position:relative;z-index:1;touch-action:pan-y;-webkit-user-drag:none;transition:transform .3s cubic-bezier(.32,.72,0,1)}
  .sdxSw.drag>[data-vk]{transition:none}
  .sdxSwAct{position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-end;padding:0;border:0;background:#E5484D;color:#fff;font:inherit;cursor:pointer;opacity:0;transition:opacity .15s}
  .sdxSw.drag .sdxSwAct,.sdxSw.open .sdxSwAct{opacity:1}
  .sdxSwAct span{width:88px;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:12px;font-weight:700}
  .sdxSwAct svg{width:21px;height:21px;stroke:#fff;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
  .sdxToast{position:fixed;left:50%;bottom:calc(106px + env(safe-area-inset-bottom));z-index:200;display:flex;align-items:center;max-width:calc(100% - 32px);
    background:#1B212B;color:#F2F5F8;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:4px 4px 4px 16px;font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;
    box-shadow:0 12px 32px rgba(0,0,0,.45);opacity:0;transform:translate(-50%,16px);pointer-events:none;transition:opacity .25s ease,transform .32s cubic-bezier(.32,.72,0,1)}
  .sdxToast.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}
  .sdxToast .m{overflow:hidden;text-overflow:ellipsis} .sdxToast .sp{width:1px;height:18px;background:rgba(255,255,255,.12);margin:0 4px 0 14px;flex:0 0 auto}
  .sdxToast button{flex:0 0 auto;min-height:40px;padding:0 12px;font:inherit;font-size:13.5px;font-weight:800;color:#8DB8FF;background:none;border:0;border-radius:10px;cursor:pointer}
  .sdxToast i{position:absolute;left:0;right:0;bottom:0;height:2px;background:#3B82F6;opacity:.55;transform-origin:left}
  html[data-theme="light"] .sdxSheet{background:var(--card,#fff);color:var(--txt,#0F1623)}
  html[data-theme="light"] .sdxBtn.sec{background:rgba(16,24,40,.06);color:var(--txt,#0F1623)}
  html[data-theme="light"] .sdxRows{background:rgba(16,24,40,.02);border-color:rgba(16,24,40,.08)} html[data-theme="light"] .sdxRow{color:var(--txt,#0F1623);border-color:rgba(16,24,40,.07)}
  html[data-theme="light"] .sdxRow .av{background:rgba(16,24,40,.06);color:#4A5361} html[data-theme="light"] .sdxRow .ck{border-color:rgba(16,24,40,.2)}
  html[data-theme="light"] .sdxMenu{background:rgba(255,255,255,.98);border-color:rgba(16,24,40,.08);box-shadow:0 18px 48px rgba(16,24,40,.18)}
  html[data-theme="light"] .sdxMenu button{color:var(--txt,#0F1623)} html[data-theme="light"] .sdxMenu button:hover{background:rgba(16,24,40,.05)} html[data-theme="light"] .sdxMenu button svg{stroke:#2563EB}
  html[data-theme="light"] .sdxMenu button.red,html[data-theme="light"] .sdxMenu button.red svg{color:#D93036;stroke:#D93036} html[data-theme="light"] .sdxMenu .sep{background:rgba(16,24,40,.08)}
  html[data-theme="light"] .sdxMore:hover{color:var(--txt,#0F1623)} html[data-theme="light"] .sdxToast{background:#0F1623}
  @media (prefers-reduced-motion: reduce){ .sdxSheet,.sdxMenu,.sdxToast,.sdxSw>[data-vk],.sdxVeil{transition:none!important} }`;
  const addCss=()=>{ if(!document.getElementById('sdxCss')) document.head.insertAdjacentHTML('beforeend',`<style id="sdxCss">${xcss}</style>`); };
  addCss();

  /* bottom sheet */
  let xLast=null;
  const xClose=()=>{ const s=document.getElementById('sdxSheet'); if(!s) return; s.classList.remove('on'); document.getElementById('sdxVeil').classList.remove('on'); if(xLast&&xLast.focus) try{ xLast.focus({preventScroll:true}); }catch(e){} };
  const xSheet=(html,wire)=>{ let s=document.getElementById('sdxSheet');
    if(!s){ document.body.insertAdjacentHTML('beforeend','<div class="sdxVeil" id="sdxVeil"></div><div class="sdxSheet" id="sdxSheet" role="dialog" aria-modal="true"></div>'); s=document.getElementById('sdxSheet');
      document.getElementById('sdxVeil').onclick=xClose; document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&s.classList.contains('on')) xClose(); }); }
    xLast=document.activeElement; s.innerHTML='<div class="grab"></div>'+html; s.scrollTop=0; wire&&wire(s);
    document.getElementById('sdxVeil').classList.add('on'); void s.offsetHeight; s.classList.add('on'); };
  window.SD_SHEET_CLOSE=xClose;
  /* confirmation before anything is deleted: says plainly what goes */
  window.SD_CONFIRM_DELETE=({title,sub,ok,onConfirm})=>xSheet(`<div class="dIco">${ICO.trash}</div><h3>${esc(title||'Delete this video?')}</h3>
      <div class="sub">${esc(sub||'The video will be removed, with its analysis and all its numbers.')}</div>
      <button class="sdxBtn red" id="sdxOk">${esc(ok||'Delete video')}</button><button class="sdxBtn sec" id="sdxNo">Cancel</button>`,
    s=>{ s.querySelector('#sdxNo').onclick=xClose; s.querySelector('#sdxOk').onclick=()=>{ xClose(); setTimeout(()=>onConfirm&&onConfirm(),RMo()?0:180); }; setTimeout(()=>{ try{ s.querySelector('#sdxNo').focus({preventScroll:true}); }catch(e){} },60); });
  /* the right horse for a video: the horses of this account, the current one ticked */
  window.SD_PICK_HORSE=({current,onSave})=>{ const del=LS('sdDeletedHorses',[]), ids=Object.fromEntries(Object.keys(SD_H0).map(i=>[SD_H0[i][0],i]));
    let L=(window.SD_HN||Object.keys(ids)).filter(n=>!del.includes(ids[n])); if(current&&!L.includes(current)) L=[current,...L];
    let pick=current; const ini=n=>ids[n]&&shown(n)===n?ids[n].toUpperCase():shown(n).split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
    xSheet(`<h3>Change horse</h3><div class="sub">Pick the horse that is really in this video.</div>
      <div class="sdxRows" role="radiogroup">${L.map(n=>`<button class="sdxRow${n===current?' on':''}" role="radio" aria-checked="${n===current}" data-n="${esc(n)}"><span class="av">${ini(n)}</span><span class="nm">${esc(n)}${ids[n]&&SD_H0[ids[n]]?`<small>${SD_H0[ids[n]][1]}</small>`:''}</span><span class="ck">${ICO.check}</span></button>`).join('')}</div>
      <button class="sdxBtn" id="sdxOk" disabled>Save</button><button class="sdxBtn sec" id="sdxNo">Cancel</button>`,
      s=>{ const ok=s.querySelector('#sdxOk');
        s.querySelectorAll('.sdxRow').forEach(b=>b.onclick=()=>{ pick=b.dataset.n; s.querySelectorAll('.sdxRow').forEach(x=>{ x.classList.toggle('on',x===b); x.setAttribute('aria-checked',x===b); }); ok.disabled=pick===current; });
        s.querySelector('#sdxNo').onclick=xClose; ok.onclick=()=>{ xClose(); if(pick!==current) setTimeout(()=>onSave&&onSave(pick),RMo()?0:180); }; }); };
  /* small menu under the ⋯ button */
  const mClose=()=>{ const m=document.getElementById('sdxMenu'), v=document.getElementById('sdxMenuVeil'); if(v) v.remove(); document.querySelectorAll('.sdxMore.on').forEach(x=>x.classList.remove('on'));
    if(m){ m.classList.remove('sdxIn'); setTimeout(()=>m.remove(),RMo()?0:180); } };
  window.SD_MENU=(anchor,items)=>{ mClose(); const old=document.getElementById('sdxMenu'); if(old) old.remove();
    document.body.insertAdjacentHTML('beforeend',`<div class="sdxMenuVeil" id="sdxMenuVeil"></div><div class="sdxMenu" id="sdxMenu" role="menu">${items.map((it,i)=>(it.red&&i?'<div class="sep"></div>':'')+`<button role="menuitem" class="${it.red?'red':''}" data-i="${i}">${ICO[it.ic]||''}${esc(it.t)}</button>`).join('')}</div>`);
    const m=document.getElementById('sdxMenu'), v=document.getElementById('sdxMenuVeil'), r=anchor.getBoundingClientRect(); anchor.classList.add('on');
    const mh=m.offsetHeight, mw=m.offsetWidth; let top=r.bottom+6; if(top+mh>innerHeight-96){ top=Math.max(12,r.top-mh-6); m.classList.add('sdxUp'); }
    m.style.top=top+'px'; m.style.left=Math.max(12,Math.min(innerWidth-mw-12,r.right-mw+4))+'px';
    v.addEventListener('pointerdown',e=>{ e.preventDefault(); mClose(); }); v.onclick=mClose;
    m.querySelectorAll('button').forEach(b=>b.onclick=e=>{ e.stopPropagation(); mClose(); const it=items[+b.dataset.i]; setTimeout(()=>it.fn&&it.fn(),RMo()?0:120); });
    const key=e=>{ if(e.key==='Escape'){ mClose(); document.removeEventListener('keydown',key); } }; document.addEventListener('keydown',key);
    void m.offsetHeight; m.classList.add('sdxIn'); try{ m.querySelector('button').focus({preventScroll:true}); }catch(e){} };
  /* toast with Undo, about 5 seconds */
  window.SD_UNDO=(msg,onUndo,ms=5000)=>{ let t=document.getElementById('sdxToast');
    if(!t){ document.body.insertAdjacentHTML('beforeend','<div class="sdxToast" id="sdxToast" role="status" aria-live="polite"></div>'); t=document.getElementById('sdxToast'); }
    t.innerHTML=`<span class="m">${esc(msg)}</span><span class="sp"></span><button>Undo</button><i></i>`; clearTimeout(t._t);
    const hide=()=>t.classList.remove('on'); t.querySelector('button').onclick=()=>{ hide(); clearTimeout(t._t); onUndo&&onUndo(); };
    void t.offsetHeight; t.classList.add('on'); const bar=t.querySelector('i');
    if(!RMo()&&bar.animate) bar.animate([{transform:'scaleX(1)'},{transform:'scaleX(0)'}],{duration:ms,easing:'linear',fill:'forwards'}); else bar.style.display='none';
    t._t=setTimeout(hide,ms); };
  /* a row leaves: its height closes while it fades (or its width, for cards side by side) */
  window.SD_COLLAPSE=(el,axis,done)=>{ if(RMo()||!el.animate){ el.style.display='none'; done&&done(); return; }
    const cs=getComputedStyle(el), E='cubic-bezier(.32,.72,0,1)'; el.style.overflow='hidden'; el.style.pointerEvents='none'; let a;
    if(axis==='x'){ const w=el.offsetWidth; a=el.animate([{flexBasis:w+'px',width:w+'px',opacity:1,marginRight:'0px'},{flexBasis:'0px',width:'0px',opacity:0,marginRight:'-12px'}],{duration:260,easing:E,fill:'forwards'}); }
    else { const h=el.offsetHeight; a=el.animate([{height:h+'px',opacity:1,marginTop:cs.marginTop,paddingTop:cs.paddingTop,paddingBottom:cs.paddingBottom},{height:'0px',opacity:0,marginTop:'0px',paddingTop:'0px',paddingBottom:'0px'}],{duration:250,easing:E,fill:'forwards'}); }
    a.onfinish=()=>done&&done(); };
  /* a list of videos: ⋯ on each row (Change horse, Delete video), and a swipe to the left that shows Delete.
     rows carry data-vk (video key) and data-vh (their horse); opt = {sel, swipe, axis, moreIn, refresh} */
  const vMove=(row,opt)=>{ const k=row.dataset.vk, cur=row.dataset.vh; SD_PICK_HORSE({current:cur,onSave:n=>{ const prev=SD_VIDEO_HORSE(k); SD_SET_VIDEO_HORSE(k,n); opt.refresh&&opt.refresh();
    SD_UNDO('Moved to '+shown(n),()=>{ SD_SET_VIDEO_HORSE(k,prev); opt.refresh&&opt.refresh(); }); }}); };
  const vDel=(row,opt)=>{ const k=row.dataset.vk; SD_CONFIRM_DELETE({onConfirm:()=>{ SD_DELETE_VIDEO(k); const el=row.parentNode.classList.contains('sdxSw')?row.parentNode:row;
    SD_COLLAPSE(el,opt.axis,()=>opt.refresh&&opt.refresh()); SD_UNDO('Video deleted',()=>{ SD_RESTORE_VIDEO(k); opt.refresh&&opt.refresh(); }); }}); };
  window.SD_VIDEO_MENU=(btn,row,opt)=>SD_MENU(btn,[{t:'Change horse',ic:'swap',fn:()=>vMove(row,opt)},{t:'Delete video',ic:'trash',red:1,fn:()=>vDel(row,opt)}]);
  window.SD_VIDEO_LIST=(box,opt)=>{ if(!box) return; box._sdxOpt=opt;
    box.querySelectorAll(opt.sel).forEach(row=>{ if(!row.dataset.vk||row.querySelector('.sdxMore')) return; row.setAttribute('draggable','false');
      (opt.moreIn&&row.querySelector(opt.moreIn)||row).insertAdjacentHTML('beforeend',`<span class="sdxMore" role="button" tabindex="0" aria-label="More" aria-haspopup="menu">${ICO.dots}</span>`);
      if(opt.swipe&&!row.parentNode.classList.contains('sdxSw')){ const w=document.createElement('div'); w.className='sdxSw'; row.parentNode.insertBefore(w,row); w.appendChild(row);
        w.insertAdjacentHTML('afterbegin',`<button class="sdxSwAct" tabindex="-1" aria-label="Delete video"><span>${ICO.trash}Delete</span></button>`); } });
    if(box._sdx) return; box._sdx=1; const O=()=>box._sdxOpt, W=88;
    const closeSw=sw=>{ sw.classList.remove('open'); const r=sw.querySelector('[data-vk]'); if(r) r.style.transform=''; };
    const openSw=sw=>{ sw.classList.add('open'); const r=sw.querySelector('[data-vk]'); if(r) r.style.transform=`translateX(-${W}px)`; };
    box.addEventListener('click',e=>{ const m=e.target.closest('.sdxMore');
      if(m){ e.preventDefault(); e.stopPropagation(); const row=m.closest('[data-vk]'); box.querySelectorAll('.sdxSw.open').forEach(closeSw); SD_VIDEO_MENU(m,row,O()); return; }
      const a=e.target.closest('.sdxSwAct'); if(a){ e.preventDefault(); e.stopPropagation(); vDel(a.parentNode.querySelector('[data-vk]'),O()); return; }
      const sw=e.target.closest('.sdxSw'); if(sw&&(sw._moved||sw.classList.contains('open'))){ e.preventDefault(); e.stopPropagation(); if(!sw._moved) closeSw(sw); sw._moved=false; } },true);
    box.addEventListener('keydown',e=>{ const m=e.target.closest('.sdxMore'); if(m&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); e.stopPropagation(); SD_VIDEO_MENU(m,m.closest('[data-vk]'),O()); } },true);
    box.addEventListener('dragstart',e=>{ if(e.target.closest&&e.target.closest('.sdxSw')) e.preventDefault(); });
    let cur=null;
    box.addEventListener('pointerdown',e=>{ box.querySelectorAll('.sdxSw.open').forEach(s=>{ if(!s.contains(e.target)) closeSw(s); });
      const sw=e.target.closest('.sdxSw'); if(!sw||e.target.closest('.sdxSwAct,.sdxMore')) return; sw._moved=false;
      cur={sw,row:sw.querySelector('[data-vk]'),x0:e.clientX,y0:e.clientY,base:sw.classList.contains('open')?-W:0,lock:null,x:0,id:e.pointerId}; });
    box.addEventListener('pointermove',e=>{ if(!cur) return; const dx=e.clientX-cur.x0, dy=e.clientY-cur.y0;
      if(!cur.lock){ if(Math.abs(dx)<8&&Math.abs(dy)<8) return; cur.lock=Math.abs(dx)>Math.abs(dy)*1.2?'x':'y';
        if(cur.lock==='y'){ cur=null; return; } cur.sw.classList.add('drag'); cur.sw._moved=true; try{ cur.row.setPointerCapture(cur.id); }catch(_){} }
      let x=Math.min(0,cur.base+dx); const max=cur.sw.offsetWidth*.7; if(x<-W) x=-W+(x+W)*.45; x=Math.max(-max,x); cur.x=x; cur.row.style.transform=`translateX(${x}px)`; });
    const end=()=>{ if(!cur) return; const c=cur; cur=null; c.sw.classList.remove('drag'); if(!c.lock) return;
      if(c.x<-W*1.9){ openSw(c.sw); vDel(c.row,O()); } else if(c.x<-W/2) openSw(c.sw); else closeSw(c.sw); };
    box.addEventListener('pointerup',end); box.addEventListener('pointercancel',end);
    document.addEventListener('pointerdown',e=>{ if(!box.contains(e.target)&&!e.target.closest('.sdxSheet,.sdxVeil,.sdxMenu,.sdxMenuVeil')) box.querySelectorAll('.sdxSw.open').forEach(closeSw); }); };
  /* after the confirmation sheet is cancelled, an open row closes */
  document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('#sdxNo')) document.querySelectorAll('.sdxSw.open').forEach(s=>{ s.classList.remove('open'); const r=s.querySelector('[data-vk]'); if(r) r.style.transform=''; }); });
  /* the page of one video: which one (?v=), its horse in the title, and its ⋯ menu */
  window.SD_THIS_VIDEO=()=>{ let k=null; try{ k=new URLSearchParams(location.search).get('v'); }catch(e){} return k||'mb|2026-09-30'; };
  window.SD_VIDEO_PAGE=btn=>{ const k=SD_THIS_VIDEO(), id=k.split('|')[0], hasV=new URLSearchParams(location.search).has('v'), ident=document.querySelector('.ident');
    const nameOf=()=>SD_VIDEO_HORSE(k)||(SD_H0[id]||[])[0]||'Midnight Bolt';
    const paint=()=>{ if(!ident) return; const n=nameOf(), hid=Object.keys(SD_H0).find(i=>SD_H0[i][0]===n); ident.textContent=shown(n)+(hid?' · '+SD_H0[hid][1]:''); };
    if(hasV||SD_VIDEO_HORSE(k)) paint();
    if(hasV){ const p=k.split('|')[1].split('-'), M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], s=document.querySelector('.vmeta .s'); if(s&&p.length===3) s.textContent=`${M[+p[1]-1]} ${+p[2]}, ${p[0]}`; }
    if(!btn) return;
    btn.onclick=e=>{ e.preventDefault(); SD_MENU(btn,[{t:'Change horse',ic:'swap',fn:()=>SD_PICK_HORSE({current:nameOf(),onSave:n=>{ const prev=SD_VIDEO_HORSE(k); SD_SET_VIDEO_HORSE(k,n); paint();
        SD_UNDO('Moved to '+shown(n),()=>{ SD_SET_VIDEO_HORSE(k,prev); paint(); }); }})},
      {t:'Delete video',ic:'trash',red:1,fn:()=>SD_CONFIRM_DELETE({onConfirm:()=>{ SD_DELETE_VIDEO(k); SD_UNDO_LATER({type:'video',key:k});
        const u=new URL('Etape%204%20-%20Sessions.html?v=1001161548',location.href), pl=new URLSearchParams(location.search).get('plan'); if(pl) u.searchParams.set('plan',pl); location.href=u.toString(); }})}]); }; };
  /* undo after a page change: the next page shows the toast */
  window.SD_UNDO_LATER=o=>{ try{ sessionStorage.setItem('sdUndo',JSON.stringify(o)); }catch(e){} };
  document.addEventListener('DOMContentLoaded',()=>{ let o=null; try{ o=JSON.parse(sessionStorage.getItem('sdUndo')); sessionStorage.removeItem('sdUndo'); }catch(e){} if(!o) return;
    setTimeout(()=>{ if(o.type==='video') SD_UNDO('Video deleted',()=>{ SD_RESTORE_VIDEO(o.key); typeof window.SD_VIDEOS_CHANGED==='function'?SD_VIDEOS_CHANGED():location.reload(); });
      if(o.type==='horse') SD_UNDO('Horse deleted',()=>{ SD_RESTORE_HORSE(o.id); location.reload(); }); },450); });

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
    s=>{ s.querySelector('#plGo').onclick=()=>{ location.href='Etape%205%20-%20Profile.html?v=1001161548#plans'; }; });

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
