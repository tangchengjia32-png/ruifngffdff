const GRID_SIZE = 20;
const BOARD_SIZE = 400;
const CELL_SIZE = BOARD_SIZE / GRID_SIZE;
const BASE_SPEED = 130;
const SPEED_STEP = 3;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');

let snake;
let direction;
let nextDirection;
let food;
let score;
let bestScore = Number(localStorage.getItem('snake-best') || 0);
let paused;
let over;
let loopId;

bestEl.textContent = bestScore;

function resetGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { ...direction };
  food = spawnFood();
  score = 0;
  paused = false;
  over = false;
  scoreEl.textContent = score;
  setStatus('游戏中');

  if (loopId) {
    clearInterval(loopId);
  }
  loopId = setInterval(tick, BASE_SPEED);
  draw();
}

function setStatus(text) {
  statusEl.textContent = text;
}

function spawnFood() {
  let candidate;
  do {
    candidate = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake?.some((part) => part.x === candidate.x && part.y === candidate.y));

  return candidate;
}

function tick() {
  if (paused || over) return;

  direction = nextDirection;
  const head = snake[0];
  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  const hitWall =
    newHead.x < 0 ||
    newHead.y < 0 ||
    newHead.x >= GRID_SIZE ||
    newHead.y >= GRID_SIZE;

  const hitSelf = snake.some((part) => part.x === newHead.x && part.y === newHead.y);

  if (hitWall || hitSelf) {
    gameOver();
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score > bestScore) {
      bestScore = score;
      bestEl.textContent = bestScore;
      localStorage.setItem('snake-best', String(bestScore));
    }
    food = spawnFood();
    increaseSpeed();
  } else {
    snake.pop();
  }

  draw();
}

function increaseSpeed() {
  const nextSpeed = Math.max(60, BASE_SPEED - Math.floor(score / 10) * SPEED_STEP);
  clearInterval(loopId);
  loopId = setInterval(tick, nextSpeed);
}

function gameOver() {
  over = true;
  setStatus('游戏结束，按 Enter 或点击按钮重开');
  draw();
}

function drawCell(x, y, color, radius = 0) {
  const px = x * CELL_SIZE;
  const py = y * CELL_SIZE;
  ctx.fillStyle = color;
  if (!radius) {
    ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    return;
  }

  ctx.beginPath();
  ctx.roundRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2, radius);
  ctx.fill();
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(148,163,184,0.15)';
  ctx.lineWidth = 1;

  for (let i = 1; i < GRID_SIZE; i += 1) {
    const p = i * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, BOARD_SIZE);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(BOARD_SIZE, p);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
  drawGrid();

  snake.forEach((part, index) => {
    drawCell(part.x, part.y, index === 0 ? '#22d3ee' : '#10b981', 5);
  });
  drawCell(food.x, food.y, '#f97316', 6);

  if (paused) {
    ctx.fillStyle = 'rgba(2,6,23,0.55)';
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('已暂停', BOARD_SIZE / 2, BOARD_SIZE / 2);
  }
}

function queueDirection(x, y) {
  if (over) return;
  if (direction.x === -x && direction.y === -y) return;
  nextDirection = { x, y };
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (key === 'arrowup' || key === 'w') queueDirection(0, -1);
  if (key === 'arrowdown' || key === 's') queueDirection(0, 1);
  if (key === 'arrowleft' || key === 'a') queueDirection(-1, 0);
  if (key === 'arrowright' || key === 'd') queueDirection(1, 0);

  if (key === ' ') {
    event.preventDefault();
    if (over) return;
    paused = !paused;
    setStatus(paused ? '已暂停' : '游戏中');
    draw();
  }

  if (key === 'enter') {
    resetGame();
  }
});

restartBtn.addEventListener('click', resetGame);

resetGame();
