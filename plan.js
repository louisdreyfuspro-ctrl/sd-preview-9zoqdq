/* StrydeUp, account types.
   pro     : one rider, unlimited horses (the original screens, unchanged)
   premium : one rider, one horse, the app is built around that horse
   owner   : Stable Owner, the master admin: every rider, every horse, the team
   rider   : a rider inside a stable: only the horses the owner gave them, billing handled by the stable
   groom, trainer, horseowner : run EXACTLY as the rider (same screens), only the identity is their own;
     a horse owner sees only the horses of the stable they own (set by the Stable Owner on the horse page)
   vet, farrier : professionals, each one works for several stables (SD_STABLES) and has client horses of their own
   Chosen with ?plan= in the URL (boards) or kept in localStorage 'sdPlan' (Profile > Account type). */
(function(){
  /* the StrydeUp plans: ONE source for sign-up (Etape 6) and Profile (names, prices in USD, what each one gives) */
  window.SD_OFFERS=[
    {k:'premium',n:'Premium',m:49,h:250,who:'One rider, one horse.',f:['Every session analysed','Overview, heatmap, jumps and metrics','Trends and compare for your horse']},
    {k:'pro',n:'Pro',m:149,h:759,who:'One rider, unlimited horses.',f:['Everything in Premium','As many horses as you want','Stable view: top performers, alerts across horses'],tag:'Most chosen'},
    {k:'owner',n:'Stable Owner',m:218,h:null,who:'One master admin, several riders and horses.',f:['Everything in Pro','Add riders and give them horses','One admin sees and manages the whole team','2 users included, up to 25, $109 per extra user']}];
  if(window.SD_OFFERS_ONLY) return;
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
  const P=['pro','premium','owner','rider','vet','farrier','groom','trainer','horseowner'];
  let plan=null; try{ plan=new URLSearchParams(location.search).get('plan'); }catch(e){}
  /* a link with ?plan= also becomes the account type you stay in (not inside the TV boards' frames) */
  if(P.includes(plan)&&window.top===window){ try{ localStorage.setItem('sdPlan',plan); }catch(e){} }
  try{ if(new URLSearchParams(location.search).get('demo')==='1') ['sdMe','sdDeletedVideos','sdVideoHorse','sdHorseEdits','sdDeletedHorses','sdClientsVet','sdClientsFarrier','sdPersonalGroom','sdPersonalTrainer','sdPersonalHowner','sdHorseOwners','sdStableSel_vet','sdStableSel_farrier'].forEach(k=>localStorage.removeItem(k)); }catch(e){}
  if(!P.includes(plan)){ try{ plan=localStorage.getItem('sdPlan'); }catch(e){} }
  if(!P.includes(plan)) plan='pro';
  window.SD_PLAN=plan;
  /* the groom gets EXACTLY the rider's app (Louis, 7 Oct): it runs as 'rider'; only its identity stays its own
     (name Paul Girard, GROOM badge, role Groom). SD_ACCOUNT keeps the account picked in Profile > Account type. */
  window.SD_ACCOUNT=plan; window.SD_AS_GROOM=plan==='groom'; window.SD_AS_TRAINER=plan==='trainer'; window.SD_AS_HOWNER=plan==='horseowner';
  /* the trainer and the horse owner too (Louis, 7 Oct): the rider's app, their own identity */
  window.SD_AS=['groom','trainer','horseowner'].includes(plan)?plan:null; if(window.SD_AS){ plan='rider'; window.SD_PLAN='rider'; }
  /* ---------- horse owners: the private owner of a horse of the stable, added by the Stable Owner on the horse page ----------
     seeded: Camille Laurent owns Bella Donna and Nova de Lys (the horse owner demo account), Philippe Vasseur owns Quintus Z (invite pending).
     An invitation sent in the demo shows Invited, and is accepted by the next visit (Active). */
  const HO0={bd:{n:'Camille Laurent',e:'camille.laurent@gmail.com',st:'active',since:'May 2026'},nl:{n:'Camille Laurent',e:'camille.laurent@gmail.com',st:'active',since:'May 2026'},
    qz:{n:'Philippe Vasseur',e:'p.vasseur@orange.fr',st:'invited'}};
  let HOS={}; try{ HOS=JSON.parse(localStorage.getItem('sdHorseOwners'))||{}; }catch(e){}
  const hoSave=()=>{ try{ localStorage.setItem('sdHorseOwners',JSON.stringify(HOS)); }catch(e){} };
  { let ch=false; Object.keys(HOS).forEach(k=>{ const o=HOS[k]; if(o&&o.pend){ delete o.pend; o.st='active'; o.since=o.since||'Oct 2026'; ch=true; } }); if(ch) hoSave(); }
  window.SD_HOWNERS=()=>{ const M=Object.assign({},HO0); Object.keys(HOS).forEach(k=>{ if(HOS[k]) M[k]=HOS[k]; else delete M[k]; }); return M; };
  window.SD_HOWNER=hid=>SD_HOWNERS()[hid]||null;
  window.SD_SET_HOWNER=(hid,o)=>{ HOS[hid]=o?{n:o.n,e:o.e,st:'invited',pend:1}:null; hoSave(); };
  /* undo: put back exactly what was stored for this horse (undefined: the demo's own owner) */
  window.SD_HO_RAW=hid=>Object.prototype.hasOwnProperty.call(HOS,hid)?HOS[hid]:undefined;
  window.SD_HO_PUT=(hid,raw)=>{ if(raw===undefined) delete HOS[hid]; else HOS[hid]=raw; hoSave(); };
  window.SD_HO_ME={n:'Camille Laurent',e:'camille.laurent@gmail.com'};
  /* the horses of the horse owner account: the ones the stable gave them as owner (the demo ones if none is left) */
  window.SD_HO_IDS=()=>{ const M=SD_HOWNERS(), L=Object.keys(M).filter(k=>M[k].e===SD_HO_ME.e); return L.length?L:['bd','nl']; };
  /* ---------- a vet and a farrier work for several stables: the demo stable and two more (sample data) ---------- */
  window.SD_MULTI=['vet','farrier'].includes(plan);
  const XH=[
    {id:'x_cas',st:'ht',n:'Cassiopée',ini:'CA',breed:'Selle Français',age:10,sex:'Mare',coat:'Bay',hue:['#6B3A20','#2E170A'],r:'Julien Roche',perf:72,d:+3,lastD:2,month:6,level:'1.40 m',height:166,weight:560,shoes:'All four'},
    {id:'x_val',st:'ht',n:'Valdor du Bois',ini:'VB',breed:'BWP',age:12,sex:'Gelding',coat:'Grey',hue:['#8F96A1','#4B5058'],r:'Inès Roche',perf:58,d:-4,lastD:5,month:3,level:'1.30 m',height:171,weight:600,shoes:'Front only'},
    {id:'x_jaz',st:'ht',n:'Jazz Royal',ini:'JR',breed:'Holsteiner',age:7,sex:'Stallion',coat:'Black',hue:['#2A2F38','#15181D'],r:'Julien Roche',perf:66,d:+1,lastD:1,month:7,level:'1.25 m',height:169,weight:590,shoes:'All four'},
    {id:'x_eli',st:'mo',n:'Elixir',ini:'EL',breed:'KWPN',age:9,sex:'Gelding',coat:'Chestnut',hue:['#9A5328','#4A2410'],r:'Sophie Marchand',perf:69,d:+2,lastD:3,month:5,level:'1.35 m',height:168,weight:575,shoes:'All four'},
    {id:'x_opa',st:'mo',n:'Opaline',ini:'OP',breed:'Selle Français',age:6,sex:'Mare',coat:'Dark bay',hue:['#4E2E1E','#21130B'],r:'Léo Marchand',perf:61,d:-2,lastD:7,month:2,level:'1.15 m',height:162,weight:520,shoes:'Barefoot'},
    {id:'x_tor',st:'dl',n:'Tornado',ini:'TO',breed:'Hanoverian',age:11,sex:'Gelding',coat:'Bay',hue:['#7A4526','#3A1F10'],r:'Antoine Perrin',perf:74,d:+5,lastD:0,month:8,level:'1.45 m',height:172,weight:620,shoes:'All four'},
    {id:'x_bon',st:'dl',n:'Bonnie Blue',ini:'BB',breed:'Zangersheide',age:8,sex:'Mare',coat:'Grey',hue:['#8F96A1','#4B5058'],r:'Clara Perrin',perf:63,d:0,lastD:4,month:4,level:'1.20 m',height:164,weight:540,shoes:'Front only'},
    {id:'x_iro',st:'dl',n:'Iroko',ini:'IR',breed:'BWP',age:13,sex:'Gelding',coat:'Chestnut',hue:['#9A5328','#4A2410'],r:'Antoine Perrin',perf:56,d:-3,lastD:9,month:2,level:'1.30 m',height:170,weight:610,shoes:'All four'}];
  const STB={ms:{id:'ms',ini:'É'},ht:{id:'ht',n:'Haras des Tilleuls',ini:'H',mgr:'Julien Roche',city:'Senlis'},mo:{id:'mo',n:'Écurie du Moulin',ini:'M',mgr:'Sophie Marchand',city:'Chantilly'},dl:{id:'dl',n:'Domaine des Landes',ini:'D',mgr:'Antoine Perrin',city:'Lamorlaye'}};
  const MYST={vet:['ms','ht','mo'],farrier:['ms','ht','dl']}[plan]||['ms'];
  /* alerts of the horses of the other stables, written like the stable's own */
  window.SD_XALERTS=[
    {id:'x_val',lv:'Attention',ic:'stride',a:'Right fore short on landing',b:'Stride after landing shorter on the right, 4 jumps of 12.',when:'Sun 27 Sep · show'},
    {id:'x_cas',lv:'Watch',ic:'latbal',a:'Landings getting heavier',b:'Balance on landing down 8 points over 2 weeks.',when:'Fri 25 Sep · training'},
    {id:'x_iro',lv:'Attention',ic:'hind',a:'Left hind under load',b:'Same pattern on the last 3 sessions. Worth a look before the next start.',when:'Mon 28 Sep · training'},
    {id:'x_eli',lv:'Watch',ic:'swap',a:'Late lead change in turns',b:'Held the counter lead 4 strides before the change, turn 4.',when:'Tue 29 Sep · training'},
    {id:'x_opa',lv:'Watch',ic:'tempo',a:'Rushing the last fences',b:'Tempo up 30 m/min on the final line.',when:'Wed 23 Sep · training'},
    {id:'x_tor',lv:'Watch',ic:'tempo',a:'Tempo fading at the end',b:'Loses pace on the last line of the course, 3 sessions in a row.',when:'Yesterday · show'}].filter(a=>MYST.includes((XH.find(h=>h.id===a.id)||{}).st));
  window.SD_XH=SD_MULTI?XH.filter(h=>MYST.includes(h.st)):[];
  /* horse names offered when adding a video */
  if(['vet','farrier','groom'].includes(plan)){ const ids=plan==='groom'?['mb','qz','bd','sa','nl']:(()=>{ let F={}; try{ F=JSON.parse(localStorage.getItem('sdStaffHorses'))||{}; }catch(e){} const ini={vet:'AK',farrier:'LB',groom:'PG'}[plan]; return F[ini]||({AK:['mb','sa']}[ini])||['mb','qz','bd','sa','nl']; })();
    const N={mb:'Midnight Bolt',qz:'Quintus Z',bd:'Bella Donna',sa:'Silver Arrow',nl:'Nova de Lys'}; window.SD_HN=ids.map(i=>N[i]); }
  if(plan==='premium') window.SD_HN=['Quintus Z']; if(plan==='rider') window.SD_HN=window.SD_AS_HOWNER?SD_HO_IDS().map(i=>({mb:'Midnight Bolt',qz:'Quintus Z',bd:'Bella Donna',sa:'Silver Arrow',nl:'Nova de Lys'})[i]).filter(Boolean):['Midnight Bolt','Silver Arrow','Kalinka'];
  if(SD_MULTI) window.SD_HN=(window.SD_HN||[]).concat(SD_XH.map(h=>h.n));
  /* horses outside the stable, kept apart, private, never in the stable's numbers:
     a rider's own horses, a vet's or a farrier's client horses (same shape as the stable's horses) */
  const OWNK=window.SD_AS?{groom:'sdPersonalGroom',trainer:'sdPersonalTrainer',horseowner:'sdPersonalHowner'}[window.SD_AS]:{rider:'sdPersonal',vet:'sdClientsVet',farrier:'sdClientsFarrier'}[plan];
  const OWN0={rider:{id:'p_kal',n:'Kalinka',breed:'Selle Français',age:9,sex:'Mare',coat:'Bay',level:'1.20 m',r:'John Doe',perf:66,d:2,lastD:3,month:4,height:165},
    vet:{id:'c_orf',n:'Orfeo',breed:'KWPN',age:11,sex:'Gelding',coat:'Chestnut',level:'1.30 m',r:'Claire Dubois',perf:71,d:1,lastD:2,month:3,height:170,shoes:'All four'},
    farrier:{id:'c_uly',n:'Ulysse',breed:'Hanoverian',age:8,sex:'Gelding',coat:'Grey',level:'1.15 m',r:'Hugo Martin',perf:63,d:-2,lastD:5,month:2,height:166,shoes:'Front only'}}[window.SD_AS_HOWNER?'':plan];
  /* a horse owner starts with no horse of their own: their horses are the ones they own at the stable */
  window.SD_PERSONAL=()=>{ if(!OWNK) return []; let L=[]; try{ L=JSON.parse(localStorage.getItem(OWNK))||[]; }catch(e){}
    return [...(OWN0?[{...OWN0,personal:true,client:plan!=='rider'}]:[]),...L]; };
  window.SD_ADD_PERSONAL=H=>{ if(!OWNK) return; let L=[]; try{ L=JSON.parse(localStorage.getItem(OWNK))||[]; }catch(e){}
    const yr=+H.year; L.push({id:'p'+Date.now(),n:H.name,breed:H.breed||'–',age:yr?2026-yr:'–',sex:H.sex,coat:H.coat||'–',level:H.level||'–',height:+H.height||null,shoes:H.shoes||null,r:plan==='rider'?(window.SD_MYNAME||'John Doe'):'',perf:null,d:0,lastD:999,month:0,personal:true,client:plan!=='rider'});
    try{ localStorage.setItem(OWNK,JSON.stringify(L)); }catch(e){} };
  /* the second group of horses, named for each job: a groom's is the stable's horses they follow */
  window.SD_OWN_LABEL={rider:'My own',vet:'My Horses',farrier:'My Horses'}[plan]||'My own';
  window.SD_OWN_TAG={rider:'Personal',vet:'Client',farrier:'Client'}[plan]||'Personal';
  document.documentElement.dataset.plan=plan; document.documentElement.dataset.acct=window.SD_ACCOUNT;
  window.SD_PLANS={pro:{name:'Pro',badge:'PRO',me:'Marie'},premium:{name:'Premium',badge:'PREMIUM',me:'Marie'},
    owner:{name:'Stable Owner',badge:'OWNER',me:'Marie'},rider:{name:'Rider',badge:'RIDER',me:'John'},
    vet:{name:'Vet',badge:'VET',me:'Anne',full:'Dr. Anne Keller',ini:'AK',role:'Vet',email:'anne@vet-keller.ch'},
    farrier:{name:'Farrier',badge:'FARRIER',me:'Lucas',full:'Lucas Bernard',ini:'LB',role:'Farrier',email:'lucas@bernard-farrier.ch'},
    groom:{name:'Groom',badge:'GROOM',me:'Paul',full:'Paul Girard',ini:'PG',role:'Groom',email:'paul@stable.com'},
    trainer:{name:'Trainer',badge:'TRAINER',me:'Thomas',full:'Thomas Renaud',ini:'TR',role:'Trainer',email:'thomas.renaud@stable.com'},
    horseowner:{name:'Horse Owner',badge:'HORSE OWNER',me:'Camille',full:'Camille Laurent',ini:'CL',role:'Horse Owner',email:'camille.laurent@gmail.com'}};
  SD_PLANS.vet.name=SD_PLANS.vet.role='Vet / Osteo';
  if(window.SD_AS){ const m=SD_PLANS[window.SD_AS]; Object.assign(SD_PLANS.rider,{badge:m.badge,me:m.me,full:m.full,ini:m.ini,role:m.role,email:m.email}); }
  /* professionals of the stable: vet, farrier, groom. They see only the horses they follow (chosen by them or the owner) */
  window.SD_STAFF=['vet','farrier','groom'].includes(plan);
  if(window.SD_STAFF) document.documentElement.classList.add('staff');
  window.SD_FOLLOW=()=>{ const me=SD_PLANS[plan]; let F={}; try{ F=JSON.parse(localStorage.getItem('sdStaffHorses'))||{}; }catch(e){}
    return F[me.ini]||({AK:['mb','sa'],LB:['mb','qz','bd','sa','nl'],PG:['mb','qz','bd']}[me.ini])||[]; };
  window.SD_SET_FOLLOW=ids=>{ const me=SD_PLANS[plan]; let F={}; try{ F=JSON.parse(localStorage.getItem('sdStaffHorses'))||{}; }catch(e){} F[me.ini]=ids; try{ localStorage.setItem('sdStaffHorses',JSON.stringify(F)); }catch(e){} };
  window.SD_SHOES={mb:'All four',qz:'All four',bd:'Front only',sa:'All four',nl:'Barefoot',c_orf:'All four',c_uly:'Front only'};
  XH.forEach(h=>SD_SHOES[h.id]=h.shoes);
  /* the stable and the person who manages it: one place, every text that names the owner goes through SD_OWNERIZE */
  window.SD_OWNER='Marie S.';
  window.SD_STABLE='Écurie '+SD_OWNER;
  window.SD_OWNERIZE=s=>String(s).split('Marie S.').join(SD_OWNER);
  STB.ms.n=SD_STABLE; STB.ms.mgr=SD_OWNER; STB.ms.city='Gouvieux';
  /* the stables of this account (one for everybody, three for a vet and a farrier), and the one picked in the stable filter ('all' or an id) */
  window.SD_STABLES=MYST.map(k=>STB[k]);
  window.SD_STABLE_OF=h=>STB[(h&&h.st)||'ms']||STB.ms;
  const SELK='sdStableSel_'+plan;
  window.SD_STABLE_SEL=()=>{ let v='all'; try{ v=localStorage.getItem(SELK)||'all'; }catch(e){} return v==='all'||MYST.includes(v)?v:'all'; };
  window.SD_SET_STABLE_SEL=v=>{ try{ localStorage.setItem(SELK,v); }catch(e){} };
  /* the chips of the stable filter, same look on Home, My Horses and Sessions: All stables, then one per stable with its count */
  window.SD_STABLE_CHIPS=(box,counts,onPick)=>{ if(!box) return; const cur=SD_STABLE_SEL(), tot=Object.values(counts).reduce((a,n)=>a+n,0), TT=x=>(window.SD_T||(y=>y))(x);
    box.innerHTML=`<button class="${cur==='all'?'on':''}" data-s="all">${TT('All stables')} <em>${tot}</em></button>`+SD_STABLES.map(s=>`<button class="${cur===s.id?'on':''}" data-s="${s.id}"><span>${s.ini}</span>${s.n} <em>${counts[s.id]||0}</em></button>`).join('');
    box.querySelectorAll('button').forEach(b=>b.onclick=()=>{ SD_SET_STABLE_SEL(b.dataset.s); SD_STABLE_CHIPS(box,counts,onPick); onPick&&onPick(b.dataset.s); });
    const on=box.querySelector('button.on'); if(on&&box.scrollWidth>box.clientWidth) box.scrollLeft=Math.max(0,on.offsetLeft-16); };
  if(SD_MULTI) XH.forEach(h=>{ if(MYST.includes(h.st)) (window.SD_H0=window.SD_H0||{})[h.id]=[h.n,h.r]; });
  if(['vet','farrier'].includes(plan)) window.SD_HN=(window.SD_HN||[]).concat(SD_PERSONAL().map(h=>h.n));
  window.setPlan=p=>{ try{ localStorage.setItem('sdPlan',p); }catch(e){}
    const u=new URL(location.href); u.searchParams.delete('plan'); location.href=u.toString(); };
  /* which horses this account sees */
  /* a vet and a farrier: the horses of their other stables join the list (and SD_ALLH, the list the pages pass here, so their sessions exist) */
  window.planHorses=list=>{ if(SD_MULTI) SD_XH.forEach(x=>{ if(!list.some(h=>h.id===x.id)) list.push(Object.assign({},x)); }); const L=_planH(list);
    /* signed up with their own horses: only those (the horses of a professional's other stables stay) */
    return window.SD_MYIDS&&plan!=='owner'&&plan!=='pro'?L.filter(h=>(h.st&&h.st!=='ms')||SD_MYIDS.includes(h.id)):L; };
  const _planH=list=>plan==='premium'?list.filter(h=>h.id==='qz')
    :plan==='rider'?(window.SD_AS_HOWNER?list.filter(h=>SD_HO_IDS().includes(h.id)):list.filter(h=>(h.r||h.rider)==='John Doe')):plan==='groom'?list:SD_STAFF?list.filter(h=>(h.st&&h.st!=='ms')||SD_FOLLOW().includes(h.id))
    :(window.SD_MYIDS&&plan==='pro')?list.filter(h=>SD_MYIDS.includes(h.id)):list;
  /* keep ?plan= on internal links, so a board preview stays in its account type */
  if(new URLSearchParams(location.search).get('plan')) document.addEventListener('click',e=>{ const a=e.target.closest('a[href]'); if(!a) return;
    const h=a.getAttribute('href'); if(!h||!/^Etape/.test(h)) return; const u=new URL(h,location.href); u.searchParams.set('plan',window.SD_ACCOUNT||plan); a.href=u.toString(); },true);
  /* the person who signed up: their first name everywhere, and their horse on Home */
  let ME=null; try{ ME=JSON.parse(localStorage.getItem('sdMe')); }catch(e){}
  window.SD_ME=ME;
  /* the name of the demo person this account stands in for (before the signed-up name replaces it) */
  const DEMO_FULL=SD_PLANS[plan].full||({rider:'John Doe'}[plan])||'Marie S.';
  window.SD_MYNAME=(ME&&(ME.full||ME.name))||DEMO_FULL;
  /* a new account sees ITS horses and ITS name, whatever its role: the sample data of the demo horses is shown under their names (test app, sample numbers) */
  const MYH=ME?(ME.horses&&ME.horses.length?ME.horses:ME.horse&&ME.horse.name?[ME.horse.name]:[]).map(n=>String(n).trim()).filter(Boolean):[];
  const SOLO=['pro','premium','owner'].includes(plan);
  if(ME&&(MYH.length||ME.name)){
    const HN0={mb:'Midnight Bolt',qz:'Quintus Z',bd:'Bella Donna',sa:'Silver Arrow',nl:'Nova de Lys'};
    /* the demo horses this account sees: the signed-up horses take their place, in this order */
    const ids=plan==='premium'?['qz']:SOLO?['mb','qz','bd','sa','nl']:window.SD_AS_HOWNER?SD_HO_IDS():window.SD_STAFF?SD_FOLLOW():['mb','sa'];
    const DEMO=ids.filter(i=>HN0[i]).map(i=>[i,HN0[i],i.toUpperCase()]);
    const ini=n=>n.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const MAP=[], INI={};
    MYH.slice(0,DEMO.length).forEach((n,i)=>{ MAP.push([DEMO[i][1],n]); INI[DEMO[i][2]]=ini(n); });
    if(MYH.length&&plan==='premium'){ MAP.push(['Midnight Bolt',MYH[0]]); INI.MB=ini(MYH[0]); }
    if(MYH.length&&plan!=='owner') window.SD_MYIDS=DEMO.slice(0,MYH.length).map(d=>d[0]);
    if(MYH.length&&plan!=='owner'){ const dn=DEMO.map(d=>d[1]); window.SD_HN=MYH.slice(0,DEMO.length).concat((window.SD_HN||[]).filter(n=>!dn.includes(n))); }
    const FN=(ME.name||'').trim(), FULL=(ME.full||FN).trim();
    /* the solo plans stand in for Marie S.; a rider, a professional or a horse owner for their own demo person (the stable stays Marie S.'s) */
    if(FULL){ if(SOLO){ MAP.push(['Marie S.',FULL]); if(plan!=='owner') ['John Doe','Lea Martin'].forEach(r=>MAP.push([r,FULL])); } else if(DEMO_FULL!==FULL) MAP.push([DEMO_FULL,FULL]); }
    if(FN&&SOLO) MAP.push(['Marie',FN]);
    const fix=n=>{ let v=n.nodeValue, o=v; MAP.forEach(([a,b])=>{ if(v.includes(a)) v=v.split(a).join(b); }); const t=v.trim(); if(INI[t]) v=v.replace(t,INI[t]); if(v!==o) n.nodeValue=v; };
    const walk=r=>{ if(r.nodeType===3) return fix(r); if(r.nodeType!==1||/^(SCRIPT|STYLE)$/.test(r.nodeName)) return; const w=document.createTreeWalker(r,4); let n; while((n=w.nextNode())) fix(n); };
    new MutationObserver(L=>L.forEach(m=>{ if(m.type==='characterData') fix(m.target); else m.addedNodes.forEach(walk); })).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
    document.addEventListener('DOMContentLoaded',()=>walk(document.body)); }
  if(ME&&ME.name){ SD_PLANS[plan].me=ME.name; if(!SOLO) Object.assign(SD_PLANS[plan],{full:(ME.full||ME.name).trim(),email:ME.email||SD_PLANS[plan].email});
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
  window.SD_H0=Object.assign({mb:['Midnight Bolt','John Doe'],qz:['Quintus Z','Marie S.'],bd:['Bella Donna','Lea Martin'],sa:['Silver Arrow','John Doe'],nl:['Nova de Lys','Marie S.']},window.SD_H0||{});
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
  .sdxInfoB{width:32px;height:32px;flex:0 0 auto;border-radius:50%;border:1px solid var(--line,rgba(255,255,255,.07));background:var(--card,#14181F);color:var(--mut,#8A94A3);display:grid;place-items:center;cursor:pointer;padding:0;position:relative}
  .sdxInfoB::before{content:"";position:absolute;inset:-6px}
  .sdxInfoB svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round}
  .sdxInfoB:hover{color:var(--txt,#F2F5F8)}
  .sdxInfo{margin-top:14px;border-radius:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);padding:2px 14px}
  .sdxIR{display:flex;gap:11px;align-items:flex-start;padding:12px 0;border-top:1px solid rgba(255,255,255,.06)} .sdxIR:first-child{border-top:0}
  .sdxIR i{width:9px;height:9px;border-radius:50%;flex:0 0 auto;margin-top:5px}
  .sdxIR b{display:block;font-size:14px} .sdxIR span{display:block;font-size:12.5px;line-height:1.45;color:#8A94A3;margin-top:3px}
  html[data-theme="light"] .sdxInfo{background:rgba(16,24,40,.02);border-color:rgba(16,24,40,.08)} html[data-theme="light"] .sdxIR{border-color:rgba(16,24,40,.07)}
  html[data-acct="horseowner"] .pro{white-space:nowrap;font-size:7.5px!important;letter-spacing:.5px!important;padding:2px 6px!important}
  html[data-acct="horseowner"] .pro .ic{display:none}
  .sdStC{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;margin:0 -16px;padding:2px 16px}
  .sdStC::-webkit-scrollbar{display:none}
  .sdStC button{flex:0 0 auto;display:flex;align-items:center;gap:7px;font:inherit;font-size:12.5px;font-weight:700;color:#C7CFDB;background:var(--card2,#1A1F27);border:1px solid var(--line,rgba(255,255,255,.07));border-radius:999px;padding:6px 12px 6px 6px;cursor:pointer;white-space:nowrap;transition:background .2s,border-color .2s,color .2s}
  .sdStC button:first-child{padding-left:12px}
  .sdStC button span{width:24px;height:24px;border-radius:8px;background:linear-gradient(135deg,#1E3A64,#13213A);display:grid;place-items:center;font-size:10.5px;font-weight:900;color:#CFE0FF}
  .sdStC button em{font-style:normal;font-size:10.5px;color:var(--mut,#8A94A3)}
  .sdStC button.on{background:rgba(59,130,246,.2);border-color:var(--blue,#3B82F6);color:#fff} .sdStC button.on em{color:#CFE0FF}
  .sdStGH{display:flex;align-items:center;gap:10px;margin:14px 2px 2px}
  .sdStGH:first-child{margin-top:4px}
  .sdStGH .lg{width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,#1E3A64,#13213A);border:1px solid rgba(91,155,255,.3);display:grid;place-items:center;font-size:12px;font-weight:900;color:#CFE0FF;flex:0 0 auto}
  .sdStGH b{flex:1;min-width:0;font-size:14px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sdStGH em{font-style:normal;font-size:11px;font-weight:800;color:var(--mut,#8A94A3);background:rgba(255,255,255,.06);border-radius:999px;padding:2px 8px}
  .sdStTag{display:inline-flex;align-items:center;gap:7px;margin-top:8px;font-size:12px;font-weight:700;color:#C7CFDB}
  .sdStTag span{width:20px;height:20px;border-radius:6px;background:linear-gradient(135deg,#1E3A64,#13213A);display:grid;place-items:center;font-size:9.5px;font-weight:900;color:#CFE0FF}
  html[data-theme="light"] .sdStC button{color:var(--txt,#0F1623)} html[data-theme="light"] .sdStC button.on{background:rgba(59,130,246,.12);color:#1D4ED8} html[data-theme="light"] .sdStC button.on em{color:#2563EB}
  html[data-theme="light"] .sdStC button span,html[data-theme="light"] .sdStGH .lg,html[data-theme="light"] .sdStTag span{background:#E3ECFB;color:#1E3A64;border-color:rgba(37,99,235,.25)}
  html[data-theme="light"] .sdStGH em{background:rgba(16,24,40,.06)} html[data-theme="light"] .sdStTag{color:var(--mut,#4A5361)}
  .sdxSheet .hoIco{width:46px;height:46px;border-radius:14px;background:rgba(59,130,246,.12);display:grid;place-items:center;margin:2px 0 14px}
  .sdxSheet .hoIco svg{width:23px;height:23px;stroke:#8DB8FF;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
  .sdxL{display:block;font-size:10px;font-weight:800;letter-spacing:.8px;color:#8A94A3;margin:18px 2px 8px}
  .sdxIn{display:block;width:100%;font:inherit;font-size:15px;color:#F2F5F8;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px 14px;outline:none;transition:border-color .15s}
  .sdxIn:focus{border-color:#3B82F6} .sdxIn.jsCode{font-size:18px;font-weight:800;letter-spacing:2.5px;text-align:center} .sdxIn::placeholder{color:#5A6472}
  .hoNote{display:flex;gap:10px;align-items:flex-start;margin-top:14px;padding:11px 12px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);font-size:12.5px;line-height:1.45;color:#AEB7C4}
  .hoNote svg{width:17px;height:17px;flex:0 0 auto;margin-top:1px;stroke:#8DB8FF;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
  .hoPill{display:inline-flex;align-items:center;gap:5px;font-style:normal;font-size:11px;font-weight:800;border-radius:999px;padding:3px 9px;white-space:nowrap;flex:0 0 auto;color:#C7CFDB;background:rgba(255,255,255,.07)}
  .hoPill.inv{color:#8DB8FF;background:rgba(59,130,246,.14)} .hoPill.inv::before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor}
  html[data-theme="light"] .sdxIn{color:var(--txt,#0F1623);background:var(--card2,#F2F4F7);border-color:rgba(16,24,40,.1)}
  html[data-theme="light"] .hoNote{background:rgba(16,24,40,.03);border-color:rgba(16,24,40,.08);color:var(--mut,#4A5361)} html[data-theme="light"] .hoNote svg,html[data-theme="light"] .sdxSheet .hoIco svg{stroke:#2563EB}
  html[data-theme="light"] .hoPill{color:#4A5361;background:rgba(16,24,40,.06)} html[data-theme="light"] .hoPill.inv{color:#1D4ED8;background:rgba(59,130,246,.1)}
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
  /* a vet or a farrier joins one more stable with the code the stable gave them (mock: the request is sent) */
  window.SD_JOIN_STABLE=()=>{ const ok=v=>v.replace(/[^A-Z0-9]/gi,'').length>=6;
    xSheet(`<div class="hoIco"><svg viewBox="0 0 24 24"><path d="M8 21.5v-6c0-.943 0-1.414.293-1.707S9.057 13.5 10 13.5h4c.943 0 1.414 0 1.707.293S16 14.557 16 15.5v6M8.5 14l7.5 7.5m-.5-7.5L8 21.5m2.5-13h3"/><path d="M4.388 6.876L3.345 9.224c-.172.387-.258.58-.301.785c-.044.206-.044.417-.044.84V17.5c0 1.886 0 2.828.586 3.414S5.114 21.5 7 21.5h10c1.886 0 2.828 0 3.414-.586S21 19.386 21 17.5v-7.056c0-.47 0-.705-.053-.931c-.054-.227-.16-.437-.37-.857l-.95-1.9c-.31-.622-.466-.933-.71-1.17c-.245-.237-.56-.383-1.191-.674L12.954 2.71a2.28 2.28 0 0 0-1.908 0L6.367 4.869c-.676.312-1.014.468-1.27.727c-.255.26-.406.6-.709 1.28"/></svg></div>
      <h3>${esc(TX('Join a stable'))}</h3><div class="sub">${esc(TX('Ask the stable for its invite code. Once they accept, you see the horses they share with you.'))}</div>
      <label class="sdxL" for="jsC">${esc(TX('INVITE CODE'))}</label><input class="sdxIn jsCode" id="jsC" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" placeholder="STB-482915">
      <button class="sdxBtn" id="sdxOk" disabled>${esc(TX('Join'))}</button><button class="sdxBtn sec" id="sdxNo">${esc(TX('Cancel'))}</button>`,
    s=>{ const c=s.querySelector('#jsC'), b=s.querySelector('#sdxOk'); c.oninput=()=>{ c.value=c.value.toUpperCase(); b.disabled=!ok(c.value); };
      s.querySelector('#sdxNo').onclick=xClose; b.onclick=()=>{ if(!ok(c.value)) return; xClose(); setTimeout(()=>SD_TOAST(TX('Request sent. The stable will confirm.')),RMo()?0:200); };
      setTimeout(()=>{ try{ c.focus({preventScroll:true}); }catch(_){} },380); }); };
  /* a short message, no action */
  window.SD_TOAST=msg=>{ let t=document.getElementById('sdxToast'); if(!t){ document.body.insertAdjacentHTML('beforeend','<div class="sdxToast" id="sdxToast" role="status" aria-live="polite"></div>'); t=document.getElementById('sdxToast'); }
    t.innerHTML=`<span class="m" style="padding-right:12px;line-height:40px">${esc(msg)}</span>`; clearTimeout(t._t); void t.offsetHeight; t.classList.add('on'); t._t=setTimeout(()=>t.classList.remove('on'),2600); };
  /* Stable Owner: invite the owner of a horse (or replace them). They get their own access, with this horse only */
  window.SD_HO_INVITE=({hid,horse,current,onSent})=>{ const F={n:'',e:''}, ok=()=>F.n.trim().length>1&&/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(F.e.trim());
    xSheet(`<div class="hoIco"><svg viewBox="0 0 24 24"><circle cx="10" cy="7.5" r="3.6"/><path d="M3.5 20c.4-3.6 3.2-6.2 6.5-6.2 1.3 0 2.5.4 3.5 1"/><path d="M18 14.5v6M15 17.5h6"/></svg></div>
      <h3>${esc(TX(current?'Replace the owner':'Add the owner'))}</h3>
      <div class="sub">${esc(horse)} · ${esc(TX('They get their own StrydeUp access, with this horse only.'))}</div>
      <label class="sdxL" for="hoN">${esc(TX('FULL NAME'))}</label><input class="sdxIn" id="hoN" autocomplete="name" placeholder="${esc(TX('First and last name'))}">
      <label class="sdxL" for="hoE">${esc(TX('EMAIL'))}</label><input class="sdxIn" id="hoE" type="email" inputmode="email" autocomplete="email" placeholder="name@email.com">
      <div class="hoNote"><svg viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/></svg><span>${esc(TX('They will see this horse, its sessions and its scores.'))}</span></div>
      <button class="sdxBtn" id="sdxOk" disabled>${esc(TX('Send invite'))}</button><button class="sdxBtn sec" id="sdxNo">${esc(TX('Cancel'))}</button>`,
    s=>{ const b=s.querySelector('#sdxOk'), n=s.querySelector('#hoN'), e=s.querySelector('#hoE');
      n.oninput=()=>{ F.n=n.value; b.disabled=!ok(); }; e.oninput=()=>{ F.e=e.value; b.disabled=!ok(); };
      s.querySelector('#sdxNo').onclick=xClose;
      b.onclick=()=>{ if(!ok()) return; xClose(); setTimeout(()=>onSent&&onSent({n:F.n.trim().replace(/\s+/g,' '),e:F.e.trim()}),RMo()?0:180); };
      setTimeout(()=>{ try{ n.focus({preventScroll:true}); }catch(_){} },380); }); };
  /* confirmation before anything is deleted: says plainly what goes */
  window.SD_CONFIRM_DELETE=({title,sub,ok,onConfirm})=>xSheet(`<div class="dIco">${ICO.trash}</div><h3>${esc(title||'Delete this video?')}</h3>
      <div class="sub">${esc(sub||'The video will be removed, with its analysis and all its numbers.')}</div>
      <button class="sdxBtn red" id="sdxOk">${esc(ok||'Delete video')}</button><button class="sdxBtn sec" id="sdxNo">Cancel</button>`,
    s=>{ s.querySelector('#sdxNo').onclick=xClose; s.querySelector('#sdxOk').onclick=()=>{ xClose(); setTimeout(()=>onConfirm&&onConfirm(),RMo()?0:180); }; setTimeout(()=>{ try{ s.querySelector('#sdxNo').focus({preventScroll:true}); }catch(e){} },60); });
  /* an (i) button and the short plain-words sheet it opens */
  window.SD_INFO_BTN=(id,label)=>`<button class="sdxInfoB" id="${id}" type="button" aria-label="${esc(TX(label))}"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.9" r=".7" fill="currentColor" stroke="none"/></svg></button>`;
  window.SD_INFO=({title,rows,foot})=>xSheet(`<h3>${esc(TX(title))}</h3><div class="sdxInfo">${rows.map(([t,b,c])=>`<div class="sdxIR">${c?`<i style="background:${c}"></i>`:''}<div><b>${esc(TX(t))}</b><span>${esc(TX(b))}</span></div></div>`).join('')}</div>
      ${foot?`<div class="sub" style="margin-top:12px">${esc(TX(foot))}</div>`:''}<button class="sdxBtn" id="sdxOk">${esc(TX('Got it'))}</button>`,
    s=>{ s.querySelector('#sdxOk').onclick=xClose; });
  /* the heatmap, in plain words (My Horses and the session page) */
  window.SD_HEAT_INFO=()=>SD_INFO({title:'About the heatmap',rows:[
    ['What it shows','Where this horse\'s body works harder than usual: legs, back, neck. Each point is a place we measure.'],
    ['Normal','In line with this horse\'s usual level.','#3DD68C'],
    ['Watch','A little away from its usual level. Keep an eye on it.','#F5B544'],
    ['Attention','Clearly away from its usual level, or the same on several sessions. Worth a look.','#F2555A'],
    ['Where it comes from','It is built from the video analysis of each session: strides, landings and balance seen in the video. It is not a medical diagnosis.']]});
  window.SD_HEAT_BTN=slot=>{ const w=typeof slot==='string'?document.getElementById(slot):slot; if(!w) return; w.outerHTML=SD_INFO_BTN('hmInfo','About the heatmap');
    const b=document.getElementById('hmInfo'); if(b) b.onclick=e=>{ e.stopPropagation(); SD_HEAT_INFO(); }; };
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
        const u=new URL('Etape%204%20-%20Sessions.html?v=1007120026',location.href), pl=new URLSearchParams(location.search).get('plan'); if(pl) u.searchParams.set('plan',pl); location.href=u.toString(); }})}]); }; };
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
  .plTr{display:inline-flex;margin-top:14px;font-size:11px;font-weight:800;color:#C7CFDB;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:3px 9px}
  .plThen{font-size:12px;line-height:1.45;color:#8A94A3;text-align:center;margin-top:9px}
  html[data-theme="light"] .plTr{color:#4A5361;background:rgba(16,24,40,.04);border-color:rgba(16,24,40,.1)}
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
      <div class="plFeat"><span class="i"><svg style="color:#5B9BFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" d="M10.5 8.75v-2c0-1.644 0-2.466-.454-3.019a2 2 0 0 0-.277-.277C9.216 3 8.394 3 6.75 3s-2.466 0-3.019.454a2 2 0 0 0-.277.277C3 4.284 3 5.106 3 6.75v2c0 1.644 0 2.466.454 3.019q.125.152.277.277c.553.454 1.375.454 3.019.454s2.466 0 3.019-.454q.152-.125.277-.277c.454-.553.454-1.375.454-3.019ZM7.75 15.5h-2c-.698 0-1.047 0-1.33.086a2 2 0 0 0-1.334 1.333C3 17.203 3 17.552 3 18.25s0 1.047.086 1.33a2 2 0 0 0 1.333 1.334C4.703 21 5.052 21 5.75 21h2c.698 0 1.047 0 1.33-.086a2 2 0 0 0 1.334-1.333c.086-.284.086-.633.086-1.331s0-1.047-.086-1.33a2 2 0 0 0-1.333-1.334c-.284-.086-.633-.086-1.331-.086ZM21 17.25v-2c0-1.644 0-2.466-.454-3.019a2 2 0 0 0-.277-.277c-.553-.454-1.375-.454-3.019-.454s-2.466 0-3.019.454a2 2 0 0 0-.277.277c-.454.553-.454 1.375-.454 3.019v2c0 1.644 0 2.466.454 3.019q.125.152.277.277c.553.454 1.375.454 3.019.454s2.466 0 3.019-.454q.152-.125.277-.277C21 19.716 21 18.894 21 17.25ZM18.25 3h-2c-.698 0-1.047 0-1.33.086a2 2 0 0 0-1.334 1.333c-.086.284-.086.633-.086 1.331s0 1.047.086 1.33a2 2 0 0 0 1.333 1.334c.284.086.633.086 1.331.086h2c.698 0 1.047 0 1.33-.086a2 2 0 0 0 1.334-1.333C21 6.797 21 6.448 21 5.75s0-1.047-.086-1.33a2 2 0 0 0-1.333-1.334C19.297 3 18.948 3 18.25 3Z"/></svg></span><div><b>${T('Stable view')}</b><span>${T('Top performers and alerts across your horses')}</span></div></div></div>
    <span class="plTr">${T('30 days free')}</span>
    <button class="plBtn" id="plGo">${T('Start 30-day free trial')}</button><div class="plThen">${T(`Then $${(window.SD_OFFERS.find(o=>o.k==='pro')||{m:149}).m}/month.`)} ${T('Cancel anytime before the trial ends.')}</div><button class="plBtn sec" onclick="plClose()">${T('Not now')}</button>`,
    s=>{ s.querySelector('#plGo').onclick=()=>{ location.href='Etape%205%20-%20Profile.html?v=1007120026#plans'; }; });

  /* Stable Owner: invite a rider and give them horses */
  window.openAddRider=()=>{ const H=window.SD_ALLH||[{n:'Midnight Bolt'},{n:'Quintus Z'},{n:'Bella Donna'},{n:'Silver Arrow'},{n:'Nova de Lys'}];
    const F={name:'',email:'',role:'Rider',horses:[]};
    const draw=s=>{ s.innerHTML=`<div class="grab"></div><h3>${T('Add a user')}</h3><div class="sub">${T('They get their own access, with only the horses you give them. You keep every video and every horse.')}</div>
      <div class="k">${T('NAME')}</div><input class="plIn" id="plN" placeholder="${T('First and last name')}" value="${F.name}">
      <div class="k">${T('EMAIL')}</div><input class="plIn" id="plE" type="email" placeholder="name@stable.com" value="${F.email}">
      <div class="k">${T('ROLE')}</div><div class="plChips" id="plR">${['Rider','Vet / Osteo','Farrier','Trainer','Horse Owner','Groom'].map(r=>`<button class="${F.role===r?'on':''}" data-v="${r}">${T(r)}</button>`).join('')}</div>
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
    /* rider, vet, farrier: Add a horse starts with one question, for the stable or a horse outside it; a groom adds for the stable */
    if((plan==='rider'||SD_STAFF)&&typeof window.openAddHorse==='function'){ const _o=window.openAddHorse, pageAdd=window.onHorseAdded; window.AH_SKIP_ASSIGN=true; let mode=plan==='groom'?'stable':'own';
      const OWNT={rider:['My own horse','Your own horse','Only you see it. It is not part of the stable and does not count in its numbers.','You can follow horses of the stable and horses of your own. They are never mixed.'],
        vet:['A client horse','A client horse','Only you see it. It is not part of the stable and does not count in its numbers.','You can follow horses of the stable and horses of your clients. They are never mixed.'],
        farrier:['A client horse','A client horse','Only you see it. It is not part of the stable and does not count in its numbers.','You can follow horses of the stable and horses of your clients. They are never mixed.']}[plan];
      const stTxt=()=>SD_OWNERIZE(T('Marie S. sees it. It joins the stable and counts in its numbers.'));
      const banner=()=>{ const b=document.getElementById('ahBody'); let el=document.getElementById('ahPers'); if(!el){ b.insertAdjacentHTML('beforebegin','<div id="ahPers" style="margin:4px 16px 0;padding:11px 13px;border-radius:14px;font-size:12.5px;line-height:1.45;color:#C7CFDB"></div>'); el=document.getElementById('ahPers'); }
        const own=mode==='own'; el.style.background=own?'rgba(59,130,246,.08)':'rgba(61,214,140,.07)'; el.style.border=own?'1px solid rgba(59,130,246,.25)':'1px solid rgba(61,214,140,.25)';
        el.innerHTML=own?`<b style="color:#fff">${T(OWNT[1])}</b> · ${T(OWNT[2])}`
          :`<b style="color:#fff">${T('For')} ${window.SD_STABLE}</b> · ${stTxt()}`; };
      window.openAddHorse=(...a)=>{ _o(...a); const P=document.getElementById('ahP'); if(!P) return; const old=document.getElementById('ahWhere'); if(old) old.remove(); const pb=document.getElementById('ahPers'); if(pb) pb.style.display='none';
        if(plan==='groom'){ banner(); document.getElementById('ahPers').style.display=''; return; }
        P.insertAdjacentHTML('beforeend',`<div id="ahWhere"><h2>${T('Where does this horse go?')}</h2><div class="sub">${T(OWNT[3])}</div>
          <button class="whO" data-m="stable"><span class="whI" style="background:rgba(61,214,140,.12)"><svg viewBox="0 0 24 24" style="stroke:#5BE3A0;stroke-width:1.5"><path d="M8 21.5v-6c0-.943 0-1.414.293-1.707S9.057 13.5 10 13.5h4c.943 0 1.414 0 1.707.293S16 14.557 16 15.5v6M8.5 14l7.5 7.5m-.5-7.5L8 21.5m2.5-13h3"/><path d="M4.388 6.876L3.345 9.224c-.172.387-.258.58-.301.785c-.044.206-.044.417-.044.84V17.5c0 1.886 0 2.828.586 3.414S5.114 21.5 7 21.5h10c1.886 0 2.828 0 3.414-.586S21 19.386 21 17.5v-7.056c0-.47 0-.705-.053-.931c-.054-.227-.16-.437-.37-.857l-.95-1.9c-.31-.622-.466-.933-.71-1.17c-.245-.237-.56-.383-1.191-.674L12.954 2.71a2.28 2.28 0 0 0-1.908 0L6.367 4.869c-.676.312-1.014.468-1.27.727c-.255.26-.406.6-.709 1.28"/></svg></span>
            <div><b>${T('For')} ${window.SD_STABLE}</b><span>${stTxt()}</span></div></button>
          <button class="whO" data-m="own"><span class="whI" style="background:rgba(59,130,246,.12)"><svg viewBox="0 0 24 24" style="stroke:#8DB8FF"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg></span>
            <div><b>${T(OWNT[0])}</b><span>${T(OWNT[2])}</span></div></button></div>`);
        document.querySelectorAll('#ahWhere .whO').forEach(b=>b.onclick=()=>{ mode=b.dataset.m; document.getElementById('ahWhere').remove(); banner(); document.getElementById('ahPers').style.display=''; }); };
      window.onHorseAdded=H=>{ if(mode==='own'){ SD_ADD_PERSONAL(H); if(typeof window.SD_onPersonal==='function') window.SD_onPersonal(); }
        else { if(typeof pageAdd==='function') pageAdd({...H,rider:plan==='rider'?'John Doe':SD_OWNER}); if(typeof window.SD_onStable==='function') window.SD_onStable(); } }; }
    document.querySelectorAll('.addMenu').forEach(m=>{
      const horseBtn=[...m.querySelectorAll('button')].find(b=>/Add a horse/i.test(b.textContent)||b.textContent.includes(T('Add a horse')));
      if(plan==='premium'&&horseBtn) horseBtn.addEventListener('click',e=>{ e.stopImmediatePropagation(); e.preventDefault(); m.classList.remove('on'); document.querySelectorAll('.plus.open').forEach(p=>p.classList.remove('open')); openUpsellHorse(); },true);
      if(plan==='owner'&&!m.querySelector('[data-rider]')){ m.insertAdjacentHTML('beforeend',`<button data-rider="1"><svg style="color:var(--blue)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><circle cx="10" cy="7" r="4"/><path d="M19 8v6m3-3h-6m-6 3c-5 0-8 2.5-8 5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2c0-2.5-3-5-8-5"/></g></svg>${T('Add a user')}</button>`);
        m.querySelector('[data-rider]').addEventListener('click',e=>{ e.stopPropagation(); m.classList.remove('on'); document.querySelectorAll('.plus.open').forEach(p=>p.classList.remove('open')); openAddRider(); }); }
    });
    /* nav: the owner's second tab is the stable (icon: Hugeicons barns, MIT) */
    if(plan==='owner') document.querySelectorAll('.nav a').forEach(a=>{ if(!/My%20Horses/.test(a.getAttribute('href')||'')&&!a.querySelector('svg.horse')) return;
      const sv=a.querySelector('svg'); if(sv) sv.outerHTML='<svg class="stable" viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"><path d="M8 21.5v-6c0-.943 0-1.414.293-1.707S9.057 13.5 10 13.5h4c.943 0 1.414 0 1.707.293S16 14.557 16 15.5v6M8.5 14l7.5 7.5m-.5-7.5L8 21.5m2.5-13h3"/><path d="M4.388 6.876L3.345 9.224c-.172.387-.258.58-.301.785c-.044.206-.044.417-.044.84V17.5c0 1.886 0 2.828.586 3.414S5.114 21.5 7 21.5h10c1.886 0 2.828 0 3.414-.586S21 19.386 21 17.5v-7.056c0-.47 0-.705-.053-.931c-.054-.227-.16-.437-.37-.857l-.95-1.9c-.31-.622-.466-.933-.71-1.17c-.245-.237-.56-.383-1.191-.674L12.954 2.71a2.28 2.28 0 0 0-1.908 0L6.367 4.869c-.676.312-1.014.468-1.27.727c-.255.26-.406.6-.709 1.28"/></svg>';
      const t=[...a.childNodes].find(n=>n.nodeType===3&&n.nodeValue.trim()); if(t) t.nodeValue=T('My Stable'); });
    /* nav: a Premium account has one horse */
    if(plan==='premium') document.querySelectorAll('.nav a').forEach(a=>{ const t=[...a.childNodes].find(n=>n.nodeType===3&&/My Horses|Mes chevaux|I miei cavalli|Mis caballos|Meine Pferde/.test(n.nodeValue)); if(t) t.nodeValue=T('My Horse'); });
  });
})();
