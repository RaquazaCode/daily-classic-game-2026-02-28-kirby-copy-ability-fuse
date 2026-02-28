const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 540;
const GRAVITY = 0.0018;
const MOVE_SPEED = 0.24;
const JUMP_SPEED = -0.68;

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function aabb(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function spawnStar(index, rng) {
  const kinds = ['spark', 'beam', 'cutter'];
  const x = 220 + index * 220 + Math.floor(rng() * 60);
  const y = 280 + Math.floor(rng() * 110);
  return {
    id: `star-${index}`,
    x,
    y,
    width: 18,
    height: 18,
    kind: kinds[index % kinds.length],
    active: true,
  };
}

function spawnEnemy(index, rng, groundY) {
  const dir = index % 2 === 0 ? 1 : -1;
  return {
    id: `enemy-${index}`,
    x: 180 + index * 180,
    y: groundY - 40,
    width: 30,
    height: 40,
    vx: dir * (0.09 + rng() * 0.07),
    alive: true,
  };
}

export function createInitialState({ seed = 1 } = {}) {
  const rng = makeRng(seed);
  const groundY = 470;
  return {
    seed,
    mode: 'start',
    elapsedMs: 0,
    score: 0,
    groundY,
    world: { width: WORLD_WIDTH, height: WORLD_HEIGHT },
    player: {
      x: 120,
      y: groundY - 42,
      width: 34,
      height: 42,
      vx: 0,
      vy: 0,
      onGround: true,
      face: 1,
      hp: 3,
      invulnerableMs: 0,
    },
    abilities: [],
    fusedAbility: null,
    abilityStars: [spawnStar(0, rng), spawnStar(1, rng), spawnStar(2, rng)],
    enemies: [spawnEnemy(0, rng, groundY), spawnEnemy(1, rng, groundY), spawnEnemy(2, rng, groundY)],
    controls: {
      left: false,
      right: false,
      jump: false,
    },
    summary: 'Press Enter to start',
  };
}

export function restartState(state) {
  return createInitialState({ seed: state.seed });
}

function fuseAbilities(abilities) {
  if (abilities.length < 2) {
    return null;
  }
  const unique = [...new Set(abilities)];
  if (unique.length < 2) {
    return null;
  }
  return `${unique[0]}-${unique[1]}`;
}

export function applyInput(state, input = {}) {
  const next = cloneState(state);

  if (input.startPressed && next.mode === 'start') {
    next.mode = 'running';
    next.summary = 'Collect stars and avoid enemies';
  }

  if (input.pausePressed) {
    if (next.mode === 'running') {
      next.mode = 'paused';
      next.summary = 'Paused';
    } else if (next.mode === 'paused') {
      next.mode = 'running';
      next.summary = 'Back in action';
    }
  }

  if (input.resetPressed) {
    return restartState(next);
  }

  if (typeof input.left === 'boolean') next.controls.left = input.left;
  if (typeof input.right === 'boolean') next.controls.right = input.right;
  if (typeof input.jump === 'boolean') next.controls.jump = input.jump;

  return next;
}

export function stepGame(state, deltaMs) {
  const next = cloneState(state);

  if (next.mode !== 'running') {
    return next;
  }

  const dt = Math.max(0, deltaMs);
  const p = next.player;
  next.elapsedMs += dt;

  if (next.controls.left) {
    p.vx = -MOVE_SPEED;
    p.face = -1;
  } else if (next.controls.right) {
    p.vx = MOVE_SPEED;
    p.face = 1;
  } else {
    p.vx *= 0.84;
  }

  if (next.controls.jump && p.onGround) {
    p.vy = JUMP_SPEED;
    p.onGround = false;
  }

  p.vy += GRAVITY * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.invulnerableMs = Math.max(0, p.invulnerableMs - dt);

  if (p.x < 0) p.x = 0;
  if (p.x + p.width > next.world.width) p.x = next.world.width - p.width;

  const floorY = next.groundY - p.height;
  if (p.y >= floorY) {
    p.y = floorY;
    p.vy = 0;
    p.onGround = true;
  }

  for (const star of next.abilityStars) {
    if (!star.active) continue;
    if (aabb(p, star)) {
      star.active = false;
      next.abilities.push(star.kind);
      next.score += 10;
      if (!next.fusedAbility) {
        const fused = fuseAbilities(next.abilities);
        if (fused) {
          next.fusedAbility = fused;
          next.score += 20;
        }
      }
    }
  }

  for (const enemy of next.enemies) {
    if (!enemy.alive) continue;
    enemy.x += enemy.vx * dt;
    if (enemy.x <= 40 || enemy.x + enemy.width >= next.world.width - 40) {
      enemy.vx *= -1;
    }

    if (p.invulnerableMs <= 0 && aabb(p, enemy)) {
      next.score = Math.max(0, next.score - 5);
      p.hp -= 1;
      p.invulnerableMs = 1200;
      p.x = 120;
      p.y = floorY;
      p.vx = 0;
      p.vy = 0;
      if (p.hp <= 0) {
        next.mode = 'game_over';
        next.summary = 'Game over - press R to reset';
      }
      break;
    }
  }

  if (next.abilityStars.every((star) => !star.active)) {
    next.mode = 'won';
    next.summary = 'Stage clear! Press R to play again';
    next.score += Math.max(0, 200 - Math.floor(next.elapsedMs / 100));
  }

  return next;
}

export function describeState(state) {
  const payload = {
    mode: state.mode,
    coordinateSystem: 'origin top-left, x right, y down, units in canvas pixels',
    score: state.score,
    hp: state.player.hp,
    elapsedMs: Math.round(state.elapsedMs),
    player: {
      x: Math.round(state.player.x),
      y: Math.round(state.player.y),
      vx: Number(state.player.vx.toFixed(3)),
      vy: Number(state.player.vy.toFixed(3)),
      onGround: state.player.onGround,
      face: state.player.face,
      invulnerableMs: Math.round(state.player.invulnerableMs),
    },
    abilities: [...state.abilities],
    fusedAbility: state.fusedAbility,
    activeStars: state.abilityStars.filter((s) => s.active).map((s) => ({
      x: Math.round(s.x),
      y: Math.round(s.y),
      kind: s.kind,
    })),
    enemies: state.enemies.filter((e) => e.alive).map((e) => ({
      x: Math.round(e.x),
      y: Math.round(e.y),
      vx: Number(e.vx.toFixed(3)),
    })),
    summary: state.summary,
  };
  return JSON.stringify(payload);
}

function drawGame(ctx, state) {
  ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  const sky = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  sky.addColorStop(0, '#8fe7ff');
  sky.addColorStop(1, '#d6f4ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  ctx.fillStyle = '#7cd286';
  ctx.fillRect(0, state.groundY, WORLD_WIDTH, WORLD_HEIGHT - state.groundY);

  const p = state.player;
  ctx.fillStyle = '#ff92c8';
  ctx.beginPath();
  ctx.ellipse(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#102c4d';
  ctx.fillRect(p.x + (p.face > 0 ? p.width - 8 : 2), p.y + 16, 6, 6);

  for (const star of state.abilityStars) {
    if (!star.active) continue;
    ctx.fillStyle = star.kind === 'spark' ? '#ffd84d' : star.kind === 'beam' ? '#84f2ff' : '#ffc084';
    ctx.fillRect(star.x, star.y, star.width, star.height);
  }

  ctx.fillStyle = '#4c2c78';
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  }

  ctx.fillStyle = '#0e2648';
  ctx.font = '22px Trebuchet MS';
  ctx.fillText(`Score ${state.score}`, 20, 34);
  ctx.fillText(`HP ${state.player.hp}`, 20, 62);
  ctx.fillText(`Abilities ${state.abilities.join(', ') || 'none'}`, 20, 90);
  ctx.fillText(`Fuse ${state.fusedAbility || 'none'}`, 20, 118);

  if (state.mode === 'start' || state.mode === 'paused' || state.mode === 'won' || state.mode === 'game_over') {
    ctx.fillStyle = 'rgba(4, 19, 37, 0.62)';
    ctx.fillRect(170, 170, 620, 200);
    ctx.fillStyle = '#ffffff';
    ctx.font = '34px Trebuchet MS';
    const title =
      state.mode === 'start'
        ? 'Kirby Copy Ability Fuse'
        : state.mode === 'paused'
          ? 'Paused'
          : state.mode === 'won'
            ? 'You Win!'
            : 'Game Over';
    ctx.fillText(title, 280, 245);
    ctx.font = '21px Trebuchet MS';
    ctx.fillText('Enter start, Arrow/A-D move, Space jump, P pause, R reset', 200, 292);
    ctx.fillText(state.summary, 240, 330);
  }
}

export function createGame(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D context unavailable');
  }

  let state = createInitialState({ seed: 20260228 });

  function inputForKey(code, value) {
    if (code === 'ArrowLeft' || code === 'KeyA') {
      state = applyInput(state, { left: value });
    }
    if (code === 'ArrowRight' || code === 'KeyD') {
      state = applyInput(state, { right: value });
    }
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
      state = applyInput(state, { jump: value });
    }
    if (value && code === 'Enter') {
      state = applyInput(state, { startPressed: true });
    }
    if (value && code === 'KeyP') {
      state = applyInput(state, { pausePressed: true });
    }
    if (value && code === 'KeyR') {
      state = applyInput(state, { resetPressed: true });
    }
  }

  const down = (event) => inputForKey(event.code, true);
  const up = (event) => inputForKey(event.code, false);
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(32, now - last);
    last = now;
    state = stepGame(state, dt);
    drawGame(ctx, state);
    requestAnimationFrame(tick);
  }

  drawGame(ctx, state);
  requestAnimationFrame(tick);

  window.advanceTime = (ms) => {
    const steps = Math.max(1, Math.ceil(ms / 16.666));
    const stepMs = ms / steps;
    for (let i = 0; i < steps; i += 1) {
      state = stepGame(state, stepMs);
    }
    drawGame(ctx, state);
    return state.mode;
  };

  window.render_game_to_text = () => describeState(state);

  return {
    getState: () => cloneState(state),
    dispose: () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    },
  };
}
