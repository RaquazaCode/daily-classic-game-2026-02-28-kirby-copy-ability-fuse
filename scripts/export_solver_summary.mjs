import { createInitialState, restartState, stepGame, applyInput, describeState } from '../src/game.js';
import { writeFileSync } from 'node:fs';

let state = restartState(createInitialState({ seed: 20260228 }));
state = applyInput(state, { startPressed: true });
state.player.x = 220;
state.player.y = state.groundY - state.player.height;

state.abilityStars[0].x = 220;
state.abilityStars[0].y = state.player.y;
state.abilityStars[0].kind = 'spark';
state = stepGame(state, 16.666);

state.abilityStars[1].x = 220;
state.abilityStars[1].y = state.player.y;
state.abilityStars[1].kind = 'beam';
state = stepGame(state, 16.666);

const beforePause = state.mode;
state = applyInput(state, { pausePressed: true });
const pausedMode = state.mode;
state = applyInput(state, { pausePressed: true });
const resumedMode = state.mode;

const summary = {
  startedMode: beforePause,
  fusedAbility: state.fusedAbility,
  scoreAfterFuse: state.score,
  pausedMode,
  resumedMode,
  deterministicSeed: state.seed,
};

writeFileSync('playwright/main-actions/solver-summary.json', JSON.stringify(summary, null, 2));
writeFileSync('playwright/main-actions/solver-final-state.json', JSON.stringify(JSON.parse(describeState(state)), null, 2));
console.log(JSON.stringify(summary));

if (!summary.fusedAbility || summary.scoreAfterFuse < 30) {
  process.exit(1);
}
