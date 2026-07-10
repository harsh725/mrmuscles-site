# MrMuscles — exhibition showcase site

A cinematic, scroll-driven landing page for **MrMuscles**, the offline-first fitness &
nutrition tracker where your progress shows up on a living map of your body.

**Live:** https://harsh725.github.io/mrmuscles-site/

## The idea

The page borrows the app's own mechanic: as you scroll, a muscle-map "spine" lights up and the
accent temperature shifts from mint (fat-loss) to amber (muscle-gain) — scrolling *is* training.
By the finale, the whole body is lit.

## Build

No build step, no framework. Static HTML/CSS/JS.

- `index.html` — the page
- `css/tokens.css` — design tokens (lifted from the app's `src/theme/theme.ts`) + self-hosted fonts
- `css/site.css` — layout & components
- `js/muscle-map.js` — the muscle-map spine (scroll activation + mint→amber goal morph)
- `js/main.js` — hero flex, feature-tour crossfade, stat count-up, finale, confetti
- `js/offline-demo.js` — the interactive airplane-mode demo
- `assets/shots/` — real Android screenshots (seeded dev build)
- `js/vendor/` — GSAP + ScrollTrigger (self-hosted)

Everything is progressive-enhancement: with JS disabled or `prefers-reduced-motion`, the page is
fully readable and static.

## Run locally

```bash
python3 -m http.server 8090   # then open http://localhost:8090/
```

## Distribution

The finale links to the GitHub Releases page for the Android APK. To publish the beta:
attach a signed release APK to a release on this repo, then the QR / button resolve to it.

---

Designed & engineered by Kavin Nash · React Native · WatermelonDB · Supabase · Skia
