# Audit & polish record — raycan.github.io

This site is a **static mirror of a Framer-built portfolio**. Polish is applied as an
*additive override layer* (`/_polish/`, injected by the build pipeline) so it survives
re-capture and never edits Framer's generated output.

Audited against impeccable's five dimensions (Accessibility, Performance, Theming,
Responsive, Anti-patterns). Baseline was strong: AAA text contrast (19.8:1), zero JS
errors, no mobile horizontal overflow, consistent theming.

## Applied (additive — durable via `_tools/`)

- **A11y — accessible names for icon nav.** `/_polish/a11y.js` adds `aria-label`s to the
  icon-only dock links (Home / About / Contact …), re-applied via `MutationObserver` so
  they survive Framer's React re-renders. Verified: 0 unnamed nav links remain.
- **A11y — keyboard focus visibility.** `/_polish/overrides.css` adds a brand-magenta
  `:focus-visible` ring to links, buttons, and form fields. No change to mouse use.
- **SEO / social (crawler-facing).** Per-route `<title>`, `<meta name="description">`,
  and Open Graph + Twitter Card tags with per-route 1200×630 OG images
  (`/_polish/og/`). Improves search snippets and link unfurls.

## Recommendations (NOT additively fixable — need Framer-source edits or asset work)

These require editing Framer's generated output or re-processing assets, so they are
out of the additive-override scope. Best fixed in the Framer project, then re-captured.

1. **Live browser-tab titles.** Framer's runtime JS sets `document.title` per route
   (`document.title = e.title || ""`), overriding the static `<title>`. Most routes fall
   back to the site default ("Red Cable Studio") because the Framer project never set
   per-page titles. The static titles above help crawlers, but to fix the *in-browser*
   tab title, set page titles in Framer (Page settings → SEO) and re-capture.
2. **Heading semantics.** Home/About/Contact have no `<h1>` (top heading is `H4`);
   `/archive/forme` marks "Role / Product Streams / Services / Timeline" as four `<h1>`s.
   Restructure heading levels in Framer.
3. **Image alt text.** Case-study images use empty `alt` (decorative): marathon ~16,
   archive/forme ~16, forme ~11, luster ~10. Add descriptive alt text in Framer for
   meaningful images.
4. **Page weight.** Project pages are image-heavy: forme ~1.8 MB / 83 requests,
   marathon ~1.8 MB, luster ~1.7 MB, adobe ~1.3 MB. Compress/resize the source images
   (or serve responsive `srcset`) to cut transfer.
5. **Non-semantic nav control.** The dock's "work" (grid) icon is not an `<a>`/`<button>`
   on all routes, so it can't be keyboard-focused or named additively. Make it a real
   link/button in Framer.

## Known third-party externals (intentional, not Framer-hosting)

- **Vimeo** embeds on adobe / forme / archive-forme case studies (`player.vimeo.com`,
  `vimeo.com`, Cloudflare Turnstile). These 401 off the original domain because the
  videos are domain-restricted in Vimeo. Fix: add `raycan.github.io` to each video's
  allowed-embed domains (Vimeo → video → Settings → Privacy → "Where can this be
  embedded").
- **Contact form** still POSTs to Framer's form backend (`framer.com/forms/...`). Wire to
  your own handler if you fully drop Framer.
