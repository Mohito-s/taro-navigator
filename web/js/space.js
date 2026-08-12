(function () {
  const canvas = document.getElementById("space");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 10);

  const mouse = { x: 0, y: 0 };

  function makeStars(count, radius) {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.6 + Math.random() * 0.4);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 0.4 + Math.random() * 1.3;
      const warm = Math.random();
      const c = new THREE.Color().setHSL(0.55 + warm * 0.18, 0.6, 0.62 + Math.random() * 0.3);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float aSize;
        attribute vec3 aColor;
        uniform float uTime;
        varying float vTw;
        varying vec3 vColor;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vTw = 0.55 + 0.45 * sin(uTime * (1.0 + aSize) + position.x * 40.0 + position.y * 30.0);
          gl_PointSize = aSize * (3.0 / -mv.z) * vTw;
          gl_Position = projectionMatrix * mv;
          vColor = aColor;
        }
      `,
      fragmentShader: `
        varying float vTw;
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          float a = smoothstep(0.5, 0.0, d) * vTw;
          gl_FragColor = vec4(vColor, a);
        }
      `,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);
    return { points, mat };
  }

  function radialTexture(rgb, stops) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, rgb);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  function makeGlow(color, scale, pos, opacity) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: radialTexture(color, 0.7),
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    sprite.scale.set(scale, scale, 1);
    sprite.position.copy(pos);
    scene.add(sprite);
    return sprite;
  }

  scene.add(new THREE.AmbientLight(0x334, 0.85));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(5, 6, 3);
  scene.add(sun);
  const rim = new THREE.PointLight(0x54f1ff, 1.6, 30);
  rim.position.set(-6, 2, 5);
  scene.add(rim);

  function moonTexture() {
    const size = 512;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#8d93a4";
    ctx.fillRect(0, 0, size, size);

    const base = [
      [0.1, 0.16, 0.22, 0.34],
      [0.42, 0.2, 0.36, 0.52],
      [0.7, 0.5, 0.3, 0.46],
      [0.24, 0.62, 0.26, 0.4],
      [0.58, 0.78, 0.2, 0.32],
      [0.82, 0.2, 0.18, 0.3],
    ];
    for (const [x, y, rx, ry] of base) {
      const g = ctx.createRadialGradient(x * size, y * size, 2, x * size, y * size, (rx * size) / 2);
      g.addColorStop(0, "rgba(120,125,142,0.55)");
      g.addColorStop(0.55, "rgba(96,100,118,0.35)");
      g.addColorStop(1, "rgba(96,100,118,0)");
      ctx.fillStyle = g;
      ctx.fillRect((x - rx / 2) * size, (y - ry / 2) * size, rx * size, ry * size);
    }

    for (let i = 0; i < 4600; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 1 + Math.random() * 6;
      const shade = 26 + Math.random() * 74;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${128 + shade * 0.18}, ${131 + shade * 0.18}, ${146 + shade * 0.25}, ${
        0.1 + Math.random() * 0.3
      })`;
      ctx.fill();
    }
    for (let i = 0; i < 110; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 12 + Math.random() * 30;
      const g = ctx.createRadialGradient(x, y, 1, x, y, r);
      const dark = 64 + Math.random() * 64;
      g.addColorStop(0, `rgba(${dark}, ${dark}, ${dark + 16}, 0.72)`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
    for (let i = 0; i < 160; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 1.5 + Math.random() * 5;
      const g = ctx.createRadialGradient(x, y, 0.5, x, y, r);
      g.addColorStop(0, "rgba(224,229,240,0.9)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
    return new THREE.CanvasTexture(c);
  }

  const moonGroup = new THREE.Group();

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshStandardMaterial({ map: moonTexture(), roughness: 1, metalness: 0 })
  );
  moonGroup.add(moon);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.032, 14, 140),
    new THREE.MeshBasicMaterial({ color: 0x54f1ff, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending })
  );
  ring.rotation.set(0.42, 0, -0.3);
  moonGroup.add(ring);

  const ringWide = new THREE.Mesh(
    new THREE.TorusGeometry(1.82, 0.014, 10, 140),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending })
  );
  ringWide.rotation.set(0.42, 0, -0.3);
  moonGroup.add(ringWide);

  const net = new THREE.Mesh(
    new THREE.SphereGeometry(1.24, 18, 18),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.16 })
  );
  moonGroup.add(net);

  const glow = makeGlow("rgba(84,152,255,0.85)", 7, new THREE.Vector3(0, 0, -0.6), 0.5);
  scene.add(moonGroup);

  makeGlow("rgba(139,92,246,0.5)", 26, new THREE.Vector3(-14, 6, -40), 0.55);
  makeGlow("rgba(255,95,178,0.42)", 22, new THREE.Vector3(16, -8, -42), 0.45);
  makeGlow("rgba(84,241,255,0.4)", 18, new THREE.Vector3(0, 10, -44), 0.4);

  const stars = makeStars(2400, 30);

  const METEO_COUNT = 5;
  const meteors = [];
  for (let i = 0; i < METEO_COUNT; i++) {
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(6);
    arr.fill(0);
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0xbcd6ff, transparent: true, opacity: 0 });
    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    scene.add(line);
    meteors.push({ line, mat, arr, t: Math.random() });
  }
  function respawnMeteor(m) {
    const start = new THREE.Vector3(
      (Math.random() - 0.5) * 46,
      14 + Math.random() * 16,
      -8 - Math.random() * 22
    );
    const dir = new THREE.Vector3(-0.6 - Math.random() * 0.9, -1, 0.12).normalize();
    m.start = start;
    m.dir = dir;
    m.dur = 1 + Math.random() * 1.4;
    m.t = 0;
    m.speed = 26 + Math.random() * 18;
  }

  let cfg = {};
  let scrollFade = 1;
  function layout() {
    const w = window.innerWidth;
    if (w >= 1280) cfg = { x: 4.3, y: 1.5, z: -3.2, s: 1.0, g: 0.5, camZ: 10 };
    else if (w >= 1000) cfg = { x: 3.6, y: 1.0, z: -4.5, s: 0.9, g: 0.42, camZ: 11 };
    else if (w >= 640) cfg = { x: 0, y: 3.6, z: -8, s: 0.72, g: 0.3, camZ: 12 };
    else cfg = { x: 0, y: 3.8, z: -10, s: 0.58, g: 0.22, camZ: 12 };
  }
  layout();

  let recorded = { x: cfg.x, y: cfg.y, s: cfg.s, g: cfg.g, camZ: cfg.camZ };

  function easeOut(a, b, k) {
    return a + (b - a) * k;
  }

  window.addEventListener("resize", () => {
    layout();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  window.addEventListener("scroll", () => {
    scrollFade = Math.max(0, 1 - window.scrollY / (window.innerHeight * 1.1));
  }, { passive: true });
  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let prev = performance.now();
  function animate(now) {
    const delta = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    const time = now * 0.001;

    stars.mat.uniforms.uTime.value = time;
    stars.points.rotation.y = time * 0.007;
    stars.points.rotation.x = Math.sin(time * 0.05) * 0.05;

    moonGroup.rotation.y += delta * 0.14;
    moon.rotation.y += delta * 0.02;

    recorded.x = easeOut(recorded.x, cfg.x + mouse.x * 0.35, 0.03 * delta * 60);
    recorded.y = easeOut(recorded.y, cfg.y - mouse.y * 0.25, 0.03 * delta * 60);
    recorded.s = easeOut(recorded.s, cfg.s, 0.04 * delta * 60);
    recorded.g = easeOut(recorded.g, cfg.g, 0.04 * delta * 60);
    recorded.camZ = easeOut(recorded.camZ, cfg.camZ, 0.03 * delta * 60);

    moonGroup.position.set(recorded.x, recorded.y, cfg.z);
    moonGroup.scale.setScalar(recorded.s * (0.2 + 0.8 * scrollFade));
    glow.material.opacity = recorded.g * scrollFade;
    glow.scale.setScalar(6.5 * recorded.s * (0.3 + 0.7 * scrollFade));
    ring.material.opacity = 0.38 * scrollFade;
    ringWide.material.opacity = 0.18 * scrollFade;
    net.material.opacity = 0.16 * scrollFade;

    camera.position.z = recorded.camZ;
    camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.y * 0.35 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    window.__taroScene = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollFade,
      moon: { x: recorded.x, y: recorded.y, z: cfg.z, s: recorded.s },
      camZ: recorded.camZ,
      aspect: camera.aspect,
    };

    for (const m of meteors) {
      m.t += delta;
      const life = m.t / m.dur;
      if (life >= 1) {
        respawnMeteor(m);
        continue;
      }
      const p1 = m.start.clone().add(m.dir.multiplyScalar(m.t * m.speed));
      const p2 = p1.clone().add(m.dir.clone().multiplyScalar(m.speed * 0.14));
      m.arr[0] = p1.x; m.arr[1] = p1.y; m.arr[2] = p1.z;
      m.arr[3] = p2.x; m.arr[4] = p2.y; m.arr[5] = p2.z;
      m.line.geometry.attributes.position.needsUpdate = true;
      m.mat.opacity = Math.sin(Math.PI * life) * 0.55;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  meteors.forEach((m) => respawnMeteor(m));
  requestAnimationFrame(animate);
})();