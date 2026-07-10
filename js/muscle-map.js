/* The signature: clone the body figure into the spine (interactive) and every
   phone avatar slot (static heatmap), then drive muscle activation + the
   mint->amber goal morph from scroll. Degrades to IntersectionObserver if GSAP
   is unavailable, and to instant state under prefers-reduced-motion. */
(function () {
  "use strict";
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  const tpl = document.getElementById("body-tpl");
  const cloneBody = () => tpl.content.firstElementChild.cloneNode(true);

  // section -> muscle jump map (first element wins as the target)
  const sectionFor = {};
  document.querySelectorAll("[data-muscle]").forEach((el) => {
    if (!sectionFor[el.dataset.muscle]) sectionFor[el.dataset.muscle] = el;
  });
  const jumpToMuscle = (m) => {
    const t = sectionFor[m];
    if (t) t.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
  };

  // --- spine figure: interactive, muscles keyed by id m-<name> ---
  const spineMap = document.getElementById("spine-map");
  if (spineMap) {
    const svg = cloneBody();
    svg.querySelectorAll(".muscle").forEach((g) => {
      const m = g.dataset.m;
      g.id = "m-" + m;
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "link");
      g.setAttribute("aria-label", "Jump to the " + m + " section");
      g.addEventListener("click", () => jumpToMuscle(m));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          jumpToMuscle(m);
        }
      });
    });
    spineMap.appendChild(svg);
  }

  // --- phone avatar figures: static heatmap (chest overloaded, arms/core worked) ---
  const HEAT = { chest: "max", shoulders: "on", biceps: "on", abs: "on" };
  document.querySelectorAll("[data-avatar]").forEach((slot) => {
    const svg = cloneBody();
    svg.querySelectorAll(".muscle").forEach((g) => {
      g.classList.replace("muscle", "amuscle");
      const h = HEAT[g.dataset.m];
      if (h === "on") g.classList.add("heat");
      else if (h === "max") g.classList.add("heat-max");
    });
    slot.appendChild(svg);
  });

  // --- activation ---
  function setActive(m, on) {
    const g = document.getElementById("m-" + m);
    if (!g) return;
    if (on) {
      g.classList.add("active", "was-active");
    } else {
      g.classList.remove("active");
    }
  }

  // --- progress readout + goal morph ---
  const pctEl = document.getElementById("spine-pct");
  const labelEl = document.getElementById("spine-label");
  const topbarFill = document.getElementById("topbar-fill");
  const LABELS = [
    [0, "warm-up"],
    [0.2, "working"],
    [0.45, "pump"],
    [0.7, "burn"],
    [0.9, "full send"],
  ];
  const labelFor = (p) => {
    let l = "warm-up";
    for (const [t, v] of LABELS) if (p >= t) l = v;
    return l;
  };
  const MINT = [0x00, 0xe0, 0xb8];
  const AMBER = [0xfb, 0xbf, 0x24];
  const hex = (n) => n.toString(16).padStart(2, "0");
  const lerpGoal = (t) =>
    "#" + MINT.map((v, i) => hex(Math.round(v + (AMBER[i] - v) * t))).join("");
  function onProgress(p) {
    document.documentElement.style.setProperty("--goal", lerpGoal(p));
    if (pctEl) pctEl.textContent = Math.round(p * 100) + "%";
    if (labelEl) labelEl.textContent = labelFor(p);
    if (topbarFill) topbarFill.style.width = p * 100 + "%";
  }

  if (hasGSAP) {
    document.querySelectorAll("[data-muscle]").forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: "top 65%",
        end: "bottom 35%",
        onToggle: (self) => setActive(sec.dataset.muscle, self.isActive),
      });
    });
    ScrollTrigger.create({
      trigger: "main",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => onProgress(self.progress),
    });
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setActive(e.target.dataset.muscle, e.isIntersecting)),
      { rootMargin: "-35% 0px -35% 0px" }
    );
    document.querySelectorAll("[data-muscle]").forEach((s) => io.observe(s));
    const onScroll = () => {
      const h = document.documentElement;
      const denom = h.scrollHeight - h.clientHeight;
      onProgress(denom > 0 ? Math.min(1, Math.max(0, h.scrollTop / denom)) : 0);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  window.__MM = { hasGSAP, REDUCE };
})();
