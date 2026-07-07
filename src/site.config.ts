// Central site configuration — single source of truth for text that changes
// on a schedule or is reused across components.

/**
 * Availability badge shown in the hero.
 *
 * FLIP THIS ON AUG 1, 2026: change to "🟢 Open to work" (see plan.md Phase 4).
 * This is the ONLY place this string lives — every component imports it from here.
 */
export const AVAILABILITY_BADGE = "Available August 2026";

export const SITE = {
  name: "Ciaran Fontein",
  title: "Ciaran Fontein — Senior React Native Engineer",
  description:
    "Senior React Native Engineer. I build mobile apps from Figma to the App Store. 6 years shipping Guusto's iOS + Android app as its sole frontend developer.",
  url: "https://ciaranfontein.com",
  locale: "en",
  email: "ciaranfontein@gmail.com",
  github: "https://github.com/ciaranfontein",
  githubHandle: "github.com/ciaranfontein",
  linkedin: "https://www.linkedin.com/in/ciaranfontein",
  linkedinHandle: "linkedin.com/in/ciaranfontein",
  location: "Nara, Japan · Remote or Osaka",
  visaNote: "No visa sponsorship required",
} as const;

// Each document offers every format that exists in public/resume/.
export const RESUME_FILES = [
  {
    label: "CV",
    sublabel: "English",
    lang: "en",
    formats: [
      { ext: "PDF", href: "/resume/ciaran_fontein_cv.pdf" },
      { ext: "DOCX", href: "/resume/ciaran_fontein_cv.docx" },
    ],
  },
  {
    label: "履歴書",
    sublabel: "Rirekisho",
    lang: "ja",
    formats: [
      { ext: "PDF", href: "/resume/rirekisho.pdf" },
      { ext: "DOCX", href: "/resume/rirekisho.docx" },
    ],
  },
  {
    label: "職務経歴書",
    sublabel: "Shokumu keirekisho",
    lang: "ja",
    formats: [
      { ext: "PDF", href: "/resume/shokumu_keirekisho.pdf" },
      { ext: "DOCX", href: "/resume/shokumu_keirekisho.docx" },
    ],
  },
] as const;
