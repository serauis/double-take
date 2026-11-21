// audio.js — every sound in Double Take is synthesised with WebAudio at
// play time: no audio files, nothing to load. A find chimes on a note that
// climbs with the player's streak, a miss buzzes low, a hint sparkles, and
// clearing a scene plays a short fanfare.

let context = null;
let master = null;
let muted = false;

export function unlockAudio() {
  if (context) {
    if (context.state === 'suspended') context.resume();
    return;
  }
  const Maker = window.AudioContext ?? window.webkitAudioContext;
  if (!Maker) return;
  context = new Maker();
  master = context.createGain();
  master.gain.value = 0.5;
  master.connect(context.destination);
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function tone(freqFrom, freqTo, at, dur, type, volume) {
  if (!context || muted) return;
  const osc = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + at;
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), start + dur);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

export function playFindChime(streak) {
  const step = Math.min(streak, 10);
  const base = 587 * Math.pow(2, step / 12);
  tone(base, base, 0, 0.16, 'sine', 0.5);
  tone(base * 1.5, base * 1.5, 0.07, 0.22, 'sine', 0.4);
  tone(base * 2, base * 2, 0.13, 0.3, 'triangle', 0.22);
}

export function playMissBuzz() {
  tone(150, 92, 0, 0.18, 'sawtooth', 0.32);
  tone(110, 70, 0.02, 0.2, 'square', 0.14);
}

export function playHintSparkle() {
  tone(1560, 1560, 0, 0.12, 'sine', 0.3);
  tone(2090, 2090, 0.09, 0.14, 'sine', 0.26);
  tone(2630, 2350, 0.18, 0.24, 'sine', 0.2);
}

export function playSceneClear() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((n, i) => tone(n, n, i * 0.11, 0.26, 'triangle', 0.4));
  tone(1318, 1318, 0.46, 0.4, 'sine', 0.3);
}

export function playGameWon() {
  const notes = [523, 659, 784, 1046, 784, 1046, 1318];
  notes.forEach((n, i) => tone(n, n, i * 0.12, 0.3, 'triangle', 0.38));
}

export function playTimeLost() {
  tone(392, 392, 0, 0.22, 'triangle', 0.36);
  tone(330, 330, 0.2, 0.22, 'triangle', 0.36);
  tone(262, 196, 0.4, 0.44, 'triangle', 0.36);
}

export function playButtonTick() {
  tone(880, 760, 0, 0.06, 'sine', 0.2);
}
