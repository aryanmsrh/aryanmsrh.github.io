/**
 * Canvas Engine - Math Field Background Animation
 * Decoupled modular rendering pipeline.
 */

// =========================================
// UTILITY & MATH HELPERS
// =========================================

/**
 * Smoothstep interpolation function.
 */
function smoothstep(min, max, value) {
  if (value <= min) return 0;
  if (value >= max) return 1;
  const x = (value - min) / (max - min);
  return x * x * (3 - 2 * x);
}

/**
 * Peak envelope function for scroll distortion.
 */
function peak(min, max, value) {
  const mid = (min + max) / 2;
  if (value <= min || value >= max) return 0;
  if (value < mid) return smoothstep(min, mid, value);
  return 1 - smoothstep(mid, max, value);
}

/**
 * Renders a direction arrow vector onto the canvas.
 */
function drawArrow(ctx, fromX, fromY, toX, toY, color) {
  const headlen = 14;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle - Math.PI / 6),
    toY - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle + Math.PI / 6),
    toY - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

// =========================================
// MODULAR SCENE RENDERERS
// =========================================

/**
 * Renders the background coordinate grid, matrix transforms, and axis arrows.
 */
function renderGridAndVectors(state) {
  const { ctx, width, height, time, scrollProgress, globalAlpha, baseAccent } = state;
  const gridSize = 60;
  const mlDistortion = peak(0.2, 0.88, scrollProgress);

  ctx.save();
  if (mlDistortion > 0) {
    const shearY = Math.sin(time * 0.8) * 0.5 * mlDistortion;
    const scaleX = 1 + Math.cos(time * 0.5) * 0.3 * mlDistortion;
    const rotation = Math.sin(time * 0.3) * 0.2 * mlDistortion;
    ctx.transform(scaleX, shearY, 0, 1, 0, 0);
    ctx.rotate(rotation);
  }

  const numLines = Math.ceil(Math.max(width, height) / gridSize) + 2;
  ctx.beginPath();
  for (let i = -numLines; i <= numLines; i++) {
    const offset = i * gridSize;
    ctx.moveTo(offset, -numLines * gridSize);
    ctx.lineTo(offset, numLines * gridSize);
    ctx.moveTo(-numLines * gridSize, offset);
    ctx.lineTo(numLines * gridSize, offset);
  }
  ctx.strokeStyle = `rgba(${baseAccent}, ${0.15 * globalAlpha})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  if (mlDistortion > 0.01) {
    const vLen = gridSize * 2.5;
    const arrowColor = `rgba(${baseAccent}, ${0.5 * mlDistortion * globalAlpha})`;
    drawArrow(ctx, 0, 0, vLen, 0, arrowColor);
    drawArrow(ctx, 0, 0, 0, -vLen, arrowColor);
  }
  ctx.restore();
}

/**
 * Renders desktop horizontal wave propagation with spatial decay e^{-gamma * x}.
 */
function renderDesktopWave(state, heroAlpha) {
  const { ctx, width, height, cx, time, globalAlpha, baseAccent } = state;
  const angle = time * 1.5;

  const r = height * 0.5;
  const targetRightEdge = -cx + width * 0.18;
  const circleCX = targetRightEdge - r;
  const circleCY = 0;
  const waveStartX = targetRightEdge;

  const px = circleCX + Math.cos(angle) * r;
  const py = -Math.sin(angle) * r;

  // Circle Arc
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = `rgba(${baseAccent}, ${0.4 * heroAlpha * globalAlpha})`;
  ctx.strokeStyle = `rgba(${baseAccent}, ${0.4 * heroAlpha * globalAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(circleCX, circleCY, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Radial Vector
  ctx.strokeStyle = `rgba(${baseAccent}, ${0.5 * heroAlpha * globalAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(circleCX, circleCY);
  ctx.lineTo(px, py);
  ctx.stroke();

  // Projection Line (dashed)
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(waveStartX, py);
  ctx.stroke();
  ctx.setLineDash([]);

  // Damped Wave
  const waveGrad = ctx.createLinearGradient(waveStartX, 0, cx, 0);
  waveGrad.addColorStop(
    0,
    `rgba(${baseAccent}, ${0.5 * heroAlpha * globalAlpha})`
  );
  waveGrad.addColorStop(1, `rgba(${baseAccent}, 0)`);

  ctx.strokeStyle = waveGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  const gamma = 3.5 / (width * 0.6);
  const waveLengthFactor = 0.015;

  for (let x = waveStartX; x <= cx; x += 2) {
    const d = x - waveStartX;
    const damping = Math.exp(-gamma * d);
    const wavePhase = angle - d * waveLengthFactor;
    const wy = -r * damping * Math.sin(wavePhase);

    if (x === waveStartX) ctx.moveTo(x, wy);
    else ctx.lineTo(x, wy);
  }
  ctx.stroke();
}

/**
 * Renders mobile vertical wave propagation with spatial decay e^{-gamma * y}.
 */
function renderMobileWave(state, heroAlpha) {
  const { ctx, width, height, cy, time, globalAlpha, baseAccent } = state;
  const angle = time * 1.5;

  const r = width * 0.5;
  const targetBottomEdge = -cy + height * 0.25;
  const circleCX = 0;
  const circleCY = targetBottomEdge - r;
  const waveStartY = targetBottomEdge;

  const px = circleCX + Math.cos(angle) * r;
  const py = circleCY + Math.sin(angle) * r;

  // Circle Arc
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = `rgba(${baseAccent}, ${0.4 * heroAlpha * globalAlpha})`;
  ctx.strokeStyle = `rgba(${baseAccent}, ${0.4 * heroAlpha * globalAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(circleCX, circleCY, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Radial Vector
  ctx.strokeStyle = `rgba(${baseAccent}, ${0.5 * heroAlpha * globalAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(circleCX, circleCY);
  ctx.lineTo(px, py);
  ctx.stroke();

  // Projection Line (dashed)
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px, waveStartY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Damped Wave
  const waveGrad = ctx.createLinearGradient(0, waveStartY, 0, cy);
  waveGrad.addColorStop(
    0,
    `rgba(${baseAccent}, ${0.5 * heroAlpha * globalAlpha})`
  );
  waveGrad.addColorStop(1, `rgba(${baseAccent}, 0)`);

  ctx.strokeStyle = waveGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  const gamma = 3.5 / (height * 0.6);
  const waveLengthFactor = 0.015;

  for (let y = waveStartY; y <= cy; y += 2) {
    const d = y - waveStartY;
    const damping = Math.exp(-gamma * d);
    const wavePhase = angle - d * waveLengthFactor;
    const wx = r * damping * Math.cos(wavePhase);

    if (y === waveStartY) ctx.moveTo(wx, y);
    else ctx.lineTo(wx, y);
  }
  ctx.stroke();
}

/**
 * Hero visual delegate determining responsive layout orientation (mobile vs desktop).
 */
function renderHeroVisual(state) {
  // Wave fade-out: widened scroll range from (0.15 - 0.25) to (0.02 - 0.38) for a slower, smoother transition
  const heroAlpha = 1 - smoothstep(0.02, 0.38, state.scrollProgress);

  if (heroAlpha <= 0.01) return;

  const isMobile = state.width <= 768;
  if (!isMobile) {
    renderDesktopWave(state, heroAlpha);
  } else {
    renderMobileWave(state, heroAlpha);
  }
}

// =========================================
// ENGINE INITIALIZATION & COMPOSITION PIPELINE
// =========================================

export function initCanvas() {
  const canvas = document.getElementById("math-field");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const baseAccent = "43, 255, 136";

  const state = {
    width: 0,
    height: 0,
    cx: 0,
    cy: 0,
    scrollProgress: 0,
    smoothCollapse: 0,
    time: 0,
    globalScale: 1,
    globalAlpha: 1,
    ctx,
    baseAccent
  };

  function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.cx = state.width / 2;
    state.cy = state.height / 2;
    canvas.width = state.width * window.devicePixelRatio;
    canvas.height = state.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("scroll", () => {
    const maxScroll = Math.max(
      1,
      document.body.scrollHeight - window.innerHeight
    );
    state.scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  });

  function draw() {
    ctx.clearRect(0, 0, state.width, state.height);
    state.time += 0.005;

    // Target collapse activates near the footer (0.88 - 1.0)
    const targetCollapse = smoothstep(0.88, 1.0, state.scrollProgress);

    // Frame-rate based LERP easing (0.04 factor) so rapid scrolling animates smoothly over ~500ms
    state.smoothCollapse += (targetCollapse - state.smoothCollapse) * 0.04;

    const collapseFactor = state.smoothCollapse;
    state.globalScale = Math.max(0.001, 1 - collapseFactor);
    state.globalAlpha = 1 - collapseFactor;

    ctx.save();
    ctx.translate(state.cx, state.cy);
    ctx.scale(state.globalScale, state.globalScale);

    // Composition Pipeline
    renderGridAndVectors(state);
    renderHeroVisual(state);

    ctx.restore();
    requestAnimationFrame(draw);
  }

  draw();
}