# Coastal Carolina Fair — Site Rebuild

A complete, modern recreation of [coastalcarolinafair.org](https://www.coastalcarolinafair.org/),
built as a technology demonstration for the fair. Same organization, same facts —
rebuilt as a fast, accessible, zero-dependency static site.

**This is an unofficial redesign concept.** All copy is original writing; factual
details (dates, address, policies, deals, pricing, lineup history) were sourced from
the official site on 2026-07-18. Ticket/vendor application links point back to the
official site.

**Photography & branding:** images and the official Coastal Carolina Fair logo are
hotlinked directly from the fair's own CDN (`cdn.saffire.com`) — no copies are
stored in this repository. All trademarks, logos, and photographs remain the
property of the Coastal Carolina Fair / Exchange Club of Charleston and their
respective providers, and are displayed here only as part of this redesign concept
prepared for the fair's review. The Circle K mark identifies the fair's actual
official ticket outlet and remains the property of Circle K Stores Inc. If the
design is adopted, the fair supplies and hosts its own assets and confirms
partner-mark usage.

## What's inside

| | |
| --- | --- |
| `index.html` … `contact.html` | Eight static pages, no build step |
| `assets/css/styles.css` | Full design system ("Midway at Dusk") in one file |
| `assets/js/main.js` | One deferred script: countdown, filters, nav, today-highlighting |
| `sw.js` + `manifest.webmanifest` | Installable PWA with offline support |
| `sitemap.xml`, `robots.txt`, JSON-LD | SEO: Festival/FAQPage/Breadcrumb schema, OG cards |
| `docs/AUDIT.md` | The 14-point audit of the current live site |
| `docs/DESIGN.md` | Design tokens, IA, and technical commitments |

## Highlights vs. the current site

- **1 script, 0 trackers** (current site: 74 script tags, 3 Facebook pixels, Snapchat + GA)
- **Zero photo payload** — original inline-SVG illustration system, animated ferris wheel hero
- **Structured data** for Google rich results (current site has none, and no `<h1>`)
- **Works offline**, installs as an app, respects reduced-motion, WCAG AA contrast
- **View Transitions + Speculation Rules** for app-like instant navigation

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Push to `main`, then GitHub → Settings → Pages → deploy from branch (`main`, root).
Canonical URLs assume `https://quinto55.github.io/Coastal-Carolina-Fair-/`; update
them (and `sitemap.xml`/`robots.txt`) if a custom domain is added.

## Font license

"Alfa Slab One" (JM Solé) is self-hosted under the SIL Open Font License 1.1.
