/* Additive accessibility + dock script — names the icon-only nav links that Framer
 * renders without accessible names, marks the current route's dock icon as active, and
 * pins the dock to one consistent position across pages (Framer bakes a different
 * offset + position-type into each page's export, so it lands at a different height per
 * page). Re-applies on React re-renders via a MutationObserver, on window resize, and
 * on client-side (SPA) navigation since Framer routes the dock via the History API
 * without a full reload. Durable: regenerated into /_polish/ each build; never edits
 * Framer output. */
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
  // Dock position normalization. Framer bakes a different offset + position-type into
  // each page's export (e.g. home absolute ~68px from bottom, /about fixed 32px,
  // /contact absolute ~86px), so the dock sits at a different height per page. Pin its
  // positioned wrapper to one consistent spot: desktop/tablet (>=810px) fixed at the
  // left edge, vertically centered; phone (<=809px) fixed bottom-center. The wrapper has
  // no stable class across pages/breakpoints, so find it by walking up from the stable
  // icon class to the nearest positioned ancestor that holds all four icons.
  function pinDock() {
    var icons = document.querySelectorAll('.framer-1cbtni5');
    if (icons.length !== 4) return; // dock not ready / shape changed -> bail safely
    var wrap = icons[0].parentElement, found = false, guard = 0;
    while (wrap && guard++ < 12) {
      var cs = getComputedStyle(wrap);
      if (cs.position === 'fixed' || cs.position === 'absolute') {
        var holdsAll = true;
        for (var i = 0; i < icons.length; i++) { if (!wrap.contains(icons[i])) { holdsAll = false; break; } }
        if (holdsAll) { found = true; break; }
      }
      wrap = wrap.parentElement;
    }
    if (!found || !wrap) return;
    var phone = window.innerWidth <= 809;
    var s = wrap.style;
    s.setProperty('position', 'fixed', 'important');
    s.setProperty('margin', '0', 'important');
    s.setProperty('right', 'auto', 'important');
    if (phone) {
      s.setProperty('left', '50%', 'important');
      s.setProperty('top', 'auto', 'important');
      s.setProperty('bottom', '24px', 'important');
      s.setProperty('transform', 'translateX(-50%)', 'important');
    } else {
      s.setProperty('left', '16px', 'important');
      s.setProperty('top', '50%', 'important');
      s.setProperty('bottom', 'auto', 'important');
      s.setProperty('transform', 'translateY(-50%)', 'important');
    }
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
  function pass() { label(); markActive(); pinDock(); }
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
  // Re-pin the dock when the viewport crosses the phone/desktop breakpoint.
  addEventListener('resize', schedule);
  ['pushState', 'replaceState'].forEach(function (m) {
    var orig = history[m];
    if (typeof orig !== 'function') return;
    history[m] = function () { var r = orig.apply(this, arguments); onNav(); return r; };
  });
})();
