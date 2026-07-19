/* Coastal Carolina Fair — cookie consent + consent-gated analytics.
   Demo-safe by design: every vendor ID below ships EMPTY, so nothing loads,
   no cookies are set, and no banner appears. When the fair adopts the site,
   drop real IDs into CONFIG and the consent flow switches on by itself. */

(() => {
  const CONFIG = {
    /* analytics only ever run on the fair's real domain */
    prodHostnames: ["www.coastalcarolinafair.org", "coastalcarolinafair.org"],
    ga4Id: "",       /* e.g. "G-XXXXXXXXXX" */
    metaPixelId: "", /* e.g. "1234567890" */
  };

  const KEY = "ccf-cookie-consent";
  const hasVendors = Boolean(CONFIG.ga4Id || CONFIG.metaPixelId);
  const onProd = CONFIG.prodHostnames.includes(location.hostname);

  const getConsent = () => {
    try {
      const v = localStorage.getItem(KEY);
      return v === "accepted" || v === "declined" ? v : null;
    } catch {
      return null;
    }
  };

  const setConsent = (v) => {
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* private mode — session-only choice */
    }
    if (v === "accepted") loadVendors();
  };

  const inject = (src) => {
    const s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.append(s);
  };

  let loaded = false;
  function loadVendors() {
    if (loaded || !hasVendors || !onProd) return;
    loaded = true;
    if (CONFIG.ga4Id) {
      /* Condensed GA4 bootstrap (not the vendor-verbatim snippet) — verify
         against Google's current tag on a staging host before launch. */
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", CONFIG.ga4Id, { anonymize_ip: true });
      inject("https://www.googletagmanager.com/gtag/js?id=" + CONFIG.ga4Id);
    }
    if (CONFIG.metaPixelId) {
      /* Condensed Meta Pixel queue (not vendor-verbatim) — verify against
         Meta's current snippet before launch. */
      if (!window.fbq) {
        const q = function () {
          q.callMethod ? q.callMethod.apply(q, arguments) : q.queue.push(arguments);
        };
        q.queue = [];
        q.loaded = true;
        q.version = "2.0";
        window.fbq = q;
        window._fbq = q;
        inject("https://connect.facebook.net/en_US/fbevents.js");
      }
      window.fbq("init", CONFIG.metaPixelId);
      window.fbq("track", "PageView");
    }
  }

  function showBanner(force) {
    if (!force && (!hasVendors || getConsent() !== null)) return;
    if (document.querySelector(".cookie-banner")) return;
    const el = document.createElement("div");
    el.className = "cookie-banner";
    el.setAttribute("role", "region");
    el.setAttribute("aria-label", "Cookie consent");
    el.innerHTML =
      "<p>We’d like to use cookies to understand visits and measure our promotions — " +
      'only if you say yes. <a href="privacy.html">Privacy Policy</a></p>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="btn-ghost" data-consent="declined">Decline</button>' +
      '<button type="button" class="btn-ticket" data-consent="accepted">Accept</button>' +
      "</div>";
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-consent]");
      if (!b) return;
      setConsent(b.dataset.consent);
      el.remove();
    });
    document.body.append(el);
  }

  /* footer "Cookie preferences" link re-opens the choice */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-cookie-prefs]");
    if (!t) return;
    e.preventDefault();
    try {
      localStorage.removeItem(KEY);
    } catch {}
    showBanner(true);
  });

  window.CCFConsent = {
    show: () => showBanner(true),
    status: getConsent,
  };

  if (getConsent() === "accepted") loadVendors();
  showBanner(false);
})();
