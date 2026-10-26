/* StrydeUp desktop web app, the stable's team (Stable Owner).
   Kept super simple, as the client asked: three tables (Riders, Staff, Horse owners), each person with their role,
   the horses they ride, follow or own, their videos this week and where they are (Active / Invited).
   A click opens the person's profile, built like a rider's (client, v2): their horses, their videos, their access.
   "Invite someone" asks the name, the email, the role and the horses. Remove and resend from the ⋯ menu.

   The same people as the phone: the demo team of the mobile My Stable page, the staff's horses kept in
   'sdStaffHorses' (same key), the horse owners from plan.js (SD_HOWNERS, 'sdHorseOwners'). What the owner changes
   here is kept in 'sdTeamInvites', 'sdTeamEdits' and 'sdTeamRemoved'.
   This file also gives the person panel and the invite dialog to profile.html (window.SDTeam). */
(function(){
  const W=window.SDW, D=window.SD_DATA, C=window.SDC, T=W.T, esc=W.esc, I=W.I;
  const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DAY=864e5, TODAY=D.TODAY;
  const LS=(k,d)=>{ try{ const v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } };
  const LSW=(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
  const L=(d,sw)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw||1.6}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC={
    userPlus:L('<circle cx="9.5" cy="8" r="3.4"/><path d="M3.3 19.5c.9-3.3 3.3-5.1 6.2-5.1 1.6 0 3 .5 4.2 1.5"/><path d="M18 13.5v6M15 16.5h6"/>'),
    eye:L('<path d="M2.8 12s3.3-6.2 9.2-6.2 9.2 6.2 9.2 6.2-3.3 6.2-9.2 6.2S2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.8"/>'),
    pen:L('<path d="M15.6 5.2l3.2 3.2M4.5 19.5l.8-4 10.3-10.3a2.26 2.26 0 0 1 3.2 3.2L8.5 18.7z"/>'),
    send:L('<path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4z"/>'),
    trash:L('<path d="M4.5 7h15M9.5 7V5.2c0-.7.5-1.2 1.2-1.2h2.6c.7 0 1.2.5 1.2 1.2V7M6.5 7l.8 11.6c.1 1 .9 1.9 2 1.9h5.4c1.1 0 1.9-.8 2-1.9L17.5 7"/>'),
    info:I.info};

  /* ---------- the people ---------- */
  /* the demo team of the phone (My Stable, Riders and Staff), with the trainer of the trainer demo account */
  const BASE=[
    {id:'M', n:'Marie S.', e:'marie@stable.com', role:'Owner', grp:'riders', hs:['qz','nl'], since:'Mar 2026', me:true},
    {id:'JD',n:'John Doe', e:'john@stable.com', role:'Rider', hs:['mb','sa'], since:'Apr 2026'},
    {id:'LM',n:'Lea Martin', e:'lea.martin@stable.com', role:'Rider', hs:['bd'], since:'May 2026'},
    {id:'AK',n:'Dr. Anne Keller', e:'anne@vet-keller.ch', role:'Vet', hs:['mb','sa'], since:'Jun 2026', fol:1},
    {id:'LB',n:'Lucas Bernard', e:'lucas@bernard-farrier.ch', role:'Farrier', hs:['mb','qz','bd','sa','nl'], since:'Feb 2026', fol:1},
    {id:'TR',n:'Thomas Renaud', e:'thomas.renaud@stable.com', role:'Trainer', hs:['mb','qz','bd','sa'], since:'Mar 2026', fol:1},
    {id:'PG',n:'Paul Girard', e:'paul@stable.com', role:'Groom', hs:['mb','qz','bd'], since:'Apr 2026', fol:1}];
  /* the roles the client lists at sign-up and in "Add a user" */
  const ROLES=['Rider','Vet / Osteo','Farrier','Trainer','Horse Owner','Groom'];
  const grpOf=r=>r==='Rider'||r==='Owner'?'riders':r==='Horse Owner'?'owners':'staff';
  const iniOf=n=>String(n).replace(/^Dr\.\s*/,'').split(/\s+/).filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const horse=id=>D.ALL.find(h=>h.id===id);
  const people=()=>{ const rm=LS('sdTeamRemoved',[]), ed=LS('sdTeamEdits',{}), F=LS('sdStaffHorses',{});
    const out=BASE.map(p=>{ const q=Object.assign({},p,{st:'active',ini:p.me?'M':p.id}); if(p.fol&&Array.isArray(F[p.id])) q.hs=F[p.id].slice(); if(ed[p.id]) Object.assign(q,ed[p.id]); return q; });
    LS('sdTeamInvites',[]).forEach(x=>out.push(Object.assign({},x,{st:'invited',ini:iniOf(x.n)})));
    /* the owners of the horses, one person per email, Invited while one of their horses waits for an answer */
    const M=window.SD_HOWNERS?SD_HOWNERS():{}, by={};
    Object.keys(M).forEach(hid=>{ const o=M[hid]; if(!o||!horse(hid)) return; const k=(o.e||o.n).toLowerCase(); (by[k]=by[k]||{o,hs:[]}).hs.push(hid); if(o.st==='invited') by[k].o=o; });
    Object.keys(by).forEach(k=>{ const {o,hs}=by[k]; out.push({id:'o:'+k,n:o.n,e:o.e,role:'Horse Owner',grp:'owners',hs,since:o.since||'Oct 2026',st:o.st==='invited'?'invited':'active',ini:iniOf(o.n),ho:1}); });
    return out.filter(p=>!rm.includes(p.id)).map(p=>Object.assign(p,{grp:p.grp||grpOf(p.role)})); };
  /* what a person's horses did: videos (all, this week, this month), the average score, the direction, the alerts */
  const info=p=>{ const hs=D.ALL.filter(h=>p.hs.includes(h.id)), S=hs.length?D.sessions(hs):[];
    return {hs,S,wk:S.filter(x=>(TODAY-x.date)/DAY<7).length,mon:S.filter(x=>x.date.getFullYear()===TODAY.getFullYear()&&x.date.getMonth()===TODAY.getMonth()).length,
      avg:hs.length?Math.round(hs.reduce((a,h)=>a+h.perf,0)/hs.length):null,d:hs.length?hs.reduce((a,h)=>a+h.d,0)/hs.length:0,
      al:D.ALL_ALERTS.filter(a=>hs.some(h=>h.n===a.h))}; };
  const roleLabel=p=>p.me?'You · owner':p.role;
  const horsesTxt=ids=>{ const n=D.ALL.length; if(!ids.length) return `<span class="hNames none">No horse yet</span>`;
    if(ids.length===n&&n>1) return `<span class="hNames all">All horses</span>`;
    return `<span class="hNames" title="${esc(ids.map(i=>(horse(i)||{}).n).join(', '))}" translate="no">${esc(ids.map(i=>(horse(i)||{}).n).filter(Boolean).join(', '))}</span>`; };
  const statusPill=p=>p.me?`<span class="stP you">You</span>`:p.st==='invited'?`<span class="stP inv">Invited</span>`:`<span class="stP">Active</span>`;
  const avatar=(p,cls)=>`<span class="hAv${p.me?' me':''}${p.st==='invited'?' inv':''}${cls?' '+cls:''}">${esc(p.ini||iniOf(p.n))}</span>`;
  const toast=m=>window.SD_TOAST&&SD_TOAST(T(m));
  const changed=()=>{ W.closePop(); if(SDTeam.onChange) SDTeam.onChange(); if(pdCur){ const p=people().find(x=>x.id===pdCur); if(p) drawPerson(p); else closePerson(); } };

  /* ---------- the person panel: a rider's profile, for riders, staff and owners ---------- */
  let pdCur=null;
  const pdEnsure=()=>{ if(document.getElementById('pd')) return;
    document.body.insertAdjacentHTML('beforeend',`<div class="pdV" id="pdV"></div><aside class="pd" id="pd" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="pdN">
      <div class="pdTop"><span class="lbl">PROFILE</span><button class="x" id="pdX" aria-label="Close">${I.x}</button></div><div class="pdB" id="pdB"></div></aside>`);
    document.getElementById('pdV').onclick=closePerson; document.getElementById('pdX').onclick=closePerson;
    addEventListener('keydown',e=>{ if(e.key!=='Escape'||!pdCur) return; if(document.querySelector('.wModal.on,.wPop.on,.sdxSheet.on')) return; closePerson(); },true); };
  let pdLast=null;
  function closePerson(){ const pd=document.getElementById('pd'); if(!pd) return; pd.classList.remove('on'); document.getElementById('pdV').classList.remove('on'); pdCur=null;
    if(pdLast&&pdLast.focus&&pdLast.isConnected) try{ pdLast.focus({preventScroll:true}); }catch(e){} }
  function openPerson(p){ if(typeof p==='string') p=people().find(x=>x.id===p); if(!p) return; pdEnsure(); W.closePop();
    pdLast=document.activeElement; pdCur=p.id; drawPerson(p);
    const pd=document.getElementById('pd'); document.getElementById('pdB').scrollTop=0; void pd.offsetHeight; pd.classList.add('on'); document.getElementById('pdV').classList.add('on');
    setTimeout(()=>{ try{ pd.focus({preventScroll:true}); }catch(e){} },60); }
  function drawPerson(p){ const Ii=info(p), inv=p.st==='invited', rider=p.grp==='riders', staff=p.grp==='staff', own=p.grp==='owners';
    const tone=Ii.d>.5?'good':Ii.d<-.5?'bad':'blue', word=Ii.d>.5?'Improving':Ii.d<-.5?'Dropping':'Steady';
    const hTitle=own?'Horses they own':staff?'Horses they follow':'Their horses';
    const hRow=h=>{ const al=D.ALL_ALERTS.filter(a=>a.h===h.n), att=al.some(a=>a.lv==='Attention'), t=h.d>1?'good':h.d<-1?'bad':'';
      return `<a class="pdR" href="${W.href('horses',{},'#h='+h.id)}">${h.perf!=null?C.ring(h.perf,{size:40,anim:false}):`<span class="hAv">${esc(h.ini||iniOf(h.n))}</span>`}
        <span class="t"><b translate="no">${esc(h.n)}</b><span>${esc(h.r||'')}</span></span>
        <span class="tags"><span class="pill ${t}">${h.d>1?'Improving':h.d<-1?'Dropping':'Steady'}</span>${al.length?`<span class="pill ${att?'bad':'watch'}">${al.length} ${al.length>1?'alerts':'alert'}</span>`:''}</span>
        <span class="ico chv">${I.chevR}</span></a>`; };
    const vRow=s=>`<a class="pdR" href="${W.href('session',{v:s.key,sc:s.sc})}"><span class="kic${s.show?' show':''}">${W.kindIcon(s.show)}</span>
        <span class="t"><b><span translate="no">${esc(s.h.n)}</span> · <span>${s.show?'Show':'Training'}</span></b><span><span>${esc(D.when(s.date))}</span><span>·</span><span>${esc(s.what)}</span></span></span>
        <span class="sc num ${D.scoreTone(s.sc)}">${s.sc}<small>%</small></span><span class="ico chv">${I.chevR}</span></a>`;
    const can=p.me?'Everything':own?'See sessions and scores':p.role==='Groom'?'Add videos':'Add videos';
    document.getElementById('pdB').innerHTML=`<div class="accIn">
      <div class="pdHero">${avatar(p)}<div style="min-width:0"><div class="n" id="pdN">${esc(p.n)}</div>
        <div class="s"><span>${esc(roleLabel(p))}</span>${inv?`<span>·</span><span class="stP inv">Invited</span>`:p.since?`<span>·</span><span>since</span> <span>${esc(p.since)}</span>`:''}</div>
        <div class="s" style="margin-top:2px"><span translate="no">${esc(p.e||'')}</span></div></div></div>
      ${rider&&!inv&&Ii.avg!=null?`<div class="pdAvg">${C.ring(Ii.avg,{size:76})}<div class="t"><div class="lbl">AVERAGE OF THEIR HORSES</div>
          <div class="w"><span class="pill ${tone}">${word}</span><span class="num" style="font-size:13px;color:var(--mut);font-weight:600">${Ii.d>=0?'▲ +':'▼ '}${Math.abs(Ii.d).toFixed(1)}</span> <span style="font-size:13px;color:var(--mut);font-weight:600">pts this month</span></div>
          <p>Their own progress, not a ranking: every rider has different horses, heights and goals.</p></div></div>`:''}
      <div class="pdStats"><div><span class="lbl">HORSES</span><b class="num">${Ii.hs.length}</b></div><div><span class="lbl">VIDEOS</span><b class="num">${inv?'–':Ii.S.length}</b></div><div><span class="lbl">THIS WEEK</span><b class="num">${inv?'–':Ii.wk}</b></div></div>
      <div class="pdSec"><div class="h"><h3>${hTitle}</h3><em class="num">${Ii.hs.length}</em></div>
        <div class="pdL">${Ii.hs.length?Ii.hs.map(hRow).join(''):`<div class="pdNote">No horse yet. Give them horses with Edit access.</div>`}</div></div>
      <div class="pdSec"><div class="h"><h3>Latest videos</h3>${!inv&&Ii.S.length?`<div class="r"><a class="btn link" href="${W.href('sessions')}">All videos</a></div>`:''}</div>
        <div class="pdL">${inv?`<div class="pdNote">No video yet. They join when they accept the invitation.</div>`:Ii.S.length?Ii.S.slice(0,5).map(vRow).join(''):`<div class="pdNote">No video yet.</div>`}</div></div>
      <div class="pdSec"><div class="h"><h3>Access</h3></div>
        <div class="set"><div class="kv" style="border-top:0"><div><span>ROLE</span><b>${esc(roleLabel(p))}</b></div><div><span>${inv?'STATUS':'SINCE'}</span><b>${inv?'Invited':esc(p.since||'')}</b></div>
          <div><span>CAN</span><b>${can}</b></div><div><span>HORSES</span><b>${Ii.hs.length===D.ALL.length&&D.ALL.length>1?'All horses':Ii.hs.length}</b></div></div></div>
        ${p.me?'':`<div class="pdAct"><button class="btn" id="pdEd">${W.ic(IC.pen)}<span>Edit access</span></button>${inv?`<button class="btn" id="pdRs">${W.ic(IC.send)}<span>Resend invite</span></button>`:''}<button class="btn dng" id="pdRm" style="margin-left:auto">${W.ic(IC.trash)}<span>Remove</span></button></div>`}</div>
    </div>`;
    const $=id=>document.getElementById(id);
    if($('pdEd')) $('pdEd').onclick=()=>openInvite(p);
    if($('pdRs')) $('pdRs').onclick=()=>resend(p);
    if($('pdRm')) $('pdRm').onclick=()=>remove(p); }

  /* ---------- invite (or edit the access of) someone ---------- */
  function openInvite(edit,preset){ if(typeof edit==='string') edit=people().find(x=>x.id===edit);
    const H=D.ALL, isOwner=edit&&edit.ho;
    const F=edit?{n:edit.n,e:edit.e,role:edit.role==='Vet'?'Vet / Osteo':edit.role,hs:edit.hs.slice()}:{n:'',e:'',role:preset||'Rider',hs:[]};
    const roles=edit?(isOwner?['Horse Owner']:ROLES.filter(r=>r!=='Horse Owner')):ROLES;
    const okMail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    const valid=()=>(edit||(F.n.trim().length>1&&okMail(F.e)))&&(F.role!=='Horse Owner'||F.hs.length>0);
    const note=r=>r==='Horse Owner'?'They see the horses they own, their sessions and their scores. Nothing else of the stable.'
      :r==='Rider'?'They see the horses you give them, their sessions and their scores, and can add videos.'
      :'They follow the horses you give them and can add videos. You keep every video and every horse.';
    const dyn=()=>{ const all=F.hs.length===H.length;
      return `<div class="ivS"><div class="fLbl"><span>ROLE</span></div><div class="chips" id="ivR" role="radiogroup">${roles.map(r=>`<button class="chip${F.role===r?' on':''}" role="radio" aria-checked="${F.role===r}" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div></div>
        <div class="ivS"><div class="fLbl"><span>${F.role==='Horse Owner'?'HORSES THEY OWN':'HORSES THEY CAN SEE'}</span><button class="btn link" id="ivAll">${all?'Clear':'All horses'}</button></div>
          <div class="chips" id="ivH">${H.map(h=>`<button class="chip${F.hs.includes(h.id)?' on':''}" aria-pressed="${F.hs.includes(h.id)}" data-h="${h.id}"><span class="hAv">${esc(h.ini||iniOf(h.n))}</span><span translate="no">${esc(h.n)}</span></button>`).join('')}</div></div>
        <div class="ivNote">${W.ic(IC.info)}<span>${note(F.role)}</span></div>`; };
    const m=W.modal({title:T(edit?'Edit access':'Invite someone'),sub:esc(T(edit?'Choose their role and the horses they can see.':'They get their own access, with only the horses you give them. You keep every video and every horse.')),
      icon:`<span class="ico" style="width:40px;height:40px;border-radius:11px;background:var(--blue-bg);color:var(--blue-ink);padding:9px">${edit?IC.pen:IC.userPlus}</span>`,
      body:(edit?`<div class="ivWho">${avatar(edit)}<div><b>${esc(edit.n)}</b><span translate="no">${esc(edit.e||'')}</span></div></div>`
        :`<div class="ivG"><div class="fld"><label for="ivN">FULL NAME</label><input class="inp" id="ivN" autocomplete="off" placeholder="First and last name" autofocus></div>
          <div class="fld"><label for="ivE">EMAIL</label><input class="inp" id="ivE" type="email" autocomplete="off" placeholder="name@email.com"></div></div>`)+`<div id="ivDyn">${dyn()}</div>`,
      foot:`<button class="btn" id="ivX">Cancel</button><button class="btn pri" id="ivGo" disabled>${W.ic(edit?I.check:IC.send)}<span>${edit?'Save':'Send the invitation'}</span></button>`,
      wire:m=>{ m.classList.add('iv'); const go=m.querySelector('#ivGo'), upd=()=>{ go.disabled=!valid(); };
        const bind=()=>{ m.querySelectorAll('#ivR .chip').forEach(b=>b.onclick=()=>{ F.role=b.dataset.v; redraw(); });
          m.querySelectorAll('#ivH .chip').forEach(b=>b.onclick=()=>{ const v=b.dataset.h, i=F.hs.indexOf(v); i>=0?F.hs.splice(i,1):F.hs.push(v); redraw(); });
          m.querySelector('#ivAll').onclick=()=>{ F.hs=F.hs.length===H.length?[]:H.map(h=>h.id); redraw(); }; };
        const redraw=()=>{ m.querySelector('#ivDyn').innerHTML=dyn(); bind(); upd(); };
        bind(); upd();
        const n=m.querySelector('#ivN'), e=m.querySelector('#ivE');
        if(n) n.oninput=()=>{ F.n=n.value; upd(); }; if(e) e.oninput=()=>{ F.e=e.value; upd(); };
        m.querySelector('#ivX').onclick=W.closeModal;
        m.addEventListener('keydown',ev=>{ if(ev.key==='Enter'&&ev.target.tagName==='INPUT'&&!go.disabled) go.click(); });
        go.onclick=()=>{ if(!valid()) return; W.closeModal(); edit?saveEdit(edit,F):sendInvite(F); }; } });
    return m; }
  let fresh=null;
  function sendInvite(F){ const n=F.n.trim().replace(/\s+/g,' '), e=F.e.trim();
    if(F.role==='Horse Owner'){ F.hs.forEach(hid=>SD_SET_HOWNER(hid,{n,e})); fresh='o:'+e.toLowerCase(); }
    else { const L=LS('sdTeamInvites',[]), id='i'+Date.now(); L.push({id,n,e,role:F.role,hs:F.hs.slice(),since:null,grp:grpOf(F.role)}); LSW('sdTeamInvites',L); fresh=id; }
    changed(); toast('Invitation sent'); }
  function saveEdit(p,F){
    if(p.ho){ const M=SD_HOWNERS(); p.hs.filter(h=>!F.hs.includes(h)).forEach(h=>SD_HO_PUT(h,null));
      F.hs.filter(h=>!p.hs.includes(h)).forEach(h=>{ const was=M[p.hs[0]]; p.st==='invited'?SD_SET_HOWNER(h,{n:p.n,e:p.e}):SD_HO_PUT(h,{n:p.n,e:p.e,st:'active',since:(was&&was.since)||'Oct 2026'}); }); }
    else if(p.st==='invited'){ const L=LS('sdTeamInvites',[]), x=L.find(y=>y.id===p.id); if(x){ x.role=F.role; x.hs=F.hs.slice(); x.grp=grpOf(F.role); LSW('sdTeamInvites',L); } }
    else { const ed=LS('sdTeamEdits',{}), role=F.role==='Vet / Osteo'&&p.role==='Vet'?'Vet':F.role; ed[p.id]={role,hs:F.hs.slice(),grp:grpOf(role)}; LSW('sdTeamEdits',ed);
      /* the horses a professional follows: the same list as on the phone */
      if(grpOf(role)==='staff'){ const Fo=LS('sdStaffHorses',{}); Fo[p.id]=F.hs.slice(); LSW('sdStaffHorses',Fo); } }
    changed(); toast('Access updated'); }
  function resend(p){ W.closePop(); toast('Invitation sent again'); }
  function remove(p){ const inv=p.st==='invited';
    W.modal({title:T(`Remove ${p.n}?`),icon:`<span class="ico" style="width:40px;height:40px;border-radius:11px;background:var(--bad-bg);color:var(--bad-ink);padding:9px">${IC.trash}</span>`,
      sub:esc(T(inv?'The invitation is cancelled. You can invite them again later.':p.ho?'They lose access to their horses in StrydeUp. The horses and their videos stay in the stable.':'They lose access to the horses of the stable. Their videos stay with the horses.')),
      foot:`<button class="btn" id="rmX">Cancel</button><button class="btn red" id="rmGo">${W.ic(IC.trash)}<span>${inv?'Cancel the invitation':'Remove from the team'}</span></button>`,
      wire:m=>{ m.querySelector('#rmX').onclick=W.closeModal; setTimeout(()=>{ try{ m.querySelector('#rmX').focus(); }catch(e){} },60);
        m.querySelector('#rmGo').onclick=()=>{ W.closeModal();
          const snap={rm:LS('sdTeamRemoved',[]),inv:LS('sdTeamInvites',[]),ho:p.ho?p.hs.map(h=>[h,SD_HO_RAW(h)]):[]};
          if(p.ho) p.hs.forEach(h=>SD_HO_PUT(h,null));
          else if(inv) LSW('sdTeamInvites',snap.inv.filter(x=>x.id!==p.id));
          else LSW('sdTeamRemoved',snap.rm.concat(p.id));
          if(pdCur===p.id) closePerson();
          changed();
          const undo=()=>{ LSW('sdTeamRemoved',snap.rm); LSW('sdTeamInvites',snap.inv); snap.ho.forEach(([h,r])=>SD_HO_PUT(h,r)); changed(); };
          window.SD_UNDO?SD_UNDO(T(inv?'Invitation cancelled':'Removed from the team'),undo):toast('Removed from the team'); }; } }); }
  /* the ⋯ menu of a row */
  function menu(btn,p){ const inv=p.st==='invited';
    const it=(a,ic,t,red)=>`<button class="mi${red?' red':''}" data-a="${a}">${W.ic(ic)}<span class="t">${t}</span></button>`;
    const pop=W.pop(btn,it('view',IC.eye,'View profile')+(p.me?'':it('edit',IC.pen,'Edit access')+(inv?it('resend',IC.send,'Resend invite'):'')+'<div class="sep"></div>'+it('remove',IC.trash,inv?'Cancel the invitation':'Remove from the team',1)),{w:230});
    if(pop) pop.querySelectorAll('.mi').forEach(b=>b.onclick=()=>{ W.closePop(); const a=b.dataset.a;
      if(a==='view') openPerson(p); if(a==='edit') openInvite(p); if(a==='resend') resend(p); if(a==='remove') remove(p); }); }

  window.SDTeam={people,info,openPerson,closePerson,openInvite,menu,horsesTxt,statusPill,avatar,roleLabel,iniOf,onChange:null,
    takeFresh:()=>{ const f=fresh; fresh=null; return f; }};

  /* ======================================================================
     the Team page
     ====================================================================== */
  if(W.page!=='team') return;
  const page=document.getElementById('wPage');
  /* not the Stable Owner: said politely, then back to Home */
  if(W.PLAN!=='owner'){ const solo=['pro','premium'].includes(W.PLAN);
    page.innerHTML=`<div class="tmNo accIn"><div class="ill">${W.ic(I.team)}</div>
      <h2>${solo?'Teams come with the Stable Account':`<span>The team is managed by</span> <span translate="no">${esc(window.SD_OWNER||'Marie S.')}</span>`}</h2>
      <p>${solo?'A Stable Account adds riders, vets, farriers, grooms and owners, each with the horses you give them.':'Only the Stable Owner sees and manages the people of the stable and their access.'}</p>
      <div class="acts"><a class="btn${solo?'':' pri'}" href="${W.href('home')}">${W.ic(I.home)}<span>Back to Home</span></a>${solo?`<a class="btn pri" href="${W.href('profile',{s:'plan'},'#plans')}"><span>Compare plans</span></a>`:''}</div>
      <div class="cd">Taking you back to Home in a few seconds.</div><div class="bar"><i></i></div></div>`;
    const t=setTimeout(()=>location.replace(W.href('home')),RM()?6000:5000);
    page.querySelectorAll('.acts a').forEach(a=>a.addEventListener('click',()=>clearTimeout(t)));
    return; }

  const TBL=[
    ['riders','Riders','They ride the horses you give them.','Invite a rider','Rider','HORSES'],
    ['staff','Staff','Vet, farrier, trainer, groom: each one follows the horses you choose.','Invite a vet, a farrier, a trainer or a groom','Vet / Osteo','HORSES THEY FOLLOW'],
    ['owners','Horse owners','They see the horses they own: sessions and scores.','Add the owner of a horse','Horse Owner','HORSES THEY OWN']];
  function render(){ const P=people(), nf=SDTeam.takeFresh();
    const row=p=>{ const Ii=info(p), inv=p.st==='invited';
      return `<div class="tr click${p.id===nf?' new':''}" data-id="${esc(p.id)}" tabindex="0" role="button" aria-label="${esc(p.n)}">
        <div class="cellH">${avatar(p)}<div class="cell2"><b translate="no">${esc(p.n)}</b><span translate="no">${esc(p.e||'')}</span></div></div>
        <span class="role">${esc(roleLabel(p))}</span>
        ${horsesTxt(p.hs)}
        <span class="num${inv||!Ii.wk?' zero':''}">${inv?'–':Ii.wk}</span>
        <span>${statusPill(p)}</span>
        <button class="more" aria-label="More" aria-haspopup="menu">${I.dots}</button></div>`; };
    const inv=P.filter(p=>p.st==='invited').length;
    page.innerHTML=`<div class="tmWrap">
      <div class="tmHead accIn"><div><div class="hEy" translate="no">${esc(window.SD_STABLE||'')}</div><h1 class="hT">Team</h1>
        <p class="sub"><span>Who can see your horses, and which ones.</span>${inv?` <span class="stP inv" style="margin-left:6px">${inv} ${inv>1?'invitations pending':'invitation pending'}</span>`:''}</p></div>
        <div class="r"><button class="btn pri" id="tmInv">${W.ic(IC.userPlus)}<span>Invite someone</span></button></div></div>
      ${TBL.map(([k,t,d,add,role,hcol],i)=>{ const L=P.filter(p=>p.grp===k);
        return `<section class="card tmCard accIn" style="animation-delay:${.04+i*.05}s"><div class="cardH"><h2><span>${t}</span> <em class="num">${L.length}</em></h2><div class="r"><span class="mut" style="font-size:12.5px">${d}</span></div></div>
          <div class="tbl tmT" style="margin-top:6px"><div class="tr th"><span>PERSON</span><span>ROLE</span><span>${hcol}</span><span>VIDEOS THIS WEEK</span><span>STATUS</span><span></span></div>
          ${L.length?L.map(row).join(''):`<div class="tmEmpty">Nobody yet.</div>`}</div>
          <button class="tmAdd" data-role="${esc(role)}"><span class="pl">+</span><span><span>${add}</span></span></button></section>`; }).join('')}
      </div>`;
    document.getElementById('tmInv').onclick=()=>openInvite();
    page.querySelectorAll('.tmAdd').forEach(b=>b.onclick=()=>openInvite(null,b.dataset.role));
    page.querySelectorAll('.tmT .tr[data-id]').forEach(r=>{ const p=P.find(x=>x.id===r.dataset.id);
      r.onclick=e=>{ if(e.target.closest('.more')) return; openPerson(p); };
      r.onkeydown=e=>{ if((e.key==='Enter'||e.key===' ')&&e.target===r){ e.preventDefault(); openPerson(p); } };
      r.querySelector('.more').onclick=e=>{ e.stopPropagation(); menu(e.currentTarget,p); }; });
    const nw=page.querySelector('.tr.new'); if(nw) nw.scrollIntoView({block:'nearest',behavior:RM()?'auto':'smooth'}); }
  SDTeam.onChange=render;
  render();
  /* a link can open a person (#p=JD, the initials, as on the phone) or the invitation (#invite) */
  const hp=new URLSearchParams(location.hash.slice(1)), pid=hp.get('p');
  if(pid){ const p=people().find(x=>x.id===pid||x.ini===pid||iniOf(x.n)===pid); if(p) openPerson(p); }
  if(location.hash==='#invite') openInvite();
})();
