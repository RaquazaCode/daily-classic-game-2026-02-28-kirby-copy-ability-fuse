# Implementation Plan - 2026-02-28 kirby-copy-ability-fuse

## Selected Game
- Source queue rank #1: Kirby's Adventure (`kirby-s-adventure`)
- Twist selected: `Copy ability fuse`

## Scope
- Build a deterministic single-stage Kirby-inspired platformer MVP.
- Core loop: move, jump, collect ability stars, avoid enemies, fuse first two distinct abilities.
- Required controls and systems: start, pause/resume (`P`), reset (`R`), restart flow after win/loss.
- Browser hooks: `window.advanceTime(ms)` and `window.render_game_to_text()`.

## Milestones
1. Scaffold folder + pnpm project + red tests + first commit + GitHub repo bootstrap.
2. Implement pure game engine (`createInitialState`, `applyInput`, `stepGame`, `describeState`) and canvas runtime.
3. Add self-check script and Playwright scripted capture artifacts.
4. Complete docs and media sections, then run full verification and publish via PR merge.

## Verification Plan
- `pnpm test`
- `pnpm build`
- `pnpm self-check`
- Playwright client capture run against preview server using standard payload schema.
