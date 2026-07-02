/**
 * Halftone Lab — motor de semitono CMYK (AM halftone) reutilizable.
 *
 * Derivado del hero original, con tres diferencias clave:
 *  1. Se dimensiona a un contenedor arbitrario (no al .hero).
 *  2. Expone start()/stop() y sólo corre el requestAnimationFrame cuando está
 *     visible (la sección colapsable lo pausa al cerrarse).
 *  3. Respeta prefers-reduced-motion: dibuja un cuadro estático, sin bucle
 *     ni auto-animación.
 *
 * @param {HTMLElement} root - Contenedor con un <canvas>, un elemento
 *   [data-stage] para medir, y botones [data-channel].
 * @returns {{ start: () => void, stop: () => void, destroy: () => void } | null}
 */
export function initHalftoneLab(root) {
  if (!root) return null;
  const canvas = root.querySelector('canvas');
  const stage = root.querySelector('[data-stage]') || (canvas && canvas.parentElement);
  if (!canvas || !stage) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const offscreen = document.createElement('canvas');
  const offCtx = offscreen.getContext('2d');

  const reducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parámetros AM halftone
  const SPACING = 10;
  const BASE_RADIUS = Math.sqrt((0.05 * SPACING * SPACING) / Math.PI);
  const MAX_RADIUS = SPACING * 0.6;
  const INFLUENCE = 160;
  const LERP = 0.12;
  const CHANNEL_ALPHA = 1; // color al 100%; los canales se suman por 'multiply'
  const SWEEP_DURATION = 800;
  const SWEEP_SOFT = 100;

  const channels = [
    { id: 'k', angle: Math.PI / 4, color: '#000000', dots: [], active: true, sweep: 0, sweepTarget: 1 },
    { id: 'c', angle: (Math.PI * 15) / 180, color: '#00AEEF', dots: [], active: false, sweep: 0, sweepTarget: 0 },
    { id: 'm', angle: (Math.PI * 75) / 180, color: '#EC008C', dots: [], active: false, sweep: 0, sweepTarget: 0 },
    { id: 'y', angle: 0, color: '#FFF200', dots: [], active: false, sweep: 0, sweepTarget: 0 },
  ];

  let mouseX = -9999;
  let mouseY = -9999;
  let displayW = 0;
  let displayH = 0;
  let autoMode = !reducedMotion;
  let autoTime = 0.42; // determinista (sin Math.random)
  let selectedChannel = 'k';
  let lastFrameTime = performance.now();
  let rafId = null;
  let running = false;

  function generateDotsForChannel(ch) {
    ch.dots = [];
    const w = displayW;
    const h = displayH;
    const cosA = Math.cos(ch.angle);
    const sinA = Math.sin(ch.angle);
    const diag = Math.sqrt(w * w + h * h);
    const steps = Math.ceil(diag / SPACING) + 2;

    for (let i = -steps; i <= steps; i++) {
      for (let j = -steps; j <= steps; j++) {
        const rx = i * SPACING;
        const ry = j * SPACING;
        const x = rx * cosA - ry * sinA + w / 2;
        const y = rx * sinA + ry * cosA + h / 2;

        if (x >= -MAX_RADIUS && x <= w + MAX_RADIUS && y >= -MAX_RADIUS && y <= h + MAX_RADIUS) {
          ch.dots.push({ x, y, current: BASE_RADIUS, target: BASE_RADIUS, frozen: false, maxR: MAX_RADIUS, baseR: BASE_RADIUS });
        }
      }
    }
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = stage.getBoundingClientRect();
    displayW = rect.width;
    displayH = rect.height;
    if (displayW === 0 || displayH === 0) return;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const ch of channels) {
      if (ch.active || ch.dots.length > 0) generateDotsForChannel(ch);
    }
  }

  function updateAutoCursor() {
    if (!autoMode) return;
    autoTime += 0.006;
    mouseX = displayW * 0.5 + displayW * 0.3 * Math.sin(autoTime * 1.3);
    mouseY = displayH * 0.4 + displayH * 0.25 * Math.sin(autoTime * 0.9 + 1.5);
  }

  function draw() {
    const now = performance.now();
    const dt = now - lastFrameTime;
    lastFrameTime = now;

    updateAutoCursor();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const dpr = window.devicePixelRatio || 1;

    for (const ch of channels) {
      if (ch.sweep !== ch.sweepTarget) {
        const speed = dt / SWEEP_DURATION;
        if (ch.sweepTarget > ch.sweep) ch.sweep = Math.min(ch.sweep + speed, ch.sweepTarget);
        else ch.sweep = Math.max(ch.sweep - speed, ch.sweepTarget);
        if (ch.sweep <= 0 && ch.sweepTarget <= 0) {
          ch.active = false;
          ch.dots = [];
        }
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (const ch of channels) {
      if (!ch.active || ch.sweep <= 0) continue;

      const isSelected = ch.id === selectedChannel;
      const totalSweepW = displayW + SWEEP_SOFT * 2;
      const sweepEdge = ch.sweep * totalSweepW - SWEEP_SOFT;

      offCtx.globalCompositeOperation = 'source-over';
      offCtx.globalAlpha = 1;
      offCtx.clearRect(0, 0, displayW, displayH);
      offCtx.fillStyle = ch.id === 'k' ? (isDark ? '#FFFFFF' : '#000000') : ch.color;

      for (const dot of ch.dots) {
        if (dot.maxR <= 0.1) continue;
        const distFromEdge = sweepEdge - dot.x;
        const sweepScale = Math.max(0, Math.min(1, distFromEdge / SWEEP_SOFT));
        if (sweepScale <= 0.01) continue;

        if (isSelected && !reducedMotion) {
          const dx = mouseX - dot.x;
          const dy = mouseY - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dot.frozen) {
            if (dist < INFLUENCE) {
              const t = 1 - dist / INFLUENCE;
              const newTarget = dot.baseR + (dot.maxR - dot.baseR) * t;
              if (newTarget > dot.target) dot.target = newTarget;
            }
          } else if (dist < INFLUENCE) {
            const t = 1 - dist / INFLUENCE;
            dot.target = dot.baseR + (dot.maxR - dot.baseR) * t;
          } else {
            dot.target = dot.baseR;
          }
        } else if (!dot.frozen) {
          dot.target = dot.baseR;
        }

        const diff = dot.target - dot.current;
        if (Math.abs(diff) > 0.05) dot.current += diff * LERP;
        else dot.current = dot.target;

        const r = Math.max(dot.current * sweepScale, 0.3);
        offCtx.beginPath();
        offCtx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
        offCtx.fill();
      }

      // Multiply: los canales CMYK se superponen como tinta (sobreimpresión)
      ctx.globalAlpha = CHANNEL_ALPHA;
      ctx.globalCompositeOperation = 'multiply';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(offscreen, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (running && !reducedMotion) rafId = requestAnimationFrame(draw);
  }

  function updateButtonStates() {
    root.querySelectorAll('[data-channel]').forEach((btn) => {
      const chId = btn.dataset.channel;
      const ch = channels.find((c) => c.id === chId);
      if (!ch) return;
      btn.classList.toggle('active', ch.active && ch.sweepTarget > 0);
      btn.classList.toggle('selected', chId === selectedChannel);
      btn.setAttribute('aria-pressed', ch.active && ch.sweepTarget > 0 ? 'true' : 'false');
    });
  }

  // --- Interacción ---
  function onMove(e) {
    if (reducedMotion) return;
    autoMode = false;
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }
  function onLeave() {
    autoMode = !reducedMotion;
  }
  function onClick(e) {
    if (reducedMotion) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const ch = channels.find((c) => c.id === selectedChannel);
    if (!ch || !ch.active) return;
    for (const dot of ch.dots) {
      if (dot.frozen) continue;
      const dx = mx - dot.x;
      const dy = my - dot.y;
      if (Math.sqrt(dx * dx + dy * dy) < INFLUENCE) dot.frozen = true;
    }
  }

  stage.addEventListener('mousemove', onMove);
  stage.addEventListener('mouseleave', onLeave);
  stage.addEventListener('click', onClick);

  const btnHandlers = [];
  root.querySelectorAll('[data-channel]').forEach((btn) => {
    const handler = (e) => {
      e.stopPropagation();
      const chId = btn.dataset.channel;
      const ch = channels.find((c) => c.id === chId);
      if (!ch) return;
      if (!ch.active || ch.sweepTarget <= 0) {
        ch.active = true;
        ch.sweepTarget = 1;
        if (ch.dots.length === 0) generateDotsForChannel(ch);
        selectedChannel = chId;
      } else if (chId !== selectedChannel) {
        selectedChannel = chId;
      } else {
        ch.sweepTarget = 0;
        const next = channels.find((c) => c.active && c.id !== chId && c.sweepTarget > 0);
        selectedChannel = next ? next.id : '';
      }
      updateButtonStates();
      if (reducedMotion) drawStaticFrame();
    };
    btn.addEventListener('click', handler);
    btnHandlers.push([btn, handler]);
  });

  function drawStaticFrame() {
    // Un solo cuadro con los canales activos totalmente presentes.
    for (const ch of channels) {
      if (ch.active) ch.sweep = 1;
    }
    resize();
    draw();
  }

  function onResize() {
    resize();
    if (reducedMotion) drawStaticFrame();
  }
  window.addEventListener('resize', onResize);

  return {
    start() {
      if (running) return;
      resize();
      if (displayW === 0) return; // aún oculto; se reintenta al próximo start
      running = true;
      updateButtonStates();
      if (reducedMotion) {
        drawStaticFrame();
      } else {
        lastFrameTime = performance.now();
        rafId = requestAnimationFrame(draw);
      }
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    },
    destroy() {
      this.stop();
      window.removeEventListener('resize', onResize);
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseleave', onLeave);
      stage.removeEventListener('click', onClick);
      btnHandlers.forEach(([btn, handler]) => btn.removeEventListener('click', handler));
    },
  };
}
