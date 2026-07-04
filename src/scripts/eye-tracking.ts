// Vanilla TS port of the original Body/index.js eye-tracking easter egg.
// Same math as the source: for each eye, atan2(dy, dx) from the eye's DOM
// center to the pointer, then offset the pupil along that angle by a small,
// per-eye magnitude (an elliptical range of motion, not a full transform).
//
// Differences from the CRA original:
//   - No @react-hook/mouse-position dependency — plain mousemove listener.
//   - Touch devices: pupils track the touch point while touching, and gently
//     idle-wander (slow sinusoidal drift) when idle, since there's no
//     persistent hover position to read.
//   - prefers-reduced-motion: animation is skipped entirely; pupils stay
//     centered (the CSS still applies rest position, no JS movement).

const MAG_LEFT = 1.8;
const MAG_RIGHT = 2.5;
const MAG_X = 1.85;
const MAG_Y = 1;

// Base rest offsets (from the original component's static `left`/`bottom`
// values), expressed as pixel deltas layered on top of the CSS percentage
// base position via a translate — keeps the elliptical motion identical
// while the base position stays responsive/percentage-based.
const PIXEL_SCALE_X = 1333; // source image width the original px offsets were tuned to
const PIXEL_SCALE_Y = 2000; // source image height

function init() {
  const root = document.getElementById("eye-tracker");
  const stage = root?.querySelector<HTMLDivElement>(".eye-tracker__stage");
  const leftPupil = document.getElementById("pupil-left");
  const rightPupil = document.getElementById("pupil-right");
  const leftCenter = document.getElementById("center-left");
  const rightCenter = document.getElementById("center-right");

  if (!root || !stage || !leftPupil || !rightPupil || !leftCenter || !rightCenter) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    // Leave pupils at their CSS rest position — no animation, no listeners.
    return;
  }

  const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  let pointer: { x: number; y: number } | null = null;
  let idleAngle = 0;
  let rafId = 0;

  function currentScale() {
    // Scale factor between the live rendered image size and the 1333x2000
    // reference frame the magnitudes were tuned against, so the motion feels
    // consistent regardless of the responsive image's rendered size.
    const rect = stage!.getBoundingClientRect();
    return rect.width / PIXEL_SCALE_X;
  }

  function applyPupilOffset(el: HTMLElement, angle: number, mag: number, scale: number) {
    const dx = Math.cos(angle) * mag * MAG_X * 10 * scale;
    const dy = Math.sin(angle) * mag * MAG_Y * 10 * scale;
    el.style.transform = `translate(${dx.toFixed(2)}px, ${(-dy).toFixed(2)}px)`;
  }

  function update() {
    const scale = currentScale();

    let target = pointer;
    if (!target) {
      // Idle wander: slow circular drift so the easter egg still feels alive
      // when nobody's hovering (mirrors "idle-wander subtly" requirement).
      idleAngle += 0.006;
      const centerRect = leftCenter!.getBoundingClientRect();
      target = {
        x: centerRect.left + Math.cos(idleAngle) * 40,
        y: centerRect.top + Math.sin(idleAngle * 0.7) * 20,
      };
    }

    const leftRect = leftCenter!.getBoundingClientRect();
    const rightRect = rightCenter!.getBoundingClientRect();
    const leftPos = { x: leftRect.left, y: leftRect.top };
    const rightPos = { x: rightRect.left, y: rightRect.top };

    const leftDiff = { x: target.x - leftPos.x, y: target.y - leftPos.y };
    const rightDiff = { x: target.x - rightPos.x, y: target.y - rightPos.y };

    const leftAngle = Math.atan2(leftDiff.y, leftDiff.x);
    const rightAngle = Math.atan2(rightDiff.y, rightDiff.x);

    applyPupilOffset(leftPupil!, leftAngle, MAG_LEFT, scale);
    applyPupilOffset(rightPupil!, rightAngle, MAG_RIGHT, scale);

    rafId = requestAnimationFrame(update);
  }

  function handlePointerMove(clientX: number, clientY: number) {
    pointer = { x: clientX, y: clientY };
  }

  window.addEventListener(
    "mousemove",
    (e) => handlePointerMove(e.clientX, e.clientY),
    { passive: true }
  );

  if (isTouchDevice) {
    window.addEventListener(
      "touchmove",
      (e) => {
        const touch = e.touches[0];
        if (touch) handlePointerMove(touch.clientX, touch.clientY);
      },
      { passive: true }
    );
    window.addEventListener(
      "touchstart",
      (e) => {
        const touch = e.touches[0];
        if (touch) handlePointerMove(touch.clientX, touch.clientY);
      },
      { passive: true }
    );
    // Return to idle-wander shortly after the touch ends.
    window.addEventListener(
      "touchend",
      () => {
        setTimeout(() => {
          pointer = null;
        }, 1500);
      },
      { passive: true }
    );
  }

  rafId = requestAnimationFrame(update);

  // Clean up on page navigation (Astro view transitions / bfcache safety).
  window.addEventListener("pagehide", () => cancelAnimationFrame(rafId));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
