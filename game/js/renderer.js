// renderer.js — everything Double Take draws each frame: the desk
// backdrop, the HUD with its big remaining-differences counter, the
// draining timer bar, the two panels (original left, altered right),
// found rings, hint glows, floating score text, miss marks, the message
// banner, the control buttons, and the title / clear / win / lose cards.

import {
  HINT_BUTTON,
  LAYOUT,
  OVERLAY_BUTTON,
  RESTART_BUTTON,
  SOUND_BUTTON,
  VIEW,
  game,
  panelOrigin,
  remaining,
} from './state.js';
import { circle, label, line, roundedRect } from './paintkit.js';
import { isMuted } from './audio.js';

const NO_DIFFS = new Set();
let alteredCache = { sceneId: null, set: new Set() };

function alteredSet() {
  if (!game.scene) return NO_DIFFS;
  if (alteredCache.sceneId !== game.scene.id) {
    alteredCache = {
      sceneId: game.scene.id,
      set: new Set(game.scene.differences.map((d) => d.id)),
    };
  }
  return alteredCache.set;
}

export function drawFrame(ctx) {
  ctx.save();
  applyShake(ctx);
  drawBackdrop(ctx);
  drawPanel(ctx, 'left', NO_DIFFS);
  drawPanel(ctx, 'right', alteredSet());
  drawHud(ctx);
  drawTimerBar(ctx);
  drawBanner(ctx);
  drawControls(ctx);
  if (game.phase !== 'playing') drawOverlay(ctx);
  ctx.restore();
}

function applyShake(ctx) {
  if (game.now < game.shakeUntil) {
    const left = game.shakeUntil - game.now;
    const mag = Math.min(7, left * 20);
    const dx = (Math.random() - 0.5) * mag;
    const dy = (Math.random() - 0.5) * mag;
    ctx.translate(dx, dy);
  }
}

function drawBackdrop(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  grad.addColorStop(0, '#241b12');
  grad.addColorStop(1, '#171208');
  ctx.fillStyle = grad;
  ctx.fillRect(-12, -12, VIEW.width + 24, VIEW.height + 24);
}

function drawHud(ctx) {
  label(ctx, 'DOUBLE TAKE', LAYOUT.leftX + 4, 34, 'bold 31px Georgia', '#e8c97a', 'left');
  const sceneLine = game.scene ? game.scene.title : '';
  label(ctx, sceneLine, LAYOUT.leftX + 4, 66, '15px Georgia', '#b8a888', 'left');
  // The remaining counter: the biggest type on the screen.
  const left = remaining();
  roundedRect(ctx, 490, 12, 300, 62, 12, '#0f0c08', '#8a6a42', 2);
  label(ctx, `${left}`, 588, 44, 'bold 42px Georgia', left <= 3 ? '#ffb347' : '#f4ecd4');
  label(ctx, 'TO FIND', 668, 44, 'bold 19px Georgia', '#b8a888', 'left');
  // Score block, right aligned.
  label(ctx, `SCORE ${game.score.toLocaleString('en-US')}`, 1246, 30, 'bold 23px Georgia', '#f4ecd4', 'right');
  const streakText = game.streak >= 2 ? `STREAK ×${game.streak} · BEST ×${Math.max(game.bestStreak, game.streak)}` : 'STREAK —';
  label(ctx, streakText, 1246, 58, 'bold 15px Georgia', game.streak >= 2 ? '#ffb347' : '#8a7c60', 'right');
  const secs = Math.max(0, Math.ceil(game.timeLeft));
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  label(ctx, `TIME ${clock}`, 1246, 78, 'bold 14px Georgia', game.timeLeft <= 20 && game.phase === 'playing' ? '#e2574c' : '#b8a888', 'right');
}

function drawTimerBar(ctx) {
  const x = LAYOUT.leftX;
  const w = VIEW.width - LAYOUT.leftX * 2;
  roundedRect(ctx, x, LAYOUT.timerY, w, LAYOUT.timerHeight, 7, '#0f0c08');
  const frac = game.timeLimit > 0 ? Math.max(0, game.timeLeft / game.timeLimit) : 0;
  if (frac > 0) {
    let colour = '#7be382';
    if (frac <= 0.25) colour = '#e2574c';
    else if (frac <= 0.5) colour = '#e8c97a';
    if (frac <= 0.15) {
      const pulse = 0.65 + 0.35 * Math.sin(game.now * 10);
      ctx.globalAlpha = pulse;
    }
    roundedRect(ctx, x, LAYOUT.timerY, Math.max(14, w * frac), LAYOUT.timerHeight, 7, colour);
    ctx.globalAlpha = 1;
  }
}

