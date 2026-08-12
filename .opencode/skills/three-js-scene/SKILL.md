---
name: three-js-scene
description: Use when editing the Three.js cosmic scene in web/js/space.js (3D moon, starfield, meteors, nebulas, rings, camera, lights) or adding any new 3D element to the TARO background.
---

# Three.js scene

- File: `web/js/space.js` — an IIFE pinned to `#space` canvas. Three.js r160 is loaded from CDN (`three@0.160.0`, global `THREE`).
- **No external textures/assets.** All textures are procedural `<canvas>` → `CanvasTexture` (see `moonTexture()`). Keep this rule — the site must work offline.
- Scene construction order in the file: stars (shader Points), static nebula sprites (additive blending), moon group (sphere + 2 torus rings + wireframe net + glow sprite), meteors (Line segments), lights (ambient + key directional + cyan rim).
- `layout()` recomputes moon placement by viewport width on resize. `scrollFade` (scroll listener, 0..1) dims and shrinks the moon so it never collides with section content while scrolling.
- Debug handle: `window.__taroScene` exposes `{ width, height, scrollFade, moon:{x,y,z,s}, camZ, aspect }` every frame — used by `tools/browser-check/check.cjs` to assert responsive behavior. Keep it updated when touching the scene.
- FPS-conscious: reuse geometries/materials, avoid recompiling shaders per frame, cap `setPixelRatio` at 2. Meteors fade via `sin(π·life)`.
- Camera: fov 55, base z moved per breakpoint (`camZ`), subtle mouse parallax (lerped, tiny: `*0.5` x / `*0.35` y).
- If adding a new mesh that should scroll-dim like the moon, multiply its opacity by `scrollFade` in `animate()`.

## Verify after edits

Serve `web/`, launch `node tools/browser-check/check.cjs` from the repo root, expect 11/11. The moon-position and scrollFade assertions cover the collision bug class.