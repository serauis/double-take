// scene-bench.js — Scene 3, "The Clockmaker's Bench": a wall clock, a
// shelf of small clocks and a bench crowded with watches, gears and
// tools. The differences here are the smallest of the three scenes —
// a missing screw, a changed gear, hands at a different time.

import {
  circle,
  ellipse,
  gear,
  label,
  line,
  polygon,
  radialGlow,
  roundedRect,
  seededRandom,
  speckle,
} from './paintkit.js';

export const benchScene = {
  id: 'bench',
  title: 'Scene 3 · The Clockmaker’s Bench',
  timeLimit: 180,
  differences: [
    { id: 'numeral', x: 150, y: 84, r: 15, message: 'The XII fell off the wall clock', hint: 'the top of the wall clock' },
    { id: 'watch-hands', x: 250, y: 352, r: 19, message: 'This watch tells a different time', hint: 'the open watch on the left' },
    { id: 'gear-colour', x: 182, y: 384, r: 21, message: 'The big gear is steel, not brass', hint: 'the big gear on the bench' },
    { id: 'screw', x: 155, y: 402, r: 13, message: 'A screw is missing from the dish', hint: 'the little dish of screws' },
    { id: 'lamp-shade', x: 72, y: 258, r: 20, message: 'The lamp shade turned burgundy', hint: 'the desk lamp' },
    { id: 'flame', x: 543, y: 218, r: 14, message: 'The candle went out', hint: 'the candle on the right' },
    { id: 'spring', x: 516, y: 276, r: 16, message: 'The spring turned gold', hint: 'the coil spring' },
    { id: 'key', x: 258, y: 418, r: 14, message: 'The winding key vanished', hint: 'below the open watch' },
    { id: 'magnifier', x: 330, y: 334, r: 15, message: 'The magnifier handle turned black', hint: 'the magnifying glass' },
    { id: 'blueprint', x: 128, y: 340, r: 19, message: 'The blueprint gear lost two teeth', hint: 'the drawing under the lamp' },
    { id: 'bell', x: 372, y: 40, r: 15, message: 'The alarm clock lost a bell', hint: 'the small clock on the shelf' },
  ],
  paint(ctx, applied, t) {
    paintRoom(ctx);
    paintWallClock(ctx, applied, t);
    paintShelf(ctx, applied);
    paintBenchTop(ctx, applied, t);
  },
};

function paintRoom(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, 452);
  grad.addColorStop(0, '#3a2a20');
  grad.addColorStop(0.66, '#2e2119');
  grad.addColorStop(0.67, '#241a12');
  grad.addColorStop(1, '#1d140d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 580, 452);
  // Wall panelling lines.
  for (const x of [96, 480]) line(ctx, x, 0, x, 300, 'rgba(0, 0, 0, 0.25)', 2);
  line(ctx, 0, 300, 580, 300, 'rgba(0, 0, 0, 0.4)', 3);
  // The bench surface: warm planks with grain.
  const wood = ctx.createLinearGradient(0, 300, 0, 452);
  wood.addColorStop(0, '#6e4e30');
  wood.addColorStop(1, '#4c3420');
  ctx.fillStyle = wood;
  ctx.fillRect(0, 300, 580, 152);
  const rand = seededRandom(31);
  for (let i = 0; i < 5; i++) {
    const y = 318 + i * 28;
    line(ctx, 0, y, 580, y, 'rgba(30, 18, 8, 0.35)', 2);
    for (let j = 0; j < 9; j++) {
      const gx = rand() * 560;
      line(ctx, gx, y + 6 + rand() * 14, gx + 22 + rand() * 30, y + 6 + rand() * 14, 'rgba(30, 18, 8, 0.16)', 1.2);
    }
  }
  speckle(ctx, seededRandom(77), 0, 306, 580, 140, 60, 'rgba(255, 220, 170, 0.06)', 2);
}

