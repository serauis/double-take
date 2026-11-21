// scene-market.js — Scene 2, "The Night Market": three stalls under
// string lights, paper lanterns, a cat on the counter. Same contract as
// every scene: paint the original, and let the `applied` set bake in
// exactly the listed differences for the altered panel.

import {
  circle,
  ellipse,
  label,
  line,
  polygon,
  radialGlow,
  roundedRect,
  seededRandom,
  speckle,
  star,
} from './paintkit.js';

export const marketScene = {
  id: 'market',
  title: 'Scene 2 · The Night Market',
  timeLimit: 150,
  differences: [
    { id: 'lantern-colour', x: 118, y: 128, r: 27, message: 'The paper lantern turned teal', hint: 'the big hanging lantern' },
    { id: 'awning', x: 290, y: 190, r: 34, message: 'The middle awning swapped red for blue', hint: 'the middle stall roof' },
    { id: 'cat', x: 350, y: 290, r: 24, message: 'The cat slipped away', hint: 'the middle counter' },
    { id: 'melon', x: 118, y: 365, r: 20, message: 'An extra melon rolled into the crate', hint: 'the crate on the ground' },
    { id: 'moon', x: 505, y: 50, r: 26, message: 'The crescent moon flipped over', hint: 'the moon' },
    { id: 'bulb', x: 212, y: 79, r: 18, message: 'One string light went dark', hint: 'the string lights' },
    { id: 'jar', x: 455, y: 268, r: 20, message: 'The honey jar is full of jam now', hint: 'the jars on the right stall' },
    { id: 'bunting', x: 205, y: 224, r: 18, message: 'One bunting flag turned magenta', hint: 'the flag between the stalls' },
    { id: 'sign', x: 105, y: 233, r: 20, message: 'The star sign became a circle', hint: 'the left stall sign' },
  ],
  paint(ctx, applied, t) {
    paintNightSky(ctx, applied, t);
    paintStalls(ctx, applied);
    paintGoods(ctx, applied);
    paintGroundLife(ctx, applied, t);
  },
};

function paintNightSky(ctx, applied, t) {
  const grad = ctx.createLinearGradient(0, 0, 0, 452);
  grad.addColorStop(0, '#10142e');
  grad.addColorStop(0.55, '#1d2142');
  grad.addColorStop(1, '#2c2140');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 580, 452);
  // Stars, fixed by seed so both panels match.
  const rand = seededRandom(1234);
  for (let i = 0; i < 70; i++) {
    const sx = rand() * 580;
    const sy = rand() * 130;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.9 + i));
    ctx.fillStyle = `rgba(240, 240, 255, ${0.5 * tw})`;
    ctx.fillRect(sx, sy, 2, 2);
  }
  // Crescent moon: a lit disc with the sky bitten out of one side; the
  // altered panel bites the other side.
  circle(ctx, 505, 50, 24, '#f4ead0');
  const biteX = applied.has('moon') ? 494 : 516;
  circle(ctx, biteX, 44, 20, '#10142e');
  // Rooftop silhouettes behind the stalls.
  polygon(ctx, [[0, 168], [0, 120], [70, 120], [70, 104], [150, 104], [150, 132], [260, 132], [260, 112], [380, 112], [380, 128], [470, 128], [470, 106], [580, 106], [580, 168]], '#0c0f24');
  // String lights: two sagging wires with warm bulbs; one bulb can go dark.
  drawStringLights(ctx, 8, 26, 290, 58, applied.has('bulb') ? 6 : -1, t);
  drawStringLights(ctx, 290, 58, 572, 22, -1, t);
}

function drawStringLights(ctx, x1, y1, x2, y2, darkIndex, t) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + 42, x2, y2);
  ctx.strokeStyle = 'rgba(6, 6, 16, 0.9)';
  ctx.lineWidth = 2;
  ctx.stroke();
  const bulbs = 9;
  for (let i = 0; i < bulbs; i++) {
    const f = (i + 0.5) / bulbs;
    const bx = (1 - f) * (1 - f) * x1 + 2 * (1 - f) * f * ((x1 + x2) / 2) + f * f * x2;
    const by = (1 - f) * (1 - f) * y1 + 2 * (1 - f) * f * (Math.max(y1, y2) + 42) + f * f * y2;
    if (i === darkIndex) {
      circle(ctx, bx, by + 7, 4.5, '#3a3f55');
    } else {
      const flicker = 0.85 + 0.15 * Math.sin(t * 3 + i * 1.7);
      radialGlow(ctx, bx, by + 7, 15 * flicker, 'rgba(255, 196, 92, 0.5)');
      circle(ctx, bx, by + 7, 4.5, '#ffd98a');
    }
  }
}

