# daily-classic-game-2026-02-28-kirby-copy-ability-fuse

<div align="center">
  <h3>Kirby-style platformer MVP with deterministic Copy Ability Fuse gameplay.</h3>
  <p>Collect two distinct ability stars to fuse powers, dodge roaming enemies, and clear the stage with a time bonus.</p>
</div>

<div align="center">
  <img src="assets/images/hero.png" alt="Kirby Copy Ability Fuse hero frame" width="720" />
</div>

## Quick Start
```bash
pnpm install
pnpm dev
```

## How To Play
- Press `Enter` to start a run.
- Move with `Arrow Left/Right` or `A/D`.
- Jump with `Space`, `Arrow Up`, or `W`.
- Press `P` to pause/resume.
- Press `R` to reset and restart.

## Rules
- Collect all ability stars to clear the stage.
- Enemy contact costs 1 HP and 5 points.
- Reaching 0 HP ends the run.
- First two distinct stars fuse into a combined ability.

## Scoring
- +10 per collected ability star.
- +20 when first fused ability is created.
- -5 on enemy collision.
- Stage clear bonus: up to +200 based on clear time.

## Twist
- **Copy Ability Fuse**: The first two unique stars collected are fused into one combined ability tag (for example `spark-beam`) and award a bonus.

## Verification
```bash
pnpm test
pnpm build
pnpm self-check
node "" \
  --url "http://127.0.0.1:4173/" \
  --actions-file playwright/actions/main-actions.json \
  --iterations 3 \
  --pause-ms 250 \
  --screenshot-dir playwright/main-actions
```

## Project Layout
- `src/` game logic, deterministic step function, canvas renderer, browser hooks.
- `test/` unit tests for deterministic rules and controls.
- `scripts/self_check.mjs` scripted deterministic proof of fused ability and pause/resume.
- `playwright/actions/` and `playwright/main-actions/` browser automation payloads and capture artifacts.
- `assets/` README media assets.
- `docs/plans/` implementation plan.

## GIF Captures
- `Opening + Start`: `assets/gifs/clip-1-opening.gif`
- `Fuse Trigger`: `assets/gifs/clip-2-fuse.gif`
- `Pause and Reset`: `assets/gifs/clip-3-pause-reset.gif`
