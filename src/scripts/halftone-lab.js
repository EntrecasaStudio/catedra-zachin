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
export function initHalftoneLab(root, opts = {}) {
  if (!root) return null;
  // Modo fondo (hero): sin botones, canales fijos por tema (K en claro; R+G+B en oscuro),
  // sin fondo negro ni freeze; la opacidad baja se controla por CSS en el canvas.
  const background = opts.background === true;
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

  // Subpíxeles RGB (modo oscuro / aditivo): cada celda = rayas R|G|B sobre negro.
  const CELL = 21;            // divisible por 3 → rayas de 7px
  const SEAM = 1;             // matriz negra entre subpíxeles
  const BASE_BRIGHT = 0.12;   // emisión en reposo (pantalla casi apagada)
  const MAX_BRIGHT = 1;       // emisión bajo el cursor
  const RGB_EMIT = { m: '#ff1a1a', y: '#22ff22', c: '#1a6bff' }; // rojo / verde / azul puros
  const RGB_SLOT = { m: 0, y: 1, c: 2 }; // posición de la raya dentro de la celda

  const isDarkNow = () => document.documentElement.getAttribute('data-theme') === 'dark';

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
  let lastIsDark = null; // detecta cambio de tema para regenerar la geometría

  function generateDotsForChannel(ch) {
    ch.dots = [];
    const w = displayW;
    const h = displayH;

    if (isDarkNow()) {
      // RGB aditivo: grilla ortogonal compartida. El escalar current/target es BRILLO (0–1).
      for (let gy = 0; gy < h; gy += CELL) {
        for (let gx = 0; gx < w; gx += CELL) {
          ch.dots.push({
            x: gx, y: gy,
            current: BASE_BRIGHT, target: BASE_BRIGHT, frozen: false,
            fixedR: BASE_BRIGHT, maxR: MAX_BRIGHT, baseR: BASE_BRIGHT,
          });
        }
      }
      return;
    }

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
          ch.dots.push({ x, y, current: BASE_RADIUS, target: BASE_RADIUS, frozen: false, fixedR: BASE_RADIUS, maxR: MAX_RADIUS, baseR: BASE_RADIUS });
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

    // Cambió el tema → cambia el modelo (halftone ↔ subpíxeles): regenerar geometría.
    if (isDark !== lastIsDark) {
      lastIsDark = isDark;
      if (background) {
        // Fondo del hero: claro = sólo K; oscuro = R+G+B juntos (blanco)
        for (const c of channels) {
          const on = c.id === 'k' ? !isDark : isDark;
          c.active = on; c.sweep = on ? 1 : 0; c.sweepTarget = on ? 1 : 0;
          if (!on) c.dots = [];
        }
        selectedChannel = isDark ? 'm' : 'k';
      } else if (isDark) {
        // RGB no tiene canal blanco: apagar K; si no hay color activo, encender R/G/B.
        const k = channels.find((c) => c.id === 'k');
        k.active = false; k.sweep = 0; k.sweepTarget = 0; k.dots = [];
        const anyColor = channels.some((c) => c.id !== 'k' && c.active);
        if (!anyColor) {
          // Arranca con UN solo color (no los tres). El usuario enciende los que quiera;
          // se suman si activa varios (aditivo → blanco con R+G+B).
          const first = channels.find((c) => c.id === 'm');
          first.active = true; first.sweep = 0; first.sweepTarget = 1;
          selectedChannel = 'm';
        }
      } else {
        // Volviendo a CMYK: si no quedó nada activo, reactivar K.
        if (!channels.some((c) => c.active)) {
          const k = channels.find((c) => c.id === 'k');
          k.active = true; k.sweep = 0; k.sweepTarget = 1;
          selectedChannel = 'k';
        }
      }
      for (const ch of channels) {
        if (ch.active || ch.dots.length > 0) generateDotsForChannel(ch);
      }
      updateButtonStates();
    }

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

    // Fondo negro puro para anclar la suma aditiva (sólo oscuro; no en modo fondo)
    if (isDark && !background) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, displayW, displayH);
    }

    for (const ch of channels) {
      if (!ch.active || ch.sweep <= 0) continue;
      if (isDark && ch.id === 'k') continue; // RGB: sin canal blanco (W)

      const isSelected = ch.id === selectedChannel;
      const totalSweepW = displayW + SWEEP_SOFT * 2;
      const sweepEdge = ch.sweep * totalSweepW - SWEEP_SOFT;

      offCtx.globalCompositeOperation = 'source-over';
      offCtx.globalAlpha = 1;
      offCtx.clearRect(0, 0, displayW, displayH);
      // Claro = CMYK (tintas). Oscuro = RGB aditivo (luz casi pura): C→azul, M→rojo, Y→verde, K→blanco
      offCtx.fillStyle =
        ch.id === 'k'
          ? isDark ? '#FFFFFF' : '#000000'
          : isDark
            ? RGB_EMIT[ch.id]
            : ch.color;

      // En oscuro (aditivo) el cursor enciende TODOS los canales activos → luz blanca bajo el cursor.
      const respond = isDark ? true : isSelected;
      for (const dot of ch.dots) {
        const distFromEdge = sweepEdge - dot.x;
        const sweepScale = Math.max(0, Math.min(1, distFromEdge / SWEEP_SOFT));
        if (sweepScale <= 0.01) continue;

        if (dot.frozen) {
          // Fijo: descansa en su valor fijado. Puede crecer por encima al pasar
          // el mouse; al alejarse vuelve al valor fijado. Sólo un nuevo click re-fija.
          let g = dot.fixedR;
          if (respond && !reducedMotion) {
            const dx = mouseX - dot.x;
            const dy = mouseY - dot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < INFLUENCE) {
              const t = 1 - dist / INFLUENCE;
              g = Math.max(dot.fixedR, dot.baseR + (dot.maxR - dot.baseR) * t);
            }
          }
          dot.target = g;
        } else if (respond && !reducedMotion) {
          const dx = mouseX - dot.x;
          const dy = mouseY - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < INFLUENCE) {
            const t = 1 - dist / INFLUENCE;
            dot.target = dot.baseR + (dot.maxR - dot.baseR) * t;
          } else {
            dot.target = dot.baseR;
          }
        } else {
          dot.target = dot.baseR;
        }

        const diff = dot.target - dot.current;
        if (Math.abs(diff) > 0.05) dot.current += diff * LERP;
        else dot.current = dot.target;

        if (isDark) {
          // Subpíxel: el escalar es BRILLO → alpha. Raya del slot, o celda completa para W (k).
          offCtx.globalAlpha = Math.max(0, Math.min(1, dot.current * sweepScale));
          if (ch.id === 'k') {
            offCtx.fillRect(dot.x, dot.y, CELL - SEAM, CELL - SEAM);
          } else {
            offCtx.fillRect(dot.x + RGB_SLOT[ch.id] * (CELL / 3), dot.y, CELL / 3 - SEAM, CELL - SEAM);
          }
        } else {
          const r = Math.max(dot.current * sweepScale, 0.3);
          offCtx.beginPath();
          offCtx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
          offCtx.fill();
        }
      }
      offCtx.globalAlpha = 1;

      // Claro: multiply (tinta, sustractivo). Oscuro: lighter (luz, aditivo → suman a blanco)
      ctx.globalAlpha = CHANNEL_ALPHA;
      ctx.globalCompositeOperation = isDark ? 'lighter' : 'multiply';
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
    if (reducedMotion || background) return; // el fondo del hero no congela
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    // Claro: fija el canal seleccionado. Oscuro (aditivo): fija todos los activos → mancha de luz.
    const targets = isDarkNow()
      ? channels.filter((c) => c.active)
      : channels.filter((c) => c.id === selectedChannel && c.active);
    for (const ch of targets) {
      for (const dot of ch.dots) {
        const dx = mx - dot.x;
        const dy = my - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < INFLUENCE) {
          // Fija el valor actual (incluye lo que creció por el hover); un nuevo click re-fija más alto.
          const t = 1 - dist / INFLUENCE;
          const grown = dot.baseR + (dot.maxR - dot.baseR) * t;
          dot.frozen = true;
          dot.fixedR = Math.max(dot.current, grown);
        }
      }
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
