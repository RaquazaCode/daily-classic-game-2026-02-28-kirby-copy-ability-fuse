import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  stepGame,
  applyInput,
  restartState,
  describeState,
} from '../src/game.js';

describe('kirby copy ability fuse core loop', () => {
  it('starts in start mode with deterministic seed and score 0', () => {
    const state = createInitialState({ seed: 20260228 });
    expect(state.mode).toBe('start');
    expect(state.seed).toBe(20260228);
    expect(state.score).toBe(0);
  });

  it('fuses copy abilities after collecting two distinct stars', () => {
    const base = createInitialState({ seed: 20260228 });
    let state = restartState(base);
    state.mode = 'running';
    state.player.x = 220;
    state.player.y = state.groundY - state.player.height;

    state.abilityStars[0].x = 230;
    state.abilityStars[0].y = state.player.y;
    state.abilityStars[0].kind = 'spark';

    state = stepGame(state, 16.666);
    expect(state.abilities).toContain('spark');

    state.abilityStars[1].x = state.player.x + 4;
    state.abilityStars[1].y = state.player.y;
    state.abilityStars[1].kind = 'beam';

    state = stepGame(state, 16.666);
    expect(state.fusedAbility).toBe('spark-beam');
    expect(state.score).toBeGreaterThanOrEqual(30);
  });

  it('supports pause and resume with key input', () => {
    let state = restartState(createInitialState({ seed: 9 }));
    state.mode = 'running';
    state = applyInput(state, { pausePressed: true });
    expect(state.mode).toBe('paused');
    state = applyInput(state, { pausePressed: true });
    expect(state.mode).toBe('running');
  });

  it('resets run state with reset input', () => {
    let state = restartState(createInitialState({ seed: 1 }));
    state.mode = 'running';
    state.score = 77;
    state.player.x = 400;
    state = applyInput(state, { resetPressed: true });
    expect(state.mode).toBe('start');
    expect(state.score).toBe(0);
    expect(state.player.x).toBe(120);
  });

  it('describeState returns concise deterministic payload', () => {
    const state = createInitialState({ seed: 3 });
    const json = describeState(state);
    const payload = JSON.parse(json);
    expect(payload.coordinateSystem).toContain('origin');
    expect(payload).toHaveProperty('mode');
    expect(payload).toHaveProperty('score');
    expect(payload).toHaveProperty('player');
    expect(payload).toHaveProperty('abilities');
  });
});