function paintWallClock(ctx, applied, t) {
  // Case and face.
  roundedRect(ctx, 66, 30, 168, 268, 12, '#4c3420', '#2c1d10', 3);
  circle(ctx, 150, 138, 74, '#efe3c2', '#2c1d10', 4);
  circle(ctx, 150, 138, 62, null, '#b09b6a', 1.6);
  // Hour markers; the XII at the top can be missing.
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * i) / 6 - Math.PI / 2;
    const x = 150 + Math.cos(a) * 54;
    const y = 138 + Math.sin(a) * 54;
    if (i === 0 && applied.has('numeral')) continue;
    if (i % 3 === 0) label(ctx, ['XII', 'III', 'VI', 'IX'][i / 3], x, y, 'bold 13px Georgia', '#3a2a18');
    else circle(ctx, x, y, 2.4, '#3a2a18');
  }
  // Hands at ten past ten, and a thin second hand that moves.
  const hourA = ((10 + 10 / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  const minA = (10 / 60) * Math.PI * 2 - Math.PI / 2;
  line(ctx, 150, 138, 150 + Math.cos(hourA) * 34, 138 + Math.sin(hourA) * 34, '#2c1d10', 6);
  line(ctx, 150, 138, 150 + Math.cos(minA) * 50, 138 + Math.sin(minA) * 50, '#2c1d10', 4);
  const secA = ((t % 60) / 60) * Math.PI * 2 - Math.PI / 2;
  line(ctx, 150, 138, 150 + Math.cos(secA) * 56, 138 + Math.sin(secA) * 56, '#b03a2e', 1.6);
  circle(ctx, 150, 138, 5, '#2c1d10');
  // Pendulum behind glass below the face.
  roundedRect(ctx, 108, 226, 84, 60, 6, 'rgba(160, 190, 210, 0.16)', '#2c1d10', 2);
  const swing = Math.sin(t * 2.2) * 10;
  line(ctx, 150, 226, 150 + swing, 272, '#b09b6a', 3);
  circle(ctx, 150 + swing, 276, 11, '#c9a227', '#7a5c14', 1.6);
}

function paintShelf(ctx, applied) {
  // Shelf board and brackets.
  ctx.fillStyle = '#54382a';
  ctx.fillRect(318, 92, 244, 12);
  polygon(ctx, [[336, 104], [352, 104], [336, 126]], '#3c2a1a');
  polygon(ctx, [[528, 104], [544, 104], [544, 126]], '#3c2a1a');
  // Alarm clock with two bells; one bell can be gone.
  circle(ctx, 396, 66, 24, '#37586e', '#22384a', 3);
  circle(ctx, 396, 66, 18, '#efe3c2');
  line(ctx, 396, 66, 396 + 9, 66 - 8, '#22384a', 2.4);
  line(ctx, 396, 66, 396 - 11, 66 + 3, '#22384a', 2.4);
  if (!applied.has('bell')) {
    line(ctx, 380, 48, 372, 40, '#8a8f96', 3);
    circle(ctx, 370, 38, 7, '#c9ccd2', '#8a8f96', 1.6);
  }
  line(ctx, 412, 48, 420, 40, '#8a8f96', 3);
  circle(ctx, 422, 38, 7, '#c9ccd2', '#8a8f96', 1.6);
  line(ctx, 384, 88, 378, 94, '#22384a', 3);
  line(ctx, 408, 88, 414, 94, '#22384a', 3);
  // Books with coloured spines.
  const spines = ['#7a3b3b', '#3b5a7a', '#4d7a3b', '#8a6a2a'];
  spines.forEach((colour, i) => {
    roundedRect(ctx, 436 + i * 20, 56 + (i % 2) * 4, 17, 36 - (i % 2) * 4, 2, colour, 'rgba(0,0,0,0.3)', 1);
  });
  // A jar of spare hands and a small oil can.
  roundedRect(ctx, 524, 58, 26, 34, 5, 'rgba(200, 220, 235, 0.3)', 'rgba(220,235,245,0.6)', 1.4);
  line(ctx, 531, 84, 543, 66, '#3a2a18', 1.6);
  line(ctx, 534, 86, 546, 74, '#3a2a18', 1.6);
}

function paintBenchTop(ctx, applied, t) {
  drawDeskLamp(ctx, applied);
  drawBlueprint(ctx, applied);
  drawPocketWatch(ctx, 250, 352, applied.has('watch-hands') ? 4.33 : 10.17, '#c9a227');
  drawPocketWatch(ctx, 428, 348, 2.6, '#b9bec7');
  drawPocketWatch(ctx, 336, 398, 7.75, '#a87f2e');
  // Gears resting on the bench.
  gear(ctx, 182, 384, 9, 26, 7, applied.has('gear-colour') ? '#9aa1ab' : '#c9a227', '#4c3420');
  gear(ctx, 486, 402, 8, 19, 5, '#8a6a2a', '#4c3420');
  gear(ctx, 392, 322, 7, 13, 4, '#b9bec7', '#4c3420');
  // Magnifier: glass disc and a handle whose colour can change.
  circle(ctx, 302, 306, 21, 'rgba(190, 215, 230, 0.35)', '#8a8f96', 3.5);
  const handleColour = applied.has('magnifier') ? '#1f1a16' : '#7a4a26';
  line(ctx, 316, 322, 340, 344, handleColour, 8);
  // Dish of screws; one screw can be missing.
  ellipse(ctx, 140, 408, 34, 12, '#6b7280', '#454a52', 2);
  ellipse(ctx, 140, 405, 28, 9, '#596068');
  drawScrew(ctx, 122, 402);
  drawScrew(ctx, 140, 406);
  if (!applied.has('screw')) drawScrew(ctx, 155, 402);
  drawScrew(ctx, 131, 410);
  // Coil spring standing by the candle, steel or gold.
  drawSpring(ctx, 516, 292, applied.has('spring') ? '#c9a227' : '#b9bec7');
  drawCandle(ctx, applied, t);
  // Screwdriver laid diagonally.
  line(ctx, 478, 330, 522, 362, '#8a8f96', 5);
  line(ctx, 522, 362, 544, 378, '#b03a2e', 9);
  // Tweezers.
  line(ctx, 356, 428, 398, 420, '#9aa1ab', 3);
  line(ctx, 358, 434, 398, 426, '#9aa1ab', 3);
  // The winding key, there or gone.
  if (!applied.has('key')) {
    circle(ctx, 258, 418, 7, null, '#c9a227', 3);
    line(ctx, 258, 425, 258, 434, '#c9a227', 3.4);
    line(ctx, 253, 434, 263, 434, '#c9a227', 3.4);
  }
}

function drawDeskLamp(ctx, applied) {
  // Base, arm and shade; the shade's enamel can change colour.
  ellipse(ctx, 62, 296, 30, 9, '#2c2c30');
  line(ctx, 62, 292, 84, 252, '#2c2c30', 7);
  const shadeColour = applied.has('lamp-shade') ? '#7a2436' : '#2e6e5e';
  polygon(ctx, [[38, 258], [92, 232], [104, 254], [52, 282]], shadeColour);
  polygon(ctx, [[52, 282], [104, 254], [98, 264], [58, 288]], '#1d1d20');
  radialGlow(ctx, 96, 282, 74, 'rgba(255, 205, 110, 0.4)');
  circle(ctx, 92, 266, 7, '#ffd98a');
}

function drawBlueprint(ctx, applied) {
  // A sheet of blue paper under the lamp, with a gear drawn in white.
  polygon(ctx, [[52, 316], [196, 306], [204, 366], [60, 378]], '#2c4a72');
  polygon(ctx, [[52, 316], [196, 306], [204, 366], [60, 378]], null, 'rgba(220, 235, 250, 0.5)', 1.6);
  const teeth = applied.has('blueprint') ? 6 : 8;
  gear(ctx, 128, 340, teeth, 17, 5, 'rgba(230, 240, 252, 0.85)', '#2c4a72');
  line(ctx, 160, 322, 190, 318, 'rgba(230, 240, 252, 0.6)', 1.6);
  line(ctx, 160, 334, 186, 330, 'rgba(230, 240, 252, 0.6)', 1.6);
  line(ctx, 160, 346, 178, 343, 'rgba(230, 240, 252, 0.6)', 1.6);
  circle(ctx, 84, 356, 9, null, 'rgba(230, 240, 252, 0.6)', 1.6);
}

function drawPocketWatch(ctx, cx, cy, timeHours, metal) {
  // Open pocket watch: case ring, face, hands for the given time, chain.
  circle(ctx, cx, cy, 25, metal, '#5c4a1e', 2);
  circle(ctx, cx, cy, 20, '#f4ecd4');
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * i) / 6;
    const x = cx + Math.sin(a) * 16;
    const y = cy - Math.cos(a) * 16;
    circle(ctx, x, y, i % 3 === 0 ? 1.9 : 1.1, '#3a2a18');
  }
  const hourA = ((timeHours % 12) / 12) * Math.PI * 2;
  const minA = ((timeHours % 1) * 60 / 60) * Math.PI * 2;
  line(ctx, cx, cy, cx + Math.sin(hourA) * 10, cy - Math.cos(hourA) * 10, '#2c1d10', 3);
  line(ctx, cx, cy, cx + Math.sin(minA) * 15, cy - Math.cos(minA) * 15, '#2c1d10', 2.2);
  circle(ctx, cx, cy, 2.4, '#2c1d10');
  circle(ctx, cx, cy - 30, 5, null, metal, 2.4);
  ctx.beginPath();
  ctx.arc(cx + 26, cy + 20, 18, Math.PI * 0.9, Math.PI * 1.7);
  ctx.strokeStyle = metal;
  ctx.lineWidth = 1.8;
  ctx.stroke();
}

