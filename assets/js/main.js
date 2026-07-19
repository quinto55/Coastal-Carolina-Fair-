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

/* ---------- Live fair-status chip ---------- */
const statusChip = $("#fair-status");
if (statusChip) {
  const now = new Date();
  const opens = new Date(FAIR_DATA.opens);
  const closes = new Date(FAIR_DATA.closes);
  const etDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(now);
  const etHour = parseInt(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", hour12: false }).format(now),
    10
  );
  const SATURDAYS = ["2026-10-31", "2026-11-07"];
  const SUNDAYS = ["2026-11-01", "2026-11-08"];
  let text = "";
  if (now < opens) {
    const days = Math.ceil((opens - now) / 86400000);
    text = days === 1 ? "Opening day is tomorrow!" : `${days} days to opening day`;
  } else if (now <= closes) {
    if (SATURDAYS.includes(etDate)) {
      text = etHour >= 10 && etHour < 22 ? "Open now · til 10 PM" : "Open today 10 AM – 10 PM";
    } else if (SUNDAYS.includes(etDate)) {
      text = etHour >= 12 && etHour < 21 ? "Open now · til 9 PM" : "Open today 12 – 9 PM";
    } else {
      text = etHour >= 15 ? "Gates are open now" : "Gates open today at 3 PM";
    }
  } else {
    text = "That’s a wrap — see you in 2027";
  }
  statusChip.textContent = text;
  statusChip.hidden = false;
}

/* ---------- Add-to-calendar (.ics, generated client-side) ---------- */
const icsEscape = (s) => s.replace(/([,;\\])/g, "\\$1");
const downloadICS = (filename, event) => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Coastal Carolina Fair//Site//EN",
    "BEGIN:VEVENT",
    `UID:${event.uid}@coastalcarolinafair`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")}`,
    event.start,
    event.end,
    `SUMMARY:${icsEscape(event.title)}`,
    `DESCRIPTION:${icsEscape(event.description)}`,
    `LOCATION:${icsEscape("Exchange Park, 9850 Highway 78, Ladson, SC 29456")}`,
    "URL:https://www.coastalcarolinafair.org/",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
};

$$(".ics-opening").forEach((el) =>
  el.addEventListener("click", (e) => {
    e.preventDefault();
    downloadICS("coastal-carolina-fair-opening-day.ics", {
      uid: "ccf-2026-opening",
      title: "Coastal Carolina Fair — Opening Day",
      description: "Gates open 3 PM. Rides, fair food, and free shows with admission.",
      start: "DTSTART:20261029T190000Z",
      end: "DTEND:20261030T030000Z",
    });
  })
);

/* per-day buttons on the calendar rail */
$$(".day-card[data-date]").forEach((card) => {
  const iso = card.dataset.date;
  const label = `${card.querySelector(".dow")?.textContent.trim() ?? ""} ${card.querySelector(".date")?.textContent.trim() ?? ""}`.trim();
  const btn = document.createElement("button");
  btn.className = "cal-btn";
  btn.textContent = "+ Calendar";
  btn.setAttribute("aria-label", `Add ${label} at the fair to your calendar`);
  btn.addEventListener("click", () => {
    const d = iso.replace(/-/g, "");
    const next = new Date(Date.parse(iso + "T12:00:00Z") + 86400000)
      .toISOString().slice(0, 10).replace(/-/g, "");
    downloadICS(`coastal-carolina-fair-${iso}.ics`, {
      uid: `ccf-2026-${iso}`,
      title: `Coastal Carolina Fair — ${label}`,
      description: "Fair day at Exchange Park. All shows free with admission.",
      start: `DTSTART;VALUE=DATE:${d}`,
      end: `DTEND;VALUE=DATE:${next}`,
    });
  });
  card.append(btn);
});

/* ---------- FAQ instant filter ---------- */
const faqSearch = $("#faq-filter");
if (faqSearch) {
  const sections = $$(".faq-group").map((group) => {
    const heading = group.previousElementSibling?.tagName === "H2" ? group.previousElementSibling : null;
    return { group, heading, items: [...group.querySelectorAll("details")] };
  });
  faqSearch.addEventListener("input", () => {
    const q = faqSearch.value.trim().toLowerCase();
    sections.forEach(({ group, heading, items }) => {
      let visible = 0;
      items.forEach((d) => {
        const match = !q || d.textContent.toLowerCase().includes(q);
        d.hidden = !match;
        if (match) visible++;
      });
      group.hidden = visible === 0;
      if (heading) heading.hidden = visible === 0;
    });
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
