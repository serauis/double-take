// scene-harbour.js — Scene 1, "Harbour at Dusk": a lighthouse, a sailboat
// and a pier under a low sun. The painter draws the original picture; the
// `applied` set names the differences to bake into the altered panel, so
// the two panels differ exactly at the listed spots and nowhere else.

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
  verticalGradient,
} from './paintkit.js';

export const harbourScene = {
  id: 'harbour',
  title: 'Scene 1 · Harbour at Dusk',
  timeLimit: 120,
  differences: [
    { id: 'lamp', x: 95, y: 128, r: 27, message: 'The lighthouse lamp burns red, not amber', hint: 'the lighthouse light' },
    { id: 'sail-stripe', x: 422, y: 287, r: 26, message: 'The sail lost its red stripe', hint: 'the big sail' },
    { id: 'gull', x: 252, y: 90, r: 24, message: 'One gull has flown away', hint: 'the birds in the sky' },
    { id: 'buoy', x: 505, y: 392, r: 24, message: 'The buoy turned green', hint: 'the buoy in the water' },
    { id: 'lantern', x: 545, y: 294, r: 24, message: 'The pier lantern went out', hint: 'the lamp on the pier post' },
    { id: 'starfish', x: 148, y: 404, r: 22, message: 'A starfish appeared on the rocks', hint: 'the rocks by the water' },
    { id: 'flag', x: 418, y: 202, r: 20, message: 'The pennant changed shape', hint: 'the flag on the mast' },
  ],
  paint(ctx, applied, t) {
    paintSky(ctx, t);
    paintSea(ctx, t);
    paintLighthouse(ctx, applied);
    paintSailboat(ctx, applied, t);
    paintPier(ctx, applied);
    paintDetails(ctx, applied, t);
  },
};

function paintSky(ctx, t) {
  verticalGradient(ctx, 0, 0, 580, 300, [
    [0, '#241640'],
    [0.45, '#5c2750'],
    [0.78, '#b34a4e'],
    [1, '#e2703a'],
  ]);
  // Low sun and its halo.
  radialGlow(ctx, 408, 268, 120, 'rgba(255, 166, 66, 0.5)');
  circle(ctx, 408, 268, 34, '#ffb347');
  circle(ctx, 408, 268, 34, null, 'rgba(255, 214, 140, 0.8)', 3);
  // Clouds: dark bellies, ember rims.
  const clouds = [
    [110, 62, 74],
    [300, 40, 56],
    [478, 88, 64],
    [180, 128, 48],
  ];
  for (const [cx, cy, w] of clouds) {
    ellipse(ctx, cx, cy, w, w * 0.26, '#3a2150');
    ellipse(ctx, cx - w * 0.3, cy + 3, w * 0.55, w * 0.2, '#33204a');
    ellipse(ctx, cx + 4, cy - w * 0.1, w * 0.7, w * 0.12, 'rgba(255, 138, 90, 0.35)');
  }
  // Distant hills along the horizon.
  polygon(ctx, [[0, 292], [90, 258], [190, 288], [300, 266], [430, 292], [580, 272], [580, 300], [0, 300]], '#2c1c3e');
}

function paintSea(ctx, t) {
  verticalGradient(ctx, 0, 292, 580, 160, [
    [0, '#7a3b4f'],
    [0.25, '#3d2c55'],
    [1, '#1d2440'],
  ]);
  // Sun path: a broken column of light under the sun.
  const rand = seededRandom(41);
  for (let i = 0; i < 46; i++) {
    const y = 300 + rand() * 140;
    const spread = 12 + (y - 292) * 0.24;
    const x = 408 + (rand() - 0.5) * spread * 2;
    const w = 6 + rand() * 22;
    const shimmer = 0.55 + 0.45 * Math.sin(t * 1.7 + y * 0.35);
    ctx.fillStyle = `rgba(255, 170, 80, ${0.25 * shimmer})`;
    ctx.fillRect(x - w / 2, y, w, 2.4);
  }
  // General sparkle.
  const spark = seededRandom(97);
  ctx.fillStyle = 'rgba(220, 200, 255, 0.35)';
  for (let i = 0; i < 60; i++) {
    ctx.fillRect(spark() * 580, 300 + spark() * 146, 2, 1.4);
  }
}