function drawScrew(ctx, x, y) {
  line(ctx, x - 4, y, x + 4, y, '#c9ccd2', 2.6);
  line(ctx, x, y, x, y + 6, '#9aa1ab', 2.2);
}

function drawSpring(ctx, x, y, colour) {
  ctx.beginPath();
  const coils = 6;
  for (let i = 0; i <= coils * 8; i++) {
    const f = i / (coils * 8);
    const px = x + Math.sin(f * coils * Math.PI * 2) * 9;
    const py = y - f * 34;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ellipse(ctx, x, y + 3, 13, 4, 'rgba(0, 0, 0, 0.3)');
}

function drawCandle(ctx, applied, t) {
  // Brass holder, white candle, and a flame that can be out.
  ellipse(ctx, 543, 268, 17, 6, '#8a6a2a');
  roundedRect(ctx, 534, 232, 18, 36, 3, '#efe8da', '#c9bda6', 1.4);
  line(ctx, 543, 232, 543, 226, '#3a2a18', 2);
  if (!applied.has('flame')) {
    const flicker = Math.sin(t * 9) * 1.2;
    radialGlow(ctx, 543, 218, 30, 'rgba(255, 180, 80, 0.5)');
    ellipse(ctx, 543 + flicker * 0.4, 218, 5.5, 10, '#ffb347');
    ellipse(ctx, 543 + flicker * 0.4, 221, 2.6, 5.5, '#fff0b8');
  } else {
    ctx.beginPath();
    ctx.arc(543, 216, 5, Math.PI * 1.15, Math.PI * 1.7);
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}
