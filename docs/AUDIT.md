# coastalcarolinafair.org — Site Audit

Audited 2026-07-18 (live site, Chrome + HTTP analysis). The current site runs on
Saffire's ASP.NET WebForms platform.

## Content failures

1. **Stale crisis banner in the hero.** One of the two rotating homepage slides is a
   "TAKE ACTION NOW! SAVE THE COASTAL CAROLINA FAIR — CLICK HERE" graphic whose CDN
   filename is dated December 2023 (`231213_..._Save_the_Fair(1).png`). It is shown
   to every 2026 visitor at full width.
2. **Conflicting dates.** Header ribbon: Oct 29 – Nov 8, **2026**. Hours & Directions
   page: October 30 – November 9, **2025**.
3. **Dead-end tickets page.** `/p/tickets--deals` says "We're not selling tickets for
   2026 yet!" — no pricing, no date, no notify option, no fallback content.
4. **Empty events listing.** `/events/entertainment` renders "No Results." Navigation
   still links to "2025 Featured Entertainers" and "2025 Competitions."
5. **FAQ misses the basics.** No hours, no parking, no re-entry answer — the three
   most-asked questions for any fair.
6. **Hero photo choice.** The other hero slide is a vendor stall photo of belts and
   hats — nothing that says rides, lights, food, or fun.

## Technical failures

7. **Legacy WebForms.** `__doPostBack` javascript: links for search/nav — uncrawlable,
   break without JS, no clean URLs (`.aspx` endpoints).
8. **74 `<script>` tags on the homepage.** Three separate Facebook pixels (each
   throwing uncaught `Promise.allSettled` TypeErrors in the console), Snapchat
   trackers, and a Google Analytics collect call returning HTTP 503.
9. **Unoptimized imagery.** Hero images served 1920px wide at `q=100` through
   `images.ashx` — no srcset, no AVIF/WebP negotiation, no lazy loading.
10. **Broken footer image.** The "CompliAssure SiteSeal" renders as raw alt text.
11. **Facebook feed iframe** occupying prime homepage real estate — slow,
    third-party, and redundant with the social links.

## SEO / accessibility failures

12. **Zero `<h1>` elements** on the homepage. No JSON-LD structured data at all — an
    event site with no `Event` schema forfeits Google rich results. Only one Open
    Graph tag (`og:type`).
13. **Sticky header overlaps content.** The oversized logo + white nav band covers
    body text while scrolling (the "Giving Back" stats are unreadable behind it).
14. **Legibility problems.** Skewed italic date ribbon on yellow; top bar crams
    sponsor logo, weather widget, cart, search, and translate into one strip.

## What the rebuild answers

| Flaw | Rebuild response |
| --- | --- |
| 74 scripts, 3 FB pixels, broken GA | One small deferred script, zero trackers |
| No h1 / schema / OG | Semantic headings, JSON-LD (Festival, FAQPage, BreadcrumbList), full OG/Twitter cards, sitemap.xml |
| WebForms postback links | Static HTML, clean relative URLs, works with JS disabled |
| 1920px q100 images | Inline SVG illustration system — zero photo payload |
| Stale 2023/2025 content | Single source of truth for dates/deals in one data file, clearly labeled seasons |
| Dead-end tickets page | Full pricing/deals page with honest "2026 on-sale" status |
| Empty events page | Data-driven schedule with client-side filtering |
| FAQ gaps | Hours, parking, and logistics answered on Plan Your Visit + FAQ |
| Sticky header overlap | Slim sticky header, content never obscured |
| No mobile care | Responsive down to 320px, container queries, fluid type |
