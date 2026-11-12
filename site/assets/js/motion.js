/* StrydeUp motion layer: smooth scroll, intro, page transitions, cursor, split text,
   scroll scenes. Runs only when html.mo is set (motion allowed) and GSAP is present. */
(function () {
  'use strict';
  var d = document, H = d.documentElement, B = d.body;
  if (!H.classList.contains('mo') || !window.gsap || !window.ScrollTrigger) { H.classList.remove('mo', 'enter'); return; }
  window.SU_MOTION = 1;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var fine = matchMedia('(pointer:fine)').matches;
  var desk = matchMedia('(min-width:981px)').matches;
  var page = B.getAttribute('data-page') || '';
  var EASE = 'expo.out';

  /* ------------------------------------------------ smooth scroll */
  var lenis = null;   // native scrolling on purpose: no scroll hijacking, no latency
  function scrollToEl(t) { scrollTo({ top: t.getBoundingClientRect().top + pageYOffset - 110, behavior: 'smooth' }); }
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var t = d.getElementById(id.slice(1));
    if (t) { e.preventDefault(); scrollToEl(t); }
  });

  /* ------------------------------------------------ chrome: grain, progress, cursor, curtain */
  function el(tag, cls, html) { var x = d.createElement(tag); x.className = cls; if (html) x.innerHTML = html; B.appendChild(x); return x; }
  el('div', 'grain');
  var prog = el('div', 'sprog');
  var curtain = el('div', 'curtain');
  gsap.set(curtain, { yPercent: 0 });
  gsap.to(prog, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  if (fine) {
    H.classList.add('cur');
    var ring = el('div', 'cursor', '<span></span>'), dot = el('div', 'cursor-dot'), lab = ring.firstChild;
    var rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    var dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
    gsap.set([ring, dot], { x: innerWidth / 2, y: innerHeight / 2, opacity: 0 });
    var shown = false;
    addEventListener('mousemove', function (e) {
      if (!shown) { shown = true; gsap.to([ring, dot], { opacity: 1, duration: 0.3 }); }
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
    });
    d.addEventListener('mouseleave', function () { shown = false; gsap.to([ring, dot], { opacity: 0, duration: 0.3 }); });
    d.addEventListener('mouseover', function (e) {
      var t = e.target, c = t.closest && t.closest('[data-cursor]');
      ring.classList.remove('link', 'label');
      if (c) { lab.textContent = c.getAttribute('data-cursor'); ring.classList.add('label'); return; }
      if (t.closest && t.closest('a,button,summary,label,select,input')) ring.classList.add('link');
    });
    d.addEventListener('mousedown', function () { gsap.to(ring, { scale: 0.8, duration: 0.15 }); });
    d.addEventListener('mouseup', function () { gsap.to(ring, { scale: 1, duration: 0.4, ease: 'elastic.out(1,.5)' }); });
  }

  /* page transitions: cover on leave, uncover on arrival */
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'expo.inOut', onComplete: function () { location.href = href; } });
  });
  addEventListener('pageshow', function (e) { if (e.persisted) gsap.set(curtain, { yPercent: -100 }); });

  /* ------------------------------------------------ split text */
  function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var parts = n.textContent.split(/(\s+)/), frag = d.createDocumentFragment();
        parts.forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(' ')); return; }
          var w = d.createElement('span'); w.className = 'w';
          var i = d.createElement('span'); i.className = 'wi'; i.textContent = p;
          w.appendChild(i); frag.appendChild(w);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') split(n);
    });
  }
  var HEADS = '.hero-txt h1,.h-xl,.h-lg,.fhero-txt h1,.shero h1,.fq-head h1,.dl-in h2,.scat h2,.vision-txt h2,.stride-txt h2';
  $$(HEADS).forEach(function (h) { split(h); h.classList.add('split-done'); });
  function words(h) { return $$('.wi', h); }

  // generic heading reveal (everything except the ones a scene drives itself)
  $$(HEADS).forEach(function (h) {
    if (h.closest('.hero-txt,.vision-txt,.fhero-txt,.shero,.stride-txt')) return;
    gsap.from(words(h), { yPercent: 115, rotate: 4, duration: 1.15, ease: EASE, stagger: 0.045,
      scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });

  /* GSAP takes over the simple CSS reveals (a CSS transition on transform would fight the tilt/tweens) */
  var OWN = '.plan,.cat';
  $$('.reveal').forEach(function (e) {
    e.classList.remove('reveal');
    if (e.matches(OWN)) return;
    gsap.from(e, { y: 46, opacity: 0, duration: 1.2, ease: EASE, scrollTrigger: { trigger: e, start: 'top 90%', once: true } });
  });

  /* ------------------------------------------------ header hides on the way down */
  var hdr = $('.hdr');
  if (hdr) ST.create({ start: 0, end: 'max', onUpdate: function (s) {
    var y = s.scroll();
    hdr.classList.toggle('small', y > 40);
    hdr.classList.toggle('away', s.direction === 1 && y > 260 && !B.classList.contains('menu-open'));
  } });

  /* ------------------------------------------------ magnetic buttons */
  if (fine) $$('.btn,.glass-btn,.out-btn,.plan .cta').forEach(function (b) {
    b.classList.add('mag');
    var mx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), my = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.28); my((e.clientY - r.top - r.height / 2) * 0.38);
    });
    b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,.4)' }); });
  });

  /* spotlight borders that follow the pointer */
  if (fine) $$('.spot').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* 3D tilt + glare */
  if (fine) $$('.tilt').forEach(function (c) {
    var g = $('.glare', c);
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      gsap.to(c, { rotateY: (px - 0.5) * 12, rotateX: (0.5 - py) * 10, transformPerspective: 900, duration: 0.6, ease: 'power3' });
      if (g) { g.style.setProperty('--gx', px * 100 + '%'); g.style.setProperty('--gy', py * 100 + '%'); }
    });
    c.addEventListener('mouseleave', function () { gsap.to(c, { rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1,.5)' }); });
  });

  /* number count-up */
  function count(node, to, opts) {
    opts = opts || {};
    var dec = (String(to).split('.')[1] || '').length, o = { v: opts.from != null ? opts.from : 0 };
    return gsap.to(o, { v: +to, duration: opts.duration || 1.8, ease: opts.ease || 'power3.out', delay: opts.delay || 0,
      onUpdate: function () { node.textContent = (opts.prefix || '') + o.v.toFixed(dec); } });
  }

  /* ------------------------------------------------ arrival: intro (first visit of home) or quick fade */
  var first = false;
  try { first = page === 'index' && !sessionStorage.getItem('su_intro'); sessionStorage.setItem('su_intro', '1'); } catch (e) {}
  var heroTl = gsap.timeline({ paused: true });

  function arrive() {
    H.classList.remove('enter');
    heroTl.play();
  }
  if (first) {
    gsap.set(curtain, { yPercent: -100 });
    var logo = $('.hdr .logo svg');
    var icT = d.getElementById('su-icon'), icon = icT ? icT.innerHTML : '';
    var ld = el('div', 'loader', '<div class="loader-in"><div class="loader-icon">' + icon + '</div><div class="loader-tag"><span>Keypoints <b class="ld-k">00</b>/11</span><span>Confidence <b class="ld-c">0.00</b></span></div><div class="loader-logo">' + (logo ? logo.outerHTML : '') + '</div><div class="loader-bar"><i></i></div><div class="loader-meta"><span>Equine performance</span><span class="ld-n">000</span></div></div>');
    var n = $('.ld-n', ld), o = { v: 0 };
    H.style.overflow = 'hidden';
    var mk = $('.mark', ld), kc = $('.ld-k', ld), cc = $('.ld-c', ld), q = { k: 0, c: 0 };
    var tl = gsap.timeline({ onComplete: function () { ld.remove(); H.style.overflow = ''; } });
    window.SU_SPLASH = tl;
    if (mk) {
      var cns = $$('.mk-cn', mk), sc = $('.mk-scan', mk), cr = $('.mk-cr', mk);
      tl
        // 1. tracking corners lock onto the emblem
        .fromTo(cns, { opacity: 0, scale: 1.35, svgOrigin: '672 1224' }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out', stagger: 0.04 }, 0)
        // 2. keypoints detected, skeleton joins them
        .to($$('.mk-kp', mk), { opacity: 1, duration: 0.18, stagger: { each: 0.045, from: 'start' } }, 0.15)
        .fromTo($$('.mk-kp', mk), { attr: { r: 90 } }, { attr: { r: 34 }, duration: 0.5, ease: 'expo.out', stagger: 0.045 }, 0.15)
        .to($$('.mk-bn', mk), { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out', stagger: 0.04 }, 0.3)
        .to(q, { k: 11, duration: 0.5, ease: 'none', onUpdate: function () { kc.textContent = ('0' + Math.round(q.k)).slice(-2); } }, 0.15)
        // 3. the outline of each part is traced
        .to($$('.mk-ln', mk), { strokeDashoffset: 0, duration: 0.95, ease: 'power2.inOut', stagger: 0.12 }, 0.45)
        // 4. a scan sweeps top to bottom and fills the logo behind it
        .set(sc, { opacity: 1 }, 1.05)
        .fromTo(sc, { attr: { transform: 'translate(0,-260)' } }, { attr: { transform: 'translate(0,2690)' }, duration: 0.85, ease: 'power2.inOut' }, 1.05)
        .fromTo(cr, { attr: { y: -3220 } }, { attr: { y: -270 }, duration: 0.85, ease: 'power2.inOut' }, 1.05)
        .to(q, { c: 0.97, duration: 0.85, ease: 'power2.out', onUpdate: function () { cc.textContent = q.c.toFixed(2); } }, 1.05)
        .to(sc, { opacity: 0, duration: 0.2 }, 1.8)
        // 5. the data layer steps back, the clean emblem remains
        .to($$('.mk-sk, .mk-ln', mk), { opacity: 0, duration: 0.45, ease: 'power2.out' }, 1.75)
        .to(cns, { opacity: 0.25, duration: 0.45 }, 1.85)
        .fromTo(mk, { scale: 1 }, { scale: 1.06, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1, transformOrigin: '50% 50%' }, 1.8);
    }
    tl
      .fromTo($('.loader-tag', ld), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.1)
      .to($('.loader-logo svg', ld), { y: 0, duration: 1.1, ease: EASE }, 1.55)
      .to($('.loader-bar i', ld), { scaleX: 1, duration: 2.1, ease: 'power2.inOut' }, 0.2)
      .to(o, { v: 100, duration: 2.1, ease: 'power2.inOut', onUpdate: function () { n.textContent = ('00' + Math.round(o.v)).slice(-3); } }, 0.2)
      .to($('.loader-in', ld), { yPercent: -40, opacity: 0, duration: 0.7, ease: 'power3.in' }, 2.75)
      .add(arrive, 3.15)
      .to(ld, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, 3.1);
  } else {
    gsap.fromTo(curtain, { yPercent: 0 }, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.05, onStart: arrive });
  }

  /* ------------------------------------------------ HOME */
  if (page === 'index') {
    var hcard = $('.hero-card'), himg = $('.hero-card>img'), h1 = $('.hero-txt h1'), phone = $('.hero-phone .phone');
    heroTl
      .from(himg, { scale: 1.28, duration: 2.4, ease: EASE }, 0)
      .from(hcard, { clipPath: 'inset(8% 6% 8% 6% round 22px)', duration: 1.6, ease: 'expo.inOut' }, 0)
      .from(words(h1), { yPercent: 115, filter: 'blur(14px)', opacity: 0, duration: 1.4, ease: EASE, stagger: 0.08 }, 0.35)
      .from($$('.hero-txt p, .hero-btns .glass-btn'), { y: 30, opacity: 0, duration: 1, ease: EASE, stagger: 0.07 }, 0.75)
      .from(phone, { y: 220, rotateX: 28, rotateZ: -8, opacity: 0, duration: 1.8, ease: EASE }, 0.55)
      .from('.phone-glow', { opacity: 0, scale: 0.6, duration: 2, ease: EASE }, 0.9);
    // the word "visible" sharpens last
    gsap.to(himg, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hcard, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-txt', { yPercent: -22, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: hcard, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-phone', { yPercent: -16, ease: 'none', scrollTrigger: { trigger: hcard, start: 'top top', end: 'bottom top', scrub: true } });
    if (fine && phone) {
      var tx = gsap.quickTo(phone, 'rotateY', { duration: 0.9, ease: 'power3' }), ty = gsap.quickTo(phone, 'rotateX', { duration: 0.9, ease: 'power3' });
      $('.hero').addEventListener('mousemove', function (e) { tx((e.clientX / innerWidth - 0.5) * 22); ty((0.5 - e.clientY / innerHeight) * 14); });
    }
    var scan = $('.scan');
    if (scan) gsap.timeline({ repeat: -1, repeatDelay: 3.5, delay: 3 })
      .fromTo(scan, { left: '0%', opacity: 0 }, { left: '100%', duration: 2.6, ease: 'power2.inOut' })
      .to(scan, { opacity: 1, duration: 0.4 }, 0).to(scan, { opacity: 0, duration: 0.5 }, 2.1);

    /* marquee driven by scroll speed */
    var track = $('.marquee-track');
    if (track) {
      var x = 0, half = 0, cards = $$('.mcard', track);
      var measure = function () { half = track.scrollWidth / 2; };
      measure(); addEventListener('resize', measure); addEventListener('load', measure);
      var hover = false; track.addEventListener('mouseenter', function () { hover = true; }); track.addEventListener('mouseleave', function () { hover = false; });
      var spd = 0.5;
      gsap.ticker.add(function (t, dt) {
        spd += ((hover ? 0.08 : 0.5) - spd) * 0.05;
        x -= spd * (dt / 16.7);
        if (x <= -half) x += half;
        track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      });
      ST.create({ trigger: '.marquee', start: 'top 85%', once: true, onEnter: function () {
        gsap.from($$('.mov > *', track), { opacity: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 1, ease: 'back.out(2)', stagger: 0.02, delay: 0.5 });
      } });
      gsap.from(cards, { yPercent: 30, opacity: 0, duration: 1.4, ease: EASE, stagger: 0.06, scrollTrigger: { trigger: '.marquee', start: 'top 90%', once: true } });
      if (fine) cards.forEach(function (c) {
        c.addEventListener('mousemove', function (e) {
          var r = c.getBoundingClientRect();
          gsap.to(c, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 14, rotateX: (0.5 - (e.clientY - r.top) / r.height) * 10, transformPerspective: 800, duration: 0.5 });
        });
        c.addEventListener('mouseleave', function () { gsap.to(c, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'elastic.out(1,.5)' }); });
      });
    }

    /* stats count (the zero counts down) */
    $$('[data-count]').forEach(function (s) {
      var to = +s.getAttribute('data-count');
      ST.create({ trigger: s, start: 'top 85%', once: true, onEnter: function () { count(s, to, { from: to === 0 ? 12 : 0, duration: 2.2 }); } });
    });

    /* computer-vision scene */
    var vis = $('.vision');
    if (vis) {
      var vsvg = $('.vision-svg', vis);
      var lines = $$('.v-box path, .bone, .arc, .meas', vsvg);
      lines.forEach(function (p) { var L = p.getTotalLength ? p.getTotalLength() : 300; p.style.strokeDasharray = p.classList.contains('arc') ? '6 7' : L; p.__L = L; });
      var tags = $$('.v-tags tspan[data-to]', vsvg), frame = $('[data-frame]', vis);
      var vo = { p: 0 };
      var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
        trigger: vis, start: 'top top', end: desk ? '+=230%' : '+=170%', scrub: 0.8, pin: '.vision-pin', anticipatePin: 1,
        onToggle: function (st) { var hd = $('.hdr'); if (hd) hd.classList.toggle('pinned', st.isActive); },
        onUpdate: function (s) { if (frame) frame.textContent = ('000' + Math.round(s.progress * 2184)).slice(-4); } } });
      tl.fromTo(['.vision-img', '.vision-svg'], { scale: 1.22 }, { scale: 1, duration: 3, transformOrigin: '50% 50%' }, 0)
        .to('.vision-shade', { opacity: 1, duration: 0.6 }, 0.2)
        .fromTo('.vision-scan', { x: 0 }, { x: innerWidth * 1.35, duration: 1, ease: 'power1.inOut' }, 0.3)
        .from('.vision-hud', { opacity: 0, y: -12, duration: 0.3 }, 0.4)
        .fromTo($$('.v-box path', vsvg), { strokeDashoffset: function (i, p) { return p.__L; } }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.05 }, 0.55)
        .from('.detl', { opacity: 0, y: -6, duration: 0.2 }, 0.9)
        .from($$('.joint', vsvg), { scale: 0, transformOrigin: '50% 50%', duration: 0.15, stagger: 0.035, ease: 'back.out(3)' }, 1.0)
        .fromTo($$('.bone', vsvg), { strokeDashoffset: function (i, p) { return p.__L; } }, { strokeDashoffset: 0, duration: 0.3, stagger: 0.04 }, 1.25)
        .from('.arc', { opacity: 0, duration: 0.3 }, 1.7)
        .fromTo('.meas', { strokeDashoffset: function (i, p) { return p.__L; } }, { strokeDashoffset: 0, duration: 0.3 }, 1.8)
        .from($$('.v-tags .tag', vsvg), { opacity: 0, y: 12, duration: 0.25, stagger: 0.12 }, 1.9)
        .to(vo, { p: 1, duration: 0.7, onUpdate: function () {
          tags.forEach(function (t) { var to = +t.getAttribute('data-to'), dec = (t.getAttribute('data-to').split('.')[1] || '').length; t.textContent = (to * vo.p).toFixed(dec); });
        } }, 1.9)
        .from('.vision-txt .eyebrow', { opacity: 0, y: 14, duration: 0.25 }, 2.1)
        .from(words($('.vision-txt h2')), { yPercent: 115, duration: 0.4, stagger: 0.04, ease: 'power3.out' }, 2.15)
        .from('.vision-txt p', { opacity: 0, y: 20, duration: 0.3 }, 2.45)
        .to({}, { duration: 0.6 });
    }

    /* stacked steps */
    var steps = $$('.step');
    steps.forEach(function (s, i) {
      var card = $('.step-card', s), img = $('.step-card>img', s);
      gsap.set(img, { scale: 1.18 });
      gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from(card, { clipPath: 'inset(18% 10% 18% 10% round 16px)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: s, start: 'top 82%', once: true } });
      gsap.from($$('.step-glass > *', s), { y: 30, opacity: 0, duration: 1, ease: EASE, stagger: 0.1, delay: 0.4, scrollTrigger: { trigger: s, start: 'top 82%', once: true } });
      gsap.from($('.step-n', s), { yPercent: 60, opacity: 0, duration: 1.2, ease: EASE, scrollTrigger: { trigger: s, start: 'top 82%', once: true } });
      if (desk && steps[i + 1]) gsap.to(card, { scale: 0.92, opacity: 0.4, ease: 'none',
        scrollTrigger: { trigger: steps[i + 1], start: 'top bottom', end: 'top 160px', scrub: true } });
      if (desk && steps[i + 1]) (function (nEl) { ST.create({ trigger: steps[i + 1], start: 'top 65%', onEnter: function () { nEl.classList.add('gone'); }, onLeaveBack: function () { nEl.classList.remove('gone'); } }); })($('.step-n', s));
    });

    /* who: the row in the middle of the screen lights up */
    var wl = $('.who-list');
    if (wl) { wl.classList.add('live'); $$('.who-row', wl).forEach(function (r) {
      ST.create({ trigger: r, start: 'top 62%', end: 'bottom 38%', toggleClass: 'on' });
    }); }

    /* rulers draw from the left */
    $$('.ruler').forEach(function (r) {
      gsap.fromTo(r, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.8, ease: 'expo.inOut', scrollTrigger: { trigger: r, start: 'top 90%', once: true } });
    });

    /* stat visuals */
    var tk = $$('.sv-ticks i');
    if (tk.length) ST.create({ trigger: '.stats', start: 'top 80%', once: true, onEnter: function () {
      gsap.fromTo(tk, { opacity: 0.12, scaleY: 0.2, transformOrigin: '50% 100%' }, { opacity: 0.9, scaleY: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.06 });
      gsap.fromTo('.sv-none i', { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 1.6, ease: 'expo.inOut', delay: 0.3 });
      gsap.fromTo('.sv-time u', { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 2.4, ease: 'power2.inOut', delay: 0.2 });
    } });

    /* helper: draw a set of SVG strokes */
    function draw(nodes, tl, at, dur, stag) {
      nodes.forEach(function (n) { var L = n.getTotalLength ? n.getTotalLength() : 200; n.style.strokeDasharray = L; n.style.strokeDashoffset = L; n.__L = L; });
      tl.to(nodes, { strokeDashoffset: 0, duration: dur, stagger: stag || 0, ease: 'power2.inOut' }, at);
    }
    function tagsCount(scope, tl, at) {
      var ts = $$('tspan[data-to]', scope), o = { p: 0 };
      tl.from($$('.tag', scope), { opacity: 0, y: 12, duration: 0.5, stagger: 0.12, ease: 'power3.out' }, at)
        .to(o, { p: 1, duration: 1.4, ease: 'power3.out', onUpdate: function () {
          ts.forEach(function (t) { var v = t.getAttribute('data-to'), d = (v.split('.')[1] || '').length; t.textContent = (+v * o.p).toFixed(d); });
        } }, at);
    }

    /* stride scene */
    var sc = $('.stride-card');
    if (sc) {
      var ssv = $('.stride-svg', sc);
      var stl = gsap.timeline({ paused: true });
      stl.from('.stride-img', { scale: 1.15, duration: 2.2, ease: EASE }, 0);
      draw($$('.ground', ssv), stl, 0.3, 1.1);
      stl.from($$('.s-joints circle', ssv), { scale: 0, transformOrigin: '50% 50%', duration: 0.35, stagger: 0.05, ease: 'back.out(3)' }, 0.8);
      draw($$('.s-legs path', ssv), stl, 1.0, 0.8, 0.08);
      draw($$('.lvl', ssv), stl, 1.5, 0.8);
      stl.from($$('.ghost path', ssv)[0], { opacity: 0, y: -10, duration: 0.5 }, 1.6);
      draw($$('.brk', ssv), stl, 1.8, 0.9);
      stl.from('.brk-t', { opacity: 0, y: 6, duration: 0.4 }, 2.4);
      tagsCount(ssv, stl, 2.0);
      stl.from('.stride-txt .eyebrow', { opacity: 0, y: 12, duration: 0.6, ease: EASE }, 0.2)
        .from(words($('.stride-txt h2')), { yPercent: 115, duration: 1, stagger: 0.05, ease: EASE }, 0.3)
        .from('.stride-txt p', { opacity: 0, y: 16, duration: 0.8, ease: EASE }, 0.7);
      // live layer: everything keeps breathing at the rhythm of the trot (one stride = 1.3 s)
      var STRIDE_T = 1.3, alive = false;
      gsap.set($$('.rip circle', ssv), { transformOrigin: '50% 50%' });
      var pulse = function (sel) { gsap.fromTo($$(sel, ssv), { attr: { r: 5 }, opacity: 0.95 }, { attr: { r: 26 }, opacity: 0, duration: 1, ease: 'power2.out' }); };
      var live = gsap.timeline({ paused: true, repeat: -1 })
        .add(function () { pulse('.ra'); }, 0)
        .fromTo($('.mdot', ssv), { attr: { cx: 150 } }, { attr: { cx: 397 }, duration: STRIDE_T * 0.9, ease: 'power1.inOut' }, 0)
        .fromTo($$('.ghost path', ssv)[0], { opacity: 1 }, { opacity: 0.25, duration: STRIDE_T * 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0)
        .add(function () { pulse('.rb'); }, STRIDE_T / 2)
        .to({}, { duration: STRIDE_T }, 0);
      var scanTl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2.4 })
        .fromTo($('.sscan', ssv), { attr: { x: -80 } }, { attr: { x: 900 }, duration: 2.6, ease: 'power2.inOut' });
      // tracking jitter on the joints, like a live detector
      var jit = $$('.s-joints circle', ssv).map(function (c) { return { c: c, x: +c.getAttribute('cx'), y: +c.getAttribute('cy') }; });
      var jitter = function () {
        if (!alive) return;
        jit.forEach(function (j) { gsap.to(j.c, { attr: { cx: j.x + gsap.utils.random(-1.6, 1.6), cy: j.y + gsap.utils.random(-1.6, 1.6) }, duration: 0.18, ease: 'none' }); });
      };
      setInterval(jitter, 200);
      // live readouts
      var ang = $('.ang', ssv), sTags = $$('tspan[data-to]', ssv);
      setInterval(function () {
        if (!alive) return;
        ang.textContent = (1.2 + (Math.random() - 0.5) * 0.4).toFixed(1) + '°';
        sTags.forEach(function (t) { var v = t.getAttribute('data-to'), d = (v.split('.')[1] || '').length; t.textContent = (+v + (Math.random() - 0.5) * (d ? 0.04 : 2)).toFixed(d); });
      }, 1100);
      stl.eventCallback('onComplete', function () { alive = true; live.play(); scanTl.play(); });
      ST.create({ trigger: sc, start: 'top bottom', end: 'bottom top', onToggle: function (st) {
        if (!stl.progress() || stl.progress() < 1) return;
        alive = st.isActive; if (alive) { live.play(); scanTl.play(); } else { live.pause(); scanTl.pause(); }
      } });
      ST.create({ trigger: sc, start: 'top 65%', once: true, onEnter: function () { stl.play(); } });
      gsap.to('.stride-img', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: sc, start: 'top bottom', end: 'bottom top', scrub: true } });
      // footfall diagram: bars grow, then a playhead loops
      var gs = $('.gait-svg');
      ST.create({ trigger: gs, start: 'top 85%', once: true, onEnter: function () {
        gsap.from($$('.st', gs), { scaleX: 0, transformOrigin: '0 50%', duration: 0.6, ease: 'power3.out', stagger: 0.05 });
        var phl = $('.ph', gs), bars = $$('.st', gs).map(function (b) { return { b: b, x: +b.getAttribute('x'), w: +b.getAttribute('width') }; });
        gsap.fromTo(phl, { attr: { x1: 60, x2: 60 } }, { attr: { x1: 580, x2: 580 }, duration: 2.6, ease: 'none', repeat: -1, delay: 0.8,
          onUpdate: function () { var px = +phl.getAttribute('x1'); bars.forEach(function (o) { o.b.style.opacity = px >= o.x && px <= o.x + o.w ? 1 : 0.38; }); } });
      } });
    }

    /* overlays inside the three steps */
    $$('.step').forEach(function (st) {
      var ov = $('.ov', st); if (!ov) return;
      var tl = gsap.timeline({ paused: true });
      if (ov.classList.contains('vf')) {
        tl.from($$('.c1,.c2,.c3,.c4', ov), { scale: 1.8, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.06 }, 0)
          .from($$('.g1,.g2', ov), { scaleY: 0, duration: 1, ease: 'expo.inOut' }, 0.2)
          .from($$('.g3,.g4', ov), { scaleX: 0, duration: 1, ease: 'expo.inOut' }, 0.3)
          .from($$('.rec,.fmt', ov), { opacity: 0, y: -8, duration: 0.6 }, 0.6)
          .fromTo($('.focus', ov), { scale: 2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(2)' }, 0.8)
          .to($('.focus', ov), { scale: 0.9, duration: 0.25, yoyo: true, repeat: 1 }, 1.5);
        var clk = $('[data-clock]', ov), t0 = 0;
        tl.add(function () { t0 = Date.now(); setInterval(function () { var s2 = Math.floor((Date.now() - t0) / 1000), f = Math.floor((Date.now() - t0) % 1000 / 1000 * 60); clk.textContent = '00:' + ('0' + Math.floor(s2 / 60)).slice(-2) + ':' + ('0' + s2 % 60).slice(-2) + ':' + ('0' + f).slice(-2); }, 50); }, 0.6);
      } else if (ov.classList.contains('chips')) {
        tl.from($$('.chip', ov), { x: 40, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.12 }, 0)
          .from($$('.chip u', ov), { scaleX: 0, transformOrigin: '0 50%', duration: 1.2, ease: 'power3.out', stagger: 0.12 }, 0.3);
        $$('.chip b', ov).forEach(function (bb, i) { tl.add(function () { count(bb, +bb.getAttribute('data-to'), { duration: 1.4 }); }, 0.3 + i * 0.12); });
      } else {
        var pl = $('.pg-line', ov);
        draw([pl], tl, 0.1, 1.6);
        tl.from($('.pg-area', ov), { opacity: 0, duration: 1 }, 0.8)
          .from($$('circle', ov), { scale: 0, transformOrigin: '50% 50%', duration: 0.3, stagger: 0.12, ease: 'back.out(3)' }, 0.2)
          .from($('.pg-tag', ov), { opacity: 0, y: 10, scale: 0.8, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)' }, 1.6);
      }
      ST.create({ trigger: st, start: 'top 70%', once: true, onEnter: function () { tl.play(); } });
    });

    /* testimonials: progress bar + entrance of each new slide */
    var tsl = $('[data-slider]');
    if (tsl) {
      var bar = $('.tbar i', tsl), barTw;
      var animSlide = function (s) {
        if (barTw) barTw.kill();
        barTw = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 9, ease: 'none' });
        gsap.from($$('.tq > *, .tq blockquote p', s), { y: 24, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.07 });
        gsap.from($('.tvid img', s), { scale: 1.15, duration: 1.6, ease: EASE });
      };
      new MutationObserver(function (m) { m.forEach(function (x) { if (x.target.classList.contains('on') && x.oldValue && x.oldValue.indexOf(' on') < 0) animSlide(x.target); }); })
        .observe(tsl, { attributes: true, subtree: true, attributeFilter: ['class'], attributeOldValue: true });
      ST.create({ trigger: tsl, start: 'top 80%', once: true, onEnter: function () { animSlide($('.tslide.on', tsl)); } });
    }
  }

  /* ------------------------------------------------ FEATURES */
  if (page === 'features') {
    heroTl.from('.fhero', { clipPath: 'inset(10% 8% 10% 8% round 22px)', duration: 1.5, ease: 'expo.inOut' }, 0)
      .from(words($('.fhero-txt h1')), { yPercent: 115, duration: 1.2, ease: EASE, stagger: 0.05 }, 0.3)
      .from('.fhero-txt p', { y: 24, opacity: 0, duration: 1, ease: EASE, stagger: 0.1 }, 0.7);
    $$('.fhero .slide img').forEach(function (im) { gsap.fromTo(im, { scale: 1.12 }, { scale: 1, duration: 7, ease: 'none', repeat: -1, yoyo: true }); });
    gsap.to('.fhero .slide', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.fhero', start: 'top top', end: 'bottom top', scrub: true } });
    if (desk) gsap.to('.fcol:nth-child(2)', { y: -120, ease: 'none', scrollTrigger: { trigger: '.fgrid', start: 'top bottom', end: 'bottom top', scrub: true } });
    $$('.fcard').forEach(function (c) {
      ST.create({ trigger: c, start: 'top 80%', once: true, onEnter: function () {
        $$('svg text', c).forEach(function (t) {
          var v = t.textContent.trim();
          if (/^\d+$/.test(v) && +t.getAttribute('font-size') >= 30) count(t, +v, { duration: 2 });
        });
        if ($('.cal-pill', c)) gsap.from($$('.cal-pill', c), { scale: 0.4, opacity: 0, duration: 0.9, ease: 'back.out(2)', stagger: 0.07, transformOrigin: '100% 50%' });
      } });
    });

    /* live charts: each card keeps moving while it is on screen */
    var NS = 'http://www.w3.org/2000/svg';
    function mk(tag, attrs, parent) { var e = d.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
    function whileVisible(card, start, stop) {
      ST.create({ trigger: card, start: 'top bottom', end: 'bottom top', onToggle: function (st) { if (st.isActive) start(); else stop(); } });
    }
    $$('.fcard[data-k]').forEach(function (card) {
      var k = card.getAttribute('data-k'), sv = $('.fviz svg', card), iv = null, tw = [];
      var every = function (ms, fn) { return { start: function () { if (!iv) iv = setInterval(fn, ms); }, stop: function () { clearInterval(iv); iv = null; } }; };
      var run;
      if (k === 'score' && sv) {
        var num = $$('text', sv).filter(function (t) { return +t.getAttribute('font-size') >= 30; })[0];
        var dots = $$('g[fill] circle', sv);
        dots.forEach(function (c) { tw.push(gsap.to(c, { attr: { cx: '+=' + gsap.utils.random(-14, 14), cy: '+=' + gsap.utils.random(-14, 14) }, duration: gsap.utils.random(2, 4), repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })); });
        run = every(1400, function () { num.textContent = Math.round(92 + (Math.random() - 0.5) * 3); });
      } else if (k === 'bio' && sv) {
        var fills = $$('.fill', sv), vals = $$('text[text-anchor="end"]', sv), base = vals.map(function (t) { return +t.textContent; });
        run = every(1300, function () {
          fills.forEach(function (f, i) { var v = Math.max(60, Math.min(99, base[i] + Math.round((Math.random() - 0.5) * 6))); gsap.to(f, { attr: { width: 325 * v / 100 }, duration: 0.9, ease: 'power3.out' }); vals[i].textContent = v; });
        });
      } else if (k === 'jump' && sv) {
        var pf = $$('.fill', sv), head = mk('line', { x1: 88, x2: 88, y1: 0, y2: 150, stroke: '#F2D3BE', 'stroke-width': 1.5 }, sv);
        tw.push(gsap.fromTo(head, { attr: { x1: 88, x2: 88 } }, { attr: { x1: 365, x2: 365 }, duration: 2.6, ease: 'none', repeat: -1, paused: true,
          onUpdate: function () { var x = +head.getAttribute('x1'); pf.forEach(function (r) { var rx = +r.getAttribute('x'), rw = +r.getAttribute('width'); r.style.opacity = x >= rx && x <= rx + rw ? 1 : 0.45; }); } }));
      } else if ((k === 'trend' || k === 'welfare') && sv) {
        var paths = $$('path.draw', sv), total = 0, segs = paths.map(function (p) { var L = p.getTotalLength(); total += L; return { p: p, L: L }; });
        var glow = mk('circle', { r: 9, class: 'runner-glow' }, sv), dot = mk('circle', { r: 4, class: 'runner' }, sv), o = { t: 0 };
        tw.push(gsap.to(o, { t: 1, duration: k === 'trend' ? 3.2 : 4, ease: 'none', repeat: -1, paused: true, onUpdate: function () {
          var dist = o.t * total, i = 0; while (i < segs.length - 1 && dist > segs[i].L) { dist -= segs[i].L; i++; }
          var pt = segs[i].p.getPointAtLength(Math.min(dist, segs[i].L)); dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); glow.setAttribute('cx', pt.x); glow.setAttribute('cy', pt.y);
        } }));
        if (k === 'trend') { var last = $$('circle[stroke]', sv).pop(); if (last) tw.push(gsap.fromTo(last, { attr: { r: 5 } }, { attr: { r: 8 }, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true })); }
      } else if (k === 'precision' && sv) {
        var rings = $$('.ring', sv), nums = $$('text', sv).filter(function (t) { return +t.getAttribute('font-size') >= 30; }), B = [84, 92];
        run = every(1600, function () {
          rings.forEach(function (r, i) { var v = B[i] + Math.round((Math.random() - 0.5) * 4), L = +r.getAttribute('stroke-dasharray'); r.style.strokeDashoffset = L * (1 - v / 100); nums[i].textContent = v; });
        });
      } else if (k === 'cal') {
        var days = $$('.cal-pill span', card), di = 0;
        run = every(700, function () { days.forEach(function (s) { s.classList.remove('today'); }); days[di % days.length].classList.add('today'); di++; });
      }
      whileVisible(card, function () { if (run) run.start(); tw.forEach(function (t) { t.play(); }); }, function () { if (run) run.stop(); tw.forEach(function (t) { t.pause(); }); });
    });
    $$('.fcard circle[fill="#EED27A"]').forEach(function (cc) {
      if (cc.getAttribute('opacity')) gsap.to(cc, { attr: { r: 16 }, opacity: 0, duration: 1.6, repeat: -1, ease: 'power2.out' });
    });
  }

  /* ------------------------------------------------ PRICING */
  if (page === 'pricing') {
    heroTl.from('.pbox', { opacity: 0, y: 30, duration: 1.2, ease: EASE }, 0)
      .from('.ptoggle', { opacity: 0, y: 20, duration: 1, ease: EASE }, 0.4);
    $$('[data-price]').forEach(function (p) {
      var last = 0, tw;
      var roll = function () {
        if (p.textContent === p.__w) return;            // our own write
        var m = p.textContent.match(/^(\D*)([\d.]+)/); if (!m) return;
        var to = +m[2], o = { v: last }; last = to;
        if (tw) tw.kill();
        tw = gsap.to(o, { v: to, duration: 1.4, ease: 'power3.out', delay: 0.6, onUpdate: function () { p.__w = m[1] + Math.round(o.v); p.textContent = p.__w; } });
      };
      new MutationObserver(roll).observe(p, { childList: true, characterData: true, subtree: true });
      roll();
    });
    gsap.from('.cap u.on', { scaleY: 0, transformOrigin: '50% 100%', duration: 0.4, ease: 'back.out(2)', stagger: 0.02, delay: 1.3 });
    gsap.from('.plan', { y: 90, rotateX: 12, opacity: 0, transformPerspective: 1000, duration: 1.4, ease: EASE, stagger: 0.12, delay: 0.5 });
  }

  /* ------------------------------------------------ STORIES */
  if (page === 'stories') {
    heroTl.from('.shero', { clipPath: 'inset(12% 10% 12% 10% round 22px)', duration: 1.5, ease: 'expo.inOut' }, 0)
      .from('.shero>img', { scale: 1.3, duration: 2.2, ease: EASE }, 0)
      .from(words($('.shero h1')), { yPercent: 115, duration: 1.2, ease: EASE, stagger: 0.06 }, 0.4)
      .from('.shero .sub', { opacity: 0, y: -20, duration: 1, ease: EASE }, 0.9)
      .from('.cat', { y: 40, opacity: 0, duration: 1, ease: EASE, stagger: 0.08 }, 0.8);
    var shs = $('.shero-svg');
    if (shs) {
      var bn = $$('.bone', shs);
      bn.forEach(function (n) { var L = n.getTotalLength(); n.style.strokeDasharray = L; n.style.strokeDashoffset = L; });
      var tg = $$('tspan[data-to]', shs);
      heroTl.from($$('.joint', shs), { scale: 0, transformOrigin: '50% 50%', duration: 0.35, stagger: 0.07, ease: 'back.out(3)' }, 1.1)
        .to(bn, { strokeDashoffset: 0, duration: 1, stagger: 0.15, ease: 'power2.inOut' }, 1.3)
        .from($$('.arc', shs), { opacity: 0, duration: 0.6 }, 1.9)
        .from($$('.tag', shs), { opacity: 0, y: 10, duration: 0.6, stagger: 0.15, ease: EASE }, 2.0)
        .add(function () { tg.forEach(function (t) { count(t, +t.getAttribute('data-to'), { duration: 1.4 }); }); }, 2.0);
    }
    var wv = $('.wave');
    if (wv) {
      var wp = $('path', wv), wc = $('circle', wv), ph = 0, on = false;
      ST.create({ trigger: wv, start: 'top bottom', end: 'bottom top', onToggle: function (st) { on = st.isActive; } });
      gsap.ticker.add(function () {
        if (!on) return; ph += 0.06; var d = '', y = 20;
        for (var xx = 0; xx <= 210; xx += 6) {
          y = 20 + Math.sin(xx * 0.06 + ph) * 7 + Math.sin(xx * 0.17 + ph * 1.7) * 4 + (xx > 120 && xx < 150 ? Math.sin(ph * 3) * 6 : 0);
          d += (xx ? ' L' : 'M') + xx + ' ' + y.toFixed(1);
        }
        wp.setAttribute('d', d); wc.setAttribute('cx', 210); wc.setAttribute('cy', y.toFixed(1));
      });
    }
    gsap.to('.shero>img', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.shero', start: 'top top', end: 'bottom top', scrub: true } });
    $$('.srail').forEach(function (rail) {
      gsap.from($$('.story', rail), { y: 60, opacity: 0, duration: 1.3, ease: EASE, stagger: 0.07, scrollTrigger: { trigger: rail, start: 'top 85%', once: true } });
      if (!fine) return;
      var down = false, moved = false, sx = 0, sl = 0, v = 0, lx = 0, raf;
      rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = lx = e.clientX; sl = rail.scrollLeft; v = 0; cancelAnimationFrame(raf); });
      addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; rail.classList.add('drag'); }
        rail.scrollLeft = sl - dx; v = e.clientX - lx; lx = e.clientX;
      });
      addEventListener('pointerup', function () {
        if (!down) return; down = false; rail.classList.remove('drag');
        (function glide() { if (Math.abs(v) < 0.5) return; rail.scrollLeft -= v; v *= 0.93; raf = requestAnimationFrame(glide); })();
      });
      rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    });
  }

  /* ------------------------------------------------ FAQ */
  if (page === 'faqs') {
    heroTl.from('.fq-search', { opacity: 0, y: 20, duration: 1, ease: EASE }, 0.6)
      .from('.fq-side a', { x: -20, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.05 }, 0.5);
    var trk = $('.fq-track i');
    if (trk) gsap.to(trk, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.fq', start: 'top 30%', end: 'bottom bottom', scrub: true } });
    $$('.fq-rule').forEach(function (r) { gsap.fromTo(r, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.8, ease: 'expo.inOut', delay: 0.5 }); });
    // smooth accordion
    $$('.qa').forEach(function (q) {
      var s = $('summary', q), a = $('.a', q);
      s.addEventListener('click', function (e) {
        e.preventDefault();
        if (q.open) {
          gsap.to(a, { height: 0, opacity: 0, duration: 0.45, ease: 'power3.inOut', onComplete: function () { q.open = false; gsap.set(a, { clearProps: 'height,opacity' }); ST.refresh(); } });
        } else {
          q.open = true;
          gsap.fromTo(a, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.6, ease: 'power3.out', onComplete: function () { gsap.set(a, { clearProps: 'height' }); ST.refresh(); } });
        }
      });
    });
    // live search with highlight
    var inp = $('[data-fq-search]'), empty = $('[data-fq-empty]');
    if (inp) {
      $$('.qa summary').forEach(function (s) { s.__h = s.innerHTML; });
      var esc = function (x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
      inp.addEventListener('input', function () {
        var q = inp.value.trim().toLowerCase(), any = false;
        $$('.fq-sec').forEach(function (sec) {
          var hit = 0;
          $$('.qa', sec).forEach(function (it) {
            var s = $('summary', it), ok = !q || it.textContent.toLowerCase().indexOf(q) > -1;
            it.style.display = ok ? '' : 'none';
            s.innerHTML = q.length > 1 && ok ? s.__h.replace(new RegExp('(' + esc(q) + ')(?![^<]*>)', 'ig'), '<mark>$1</mark>') : s.__h;
            if (ok) hit++;
          });
          sec.style.display = hit ? '' : 'none'; if (hit) any = true;
        });
        empty.classList.toggle('on', !any);
        ST.refresh();
      });
    }
  }

  /* ------------------------------------------------ analysis HUDs (every page) */
  $$('.hud').forEach(function (h) {
    var host = h.parentNode, live = false, fr = 0;
    var fEl = $('[data-hframe]', h), ret = $('.hud-ret', h), reads = $$('[data-j]', h);
    gsap.set($$('.hc', h), { opacity: 0, scale: 1.7 });
    gsap.set($$('.hud-lab,.hud-rec,.hud-read > div', h), { opacity: 0, y: 8 });
    if (ret) gsap.set(ret, { opacity: 0, scale: 2 });
    ST.create({ trigger: host, start: 'top 85%', end: 'bottom top', onToggle: function (st) { live = st.isActive; },
      onEnter: function () {
        if (h.__in) return; h.__in = 1;
        gsap.to($$('.hc', h), { opacity: 1, scale: 1, duration: 0.9, ease: EASE, stagger: 0.07, delay: 0.3 });
        gsap.to($$('.hud-lab,.hud-rec', h), { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.1, delay: 0.6 });
        gsap.to($$('.hud-read > div', h), { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.1, delay: 0.8 });
        reads.forEach(function (r, i) { count(r, +r.getAttribute('data-j'), { duration: 1.6, delay: 0.8 + i * 0.1 }); });
        if (ret) {
          gsap.to(ret, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(2)', delay: 0.9 });
          var hop = function () {
            var w = host.clientWidth, hh = host.clientHeight;
            gsap.to(ret, { x: gsap.utils.random(-w * 0.16, w * 0.16), y: gsap.utils.random(-hh * 0.14, hh * 0.14), duration: gsap.utils.random(1.2, 2.2), ease: 'power3.inOut', onComplete: function () { gsap.delayedCall(gsap.utils.random(0.3, 1.2), hop); } });
          };
          gsap.delayedCall(1.8, hop);
        }
      } });
    if (fEl) gsap.ticker.add(function () { if (live) { fr = (fr + 1) % 10000; if (fr % 2 === 0) fEl.textContent = ('000' + fr).slice(-4); } });
    if (reads.length) setInterval(function () {
      if (!live || !h.__in) return;
      reads.forEach(function (r) {
        var base = +r.getAttribute('data-j'), d = (r.getAttribute('data-j').split('.')[1] || '').length;
        var v = base + (Math.random() - 0.5) * (d ? 0.06 : 2);
        r.textContent = v.toFixed(d);
      });
    }, 900);
  });

  /* ------------------------------------------------ every page: download block + footer */
  var dl = $('.dl');
  if (dl) {
    gsap.fromTo('.dl img', { yPercent: -12, scale: 1.15 }, { yPercent: 12, scale: 1.02, ease: 'none', scrollTrigger: { trigger: dl, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.dl-row .glass-btn', { y: 40, opacity: 0, duration: 1.1, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: dl, start: 'top 75%', once: true } });
  }
  var fl = $('.ftr-logo svg');
  if (fl) gsap.fromTo(fl, { yPercent: 100, scale: 0.92 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.ftr', start: 'top bottom', end: 'top 45%', scrub: 1 } });

  addEventListener('load', function () { ST.refresh(); });
})();
