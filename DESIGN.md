---
name: Ciaran Fontein Portfolio
description: Calm, evidence-led presentation of production mobile engineering work.
colors:
  ink: "#0b193e"
  ink-muted: "#5a6681"
  canvas: "#ffffff"
  canvas-alt: "#eef1f2"
  surface: "#ffffff"
  border: "#d7dee3"
  accent: "#1f5a78"
  accent-strong: "#154f82"
  accent-hover: "#0b3a65"
  link: "#195b94"
  focus: "#0b4f70"
  selection: "#bfe7eb"
typography:
  display:
    fontFamily: '"Carlito", "Noto Sans", sans-serif'
    fontSize: "clamp(2.25rem, 3.4vw, 2.625rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: '"Carlito", "Noto Sans", sans-serif'
    fontSize: "clamp(1.55rem, 2.5vw, 2.15rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: '"Carlito", "Noto Sans", sans-serif'
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  body:
    fontFamily: '"Carlito", "Noto Sans", sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: '"Carlito", "Noto Sans", sans-serif'
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.08em"
rounded:
  square: "0"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "4rem"
  xxl: "6rem"
components:
  navigation-link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0"
  evidence-link:
    textColor: "{colors.link}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0"
  product-panel:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "0"
---

# Design System: Ciaran Fontein Portfolio

## Overview

**Creative North Star: "Quiet Product Proof"**

The portfolio is calm, serious, and evidence-led. It borrows the clarity and confidence of established Osaka-area technology companies without copying their branding: generous space, factual hierarchy, restrained color, and real product imagery do the work. The interface stays quiet so Ciaran's production ownership, shipped apps, and colleague testimony remain the focus.

The visual voice is humble but not timid. Strong alignment, square geometry, short headings, and visible evidence create authority without theatrical self-promotion. The site should feel like an experienced engineer explaining completed work clearly, not an agency pitch or a decorative personal brand.

**Key Characteristics:**

- Product evidence appears before broad skill inventories.
- Large areas of clean white space give dense technical material room to breathe.
- Navy typography and fine cool-grey rules create a sober, technical cadence.
- Real screenshots and a natural headshot carry personality; imagery stays concentrated rather than repeated throughout the page.
- Content is direct, specific, and plainspoken.

## Colors

The palette is cool, restrained, and professional: deep navy carries authority, pale neutrals separate surfaces, and blue is reserved for navigation and action.

### Primary

- **Engineering Navy:** The primary text color for headings, high-emphasis copy, navigation, and recommendation quotations.
- **Evidence Blue:** The action color for links to applications, stores, profiles, and resume files.

### Neutral

- **Quiet Canvas:** The continuous pure-white page background. It lets the portrait's white field blend cleanly into the page without creating a paper or tactile effect.
- **White Surface:** Used behind portrait and product imagery as the same uninterrupted field as the canvas.
- **Cool Divider:** A one-pixel structural rule between sections, data rows, cards, and link cells.
- **Measured Slate:** Secondary copy, dates, labels, and supporting descriptions.

### Named Rules

**The Evidence Blue Rule.** Blue signals something the visitor can open or act on. Do not use it as broad decorative fill.

**The Quiet Canvas Rule.** Preserve the pure-white canvas across long pages. Alternate backgrounds only when they clarify image or content boundaries.

## Typography

**Display Font:** Carlito, with Noto Sans and the system sans-serif as fallbacks.
**Body Font:** Carlito, with Noto Sans and the system sans-serif as fallbacks.

**Character:** One practical humanist sans-serif keeps the site modest and cohesive. Weight, scale, and spacing establish hierarchy; the design does not rely on a contrasting display face.

### Hierarchy

- **Display:** Bold, tightly led, and slightly tracked inward. Reserve it for the hero claim and keep the measure to roughly 23 characters so it breaks decisively.
- **Headline:** Bold section headings with compact line height. Use a responsive scale for major sections and a smaller fixed form in dense overview rows.
- **Title:** Product and case-study titles. Keep them short and close to their supporting description.
- **Body:** Regular weight with a 1.5 line height. Keep explanatory paragraphs between roughly 65 and 72 characters for comfortable scanning.
- **Label:** Small, bold, uppercase text with open tracking. Use it sparingly for functional context such as “Featured project.”

### Named Rules

**The One-Family Rule.** Do not introduce an expressive display, serif, or monospace face. Carlito's restraint is part of the site's seriousness.

**The Short-Heading Rule.** Headings state the subject. They do not use slogans, hype, or decorative line breaks.

## Layout

The page uses a centered frame that is normally 88% of the viewport and capped at 1320px. The page-wide structure repeatedly pairs a narrow 31% context column with a wide 69% evidence column. That proportion aligns hero copy, project summaries, section introductions, recommendations, experience, skills, and contact information into one readable system.

Spacing follows a half-rem base with purposeful jumps from compact evidence rows to broad section breaks. Dense overview content uses 0.5-1.5rem intervals; major narrative sections use responsive vertical padding from 4rem to 7rem. Paragraphs remain left aligned and avoid full-width measures.

The portrait is a small, quiet inset within the hero, with visible breathing room on every side. It remains visually separate from the Guusto banner below and must never touch, overlap, or peek over that boundary.

