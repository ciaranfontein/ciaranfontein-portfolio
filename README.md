# ciaranfontein.com

Personal portfolio site — Astro, static output, TypeScript. Built for the Japan +
global remote job search (see the vault plan at
`projects/portfolio-website/plan.md` in the AI Studio vault for full context).

## Stack

- **Astro** (static output, zero client JS by default)
- **TypeScript** (strict)
- Plain CSS with custom properties for theming — no CSS framework, no client
  framework runtime shipped
- The only client-side JavaScript shipped to the browser is:
  1. The eye-tracking easter egg island (`src/components/EyeTrackingHeadshot.astro`
     + `src/scripts/eye-tracking.ts`)
  2. The dark/light theme toggle (`src/components/ThemeToggle.astro`)
  3. The screenshot carousel/lightbox on the case study (inline script in
     `src/components/CaseStudyGuusto.astro`)

## Project structure

```
src/
  assets/            eye-tracking source PNGs (CiaranNoEyes, EyeWhites, LeftEye, RightEye)
  components/        one Astro component per section + the eye-tracking island
  layouts/
    BaseLayout.astro SEO/OG/JSON-LD head, theme-init script, global CSS import
  scripts/
    eye-tracking.ts  vanilla TS port of the cursor-follow logic (see below)
  pages/
    index.astro      single page, sections assembled here
  site.config.ts     site-wide constants — availability badge, contact info, resume list
public/
  images/            optimized webp screenshots + OG card + headshot
  resume/             the 3 resume files (EN CV, rirekisho, shokumu keirekisho)
  CNAME               ciaranfontein.com, for GitHub Pages custom domain
assets-original/      full-resolution source images (kept, not shipped to prod)
scripts/              one-off Node scripts used to generate optimized assets
  optimize-images.mjs    -> public/images/guusto/*.webp, public/images/headshot.webp
  generate-og-image.mjs  -> public/images/og-card.png
  generate-favicon.mjs   -> public/favicon.svg, favicon.ico, apple-touch-icon.png
.github/workflows/deploy.yml   GitHub Pages deploy via withastro/action + actions/deploy-pages
```

## The availability badge

The hero shows an availability badge that needs to flip on **August 1, 2026**
from "Available August 2026" to "🟢 Open to work". This is a single constant:

**`src/site.config.ts`, line 12** — `export const AVAILABILITY_BADGE = "Available August 2026";`

Change that one string (and nothing else) to flip the badge site-wide.

## Eye-tracking easter egg

Ported from the original CRA site (`master` branch of the old
`github.com/ciaranfontein/portfolio` repo — see the vault's adoption-report.md).
Original mechanism: a base "no eyes" photo with a sclera image and two pupil
images layered on top; pupils move toward the cursor along a small ellipse
computed via `Math.atan2` on the vector from each eye's socket center to the
pointer.

This port drops the two original dependencies (`styled-components`,
`@react-hook/mouse-position`) and reimplements the same math with a plain
`mousemove` listener in `src/scripts/eye-tracking.ts`, driven by
`requestAnimationFrame`. Differences from the original:

- Pixel offsets were converted to percentages of the 1333×2000 source frame
  (the headshot and `CiaranNoEyes.png` share those exact dimensions) so the
  layout stays responsive instead of relying on a fixed-pixel canvas.
- Touch devices: pupils follow the active touch point while touching, then
  return to a slow idle-wander drift ~1.5s after touch ends (there's no
  persistent hover position to read on touch).
- `prefers-reduced-motion: reduce` disables the animation entirely; pupils sit
  at their CSS rest position with no JS listeners attached.

If the headshot photo is ever replaced, the percentage offsets in
`EyeTrackingHeadshot.astro` must be recalculated against the new crop.

## Scope guardrail (Guusto case study)

Per the plan's decision, the case study claims only the mobile app work (built
from Figma, from scratch, shipped to both stores, integrated with a
pre-existing backend). `guusto_productimg_web_02` (the web admin dashboard) is
intentionally excluded from this build.

## Local development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # -> dist/
npm run preview   # serve the production build locally
npm run astro check   # TypeScript + Astro diagnostics
```

To regenerate optimized images/OG card/favicon from the originals in
`assets-original/`:

```sh
node scripts/optimize-images.mjs
node scripts/generate-og-image.mjs
node scripts/generate-favicon.mjs
```

## Deploy notes (Phase 4 — not done yet)

- `.github/workflows/deploy.yml` builds with the official `withastro/action`
  and publishes via `actions/deploy-pages` — this needs GitHub Pages enabled
  with source "GitHub Actions" in the repo settings once it's pushed.
- `public/CNAME` already contains `ciaranfontein.com`, carried into `dist/`
  automatically by Astro's static copy of `public/`.
- DNS should already point at GitHub Pages from the previous site (per
  adoption-report.md) — verify, don't recreate, when Phase 4 starts.
- No GitHub repo has been created and nothing has been pushed as part of this
  build — that's explicitly Phase 4, done with Ciaran.
