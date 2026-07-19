/* Coastal Carolina Fair — motion layer (GSAP, self-hosted, no build step).
   One job now: the cinematic scroll-scrub opener. Everything else on the
   site is clean and static; without JS or with prefers-reduced-motion the
   opener stays hidden and the page starts at the welcome section. */

(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof gsap !== "undefined";

  if (!hasGSAP || reduced || typeof ScrollTrigger === "undefined") return;

  const opener = document.querySelector(".opener");
  if (!opener) return;

  document.documentElement.classList.add("js-motion");
  gsap.registerPlugin(ScrollTrigger);

  const cv = opener.querySelector("canvas");
  const cx = cv.getContext("2d");
  const N = parseInt(opener.dataset.frames, 10) || 0;
  /* small screens get the 640px frame set (~40% of the bytes) */
  const SMALL = Math.min(screen.width, screen.height) <= 500 || innerWidth <= 700;
  const src = (i) => `assets/opener/${SMALL ? "s/" : ""}f${String(i).padStart(3, "0")}.webp`;
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
    /* portrait screens crop the 16:9 frame — bias toward the wheel (right of center) */
    const fx = cw < ch ? 0.62 : 0.5;
    cx.drawImage(img, (cw - w) * fx, (ch - h) / 2, w, h);
  };

  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(cv.clientWidth * dpr);
    cv.height = Math.round(cv.clientHeight * dpr);
    draw();
  };
  addEventListener("resize", size, { passive: true });
  size();

  /* Progressive load: coarse pass first so scrubbing works early. */
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
  /* poster frame immediately; the rest waits for scroll intent (or 2.5s),
     so a bouncing mobile visitor doesn't pay for 180 frames */
  load(0);
  let sequenceStarted = false;
  const startSequence = () => {
    if (sequenceStarted) return;
    sequenceStarted = true;
    [8, 4, 2, 1].forEach((stride, pass) => {
      setTimeout(() => {
        for (let i = 0; i < N; i += stride) load(i);
      }, pass * 600);
    });
  };
  ["scroll", "pointerdown", "touchstart", "keydown"].forEach((ev) =>
    addEventListener(ev, startSequence, { once: true, passive: true })
  );
  setTimeout(startSequence, 2500);

  /* Pin runway scales with sequence length so rotation-per-scroll
     stays constant however many frames we splice on. */
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

  /* Dawn: the last stretch of the scrub warms the footage so night hands
     off to the daytime sky instead of jump-cutting. */
  const dawn = gsap.timeline({
    scrollTrigger: { trigger: opener, start: "top top", end: "+=" + runway, scrub: true },
  });
  dawn.to({}, { duration: 0.78 });
  dawn.to(".opener-dawn", { autoAlpha: 0.9, duration: 0.22, ease: "power1.in" });

  gsap.to(".opener .scroll-cue", {
    autoAlpha: 0,
    scrollTrigger: { trigger: opener, start: "top top", end: "+=25%", scrub: true },
  });
})();
