/* StrydeUp desktop web app, "Coming next": a page of the app that is not on the computer yet.
   Opened by SDW.href() for every page whose ready flag is false (shell.js), with ?p=<page> and the page's own query and hash.
   It says so plainly and opens the same screen of the mobile app, with the same horse, session or person. */
(function(){
  const W=window.SDW, T=W.T, esc=W.esc, q=new URLSearchParams(location.search), p=q.get('p')||'horses', P=W.PAGES[p]||W.PAGES.horses;
  q.delete('p'); q.delete('plan');
  const mq={}; q.forEach((v,k)=>{ if(k==='v') mq[k]=v; });
  const D=window.SD_DATA, hm=(location.hash.match(/h=([\w]+)/)||[])[1], h=hm&&D&&D.ALL.concat(D.personal()).find(x=>x.id===hm);
  const what={horses:'My Horses, the horse page and its trends',sessions:'every session, with filters and search',session:'the session analysis: video, heatmap, course map, jumps and metrics',
    team:'the team: people, roles and the horses they can see',profile:'your profile, plan and preferences',settings:'language, appearance and notifications',signup:'the sign-up'}[p];
  const icon={horses:W.I.horse,sessions:W.I.sessions,session:W.I.sessions,team:W.I.team,profile:W.I.profile,settings:W.I.settings,signup:W.I.profile}[p]||W.I.home;
  document.getElementById('wPage').innerHTML=`<div class="wSoon"><div class="ill">${W.ic(icon)}</div><div class="pill blue" style="margin-bottom:14px">Coming next</div>
    <h2>${esc(T(P.t))}${h?` · ${esc(h.n)}`:''}</h2><p><span>On the computer, this page arrives with the next phase:</span> <span>${esc(what||'')}</span></p><p>${esc(T('It already works in the mobile app, with the same account and the same numbers.'))}</p>
    <div class="acts"><a class="btn" href="${W.href('home')}">${W.ic(W.I.home)}<span>Back to Home</span></a><a class="btn pri" href="${W.mobileHref(p,mq,location.hash)}">${W.ic(W.I.phone)}<span>Open in the mobile app</span></a></div>
    <div class="note">Private preview with sample data.</div></div>`;
})();
