/* StrydeUp, languages.
   English is the source text of every page. For another language this script loads
   i18n-<code>.js (a dictionary) and translates the page as it is drawn, including
   everything the page renders later (sheets, tabs, toasts).
   Language is chosen in Profile > Language and kept in localStorage 'sdLang'.
   To add a language: add it to LANGS below, then create i18n-<code>.js on the model of i18n-fr.js. */
(function(){
  var LANGS=[['en','English'],['fr','Français'],['it','Italiano'],['es','Español'],['de','Deutsch']];
  window.SD_LANGS=LANGS;
  var lang='en'; try{ lang=localStorage.getItem('sdLang')||'en'; }catch(e){}
  if(!LANGS.some(function(l){return l[0]===lang;})) lang='en';
  window.SD_LANG=lang;
  window.SD_LANG_NAME=LANGS.filter(function(l){return l[0]===lang;})[0][1];
  window.setLang=function(l){ try{ localStorage.setItem('sdLang',l); }catch(e){} location.reload(); };
  window.SD_T=function(s){ return s; };
  if(lang==='en') return;
  document.documentElement.lang=lang;

  window.SD_I18N_RUN=function(D){
    var EXACT={}, TPL=[], CACHE=new Map(), OUT=new Set();
    var DAYS=D.days||{}, MONTHS=D.months||{};
    var dayRe='(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)', monRe='(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)';
    var DATE='((?:'+dayRe+',?\\s+)?(?:\\d{1,2}\\s+'+monRe+'\\.?|'+monRe+'\\.?\\s+\\d{1,2}(?:,\\s*\\d{4})?|'+monRe+')(?:\\s+\\d{4})?)';
    var NUM='([+\\-−]?\\d[\\d.,:]*)';
    var esc=function(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); };
    Object.keys(D.T).forEach(function(k){
      if(!/\{[#HD]\}/.test(k)){ EXACT[k]=D.T[k]; return; }
      var kinds=[], src='^'+k.split(/(\{[#HD]\})/).map(function(p){
        if(p==='{#}'){ kinds.push('#'); return NUM; }
        if(p==='{H}'){ kinds.push('H'); return '(.+?)'; }
        if(p==='{D}'){ kinds.push('D'); return DATE; }
        return esc(p);
      }).join('')+'$';
      TPL.push({re:new RegExp(src), kinds:kinds, to:D.T[k], w:k.replace(/\{[#HD]\}/g,'').length});
    });
    TPL.sort(function(a,b){ return b.w-a.w; });
    var CTX=D.ctx||{};
    var DOT=D.dayDot?new RegExp('(^|\\s)(\\d{1,2}) ('+Object.keys(MONTHS).map(function(k){ return esc(MONTHS[k]); }).join('|')+')','i'):/(?!)/;
    var num=function(n){ return D.dec&&D.dec!=='.'?n.replace(/(\d)\.(\d)/g,'$1'+D.dec+'$2'):n; };
    var caseLike=function(src,out){ return src.length>1&&src===src.toUpperCase()?out.toUpperCase():out; };
    function date(s){
      var m=s.match(new RegExp('^('+dayRe+',?\\s+)?('+monRe+')\\.?\\s+(\\d{1,2})(?:,\\s*(\\d{4}))?$','i'));
      if(m&&D.dayFirst) s=(m[1]?m[1].trim()+' ':'')+m[3]+' '+m[2]+(m[4]?' '+m[4]:'');
      return s.replace(new RegExp('\\b('+dayRe+'|'+monRe+')\\b','gi'),function(w){
        var k=w.charAt(0).toUpperCase()+w.slice(1).toLowerCase();
        var t=MONTHS[k]||DAYS[k]; return t?caseLike(w,t):w; }).replace(/\.\./g,'.').replace(DOT,'$1$2. $3');
    }
    function core(s){
      if(Object.prototype.hasOwnProperty.call(EXACT,s)) return EXACT[s];
      for(var i=0;i<TPL.length;i++){
        var t=TPL[i], m=t.re.exec(s); if(!m) continue;
        var vals={'#':[],H:[],D:[]};
        t.kinds.forEach(function(k,j){ var v=m[j+1]; vals[k].push(k==='#'?num(v):k==='D'?date(v):tr(v)); });
        var c={'#':0,H:0,D:0};
        return t.to.replace(/\{([#HD])\}/g,function(_,k){ var v=vals[k][c[k]++]; return v==null?'':v; });
      }
      if(/(^|\s)·(\s|$)/.test(s)){
        var parts=s.split(/\s*·\s*/);
        if(parts.length>1){ var out=parts.map(tr); if(out.join('')!==parts.join('')) return s.replace(/[^·]+/g,function(p){ var t=p.trim(); return t?p.replace(t,tr(t)):p; }); }
      }
      if(new RegExp('\\b'+monRe+'\\b|^'+dayRe+'$','i').test(s)&&/^[A-Za-z\d\s,.]+$/.test(s)){
        var d=date(s); if(d!==s) return d;
      }
      if(/^[+\-−▲▼]?\s?\d+\.\d+(\s?[A-Za-z%°/]{0,6})?$/.test(s)) return num(s);
      return null;
    }
    function tr(s){
      if(CACHE.has(s)) return CACHE.get(s);
      CACHE.set(s,s);
      var r=core(s); if(r==null) r=s;
      CACHE.set(s,r); OUT.add(r); return r;
    }
    window.SD_T=tr;
    var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,NOSCRIPT:1};
    var done=new WeakMap();
    function text(n){
      var p=n.parentNode; if(!p||SKIP[p.nodeName]) return;
      if(p.closest&&p.closest('[translate=no],[contenteditable=true]')) return;
      var v=n.nodeValue; if(done.get(n)===v) return;
      var s=v.trim(); if(!s||!/[A-Za-z]/.test(s)&&!/\d\.\d/.test(s)){ done.set(n,v); return; }
      var out;
      if(CTX[s]){ for(var i=0;i<CTX[s].length;i++) if(p.closest(CTX[s][i][0])){ out=CTX[s][i][1]; break; } }
      if(out==null) out=tr(s);
      if(p.nodeName==='OPTION'&&!p.hasAttribute('value')) p.setAttribute('value',s);
      if(out!==s){ v=v.replace(s,out); n.nodeValue=v; }
      done.set(n,v);
    }
    var ATTR=['placeholder','aria-label','title','alt'];
    function attrs(el){
      for(var i=0;i<ATTR.length;i++){ var a=el.getAttribute(ATTR[i]); if(a&&/[A-Za-z]/.test(a)){ var t=tr(a.trim()); if(t!==a.trim()) el.setAttribute(ATTR[i],t); } }
    }
    function walk(root){
      if(root.nodeType===3) return text(root);
      if(root.nodeType!==1) return;
      attrs(root); if(SKIP[root.nodeName]) return;   /* a textarea keeps its text, its placeholder is translated */
      var w=document.createTreeWalker(root,5,null), n;
      while((n=w.nextNode())){ if(n.nodeType===3) text(n); else attrs(n); }
    }
    var mo=new MutationObserver(function(list){
      for(var i=0;i<list.length;i++){ var r=list[i];
        if(r.type==='childList') for(var j=0;j<r.addedNodes.length;j++) walk(r.addedNodes[j]);
        else if(r.type==='characterData') text(r.target);
        else if(r.type==='attributes'){ var a=r.target.getAttribute(r.attributeName); if(a&&!OUT.has(a)) attrs(r.target); }
      }
    });
    mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTR});
    if(document.body) walk(document.body);
    document.addEventListener('DOMContentLoaded',function(){ walk(document.body); });
  };
  document.write('<script src="i18n-'+lang+'.js?v=1001145238"><\/script>');
})();
