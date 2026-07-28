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

    const heroAlpha = 1 - smoothstep(0.15, 0.25, p);
    if (heroAlpha > 0.01) {
      const r = height * 0.42;
      const circleCX = -cx - r * 0.2;
      const waveStartX = circleCX + r;
      const angle = time * 1.5;
      const px = Math.cos(angle) * r;
      const py = -Math.sin(angle) * r;

      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = `rgba(${baseAccent}, ${0.4 * heroAlpha * globalAlpha})`;
      ctx.strokeStyle = `rgba(${baseAccent}, ${0.4 * heroAlpha * globalAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(circleCX, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = `rgba(${baseAccent}, ${0.5 * heroAlpha * globalAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(circleCX, 0);
      ctx.lineTo(circleCX + px, py);
      ctx.stroke();

      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(circleCX + px, py);
      ctx.lineTo(waveStartX, py);
      ctx.stroke();
      ctx.setLineDash([]);

      const waveGrad = ctx.createLinearGradient(waveStartX, 0, cx * 0.8, 0);
      waveGrad.addColorStop(
        0,
        `rgba(${baseAccent}, ${0.5 * heroAlpha * globalAlpha})`
      );
      waveGrad.addColorStop(1, `rgba(${baseAccent}, 0)`);

      ctx.strokeStyle = waveGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = waveStartX; x < cx; x += 2) {
        const distance = x - waveStartX;
        const wavePhase = angle - distance * 0.015;
        const wy = -Math.sin(wavePhase) * r;
        if (x === waveStartX) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    ctx.restore();
    requestAnimationFrame(draw);
  }

  draw();
}