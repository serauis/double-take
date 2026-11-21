// paintkit.js — the small drawing toolkit every scene painter shares:
// seeded randomness (so a scene paints identically on every frame and in
// every screenshot), gradients, shapes, and texture strokes on a 2D canvas.

export function seededRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function verticalGradient(ctx, x, y, w, h, stops) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  for (const [at, colour] of stops) grad.addColorStop(at, colour);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  return grad;
}

export function radialGlow(ctx, x, y, radius, colour) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, colour);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

export function circle(ctx, x, y, r, fill, stroke, lineWidth) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth ?? 2;
    ctx.stroke();
  }
}

export function ellipse(ctx, x, y, rx, ry, fill, stroke, lineWidth) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth ?? 2;
    ctx.stroke();
  }
}

export function roundedRect(ctx, x, y, w, h, r, fill, stroke, lineWidth) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth ?? 2;
    ctx.stroke();
  }
}

export function polygon(ctx, points, fill, stroke, lineWidth) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth ?? 2;
    ctx.stroke();
  }
}

export function line(ctx, x1, y1, x2, y2, stroke, lineWidth) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth ?? 2;
  ctx.lineCap = 'round';
  ctx.stroke();
}

export function star(ctx, x, y, spikes, outer, inner, fill) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function gear(ctx, x, y, teeth, radius, toothDepth, fill, holeFill) {
  ctx.beginPath();
  const steps = teeth * 2;
  for (let i = 0; i <= steps; i++) {
    const r = i % 2 === 0 ? radius + toothDepth : radius;
    const a = (Math.PI * i) / teeth;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  circle(ctx, x, y, radius * 0.38, holeFill);
}

export function label(ctx, text, x, y, font, fill, align) {
  ctx.font = font;
  ctx.textAlign = align ?? 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

export function speckle(ctx, rand, x, y, w, h, count, colour, maxSize) {
  ctx.fillStyle = colour;
  for (let i = 0; i < count; i++) {
    const sx = x + rand() * w;
    const sy = y + rand() * h;
    const s = 0.6 + rand() * (maxSize ?? 1.6);
    ctx.fillRect(sx, sy, s, s);
  }
}
