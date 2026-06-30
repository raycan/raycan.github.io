/* Additive accessibility script — names the icon-only nav links that Framer
 * renders without accessible names, and marks the current route's dock icon as
 * active. Re-applies on React re-renders via a MutationObserver, and re-evaluates
 * on client-side (SPA) navigation since Framer routes the dock via the History API
 * without a full reload. Durable: regenerated into /_polish/ each build; never
 * edits Framer output. */
(function () {
  var MAP = {
    '/': 'Home',
    '/about': 'About',
    '/contact': 'Contact',
    '/thanks': 'Thanks',
    '/adobe': 'Adobe Lightroom case study',
    '/forme': 'FORME case study',
    '/luster': 'Luster case study',
    '/marathon': 'Marathon Health case study',
    '/archive/forme': 'FORME case study (archive)',
    '/archive/typography': 'Typography'
  };
  function norm(p) { return (p || '').replace(/\/+$/, '') || '/'; }
  // Dock active state: highlight the current route's nav icon with the hover fill.
  // The dock is 4 icon-buttons (.framer-1cbtni5) in fixed order [home, work, bio,
  // contact]; Framer routes them via JS (no hrefs), so we map route -> position.
  function activeIndex(p) {
    if (p === '/') return 0;        // home
    if (p === '/about') return 2;   // bio
    if (p === '/contact') return 3; // contact
    if (/^\/(adobe|forme|luster|marathon|archive(\/|$))/.test(p)) return 1; // work/grid -> case studies
    return -1;                      // thanks, 404, etc. -> no active icon
  }
  // Recomputes from the CURRENT path each call (so SPA navigation updates it), and
  // clears any stale marker before setting the new one.
  function markActive() {
    var idx = activeIndex(norm(location.pathname));
    var icons = document.querySelectorAll('.framer-1cbtni5');
    if (icons.length !== 4) return; // dock not ready / shape changed -> bail safely
    var arr = Array.prototype.slice.call(icons).sort(function (a, b) {
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return (ra.top - rb.top) || (ra.left - rb.left); // vertical (desktop) or horizontal (mobile)
    });
    for (var i = 0; i < arr.length; i++) arr[i].classList.toggle('rc-nav-active', i === idx);
  }
  function label() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      // only icon-only nav links: no visible text and no existing accessible name
      if ((a.textContent || '').trim() || a.getAttribute('aria-label')) continue;
      var p;
      try { p = norm(new URL(a.href, location.href).pathname); } catch (e) { continue; }
      if (MAP[p]) a.setAttribute('aria-label', MAP[p]);
    }
  }
  function pass() { label(); markActive(); }
  // Coalesce bursts of hydration/render mutations into one pass per frame.
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; pass(); });
  }
  // Observe for a bounded window (initial hydration, or after a route change while
  // Framer re-renders the dock), then disconnect to avoid steady-state work.
  var mo = null, moTimer = 0;
  function arm(ms) {
    if (mo) mo.disconnect();
    clearTimeout(moTimer);
    mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    moTimer = setTimeout(function () { if (mo) { mo.disconnect(); mo = null; } pass(); }, ms);
  }
  pass();
  arm(8000); // initial hydration window
  // Re-evaluate on client-side navigation. Framer routes via the History API, so a
  // dock click changes the URL without re-running this script — hook it explicitly,
  // then re-arm a short window to catch the dock's re-render.
  function onNav() { pass(); arm(1500); }
  addEventListener('popstate', onNav);
  ['pushState', 'replaceState'].forEach(function (m) {
    var orig = history[m];
    if (typeof orig !== 'function') return;
    history[m] = function () { var r = orig.apply(this, arguments); onNav(); return r; };
  });
})();
