/**
 * TARO NAVIGATOR — Dark Luxury Gold Cosmic Background
 * High-performance 2D Canvas Starfield & Nebula Engine
 * Features: Elegant, non-blinding 3D star pulsation,
 * warm brown-gold nebula fog, and 4-point golden lens flares.
 */

(function () {
  'use strict';

  // 1. Ensure Canvas Exists
  let canvas = document.getElementById('space');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'space';
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;

  // 2. Resize & DPR Setup
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // 3. Color Palette Constants (Dark Luxury Gold)
  const GOLD_COLORS = [
    { r: 201, g: 169, b: 110 }, // Warm Gold #c9a96e
    { r: 232, g: 220, b: 200 }, // Cream #e8dcc8
    { r: 244, g: 208, b: 132 }, // Bright Gold #f4d084
    { r: 180, g: 140, b: 80 },  // Deep Amber Gold #b48c50
    { r: 255, g: 248, b: 230 }  // Radiant White Gold #fff8e6
  ];

  // 4. Generate Procedural Stars
  const STAR_COUNT = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 3200), 380);
  const stars = [];

  for (let i = 0; i < STAR_COUNT; i++) {
    const colorObj = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];
    const isFlare = Math.random() < 0.07; // ~7% of stars have subtle 4-point lens flares
    stars.push({
      x: (Math.random() - 0.5) * 1.8,
      y: (Math.random() - 0.5) * 1.8,
      z: 0.8 + Math.random() * 2.5,   // Safe depth range z (0.8 to 3.3)
      baseSize: isFlare ? 1.2 + Math.random() * 0.8 : 0.4 + Math.random() * 0.9,
      color: colorObj,
      twinkleSpeed: 0.6 + Math.random() * 1.8,
      twinklePhase: Math.random() * Math.PI * 2,
      flare: isFlare
    });
  }

  // 5. Nebula Cloud Nodes (Warm Gold & Bronze-Amber Drifting Fog)
  const nebulae = [
    { xRatio: 0.2, yRatio: 0.3, radiusRatio: 0.45, color: 'rgba(201, 169, 110, 0.055)', speedX: 0.00006, speedY: 0.00004 },
    { xRatio: 0.8, yRatio: 0.7, radiusRatio: 0.5,  color: 'rgba(139, 85, 30, 0.045)',   speedX: -0.00005, speedY: 0.00005 },
    { xRatio: 0.5, yRatio: 0.5, radiusRatio: 0.6,  color: 'rgba(180, 130, 60, 0.035)',  speedX: 0.00003, speedY: -0.00004 }
  ];

  // 6. Draw 4-Point Golden Lens Flare
  function drawSparkle(ctx, cx, cy, radius, rgbStr, opacity) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = rgbStr;
    ctx.globalAlpha = opacity;

    const flareLen = Math.min(radius * 3.2, 8.0);
    const flareThickness = radius * 0.3;

    // Horizontal ray
    ctx.beginPath();
    ctx.moveTo(-flareLen, 0);
    ctx.quadraticCurveTo(0, flareThickness, flareLen, 0);
    ctx.quadraticCurveTo(0, -flareThickness, -flareLen, 0);
    ctx.fill();

    // Vertical ray
    ctx.beginPath();
    ctx.moveTo(0, -flareLen);
    ctx.quadraticCurveTo(flareThickness, 0, 0, flareLen);
    ctx.quadraticCurveTo(-flareThickness, 0, 0, -flareLen);
    ctx.fill();

    ctx.restore();
  }

  // 7. Animation Loop
  let lastTime = performance.now();

  function render(currentTime) {
    const delta = (currentTime - lastTime) * 0.001;
    lastTime = currentTime;
    const t = currentTime * 0.001;

    // Clear with dark charcoal background base
    ctx.fillStyle = '#101013';
    ctx.fillRect(0, 0, width, height);

    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const maxDimension = Math.max(width, height);

    // A. Render Drifting Brown-Gold Nebulae
    for (let i = 0; i < nebulae.length; i++) {
      const neb = nebulae[i];
      neb.xRatio += neb.speedX;
      neb.yRatio += neb.speedY;

      if (neb.xRatio < -0.2) neb.xRatio = 1.2;
      if (neb.xRatio > 1.2) neb.xRatio = -0.2;
      if (neb.yRatio < -0.2) neb.yRatio = 1.2;
      if (neb.yRatio > 1.2) neb.yRatio = -0.2;

      const nx = neb.xRatio * width;
      const ny = neb.yRatio * height;
      const nr = neb.radiusRatio * maxDimension;

      const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      grad.addColorStop(0, neb.color);
      grad.addColorStop(0.6, neb.color.replace(/[\d\.]+\)$/, '0.01)'));
      grad.addColorStop(1, 'rgba(16, 16, 19, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.fill();
    }

    // B. Subtle Pulsing Cycle (Gentle Zoom In & Out Motion, No Blinding)
    const globalZoom = 1 + Math.sin(t * 0.5) * 0.12;
    const globalPulseGlow = 0.8 + Math.cos(t * 0.7) * 0.15;

    // C. Render Stars with Controlled Size & Opacity
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];

      // Safe depth oscillation (min z = 0.65 to prevent close-up blinding)
      const currentZ = Math.max(0.65, star.z + Math.sin(t * 0.5 + star.twinklePhase) * 0.18);
      const depthScale = globalZoom / currentZ;

      const sx = centerX + star.x * centerX * depthScale;
      const sy = centerY + star.y * centerY * depthScale;

      if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) {
        continue;
      }

      const twinkle = 0.4 + 0.6 * Math.sin(t * star.twinkleSpeed + star.twinklePhase);
      const alpha = Math.min(0.75, (1 / (currentZ * 1.1)) * twinkle * globalPulseGlow);

      // Strictly cap radius at 2.8px to eliminate blinding circles
      const renderRadius = Math.min(2.8, Math.max(0.4, (star.baseSize / currentZ) * globalZoom));
      const { r, g, b } = star.color;
      const rgbStr = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
      const glowStr = `rgba(${r}, ${g}, ${b}, ${(alpha * 0.25).toFixed(3)})`;

      // Soft Glow
      if (renderRadius > 1.0) {
        ctx.fillStyle = glowStr;
        ctx.beginPath();
        ctx.arc(sx, sy, renderRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Star Core
      ctx.fillStyle = rgbStr;
      ctx.beginPath();
      ctx.arc(sx, sy, renderRadius, 0, Math.PI * 2);
      ctx.fill();

      // Delicate 4-point flare
      if (star.flare && renderRadius > 1.2 && alpha > 0.45) {
        drawSparkle(ctx, sx, sy, renderRadius, rgbStr, alpha * 0.7);
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();