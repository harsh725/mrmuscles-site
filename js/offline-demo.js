/* The airplane-mode demo: prove the offline claim by letting visitors toggle
   connectivity and watch logging keep working while points queue and drain.
   Self-contained, no dependencies, keyboard + screen-reader friendly. */
(function () {
  "use strict";
  const btn = document.getElementById("airplane");
  const cloud = document.getElementById("demo-cloud");
  const log = document.getElementById("demo-log");
  const status = document.getElementById("demo-status");
  const add = document.getElementById("demo-add");
  const demo = document.getElementById("demo");
  if (!btn || !add || !log) return;

  let offline = false;
  let queued = 0;
  let n = 0;
  const NAMES = [
    "Bench press · 4 sets",
    "5 km run",
    "Deadlift · 3 sets",
    "Pull-ups · 5 sets",
    "Squats · 4 sets",
    "Plank · 3 min",
  ];

  function render() {
    cloud.textContent = offline ? "☁ offline" : queued ? "☁ syncing…" : "☁ synced";
    demo.classList.toggle("off", offline);
    if (queued > 0) {
      status.textContent = offline
        ? queued + " workout" + (queued > 1 ? "s" : "") + " queued — will sync when you reconnect"
        : "syncing " + queued + "…";
    } else {
      status.textContent = "All caught up.";
    }
  }

  function addEntry() {
    n++;
    const row = document.createElement("div");
    row.className = "demo__entry" + (offline ? " queued" : "");
    const tick = document.createElement("span");
    tick.className = "tick";
    tick.textContent = offline ? "⏳" : "✓";
    row.appendChild(tick);
    row.append(NAMES[(n - 1) % NAMES.length]);
    log.prepend(row);
    while (log.children.length > 4) log.removeChild(log.lastChild);
    if (offline) queued++;
    render();
  }

  function drain() {
    queued = Math.max(0, queued - 1);
    const q = log.querySelector(".demo__entry.queued");
    if (q) {
      q.classList.remove("queued");
      q.querySelector(".tick").textContent = "✓";
    }
    render();
    if (queued > 0) setTimeout(drain, 420);
  }

  function toggle() {
    offline = !offline;
    btn.setAttribute("aria-checked", String(offline));
    if (!offline && queued > 0) setTimeout(drain, 400);
    render();
  }

  btn.addEventListener("click", toggle);
  add.addEventListener("click", addEntry);
  addEntry(); // seed one synced entry
})();
