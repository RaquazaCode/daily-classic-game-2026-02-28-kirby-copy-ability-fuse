import { createInitialState, restartState, stepGame, applyInput, describeState } from '../src/game.js';

let state = restartState(createInitialState({ seed: 20260228 }));
state = applyInput(state, { startPressed: true });
state.player.x = 220;
state.player.y = state.groundY - state.player.height;

state.abilityStars[0].x = 220;
state.abilityStars[0].y = state.player.y;
state.abilityStars[0].kind = 'spark';
state = stepGame(state, 16.666);

state.abilityStars[1].x = state.player.x;
state.abilityStars[1].y = state.player.y;
state.abilityStars[1].kind = 'beam';
state = stepGame(state, 16.666);

state = applyInput(state, { pausePressed: true });
const pausedMode = state.mode;
state = applyInput(state, { pausePressed: true });
const resumedMode = state.mode;

const summary = {
  fusedAbility: state.fusedAbility,
  score: state.score,
  pausedMode,
  resumedMode,
  snapshotMode: JSON.parse(describeState(state)).mode,
};

console.log(JSON.stringify(summary, null, 2));

if (!summary.fusedAbility || summary.pausedMode !== 'paused' || summary.resumedMode !== 'running') {
  process.exit(1);
}
