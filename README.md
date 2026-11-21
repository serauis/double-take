# Double Take — a spot-the-difference game

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/serauis/double-take/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/serauis/double-take/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

**Double Take** is an original spot-the-difference game for
[make.fun's "Make the best spot the difference game" bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).
Two near-identical hand-painted pictures stand side by side; click each
difference — on either picture — before the clock runs out.

Three scenes of rising difficulty: a harbour at dusk (7 differences), a
night market (9), and a clockmaker's bench (11, with smaller targets).
A miss costs 5 seconds, a hint costs 15 and halves the points, streaks
raise the score, and every sound is synthesised live with WebAudio — the
game is static files only, no build step, no network, no assets to load.

## Run it

Serve `game/` with any static file server and open `index.html` in a
desktop browser:

```sh
python3 -m http.server 8080 --directory game
# then open http://localhost:8080 in a desktop browser
```

## Hand it in

`main.ts` (Node 22, standard library only) copies `game/` and
`screenshots/` to the output directory and writes `dossier.json` with
the kit's `buildDossier` from `vendor/makefun-game.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Licensed under the MIT License — see `LICENSE`.
