# Rebuild Design Spec — "Midway at Dusk"

A complete static recreation of coastalcarolinafair.org: same organization, same
facts, modern execution. All copy is written fresh; all visuals are original inline
SVG (no photography copied from the existing site).

## Design tokens

**Color**
| Token | Hex | Use |
| --- | --- | --- |
| `--dusk` | `#111A3A` | Hero sky, dark surfaces |
| `--night` | `#0A0F24` | Deep shadow, footer |
| `--red` | `#D5382C` | Primary action, accents |
| `--gold` | `#FFC53D` | Bulbs, highlights, focus ring |
| `--cream` | `#FAF4E6` | Page canvas |
| `--ink` | `#1E2340` | Body text on cream |

Dark scheme swaps cream canvas for dusk surfaces; both meet WCAG AA.

**Type**
- Display: **Alfa Slab One** (OFL, self-hosted woff2) — circus-slab, used only for
  page titles, section titles, and the date lockup.
- Body: system-ui stack (perf: zero font payload for body text).
- Data/utility: `ui-monospace` stack for gate hours, schedules, countdown — the
  "printed gate schedule" register.

**Signature elements**
1. Animated inline-SVG **ferris wheel** hero: rotating rim, counter-rotated gondolas,
   twinkling bulb lights; disabled under `prefers-reduced-motion`.
2. **11-day calendar rail** — the fair's run (Oct 29 – Nov 8, 2026) rendered as a
   scrollable day strip carrying hours + the day's deal. Structure encodes the
   content: the fair IS eleven days.
3. **Ticket-stub buttons** with perforated edges for primary CTAs.

## Information architecture (8 pages)

| Page | Replaces (old site) | Content |
| --- | --- | --- |
| `index.html` | Home | Hero + countdown, dates, highlights, deals preview, giving-back stats |
| `tickets.html` | Tickets & Deals | 2026 on-sale status, 2025 deal days (labeled), Circle K outlets, purchase policy |
| `events.html` | Events/Entertainment | Filterable schedule: shows, competitions, demonstrations, Senior Day |
| `plan.html` | Hours & Directions / Map | Hours grid, directions (I-26 both ways), parking, bag policy, map deep links |
| `faq.html` | FAQ | Full accordion (native `<details>`), incl. previously-missing basics |
| `get-involved.html` | Get Involved | Vendors, volunteers, Parkway Stage performers, competitions, grants |
| `exchange-park.html` | Exchange Park / About | Venue, 1922→present history timeline, facility rentals, sponsors |
| `contact.html` | Contact | Phone, address, socials, org info |

## Technical commitments

- Zero runtime dependencies; one CSS file, one deferred JS file.
- All internal URLs relative → works at any base path (GitHub Pages project site).
- JSON-LD: `Festival` (+`offers`, location) on home/tickets, `FAQPage` on FAQ,
  `BreadcrumbList` on interior pages; full OG/Twitter meta; `sitemap.xml`, `robots.txt`.
- View Transitions API (`@view-transition`) for cross-page fades + Speculation Rules
  prerender for instant navigation.
- PWA: `manifest.webmanifest`, service worker (cache-first assets, network-first
  pages, offline fallback), installable.
- A11y floor: skip link, landmarks, `aria-current` nav, `:focus-visible` ring,
  AA contrast, reduced-motion respected, keyboard-complete.
- No trackers of any kind.
- Print stylesheet for plan/schedule pages.
- Data single-source: fair dates live in the `FAIR_DATA` object at the top of
  `main.js`; the HTML carries the same content statically so nothing breaks
  without JavaScript.

## Content facts (sourced from live site, 2026-07-18)

- Dates: Oct 29 – Nov 8, 2026 · Exchange Park, 9850 Highway 78, Ladson, SC 29456 · 843.572.3161
- Run by the Exchange Club of Charleston since 1957; site at Ladson since 1979
  (180+ acres, parking for 10,000+ cars). Fairs in Charleston trace to 1922.
- Giving back: $504,000+ granted to 90+ local nonprofits/students after the latest
  fair; 15,000+ volunteer hours (2023); $11M+ returned to the Lowcountry since 2003.
- 2025 deals (labeled as prior season): Circle K bring-a-friend Thursdays; Military &
  First Responders free Fridays (+1 guest, ID); 2-fer Tuesday wristbands; Senior Day
  Wed $5 (55+, free caregiver admission, programming 10am–2pm).
- Hours pattern (2025; 2026 TBC): weekdays gates 3pm; Sat 10am–10pm; Sun 12–9pm.
- Policies: clear bag policy (medical exceptions); no weapons/alcohol/backpacks/
  glass/coolers; no full-face masks, capes, or toy weapons; service animals only;
  smoking restricted; no refunds/rainchecks; all shows free with gate admission;
  tickets only via official site or participating Circle K stores.
