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
  1. The dark/light theme toggle (`src/components/ThemeToggle.astro`)
  2. The screenshot lightbox on the case study (inline script in
     `src/components/CaseStudyGuusto.astro`)

## Project structure

```
src/
  components/        one Astro component per section
  layouts/
    BaseLayout.astro SEO/OG/JSON-LD head, theme-init script, global CSS import
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

## Eye-tracking easter egg (REMOVED 2026-07-05)

The pupil-tracking port from the original CRA site was removed at Ciaran's
request — the pupils didn't render on the composited photo, leaving empty eye
sockets. The hero now uses the plain headshot (`public/images/headshot.webp`).
The original implementation survives in the old repo
(`github.com/ciaranfontein/portfolio`, `master` branch) and in this repo's git
history (`src/components/EyeTrackingHeadshot.astro`, `src/scripts/eye-tracking.ts`,
`src/assets/*.png`) if it's ever revived.

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