function paintLighthouse(ctx, applied) {
  // Rocks the tower stands on.
  polygon(ctx, [[18, 452], [30, 372], [66, 338], [128, 344], [168, 386], [176, 452]], '#241a30');
  polygon(ctx, [[30, 372], [66, 338], [104, 356], [70, 388]], '#31223f');
  // Tower: tapering bands.
  polygon(ctx, [[66, 344], [76, 168], [114, 168], [124, 344]], '#e8ddc8');
  polygon(ctx, [[72, 268], [118, 268], [121, 306], [69, 306]], '#c33d4e');
  polygon(ctx, [[77, 196], [113, 196], [115, 228], [75, 228]], '#c33d4e');
  polygon(ctx, [[66, 344], [124, 344], [126, 356], [64, 356]], '#8d7f68');
  // Gallery and lamp room.
  roundedRect(ctx, 66, 156, 58, 12, 4, '#3a2c22');
  const lampColour = applied.has('lamp') ? '#ff4444' : '#ffbf47';
  if (!applied.has('lamp')) radialGlow(ctx, 95, 138, 52, 'rgba(255, 191, 71, 0.55)');
  else radialGlow(ctx, 95, 138, 46, 'rgba(255, 68, 68, 0.5)');
  roundedRect(ctx, 78, 118, 34, 38, 4, lampColour, '#2c2118', 3);
  line(ctx, 95, 118, 95, 156, 'rgba(44, 33, 24, 0.6)', 2);
  polygon(ctx, [[72, 118], [118, 118], [95, 98]], '#54382a');
  circle(ctx, 95, 96, 4, '#2c2118');
  // Door and a window.
  roundedRect(ctx, 86, 312, 18, 32, 7, '#4a3226');
  circle(ctx, 95, 246, 6, '#ffd98a', '#4a3226', 2);
}

function paintSailboat(ctx, applied, t) {
  const bob = Math.sin(t * 1.3) * 2;
  const baseY = 348 + bob;
  // Hull.
  polygon(ctx, [[330, baseY], [478, baseY], [452, baseY + 30], [356, baseY + 30]], '#6e3b2a');
  polygon(ctx, [[330, baseY], [478, baseY], [470, baseY + 10], [338, baseY + 10]], '#8a4b32');
  line(ctx, 404, baseY, 404, 196 + bob, '#4a3226', 5);
  // Mainsail: cream, with a red stripe the altered panel loses.
  polygon(ctx, [[412, 206 + bob], [412, 338 + bob], [470, 338 + bob]], '#f2e6c8');
  if (!applied.has('sail-stripe')) {
    polygon(ctx, [[412, 262 + bob], [441, 300 + bob], [412, 300 + bob]], '#c33d4e');
  }
  // Foresail.
  polygon(ctx, [[396, 216 + bob], [396, 338 + bob], [346, 338 + bob]], '#e6d3ac');
  // Pennant: a triangle on the original, a rectangle once altered.
  if (applied.has('flag')) {
    polygon(ctx, [[404, 196 + bob], [436, 196 + bob], [436, 210 + bob], [404, 210 + bob]], '#3f9db5');
  } else {
    polygon(ctx, [[404, 194 + bob], [438, 201 + bob], [404, 208 + bob]], '#3f9db5');
  }
  // Reflection smear.
  ctx.fillStyle = 'rgba(242, 230, 200, 0.14)';
  ctx.fillRect(352, baseY + 38, 110, 5);
  ctx.fillRect(368, baseY + 48, 76, 4);
}

