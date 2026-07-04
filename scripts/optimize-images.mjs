// One-off image optimization script: converts source Guusto screenshots + headshot
// into web-sized webp assets under public/images/. Run with: node scripts/optimize-images.mjs
// Originals are kept untouched in assets-original/ and src/assets/ (eye-tracking source).
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets-original");
const OUT_GUUSTO = path.join(ROOT, "public", "images", "guusto");
const OUT_IMAGES = path.join(ROOT, "public", "images");

const SCREENSHOT_HEIGHT = 800;

async function main() {
  await mkdir(OUT_GUUSTO, { recursive: true });
  await mkdir(OUT_IMAGES, { recursive: true });

  const screenshots = [1, 2, 3, 4, 5, 6, 7];
  for (const n of screenshots) {
    const num = String(n).padStart(2, "0");
    const inPath = path.join(SRC, `guusto_screenshot_appstore_${num}.png`);
    const outPath = path.join(OUT_GUUSTO, `screenshot-${num}.webp`);
    await sharp(inPath)
      .resize({ height: SCREENSHOT_HEIGHT })
      .webp({ quality: 82 })
      .toFile(outPath);
    console.log("wrote", outPath);
  }

  // App icon - keep square, modest size for logo strip use
  await sharp(path.join(SRC, "guusto_appicon_appstore.png"))
    .resize({ width: 256, height: 256 })
    .webp({ quality: 90 })
    .toFile(path.join(OUT_GUUSTO, "app-icon.webp"));
  console.log("wrote app-icon.webp");

  // Headshot: web-sized webp for the hero (base "no eyes" image is handled separately
  // via src/assets/CiaranNoEyes.png for the eye-tracking island — this is a fallback/poster
  // only used if needed elsewhere. Kept at a sensible max width for hero display.
  await sharp(path.join(SRC, "headshot_2022.jpg"))
    .resize({ width: 900 })
    .webp({ quality: 85 })
    .toFile(path.join(OUT_IMAGES, "headshot.webp"));
  console.log("wrote headshot.webp");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