At 1050px, the frame narrows and product and skill grids simplify. At 760px, paired columns become one column, the navigation wraps, long evidence layouts lose their left offset, six-up screenshots become three-up, and product rows stack. At 480px, product detail, experience, education, contact links, and the footer become single-column. The mobile header hides lower-priority navigation links but preserves Contact and Resume.

**The 31/69 Rule.** Use the established narrow-context, wide-evidence split for new desktop sections before inventing another grid.

**The Mobile Reset Rule.** Below 760px, remove deliberate desktop offsets and let every section align to the same readable edge.

## Elevation & Depth

The system is flat by design. It uses no card shadows. Depth comes from spacing, one-pixel dividers, and product imagery. White image fields blend into the pure-white canvas instead of appearing as separate cards. The sticky header may use slight background opacity to preserve orientation without appearing elevated.

**The Flat-by-Default Rule.** Do not add shadows, glows, glass panels, gradients, or floating cards. Structural lines and content hierarchy are sufficient.

## Shapes

Corners are square throughout. Containers, links, screenshots, portrait frames, and content cells use rectilinear geometry with fine borders only where separation is useful. Product screenshots retain their native silhouettes inside square layout regions. Independent-product overview thumbnails use each app's real iOS App Store icon and preserve the platform's standard rounded icon silhouette.

**The Square Edge Rule.** Border radius is zero for site-owned surfaces. Standard iOS App Store icon rounding is an explicit exception because that silhouette belongs to the operating system and the shipped product asset.

## Components

### Navigation

- Keep the header compact, sticky, and separated from the page by a single cool divider.
- Use plain navy text links with generous horizontal gaps. Hover reveals an underline with a visible offset; there is no pill, tab, or filled active state.
- On narrow screens, wrap links and hide lower-priority destinations before compressing the type.

### Evidence Links

- Use Evidence Blue and a clear underline or underline-on-hover treatment.
- Keep labels factual: “App Store,” “Google Play,” “LinkedIn,” “GitHub,” and explicit resume formats.
- Provide a three-pixel focus outline with a four-pixel offset for keyboard users.

### Product Panels

- In the independent-product overview, pair each app icon with a short title, one-sentence purpose, concise platform line, and its genuine destinations.
- Use each independent product's actual iOS App Store icon in the overview and retain its native rounded silhouette. Do not redraw, flatten, or mask it into the site's square geometry.
- Use square edges and dividers. Do not simulate cards with shadows or rounded containers.
- Give Meigaza both its App Store and Web app destinations; keep other product destinations aligned with the versions that are genuinely available.
- Keep the later Selected products detail section text-only. The overview icons already establish product identity, so repeating screenshots there creates clutter without adding evidence.

### Portrait

- Treat the headshot as a restrained personal inset, not a dominant hero image.
- Preserve whitespace around the portrait and contain it fully within the hero.
- Keep a clear visual break between the portrait and Guusto banner at every viewport width.

### Section Introductions

- Put a short heading in the narrow column and a plain-language summary in the wide column.
- Continue the same alignment into lists or evidence below, creating a visible reading rail down the page.

### Recommendations

- Present the quotation in the wide evidence column and the source context in the narrow column.
- Use normal body punctuation, restrained quotation styling, and a smaller muted attribution. Testimony supports the work; it is not a decorative pull quote.

### Motion

- The portrait may enter once with a short 700ms vertical reveal using an ease-out curve.
- Keep all other content still. Hover feedback should use underline and color rather than movement.
- Honor `prefers-reduced-motion`: remove the portrait animation, disable smooth scrolling, and reduce transitions and animations to effectively zero duration.

## Do's and Don'ts

### Do:

- **Do** show shipped product imagery, ownership details, and colleague testimony before broad tool lists.
- **Do** reuse the 31/69 desktop grid, fine dividers, square geometry, and generous section spacing.
- **Do** use real local product assets and concise descriptive alternative text.
- **Do** preserve the standard rounded silhouette of real iOS App Store icons while keeping the surrounding site layout square.
- **Do** concentrate imagery in the independent-product icon overview and Guusto evidence gallery; keep Selected products text-only.
- **Do** keep the portrait small, contained, and visibly separated from the Guusto banner.
- **Do** preserve strong keyboard focus, semantic landmarks, readable line lengths, and responsive stacking.
- **Do** write direct, specific copy that sounds like a serious engineer describing work completed.

### Don't:

- **Don't** add brewery-menu styling, paper textures, stamps, stickers, tactile ephemera, or ornamental badges.
- **Don't** use generic developer imagery, code-wall decoration, neon gradients, glass effects, or dark-mode theatrics.
- **Don't** turn the site into a recruitment funnel with oversized calls to action, inflated claims, or sales language.
- **Don't** use rounded cards, drop shadows, or dense dashboard grids to manufacture visual complexity.
- **Don't** recreate, square off, or decoratively reframe independent-product app icons.
- **Don't** replace real screenshots with generic mockups when the product itself is available.
- **Don't** repeat awkward or low-information screenshots in the Selected products detail section.
- **Don't** let the portrait touch, overlap, or peek over the Guusto banner.
