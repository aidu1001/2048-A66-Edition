let grid = Array(4).fill().map(() => Array(4).fill(0));
let score = 0;
let best = localStorage.getItem('2048best') || 0;

const gridElement = document.getElementById('grid');
const scoreElement = document.getElementById('score');
const bestElement = document.getElementById('best');
const messageElement = document.getElementById('message');

bestElement.textContent = best;

function init() {
  grid = Array(4).fill().map(() => Array(4).fill(0));
  score = 0;
  updateScore();
  gridElement.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    gridElement.appendChild(tile);
  }
  addRandomTile();
  addRandomTile();
  updateBoard();
  messageElement.textContent = '';
}

function updateBoard() {
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach((tile, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const value = grid[row][col];
    tile.textContent = value || '';
    tile.style.background = getColor(value);
    tile.style.color = value >= 8 ? '#f9f6f2' : '#776e65';
  });
}

function getColor(value) {
  const colors = {
    0: '#333', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179',
    16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72',
    256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e',
  };
  return colors[value] || '#ff3b00';
}

function addRandomTile() {
  const empty = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (grid[r][c] === 0) empty.push({r, c});
  if (empty.length > 0) {
    const pos = empty[Math.floor(Math.random() * empty.length)];
    grid[pos.r][pos.c] = Math.random() < 0.9 ? 2 : 4;
  }
}

// Simple but complete move logic
function slide(row) {
  let arr = row.filter(val => val);
  let missing = 4 - arr.length;
  let zeros = Array(missing).fill(0);
  return arr.concat(zeros);
}

function combine(row) {
  for (let i = 2; i >= 0; i--) {
    if (row[i] === row[i+1] && row[i] !== 0) {
      row[i] *= 2;
      score += row[i];
      row[i+1] = 0;
    }
  }
  return row;
}

function move(direction) {
  let moved = false;
  let tempGrid = grid.map(row => row => [...row]);

  if (direction === 'left') {
    for (let r = 0; r < 4; r++) {
      grid[r] = slide(combine(slide(grid[r])));
    }
  } else if (direction === 'right') {
    for (let r = 0; r < 4; r++) {
      grid[r].reverse();
      grid[r] = slide(combine(slide(grid[r]))).reverse();
    }
  } else if (direction === 'up') {
    for (let c = 0; c < 4; c++) {
      let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
      col = slide(combine(slide(col)));
      for (let r = 0; r < 4; r++) grid[r][c] = col[r];
    }
  } else if (direction === 'down') {
    for (let c = 0; c < 4; c++) {
      let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
      col.reverse();
      col = slide(combine(slide(col))).reverse();
      for (let r = 0; r < 4; r++) grid[r][c] = col[r];
    }
  }

  // Check if board changed
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (grid[r][c] !== tempGrid[r][c]) moved = true;

  if (moved) {
    addRandomTile();
    updateBoard();
    updateScore();
    if (score > best) {
      best = score;
      localStorage.setItem('2048best', best);
      bestElement.textContent = best;
    }
    if (!canMove()) {
      messageElement.textContent = "Game Over! Score: " + score;
    }
  }
}

function canMove() {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return true;
      if (c < 3 && grid[r][c] === grid[r][c+1]) return true;
      if (r < 3 && grid[r][c] === grid[r+1][c]) return true;
    }
  return false;
}

function updateScore() {
  scoreElement.textContent = score;
}

// Controls
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp')    { e.preventDefault(); move('up'); }
  if (e.key === 'ArrowDown')  { e.preventDefault(); move('down'); }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); move('left'); }
  if (e.key === 'ArrowRight') { e.preventDefault(); move('right'); }
});

// Touch support
let startX, startY;
gridElement.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, {passive: true});

gridElement.addEventListener('touchend', e => {
  if (!startX || !startY) return;
  let endX = e.changedTouches[0].clientX;
  let endY = e.changedTouches[0].clientY;
  let dx = endX - startX;
  let dy = endY - startY;

  if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
    if (Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? 'right' : 'left');
    } else {
      move(dy > 0 ? 'down' : 'up');
    }
  }
  startX = null; startY = null;
});

function newGame() { init(); }

// Start
init();