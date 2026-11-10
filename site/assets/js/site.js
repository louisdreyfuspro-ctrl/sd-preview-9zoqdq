/* StrydeUp website behaviour. No dependencies. */
(function () {
  'use strict';
  var C = window.SU_CONFIG || { LINKS: {}, PRICES: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* year + external links from config */
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
  $$('[data-link]').forEach(function (a) {
    var u = C.LINKS[a.getAttribute('data-link')];
    if (u && u !== '#') { a.href = u; if (/^https?:/.test(u)) { a.target = '_blank'; a.rel = 'noopener'; } }
  });

  /* mobile menu */
  var burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('.mnav a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') document.body.classList.remove('menu-open'); });
  }

  /* reveal on scroll + start the charts */
  function play(el) {
    el.classList.add('in');
    $$('.ring', el).forEach(function (r) { r.style.strokeDashoffset = r.getAttribute('data-off'); });
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { play(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(function (e) { io.observe(e); });
  } else { $$('.reveal').forEach(play); }

  /* small helper for dot sliders */
  function dots(root, slideSel, dotSel, ms) {
    var slides = $$(slideSel, root), ds = $$(dotSel, root), i = 0, t;
    if (slides.length < 2) return;
    function go(n) {
      slides[i].classList.remove('on'); ds[i] && ds[i].setAttribute('aria-selected', 'false');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('on'); ds[i] && ds[i].setAttribute('aria-selected', 'true');
    }
    function auto() { clearInterval(t); if (!reduce) t = setInterval(function () { go(i + 1); }, ms); }
    ds.forEach(function (d, n) { d.addEventListener('click', function () { go(n); auto(); }); });
    root.addEventListener('mouseenter', function () { clearInterval(t); });
    root.addEventListener('mouseleave', auto);
    auto();
  }
  $$('[data-slider]').forEach(function (r) { dots(r, '.tslide', '.tdots button', 9000); });
  $$('[data-fade]').forEach(function (r) { dots(r, '.slide', '.dots button', 6000); });

  /* story rails: arrows + progress */
  $$('[data-rail]').forEach(function (rail) {
    var ctl = rail.nextElementSibling, prev = $('[data-prev]', ctl), next = $('[data-next]', ctl), bar = $('.rail-prog i', ctl);
    function step() { var c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + 12 : 300; }
    function upd() {
      var max = rail.scrollWidth - rail.clientWidth, p = max > 0 ? rail.scrollLeft / max : 0;
      prev.disabled = rail.scrollLeft < 4; next.disabled = rail.scrollLeft > max - 4;
      bar.style.left = (p * (bar.parentNode.clientWidth - bar.clientWidth)) + 'px';
    }
    prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: 'smooth' }); });
    rail.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  });

  /* pricing: billing period + currency from the visitor's region */
  var plans = $$('.plan[data-plan]');
  if (plans.length) {
    var EURO = /^(Europe\/(Paris|Madrid|Berlin|Rome|Amsterdam|Brussels|Vienna|Lisbon|Dublin|Helsinki|Athens|Luxembourg|Monaco|Bratislava|Ljubljana|Tallinn|Riga|Vilnius|Valletta|Zagreb)|Atlantic\/(Madeira|Canary|Azores)|Asia\/Nicosia)$/;
    function regionCurrency() {
      var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
      var lang = (navigator.language || '').toUpperCase();
      if (tz === 'Europe/London' || /-GB$/.test(lang)) return 'GBP';
      if (tz === 'Europe/Zurich' || /-CH$/.test(lang)) return 'CHF';
      if (EURO.test(tz)) return 'EUR';
      return 'USD';
    }
    var q = (location.search.match(/[?&]currency=([A-Z]{3})/i) || [])[1];
    var cur = (q || regionCurrency()).toUpperCase();
    if (!C.PRICES[cur]) cur = 'USD';
    var period = 'monthly';
    var sel = $('[data-cur]');
    var avail = Object.keys(C.PRICES).filter(function (k) { return C.PRICES[k]; });
    if (sel) {
      $$('option', sel).forEach(function (o) { if (avail.indexOf(o.value) < 0) o.remove(); });
      if (avail.length < 2) sel.parentNode.style.display = 'none';
      sel.value = cur;
      sel.addEventListener('change', function () { cur = sel.value; render(); });
    }
    function fmt(p, v) { return (p.symbol.length > 1 ? p.symbol + ' ' : p.symbol) + v; }
    function render() {
      var P = C.PRICES[cur];
      plans.forEach(function (card) {
        var k = card.getAttribute('data-plan'), v = P[k], note = '';
        if (period === 'six') {
          if (P.six && P.six[k]) { v = P.six[k]; note = 'Billed every 6 months'; }
          else note = '6-month pricing coming soon';
        }
        if (k === 'stable' && C.STABLE_NOTE) note = note ? C.STABLE_NOTE + ' · ' + note : C.STABLE_NOTE;
        $('[data-price]', card).textContent = fmt(P, v);
        $('[data-note]', card).textContent = note;
      });
      var n = $('[data-cur-name]'); if (n) n.textContent = P.name;
    }
    var tog = $('.ptoggle');
    $$('button', tog).forEach(function (b) {
      b.addEventListener('click', function () {
        period = b.getAttribute('data-period');
        $$('button', tog).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        tog.classList.toggle('six', period === 'six');
        render();
      });
    });
    render();
  }

  /* FAQ: highlight the category in view */
  var side = $$('.fq-side a');
  if (side.length && 'IntersectionObserver' in window) {
    var map = {};
    side.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          side.forEach(function (a) { a.classList.remove('on'); });
          var a = map[e.target.id]; if (a) { a.classList.add('on'); if (a.scrollIntoView && innerWidth < 980) a.parentNode.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' }); }
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('.fq-sec').forEach(function (s) { spy.observe(s); });
  }
})();
