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
  // Brush (mantener presionado para seguir pintando): 'area' crece el radio;
  // 'both' crece radio + intensidad del punto. Sin brush → click-freeze clásico.
  const brushMode = opts.brush === 'area' || opts.brush === 'both' ? opts.brush : null;
  const canvas = root.querySelector('canvas');
  const stage = root.querySelector('[data-stage]') || (canvas && canvas.parentElement);
  if (!canvas || !stage) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const offscreen = document.createElement('canvas');
  const offCtx = offscreen.getContext('2d');

  // El halftone es una pieza de marca/interacción: anima siempre (decisión del
  // cliente), incluso con "Reducir movimiento" activo — común en iPhone, donde
  // si no el hero quedaba estático y el experimento no respondía.
  const reducedMotion = false;

  // Parámetros AM halftone
  // Lineatura (LPI): la trama en pantalla es una vista AMPLIADA (~4×) de una trama de
  // imprenta. spacing = MAG / lpi. Default 40 lpi → SPACING 10 (idéntico al look previo).
  // Rango 10–85 lpi: 85 ≈ trama de diario, la más fina que resiste esta ampliación.
  const MAG = 400;           // px de pantalla por "pulgada" simulada de imprenta
  const DOT_BUDGET = 80000;  // tope de puntos por canal → piso de spacing en fullscreen
  let currentLpi = 40;
  let SPACING = 10;
  let BASE_RADIUS = Math.sqrt((0.05 * SPACING * SPACING) / Math.PI);
  let MAX_RADIUS = SPACING * 0.6;
  // Recalcula el paso de trama y los radios de punto según la lineatura y el tamaño
  // actual del stage. El piso de spacing evita que en pantalla completa el conteo de
  // puntos explote (a mayor superficie, spacing mínimo mayor).
  function applyLpi() {
    const floor = Math.max(4, Math.sqrt((displayW * displayH) / DOT_BUDGET) || 4);
    SPACING = Math.max(MAG / currentLpi, floor);
    BASE_RADIUS = Math.sqrt((0.05 * SPACING * SPACING) / Math.PI);
    MAX_RADIUS = SPACING * 0.6;
  }
  const INFLUENCE = 160; // radio de revelado del hover (halo del cursor)
  // Radio INICIAL del dab al tap/click y arranque del brush: mucho más chico que el
  // halo de hover, para que el toque no cubra tanta superficie (pedido). Crece luego
  // al mantener presionado.
  const STAMP_R = 46;
  const LERP = 0.12;
  const CHANNEL_ALPHA = 1; // color al 100%; los canales se suman por 'multiply'
  const SWEEP_DURATION = 800;
  const SWEEP_SOFT = 100;

  // Área del brush: al mantener, el radio crece SIN parar hasta cubrir casi todo el
  // stage (el tope se calcula desde su diagonal, no un valor chico fijo). Crecimiento
  // lento y sostenido: llega al tope recién en BRUSH_FULL_MS.
  const BRUSH_MAX_K = 1.5;      // tope del radio = 1.5× la diagonal del stage (satura casi todo)
  const BRUSH_FULL_MS = 8000;   // tiempo hasta el tope (lento, pero cubre casi toda la superficie)
  // 'both': ganancia extra sobre el tamaño máximo del punto (satura donde se mantiene).
  const BRUSH_BOOST_RATE = 1 / 4500; // alcanza el tope a ~2.7s
  const BRUSH_BOOST_MAX = 0.6;
  // Suba gradual del diámetro pintado: al mantener, el punto crece de a poco hacia su
  // máximo. Más lento (pedido): el crecimiento del diámetro se percibe gradual.
  const PAINT_LERP = 0.02;

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
  // ¿Hay un puntero activo sobre el stage? (hover en desktop, dedo apoyado en touch).
  // El halo de revelado sólo vive mientras esto es true; al soltar el dedo o salir
  // con el mouse se apaga, así un TAP no deja un halo grande pegado (sólo el dab fijo).
  let pointerActive = false;
  let tiltX = 0; // inclinación del dispositivo (-1..1), sólo hero
  let tiltY = 0;
  let pressing = false;
  let pressStart = 0;
  let displayW = 0;
  let displayH = 0;
  let autoMode = background; // sólo el hero deriva solo; el experimento anima con el input
  let autoTime = 0.42; // determinista (sin Math.random)
  let selectedChannel = 'k';
  let lastFrameTime = performance.now();
  let rafId = null;
  let running = false;
  let lastIsDark = null; // detecta cambio de tema para regenerar la geometría
  let moireT = 0; // 0 = halftone normal; >0 = moiré (colapso de ángulos). Sólo light.

  function generateDotsForChannel(ch) {
    ch.dots = [];
    const w = displayW;
    const h = displayH;

    if (isDarkNow()) {
      // RGB aditivo: grilla ortogonal compartida. El escalar current/target es BRILLO (0–1).
      for (let gy = 0; gy < h; gy += CELL) {
        for (let gx = 0; gx < w; gx += CELL) {
          ch.dots.push({
            x: gx, y: gy, gi: Math.round(gx / CELL), gj: Math.round(gy / CELL),
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
          // gi/gj = índice de grilla (relativo al centro): estable ante un resize,
          // permite preservar lo pintado al pasar a pantalla completa.
          ch.dots.push({ x, y, gi: i, gj: j, current: BASE_RADIUS, target: BASE_RADIUS, frozen: false, fixedR: BASE_RADIUS, maxR: MAX_RADIUS, baseR: BASE_RADIUS });
        }
      }
    }
  }

  // Regenera la grilla de un canal PRESERVANDO lo pintado, mapeando frozen/fixedR por
  // índice de grilla (gi,gj). Se usa en el resize (p. ej. pantalla completa) para que
  // no se borre lo pintado. (El cambio de lineatura sí resetea a propósito: usa
  // generateDotsForChannel directo.)
  function regenPreserving(ch) {
    const prev = new Map();
    for (const d of ch.dots) {
      if (d.frozen) prev.set(`${d.gi},${d.gj}`, d.fixedR);
    }
    generateDotsForChannel(ch);
    if (prev.size === 0) return;
    for (const d of ch.dots) {
      const f = prev.get(`${d.gi},${d.gj}`);
      if (f !== undefined && f > d.baseR) {
        d.frozen = true;
        d.fixedR = f;
        d.current = f;
        d.target = f;
      }
    }
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = stage.getBoundingClientRect();
    displayW = rect.width;
    displayH = rect.height;
    if (displayW === 0 || displayH === 0) return;
    applyLpi(); // el piso de spacing depende del tamaño medido del stage
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const ch of channels) {
      if (ch.active || ch.dots.length > 0) regenPreserving(ch);
    }
  }

  function updateAutoCursor() {
    if (!autoMode) return;
    autoTime += 0.006;
    // "La bola que pasa": deriva suave + sesgo por inclinación del teléfono (hero).
    mouseX = displayW * 0.5 + displayW * 0.28 * Math.sin(autoTime * 1.3) + tiltX * displayW * 0.32;
    mouseY = displayH * 0.4 + displayH * 0.24 * Math.sin(autoTime * 0.9 + 1.5) + tiltY * displayH * 0.28;
  }

  // --- Moiré (sólo light) ------------------------------------------------------
  const deg = (d) => (d * Math.PI) / 180;
  const mix = (a, b, t) => a + (b - a) * t;

  // Ángulo efectivo por canal según el colapso t (0→1). Colapso simétrico y
  // acotado (rotaciones ≤20°) para no dejar huecos al rotar la trama existente.
  // K queda fijo (referencia); C, M, Y se acercan → aparece el moiré.
  function moireAngle(id, t, wob) {
    if (id === 'c') return deg(mix(15, 35, t));
    if (id === 'm') return deg(mix(75, 55, t)) + wob;
    if (id === 'y') return deg(mix(0, 20, t));
    // K también rota (antes quedaba fijo en 45° = su ángulo horneado → delta 0 y el
    // negro no giraba). Se aleja de 45° para que el negro participe de la interferencia.
    return deg(mix(45, 30, t)) - wob;
  }

  // Render del moiré: rota la trama REAL de cada canal (con el tamaño actual de
  // cada punto, incluido lo pintado por el usuario) desde su ángulo horneado
  // hasta el colapsado. No agranda nada: sólo cambia el ángulo → interferencia real.
  function drawMoireFrame(now, dpr) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = displayW / 2;
    const cy = displayH / 2;
    const t = moireT * moireT; // ease-in: el caos vive en el tramo alto del slider
    const wob = deg(2) * moireT * Math.sin(now / 2600); // respiración temporal
    for (const ch of channels) {
      if (!ch.active) continue;
      const delta = moireAngle(ch.id, t, wob) - ch.angle;
      offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      offCtx.globalCompositeOperation = 'source-over';
      offCtx.globalAlpha = 1;
      offCtx.clearRect(0, 0, displayW, displayH);
      offCtx.fillStyle = ch.color;
      offCtx.save();
      offCtx.translate(cx, cy);
      offCtx.rotate(delta);
      offCtx.translate(-cx, -cy);
      for (const dot of ch.dots) {
        const r = Math.max(dot.current, 0.3); // tamaño real actual (incluye lo pintado)
        offCtx.beginPath();
        offCtx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
        offCtx.fill();
      }
      offCtx.restore();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'multiply';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(offscreen, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  // Al engancharse el moiré hace falta un par que bata: asegura C y M activos.
  function ensureMoireChannels() {
    const colorsOn = channels.filter((c) => c.id !== 'k' && c.active).length;
    if (colorsOn >= 2) return;
    for (const id of ['c', 'm']) {
      const c = channels.find((x) => x.id === id);
      if (!c.active) {
        c.active = true;
        c.sweep = 1;
        c.sweepTarget = 1;
        if (c.dots.length === 0) generateDotsForChannel(c);
      }
    }
    updateButtonStates();
  }

  function draw() {
    const now = performance.now();
    const dt = now - lastFrameTime;
    lastFrameTime = now;

    updateAutoCursor();
    if (pressing && brushMode && !reducedMotion && moireT === 0) paintBrush(now);

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
          // NO borrar ch.dots: se conserva lo pintado para cuando se vuelva a prender.
        }
      }
    }

    // Moiré (sólo light): camino de render propio (rotación al dibujar) que exhibe
    // la interferencia. El halftone interactivo normal queda intacto (moireT === 0).
    if (moireT > 0 && !isDark && !background) {
      drawMoireFrame(now, dpr);
      if (running && !reducedMotion) rafId = requestAnimationFrame(draw);
      return;
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
          if (respond && pointerActive && !reducedMotion) {
            const dx = mouseX - dot.x;
            const dy = mouseY - dot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < INFLUENCE) {
              const t = 1 - dist / INFLUENCE;
              g = Math.max(dot.fixedR, dot.baseR + (dot.maxR - dot.baseR) * t);
            }
          }
          dot.target = g;
        } else if (respond && pointerActive && !reducedMotion) {
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
    pointerActive = true;
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }
  function onLeave() {
    autoMode = background;
    pointerActive = false; // el mouse salió → se apaga el halo de revelado
  }
  // Depósito inmediato bajo el cursor (click/tap): fija los dots cercanos al valor
  // de hover al instante. Es lo que hace que un TAP en mobile pinte sin necesidad de
  // mantener presionado (el brush recién crece con el tiempo).
  function stampAt(mx, my) {
    // Claro: fija el canal seleccionado. Oscuro (aditivo): fija todos los activos → mancha de luz.
    const targets = isDarkNow()
      ? channels.filter((c) => c.active)
      : channels.filter((c) => c.id === selectedChannel && c.active);
    for (const ch of targets) {
      for (const dot of ch.dots) {
        const dx = mx - dot.x;
        const dy = my - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < STAMP_R) {
          // Perfil de GRADIENTE pleno centro→borde (como el hover): el dab NO es un
          // disco de tono uniforme. Se fija ese perfil, NO dot.current —dentro del
          // radio chico el halo de hover está uniformemente alto y dejaba tonos iguales.
          const t = 1 - dist / STAMP_R;
          const grown = dot.baseR + (dot.maxR - dot.baseR) * t;
          dot.frozen = true;
          dot.fixedR = Math.max(dot.fixedR, grown);
          dot.current = Math.max(dot.current, dot.fixedR); // aparece al instante, sin achicar el hover
        }
      }
    }
  }
  function onClick(e) {
    if (background) return; // el fondo del hero no congela
    if (overControls(e.clientX, e.clientY)) return; // no pintar sobre los selectores
    const rect = canvas.getBoundingClientRect();
    stampAt(e.clientX - rect.left, e.clientY - rect.top);
    if (reducedMotion) drawStaticFrame();
  }

  // Brush: mientras se mantiene presionado, el radio crece con el tiempo; los puntos
  // dentro quedan fijos (frozen). 'both' además sube el tamaño máximo → tono más denso.
  function paintBrush(now) {
    if (background) return;
    const held = now - pressStart;
    // El tope escala con el stage → el brush llega a cubrir casi toda la superficie.
    const brushMax = Math.hypot(displayW, displayH) * BRUSH_MAX_K;
    const brushR = Math.min(STAMP_R + held * ((brushMax - STAMP_R) / BRUSH_FULL_MS), brushMax);
    const boost = brushMode === 'both' ? 1 + Math.min(held * BRUSH_BOOST_RATE, BRUSH_BOOST_MAX) : 1;
    const targets = isDarkNow()
      ? channels.filter((c) => c.active)
      : channels.filter((c) => c.id === selectedChannel && c.active);
    for (const ch of targets) {
      for (const dot of ch.dots) {
        const dx = mouseX - dot.x;
        const dy = mouseY - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < brushR) {
          const t = 1 - dist / brushR;
          const maxR = dot.maxR * boost;
          const ceil = dot.baseR + (maxR - dot.baseR) * t; // techo por distancia/intensidad
          if (ceil > dot.fixedR) {
            dot.frozen = true;
            dot.fixedR += (ceil - dot.fixedR) * PAINT_LERP; // sube de a poco (pintada lenta)
          }
        }
      }
    }
  }
  // ¿El punto (viewport) cae sobre el área de los controles? Con un margen extra
  // para que tocar/errarle a los selectores NO accione la trama.
  function overControls(clientX, clientY) {
    const zones = root.querySelectorAll('.pz-halftone__controls, .pz-halftone__trama, [data-expand]');
    const M = 18;
    for (const z of zones) {
      const r = z.getBoundingClientRect();
      if (clientX >= r.left - M && clientX <= r.right + M && clientY >= r.top - M && clientY <= r.bottom + M) return true;
    }
    return false;
  }
  function onDown(e) {
    if (background) return;
    if (overControls(e.clientX, e.clientY)) return; // no pintar sobre los selectores
    autoMode = false;
    pointerActive = true;
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    stampAt(mouseX, mouseY); // dab inmediato: el click/tap responde al instante
    if (reducedMotion) { drawStaticFrame(); return; }
    pressing = true;
    pressStart = performance.now();
  }
  function onUp() {
    pressing = false;
  }

  // Touch (mobile): tap/hold para pintar; drag revela y pinta.
  function touchXY(e) {
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    if (!t) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }
  function onTouchStart(e) {
    if (background) return;
    const raw = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    if (raw && overControls(raw.clientX, raw.clientY)) return; // no pintar sobre los selectores
    autoMode = false;
    pointerActive = true;
    const p = touchXY(e);
    if (p) { mouseX = p.x; mouseY = p.y; }
    stampAt(mouseX, mouseY); // tap = pinta al instante (mobile no mantiene presionado)
    if (reducedMotion) { drawStaticFrame(); return; }
    if (brushMode) { pressing = true; pressStart = performance.now(); }
  }
  function onTouchMove(e) {
    if (reducedMotion || background) return;
    const p = touchXY(e);
    if (p) { mouseX = p.x; mouseY = p.y; }
    if (pressing) { stampAt(mouseX, mouseY); e.preventDefault(); } // arrastre = pincelada continua
  }
  function onTouchEnd() {
    pressing = false;
    pointerActive = false; // dedo levantado → se apaga el halo (queda sólo el dab fijo)
    autoMode = background; // el experimento no deriva solo; el hero sí
  }

  stage.addEventListener('mousemove', onMove);
  stage.addEventListener('mouseleave', onLeave);
  if (brushMode && !background) {
    stage.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
  } else {
    stage.addEventListener('click', onClick);
  }
  if (!background) {
    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: false });
    stage.addEventListener('touchend', onTouchEnd);
    stage.addEventListener('touchcancel', onTouchEnd);
  }

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

  // Reset: limpia lo pintado (frozen) de un canal → vuelve a su reposo.
  function resetChannel(chId) {
    const ch = channels.find((c) => c.id === chId);
    if (!ch) return;
    for (const dot of ch.dots) {
      dot.frozen = false;
      dot.fixedR = dot.baseR;
      dot.current = dot.baseR;
      dot.target = dot.baseR;
    }
    if (reducedMotion) drawStaticFrame();
  }
  const resetBtn = root.querySelector('[data-reset]');
  const onReset = (e) => {
    e.stopPropagation();
    // Resetea el canal seleccionado; si no hay, todos los activos.
    if (selectedChannel) resetChannel(selectedChannel);
    else channels.filter((c) => c.active).forEach((c) => resetChannel(c.id));
  };
  if (resetBtn) resetBtn.addEventListener('click', onReset);

  // Slider de moiré (sólo light): 0 = halftone normal; >0 = colapso de ángulos.
  const moireSlider = root.querySelector('[data-moire]');
  const moireVal = root.querySelector('[data-moire-val]');
  // Badge del panel "Trama": resume ambos valores para que el header colapsado no mienta.
  const tramaBadge = root.querySelector('[data-trama-badge]');
  function updateTramaBadge() {
    if (!tramaBadge) return;
    const ang = moireVal ? moireVal.textContent : 'Δ 0°';
    tramaBadge.textContent = `${currentLpi} lpi · ${ang}`;
  }
  function updateMoireReadout() {
    if (!moireVal) return;
    const t = moireT * moireT;
    const gap = Math.abs(mix(75, 23, t) - mix(15, 19, t)); // separación C/M en grados
    moireVal.textContent = `Δ ${Math.round(gap)}°`;
    updateTramaBadge();
  }
  const onMoire = () => {
    const prev = moireT;
    moireT = Math.max(0, Math.min(1, (parseFloat(moireSlider.value) || 0) / 100));
    if (prev === 0 && moireT > 0) ensureMoireChannels();
    updateMoireReadout();
    if (reducedMotion) drawStaticFrame();
  };
  if (moireSlider) {
    moireSlider.addEventListener('input', onMoire);
    updateMoireReadout();
  }

  // Slider de lineatura (LPI, sólo light): cambia el paso de la trama. Cambiar la
  // lineatura = "re-filmar la pantalla": se regenera la grilla (se pierde lo pintado,
  // que estaba anclado a puntos que ya no existen). Regen con debounce; readout en vivo.
  const lpiSlider = root.querySelector('[data-lpi]');
  const lpiVal = root.querySelector('[data-lpi-val]');
  let lpiTimer = 0;
  function updateLpiReadout() {
    if (lpiVal) lpiVal.textContent = `≈ ${currentLpi} lpi`;
    updateTramaBadge();
  }
  function regenAll() {
    applyLpi();
    for (const ch of channels) {
      if (ch.active || ch.dots.length > 0) generateDotsForChannel(ch);
    }
    if (reducedMotion) drawStaticFrame();
  }
  if (lpiSlider) {
    lpiSlider.addEventListener('input', () => {
      currentLpi = Math.max(10, Math.min(85, parseInt(lpiSlider.value, 10) || 40));
      updateLpiReadout();
      clearTimeout(lpiTimer);
      lpiTimer = setTimeout(regenAll, 120);
    });
    updateLpiReadout();
  }

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

  // Inclinación del teléfono → sesga la "bola" del hero (sólo modo fondo).
  // iOS 13+ exige permiso desde un gesto del usuario (primer tap).
  function onOrient(e) {
    const g = Math.max(-40, Math.min(40, e.gamma || 0)); // izq/der
    const b = Math.max(-40, Math.min(40, (e.beta || 0) - 40)); // adelante/atrás (~40° = en la mano)
    tiltX = g / 40;
    tiltY = b / 40;
  }
  let orientReq = null;
  if (background && typeof window.DeviceOrientationEvent !== 'undefined') {
    const DOE = window.DeviceOrientationEvent;
    if (typeof DOE.requestPermission === 'function') {
      orientReq = () => {
        DOE.requestPermission()
          .then((s) => { if (s === 'granted') window.addEventListener('deviceorientation', onOrient); })
          .catch(() => {});
        window.removeEventListener('touchend', orientReq);
        window.removeEventListener('click', orientReq);
      };
      window.addEventListener('touchend', orientReq, { once: true });
      window.addEventListener('click', orientReq, { once: true });
    } else {
      window.addEventListener('deviceorientation', onOrient);
    }
  }

  let wantRun = false;
  let ro = null;

  function beginLoop() {
    if (running) return;
    resize();
    if (displayW === 0) return; // sin medir todavía; el ResizeObserver reintenta al aparecer
    running = true;
    updateButtonStates();
    if (reducedMotion) {
      drawStaticFrame();
    } else {
      lastFrameTime = performance.now();
      rafId = requestAnimationFrame(draw);
    }
  }

  const api = {
    start() {
      wantRun = true;
      beginLoop();
    },
    stop() {
      wantRun = false;
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    },
    destroy() {
      this.stop();
      clearTimeout(lpiTimer);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('deviceorientation', onOrient);
      if (orientReq) {
        window.removeEventListener('touchend', orientReq);
        window.removeEventListener('click', orientReq);
      }
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseleave', onLeave);
      if (brushMode && !background) {
        stage.removeEventListener('mousedown', onDown);
        window.removeEventListener('mouseup', onUp);
      } else {
        stage.removeEventListener('click', onClick);
      }
      if (!background) {
        stage.removeEventListener('touchstart', onTouchStart);
        stage.removeEventListener('touchmove', onTouchMove);
        stage.removeEventListener('touchend', onTouchEnd);
        stage.removeEventListener('touchcancel', onTouchEnd);
      }
      btnHandlers.forEach(([btn, handler]) => btn.removeEventListener('click', handler));
      if (resetBtn) resetBtn.removeEventListener('click', onReset);
      if (moireSlider) moireSlider.removeEventListener('input', onMoire);
    },
  };

  // iOS Safari: el layout puede tardar en medirse (100dvh / aspect-ratio). Un
  // ResizeObserver arranca el lab en cuanto el stage tiene tamaño real, y reajusta
  // ante cambios — más confiable que reintentar por frames y abandonar.
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => {
      const rect = stage.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      if (Math.abs(rect.width - displayW) > 0.5 || Math.abs(rect.height - displayH) > 0.5) {
        resize();
        if (reducedMotion && running) drawStaticFrame();
      }
      if (wantRun && !running) beginLoop();
    });
    ro.observe(stage);
  }

  return api;
}