function paintStalls(ctx, applied) {
  drawStall(ctx, 22, '#c33d4e', applied.has('sign') ? 'circle' : 'star');
  drawStall(ctx, 207, applied.has('awning') ? '#3f6db5' : '#c33d4e', 'moon');
  drawStall(ctx, 392, '#3fae6a', 'diamond');
  // Bunting strung between the stall roofs; one flag can change colour.
  drawBunting(ctx, 196, 210, 214, 210, applied.has('bunting'));
}

function drawStall(ctx, x, awningColour, emblem) {
  // Posts and counter.
  ctx.fillStyle = '#4a3226';
  ctx.fillRect(x + 8, 208, 10, 150);
  ctx.fillRect(x + 148, 208, 10, 150);
  roundedRect(ctx, x, 306, 166, 54, 4, '#5f4128', '#3c2a1a', 2);
  ctx.fillStyle = '#6e4e30';
  ctx.fillRect(x, 306, 166, 10);
  // Striped awning.
  const stripeW = 166 / 6;
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? awningColour : '#f2e6c8';
    polygon(ctx, [
      [x + i * stripeW - 4, 208],
      [x + (i + 1) * stripeW - 4, 208],
      [x + (i + 1) * stripeW + 6, 172],
      [x + i * stripeW + 6, 172],
    ], ctx.fillStyle);
  }
  line(ctx, x - 6, 210, x + 172, 210, '#3c2a1a', 3);
  // Sign board with its emblem.
  roundedRect(ctx, x + 48, 216, 70, 34, 5, '#2c2118', '#8a6a42', 2);
  const cx = x + 83;
  if (emblem === 'star') star(ctx, cx, 233, 5, 11, 5, '#ffd34d');
  else if (emblem === 'circle') circle(ctx, cx, 233, 9, '#ffd34d');
  else if (emblem === 'moon') {
    circle(ctx, cx, 233, 9, '#ffd34d');
    circle(ctx, cx + 4, 230, 7, '#2c2118');
  } else {
    polygon(ctx, [[cx, 223], [cx + 9, 233], [cx, 243], [cx - 9, 233]], '#ffd34d');
  }
}

function drawBunting(ctx, x1, y1, x2, y2, altered) {
  // A short string across the gap between two stall roofs, one flag on it.
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo((x1 + x2) / 2, y1 + 14, x2, y2);
  ctx.strokeStyle = 'rgba(10, 8, 20, 0.8)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  const flagColour = altered ? '#d84fd8' : '#e2703a';
  polygon(ctx, [[196, 214], [214, 214], [205, 234]], flagColour);
}

function paintGoods(ctx, applied) {
  // Left stall: pyramids of oranges and apples.
  fruitPile(ctx, 52, 306, '#e2703a');
  fruitPile(ctx, 118, 306, '#c93b3b');
  // Middle stall: bolts of cloth.
  for (let i = 0; i < 3; i++) {
    roundedRect(ctx, 232 + i * 6, 282 - i * 13, 74, 13, 6, ['#7a4a9e', '#3f9db5', '#d8a03c'][i]);
  }
  roundedRect(ctx, 322, 268, 52, 38, 3, '#8a6a42', '#5f4729', 2);
  // Right stall: jars on the counter; the tall jar's fill can change.
  drawJar(ctx, 420, 268, '#d84fd8');
  drawJar(ctx, 455, 268, applied.has('jar') ? '#7a4a9e' : '#e8a33c');
  drawJar(ctx, 490, 268, '#3fae6a');
  drawJar(ctx, 522, 268, '#c93b3b');
  // Hanging paper lantern, coral or teal, with its glow.
  const lanternColour = applied.has('lantern-colour') ? '#2ea8a0' : '#e2574c';
  line(ctx, 118, 58, 118, 92, '#0c0f24', 3);
  radialGlow(ctx, 118, 128, 56, applied.has('lantern-colour') ? 'rgba(46, 168, 160, 0.4)' : 'rgba(226, 87, 76, 0.42)');
  ellipse(ctx, 118, 128, 30, 36, lanternColour);
  ctx.strokeStyle = 'rgba(60, 20, 20, 0.45)';
  ctx.lineWidth = 1.4;
  for (const off of [-18, -6, 6, 18]) line(ctx, 118 + off, 94, 118 + off, 162, 'rgba(60, 20, 20, 0.45)', 1.4);
  roundedRect(ctx, 104, 90, 28, 8, 3, '#8a6a42');
  roundedRect(ctx, 104, 158, 28, 8, 3, '#8a6a42');
}

