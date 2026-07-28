/**
 * Canvas Engine - Math Field Background Animation
 */

export function initCanvas() {
  const canvas = document.getElementById("math-field");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height;
  let scrollProgress = 0;
  let time = 0;
  const baseAccent = "43, 255, 136";

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("scroll", () => {
    const maxScroll = Math.max(
      1,
      document.body.scrollHeight - window.innerHeight
    );
    scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  });

  function smoothstep(min, max, value) {
    if (value <= min) return 0;
    if (value >= max) return 1;
    const x = (value - min) / (max - min);
    return x * x * (3 - 2 * x);
  }

  function peak(min, max, value) {
    const mid = (min + max) / 2;
    if (value <= min || value >= max) return 0;
    if (value < mid) return smoothstep(min, mid, value);
    return 1 - smoothstep(mid, max, value);
  }

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

  function draw() {
    ctx.clearRect(0, 0, width, height);
    time += 0.005;

    const p = scrollProgress;
    const cx = width / 2;
    const cy = height / 2;

    const collapseFactor = smoothstep(0.85, 1.0, p);
    const globalScale = Math.max(0.001, 1 - collapseFactor);
    const globalAlpha = 1 - collapseFactor;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(globalScale, globalScale);

    const gridSize = 60;
    const mlDistortion = peak(0.2, 0.88, p);

    // --- Grid & Vectors ---
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
      const arrowColor = `rgba(${baseAccent}, ${0.1 * mlDistortion * globalAlpha})`;
      drawArrow(ctx, 0, 0, vLen, 0, arrowColor);
      drawArrow(ctx, 0, 0, 0, -vLen, arrowColor);
    }
    ctx.restore();

    // --- Hero Visual (Circle Arc & Damped Sine Wave) ---
    const heroAlpha = 1 - smoothstep(0.15, 0.25, p);
    if (heroAlpha > 0.01) {
      const isMobile = width <= 768;
      const angle = time * 1.5;

      if (!isMobile) {
        // Desktop Layout (min-width: 769px):
        // Horizontal propagation (left-to-right)
        // Circle arc covers 100% of vertical height, constrained to left-most ~15-20% width.
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

        // Damped Wave (Exponential spatial decay e^{-gamma * x})
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
      } else {
        // Mobile Layout (max-width: 768px):
        // Vertical propagation (top-to-bottom)
        // Semi-circle arc in top 20%-30% of viewport height, spanning full horizontal width.
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

        // Damped Wave (Exponential spatial decay e^{-gamma * y})
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
    }

    ctx.restore();
    requestAnimationFrame(draw);
  }

  draw();
}
