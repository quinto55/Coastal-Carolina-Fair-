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

/* ---------- Ticket-card anatomy: serial + perforation divider ----------
   Serials continue the EMC ticket series (047295–047310) from 047311. */
const serialBase = parseInt(document.body.dataset.serial || "47311", 10);
$$(".tik").forEach((card, i) => {
  const punch = document.createElement("div");
  punch.className = "punchline";
  punch.setAttribute("aria-hidden", "true");
  const serial = document.createElement("span");
  serial.className = "serial";
  serial.setAttribute("aria-hidden", "true");
  serial.textContent = "№ 0" + (serialBase + i);
  card.append(punch, serial);
});

/* ---------- Reveal on scroll ---------- */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => io.observe(el));
} else {
  $$(".reveal").forEach((el) => el.classList.add("in"));
}

/* ---------- Service worker ---------- */
if ("serviceWorker" in navigator && location.protocol === "https:") {
  addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* offline support is progressive enhancement */
    });
  });
}
