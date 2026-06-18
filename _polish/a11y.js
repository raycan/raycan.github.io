/* Additive accessibility script — names the icon-only nav links that Framer
 * renders without accessible names. Re-applies on React re-renders via a
 * MutationObserver. Durable: regenerated into /_polish/ each build; never edits
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
  // Coalesce bursts of hydration mutations into one labeling pass per frame.
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; label(); });
  }
  label();
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  // Framer hydration settles quickly; stop observing after it to avoid steady-state work.
  setTimeout(function () { mo.disconnect(); label(); }, 8000);
})();
