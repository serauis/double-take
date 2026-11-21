// state.js — Double Take's rules and run state: the layout both panels
// share, the clock, the score, and what a click, a miss and a hint do.
// Rendering lives in renderer.js and input in input.js; this file only
// decides what is true about the game right now.

import {
  playFindChime,
  playGameWon,
  playHintSparkle,
  playMissBuzz,
  playSceneClear,
  playTimeLost,
} from './audio.js';

export const VIEW = { width: 1280, height: 720 };

export const LAYOUT = {
  hudHeight: 84,
  timerY: 84,
  timerHeight: 14,
  panelY: 116,
  panelW: 580,
  panelH: 452,
  leftX: 30,
  rightX: 670,
  bannerY: 584,
  bannerH: 40,
  controlsY: 640,
  controlsH: 56,
};

export const HINT_BUTTON = { x: 30, y: 640, w: 220, h: 56 };
export const SOUND_BUTTON = { x: 1010, y: 640, w: 110, h: 56 };
export const RESTART_BUTTON = { x: 1130, y: 640, w: 120, h: 56 };
export const OVERLAY_BUTTON = { x: 440, y: 468, w: 400, h: 64 };

export const MISS_TIME_PENALTY = 5;
export const HINT_TIME_COST = 15;
export const HINTS_PER_SCENE = 3;

export function panelOrigin(side) {
  return {
    x: side === 'left' ? LAYOUT.leftX : LAYOUT.rightX,
    y: LAYOUT.panelY,
  };
}

export function insideRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export const game = {
  phase: 'title',
  scenes: [],
  sceneIndex: 0,
  scene: null,
  found: new Set(),
  hinted: new Set(),
  hintsLeft: HINTS_PER_SCENE,
  score: 0,
  streak: 0,
  bestStreak: 0,
  totalFinds: 0,
  misses: 0,
  timeLeft: 0,
  timeLimit: 0,
  now: 0,
  frozen: false,
  rings: [],
  floaters: [],
  missMarks: [],
  shakeUntil: 0,
  bannerText: '',
  bannerUntil: 0,
  scoreAtSceneStart: 0,
  hintGlowId: null,
  hintGlowUntil: 0,
  clearBonus: 0,
};

export function remaining() {
  if (!game.scene) return 0;
  return game.scene.differences.length - game.found.size;
}

export function newRun(scenes) {
  game.scenes = scenes;
  game.score = 0;
  game.totalFinds = 0;
  game.misses = 0;
  game.bestStreak = 0;
  loadScene(0);
  game.phase = 'title';
}

export function startPlaying() {
  game.score = 0;
  game.totalFinds = 0;
  game.misses = 0;
  game.bestStreak = 0;
  loadScene(0);
  game.phase = 'playing';
}

export function loadScene(index) {
  game.sceneIndex = index;
  game.scene = game.scenes[index];
  game.scoreAtSceneStart = game.score;
  game.found = new Set();
  game.hinted = new Set();
  game.hintsLeft = HINTS_PER_SCENE;
  game.streak = 0;
  game.timeLimit = game.scene.timeLimit;
  game.timeLeft = game.scene.timeLimit;
  game.rings = [];
  game.floaters = [];
  game.missMarks = [];
  game.hintGlowId = null;
  game.hintGlowUntil = 0;
  game.clearBonus = 0;
  setBanner(`${game.scene.title} — find ${game.scene.differences.length} differences`, 3.2);
}

export function setBanner(text, seconds) {
  game.bannerText = text;
  game.bannerUntil = game.now + seconds;
}

export function applyFind(diff) {
  const wasHinted = game.hinted.has(diff.id);
  game.found.add(diff.id);
  game.streak += 1;
  game.bestStreak = Math.max(game.bestStreak, game.streak);
  game.totalFinds += 1;
  let points = 100 + Math.min(150, (game.streak - 1) * 15);
  if (wasHinted) points = Math.round(points / 2 / 5) * 5;
  game.score += points;
  game.rings.push({ id: diff.id, x: diff.x, y: diff.y, r: diff.r, born: game.now });
  game.floaters.push({
    x: diff.x,
    y: diff.y - diff.r - 8,
    text: `+${points}`,
    born: game.now,
    colour: wasHinted ? '#d9b45b' : '#7be382',
  });
  setBanner(diff.message, 2.6);
  playFindChime(game.streak);
  if (remaining() === 0) finishScene();
  return points;
}

export function applyMiss(panelX, panelY, side) {
  game.misses += 1;
  game.streak = 0;
  game.timeLeft = Math.max(0, game.timeLeft - MISS_TIME_PENALTY);
  game.missMarks.push({ x: panelX, y: panelY, side, born: game.now });
  game.shakeUntil = game.now + 0.35;
  setBanner(`Not there — ${MISS_TIME_PENALTY} seconds lost`, 1.6);
  playMissBuzz();
  if (game.timeLeft <= 0) loseScene();
}

export function applyHint() {
  if (game.phase !== 'playing') return null;
  if (game.hintsLeft <= 0) {
    setBanner('No hints left this scene', 1.6);
    return null;
  }
  const open = game.scene.differences.filter((d) => !game.found.has(d.id));
  if (open.length === 0) return null;
  const pick = open[Math.floor(Math.random() * open.length)];
  game.hintsLeft -= 1;
  game.timeLeft = Math.max(0, game.timeLeft - HINT_TIME_COST);
  game.hinted.add(pick.id);
  game.hintGlowId = pick.id;
  game.hintGlowUntil = game.now + 3;
  setBanner(`Hint: ${pick.hint} (−${HINT_TIME_COST}s, half points)`, 3);
  playHintSparkle();
  if (game.timeLeft <= 0) loseScene();
  return pick;
}

export function finishScene() {
  game.clearBonus = Math.ceil(game.timeLeft) * 2;
  game.score += game.clearBonus;
  if (game.sceneIndex >= game.scenes.length - 1) {
    game.phase = 'won';
    playGameWon();
  } else {
    game.phase = 'clear';
    playSceneClear();
  }
}

export function loseScene() {
  if (game.phase !== 'playing') return;
  game.phase = 'lost';
  game.timeLeft = 0;
  playTimeLost();
}

export function nextScene() {
  loadScene(game.sceneIndex + 1);
  game.phase = 'playing';
}

export function retryScene() {
  game.score = game.scoreAtSceneStart;
  loadScene(game.sceneIndex);
  game.phase = 'playing';
}

export function advance(dt) {
  game.now += dt;
  if (game.phase === 'playing' && !game.frozen) {
    game.timeLeft -= dt;
    if (game.timeLeft <= 0) loseScene();
  }
  const cutoff = game.now - 1.4;
  game.floaters = game.floaters.filter((f) => f.born > cutoff);
  game.missMarks = game.missMarks.filter((m) => m.born > game.now - 0.7);
  game.rings = game.rings.filter((r) => game.now - r.born < 1.2 || game.found.has(r.id));
}
