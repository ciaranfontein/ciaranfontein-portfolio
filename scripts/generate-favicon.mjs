// Generates favicon.ico (multi-size) + favicon.svg + apple-touch-icon.png from
// initials "CF" on a dark rounded square, consistent with the site's dark navy palette.
// Run: node scripts/generate-favicon.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import pngToIco from "png-to-ico";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");

function svgIcon(size) {
  const r = size * 0.22;
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${r}" fill="#0f172a" />
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="Segoe UI, Helvetica, Arial, sans-serif" font-weight="700"
    font-size="${size * 0.5}" fill="#38bdf8">CF</text>
</svg>`;
}

async function main() {
  // Source SVG (crisp at any size, used directly by modern browsers)
  await writeFile(path.join(PUBLIC, "favicon.svg"), svgIcon(64).trim());

  // PNG renders for the .ico + apple-touch-icon
  const sizes = [16, 32, 48];
  const buffers = await Promise.all(
    sizes.map((s) => sharp(Buffer.from(svgIcon(s))).png().toBuffer())
  );
  const icoBuffer = await pngToIco(buffers);
  await writeFile(path.join(PUBLIC, "favicon.ico"), icoBuffer);

  await sharp(Buffer.from(svgIcon(180)))
    .png()
    .toFile(path.join(PUBLIC, "apple-touch-icon.png"));

  console.log("wrote favicon.svg, favicon.ico, apple-touch-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
