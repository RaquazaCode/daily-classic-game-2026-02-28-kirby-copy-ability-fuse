# Design - kirby-copy-ability-fuse

## Experience Goals
- Emulate compact retro platformer feel with modern readable visuals.
- Keep deterministic simulation so automation and replay checks remain stable.
- Highlight today's twist: collecting two unique copy stars fuses into a combined ability bonus.

## Rules
- Player starts in `start` mode and enters `running` on Enter.
- Move with arrow keys/A-D, jump with Space/Up/W.
- Collecting an ability star grants +10 score and stores ability.
- First time two distinct abilities are held, fuse activates (for example `spark-beam`) and grants +20 bonus.
- Enemy collision subtracts 5 score and one HP; at 0 HP game enters `game_over`.
- Collect all stars to win and receive a time bonus.
- `P` toggles pause/resume, `R` resets to a deterministic fresh run.

## Deterministic Model
- Seeded LCG RNG builds initial star/enemy positions.
- `stepGame(state, deltaMs)` is pure and deterministic.
- `window.advanceTime(ms)` advances in fixed-size simulation slices.
- `window.render_game_to_text()` returns concise JSON for automated checks.

## Snapshot Contract
- `mode`, `coordinateSystem`, `score`, `hp`, `elapsedMs`
- `player` pose and velocity
- `abilities`, `fusedAbility`
- active stars and active enemies
- short `summary` status message
