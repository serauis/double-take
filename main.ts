// Double Take — hand-in program for the make.fun spot-the-difference bounty.
//
// The game itself is a folder of static files under game/ plus the maker's
// screenshots under screenshots/. This program copies both into the output
// directory and writes dossier.json there with the kit's buildDossier, so
// the dossier is exactly the one the scorer rebuilds from the same files.
//
// The output directory is /output under the grader; outside it, the
// MAKEFUN_OUTPUT_DIR environment variable stands in for /output.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The caps the bounty's scorer grades with: passing them here makes this
// program refuse exactly where the scorer would, never after it.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function handIn(): void {
  mkdirSync(outputDir, { recursive: true });
  for (const part of ['game', 'screenshots']) {
    const target = join(outputDir, part);
    rmSync(target, { recursive: true, force: true });
    cpSync(join(repoRoot, part), target, { recursive: true });
  }
  const dossier = buildDossier(outputDir, DOSSIER_CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

// A last look at what was handed in: the game must be there with its
// opening page, and the screenshots must number three or four — the two
// facts the gate's first rows check, caught here with a plainer message.
function verifyHandIn(): void {
  if (!existsSync(join(outputDir, 'game', 'index.html'))) {
    throw new Error('hand-in failed: game/index.html is missing from the output');
  }
  const shots = readdirSync(join(outputDir, 'screenshots')).filter(
    (name) => !name.startsWith('.'),
  );
  if (shots.length < 3 || shots.length > 4) {
    throw new Error(`hand-in failed: expected 3 or 4 screenshots, found ${shots.length}`);
  }
}

handIn();
verifyHandIn();
