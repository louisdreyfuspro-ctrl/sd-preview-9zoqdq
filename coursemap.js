/* ============================================================================
   StrydeUp, course map "Arène 3D" (proposition B, chosen 1 Oct), app version.
   The arena tilted in perspective, fences built in volume, the ridden line on
   the floor. Tap a fence (or a bar under the map): the camera flies to a three
   quarter side view and the real jump is drawn in the air (takeoff, highest
   point, landing). Drag to turn, pinch or wheel to zoom.
   Under the map, the read-out laid out like proposition C (broadcast): metres
   ridden to each fence, then the jump in focus in four figures and a sentence.
   No invented figure: everything comes from TD (arena, fences, ridden line)
   and JDATA (per jump facts) of the page.

   API   const cm = renderCourseMap(el, TD, JDATA, {selected, onSelect, bands, autoplay})
         cm.select(id)  cm.intro()  cm.overview()  cm.destroy()
   Story (onboarding): const cm = renderCourseMap(el, TD, null, {story:true}); cm.progress(t)
   Pure SVG redrawn by a small pinhole camera, no library. Respects reduced motion.
   ========================================================================== */
(function(){
var CSS=`
.cm3{position:relative;font-variant-numeric:tabular-nums}
.cm3-map{position:relative;margin:12px -14px 0;overflow:hidden;background:#0B0E13;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04),inset 0 -1px 0 rgba(255,255,255,.04)}
.cm3-map svg{display:block;width:100%;height:auto;touch-action:none;cursor:grab;-webkit-user-select:none;user-select:none}
.cm3-map svg:active{cursor:grabbing}
.cm3-btn{position:absolute;right:12px;top:10px;display:flex;align-items:center;gap:6px;height:30px;padding:0 12px 0 10px;border-radius:15px;border:0;
  background:rgba(11,14,19,.72);color:#E3E9F2;font:600 12px/30px -apple-system,"SF Pro Text","Helvetica Neue",Arial,sans-serif;cursor:pointer;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
  opacity:0;transform:translateY(-4px);transition:opacity .25s,transform .35s cubic-bezier(.23,1,.32,1);pointer-events:none}
.cm3-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.cm3-btn.on{opacity:1;transform:none;pointer-events:auto}
.cm3-btn:active{background:rgba(59,130,246,.35)}
.cm3-hint{position:absolute;left:14px;right:14px;bottom:10px;line-height:1.35;font-size:10.5px;font-weight:500;color:rgba(220,227,238,.55);letter-spacing:.01em;pointer-events:none;
  transition:opacity .5s}
.cm3-hint.off{opacity:0}
.cm3-rd{margin-top:16px}
.cm3-cap{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:10px;font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--mut,#8A94A3)}
.cm3-cap>span{min-width:0}
.cm3-cap em{font-style:normal;font-weight:600;letter-spacing:.04em;white-space:nowrap}
.cm3-cap b{color:var(--txt,#F2F5F8);font-weight:800}
.cm3-bars{display:block;width:100%;height:auto;margin-top:10px;overflow:visible}
.cm3-bars .col{cursor:pointer}
.cm3-bars .bar{fill:rgba(59,130,246,.34);transition:fill .3s}
.cm3-bars .bar.comb{fill:rgba(59,130,246,.08);stroke:#5B9BFF;stroke-width:1.1}
.cm3-bars .col.on .bar{fill:#3B82F6}
.cm3-bars .col.on .bar.comb{fill:rgba(59,130,246,.55);stroke:#9CC2FF}
.cm3-bars .tick{fill:var(--txt,#F2F5F8);opacity:0;transition:opacity .3s}
.cm3-bars .col.on .tick{opacity:1}
.cm3-bars .val{fill:var(--mut,#8A94A3);font-size:9px;font-weight:700;transition:fill .3s}
.cm3-bars .id{fill:var(--dim,#5A6472);font-size:7.6px;font-weight:700;letter-spacing:.02em;transition:fill .3s}
.cm3-bars .col.on .val{fill:var(--txt,#F2F5F8)}
.cm3-bars .col.on .id{fill:#5B9BFF}
.cm3-leg{display:flex;gap:16px;margin-top:8px;font-size:11px;font-weight:500;color:var(--mut,#8A94A3)}
.cm3-leg i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:6px;vertical-align:-.5px}
.cm3-leg i.f{background:rgba(59,130,246,.6)} .cm3-leg i.o{box-shadow:inset 0 0 0 1.2px #5B9BFF}
.cm3-fx{margin-top:16px;padding-top:14px;border-top:1px solid var(--line,rgba(255,255,255,.07))}
.cm3-ty::before{content:"·";margin:0 6px;color:var(--dim,#5A6472)}
.cm3-grid{display:grid;grid-template-columns:repeat(4,1fr);margin-top:10px;border-radius:14px;background:var(--card2,#1A1F28);
  box-shadow:inset 0 0 0 1px var(--line,rgba(255,255,255,.07));overflow:hidden}
.cm3-grid>div{padding:11px 8px 10px 11px;min-width:0;position:relative}
.cm3-grid>div+div::before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:1px;background:var(--line,rgba(255,255,255,.07))}
.cm3-grid .k{font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut,#8A94A3);white-space:nowrap}
.cm3-grid .v{font-size:21px;font-weight:800;letter-spacing:-.02em;margin-top:5px;white-space:nowrap;color:var(--txt,#F2F5F8);line-height:1.1}
.cm3-grid .v.w{font-size:17px;letter-spacing:-.01em;line-height:1.3}
.cm3-grid .v small{font-size:11px;font-weight:600;color:var(--mut,#8A94A3);margin-left:2px;letter-spacing:0}
.cm3-grid .s{font-size:10.5px;line-height:1.3;color:var(--mut,#8A94A3);margin-top:3px}
.cm3-grid .good{color:#4CC077} .cm3-grid .watch{color:#F0A030} .cm3-grid .bad{color:#E85454}
.cm3-say{margin-top:11px;font-size:13px;line-height:1.45;color:var(--mut,#8A94A3)}
.cm3-say span+span::before{content:" "}
.cm3-in{animation:cm3in .42s cubic-bezier(.23,1,.32,1) both}
@keyframes cm3in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
html[data-theme="light"] .cm3-grid .good{color:#0E8F53} html[data-theme="light"] .cm3-grid .watch{color:#B76E00} html[data-theme="light"] .cm3-grid .bad{color:#C9303A}
html[data-theme="light"] .cm3-bars .bar{fill:rgba(37,99,235,.26)} html[data-theme="light"] .cm3-bars .col.on .bar{fill:#2563EB}
html[data-theme="light"] .cm3-bars .col.on .id{fill:#2563EB}
html[data-theme="light"] .cm3-map{margin-left:0;margin-right:0;border-radius:14px;box-shadow:0 1px 2px rgba(16,24,40,.06),0 8px 22px rgba(16,24,40,.10)}
@media (prefers-reduced-motion:reduce){.cm3-in{animation:none}.cm3-btn,.cm3-hint{transition:none}}`;

function css(){ if(document.getElementById('cm3-style')) return;
  var st=document.createElement('style'); st.id='cm3-style'; st.textContent=CSS; document.head.appendChild(st); }
var T=function(s){ return (window.SD_T||function(x){return x;})(s); };
var reduce=function(){ return matchMedia('(prefers-reduced-motion: reduce)').matches; };
var clamp=function(v){ return v<0?0:v>1?1:v; };
var eOut=function(x){ return 1-Math.pow(1-x,3); };
var eIO=function(x){ return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2; };

window.renderCourseMap=function(root,TD,JDATA,opts){
  opts=Object.assign({selected:TD.fences[0].id, bands:{good:60,watch:30}, combination:13, autoplay:true, story:false}, opts||{});
  JDATA=JDATA||{};
  css();
  var STORY=!!opts.story;
  var VW=330, VH=214, S=TD.S||3.2, F=TD.fences, AW=TD.W/S, AH=TD.H/S;
  var uid='cm3'+Math.random().toString(36).slice(2,7);
  var sel=opts.selected, alive=true;
  var R=TD.rid, T0=R[0][2], T1=R[R.length-1][2];

  var band=function(s){ return s>=opts.bands.good?'good':s>=opts.bands.watch?'watch':'bad'; };
  var WORD={good:'Good jump',watch:'To watch',bad:'Needs work'};
  var idx=function(id){ return F.findIndex(function(f){return f.id===id;}); };
  var W=function(x,y){ return [(x-TD.OX)/S,(y-TD.OY)/S]; };
  var vec=function(f){ var r=f.ang*Math.PI/180, t=[Math.cos(r),-Math.sin(r)]; return {t:t,p:[-t[1],t[0]]}; };
  var hgt=function(id){ var m=((JDATA[id]||{}).type||'').match(/([\d.]+)\s*m/); return m?+m[1]:1.6; };
  var n1=function(v){ return (+v).toFixed(1); }, n2=function(v){ return (+v).toFixed(2); };
  var at=function(t){ if(t<=R[0][2]) return R[0]; if(t>=R[R.length-1][2]) return R[R.length-1];
    for(var i=1;i<R.length;i++) if(R[i][2]>=t){ var a=R[i-1],b=R[i],k=(t-a[2])/(b[2]-a[2]); return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,t]; } };
  var seg=function(a,b){ return [at(a)].concat(R.filter(function(q){return q[2]>a&&q[2]<b;}),[at(b)]); };

  /* ---------- DOM ---------- */
  root.innerHTML='';
  var wrap=document.createElement('div'); wrap.className='cm3';
  var legs=F.slice(1).filter(function(f){return f.dPrev!=null;}), total=legs.reduce(function(a,f){return a+f.dPrev;},0);
  wrap.innerHTML='<div class="cm3-map"><svg viewBox="0 0 '+VW+' '+VH+'" translate="no" role="img" aria-label="Course map"></svg>'
    +(STORY?'':'<button class="cm3-btn" type="button"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg><span>Whole course</span></button>'
    +'<div class="cm3-hint">Tap a fence · drag to turn · pinch to zoom</div>')+'</div>'
    +(STORY?'':'<div class="cm3-rd">'
      +'<div class="cm3-cap"><span>Metres ridden to each fence</span><em>'+Math.round(total)+' m in total</em></div>'
      +'<svg class="cm3-bars" viewBox="0 0 330 64" translate="no"></svg>'
      +'<div class="cm3-leg"><span><i class="f"></i>Between two fences</span><span><i class="o"></i>Inside a combination</span></div>'
      +'<div class="cm3-fx"></div></div>');
  root.appendChild(wrap);
  var mapEl=wrap.querySelector('.cm3-map'), svg=mapEl.querySelector('svg'), btn=wrap.querySelector('.cm3-btn'),
      hint=wrap.querySelector('.cm3-hint'), bars=wrap.querySelector('.cm3-bars'), fx=wrap.querySelector('.cm3-fx');
  if(STORY){ mapEl.style.margin='0'; mapEl.style.background='transparent'; mapEl.style.boxShadow='none'; svg.style.cursor='default'; }

  /* ---------- pinhole camera ---------- */
  var OVER={cx:AW/2, cy:AH/2-1, az:0, el:50*Math.PI/180, k:2.8, D:150};
  var TOP={cx:AW/2, cy:AH/2+4, az:-.35, el:78*Math.PI/180, k:2.5, D:150};
  var cam=Object.assign({},OVER);
  var LIGHT=[.55,.42];
  function P(x,y,z){
    var dx=x-cam.cx, dy=y-cam.cy, c=Math.cos(cam.az), s=Math.sin(cam.az);
    var rx=dx*c-dy*s, ry=dx*s+dy*c, se=Math.sin(cam.el), ce=Math.cos(cam.el);
    var depth=cam.D-ry*ce-z*se, f=cam.D/Math.max(8,depth);
    return [VW/2+rx*cam.k*f, VH*.5+(ry*se-z*ce)*cam.k*f, f, depth];
  }
  var xy=function(q){ return q[0].toFixed(1)+' '+q[1].toFixed(1); };
  var pathOf=function(pts){ return 'M'+pts.map(xy).join('L'); };
  var gp=function(q){ var w=W(q[0],q[1]); return P(w[0],w[1],0); };

  /* ---------- animation state: one loop for the camera, the intro and the jump arc ---------- */
  var camAnim=null, introT0=null, arcT0=null, storyT=null, raf=0, flyTimer=0;
  var INTRO_MS=2100, ARC_MS=720;
  function fly(to,ms,delay){
    if(reduce()){ camAnim=null; Object.assign(cam,to); draw(); return; }
    var a=Object.assign({},cam), daz=to.az-a.az; while(daz>Math.PI) daz-=2*Math.PI; while(daz<-Math.PI) daz+=2*Math.PI;
    camAnim={a:a, to:to, daz:daz, t0:performance.now()+(delay||0), ms:ms||1100}; kick();
  }
  function kick(){ if(!raf&&alive) raf=requestAnimationFrame(frame); }
  function draw(){ render(performance.now()); ui(); }
  function frame(now){
    raf=0; if(!alive) return; var busy=false;
    if(camAnim){ var u=clamp((now-camAnim.t0)/camAnim.ms), q=eIO(u), A=camAnim.a, to=camAnim.to;
      if(now>=camAnim.t0){ ['cx','cy','el','k'].forEach(function(key){ cam[key]=A[key]+(to[key]-A[key])*q; }); cam.az=A.az+camAnim.daz*q; }
      if(u<1) busy=true; else camAnim=null; }
    if(introT0!=null){ if(now-introT0<INTRO_MS) busy=true; else introT0=null; }
    if(arcT0!=null){ if(now-arcT0<ARC_MS+420) busy=true; else arcT0=null; }
    render(now); ui();
    if(busy) kick();
  }

  /* ---------- scene ---------- */
  function render(now){
    var k=idx(sel), fs=F[k], J=JDATA[sel]||{};
    /* intro: the round draws itself, the fences rise in the order of the course */
    var ip=introT0==null?1:(now-introT0)/INTRO_MS;
    var tCut=STORY?storyT:(ip>=1?Infinity:T0+(T1-T0)*eOut(clamp((ip*INTRO_MS-250)/1500)));
    var grow=function(i){ return ip>=1?1:eOut(clamp((ip*INTRO_MS-120-i*70)/520)); };
    var lastPassed=-1; if(STORY) F.forEach(function(f,i){ if(f.t<=storyT) lastPassed=i; });

    var h='<defs>'
      +'<radialGradient id="'+uid+'fl" cx=".5" cy=".55" r=".7"><stop offset="0" stop-color="#1F2D44"/><stop offset="1" stop-color="#111926"/></radialGradient>'
      +'<linearGradient id="'+uid+'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A0D12"/><stop offset="1" stop-color="#10161F"/></linearGradient>'
      +'<radialGradient id="'+uid+'vg" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#0B0E13" stop-opacity="0"/><stop offset="1" stop-color="#0B0E13" stop-opacity=".72"/></radialGradient>'
      +'<radialGradient id="'+uid+'spot"><stop offset="0" stop-color="#3B82F6" stop-opacity=".34"/><stop offset=".55" stop-color="#3B82F6" stop-opacity=".12"/><stop offset="1" stop-color="#3B82F6" stop-opacity="0"/></radialGradient>'
      +'<linearGradient id="'+uid+'arc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7FB0FF"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#7FB0FF"/></linearGradient>'
      +'<filter id="'+uid+'gl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>'
      +'</defs>';
    if(!STORY) h+='<rect width="'+VW+'" height="'+VH+'" fill="url(#'+uid+'sky)"/>';
    /* floor */
    var C=[[0,0],[AW,0],[AW,AH],[0,AH]], M=18;
    if(!STORY) h+='<path d="'+pathOf([[-M,-M],[AW+M,-M],[AW+M,AH+M],[-M,AH+M]].map(function(c){return P(c[0],c[1],0);}))+'Z" fill="#111821"/>';
    h+='<path d="'+pathOf(C.map(function(c){return P(c[0],c[1],0);}))+'Z" fill="url(#'+uid+'fl)"/>';
    var gl='';
    for(var x=5;x<AW;x+=5) gl+='M'+xy(P(x,0,0))+'L'+xy(P(x,AH,0));
    for(var y=5;y<AH;y+=5) gl+='M'+xy(P(0,y,0))+'L'+xy(P(AW,y,0));
    h+='<path d="'+gl+'" stroke="rgba(150,190,255,.06)" stroke-width=".6" fill="none"/>';
    /* boards: far side in volume, near side as a rail */
    var walls=[[0,0,AW,0],[AW,0,AW,AH],[AW,AH,0,AH],[0,AH,0,0]].map(function(w){ var m=P((w[0]+w[2])/2,(w[1]+w[3])/2,0); return {w:w,dep:m[3]}; });
    walls.sort(function(a,b){return b.dep-a.dep;});
    var wall=function(w,near){ var a0=P(w[0],w[1],0),b0=P(w[2],w[3],0),a1=P(w[0],w[1],1.1),b1=P(w[2],w[3],1.1);
      if(near) return '<path d="M'+xy(a0)+'L'+xy(b0)+'" stroke="#E9EDF2" stroke-width=".9" opacity=".5"/>';
      return '<path d="M'+xy(a0)+'L'+xy(b0)+'L'+xy(b1)+'L'+xy(a1)+'Z" fill="#1E2838"/>'
        +'<path d="M'+xy(a0)+'L'+xy(b0)+'" stroke="rgba(0,0,0,.5)" stroke-width="1"/>'
        +'<path d="M'+xy(a1)+'L'+xy(b1)+'" stroke="#E9EDF2" stroke-width="1" opacity=".75"/>'; };
    var far=walls.slice(0,2), near=walls.slice(2);
    for(var wi=0;wi<far.length;wi++) h+=wall(far[wi].w,false);

    /* soft spotlight on the floor under the jump in focus */
    if(!STORY){ var cc=W(fs.x,fs.y), sp=[]; for(var a=0;a<28;a++){ var r=a/28*Math.PI*2; sp.push(P(cc[0]+Math.cos(r)*6.5,cc[1]+Math.sin(r)*6.5,0)); }
      h+='<path d="'+pathOf(sp)+'Z" fill="url(#'+uid+'spot)" opacity="'+(grow(k)).toFixed(2)+'"/>'; }

    /* ridden line on the floor: the whole round faint, drawn up to tCut */
    var done=tCut>=T1?R:R.filter(function(q){return q[2]<=tCut;}).concat(tCut>T0?[at(tCut)]:[]);
    if(STORY){
      h+='<path d="'+pathOf(R.map(gp))+'" fill="none" stroke="#9FB3CC" stroke-width=".9" stroke-dasharray="1 3" stroke-linecap="round" opacity=".35"/>';
      if(done.length>1){ var dp=pathOf(done.map(gp));
        h+='<path d="'+dp+'" fill="none" stroke="#3B82F6" stroke-width="5" opacity=".45" stroke-linecap="round" filter="url(#'+uid+'gl)"/>'
          +'<path d="'+dp+'" fill="none" stroke="#9CC2FF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>'; }
    } else if(done.length>1){
      h+='<path d="'+pathOf(done.map(gp))+'" fill="none" stroke="#3B82F6" stroke-width="1.2" opacity=".55" stroke-linejoin="round"/>';
      var t0=k>0?F[k-1].t:T0, t1=k<F.length-1?Math.min(F[k+1].t,fs.t+3):fs.t+2.4;
      if(tCut>t0){
        var ap=seg(t0,Math.min(fs.t,tCut)).map(gp);
        h+='<path d="'+pathOf(ap)+'" fill="none" stroke="#3B82F6" stroke-width="5" opacity=".32" stroke-linecap="round" stroke-linejoin="round"/>'
          +'<path d="'+pathOf(ap)+'" fill="none" stroke="#9CC2FF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
        if(tCut>fs.t){ var aw=seg(fs.t,Math.min(t1,tCut)).map(gp);
          h+='<path d="'+pathOf(aw)+'" fill="none" stroke="#9CC2FF" stroke-width="1.5" stroke-dasharray="3 2.4" opacity=".8" stroke-linecap="round"/>'; }
      }
    }
    /* start and finish written on the floor */
    var marks=[[TD.start,T('Start').toUpperCase(),0,ip>.05||STORY],[TD.finish,T('Finish').toUpperCase(),9,tCut>=T1-.5]];
    marks.forEach(function(m){ if(!m[3]) return; var q=gp(m[0]), w=Math.max(30,m[1].length*4.6+12);
      h+='<g transform="translate('+n1(q[0])+' '+n1(q[1]+m[2])+')"><rect x="'+(-w/2).toFixed(1)+'" y="-6" width="'+w.toFixed(1)+'" height="12" rx="6" fill="rgba(11,14,19,.85)" stroke="rgba(255,255,255,.3)" stroke-width=".6"/>'
        +'<text y="2.3" text-anchor="middle" font-size="6.2" font-weight="700" fill="#E9EDF2" letter-spacing=".04em" font-family="-apple-system,Helvetica Neue,Arial,sans-serif">'+m[1]+'</text></g>'; });

    /* fences: shadows first, then volumes far to near */
    var geo=F.map(function(f,i){ var v=vec(f), c=W(f.x,f.y), Jf=JDATA[f.id]||{}, H=hgt(f.id);
      var spr=f.type==='O'?(Jf.spread||1.55):0, rows=f.type==='O'?[-spr/2,spr/2]:[0];
      var g=STORY?1:grow(i);
      return {f:f,i:i,t:v.t,p:v.p,c:c,H:H,g:g,rows:rows,sp:spr,dep:P(c[0],c[1],0)[3],
        lit:STORY?(i<=lastPassed):true}; });
    var shadows='';
    geo.forEach(function(G){ if(G.g<=0) return; G.rows.forEach(function(o){
      var a=[G.c[0]+G.t[0]*o-G.p[0]*1.9, G.c[1]+G.t[1]*o-G.p[1]*1.9], b=[G.c[0]+G.t[0]*o+G.p[0]*1.9, G.c[1]+G.t[1]*o+G.p[1]*1.9];
      var s=[LIGHT[0]*G.H*G.g, LIGHT[1]*G.H*G.g];
      shadows+='M'+xy(P(a[0],a[1],0))+'L'+xy(P(a[0]+s[0],a[1]+s[1],0))+'L'+xy(P(b[0]+s[0],b[1]+s[1],0))+'L'+xy(P(b[0],b[1],0))+'Z'; }); });
    h+='<path d="'+shadows+'" fill="#000" opacity=".28"/>';
    geo.sort(function(a,b){return b.dep-a.dep;});
    geo.forEach(function(G){ if(G.g>0) h+=fence(G, !STORY&&G.f.id===sel); });
    for(var ni=0;ni<near.length;ni++) h+=wall(near[ni].w,true);

    /* rider position (story) */
    if(STORY&&storyT!=null&&storyT>T0){ var rp=gp(at(storyT));
      h+='<circle cx="'+n1(rp[0])+'" cy="'+n1(rp[1])+'" r="7" fill="#3B82F6" opacity=".35" filter="url(#'+uid+'gl)"/>'
        +'<circle cx="'+n1(rp[0])+'" cy="'+n1(rp[1])+'" r="3.2" fill="#fff" stroke="#3B82F6" stroke-width="1.5"/>'; }

    /* number plates on stems, drawn last so they always read */
    geo.slice().sort(function(a,b){return b.dep-a.dep;}).forEach(function(G){
      var on=STORY?G.i===lastPassed:G.f.id===sel; G.plate=[-99,-99];
      if(G.g<=0) return; if(on&&!STORY&&cam.k>6) return;
      var z=(G.H+1.5)*G.g, base=P(G.c[0],G.c[1],(G.H+.25)*G.g), q=P(G.c[0],G.c[1],z);
      var s=Math.max(.72,Math.min(1.15,Math.sqrt(q[2])*(on?1.08:.92)*(cam.k<4?.86:1))), w=(G.f.id.length>1?20:16)*s, hh=13*s;
      var dim=STORY&&!G.lit;
      G.plate=[q[0],q[1]-hh/2];
      h+='<g opacity="'+Math.min(1,G.g*1.6).toFixed(2)+'"><path d="M'+xy(base)+'L'+n1(q[0])+' '+n1(q[1])+'" stroke="'+(on?'#8DB8FF':'rgba(220,230,245,'+(dim?.25:.45)+')')+'" stroke-width=".7"/>'
        +'<g transform="translate('+n1(q[0])+' '+n1(q[1]-hh/2)+')">'
        +(on?'<rect x="'+(-w/2-3)+'" y="'+(-hh/2-3)+'" width="'+(w+6)+'" height="'+(hh+6)+'" rx="'+(5*s)+'" fill="#3B82F6" opacity=".35" filter="url(#'+uid+'gl)"/>':'')
        +'<rect x="'+(-w/2)+'" y="'+(-hh/2)+'" width="'+w+'" height="'+hh+'" rx="'+(3.5*s)+'" fill="'+(on?'#3B82F6':'rgba(20,26,36,.92)')+'" stroke="'+(on?'#BCD5FF':'rgba(255,255,255,'+(dim?.14:.28)+')')+'" stroke-width=".7"/>'
        +'<text y="'+(2.8*s)+'" text-anchor="middle" font-size="'+(8*s)+'" font-weight="800" fill="'+(dim?'rgba(255,255,255,.45)':'#FFFFFF')+'" font-family="-apple-system,Helvetica Neue,Arial,sans-serif">'+G.f.id+'</text></g></g>'; });

    /* the jump in the air, from the real takeoff, height and landing; draws itself after a tap */
    if(!STORY&&J.toff!=null){
      var G=geo.find(function(q){return q.f.id===sel;}), tt=G.t, d0=-(J.toff+G.sp/2), d1=J.land+G.sp/2, A=J.apex;
      var ap2=arcT0==null?1:eOut(clamp((now-arcT0)/ARC_MS)), lab=arcT0==null?1:clamp((now-arcT0-ARC_MS+120)/300);
      if(ip<1) { ap2=Math.min(ap2,clamp((ip*INTRO_MS-1500)/500)); lab=Math.min(lab,clamp((ip*INTRO_MS-1850)/250)); }
      var N=36, pts=[]; for(var i=0;i<=N;i++){ var u=i/N*ap2, d=d0+(d1-d0)*u, zz=4*A*u*(1-u); pts.push(P(G.c[0]+tt[0]*d,G.c[1]+tt[1]*d,zz)); }
      var mid=(d0+d1)/2, top=P(G.c[0]+tt[0]*mid,G.c[1]+tt[1]*mid,A), foot=P(G.c[0]+tt[0]*mid,G.c[1]+tt[1]*mid,0);
      var full=[]; for(var j=0;j<=N;j++){ var uu=j/N, dd=d0+(d1-d0)*uu; full.push(P(G.c[0]+tt[0]*dd,G.c[1]+tt[1]*dd,4*A*uu*(1-uu))); }
      var tk=full[0], ld=full[N], head=pts[pts.length-1];
      if(ap2>0){
        h+='<g><path d="'+pathOf(pts)+'" fill="none" stroke="#3B82F6" stroke-width="5" opacity=".35" stroke-linecap="round"/>'
          +'<path d="'+pathOf(pts)+'" fill="none" stroke="url(#'+uid+'arc)" stroke-width="1.9" stroke-linecap="round"/>'
          +'<circle cx="'+n1(tk[0])+'" cy="'+n1(tk[1])+'" r="2.4" fill="#0B0E13" stroke="#FFFFFF" stroke-width="1.1"/>';
        if(ap2<1) h+='<circle cx="'+n1(head[0])+'" cy="'+n1(head[1])+'" r="5" fill="#9CC2FF" opacity=".5" filter="url(#'+uid+'gl)"/><circle cx="'+n1(head[0])+'" cy="'+n1(head[1])+'" r="2" fill="#fff"/>';
        else h+='<path d="M'+xy(top)+'L'+xy(foot)+'" stroke="#FFFFFF" stroke-width=".7" stroke-dasharray="1.6 1.6" opacity=".55"/>'
          +'<circle cx="'+n1(ld[0])+'" cy="'+n1(ld[1])+'" r="2.4" fill="#0B0E13" stroke="#FFFFFF" stroke-width="1.1"/>'
          +'<circle cx="'+n1(top[0])+'" cy="'+n1(top[1])+'" r="2" fill="#FFFFFF"/>';
        h+='</g>';
      }
      if(cam.k>6&&lab>0){
        var pill=function(q,txt,dy){ var w=Math.max(30,txt.length*4.3+8);
          return '<g transform="translate('+n1(q[0])+' '+n1(q[1]+dy)+')"><rect x="'+(-w/2).toFixed(1)+'" y="-6.5" width="'+w.toFixed(1)+'" height="13" rx="6.5" fill="rgba(11,14,19,.88)" stroke="rgba(255,255,255,.25)" stroke-width=".6"/>'
            +'<text y="2.6" text-anchor="middle" font-size="7.2" font-weight="700" fill="#F2F5F8" font-family="-apple-system,Helvetica Neue,Arial,sans-serif">'+txt+'</text></g>'; };
        var sx=Math.sign(ld[0]-tk[0])||1, keep=function(q){ return [Math.max(20,Math.min(VW-20,q[0])),Math.max(10,Math.min(VH-10,q[1]))]; };
        h+='<g opacity="'+lab.toFixed(2)+'">'+pill(keep([top[0],top[1]-12]),T(n2(A)+' m'),0)
          +pill(keep([tk[0]-sx*8,tk[1]+13]),T(n2(J.toff)+' m'),0)+pill(keep([ld[0]+sx*8,ld[1]+13]),T(n2(J.land)+' m'),0)+'</g>';
      }
    }
    if(!STORY) h+='<rect width="'+VW+'" height="'+VH+'" fill="url(#'+uid+'vg)" pointer-events="none"/>';
    svg.innerHTML=h;
    HIT=geo.map(function(G){ return {id:G.f.id, x:G.plate[0], y:G.plate[1], c:P(G.c[0],G.c[1],G.H/2)}; });
  }
  var HIT=[];

  function fence(G,on){
    var c=G.c, t=G.t, p=G.p, H=G.H, g=G.g, f=G.f, hl=1.9, dimmed=STORY&&!G.lit;
    var pt=function(o,s,z){ return P(c[0]+t[0]*o+p[0]*s, c[1]+t[1]*o+p[1]*s, z*g); };
    var stdC=on?'#E6EDF7':dimmed?'#5C6878':'#AFBACA', pole=dimmed?'#7D8898':'#F4F6F9', stripe=dimmed?'#33507E':'#3B82F6';
    var s='';
    if(f.type==='L'){ var q=[pt(-1.4,-hl,0),pt(1.4,-hl,0),pt(1.4,hl,0),pt(-1.4,hl,0)];
      s+='<path d="'+pathOf(q)+'Z" fill="#2F6FD8" opacity="'+(dimmed?.45:.85)+'" stroke="#8DB8FF" stroke-width=".5"/>'; }
    G.rows.forEach(function(o){
      [-1,1].forEach(function(sg){ var a=pt(o,sg*hl,0), b=pt(o,sg*hl,H+.3), wpx=Math.max(1.3,.16*cam.k*a[2]);
        s+='<path d="M'+xy(a)+'L'+xy(b)+'" stroke="'+stdC+'" stroke-width="'+wpx.toFixed(2)+'"/>'; });
      if(f.type==='P'){ var q2=[pt(o,-hl,H-.42),pt(o,hl,H-.42),pt(o,hl,H),pt(o,-hl,H)];
        s+='<path d="'+pathOf(q2)+'Z" fill="'+pole+'" stroke="'+stripe+'" stroke-width=".8"/>'; }
      var levels=f.type==='P'?[H-.95]:(f.type==='O'?(o<0?[H-.06,H-.6]:[H,H-.55]):[H,H-.5,H-1.0]);
      levels.forEach(function(z){
        var a=pt(o,-hl,z), b=pt(o,hl,z), w=Math.max(1.1,.11*cam.k*a[2]), dl=Math.max(1.2,.42*cam.k*a[2]);
        s+='<path d="M'+xy(a)+'L'+xy(b)+'" stroke="'+pole+'" stroke-width="'+w.toFixed(2)+'"/>'
          +'<path d="M'+xy(a)+'L'+xy(b)+'" stroke="'+stripe+'" stroke-width="'+w.toFixed(2)+'" stroke-dasharray="'+dl.toFixed(1)+' '+dl.toFixed(1)+'"/>'; });
    });
    return '<g opacity="'+Math.min(1,g*1.4).toFixed(2)+'">'+s+'</g>';
  }

  /* ---------- the read-out under the map (layout of proposition C) ---------- */
  function buildBars(){
    if(!bars) return;
    var n=legs.length, gap=4, w=(330-gap*(n-1))/n, max=Math.max.apply(null,legs.map(function(f){return f.dPrev;})), H=38, h='';
    legs.forEach(function(f,i){ var x=i*(w+gap), bh=Math.max(3,f.dPrev/max*H), comb=f.dPrev<opts.combination;
      h+='<g class="col" data-j="'+f.id+'"><rect x="'+x.toFixed(2)+'" y="0" width="'+w.toFixed(2)+'" height="64" fill="transparent"/>'
        +'<rect class="bar'+(comb?' comb':'')+'" x="'+(x+.6).toFixed(2)+'" y="'+(H-bh+.6).toFixed(2)+'" width="'+(w-1.2).toFixed(2)+'" height="'+(bh-.6).toFixed(2)+'" rx="2.2"/>'
        +'<rect class="tick" x="'+x.toFixed(2)+'" y="'+(H+2.4)+'" width="'+w.toFixed(2)+'" height="1.5" rx=".75"/>'
        +'<text class="val" x="'+(x+w/2).toFixed(2)+'" y="'+(H+14)+'" text-anchor="middle">'+Math.round(f.dPrev)+'</text>'
        +'<text class="id" x="'+(x+w/2).toFixed(2)+'" y="'+(H+24)+'" text-anchor="middle">'+f.id+'</text></g>'; });
    bars.innerHTML=h;
    bars.querySelectorAll('.col').forEach(function(g){ g.addEventListener('click',function(){ pick(g.dataset.j); }); });
  }
  function barsOn(){ if(bars) bars.querySelectorAll('.col').forEach(function(g){ g.classList.toggle('on',g.dataset.j===sel); }); }
  function barsIntro(){
    if(!bars||reduce()) return;
    bars.querySelectorAll('.bar').forEach(function(b,i){ b.style.transformBox='fill-box'; b.style.transformOrigin='50% 100%';
      b.animate([{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:620,delay:300+i*45,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'}); });
  }
  var shown={};
  function roll(el,to,dec){
    var from=shown[el.dataset.k]; shown[el.dataset.k]=to;
    if(from==null||from===to||reduce()){ el.textContent=(+to).toFixed(dec); return; }
    var t0=performance.now(), step=function(now){ if(!alive) return; var u=clamp((now-t0)/480), q=eOut(u);
      el.textContent=(from+(to-from)*q).toFixed(dec); if(u<1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function renderFacts(animate){
    if(!fx) return;
    var k=idx(sel), f=F[k], J=JDATA[sel]||{}, prev=k>0?F[k-1]:null, b=band(J.score);
    var changed=J.leadT&&J.leadL&&J.leadT!==J.leadL;
    var ty=(J.type||'').trim();
    fx.innerHTML='<div class="'+(animate?'cm3-in':'')+'">'
      +'<div class="cm3-cap"><span><b>Jump</b> <b>'+f.id+'</b>'+(ty?'<span class="cm3-ty">'+ty+'</span>':'')+'</span><em>'+(prev?prev.id+' → '+f.id:'First fence')+'</em></div>'
      +'<div class="cm3-grid">'
        +'<div><div class="k">Score</div><div class="v '+b+'"><span data-k="sc"></span><small>%</small></div><div class="s">'+WORD[b]+'</div></div>'
        +'<div><div class="k">Takeoff</div><div class="v"><span data-k="to"></span><small>m</small></div><div class="s">before the fence</div></div>'
        +'<div><div class="k">Landing</div><div class="v"><span data-k="la"></span><small>m</small></div><div class="s">after the fence</div></div>'
        +'<div><div class="k">Lead</div><div class="v w">'+(J.leadT||'')+'</div><div class="s">'+(changed?'changed in the air':'kept on landing')+'</div></div>'
      +'</div>'
      +'<p class="cm3-say">'+(prev?'<span>'+n1(f.dPrev)+' m ridden from fence '+prev.id+' in '+n1(f.t-prev.t)+' s.</span>':'<span>First fence of the round.</span>')
        +(changed?'<span>The horse changed leg in the air.</span>':'')+'</p></div>';
    /* long words (Atterraggio, Puntuación...) shrink to fit their column instead of being cut */
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ if(!alive) return;
      fx.querySelectorAll('.cm3-grid .k,.cm3-grid .v.w').forEach(function(el){ var fs=parseFloat(getComputedStyle(el).fontSize), min=el.classList.contains('k')?7.5:12;
        while(el.scrollWidth>el.clientWidth+.5&&fs>min){ fs-=.5; el.style.fontSize=fs+'px'; if(el.classList.contains('k')) el.style.letterSpacing='.04em'; } }); }); });
    roll(fx.querySelector('[data-k=sc]'),J.score,0); roll(fx.querySelector('[data-k=to]'),J.toff,2); roll(fx.querySelector('[data-k=la]'),J.land,2);
  }

  /* ---------- camera shots ---------- */
  function shot(){
    var f=F[idx(sel)], t=vec(f).t, c=W(f.x,f.y);
    var az=Math.atan2(-t[0],-t[1])+1.08, fw=[-Math.sin(az),-Math.cos(az)];
    return {cx:c[0]+t[0]*.3+fw[0]*2.5, cy:c[1]+t[1]*.3+fw[1]*2.5, az:az, el:26*Math.PI/180, k:11.5, D:cam.D};
  }
  function ui(){ if(btn) btn.classList.toggle('on', cam.k>3.6&&!camAnim); }
  var hinted=false; function hideHint(){ if(hint&&!hinted){ hinted=true; hint.classList.add('off'); } }

  /* ---------- gestures: tap a fence, drag to turn, pinch or wheel to zoom ---------- */
  if(!STORY){
    var ptr=new Map(), gest=null;
    var loc=function(e){ var r=svg.getBoundingClientRect(); return {x:(e.clientX-r.left)*VW/r.width, y:(e.clientY-r.top)*VH/r.height, cx:e.clientX, cy:e.clientY}; };
    svg.addEventListener('pointerdown',function(e){ if(svg.setPointerCapture) try{ svg.setPointerCapture(e.pointerId); }catch(_){}
      ptr.set(e.pointerId,loc(e)); camAnim=null; clearTimeout(flyTimer);
      var P2=[].concat(Array.from(ptr.values()));
      gest=P2.length===1?{mode:'turn',moved:0}:{mode:'pinch',d0:Math.hypot(P2[0].x-P2[1].x,P2[0].y-P2[1].y)||1,k0:cam.k}; });
    svg.addEventListener('pointermove',function(e){ if(!ptr.has(e.pointerId)||!gest) return; var q=loc(e), o=ptr.get(e.pointerId); ptr.set(e.pointerId,q);
      if(gest.mode==='turn'){ gest.moved+=Math.hypot(q.cx-o.cx,q.cy-o.cy); if(gest.moved<5) return; hideHint();
        cam.az+=(q.x-o.x)*.012; cam.el=Math.max(.32,Math.min(1.45,cam.el+(q.y-o.y)*.008)); draw(); }
      else { var P2=Array.from(ptr.values()); if(P2.length<2) return; hideHint();
        cam.k=Math.max(2.4,Math.min(16,gest.k0*Math.hypot(P2[0].x-P2[1].x,P2[0].y-P2[1].y)/gest.d0)); draw(); } });
    var up=function(e){ if(!ptr.has(e.pointerId)) return; var q=ptr.get(e.pointerId); ptr.delete(e.pointerId);
      if(gest&&gest.mode==='turn'&&gest.moved<7) tap(q);
      if(!ptr.size) gest=null; else if(gest&&gest.mode==='pinch') gest={mode:'turn',moved:99}; };
    svg.addEventListener('pointerup',up); svg.addEventListener('pointercancel',up);
    svg.addEventListener('wheel',function(e){ e.preventDefault(); camAnim=null; hideHint(); cam.k=Math.max(2.4,Math.min(16,cam.k*Math.exp(-e.deltaY*.0022))); draw(); },{passive:false});
    var tap=function(q){ var r=svg.getBoundingClientRect(), lim=28*VW/r.width, best=null, bd=1e9;
      HIT.forEach(function(hh){ var d=Math.min(Math.hypot(hh.x-q.x,hh.y-q.y),Math.hypot(hh.c[0]-q.x,hh.c[1]-q.y)); if(d<bd){ bd=d; best=hh; } });
      if(best&&bd<lim) pick(best.id); };
    btn.addEventListener('click',function(){ hideHint(); fly(Object.assign({},OVER),1000); });
  }
  function pick(id){ if(idx(id)<0) return; hideHint();
    if(id===sel){ api.select(id,true); return; }        /* same fence again: fly back to it */
    if(opts.onSelect) opts.onSelect(id);                 /* the page calls select() itself */
    if(sel!==id) api.select(id); }

  /* ---------- go ---------- */
  var api={
    select:function(id,force){ if(idx(id)<0||(id===sel&&!force)) return; sel=id; barsOn(); renderFacts(true);
      clearTimeout(flyTimer);
      fly(shot(),1100); if(!reduce()){ arcT0=performance.now()+700; kick(); } else draw(); },
    intro:function(){
      if(!alive) return; clearTimeout(flyTimer); barsIntro();
      if(reduce()){ introT0=null; arcT0=null; camAnim=null; Object.assign(cam,shot()); draw(); return; }
      Object.assign(cam,TOP); introT0=performance.now(); arcT0=null; camAnim=null;
      fly(Object.assign({},OVER),1300);
      flyTimer=setTimeout(function(){ if(alive){ fly(shot(),1300); } },1900); kick(); },
    overview:function(){ fly(Object.assign({},OVER),1000); },
    progress:function(t){ storyT=t; var p=clamp((t-T0)/(T1-T0));
      Object.assign(cam,OVER,{az:-.32+.6*p, el:(52-6*p)*Math.PI/180}); render(performance.now()); },
    destroy:function(){ alive=false; cancelAnimationFrame(raf); clearTimeout(flyTimer); root.innerHTML=''; }
  };
  buildBars(); barsOn(); renderFacts(false);
  if(STORY){ storyT=T0; api.progress(T0); }
  else if(opts.autoplay) api.intro();
  else { Object.assign(cam,shot()); draw(); }
  return api;
};
})();
