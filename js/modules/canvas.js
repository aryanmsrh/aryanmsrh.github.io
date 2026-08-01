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
 * Renders a direction arrow vector onto the canvas with magnetic field bending.
 */
function drawArrow(ctx, fromX, fromY, toX, toY, color, mouseX = -1000, mouseY = -1000) {
  const steps = 16;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const rx = fromX + (toX - fromX) * t;
    const ry = fromY + (toY - fromY) * t;
    const pt = getDisplacedPoint(rx, ry, mouseX, mouseY);
    if (s === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  const pTip = getDisplacedPoint(toX, toY, mouseX, mouseY);
  const pPrev = getDisplacedPoint(
    fromX + (toX - fromX) * 0.9,
    fromY + (toY - fromY) * 0.9,
    mouseX,
    mouseY
  );
  const headlen = 20;
  const dx = pTip.x - pPrev.x;
  const dy = pTip.y - pPrev.y;
  const angle = Math.atan2(dy, dx);

  ctx.beginPath();
  ctx.moveTo(pTip.x, pTip.y);
  ctx.lineTo(
    pTip.x - headlen * Math.cos(angle - Math.PI / 6),
    pTip.y - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(pTip.x, pTip.y);
  ctx.lineTo(
    pTip.x - headlen * Math.cos(angle + Math.PI / 6),
    pTip.y - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

/**
 * Shared grid-aligned distance function & point displacement helper.
 */
function getGridDist(dx, dy) {
  return 0.5 * Math.hypot(dx * 0.75, dy * 1.15) + 0.5 * (Math.abs(dx) + Math.abs(dy));
}

function getDisplacedPoint(px, py, mouseX, mouseY, influenceRadius = 280) {
  if (mouseX <= -900 || mouseY <= -900) return { x: px, y: py };
  const dx = px - mouseX;
  const dy = py - mouseY;
  const dist = getGridDist(dx, dy);

  if (dist < influenceRadius) {
    const factor = Math.pow(1 - dist / influenceRadius, 2);
    return {
      x: px + dx * factor * 0.22,
      y: py + dy * factor * 0.22
    };
  }
  return { x: px, y: py };
}

// =========================================
// MODULAR SCENE RENDERERS
// =========================================

/**
 * Renders the background coordinate grid, matrix transforms, and axis arrows.
 */
function renderGridAndVectors(state) {
  const { ctx, width, height, time, scrollProgress, globalAlpha, baseAccent, mouseX, mouseY } = state;
  
  const isMobile = width <= 768;
  const isSmall = width <= 480;

  // Responsive Grid Size & Vector Length
  const gridSize = isSmall ? 48 : (isMobile ? 58 : 80);
  const mlDistortion = peak(0.2, 0.88, scrollProgress);

  ctx.save();
  let scaleX = 1;
  let shearY = 0;
  let rotation = 0;

  if (mlDistortion > 0) {
    shearY = Math.sin(time * 1.35) * 0.5 * mlDistortion;
    scaleX = 1 + Math.cos(time * 1.1) * 0.3 * mlDistortion;
    rotation = Math.sin(time * 0.75) * 0.2 * mlDistortion;
    ctx.transform(scaleX, shearY, 0, 1, 0, 0);
    ctx.rotate(rotation);
  }

  const numX = Math.ceil(width / gridSize) + 2;
  const numY = Math.ceil(height / gridSize) + 2;
  const influenceRadius = 320;

  // Helper distance function: grid-aligned Manhattan & anisotropic blend (eliminates circular spotlight look)
  const getGridDist = (dx, dy) => 0.5 * Math.hypot(dx * 0.75, dy * 1.15) + 0.5 * (Math.abs(dx) + Math.abs(dy));

  // 1. Draw Vertical lines with grid-aligned displacement
  for (let i = -numX; i <= numX; i++) {
    const baseX = i * gridSize;
    ctx.beginPath();
    for (let j = -numY; j <= numY; j += 0.5) {
      const baseY = j * gridSize;
      const dx = baseX - mouseX;
      const dy = baseY - mouseY;
      const dist = getGridDist(dx, dy);

      let x = baseX;
      let y = baseY;

      if (dist < influenceRadius) {
        const factor = Math.pow(1 - dist / influenceRadius, 2);
        x += dx * factor * 0.22;
        y += dy * factor * 0.22;
      }

      if (j === -numY) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${baseAccent}, ${0.12 * globalAlpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 2. Draw Horizontal lines with grid-aligned displacement
  for (let j = -numY; j <= numY; j++) {
    const baseY = j * gridSize;
    ctx.beginPath();
    for (let i = -numX; i <= numX; i += 0.5) {
      const baseX = i * gridSize;
      const dx = baseX - mouseX;
      const dy = baseY - mouseY;
      const dist = getGridDist(dx, dy);

      let x = baseX;
      let y = baseY;

      if (dist < influenceRadius) {
        const factor = Math.pow(1 - dist / influenceRadius, 2);
        x += dx * factor * 0.22;
        y += dy * factor * 0.22;
      }

      if (i === -numX) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${baseAccent}, ${0.12 * globalAlpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 3. Grid-aligned highlight pass (NO circular spotlight, ultra-faint glow)
  if (mouseX > -900 && mouseY > -900) {
    // Vertical line highlight segments
    for (let i = -numX; i <= numX; i++) {
      const baseX = i * gridSize;
      const dx = baseX - mouseX;
      if (Math.abs(dx) > influenceRadius) continue;

      for (let j = -numY; j < numY; j += 0.5) {
        const y1 = j * gridSize;
        const y2 = (j + 0.5) * gridSize;
        const d1 = getGridDist(baseX - mouseX, y1 - mouseY);
        const d2 = getGridDist(baseX - mouseX, y2 - mouseY);

        if (d1 < influenceRadius || d2 < influenceRadius) {
          const avgDist = (d1 + d2) / 2;
          if (avgDist < influenceRadius) {
            const factor = Math.pow(1 - avgDist / influenceRadius, 1.8);
            const f1 = Math.pow(1 - Math.min(influenceRadius, d1) / influenceRadius, 2);
            const f2 = Math.pow(1 - Math.min(influenceRadius, d2) / influenceRadius, 2);

            const x1 = baseX + (baseX - mouseX) * f1 * 0.22;
            const ny1 = y1 + (y1 - mouseY) * f1 * 0.22;
            const x2 = baseX + (baseX - mouseX) * f2 * 0.22;
            const ny2 = y2 + (y2 - mouseY) * f2 * 0.22;

            ctx.beginPath();
            ctx.moveTo(x1, ny1);
            ctx.lineTo(x2, ny2);
            ctx.strokeStyle = `rgba(${baseAccent}, ${(0.06 + 0.07 * factor) * globalAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    // Horizontal line highlight segments
    for (let j = -numY; j <= numY; j++) {
      const baseY = j * gridSize;
      const dy = baseY - mouseY;
      if (Math.abs(dy) > influenceRadius) continue;

      for (let i = -numX; i < numX; i += 0.5) {
        const x1 = i * gridSize;
        const x2 = (i + 0.5) * gridSize;
        const d1 = getGridDist(x1 - mouseX, baseY - mouseY);
        const d2 = getGridDist(x2 - mouseX, baseY - mouseY);

        if (d1 < influenceRadius || d2 < influenceRadius) {
          const avgDist = (d1 + d2) / 2;
          if (avgDist < influenceRadius) {
            const factor = Math.pow(1 - avgDist / influenceRadius, 1.8);
            const f1 = Math.pow(1 - Math.min(influenceRadius, d1) / influenceRadius, 2);
            const f2 = Math.pow(1 - Math.min(influenceRadius, d2) / influenceRadius, 2);

            const nx1 = x1 + (x1 - mouseX) * f1 * 0.22;
            const y1 = baseY + (baseY - mouseY) * f1 * 0.22;
            const nx2 = x2 + (x2 - mouseX) * f2 * 0.22;
            const y2 = baseY + (baseY - mouseY) * f2 * 0.22;

            ctx.beginPath();
            ctx.moveTo(nx1, y1);
            ctx.lineTo(nx2, y2);
            ctx.strokeStyle = `rgba(${baseAccent}, ${(0.06 + 0.07 * factor) * globalAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }
  }

  // 4. Labeled Basis Vectors i_hat & j_hat + Translucent Unit Parallelogram Span (Area = det(A))
  if (mlDistortion > 0.01) {
    const vLenBlocks = isMobile ? 2 : 3;
    const vLen = gridSize * vLenBlocks;

    const fontLabel = isSmall ? "bold 13px 'JetBrains Mono', monospace" : (isMobile ? "bold 15px 'JetBrains Mono', monospace" : "bold 18px 'JetBrains Mono', monospace");
    const fontMatrix = isSmall ? "600 12px 'JetBrains Mono', monospace" : (isMobile ? "600 14px 'JetBrains Mono', monospace" : "600 16px 'JetBrains Mono', monospace");
    const fontDet = isSmall ? "600 11px 'JetBrains Mono', monospace" : (isMobile ? "600 13px 'JetBrains Mono', monospace" : "600 15px 'JetBrains Mono', monospace");

    // Basis vector points in current transformed space
    const pOrigin = getDisplacedPoint(0, 0, mouseX, mouseY);
    const pI = getDisplacedPoint(vLen, 0, mouseX, mouseY);
    const pJ = getDisplacedPoint(0, -vLen, mouseX, mouseY);
    const pSum = getDisplacedPoint(vLen, -vLen, mouseX, mouseY);

    // Render Translucent Unit Parallelogram Span (det(A) area) magnetically bending with grid lines
    ctx.save();
    ctx.beginPath();
    const edgePoints = [
      { x1: 0, y1: 0, x2: vLen, y2: 0 },
      { x1: vLen, y1: 0, x2: vLen, y2: -vLen },
      { x1: vLen, y1: -vLen, x2: 0, y2: -vLen },
      { x1: 0, y1: -vLen, x2: 0, y2: 0 }
    ];

    const stepsPerEdge = 16;
    let isFirst = true;
    edgePoints.forEach(edge => {
      for (let s = 0; s <= stepsPerEdge; s++) {
        const t = s / stepsPerEdge;
        const rx = edge.x1 + (edge.x2 - edge.x1) * t;
        const ry = edge.y1 + (edge.y2 - edge.y1) * t;
        const pt = getDisplacedPoint(rx, ry, mouseX, mouseY);
        if (isFirst) {
          ctx.moveTo(pt.x, pt.y);
          isFirst = false;
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
    });

    ctx.closePath();
    ctx.fillStyle = `rgba(43, 255, 136, ${0.11 * mlDistortion * globalAlpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(43, 255, 136, ${0.45 * mlDistortion * globalAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();

    // Basis Vector i_hat (Green Accent #2bff88)
    const iColor = `rgba(43, 255, 136, ${0.98 * mlDistortion * globalAlpha})`;
    drawArrow(ctx, 0, 0, vLen, 0, iColor, mouseX, mouseY);

    // Label i_hat
    ctx.font = fontLabel;
    ctx.fillStyle = iColor;
    ctx.fillText("î", pI.x + (isMobile ? 8 : 14), pI.y + 6);

    // Basis Vector j_hat (Cyan Accent #38bdf8)
    const jColor = `rgba(56, 189, 248, ${0.98 * mlDistortion * globalAlpha})`;
    drawArrow(ctx, 0, 0, 0, -vLen, jColor, mouseX, mouseY);

    // Label j_hat
    ctx.font = fontLabel;
    ctx.fillStyle = jColor;
    ctx.fillText("ĵ", pJ.x - (isMobile ? 4 : 6), pJ.y - (isMobile ? 8 : 14));

    // 5. 3Blue1Brown Grid-Anchored Live Matrix Notation A = [a b; c d] & det(A)
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    const a = (scaleX * cosR - shearY * sinR).toFixed(2);
    const b = (-sinR).toFixed(2);
    const c = (scaleX * sinR + shearY * cosR).toFixed(2);
    const d = (cosR).toFixed(2);
    const detVal = (scaleX).toFixed(2);

    // Matrix notation position: placed cleanly BELOW the horizontal i_hat vector
    const rawMatrixX = isMobile ? (-vLen * 0.05) : (vLen * 0.15);
    const rawMatrixY = isMobile ? 28 : 42;

    const pMatrixPos = getDisplacedPoint(rawMatrixX, rawMatrixY, mouseX, mouseY);
    const mx = pMatrixPos.x;
    const my = pMatrixPos.y;

    const alpha = mlDistortion * globalAlpha;
    const col1Color = `rgba(43, 255, 136, ${0.98 * alpha})`;  // Green (column 1 = i_hat)
    const col2Color = `rgba(56, 189, 248, ${0.98 * alpha})`;  // Cyan (column 2 = j_hat)
    const bracketColor = `rgba(255, 255, 255, ${0.88 * alpha})`;

    // Draw Matrix Label "A ="
    ctx.font = fontLabel;
    ctx.fillStyle = bracketColor;
    ctx.fillText("A = ", mx, my + (isMobile ? 14 : 20));

    const bx = mx + (isMobile ? 32 : 42); // Bracket start position
    const colWidth = isMobile ? 48 : 65;

    // Draw Left Bracket '['
    ctx.strokeStyle = bracketColor;
    ctx.lineWidth = isMobile ? 1.8 : 2.4;
    ctx.beginPath();
    ctx.moveTo(bx + (isMobile ? 4 : 6), my - (isMobile ? 5 : 8));
    ctx.lineTo(bx, my - (isMobile ? 5 : 8));
    ctx.lineTo(bx, my + (isMobile ? 28 : 40));
    ctx.lineTo(bx + (isMobile ? 4 : 6), my + (isMobile ? 28 : 40));
    ctx.stroke();

    // Column 1 (i_hat landing: a, c in Green)
    ctx.font = fontMatrix;
    ctx.fillStyle = col1Color;
    ctx.fillText(a.padStart(5), bx + (isMobile ? 6 : 10), my + (isMobile ? 10 : 14));
    ctx.fillText(c.padStart(5), bx + (isMobile ? 6 : 10), my + (isMobile ? 24 : 34));

    // Column 2 (j_hat landing: b, d in Cyan)
    ctx.fillStyle = col2Color;
    ctx.fillText(b.padStart(5), bx + colWidth, my + (isMobile ? 10 : 14));
    ctx.fillText(d.padStart(5), bx + colWidth, my + (isMobile ? 24 : 34));

    // Draw Right Bracket ']'
    const rbx = bx + colWidth + (isMobile ? 48 : 70);
    ctx.beginPath();
    ctx.moveTo(rbx - (isMobile ? 4 : 6), my - (isMobile ? 5 : 8));
    ctx.lineTo(rbx, my - (isMobile ? 5 : 8));
    ctx.lineTo(rbx, my + (isMobile ? 28 : 40));
    ctx.lineTo(rbx - (isMobile ? 4 : 6), my + (isMobile ? 28 : 40));
    ctx.stroke();

    // det(A) label below matrix
    ctx.font = fontDet;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * alpha})`;
    ctx.fillText(`det = ${detVal}`, bx + (isMobile ? 16 : 28), my + (isMobile ? 44 : 64));
  }
  ctx.restore();
}

/**
 * Renders desktop horizontal wave propagation with spatial decay e^{-gamma * x}.
 */
function renderDesktopWave(state, heroAlpha) {
  const { ctx, width, height, cx, time, globalAlpha, baseAccent, mouseX, mouseY } = state;
  const angle = time * 1.5;

  const r = height * 0.5;
  const targetRightEdge = -cx + width * 0.18;
  const circleCX = targetRightEdge - r;
  const circleCY = 0;
  const waveStartX = targetRightEdge;

  const px = circleCX + Math.cos(angle) * r;
  const py = -Math.sin(angle) * r;

  // Circle Arc (warped by mouse proximity)
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = `rgba(${baseAccent}, ${0.4 * heroAlpha * globalAlpha})`;
  ctx.strokeStyle = `rgba(${baseAccent}, ${0.4 * heroAlpha * globalAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const circleSteps = 64;
  for (let s = 0; s <= circleSteps; s++) {
    const a = (s / circleSteps) * Math.PI * 2;
    const rawX = circleCX + Math.cos(a) * r;
    const rawY = circleCY + Math.sin(a) * r;
    const pt = getDisplacedPoint(rawX, rawY, mouseX, mouseY);
    if (s === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();
  ctx.restore();

  const pCircleCenter = getDisplacedPoint(circleCX, circleCY, mouseX, mouseY);
  const pP = getDisplacedPoint(px, py, mouseX, mouseY);
  const pWaveStart = getDisplacedPoint(waveStartX, py, mouseX, mouseY);

  // Radial Vector
  ctx.strokeStyle = `rgba(${baseAccent}, ${0.5 * heroAlpha * globalAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pCircleCenter.x, pCircleCenter.y);
  ctx.lineTo(pP.x, pP.y);
  ctx.stroke();

  // Projection Line (dashed)
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pP.x, pP.y);
  ctx.lineTo(pWaveStart.x, pWaveStart.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Damped Sine Wave (warped by mouse proximity)
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
    const rawY = -r * damping * Math.sin(wavePhase);

    const pt = getDisplacedPoint(x, rawY, mouseX, mouseY);

    if (x === waveStartX) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();
}

/**
 * Renders mobile vertical wave propagation with spatial decay e^{-gamma * y}.
 */
function renderMobileWave(state, heroAlpha) {
  const { ctx, width, height, cy, time, globalAlpha, baseAccent, mouseX, mouseY } = state;
  const angle = time * 1.5;

  const r = width * 0.5;
  const targetBottomEdge = -cy + height * 0.25;
  const circleCX = 0;
  const circleCY = targetBottomEdge - r;
  const waveStartY = targetBottomEdge;

  const px = circleCX + Math.cos(angle) * r;
  const py = circleCY + Math.sin(angle) * r;

  // Circle Arc (warped by mouse proximity)
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = `rgba(${baseAccent}, ${0.4 * heroAlpha * globalAlpha})`;
  ctx.strokeStyle = `rgba(${baseAccent}, ${0.4 * heroAlpha * globalAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const circleSteps = 64;
  for (let s = 0; s <= circleSteps; s++) {
    const a = (s / circleSteps) * Math.PI * 2;
    const rawX = circleCX + Math.cos(a) * r;
    const rawY = circleCY + Math.sin(a) * r;
    const pt = getDisplacedPoint(rawX, rawY, mouseX, mouseY);
    if (s === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();
  ctx.restore();

  const pCircleCenter = getDisplacedPoint(circleCX, circleCY, mouseX, mouseY);
  const pP = getDisplacedPoint(px, py, mouseX, mouseY);
  const pWaveStart = getDisplacedPoint(px, waveStartY, mouseX, mouseY);

  // Radial Vector
  ctx.strokeStyle = `rgba(${baseAccent}, ${0.5 * heroAlpha * globalAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pCircleCenter.x, pCircleCenter.y);
  ctx.lineTo(pP.x, pP.y);
  ctx.stroke();

  // Projection Line (dashed)
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pP.x, pP.y);
  ctx.lineTo(pWaveStart.x, pWaveStart.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Damped Wave (warped by mouse proximity)
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
    const rawX = r * damping * Math.cos(wavePhase);

    const pt = getDisplacedPoint(rawX, y, mouseX, mouseY);

    if (y === waveStartY) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
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
    mouseX: -1000,
    mouseY: -1000,
    targetMouseX: -1000,
    targetMouseY: -1000,
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

  window.addEventListener("mousemove", (e) => {
    state.targetMouseX = e.clientX - state.cx;
    state.targetMouseY = e.clientY - state.cy;
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    state.targetMouseX = -1000;
    state.targetMouseY = -1000;
  });

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

    state.mouseX += (state.targetMouseX - state.mouseX) * 0.08;
    state.mouseY += (state.targetMouseY - state.mouseY) * 0.08;

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