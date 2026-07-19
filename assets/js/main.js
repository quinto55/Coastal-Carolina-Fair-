/* Coastal Carolina Fair — single deferred script, no dependencies.
   FAIR_DATA is the one source of truth for dates; the HTML carries the same
   content statically so everything still works with JavaScript disabled. */

const FAIR_DATA = {
  // 2026 run. Times use America/New_York offsets (EDT until Nov 1, then EST).
  opens: "2026-10-29T15:00:00-04:00",
  closes: "2026-11-08T21:00:00-05:00",
  firstDay: "2026-10-29",
  lastDay: "2026-11-08",
};

const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];

document.documentElement.classList.remove("no-js");

/* ---------- Mobile nav ---------- */
const navToggle = $(".nav-toggle");
const navList = $("#nav-list");
if (navToggle && navList) {
  navToggle.addEventListener("click", () => {
    const open = navList.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

/* ---------- Countdown ---------- */
const countdown = $("#countdown");
if (countdown) {
  const opens = new Date(FAIR_DATA.opens);
  const closes = new Date(FAIR_DATA.closes);
  const cells = {
    d: $("[data-days]", countdown),
    h: $("[data-hours]", countdown),
    m: $("[data-mins]", countdown),
    s: $("[data-secs]", countdown),
  };

  const tick = () => {
    const now = new Date();
    if (now >= closes) {
      countdown.outerHTML =
        '<p class="date-lockup">That’s a wrap — see you in 2027!</p>';
      return;
    }
    if (now >= opens) {
      countdown.outerHTML =
        '<p class="date-lockup">The gates are open — come on out!</p>';
      return;
    }
    let diff = Math.floor((opens - now) / 1000);
    const d = Math.floor(diff / 86400);
    diff -= d * 86400;
    const h = Math.floor(diff / 3600);
    diff -= h * 3600;
    const m = Math.floor(diff / 60);
    const s = diff - m * 60;
    cells.d.textContent = d;
    cells.h.textContent = String(h).padStart(2, "0");
    cells.m.textContent = String(m).padStart(2, "0");
    cells.s.textContent = String(s).padStart(2, "0");
    setTimeout(tick, 1000);
  };
  tick();
}

/* ---------- Highlight "today" on calendar rail + hours table ---------- */
const todayISO = () => {
  const now = new Date();
  // Fair-local date (US Eastern), regardless of the visitor's timezone.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(now);
};

const today = todayISO();
$$("[data-date]").forEach((el) => {
  if (el.dataset.date === today) {
    el.classList.add("is-today");
    const marker = document.createElement("span");
    marker.className = "deal";
    marker.textContent = "Today";
    const slot = el.querySelector(".dow") || el.firstElementChild;
    if (slot && !el.querySelector(".deal-today")) {
      marker.classList.add("deal-today");
      slot.appendChild(marker);
    }
  }
});

/* ---------- Event / schedule filters ---------- */
const chipRow = $(".chip-row");
if (chipRow) {
  const chips = $$(".chip", chipRow);
  const items = $$("[data-cat]");
  chipRow.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    const cat = chip.dataset.filter;
    items.forEach((item) => {
      item.hidden = cat !== "all" && item.dataset.cat !== cat;
    });
  });
}

/* ---------- Reveal on scroll (staggered within each grid) ---------- */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const grid = el.parentElement;
        const siblings = grid ? [...grid.children].filter((c) => c.classList.contains("reveal")) : [el];
        const delay = Math.max(0, siblings.indexOf(el)) * 70;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add("in");
        setTimeout(() => (el.style.transitionDelay = ""), delay + 700);
        io.unobserve(el);
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => io.observe(el));
} else {
  $$(".reveal").forEach((el) => el.classList.add("in"));
}

/* ---------- Compacting header ---------- */
const head = $(".site-head");
if (head) {
  let compact = false;
  addEventListener(
    "scroll",
    () => {
      const want = scrollY > 90;
      if (want !== compact) {
        compact = want;
        head.classList.toggle("shrunk", want);
      }
    },
    { passive: true }
  );
}

