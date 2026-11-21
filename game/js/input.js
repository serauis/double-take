// input.js — pointer and keyboard control. A click on either panel is
// tested against the scene's unfound differences (forgiving radius, so a
// near click still counts); the buttons and overlay cards are hit-tested
// against the same rectangles renderer.js draws.

import {
  HINT_BUTTON,
  LAYOUT,
  OVERLAY_BUTTON,
  RESTART_BUTTON,
  SOUND_BUTTON,
  VIEW,
  applyFind,
  applyHint,
  applyMiss,
  game,
  insideRect,
  nextScene,
  panelOrigin,
  retryScene,
  startPlaying,
} from './state.js';
import { playButtonTick, toggleMute, unlockAudio } from './audio.js';

const CLICK_SLACK = 24;

export function attachInput(canvas) {
  canvas.addEventListener('pointerdown', (event) => {
    unlockAudio();
    const point = toGamePoint(canvas, event);
    if (point) handlePoint(point.x, point.y);
  });
  window.addEventListener('keydown', (event) => handleKey(event.key));
}

function toGamePoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEW.width,
    y: ((event.clientY - rect.top) / rect.height) * VIEW.height,
  };
}

export function handlePoint(x, y) {
  if (game.phase === 'title') {
    if (insideRect(x, y, OVERLAY_BUTTON)) return act(() => startPlaying());
    return;
  }
  if (game.phase === 'clear') {
    if (insideRect(x, y, OVERLAY_BUTTON)) return act(() => nextScene());
    return;
  }
  if (game.phase === 'won') {
    if (insideRect(x, y, OVERLAY_BUTTON)) return act(() => startPlaying());
    return;
  }
  if (game.phase === 'lost') {
    if (insideRect(x, y, OVERLAY_BUTTON)) return act(() => retryScene());
    return;
  }
  // phase === 'playing'
  if (insideRect(x, y, HINT_BUTTON)) return act(() => applyHint());
  if (insideRect(x, y, SOUND_BUTTON)) return act(() => toggleMute());
  if (insideRect(x, y, RESTART_BUTTON)) return act(() => retryScene());
  for (const side of ['left', 'right']) {
    const origin = panelOrigin(side);
    if (x >= origin.x && x < origin.x + LAYOUT.panelW && y >= origin.y && y < origin.y + LAYOUT.panelH) {
      clickPanel(x - origin.x, y - origin.y, side);
      return;
    }
  }
}

function clickPanel(panelX, panelY, side) {
  let best = null;
  let bestDist = Infinity;
  for (const diff of game.scene.differences) {
    if (game.found.has(diff.id)) continue;
    const dist = Math.hypot(diff.x - panelX, diff.y - panelY);
    if (dist <= Math.max(diff.r, CLICK_SLACK) && dist < bestDist) {
      best = diff;
      bestDist = dist;
    }
  }
  if (best) applyFind(best);
  else applyMiss(panelX, panelY, side);
}

function handleKey(key) {
  unlockAudio();
  if (key === 'h' || key === 'H') {
    if (game.phase === 'playing') act(() => applyHint());
  } else if (key === 'm' || key === 'M') {
    act(() => toggleMute());
  } else if (key === 'r' || key === 'R') {
    if (game.phase === 'playing' || game.phase === 'lost') act(() => retryScene());
  } else if (key === ' ' || key === 'Enter') {
    if (game.phase === 'title' || game.phase === 'won') act(() => startPlaying());
    else if (game.phase === 'clear') act(() => nextScene());
    else if (game.phase === 'lost') act(() => retryScene());
  }
}

function act(fn) {
  playButtonTick();
  fn();
}
