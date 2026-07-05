// Generates a static 1200x630 OG card at public/images/og-card.png.
// Simple typographic card — name, tagline, availability line. Run:
//   node scripts/generate-og-image.mjs
import sharp from "sharp";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "images", "og-card.png");

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
  <circle cx="1080" cy="80" r="220" fill="#38bdf8" opacity="0.08" />
  <circle cx="120" cy="560" r="180" fill="#38bdf8" opacity="0.06" />
  <text x="80" y="230" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="72" font-weight="700" fill="#f8fafc">Ciaran Fontein</text>
  <text x="80" y="300" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="36" font-weight="500" fill="#38bdf8">Senior React Native Engineer</text>
  <text x="80" y="380" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="28" fill="#cbd5e1">I build mobile apps from Figma to the App Store.</text>
  <text x="80" y="425" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="28" fill="#cbd5e1">6 years shipping Guusto's iOS + Android app.</text>
  <text x="80" y="520" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" fill="#94a3b8">Nara, Japan · Remote or Osaka</text>
  <text x="80" y="560" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" fill="#94a3b8">ciaranfontein.com</text>
</svg>
`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log("wrote", OUT);
