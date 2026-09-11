import { chromium } from "file:///C:/Users/Ciaran/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const browser = await chromium.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});

try {
  const desktop = await browser.newPage({ viewport: { width: 1506, height: 1045 }, deviceScaleFactor: 1 });
  await desktop.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await desktop.screenshot({ path: ".impeccable/review/hero-repro.png" });
  await desktop.screenshot({ path: ".impeccable/review/desktop-full.png", fullPage: true });

  await desktop.setViewportSize({ width: 1440, height: 1000 });
  await desktop.screenshot({ path: ".impeccable/review/desktop.png", fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await mobile.screenshot({ path: ".impeccable/review/mobile-top.png" });
  await mobile.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    window.scrollTo(0, 0);
  });
  await mobile.screenshot({ path: ".impeccable/review/mobile-full.png", fullPage: true });
  await mobile.screenshot({ path: ".impeccable/review/mobile.png", fullPage: true });

  console.log(JSON.stringify({
    desktop: await desktop.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight })),
    mobile: await mobile.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight })),
  }));
} finally {
  await browser.close();
}
