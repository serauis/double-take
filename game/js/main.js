// main.js — Double Take's bootstrap: gather the scenes, wire the input,
// run the frame loop, and honour the staging parameters the maker uses
// to pose the game for its screenshots (?stage=cover and friends pose a
// frozen mid-game moment; ordinary play ignores them).

import { harbourScene } from './scene-harbour.js';
import { marketScene } from './scene-market.js';
import { benchScene } from './scene-bench.js';
import { advance, game, loadScene, newRun, setBanner, startPlaying } from './state.js';
import { drawFrame } from './renderer.js';
import { attachInput } from './input.js';

const SCENES = [harbourScene, marketScene, benchScene];

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

newRun(SCENES);
attachInput(canvas);
applyStaging(new URLSearchParams(window.location.search));

// A small handle for the maker's play-test driver: it reads the run
// state after driving real clicks, and nothing in play depends on it.
window.__dt = { game, scenes: SCENES };

let lastStamp = performance.now();
function frame(stamp) {
  const dt = Math.min(0.05, (stamp - lastStamp) / 1000);
  lastStamp = stamp;
  if (!game.frozen) advance(dt);
  drawFrame(ctx);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function applyStaging(params) {
  const stage = params.get('stage');
  if (!stage && !params.has('scene')) return;
  const presets = {
    cover: { scene: 0, found: ['lamp', 'sail-stripe', 'gull'], left: 66, score: 380, streak: 2, hints: 3 },
    market: { scene: 1, found: ['lantern-colour', 'awning', 'moon', 'bulb'], left: 72, score: 905, streak: 3, hints: 2 },
    bench: { scene: 2, found: ['numeral', 'gear-colour', 'watch-hands', 'lamp-shade', 'blueprint'], left: 44, score: 1610, streak: 1, hints: 1 },
  };
  startPlaying();
  if (stage === 'end') {
    loadScene(SCENES.length - 1);
    game.now = 1.35;
    for (const diff of game.scene.differences) {
      game.found.add(diff.id);
      game.rings.push({ id: diff.id, x: diff.x, y: diff.y, r: diff.r, born: game.now - 2 });
    }
    game.score = 2740;
    game.totalFinds = 27;
    game.bestStreak = 9;
    game.misses = 4;
    game.phase = 'won';
    game.frozen = true;
    return;
  }
  const pose = presets[stage] ?? { scene: 0, found: [], left: null, score: 0, streak: 0, hints: 3 };
  const sceneIndex = Number(params.get('scene') ?? pose.scene);
  loadScene(sceneIndex);
  const foundIds = (params.get('found') ?? pose.found.join(',')).split(',').filter(Boolean);
  game.now = 1.35;
  for (const id of foundIds) {
    const diff = game.scene.differences.find((d) => d.id === id);
    if (!diff) continue;
    game.found.add(id);
    game.rings.push({ id, x: diff.x, y: diff.y, r: diff.r, born: game.now - 2 });
  }
  // The freshest find still celebrates: a young ring and its points.
  const last = game.scene.differences.find((d) => d.id === foundIds[foundIds.length - 1]);
  if (last) {
    const ring = game.rings[game.rings.length - 1];
    if (ring) ring.born = game.now - 0.25;
    game.floaters.push({ x: last.x, y: last.y - last.r - 8, text: '+130', born: game.now - 0.4, colour: '#7be382' });
    setBanner(last.message, 99);
  }
  game.timeLeft = Number(params.get('left') ?? pose.left ?? game.timeLimit);
  game.score = Number(params.get('score') ?? pose.score);
  game.streak = Number(params.get('streak') ?? pose.streak);
  game.bestStreak = game.streak;
  game.hintsLeft = Number(params.get('hints') ?? pose.hints);
  game.totalFinds = foundIds.length;
  game.phase = 'playing';
  game.frozen = true;
}