function fruitPile(ctx, cx, baseY, colour) {
  const rows = [4, 3, 2, 1];
  rows.forEach((count, row) => {
    for (let i = 0; i < count; i++) {
      const x = cx + (i - (count - 1) / 2) * 17;
      const y = baseY - 8 - row * 14;
      circle(ctx, x, y, 8.5, colour, 'rgba(0,0,0,0.25)', 1);
      circle(ctx, x - 2.5, y - 2.5, 2.2, 'rgba(255,255,255,0.35)');
    }
  });
}

function drawJar(ctx, cx, baseY, fillColour) {
  roundedRect(ctx, cx - 13, baseY - 34, 26, 36, 6, 'rgba(200, 220, 235, 0.35)', 'rgba(220, 235, 245, 0.7)', 1.6);
  ctx.fillStyle = fillColour;
  ctx.fillRect(cx - 10, baseY - 22, 20, 21);
  roundedRect(ctx, cx - 9, baseY - 42, 18, 9, 3, '#8a6a42');
}

function paintGroundLife(ctx, applied, t) {
  // Cobbled ground.
  const grad = ctx.createLinearGradient(0, 360, 0, 452);
  grad.addColorStop(0, '#241c30');
  grad.addColorStop(1, '#171226');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 360, 580, 92);
  const rand = seededRandom(55);
  speckle(ctx, rand, 0, 366, 580, 80, 90, 'rgba(160, 150, 200, 0.13)', 2.4);
  // Crate of melons, bottom left; an extra melon appears once altered.
  roundedRect(ctx, 62, 392, 112, 48, 4, '#7a5a34', '#54401f', 2);
  line(ctx, 62, 416, 174, 416, '#54401f', 3);
  drawMelon(ctx, 84, 392);
  drawMelon(ctx, 118, 394);
  drawMelon(ctx, 152, 392);
  drawMelon(ctx, 100, 376);
  drawMelon(ctx, 136, 378);
  if (applied.has('melon')) drawMelon(ctx, 118, 365);
  // The cat asleep on the middle counter, gone once altered.
  if (!applied.has('cat')) drawCat(ctx, 350, 292, t);
  // A second, smaller lantern to the right.
  line(ctx, 470, 84, 470, 108, '#0c0f24', 3);
  ellipse(ctx, 470, 132, 20, 24, '#d8a03c');
  radialGlow(ctx, 470, 132, 36, 'rgba(216, 160, 60, 0.35)');
}

function drawMelon(ctx, x, y) {
  ellipse(ctx, x, y, 15, 11, '#4d8f4f', '#356b35', 1.6);
  ctx.beginPath();
  ctx.ellipse(x, y, 8, 10, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(30, 70, 30, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function drawCat(ctx, x, y, t) {
  const breathe = Math.sin(t * 1.6) * 0.8;
  ellipse(ctx, x, y, 24, 12 + breathe * 0.3, '#2e2a33');
  circle(ctx, x + 24, y - 6, 10, '#2e2a33');
  polygon(ctx, [[x + 17, y - 13], [x + 21, y - 21], [x + 25, y - 13]], '#2e2a33');
  polygon(ctx, [[x + 26, y - 13], [x + 31, y - 20], [x + 33, y - 11]], '#2e2a33');
  ctx.beginPath();
  ctx.arc(x - 24, y - 2, 9, Math.PI * 0.4, Math.PI * 1.5);
  ctx.strokeStyle = '#2e2a33';
  ctx.lineWidth = 4;
  ctx.stroke();
  circle(ctx, x + 27, y - 7, 1.6, '#ffd34d');
}
