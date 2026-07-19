/* Coastal Carolina Fair — motion layer (GSAP, self-hosted, no build step).
   Everything here is progressive enhancement: without JS or with
   prefers-reduced-motion the site is a fully readable static sunset page. */

(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof gsap !== "undefined";
  const isHome = document.body.dataset.page === "home";

  /* Night amount drives firefly brightness: scrubbed on the home story,
     fixed on the static-evening interior pages. */
  let nightAmount = document.querySelector(".sky--static") ? 0.65 : 0;

  /* ---------- GSAP choreography ---------- */
  if (hasGSAP && !reduced) {
    document.documentElement.classList.add("js-motion");
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

    /* Headline mask reveal is pure CSS, keyed off the js-motion class */

    /* Ferris wheel: idle spin + scroll adds momentum */
    const rotor = document.querySelector(".wheel-rotor");
    if (rotor) {
      const gondolas = document.querySelectorAll(".gondola");
      gsap.ticker.add((time) => {
        const rot = time * 4 + window.scrollY * 0.12;
        gsap.set(rotor, { rotation: rot, svgOrigin: "260 240" });
        gondolas.forEach((g) =>
          gsap.set(g, { rotation: -rot, transformOrigin: "50% 0%" })
        );
      });
    }

    if (typeof ScrollTrigger !== "undefined") {
      /* ---- Cinematic opener: scroll-scrubbed frame sequence ---- */
      const opener = document.querySelector(".opener");
      if (opener) {
        const cv = opener.querySelector("canvas");
        const cx = cv.getContext("2d");
        const N = parseInt(opener.dataset.frames, 10) || 0;
        const src = (i) => `assets/opener/f${String(i).padStart(3, "0")}.webp`;
        const imgs = new Array(N);
        const ready = new Array(N).fill(false);
        let target = 0;

        const nearestReady = (i) => {
          for (let d = 0; d < N; d++) {
            if (ready[i - d]) return i - d;
            if (ready[i + d]) return i + d;
          }
          return -1;
        };

        const draw = () => {
          const idx = nearestReady(target);
          if (idx < 0) return;
          const img = imgs[idx];
          const cw = cv.width;
          const ch = cv.height;
          const s = Math.max(cw / img.width, ch / img.height);
          const w = img.width * s;
          const h = img.height * s;
          cx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
        };

        const size = () => {
          const dpr = Math.min(devicePixelRatio || 1, 2);
          cv.width = Math.round(cv.clientWidth * dpr);
          cv.height = Math.round(cv.clientHeight * dpr);
          draw();
        };
        addEventListener("resize", size, { passive: true });
        size();

        /* Progressive load: coarse pass first so scrubbing works early,
           then fill in the in-between frames. */
        const load = (i) => {
          if (i >= N || imgs[i]) return;
          const im = new Image();
          im.decoding = "async";
          im.src = src(i + 1);
          im.onload = () => {
            ready[i] = true;
            if (Math.abs(i - target) < 9) draw();
          };
          imgs[i] = im;
        };
        [8, 4, 2, 1].forEach((stride, pass) => {
          setTimeout(() => {
            for (let i = 0; i < N; i += stride) load(i);
          }, pass * 700);
        });

        /* Pin runway scales with the sequence length so the wheel's
           scroll-speed feels the same however many frames we have. */
        const runway = Math.round((N / 90) * 170) + "%";

        ScrollTrigger.create({
          trigger: opener,
          start: "top top",
          end: "+=" + runway,
          pin: true,
          scrub: 0.4,
          onUpdate(self) {
            target = Math.round(self.progress * (N - 1));
            draw();
          },
        });

        gsap.to(".opener-copy", {
          autoAlpha: 0.25,
          y: -30,
          ease: "none",
          scrollTrigger: { trigger: opener, start: "top top", end: "+=" + runway, scrub: true },
        });
        gsap.to(".opener .scroll-cue", {
          autoAlpha: 0,
          scrollTrigger: { trigger: opener, start: "top top", end: "+=25%", scrub: true },
        });
      }

      /* Brief hero pin with art parallax */
      const hero = document.querySelector(".hero");
      if (hero) {
        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "+=38%",
          pin: true,
          pinSpacing: true,
        });
        gsap.to(".hero-art", {
          y: -50,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "+=80%", scrub: true },
        });
      }

      /* The day-to-night story: sun sets, stars rise, midway lights up */
      if (isHome) {
        const story = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: () => "+=" + (ScrollTrigger.maxScroll(window) * 0.92),
            scrub: 0.6,
            onUpdate(self) {
              nightAmount = gsap.utils.clamp(0, 1, (self.progress - 0.32) / 0.45);
            },
          },
        });

        story
          .to(".sky-sun", { y: 260, autoAlpha: 0, duration: 0.34 }, 0)
          .to(".sky-evening", { opacity: 1, duration: 0.3 }, 0.04)
          .to(".sky-night", { opacity: 1, duration: 0.34 }, 0.36)
          .to(".sky-stars", { opacity: 1, duration: 0.3 }, 0.4)
          .to(".sky-moon", { opacity: 0.9, y: 24, duration: 0.3 }, 0.48)
          .to(
            ".skyline",
            { "--skyline-ink": "#070b1e", "--bulb-on": 0.95, duration: 0.4 },
            0.3
          );
      }

      /* Marquee signs pop as they enter */
      gsap.utils.toArray(".sign").forEach((sign) => {
        gsap.from(sign, {
          scale: 0.92,
          autoAlpha: 0,
          duration: 0.5,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: sign, start: "top 85%" },
        });
      });
    }

    /* Magnetic CTAs (fine pointers only) */
    if (matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll(".hero-ctas a, .panel-dusk .btn-ticket, .panel-dusk .btn-ghost").forEach((btn) => {
        const qx = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power2.out" });
        const qy = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power2.out" });
        btn.addEventListener("pointermove", (e) => {
          const r = btn.getBoundingClientRect();
          qx((e.clientX - r.left - r.width / 2) * 0.25);
          qy((e.clientY - r.top - r.height / 2) * 0.35);
        });
        btn.addEventListener("pointerleave", () => {
          qx(0);
          qy(0);
        });
      });
    }
  }

  /* ---------- Cursor sheen on ticket cards (CSS does the painting) ---------- */
  document.querySelectorAll(".tik").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Fireflies ---------- */
  const canvas = document.getElementById("fireflies");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    let w, h;
    const N = 26;
    const flies = Array.from({ length: N }, (_, i) => ({
      x: Math.random(),
      y: 0.25 + Math.random() * 0.7,
      r: 1.2 + Math.random() * 1.8,
      p: Math.random() * Math.PI * 2,
      s: 0.00012 + Math.random() * 0.00025,
      hue: i % 5 === 0 ? "255, 221, 133" : "255, 197, 61",
    }));

    const size = () => {
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
    };
    size();
    addEventListener("resize", size, { passive: true });

    let last = 0;
    const draw = (t) => {
      requestAnimationFrame(draw);
      if (t - last < 33) return; /* ~30fps is plenty for ambience */
      last = t;
      ctx.clearRect(0, 0, w, h);
      if (nightAmount <= 0.02) return;
      flies.forEach((f) => {
        f.p += 0.012;
        f.x += Math.sin(f.p * 0.7) * f.s;
        f.y += Math.cos(f.p * 0.5) * f.s - 0.00004;
        if (f.y < 0.15) f.y = 0.95;
        const flicker = 0.45 + 0.55 * Math.abs(Math.sin(f.p));
        const a = 0.5 * flicker * nightAmount;
        const x = f.x * w;
        const y = f.y * h;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, f.r * 5);
        grad.addColorStop(0, `rgba(${f.hue}, ${a})`);
        grad.addColorStop(1, `rgba(${f.hue}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, f.r * 5, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    requestAnimationFrame(draw);
  }
})();