function drawPanel(ctx, side, applied) {
  const origin = panelOrigin(side);
  ctx.save();
  // Frame and shadow.
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  roundedRect(ctx, origin.x - 5, origin.y - 5, LAYOUT.panelW + 10, LAYOUT.panelH + 10, 10, '#3a2b1a');
  ctx.shadowColor = 'transparent';
  ctx.translate(origin.x, origin.y);
  ctx.beginPath();
  ctx.rect(0, 0, LAYOUT.panelW, LAYOUT.panelH);
  ctx.clip();
  if (game.scene) game.scene.paint(ctx, applied, game.now);
  drawHintGlow(ctx, side);
  drawFoundRings(ctx);
  drawFloaters(ctx);
  drawMissMarks(ctx, side);
  ctx.restore();
  roundedRect(ctx, origin.x - 5, origin.y - 5, LAYOUT.panelW + 10, LAYOUT.panelH + 10, 10, null, '#8a6a42', 2);
  const caption = side === 'left' ? 'ORIGINAL' : 'SPOT THE CHANGES';
  label(ctx, caption, origin.x + LAYOUT.panelW / 2, origin.y - 11, 'bold 11px Georgia', '#8a7c60');
}

function drawFoundRings(ctx) {
  for (const ring of game.rings) {
    const age = game.now - ring.born;
    const pulse = age < 0.9 ? 1 + Math.sin(age * 14) * 0.06 * (1 - age) : 1;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.r * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = '#58e06a';
    ctx.lineWidth = age < 0.9 ? 5 : 3.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.r * pulse + 3.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(20, 60, 25, 0.65)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}

function drawHintGlow(ctx) {
  if (!game.scene || game.hintGlowId === null) return;
  if (game.now > game.hintGlowUntil) return;
  const diff = game.scene.differences.find((d) => d.id === game.hintGlowId);
  if (!diff || game.found.has(diff.id)) return;
  const pulse = 1 + Math.sin(game.now * 6) * 0.12;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, (diff.r + 10) * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffd34d';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, (diff.r + 18) * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 211, 77, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawFloaters(ctx) {
  for (const floater of game.floaters) {
    const age = game.now - floater.born;
    const rise = age * 34;
    ctx.globalAlpha = Math.max(0, 1 - age / 1.3);
    label(ctx, floater.text, floater.x, floater.y - rise, 'bold 21px Georgia', floater.colour);
    ctx.globalAlpha = 1;
  }
}

function drawMissMarks(ctx, side) {
  for (const mark of game.missMarks) {
    if (mark.side !== side) continue;
    const age = game.now - mark.born;
    ctx.globalAlpha = Math.max(0, 1 - age / 0.7);
    const s = 11;
    line(ctx, mark.x - s, mark.y - s, mark.x + s, mark.y + s, '#e2574c', 5);
    line(ctx, mark.x + s, mark.y - s, mark.x - s, mark.y + s, '#e2574c', 5);
    ctx.globalAlpha = 1;
  }
}

function drawBanner(ctx) {
  roundedRect(ctx, LAYOUT.leftX, LAYOUT.bannerY, VIEW.width - LAYOUT.leftX * 2, LAYOUT.bannerH, 9, '#efe3c2');
  let text = 'Click a difference — in either picture — before the clock runs out.';
  if (game.now < game.bannerUntil && game.bannerText) text = game.bannerText;
  if (game.phase === 'title') text = 'Two pictures. Small lies. Find them all.';
  label(ctx, text, VIEW.width / 2, LAYOUT.bannerY + LAYOUT.bannerH / 2 + 1, 'italic 18px Georgia', '#4a3820');
}

function drawControls(ctx) {
  // Hint button with its remaining pips.
  const hintsOff = game.phase !== 'playing' || game.hintsLeft <= 0;
  roundedRect(ctx, HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.w, HINT_BUTTON.h, 10, hintsOff ? '#3a3128' : '#8a6a1f', '#c9a227', 2);
  label(ctx, `HINT  −15s`, HINT_BUTTON.x + HINT_BUTTON.w / 2, HINT_BUTTON.y + 21, 'bold 18px Georgia', hintsOff ? '#8a7c60' : '#ffe9a8');
  for (let i = 0; i < 3; i++) {
    const cx = HINT_BUTTON.x + HINT_BUTTON.w / 2 - 18 + i * 18;
    circle(ctx, cx, HINT_BUTTON.y + 42, 5, i < game.hintsLeft ? '#ffd34d' : 'rgba(255, 255, 255, 0.18)');
  }
  // Scene progress in the middle.
  const dots = game.scenes.map((s, i) => i);
  for (const i of dots) {
    const cx = VIEW.width / 2 - (dots.length - 1) * 16 + i * 32;
    circle(ctx, cx, LAYOUT.controlsY + 16, 7, i === game.sceneIndex ? '#e8c97a' : i < game.sceneIndex ? '#7be382' : 'rgba(255,255,255,0.2)');
  }
  label(ctx, `Scene ${game.sceneIndex + 1} of ${game.scenes.length}`, VIEW.width / 2, LAYOUT.controlsY + 42, '14px Georgia', '#b8a888');
  // Sound and restart buttons.
  roundedRect(ctx, SOUND_BUTTON.x, SOUND_BUTTON.y, SOUND_BUTTON.w, SOUND_BUTTON.h, 10, '#2c241a', '#8a6a42', 2);
  label(ctx, isMuted() ? 'SOUND OFF' : 'SOUND ON', SOUND_BUTTON.x + SOUND_BUTTON.w / 2, SOUND_BUTTON.y + 29, 'bold 14px Georgia', '#d8c9a3');
  roundedRect(ctx, RESTART_BUTTON.x, RESTART_BUTTON.y, RESTART_BUTTON.w, RESTART_BUTTON.h, 10, '#2c241a', '#8a6a42', 2);
  label(ctx, 'RESTART', RESTART_BUTTON.x + RESTART_BUTTON.w / 2, RESTART_BUTTON.y + 29, 'bold 14px Georgia', '#d8c9a3');
}

function drawOverlay(ctx) {
  ctx.fillStyle = 'rgba(12, 9, 5, 0.66)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  roundedRect(ctx, 330, 138, 620, 424, 16, '#f2e6c8', '#8a6a42', 3);
  const cx = VIEW.width / 2;
  if (game.phase === 'title') {
    label(ctx, 'DOUBLE TAKE', cx, 208, 'bold 56px Georgia', '#4a3220');
    label(ctx, 'a spot-the-difference hunt in three pictures', cx, 252, 'italic 19px Georgia', '#7a5c34');
    label(ctx, 'Two near-identical pictures stand side by side.', cx, 306, '18px Georgia', '#4a3820');
    label(ctx, 'Click every difference — on either picture — before time runs out.', cx, 336, '18px Georgia', '#4a3820');
    label(ctx, 'A miss costs 5 seconds. A hint costs 15, and halves the points.', cx, 366, '18px Georgia', '#4a3820');
    label(ctx, 'Three scenes: a harbour, a night market, a clockmaker’s bench.', cx, 396, '18px Georgia', '#4a3820');
    drawOverlayButton(ctx, 'START HUNTING');
  } else if (game.phase === 'clear') {
    label(ctx, 'SCENE CLEAR!', cx, 216, 'bold 46px Georgia', '#3f7a34');
    label(ctx, `Time bonus  +${game.clearBonus}`, cx, 292, '22px Georgia', '#4a3820');
    label(ctx, `Score  ${game.score.toLocaleString('en-US')}`, cx, 330, '22px Georgia', '#4a3820');
    label(ctx, `Next: ${game.scenes[game.sceneIndex + 1].title}`, cx, 384, 'italic 18px Georgia', '#7a5c34');
    drawOverlayButton(ctx, 'NEXT SCENE');
  } else if (game.phase === 'won') {
    label(ctx, 'YOU FOUND THEM ALL', cx, 216, 'bold 44px Georgia', '#3f7a34');
    label(ctx, `Final score  ${game.score.toLocaleString('en-US')}`, cx, 290, '24px Georgia', '#4a3820');
    label(ctx, `${game.totalFinds} differences found · best streak ×${game.bestStreak}`, cx, 332, '19px Georgia', '#4a3820');
    label(ctx, `${game.misses} misses along the way`, cx, 364, '19px Georgia', '#4a3820');
    drawOverlayButton(ctx, 'PLAY AGAIN');
  } else if (game.phase === 'lost') {
    label(ctx, 'TIME’S UP', cx, 216, 'bold 46px Georgia', '#b03a2e');
    const total = game.scene ? game.scene.differences.length : 0;
    label(ctx, `You found ${game.found.size} of ${total} differences.`, cx, 292, '22px Georgia', '#4a3820');
    label(ctx, 'The rest are still hiding in the picture.', cx, 330, 'italic 18px Georgia', '#7a5c34');
    drawOverlayButton(ctx, 'RETRY SCENE');
  }
}

function drawOverlayButton(ctx, text) {
  roundedRect(ctx, OVERLAY_BUTTON.x, OVERLAY_BUTTON.y, OVERLAY_BUTTON.w, OVERLAY_BUTTON.h, 12, '#3f7a34', '#2c5524', 2);
  label(ctx, text, OVERLAY_BUTTON.x + OVERLAY_BUTTON.w / 2, OVERLAY_BUTTON.y + OVERLAY_BUTTON.h / 2 + 1, 'bold 22px Georgia', '#f4ecd4');
}
