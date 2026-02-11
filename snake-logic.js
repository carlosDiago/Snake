export const GRID_SIZE = 20;
export const TICK_MS = 140;

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function createInitialState(randomFn = Math.random) {
  const snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  return {
    gridSize: GRID_SIZE,
    snake,
    direction: "right",
    pendingDirection: null,
    food: placeFood(snake, GRID_SIZE, randomFn),
    score: 0,
    status: "ready",
  };
}

export function restartGame(randomFn = Math.random) {
  return createInitialState(randomFn);
}

export function queueDirection(state, nextDirection) {
  if (!DIRECTIONS[nextDirection]) {
    return state;
  }

  if (state.status === "gameover") {
    return state;
  }

  if (state.pendingDirection) {
    return state;
  }

  const activeDirection = state.direction;
  if (isOpposite(activeDirection, nextDirection)) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
    status: state.status === "ready" ? "running" : state.status,
  };
}

export function togglePause(state) {
  if (state.status === "running") {
    return { ...state, status: "paused" };
  }
  if (state.status === "paused") {
    return { ...state, status: "running" };
  }
  return state;
}

export function tick(state, randomFn = Math.random) {
  if (state.status !== "running") {
    return state;
  }

  const direction = state.pendingDirection ?? state.direction;
  const step = DIRECTIONS[direction];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + step.x,
    y: head.y + step.y,
  };

  if (!isInsideGrid(nextHead, state.gridSize)) {
    return { ...state, status: "gameover", pendingDirection: null };
  }

  const eatsFood = sameCell(nextHead, state.food);
  const nextSnake = [nextHead, ...state.snake];
  if (!eatsFood) {
    nextSnake.pop();
  }

  if (collidesWithSelf(nextSnake)) {
    return { ...state, status: "gameover", pendingDirection: null };
  }

  let nextFood = state.food;
  let nextStatus = "running";
  const nextScore = state.score + (eatsFood ? 1 : 0);
  if (eatsFood) {
    nextFood = placeFood(nextSnake, state.gridSize, randomFn);
    if (!nextFood) {
      nextStatus = "gameover";
    }
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: null,
    food: nextFood,
    score: nextScore,
    status: nextStatus,
  };
}

export function placeFood(snake, gridSize, randomFn = Math.random) {
  const occupied = new Set(snake.map((part) => `${part.x}:${part.y}`));
  const emptyCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x}:${y}`;
      if (!occupied.has(key)) {
        emptyCells.push({ x, y });
      }
    }
  }

  if (emptyCells.length === 0) {
    return null;
  }

  const idx = Math.floor(randomFn() * emptyCells.length);
  return emptyCells[idx];
}

export function sameCell(a, b) {
  return Boolean(a && b) && a.x === b.x && a.y === b.y;
}

export function isInsideGrid(point, gridSize) {
  return (
    point.x >= 0 && point.x < gridSize && point.y >= 0 && point.y < gridSize
  );
}

export function collidesWithSelf(snake) {
  const [head, ...body] = snake;
  return body.some((part) => sameCell(part, head));
}

export function isOpposite(a, b) {
  return (
    (a === "up" && b === "down") ||
    (a === "down" && b === "up") ||
    (a === "left" && b === "right") ||
    (a === "right" && b === "left")
  );
}
