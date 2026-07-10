/* Orchestration: hero load flex, tour screen crossfade, stat count-up,
   finale body-lit, PR confetti. All motion is gated by GSAP presence and
   prefers-reduced-motion; without them the page is fully readable and static. */
(function () {
  "use strict";
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const hasST = typeof window.ScrollTrigger !== "undefined";

  // ---------- hero load sequence ----------
  const heroEls = ".hero__eyebrow, .hero__title, .hero__sub, .hero__ctas, .hero__device";
  if (hasGSAP && !REDUCE) {
    try {
      const tl = gsap.timeline({ delay: 0.12 });
      tl.fromTo(
        ".hero__title",
        { "--hw": 520, "--hwd": 66, opacity: 0, y: 10 },
        { "--hw": 900, "--hwd": 118, opacity: 1, y: 0, duration: 1.0, ease: "power3.out" }
      );
      tl.from(".hero__eyebrow", { opacity: 0, y: 12, duration: 0.4 }, 0.05);
      tl.from(".hero__sub, .hero__ctas", { opacity: 0, y: 16, stagger: 0.08, duration: 0.45 }, "-=0.55");
      tl.from(".hero__device", { opacity: 0, y: 26, scale: 0.96, duration: 0.6, ease: "power2.out" }, "-=0.75");

      // failsafe: above-the-fold content must never stay hidden. If the timeline
      // stalls while the page is actually visible, snap it to the end state.
      setTimeout(() => {
        if (document.visibilityState === "visible" && tl.progress() < 1) tl.progress(1);
      }, 2600);

      // heat-up ripple across the spine, then settle (class-based so it never
      // fights the scroll-driven fills)
      const muscles = [...document.querySelectorAll("#spine-map .muscle")];
      muscles.forEach((g, i) => {
        setTimeout(() => g.classList.add("active"), 500 + i * 45);
        setTimeout(() => g.classList.remove("active"), 1000 + i * 45);
      });
    } catch (e) {
      // any animation failure reveals the hero rather than hiding it
      gsap.set(heroEls, { clearProps: "opacity,transform" });
    }
  }

  // ---------- feature tour: crossfade device screens ----------
  const tourDevice = document.getElementById("tour-device");
  if (tourDevice) {
    const screens = tourDevice.querySelectorAll(".screen");
    let current = "avatar";
    const showScreen = (name) => {
      if (name === current) return;
      current = name;
      screens.forEach((s) => s.classList.toggle("on", s.dataset.screen === name));
      if (name === "pr") burstConfetti();
    };
    if (hasST) {
      document.querySelectorAll(".tour__step").forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => showScreen(step.dataset.screen),
          onEnterBack: () => showScreen(step.dataset.screen),
        });
      });
    } else {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) showScreen(e.target.dataset.screen);
          }),
        { rootMargin: "-45% 0px -45% 0px" }
      );
      document.querySelectorAll(".tour__step").forEach((s) => io.observe(s));
    }
  }

  // ---------- engineering stat count-up ----------
  const counters = document.querySelectorAll(".stat__num[data-count]");
  const withCommas = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  function runCount(el) {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    if (REDUCE || !hasGSAP) {
      el.textContent = withCommas(target.toFixed(dec)) + suffix;
      return;
    }
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = withCommas(obj.v.toFixed(dec)) + suffix;
      },
    });
  }
  if (hasST) {
    counters.forEach((el) =>
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => runCount(el) })
    );
  } else {
    counters.forEach(runCount);
  }

  // ---------- finale: light the whole body ----------
  const spine = document.getElementById("spine");
  const finale = document.getElementById("get");
  if (spine && finale) {
    if (hasST) {
      ScrollTrigger.create({
        trigger: finale,
        start: "top 60%",
        onEnter: () => spine.classList.add("finale-lit"),
        onLeaveBack: () => spine.classList.remove("finale-lit"),
      });
    } else {
      new IntersectionObserver(
        (e) => e.forEach((x) => spine.classList.toggle("finale-lit", x.isIntersecting)),
        { rootMargin: "-40% 0px 0px 0px" }
      ).observe(finale);
    }
  }

  // ---------- confetti (deterministic spread; no Math.random needed) ----------
  function burstConfetti() {
    const box = document.getElementById("pr-confetti");
    if (!box || REDUCE || !hasGSAP) return;
    box.textContent = "";
    const colors = ["#7c5cff", "#00e0b8", "#fbbf24", "#ff5470", "#ff7849"];
    for (let i = 0; i < 26; i++) {
      const bit = document.createElement("i");
      bit.style.background = colors[i % colors.length];
      bit.style.left = 8 + ((i * 3.3 * 100) % 84) / 100 + "%";
      bit.style.top = "-14px";
      box.appendChild(bit);
      gsap.to(bit, {
        y: 330 + (i % 5) * 22,
        x: i % 2 ? 26 : -26,
        rotation: 320,
        opacity: 0,
        duration: 1.5 + (i % 4) * 0.2,
        ease: "power1.in",
        delay: (i % 6) * 0.05,
      });
    }
  }
})();