function paintPier(ctx, applied) {
  // Deck running in from the right edge.
  polygon(ctx, [[318, 452], [330, 366], [580, 356], [580, 452]], '#4f3826');
  const rand = seededRandom(7);
  for (let i = 0; i < 7; i++) {
    const y = 372 + i * 12;
    line(ctx, 326 + rand() * 6, y, 580, y - 6, 'rgba(0, 0, 0, 0.28)', 2);
  }
  line(ctx, 330, 366, 580, 356, '#6b4c30', 5);
  // Posts down into the water.
  for (const x of [356, 448, 540]) {
    ctx.fillStyle = '#3c2a1c';
    ctx.fillRect(x, 366, 12, 86);
  }
  // Crates stacked on the deck.
  roundedRect(ctx, 336, 322, 44, 40, 3, '#8a6a42', '#5f4729', 2);
  roundedRect(ctx, 346, 288, 36, 36, 3, '#9a784c', '#5f4729', 2);
  line(ctx, 336, 342, 380, 342, '#5f4729', 2);
  // Lantern post at the pier's end: lit warm, or dark once altered.
  line(ctx, 545, 356, 545, 268, '#2e2016', 6);
  line(ctx, 545, 268, 545, 282, '#2e2016', 3);
  if (applied.has('lantern')) {
    roundedRect(ctx, 533, 282, 24, 28, 5, '#57493a', '#241a12', 2);
  } else {
    radialGlow(ctx, 545, 296, 44, 'rgba(255, 196, 86, 0.6)');
    roundedRect(ctx, 533, 282, 24, 28, 5, '#ffca66', '#241a12', 2);
    circle(ctx, 545, 296, 5, '#fff3c4');
  }
}

function paintDetails(ctx, applied, t) {
  // Gulls: simple double-arc silhouettes; the third is gone once altered.
  drawGull(ctx, 168, 74, 15);
  drawGull(ctx, 330, 118, 12);
  if (!applied.has('gull')) drawGull(ctx, 252, 90, 13);
  // Buoy bobbing in the swell, red or green.
  const bobY = Math.sin(t * 1.8 + 2) * 2.5;
  const buoyColour = applied.has('buoy') ? '#3fae6a' : '#d84a4a';
  polygon(ctx, [[486, 398 + bobY], [524, 398 + bobY], [514, 424 + bobY], [496, 424 + bobY]], buoyColour);
  ctx.fillStyle = '#f2e6c8';
  ctx.fillRect(492, 406 + bobY, 26, 6);
  circle(ctx, 505, 390 + bobY, 6, '#2c2118');
  circle(ctx, 505, 390 + bobY, 3, '#ffd98a');
  // Rowboat tied near the rocks.
  polygon(ctx, [[196, 402], [286, 402], [268, 424], [212, 424]], '#37586e');
  line(ctx, 206, 402, 276, 402, '#7a5c3e', 4);
  line(ctx, 240, 396, 262, 372, '#7a5c3e', 3);
  // A starfish shows on the rocks only in the altered panel.
  if (applied.has('starfish')) {
    star(ctx, 148, 404, 5, 17, 8, '#e2703a');
    circle(ctx, 148, 404, 3, '#b34a2e');
  }
  // Wet sheen at the waterline.
  const rand = seededRandom(23);
  speckle(ctx, rand, 10, 428, 560, 18, 40, 'rgba(255, 200, 150, 0.25)', 2);
}

function drawGull(ctx, x, y, size) {
  ctx.beginPath();
  ctx.arc(x - size * 0.55, y, size * 0.55, Math.PI * 1.15, Math.PI * 1.85);
  ctx.arc(x + size * 0.55, y, size * 0.55, Math.PI * 1.15, Math.PI * 1.85);
  ctx.strokeStyle = '#1d1430';
  ctx.lineWidth = 2.6;
  ctx.stroke();
}
