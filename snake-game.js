import {
  GRID_SIZE,
  TICK_MS,
  createInitialState,
  queueDirection,
  restartGame,
  tick,
  togglePause,
} from "./snake-logic.js";

const boardEl = document.querySelector("#board");
const scoreEl = document.querySelector("#score");
const statusEl = document.querySelector("#status");
const pauseBtn = document.querySelector("#pauseBtn");
const restartBtn = document.querySelector("#restartBtn");

const cells = [];
for (let i = 0; i < GRID_SIZE * GRID_SIZE; i += 1) {
  const cell = document.createElement("div");
  cell.className = "cell";
  boardEl.appendChild(cell);
  cells.push(cell);
}

let state = createInitialState();

function render() {
  for (const cell of cells) {
    cell.classList.remove("snake", "food");
  }

  for (const part of state.snake) {
    const idx = part.y * GRID_SIZE + part.x;
    if (cells[idx]) {
      cells[idx].classList.add("snake");
    }
  }

  if (state.food) {
    const foodIdx = state.food.y * GRID_SIZE + state.food.x;
    if (cells[foodIdx]) {
      cells[foodIdx].classList.add("food");
    }
  }

  scoreEl.textContent = String(state.score);
  statusEl.textContent = getStatusText(state);
  pauseBtn.textContent = state.status === "paused" ? "Resume" : "Pause";
}

function getStatusText(currentState) {
  if (currentState.status === "ready") {
    return "Press any arrow key or WASD to start";
  }
  if (currentState.status === "paused") {
    return "Paused";
  }
  if (currentState.status === "gameover") {
    if (!currentState.food) {
      return "You win. Press Restart to play again";
    }
    return "Game over. Press Restart to play again";
  }
  return "Running";
}

function setDirection(dir) {
  state = queueDirection(state, dir);
  render();
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  const keyMap = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right",
  };

  if (keyMap[key]) {
    event.preventDefault();
    setDirection(keyMap[key]);
    return;
  }

  if (key === " " || key === "p") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  if (key === "r") {
    event.preventDefault();
    state = restartGame();
    render();
  }
}

document.addEventListener("keydown", onKeyDown);

document.querySelectorAll("[data-dir]").forEach((button) => {
  button.addEventListener("click", () => {
    const dir = button.getAttribute("data-dir");
    setDirection(dir);
  });
});

pauseBtn.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

restartBtn.addEventListener("click", () => {
  state = restartGame();
  render();
});

setInterval(() => {
  state = tick(state);
  render();
}, TICK_MS);

render();
