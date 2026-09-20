/**
 * TARO NAVIGATOR — Dark Luxury Gold Cosmic Background
 * Upgraded Celestial Engine:
 * - Rich, warm golden nebulae with deep mystical contrast
 * - High-visibility stars: hero diamond sparkles, medium glowing stars, fine stardust
 * - Astrological constellation lines bridging prominent stars
 * - Periodic golden shooting stars (meteors) with luminous trails
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
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // 3. Color Palette Constants (Dark Luxury Gold & Light Royal Parchment)
  const GOLD_COLORS = [
    { r: 201, g: 169, b: 110, name: 'warmGold' },    // Warm Gold #c9a96e
    { r: 244, g: 208, b: 132, name: 'brightGold' },  // Bright Radiant Gold #f4d084
    { r: 232, g: 220, b: 200, name: 'cream' },       // Starlight Cream #e8dcc8
    { r: 255, g: 248, b: 232, name: 'whiteGold' },   // Luminous Core #fff8e8
    { r: 220, g: 175, b: 95,  name: 'amberGold' }    // Deep Amber #dcaf5f
  ];

  const LIGHT_STAR_COLORS = [
    { r: 140, g: 105, b: 35 },   // Antique Bronze #8c6923
    { r: 166, g: 125, b: 48 },   // Rich Gold #a67d30
    { r: 184, g: 134, b: 11 },   // Dark Goldenrod #b8860b
    { r: 120, g: 85,  b: 25 },   // Deep Ochre #785519
    { r: 155, g: 110, b: 40 }    // Warm Amber #9b6e28
  ];

  const nebulaeDark = [
    { xRatio: 0.18, yRatio: 0.25, radiusRatio: 0.52, color: 'rgba(226, 190, 121, 0.15)', speedX: 0.00005, speedY: 0.00003 },
    { xRatio: 0.82, yRatio: 0.68, radiusRatio: 0.58, color: 'rgba(200, 145, 65, 0.12)',   speedX: -0.00004, speedY: 0.00004 },
    { xRatio: 0.50, yRatio: 0.45, radiusRatio: 0.65, color: 'rgba(242, 198, 125, 0.11)', speedX: 0.00003, speedY: -0.00003 },
    { xRatio: 0.75, yRatio: 0.20, radiusRatio: 0.45, color: 'rgba(52, 32, 75, 0.16)',    speedX: -0.00003, speedY: 0.00002 },
    { xRatio: 0.30, yRatio: 0.80, radiusRatio: 0.50, color: 'rgba(180, 120, 45, 0.10)',  speedX: 0.00004, speedY: -0.00002 }
  ];

  const nebulaeLight = [
    { xRatio: 0.18, yRatio: 0.25, radiusRatio: 0.52, color: 'rgba(201, 169, 110, 0.08)', speedX: 0.00005, speedY: 0.00003 },
    { xRatio: 0.82, yRatio: 0.68, radiusRatio: 0.58, color: 'rgba(180, 130, 60, 0.06)',   speedX: -0.00004, speedY: 0.00004 },
    { xRatio: 0.50, yRatio: 0.45, radiusRatio: 0.65, color: 'rgba(215, 175, 105, 0.06)', speedX: 0.00003, speedY: -0.00003 },
    { xRatio: 0.75, yRatio: 0.20, radiusRatio: 0.45, color: 'rgba(170, 140, 90, 0.05)',  speedX: -0.00003, speedY: 0.00002 },
    { xRatio: 0.30, yRatio: 0.80, radiusRatio: 0.50, color: 'rgba(160, 115, 50, 0.05)',  speedX: 0.00004, speedY: -0.00002 }
  ];

  // 4. Generate Procedural Stars (3 Tiers: Hero, Mid, Dust)
  const STAR_COUNT = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 3600), 320);
  const stars = [];

  for (let i = 0; i < STAR_COUNT; i++) {
    const colorObj = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];
    const roll = Math.random();
    
    let tier = 'dust';
    let baseSize = 0.9 + Math.random() * 0.8; // 0.9 to 1.7px
    let hasFlare = false;
    let has8Points = false;

    if (roll < 0.14) {
      tier = 'hero';
      baseSize = 2.8 + Math.random() * 1.8; // 2.8 to 4.6px
      hasFlare = true;
      has8Points = Math.random() < 0.35;
    } else if (roll < 0.42) {
      tier = 'mid';
      baseSize = 1.6 + Math.random() * 1.1; // 1.6 to 2.7px
    }

    stars.push({
      x: (Math.random() - 0.5) * 1.9,
      y: (Math.random() - 0.5) * 1.9,
      z: 0.7 + Math.random() * 2.2, // Depth 0.7 to 2.9
      baseSize: baseSize,
      color: colorObj,
      tier: tier,
      hasFlare: hasFlare,
      has8Points: has8Points,
      twinkleSpeed: 0.8 + Math.random() * 2.0,
      twinklePhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.25,
      // Projected coords for constellation lookup
      sx: 0,
      sy: 0,
      alpha: 0
    });
  }

  // 5. Active Nebulae Reference
  const nebulae = nebulaeDark;

  // 6. Draw Multi-Point Golden Diamond Lens Flare
  function drawDiamondSparkle(ctx, cx, cy, radius, rgbStr, opacity, rotation, is8Points) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.fillStyle = rgbStr;
    ctx.globalAlpha = opacity;

    const flareLen = Math.min(radius * 4.2, 16.0);
    const flareThickness = radius * 0.32;

    // Primary 4-point diamond cross
    ctx.beginPath();
    ctx.moveTo(-flareLen, 0);
    ctx.quadraticCurveTo(0, flareThickness, flareLen, 0);
    ctx.quadraticCurveTo(0, -flareThickness, -flareLen, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -flareLen);
    ctx.quadraticCurveTo(flareThickness, 0, 0, flareLen);
    ctx.quadraticCurveTo(-flareThickness, 0, 0, -flareLen);
    ctx.fill();

    // Optional 45-degree diagonal rays (8-point star)
    if (is8Points) {
      const diagLen = flareLen * 0.55;
      const diagThick = flareThickness * 0.7;

      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(-diagLen, 0);
      ctx.quadraticCurveTo(0, diagThick, diagLen, 0);
      ctx.quadraticCurveTo(0, -diagThick, -diagLen, 0);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, -diagLen);
      ctx.quadraticCurveTo(diagThick, 0, 0, diagLen);
      ctx.quadraticCurveTo(-diagThick, 0, 0, -diagLen);
      ctx.fill();
    }

    ctx.restore();
  }

  // 7. Golden Shooting Stars (Meteors)
  const meteors = [];
  let nextMeteorTime = 3.0; // first meteor in 3 seconds

  function spawnMeteor(now) {
    const startX = Math.random() * (width * 0.8) + (width * 0.1);
    const startY = Math.random() * (height * 0.4);
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3; // ~45 degrees diagonal
    const speed = 750 + Math.random() * 450; // px/sec
    const length = 140 + Math.random() * 90;
    const duration = 0.7 + Math.random() * 0.5;

    meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: length,
      duration: duration,
      age: 0,
      createdAt: now
    });
  }

  // 8. Animation Loop
  let lastTime = performance.now();

  function render(currentTime) {
    const delta = Math.min((currentTime - lastTime) * 0.001, 0.1);
    lastTime = currentTime;
    const t = currentTime * 0.001;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    // Clear with theme-adaptive base
    // Dark: Soft refined obsidian (#1a1a21) instead of pitch-black
    // Light: Warm royal parchment (#f6f4ee)
    ctx.fillStyle = isLight ? '#f6f4ee' : '#1a1a21';
    ctx.fillRect(0, 0, width, height);

    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const maxDimension = Math.max(width, height);

    const currentNebulae = isLight ? nebulaeLight : nebulaeDark;

    // A. Render Drifting Golden Nebulae
    for (let i = 0; i < currentNebulae.length; i++) {
      const neb = currentNebulae[i];
      neb.xRatio += neb.speedX;
      neb.yRatio += neb.speedY;

      if (neb.xRatio < -0.2) neb.xRatio = 1.2;
      if (neb.xRatio > 1.2) neb.xRatio = -0.2;
      if (neb.yRatio < -0.2) neb.yRatio = 1.2;
      if (neb.yRatio > 1.2) neb.yRatio = -0.2;

      const nx = neb.xRatio * width;
      const ny = neb.yRatio * height;
      const nr = neb.radiusRatio * maxDimension * (1 + Math.sin(t * 0.4 + i) * 0.08);

      const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      grad.addColorStop(0, neb.color);
      grad.addColorStop(0.55, neb.color.replace(/[\d\.]+\)$/, '0.02)'));
      grad.addColorStop(1, isLight ? 'rgba(246, 244, 238, 0)' : 'rgba(26, 26, 33, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.fill();
    }

    // B. Subtle Cosmic Breathing Cycle
    const globalZoom = 1 + Math.sin(t * 0.35) * 0.08;
    const globalPulseGlow = 0.9 + Math.cos(t * 0.5) * 0.15;

    // C. Project & Draw Stars
    const visibleHeroes = [];
    const activePalette = isLight ? LIGHT_STAR_COLORS : GOLD_COLORS;

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];

      const currentZ = Math.max(0.65, star.z + Math.sin(t * 0.45 + star.twinklePhase) * 0.16);
      const depthScale = globalZoom / currentZ;

      const sx = centerX + star.x * centerX * depthScale;
      const sy = centerY + star.y * centerY * depthScale;

      star.sx = sx;
      star.sy = sy;

      if (sx < -30 || sx > width + 30 || sy < -30 || sy > height + 30) {
        star.alpha = 0;
        continue;
      }

      const twinkle = 0.4 + 0.6 * Math.sin(t * star.twinkleSpeed + star.twinklePhase);
      const alpha = Math.min(0.92, (1.15 / (currentZ * 1.05)) * twinkle * globalPulseGlow);
      star.alpha = alpha;

      // Base radius calculation
      const renderRadius = Math.max(0.6, (star.baseSize / currentZ) * globalZoom);
      const col = activePalette[i % activePalette.length];
      const { r, g, b } = col;
      const rgbStr = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
      const haloStr = isLight
        ? `rgba(${r}, ${g}, ${b}, ${(alpha * 0.2).toFixed(3)})`
        : `rgba(${r}, ${g}, ${b}, ${(alpha * 0.28).toFixed(3)})`;
      const coreStr = isLight
        ? `rgba(100, 70, 20, ${(alpha * 0.95).toFixed(3)})`
        : `rgba(255, 252, 240, ${(alpha * 0.95).toFixed(3)})`;

      // 1. Soft Warm Halo Glow (mid and hero tiers)
      if (star.tier === 'hero' || star.tier === 'mid') {
        ctx.fillStyle = haloStr;
        ctx.beginPath();
        ctx.arc(sx, sy, renderRadius * (star.tier === 'hero' ? 2.8 : 2.0), 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Star Body
      ctx.fillStyle = rgbStr;
      ctx.beginPath();
      ctx.arc(sx, sy, renderRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Center Core for hero stars
      if (star.tier === 'hero') {
        ctx.fillStyle = coreStr;
        ctx.beginPath();
        ctx.arc(sx, sy, renderRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Hero Diamond Lens Flare
      if (star.hasFlare && alpha > 0.38) {
        star.rotation += star.rotSpeed * delta;
        drawDiamondSparkle(ctx, sx, sy, renderRadius, rgbStr, alpha * 0.85, star.rotation, star.has8Points);
      }

      if ((star.tier === 'hero' || star.tier === 'mid') && alpha > 0.4) {
        visibleHeroes.push(star);
      }
    }

    // D. Delicate Constellation Lines (Connecting nearby prominent stars)
    const maxLinkDist = 135;
    ctx.lineWidth = 0.8;

    for (let i = 0; i < visibleHeroes.length; i++) {
      const s1 = visibleHeroes[i];
      let linksCount = 0;

      for (let j = i + 1; j < visibleHeroes.length; j++) {
        const s2 = visibleHeroes[j];
        const dx = s1.sx - s2.sx;
        const dy = s1.sy - s2.sy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxLinkDist) {
          const proximityFade = 1 - (dist / maxLinkDist);
          const lineAlpha = proximityFade * Math.min(s1.alpha, s2.alpha) * 0.22 * (0.6 + 0.4 * Math.sin(t * 0.8 + i + j));

          if (lineAlpha > 0.02) {
            ctx.strokeStyle = isLight
              ? `rgba(140, 105, 35, ${(lineAlpha * 0.85).toFixed(3)})`
              : `rgba(201, 169, 110, ${lineAlpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(s1.sx, s1.sy);
            ctx.lineTo(s2.sx, s2.sy);
            ctx.stroke();

            linksCount++;
            if (linksCount >= 2) break; // Limit 2 links per star
          }
        }
      }
    }

    // E. Golden Meteors (Shooting Stars)
    if (t > nextMeteorTime) {
      spawnMeteor(t);
      nextMeteorTime = t + 8.0 + Math.random() * 7.0; // next meteor in 8-15 sec
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.age += delta;

      if (m.age >= m.duration) {
        meteors.splice(i, 1);
        continue;
      }

      m.x += m.vx * delta;
      m.y += m.vy * delta;

      const progress = m.age / m.duration;
      // Fade in quickly, fade out smoothly
      const meteorAlpha = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;

      const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.length;
      const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.length;

      const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
      if (isLight) {
        grad.addColorStop(0, 'rgba(166, 125, 48, 0)');
        grad.addColorStop(0.65, `rgba(166, 125, 48, ${(meteorAlpha * 0.4).toFixed(3)})`);
        grad.addColorStop(1, `rgba(120, 85, 25, ${(meteorAlpha * 0.85).toFixed(3)})`);
        ctx.fillStyle = `rgba(120, 85, 25, ${(meteorAlpha * 0.9).toFixed(3)})`;
      } else {
        grad.addColorStop(0, 'rgba(201, 169, 110, 0)');
        grad.addColorStop(0.65, `rgba(201, 169, 110, ${(meteorAlpha * 0.35).toFixed(3)})`);
        grad.addColorStop(1, `rgba(255, 248, 220, ${(meteorAlpha * 0.85).toFixed(3)})`);
        ctx.fillStyle = `rgba(255, 248, 225, ${(meteorAlpha * 0.9).toFixed(3)})`;
      }

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      // Glowing meteor head
      ctx.beginPath();
      ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