/* ---------- Carnival booth bulbs: multicolor bulb-to-bulb chase ---------- */
$$(".booth").forEach((booth) => {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let bulbs = [];

  const build = () => {
    booth.querySelectorAll(".bulb").forEach((b) => b.remove());
    bulbs = [];
    const w = booth.clientWidth;
    const h = booth.clientHeight;
    const inset = 13;
    const gap = 36;
    const nx = Math.max(2, Math.round((w - inset * 2) / gap));
    const ny = Math.max(2, Math.round((h - inset * 2) / gap));
    const pts = [];
    /* clockwise loop: top → right → bottom → left */
    for (let i = 0; i < nx; i++) pts.push([inset + (i * (w - 2 * inset)) / nx, inset]);
    for (let i = 0; i < ny; i++) pts.push([w - inset, inset + (i * (h - 2 * inset)) / ny]);
    for (let i = 0; i < nx; i++) pts.push([w - inset - (i * (w - 2 * inset)) / nx, h - inset]);
    for (let i = 0; i < ny; i++) pts.push([inset, h - inset - (i * (h - 2 * inset)) / ny]);
    pts.forEach(([x, y]) => {
      const b = document.createElement("span");
      b.className = "bulb";
      b.setAttribute("aria-hidden", "true");
      b.style.left = x + "px";
      b.style.top = y + "px";
      booth.append(b);
      bulbs.push(b);
    });
    if (reducedMotion) bulbs.forEach((b) => b.classList.add("lit"));
  };
  build();

  let resizeTimer;
  addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    },
    { passive: true }
  );

  if (reducedMotion) return; /* all bulbs glow steady gold instead */

  /* three runners spaced around the loop, hues 120° apart, drifting
     through the spectrum as they travel bulb to bulb */
  let idx = 0;
  let hue = 0;
  const RUNNERS = 3;
  const TAIL = 2;
  setInterval(() => {
    const n = bulbs.length;
    if (!n) return;
    bulbs.forEach((b) => b.classList.remove("lit"));
    for (let r = 0; r < RUNNERS; r++) {
      const head = (idx + Math.round((r * n) / RUNNERS)) % n;
      const color = (hue + r * 120) % 360;
      for (let t = 0; t <= TAIL; t++) {
        const b = bulbs[(head - t + n) % n];
        b.style.setProperty("--lit", `hsl(${color} 95% ${64 - t * 9}%)`);
        b.classList.add("lit");
      }
    }
    idx = (idx + 1) % n;
    hue = (hue + 10) % 360;
  }, 115);
});

/* ---------- Gallery lightbox (native dialog) ---------- */
const galleryFrames = $$(".gallery .img-frame");
if (galleryFrames.length) {
  const dialog = document.createElement("dialog");
  dialog.id = "lightbox";
  dialog.innerHTML =
    '<figure style="margin:0;position:relative">' +
    '<button class="close" aria-label="Close image">×</button>' +
    "<img alt><figcaption></figcaption></figure>";
  document.body.append(dialog);
  const dImg = dialog.querySelector("img");
  const dCap = dialog.querySelector("figcaption");

  const open = (frame) => {
    const img = frame.querySelector("img");
    const cap = frame.querySelector("figcaption");
    dImg.src = img.src.replace(/w=\d+/, "w=1400");
    dImg.alt = img.alt;
    dCap.textContent = cap ? cap.textContent : "";
    dialog.showModal();
  };

  galleryFrames.forEach((frame) => {
    frame.setAttribute("tabindex", "0");
    frame.setAttribute("role", "button");
    const cap = frame.querySelector("figcaption");
    frame.setAttribute("aria-label", "Enlarge photo" + (cap ? ": " + cap.textContent : ""));
    frame.addEventListener("click", () => open(frame));
    frame.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(frame);
      }
    });
  });

  dialog.querySelector(".close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
}

/* ---------- Service worker ---------- */
if ("serviceWorker" in navigator && location.protocol === "https:") {
  addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* offline support is progressive enhancement */
    });
  });
}
