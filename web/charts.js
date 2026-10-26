/* StrydeUp desktop web app, charts: score ring, sparkline, the big line chart with a hover crosshair.
   Colours come from the tokens of web.css (good / watch / bad, blue when the data has no good or bad direction).
   Motion is the mobile app's: rings fill, curves wipe in from the left (SD_WIPE), numbers count up (SD_COUNT). */
(function(){
  const C=window.SDC={};
  const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* a tone name for a score or a trend */
  C.toneOfScore=p=>p>=70?'good':p>=55?'watch':'bad';
  C.toneOfTrend=t=>t==='up'?'good':t==='down'?'bad':'blue';
  C.col=t=>`var(--${t==='blue'?'blue':t})`;
  /* the score ring: the number in the centre, the % hanging on its right */
  C.ring=function(p,o){ o=o||{}; const S=o.size||56, sw=o.stroke||(S>=70?6:S>=48?4.5:3.5), r=(S-sw)/2-1, c=2*Math.PI*r, t=o.tone||C.toneOfScore(p), anim=o.anim!==false&&!RM();
    const fs=o.fs||Math.round(S*.3), dash=(c*Math.max(0,Math.min(100,p))/100).toFixed(1);
    return `<svg class="ring" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" aria-label="${p}%"><circle cx="${S/2}" cy="${S/2}" r="${r}" style="stroke:var(--ring-track)" stroke-width="${sw}" fill="none"/>
      <circle cx="${S/2}" cy="${S/2}" r="${r}" style="stroke:${C.col(t)}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-dasharray="${dash} ${c.toFixed(1)}" transform="rotate(-90 ${S/2} ${S/2})">${anim?`<animate attributeName="stroke-dasharray" from="0 ${c.toFixed(1)}" to="${dash} ${c.toFixed(1)}" dur=".9s" fill="freeze" calcMode="spline" keySplines=".23 1 .32 1" keyTimes="0;1"/>`:''}</circle>
      <text x="${S/2}" y="${S/2+fs*.36}" text-anchor="middle" style="fill:var(--txt)" font-weight="720" font-size="${fs}" font-family="inherit">${p}<tspan font-size="${Math.round(fs*.5)}" style="fill:var(--mut)" dy="${-fs*.34}">%</tspan></text></svg>`; };
  /* a sparkline: area + line, stretched to its box */
  C.spark=function(s,tone,w,h){ w=w||100; h=h||32; const lo=Math.min(...s), hi=Math.max(...s), r=hi-lo||1, X=k=>1+k/(s.length-1)*(w-2), Y=v=>h-2-(v-lo)/r*(h-6);
    const p=s.map((v,k)=>`${k?'L':'M'}${X(k).toFixed(1)} ${Y(v).toFixed(1)}`).join(' '), col=C.col(tone||'blue');
    return `<svg class="spk" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:100%"><path d="${p} L${w-1} ${h} L1 ${h}Z" style="fill:${col}" opacity=".12"/><path d="${p}" fill="none" style="stroke:${col}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`; };
  /* small monthly bars (sessions per month), the last one in blue */
  C.bars=function(v,w,h){ w=w||96; h=h||36; const mx=Math.max(...v,1), bw=(w-(v.length-1)*4)/v.length;
    return `<svg class="bars" viewBox="0 0 ${w} ${h}" style="width:100%;height:100%">${v.map((x,i)=>{ const bh=Math.max(2,(h-2)*x/mx); return `<rect x="${(i*(bw+4)).toFixed(1)}" y="${(h-bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="2" style="fill:${i===v.length-1?'var(--blue)':'var(--line3)'}"/>`; }).join('')}</svg>`; };
  /* the big chart: one series, gridlines, month labels, a crosshair that follows the mouse.
     o = {values, labels:[[index,text]...], tone, height, onPick(k), anim} ; redraws itself at its width */
  C.line=function(el,o){
    const draw=(anim)=>{ const W=Math.max(320,el.clientWidth), H=o.height||Math.max(o.minH||200,el.clientHeight), v=o.values, n=v.length, PL=34, PR=14, PT=12, PB=28;
      const lo=Math.min(...v)-3, hi=Math.max(...v)+3, X=k=>PL+k/(n-1)*(W-PL-PR), Y=x=>PT+(1-(x-lo)/(hi-lo))*(H-PT-PB), col=C.col(o.tone||'blue');
      const path=v.map((x,k)=>`${k?'L':'M'}${X(k).toFixed(1)} ${Y(x).toFixed(1)}`).join(' ');
      const step=[2,5,10,20].find(st=>(hi-lo)/st<=4.5)||25, ticks=[]; for(let t=Math.ceil(lo/step)*step;t<=hi;t+=step) ticks.push(t);
      const sel=o.sel==null||o.sel>=n?n-1:o.sel;
      const gid='g'+Math.random().toString(36).slice(2,7);
      el.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;overflow:visible;position:absolute;left:0;top:0">
        <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${col}" stop-opacity=".22"/><stop offset="1" style="stop-color:${col}" stop-opacity="0"/></linearGradient></defs>
        ${ticks.map(t=>`<line x1="${PL}" x2="${W-PR}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" style="stroke:var(--grid)"/><text x="${PL-10}" y="${(Y(t)+3.5).toFixed(1)}" text-anchor="end" style="fill:var(--axis)" font-size="11" font-family="inherit">${t}</text>`).join('')}
        ${(o.labels||[]).map(([k,t])=>`<text x="${X(k).toFixed(1)}" y="${H-8}" text-anchor="middle" style="fill:var(--axis)" font-size="11" font-weight="600" font-family="inherit">${t}</text>`).join('')}
        <g class="cv"><path d="${path} L${X(n-1).toFixed(1)} ${H-PB} L${PL} ${H-PB}Z" fill="url(#${gid})"/><path d="${path}" fill="none" style="stroke:${col}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></g>
        <g class="xh"><line class="xl" x1="0" x2="0" y1="${PT}" y2="${H-PB}" style="stroke:var(--line3)" stroke-dasharray="3 3"/><circle class="xg" r="9" style="fill:${col}" opacity=".18"/><circle class="xd" r="5" style="fill:var(--card);stroke:${col}" stroke-width="2.5"/></g>
        <rect class="hit" x="${PL}" y="0" width="${W-PL-PR}" height="${H}" fill="transparent" style="cursor:crosshair"/></svg>`;
      const svg=el.firstChild, xl=svg.querySelector('.xl'), xg=svg.querySelector('.xg'), xd=svg.querySelector('.xd');
      const put=k=>{ const x=X(k), y=Y(v[k]); xl.setAttribute('x1',x); xl.setAttribute('x2',x); [xg,xd].forEach(c=>{ c.setAttribute('cx',x); c.setAttribute('cy',y); }); o.sel=k; o.onPick&&o.onPick(k); };
      put(sel);
      const hit=svg.querySelector('.hit');
      hit.onpointermove=e=>{ const r=svg.getBoundingClientRect(), k=Math.max(0,Math.min(n-1,Math.round((e.clientX-r.left-PL)/(W-PL-PR)*(n-1)))); if(k!==o.sel) put(k); };
      hit.onpointerleave=()=>{ if(o.sel!==n-1) put(n-1); };
      if(anim&&window.SD_WIPE) SD_WIPE(svg.querySelector('.cv'));
    };
    draw(o.anim!==false);
    if(!el._ro&&window.ResizeObserver){ let w=el.clientWidth, h=el.clientHeight; el._ro=new ResizeObserver(()=>{ if(Math.abs(el.clientWidth-w)>2||Math.abs(el.clientHeight-h)>2){ w=el.clientWidth; h=el.clientHeight; draw(false); } }); el._ro.observe(el); }
    el._redraw=(no)=>{ o=Object.assign(o,no||{}); draw(no&&no.anim!==undefined?no.anim:true); };
    return el;
  };
})();
